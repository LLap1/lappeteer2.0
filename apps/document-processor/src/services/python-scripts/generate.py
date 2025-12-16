import sys
import json
import base64
import tempfile
from io import BytesIO
from pptx import Presentation
from pptx.dml.color import RGBColor

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

def process_text_frame(text_frame, text_values: dict[str, str]) -> None:
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
            
            run.text = text_values[key]
            run.font.bold = False
            run.font.italic = False
            run.font.underline = False
            run.font.color.rgb = RGBColor(0, 0, 0)

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
    for row in table.rows:
        for cell in row.cells:
            if hasattr(cell, 'text_frame'):
                process_text_frame(cell.text_frame, text_values)

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

def generate(file_path: str, placeholder_data: list[dict]) -> str:
    prs = Presentation(file_path)
    text_values, image_values = prepare_data(placeholder_data)

    for slide in prs.slides:
        process_all_shapes(slide.shapes, slide, text_values, image_values)

    with tempfile.NamedTemporaryFile(mode='wb', delete=False, suffix='.pptx') as tmp:
        prs.save(tmp)
        return tmp.name

def main():
    if len(sys.argv) < 3:
        sys.stderr.write("Usage: python generate.py <file_path> <json_data>\n")
        sys.exit(1)
    
    file_path = sys.argv[1]
    json_data = sys.argv[2]

    try:
        placeholder_data = json.loads(json_data)
        output_path = generate(file_path, placeholder_data)
        print(output_path)
    except Exception as e:
        sys.stderr.write(f"Error: {e}\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
