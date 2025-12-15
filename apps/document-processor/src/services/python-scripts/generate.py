"""
Script to replace placeholders in PowerPoint presentations with images and text
"""
import base64
import json
import re
import sys
import tempfile
import traceback
from io import BytesIO
from typing import Dict, List, Optional, Tuple, Any

from pptx import Presentation
from pptx.shapes.base import BaseShape
from pptx.text.text import TextFrame
from pptx.enum.text import MSO_AUTO_SIZE

PLACEHOLDER_PATTERN = re.compile(r'\{\{\s*([^:}]+?)\s*\:\s*([^}]*?)\s*\}\}')


def load_presentation(pptx_data: BytesIO | str) -> Presentation:
    if isinstance(pptx_data, str):
        return Presentation(pptx_data)
    pptx_data.seek(0)
    return Presentation(pptx_data)


def prepare_placeholders(parse_data: List[Dict[str, Any]]) -> Tuple[Dict[str, str], Dict[str, List[BytesIO]]]:
    string_placeholders: Dict[str, str] = {}
    map_placeholders: Dict[str, List[BytesIO]] = {}
    
    for item in parse_data:
        if item.get('type') == 'text':
            key: str = item['key']
            value: str = item['value']
            string_placeholders[key] = value
        elif item.get('type') == 'map':
            key = item['key']
            data_urls: List[str] = item['value']
            map_placeholders[key] = []
            for data_url in data_urls:
                base64_value = data_url.split(',', 1)[1]
                map_placeholders[key].append(BytesIO(base64.b64decode(base64_value)))
    
    return string_placeholders, map_placeholders


def clean_bidi_text(text: str) -> str:
    return ''.join(
        char for char in text 
        if not (0x200B <= ord(char) <= 0x200F or 0x202A <= ord(char) <= 0x202E or 0x2066 <= ord(char) <= 0x2069)
    )


def replace_text_in_text_frame(
    text_frame: TextFrame,
    placeholders: Dict[str, str],
    pattern: re.Pattern[str]
) -> None:
    text_frame.word_wrap = True
    text_frame.auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE
    
    original_text = text_frame.text
    
    if not original_text:
        return
    
    clean_text = clean_bidi_text(original_text)
    
    def replace_placeholder(match: re.Match[str]) -> str:
        key = match.group(1).strip()
        type_val = match.group(2).strip()
        
        if not type_val and ':' in key:
            parts = key.split(':', 1)
            if len(parts) == 2:
                key = parts[0].strip()
        
        return placeholders.get(key, match.group(0))
    
    new_text = pattern.sub(replace_placeholder, clean_text)
    
    if new_text != clean_text:
        text_frame.text = new_text


def find_placeholders_in_text_frame(text_frame: TextFrame) -> List[tuple[str, str]]:
    found_placeholders_set: set[tuple[str, str]] = set()
    
    full_text = text_frame.text if hasattr(text_frame, 'text') else ""
    if full_text:
        clean_text = clean_bidi_text(full_text)
        matches = PLACEHOLDER_PATTERN.findall(clean_text)
        for key, type in matches:
            key = key.strip()
            type = type.strip()
            
            if not type and ':' in key:
                parts = key.split(':', 1)
                if len(parts) == 2:
                    key = parts[0].strip()
                    type = parts[1].strip()
            
            found_placeholders_set.add((key, type))

    return list(found_placeholders_set)


def process_table_cell_for_placeholders(
    cell: BaseShape,
    string_placeholders: Dict[str, str],
    map_placeholders: Dict[str, List[BytesIO]]
) -> None:
    if not hasattr(cell, 'text_frame') or not cell.text_frame:
        return
    
    text_frame = cell.text_frame
    found_placeholders = find_placeholders_in_text_frame(text_frame)
    
    if not found_placeholders:
        return
    
    if any(key.strip() in map_placeholders for key, _ in found_placeholders):
        return
    
    replace_text_in_text_frame(
        text_frame,
        string_placeholders,
        PLACEHOLDER_PATTERN
    )


def process_table_for_placeholders(
    shape: BaseShape,
    string_placeholders: Dict[str, str],
    map_placeholders: Dict[str, List[BytesIO]]
) -> None:
    if not hasattr(shape, 'table') or not shape.table:
        return
    
    for row in shape.table.rows:
        for cell in row.cells:
            process_table_cell_for_placeholders(cell, string_placeholders, map_placeholders)


def process_shape_for_placeholders(
    shape: BaseShape,
    string_placeholders: Dict[str, str],
    map_placeholders: Dict[str, List[BytesIO]]
) -> Tuple[Optional[List[Dict[str, Any]]], Optional[BaseShape]]:
    has_text = hasattr(shape, 'text') and bool(shape.text)
    has_text_frame = hasattr(shape, 'text_frame') and bool(shape.text_frame)
    
    found_placeholders: List[tuple[str, str]] = []
    
    if has_text_frame:
        found_placeholders = find_placeholders_in_text_frame(shape.text_frame)
    elif has_text:
        matches = PLACEHOLDER_PATTERN.findall(shape.text)
        found_placeholders = [(key.strip(), (type or '').strip()) for key, type in matches]
    
    if not found_placeholders:
        return None, None
    
    map_placeholder_found = next(
        ((key.strip(), type) for key, type in found_placeholders if key.strip() in map_placeholders),
        None
    )
    
    if map_placeholder_found:
        clean_key, _ = map_placeholder_found
        image_list = map_placeholders[clean_key]
        image_infos = [
            {
                'left': shape.left,
                'top': shape.top,
                'width': shape.width,
                'height': shape.height,
                'image': image,
                'key': clean_key,
            }
            for image in image_list
        ]
        return image_infos, shape
    
    if has_text_frame:
        replace_text_in_text_frame(
            shape.text_frame,
            string_placeholders,
            PLACEHOLDER_PATTERN
        )
    
    if has_text:
        def replace_placeholder_in_text(match: re.Match[str]) -> str:
            key = match.group(1).strip()
            return string_placeholders.get(key, match.group(0))
        
        new_text = PLACEHOLDER_PATTERN.sub(replace_placeholder_in_text, shape.text)
        if new_text != shape.text:
            shape.text = new_text
            if has_text_frame:
                shape.text_frame.word_wrap = True
                shape.text_frame.auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE
                shape.text_frame.fit_text()
    
    return None, None


def remove_shape_from_slide(shape: BaseShape) -> None:
    sp = shape.element
    sp.getparent().remove(sp)


def add_image_to_slide(slide: Any, image_info: Dict[str, Any]) -> None:
    image_info['image'].seek(0)
    slide.shapes.add_picture(
        image_info['image'],
        image_info['left'],
        image_info['top'],
        width=image_info['width'],
        height=image_info['height'],
    )
    


def process_slide(
    slide: Any,
    slide_idx: int,
    string_placeholders: Dict[str, str],
    map_placeholders: Dict[str, List[BytesIO]]
) -> None:
    shapes_to_remove: List[BaseShape] = []
    images_to_add: List[Dict[str, Any]] = []
    
    for shape in slide.shapes:
        if hasattr(shape, 'table') and shape.table:
            process_table_for_placeholders(shape, string_placeholders, map_placeholders)
        else:
            image_infos, shape_to_remove = process_shape_for_placeholders(
                shape, string_placeholders, map_placeholders
            )
            
            if image_infos:
                images_to_add.extend(image_infos)
            if shape_to_remove:
                shapes_to_remove.append(shape_to_remove)
    
    for shape in shapes_to_remove:
        remove_shape_from_slide(shape)
    
    for image_info in images_to_add:
        add_image_to_slide(slide, image_info)


def replace_placeholders(
    pptx_data: BytesIO | str,
    parse_data: List[Dict[str, Any]]
) -> BytesIO:
    prs: Presentation = load_presentation(pptx_data)
    
    string_placeholders, map_placeholders = prepare_placeholders(parse_data)
    
    for slide_idx, slide in enumerate(prs.slides):
        process_slide(slide, slide_idx, string_placeholders, map_placeholders)
    
    output_buffer: BytesIO = BytesIO()
    prs.save(output_buffer)
    output_buffer.seek(0)
    
    return output_buffer


def main() -> None:
    if len(sys.argv) < 3:
        sys.stderr.write("Usage: python3 generate.py <filepath> <data_json_string>\n")
        sys.exit(1)
    
    filepath: str = sys.argv[1]
    data_json_string: str = sys.argv[2]
    
    try:
        with open(filepath, 'rb') as f:
            template_data: BytesIO = BytesIO(f.read())
    except Exception:
        trace = traceback.format_exc()
        sys.stderr.write(f"Error reading file {filepath}: {trace}\n")
        sys.exit(1)
    
    try:
        parse_data = json.loads(data_json_string)
    except json.JSONDecodeError:
        trace = traceback.format_exc()
        sys.stderr.write(f"Error parsing JSON data: {trace}\n")
        sys.exit(1)
    
    try:
        buffer = replace_placeholders(template_data, parse_data)
        
        with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.pptx') as tmp_file:
            output_filepath = tmp_file.name
            tmp_file.write(buffer.read())
        
        print(output_filepath, file=sys.stdout)
        sys.exit(0)
    except Exception:
        trace = traceback.format_exc()
        sys.stderr.write(trace)
        sys.exit(1)


if __name__ == "__main__":
    main()
