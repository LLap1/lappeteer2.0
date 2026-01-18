import sys
import json
import base64
import tempfile
import os
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Pt
from pptx.enum.text import MSO_AUTO_SIZE

def save_data_url_to_temp(data_url: str, temp_files: list[str]) -> str:
    base64_data = data_url.split(',', 1)[1]
    image_data = base64.b64decode(base64_data)
    temp_path = tempfile.mktemp(suffix='.png')
    with open(temp_path, 'wb') as f:
        f.write(image_data)
    temp_files.append(temp_path)
    return temp_path

def get_image_path(source: str, temp_files: list[str]) -> str:
    if source.startswith('data:'):
        return save_data_url_to_temp(source, temp_files)
    if not os.path.exists(source):
        raise FileNotFoundError(f"Image file not found: {source}")
    temp_files.append(source)
    return source

def prepare_data(placeholder_data: list[dict]) -> tuple[dict[str, str], dict[str, list[str]], list[str]]:
    text_values: dict[str, str] = {}
    image_values: dict[str, list[str]] = {}
    temp_files: list[str] = []

    for item in placeholder_data:
        key = item['key'].strip()
        placeholder_type = item['type']
        value = item['value']

        if placeholder_type == 'text':
            text_values[key] = value
        elif placeholder_type in ('image', 'map'):
            sources = json.loads(value)
            image_values[key] = [get_image_path(source, temp_files) for source in sources]

    return text_values, image_values, temp_files

def get_run_color(run) -> RGBColor | None:
    try:
        if run.font.color.rgb:
            return run.font.color.rgb
    except:
        pass
    return None

def get_type_from_color(color: RGBColor | None) -> str | None:
    if color is None:
        return None
    
    r, g, b = color[0], color[1], color[2]
    
    if r > 150 and g < 100 and b < 100:
        return 'text'
    if r < 100 and g < 100 and b > 150:
        return 'image'
    if r < 100 and g > 150 and b < 100:
        return 'map'
    
    return None

def is_placeholder_run(run) -> bool:
    font = run.font
    return font.bold and font.italic and font.underline

def get_font_name(run, paragraph) -> str:
    if run.font.name:
        return run.font.name
    if paragraph.font.name:
        return paragraph.font.name
    return 'Arial'

def get_original_font_size(run) -> int:
    if run.font.size:
        return int(run.font.size.pt)
    return 18

def estimate_text_needs_wrap(text: str, font_size_pt: float, width_pt: float) -> int:
    avg_char_width = font_size_pt * 0.5
    chars_per_line = max(1, int(width_pt / avg_char_width))
    num_lines = max(1, (len(text) + chars_per_line - 1) // chars_per_line)
    return num_lines

def estimate_text_height(num_lines: int, font_size_pt: float) -> float:
    line_height = font_size_pt * 1.1
    return num_lines * line_height

def calculate_best_font_size(text: str, original_size: int, width_pt: float, height_pt: float, min_size: int = 6) -> int:
    if width_pt <= 0 or height_pt <= 0:
        return original_size
    
    for size in range(original_size, min_size - 1, -1):
        num_lines = estimate_text_needs_wrap(text, size, width_pt)
        text_height = estimate_text_height(num_lines, size)
        
        if text_height <= height_pt:
            return size
    
    return min_size

def process_text_frame(text_frame, text_values: dict[str, str], is_cell: bool = False, cell_width: float = 0, cell_height: float = 0) -> None:
    font_name = 'Arial'
    original_size = 18
    modified = False
    new_text = ""

    for paragraph in text_frame.paragraphs:
        for run in paragraph.runs:
            if not is_placeholder_run(run):
                continue
            
            key = run.text.strip()
            if key not in text_values:
                continue
            
            color = get_run_color(run)
            placeholder_type = get_type_from_color(color)
            
            if placeholder_type != 'text':
                continue
            
            font_name = get_font_name(run, paragraph)
            original_size = get_original_font_size(run)
            new_text = text_values[key]
            run.text = new_text
            run.font.bold = False
            run.font.italic = False
            run.font.underline = False
            run.font.color.rgb = RGBColor(0, 0, 0)
            modified = True
    
    if not modified:
        return
    try: 
        for size in range(original_size, 1, -1):
            try:
                text_frame.fit_text(font_family=font_name, max_size=size, bold=False, italic=False)
                break
            except TypeError:
                pass

    except:
        pass


  


def find_image_placeholder_in_shape(shape, image_values: dict[str, list[str]]) -> tuple[str, str] | None:
    if not hasattr(shape, 'text_frame'):
        return None
    
    for paragraph in shape.text_frame.paragraphs:
        for run in paragraph.runs:
            if not is_placeholder_run(run):
                continue
            
            key = run.text.strip()
            if key not in image_values:
                continue
            
            color = get_run_color(run)
            placeholder_type = get_type_from_color(color)
            
            if placeholder_type in ('image', 'map'):
                return key, placeholder_type
    
    return None

def process_shape(shape, slide, text_values: dict[str, str], image_values: dict[str, list[str]]) -> bool:
    placeholder_info = find_image_placeholder_in_shape(shape, image_values)
    
    if placeholder_info:
        key, _ = placeholder_info
        image_paths = image_values[key]
        left, top, width, height = shape.left, shape.top, shape.width, shape.height

        shape.element.getparent().remove(shape.element)

        for image_path in image_paths:
            slide.shapes.add_picture(image_path, left, top, width, height)

        return True

    if hasattr(shape, 'text_frame'):
        process_text_frame(shape.text_frame, text_values)
    
    return False


def process_table(table, text_values: dict[str, str], image_values: dict[str, list[str]], slide) -> None:
    for row_idx, row in enumerate(table.rows):
        for col_idx, cell in enumerate(row.cells):
            if hasattr(cell, 'text_frame'):
                cell_width = 0
                cell_height = 0
                
                try:
                    if table.columns[col_idx].width:
                        cell_width = table.columns[col_idx].width.pt - 12
                    if row.height:
                        cell_height = row.height.pt - 12
                except Exception:
                    pass
                
                process_text_frame(cell.text_frame, text_values, is_cell=True, cell_width=cell_width, cell_height=cell_height)

def process_all_shapes(shapes, slide, text_values: dict[str, str], image_values: dict[str, list[str]]) -> None:
    shapes_list = list(shapes)
    
    for shape in shapes_list:
        if shape.shape_type == 6:  # MSO_SHAPE_TYPE.GROUP
            if hasattr(shape, 'shapes'):
                process_all_shapes(shape.shapes, slide, text_values, image_values)
        elif hasattr(shape, 'has_table') and shape.has_table:
            process_table(shape.table, text_values, image_values, slide)
        else:
            process_shape(shape, slide, text_values, image_values)

def cleanup_temp_files(temp_files: list[str]) -> None:
    for file_path in temp_files:
        try:
            os.unlink(file_path)
        except:
            pass

def generate(file_path: str, placeholder_data: list[dict], output_path: str, slides_to_remove: list[int] = None) -> str:
    prs = Presentation(file_path)
    text_values, image_values, temp_files = prepare_data(placeholder_data)

    for slide in prs.slides:
        process_all_shapes(slide.shapes, slide, text_values, image_values)

    if slides_to_remove:
        slides_to_remove_sorted = sorted(set(slides_to_remove), reverse=True)
        for slide_index in slides_to_remove_sorted:
            if 0 <= slide_index < len(prs.slides):
                slide_id = prs.slides._sldIdLst[slide_index]
                prs.part.drop_rel(slide_id.rId)
                prs.slides._sldIdLst.remove(slide_id)

    prs.save(output_path)
    cleanup_temp_files(temp_files)

def main():
    if len(sys.argv) < 3:
        sys.stderr.write("Usage: python generate.py <file_path> <json_data> [slides_to_remove_json]\n")
        sys.exit(1)
    
    file_path = sys.argv[1]
    json_data = sys.argv[2]
    output_path = sys.argv[3]
    slides_to_remove_json = sys.argv[4] if len(sys.argv) > 3 else '[]'

    try:
        placeholder_data = json.loads(json_data)
        slides_to_remove = json.loads(slides_to_remove_json) if slides_to_remove_json else []
        generate(file_path, placeholder_data, output_path, slides_to_remove)
    except Exception as e:
        sys.stderr.write(f"Error: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
