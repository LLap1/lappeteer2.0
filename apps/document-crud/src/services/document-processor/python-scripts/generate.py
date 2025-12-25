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

def get_font_size_pt(run) -> float:
    if run.font.size:
        return run.font.size.pt
    return 18.0

def estimate_text_width(text: str, font_size_pt: float) -> float:
    avg_char_width_ratio = 0.6
    return len(text) * font_size_pt * avg_char_width_ratio

def estimate_text_height(text: str, font_size_pt: float, frame_width: float) -> float:
    if frame_width <= 0:
        return font_size_pt
    
    chars_per_line = frame_width / (font_size_pt * 0.6)
    if chars_per_line <= 0:
        chars_per_line = 1
    
    num_lines = max(1, len(text) / chars_per_line)
    line_height = font_size_pt * 1.2
    return num_lines * line_height

def calculate_optimal_font_size(text: str, original_size_pt: float, frame_width: float, frame_height: float, min_size_pt: float = 6.0) -> float:
    if frame_width <= 0 or frame_height <= 0:
        return original_size_pt
    
    current_size = original_size_pt
    
    while current_size > min_size_pt:
        estimated_height = estimate_text_height(text, current_size, frame_width)
        
        if estimated_height <= frame_height:
            return current_size
        
        current_size -= 0.5
    
    return min_size_pt

def process_text_frame(text_frame, text_values: dict[str, str], shape=None, cell_dimensions: tuple[float, float] | None = None) -> None:
    modified_runs = []
    
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
            
            original_font_size = get_font_size_pt(run)
            run.text = text_values[key]
            run.font.bold = False
            run.font.italic = False
            run.font.underline = False
            run.font.color.rgb = RGBColor(0, 0, 0)
            
            modified_runs.append((run, text_values[key], original_font_size))
    
    if modified_runs:
        frame_width = 0
        frame_height = 0
        
        if cell_dimensions is not None:
            frame_width, frame_height = cell_dimensions
        elif shape is not None:
            try:
                frame_width = shape.width.pt if hasattr(shape, 'width') else 0
                frame_height = shape.height.pt if hasattr(shape, 'height') else 0
            except Exception:
                pass
        
        if frame_width > 0 and frame_height > 0:
            for run, text, original_size in modified_runs:
                try:
                    optimal_size = calculate_optimal_font_size(
                        text, 
                        original_size, 
                        frame_width, 
                        frame_height
                    )
                    
                    if optimal_size < original_size:
                        run.font.size = Pt(optimal_size)
                except Exception:
                    pass
    
    try:
        text_frame.auto_size = MSO_AUTO_SIZE.TEXT_TO_FIT_SHAPE
    except Exception:
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
        process_text_frame(shape.text_frame, text_values, shape)
    
    return False

def get_cell_dimensions(table, row_idx: int, col_idx: int) -> tuple[float, float]:
    try:
        col_width = table.columns[col_idx].width.pt if table.columns[col_idx].width else 0
        row_height = table.rows[row_idx].height.pt if table.rows[row_idx].height else 0
        
        padding = 6.0
        effective_width = max(0, col_width - (padding * 2))
        effective_height = max(0, row_height - (padding * 2))
        
        return (effective_width, effective_height)
    except Exception:
        return (0, 0)

def process_table(table, text_values: dict[str, str], image_values: dict[str, list[bytes]], slide) -> None:
    for row_idx, row in enumerate(table.rows):
        for col_idx, cell in enumerate(row.cells):
            if hasattr(cell, 'text_frame'):
                cell_dimensions = get_cell_dimensions(table, row_idx, col_idx)
                process_text_frame(cell.text_frame, text_values, None, cell_dimensions)

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
