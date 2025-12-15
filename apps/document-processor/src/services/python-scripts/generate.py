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
from pptx.util import Pt, Length
from pptx.enum.text import MSO_AUTO_SIZE

PLACEHOLDER_PATTERN = re.compile(r'\{\{\s*(.*?)\s*\:\s*(.*?)\s*\}\}')
EMU_PER_INCH = 914400
POINTS_PER_INCH = 72
MIN_FONT_SIZE = 6.0
FONT_SIZE_STEP = 0.1
DEFAULT_FONT_SIZE = 12
CHAR_WIDTH_FACTOR = 0.6
LINE_HEIGHT_FACTOR = 1.2


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


def get_text_frame_font_size(text_frame: TextFrame) -> Optional[float]:
    for paragraph in text_frame.paragraphs:
        for run in paragraph.runs:
            if run.font and run.font.size:
                return run.font.size.pt
    return None


def set_text_frame_font_size(text_frame: TextFrame, font_size_pt: float) -> None:
    for paragraph in text_frame.paragraphs:
        for run in paragraph.runs:
            if run.font:
                run.font.size = Pt(font_size_pt)


def emu_to_points(emu_value: Optional[Length | int]) -> float:
    if not emu_value:
        return 0.0
    return (float(emu_value) / EMU_PER_INCH) * POINTS_PER_INCH


def get_text_frame_margins_pt(text_frame: TextFrame) -> Dict[str, float]:
    margin_attrs: List[str] = ['margin_top', 'margin_bottom', 'margin_left', 'margin_right']
    margins: Dict[str, float] = {}
    
    for attr in margin_attrs:
        margin_emu = getattr(text_frame, attr, None) if hasattr(text_frame, attr) else None
        margins[attr] = emu_to_points(margin_emu) if margin_emu else 0.0
    
    return margins


def estimate_text_fits(
    text_frame: TextFrame,
    text_content: str,
    frame_height_emu: Length | int,
    frame_width_emu: Length | int
) -> bool:
    if not text_frame or not text_content or not frame_height_emu or not frame_width_emu:
        return True
    
    frame_height_pt: float = emu_to_points(frame_height_emu)
    frame_width_pt: float = emu_to_points(frame_width_emu)
    
    margins: Dict[str, float] = get_text_frame_margins_pt(text_frame)
    available_height_pt: float = frame_height_pt - margins['margin_top'] - margins['margin_bottom']
    available_width_pt: float = frame_width_pt - margins['margin_left'] - margins['margin_right']
    
    if available_height_pt <= 0 or available_width_pt <= 0:
        return True
    
    font_size: float = get_text_frame_font_size(text_frame) or DEFAULT_FONT_SIZE
    avg_char_width_pt: float = font_size * CHAR_WIDTH_FACTOR
    
    words = text_content.split()
    if not words:
        return True
    
    lines: List[str] = []
    current_line = ""
    
    for word in words:
        test_line = current_line + (" " if current_line else "") + word
        test_width = len(test_line) * avg_char_width_pt
        
        if test_width <= available_width_pt:
            current_line = test_line
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    
    if current_line:
        lines.append(current_line)
    
    line_height_pt: float = font_size * LINE_HEIGHT_FACTOR
    total_height_pt: float = len(lines) * line_height_pt
    
    safety_margin_pt = 2.0
    return total_height_pt <= (available_height_pt - safety_margin_pt)


def adjust_text_frame_font_size(
    text_frame: TextFrame,
    shape_height_emu: Length | int,
    shape_width_emu: Length | int
) -> None:
    if not text_frame:
        return
    
    text_frame.word_wrap = True
    text_frame.auto_size = None
    
    full_text = text_frame.text
    if not full_text:
        return
    
    if not shape_height_emu or not shape_width_emu:
        return
    
    original_font_size = get_text_frame_font_size(text_frame)
    if not original_font_size:
        original_font_size = DEFAULT_FONT_SIZE
        set_text_frame_font_size(text_frame, original_font_size)
    
    if estimate_text_fits(text_frame, full_text, shape_height_emu, shape_width_emu):
        return
    
    original_size = float(original_font_size)
    
    low = MIN_FONT_SIZE
    high = original_size
    best_fit = MIN_FONT_SIZE
    
    while high - low >= FONT_SIZE_STEP:
        mid = round((low + high) / 2.0, 1)
        set_text_frame_font_size(text_frame, mid)
        
        if estimate_text_fits(text_frame, full_text, shape_height_emu, shape_width_emu):
            best_fit = mid
            low = mid + FONT_SIZE_STEP
        else:
            high = mid - FONT_SIZE_STEP
    
    set_text_frame_font_size(text_frame, best_fit)
    
    if not estimate_text_fits(text_frame, full_text, shape_height_emu, shape_width_emu):
        set_text_frame_font_size(text_frame, MIN_FONT_SIZE)
        return
    
    max_increase_steps = 3
    current_fit = best_fit
    
    for i in range(1, max_increase_steps + 1):
        test_size = best_fit + (FONT_SIZE_STEP * i)
        if test_size > original_size:
            break
        
        set_text_frame_font_size(text_frame, test_size)
        if estimate_text_fits(text_frame, full_text, shape_height_emu, shape_width_emu):
            current_fit = test_size
        else:
            break
    
    set_text_frame_font_size(text_frame, current_fit)


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
    
    def replace_placeholder(match: re.Match[str]) -> str:
        key = match.group(1).strip()
        return placeholders.get(key, match.group(0))
    
    new_text = pattern.sub(replace_placeholder, original_text)
    
    if new_text != original_text:
        text_frame.text = new_text


def find_placeholders_in_text_frame(text_frame: TextFrame) -> List[tuple[str, str]]:
    found_placeholders_set: set[tuple[str, str]] = set()
    
    full_text = text_frame.text if hasattr(text_frame, 'text') else ""
    if full_text:
        matches = PLACEHOLDER_PATTERN.findall(full_text)
        for key, type in matches:
            found_placeholders_set.add((key.strip(), (type or '').strip()))

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
