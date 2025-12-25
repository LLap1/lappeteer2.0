import sys
import json
import base64
import tempfile
from io import BytesIO
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.util import Pt
from pptx.enum.text import MSO_AUTO_SIZE

def decode_data_url(data_url: str) -> BytesIO:
    base64_data = data_url.split(',', 1)[1]
    return BytesIO(base64.b64decode(base64_data))

def prepare_data(placeholder_data: list[dict]) -> tuple[dict[str, str], dict[str, list[bytes]]]:
    text_values: dict[str, str] = {}
    image_values: dict[str, list[bytes]] = {}

    for item in placeholder_data:
        key = item['key'].strip()
        placeholder_type = item['type']
        value = item['value']

        if placeholder_type == 'text':
            text_values[key] = value
        elif placeholder_type in ('image', 'map'):
            image_values[key] = [decode_data_url(url).getvalue() for url in json.loads(value)]

    return text_values, image_values

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
    
    if is_cell and cell_width > 0 and cell_height > 0:
        best_size = calculate_best_font_size(new_text, original_size, cell_width, cell_height)
        for paragraph in text_frame.paragraphs:
            for run in paragraph.runs:
                run.font.size = Pt(best_size)
    elif not is_cell:
        for size in range(original_size, 1, -1):
            try:
                text_frame.fit_text(font_family=font_name, max_size=size, bold=False, italic=False)
                break
            except TypeError:
                pass
  


def find_image_placeholder_in_shape(shape, image_values: dict[str, list[bytes]]) -> tuple[str, str] | None:
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

def process_shape(shape, slide, text_values: dict[str, str], image_values: dict[str, list[bytes]]) -> bool:
    placeholder_info = find_image_placeholder_in_shape(shape, image_values)
    
    if placeholder_info:
        key, _ = placeholder_info
        images = image_values[key]
        left, top, width, height = shape.left, shape.top, shape.width, shape.height

        shape.element.getparent().remove(shape.element)

        for image_bytes in images:
            slide.shapes.add_picture(BytesIO(image_bytes), left, top, width, height)

        return True

    if hasattr(shape, 'text_frame'):
        process_text_frame(shape.text_frame, text_values)
    
    return False


def process_table(table, text_values: dict[str, str], image_values: dict[str, list[bytes]], slide) -> None:
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

def process_all_shapes(shapes, slide, text_values: dict[str, str], image_values: dict[str, list[bytes]]) -> None:
    shapes_list = list(shapes)
    
    for shape in shapes_list:
        if shape.shape_type == 6:  # MSO_SHAPE_TYPE.GROUP
            if hasattr(shape, 'shapes'):
                process_all_shapes(shape.shapes, slide, text_values, image_values)
        elif hasattr(shape, 'has_table') and shape.has_table:
            process_table(shape.table, text_values, image_values, slide)
        else:
            process_shape(shape, slide, text_values, image_values)

def generate(file_path: str, placeholder_data: list[dict], slides_to_remove: list[int] = None) -> str:
    prs = Presentation(file_path)
    text_values, image_values = prepare_data(placeholder_data)

    for slide in prs.slides:
        process_all_shapes(slide.shapes, slide, text_values, image_values)

    if slides_to_remove:
        slides_to_remove_sorted = sorted(set(slides_to_remove), reverse=True)
        for slide_index in slides_to_remove_sorted:
            if 0 <= slide_index < len(prs.slides):
                slide_id = prs.slides._sldIdLst[slide_index]
                prs.part.drop_rel(slide_id.rId)
                prs.slides._sldIdLst.remove(slide_id)

    with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.pptx') as tmp:
        prs.save(tmp)
        return tmp.name

def main():
    if len(sys.argv) < 3:
        sys.stderr.write("Usage: python generate.py <file_path> <json_data> [slides_to_remove_json]\n")
        sys.exit(1)
    
    file_path = sys.argv[1]
    json_data = sys.argv[2]
    slides_to_remove_json = sys.argv[3] if len(sys.argv) > 3 else '[]'

    try:
        placeholder_data = json.loads(json_data)
        slides_to_remove = json.loads(slides_to_remove_json) if slides_to_remove_json else []
        output_path = generate(file_path, placeholder_data, slides_to_remove)
        print(output_path)
    except Exception as e:
        sys.stderr.write(f"Error: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
