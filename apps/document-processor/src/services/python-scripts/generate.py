import sys
import json
import re
import base64
import tempfile
from io import BytesIO
from pptx import Presentation

PLACEHOLDER_PATTERN = re.compile(r'\{\{([^:}]+):([^}:]+)\}\}')

BIDI_CHARS = set(range(0x200B, 0x2010)) | set(range(0x202A, 0x202F)) | set(range(0x2066, 0x206A))

def clean_bidi(text: str) -> str:
    return ''.join(c for c in text if ord(c) not in BIDI_CHARS)

def decode_data_url(data_url: str) -> BytesIO:
    base64_data = data_url.split(',', 1)[1]
    return BytesIO(base64.b64decode(base64_data))

def prepare_data(placeholder_data: list[dict]) -> tuple[dict[str, str], dict[str, list[BytesIO]]]:
    text_values: dict[str, str] = {}
    map_values: dict[str, list[BytesIO]] = {}

    for item in placeholder_data:
        key = item['key']
        placeholder_type = item['type']
        value = item['value']

        if placeholder_type == 'text':
            text_values[key] = value
        elif placeholder_type == 'map':
            map_values[key] = [decode_data_url(url) for url in json.loads(value)]

    return text_values, map_values

def replace_text_in_run(run, text_values: dict[str, str]) -> None:
    text = clean_bidi(run.text)
    
    def replacer(match):
        key = match.group(1).strip()
        return text_values.get(key, match.group(0))

    new_text = PLACEHOLDER_PATTERN.sub(replacer, text)
    
    if new_text != text:
        run.text = new_text

def replace_text_in_frame(text_frame, text_values: dict[str, str]) -> None:
    for paragraph in text_frame.paragraphs:
        for run in paragraph.runs:
            replace_text_in_run(run, text_values)

def find_map_placeholder(text: str, map_values: dict[str, list[BytesIO]]) -> str | None:
    text = clean_bidi(text)
    matches = PLACEHOLDER_PATTERN.findall(text)
    
    for key, _ in matches:
        key = key.strip()
        if key in map_values:
            return key
    
    return None

def process_shape(shape, slide, text_values: dict[str, str], map_values: dict[str, list[BytesIO]]) -> bool:
    if not hasattr(shape, 'text_frame'):
        return False

    text_frame = shape.text_frame
    map_key = find_map_placeholder(text_frame.text, map_values)

    if map_key:
        images = map_values[map_key]
        left, top, width, height = shape.left, shape.top, shape.width, shape.height

        shape.element.getparent().remove(shape.element)

        for image_buffer in images:
            image_buffer.seek(0)
            slide.shapes.add_picture(image_buffer, left, top, width, height)

        return True

    replace_text_in_frame(text_frame, text_values)
    return False

def process_table(table, text_values: dict[str, str]) -> None:
    for row in table.rows:
        for cell in row.cells:
            if hasattr(cell, 'text_frame'):
                replace_text_in_frame(cell.text_frame, text_values)

def generate(file_path: str, placeholder_data: list[dict]) -> str:
    prs = Presentation(file_path)
    text_values, map_values = prepare_data(placeholder_data)

    for slide in prs.slides:
        shapes_to_process = list(slide.shapes)

        for shape in shapes_to_process:
            if hasattr(shape, 'table'):
                process_table(shape.table, text_values)
            else:
                process_shape(shape, slide, text_values, map_values)

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
