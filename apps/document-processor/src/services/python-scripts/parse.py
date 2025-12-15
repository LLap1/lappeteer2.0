import sys
import json
import re
from pptx import Presentation
from pptx.util import Emu

PLACEHOLDER_PATTERN = re.compile(r'\{\{([^:}]+):([^}:]+)\}\}')

BIDI_CHARS = set(range(0x200B, 0x2010)) | set(range(0x202A, 0x202F)) | set(range(0x2066, 0x206A))

def clean_bidi(text: str) -> str:
    return ''.join(c for c in text if ord(c) not in BIDI_CHARS)

def emu_to_pixels(emu_value: int) -> float:
    return round(Emu(emu_value).pt * 96 / 72, 2)


def extract_placeholders_from_text(text: str) -> list[dict]:
    text = clean_bidi(text)
    matches = PLACEHOLDER_PATTERN.findall(text)
    return [{"key": key.strip(), "type": placeholder_type.strip()} for key, placeholder_type in matches]

def parse_pptx(file_path: str) -> list[dict]:
    prs = Presentation(file_path)
    placeholders: dict[str, any] = {}

    for slide in prs.slides:
        for shape in slide.shapes:
            if  shape.has_text_frame:
                text = shape.text_frame.text
                text = clean_bidi(text)
                matches = PLACEHOLDER_PATTERN.findall(text)
                for key, placeholder_type in matches:
                    placeholders[key.strip()] = {
                        "key": key.strip(),
                        "type": placeholder_type.strip(),
                        "width": emu_to_pixels(shape.width),
                        "height": emu_to_pixels(shape.height)
                    }

            elif shape.has_table:
                for cell in list(shape.table.iter_cells()):
                    text = cell.text
                    text = clean_bidi(text)
                    matches = PLACEHOLDER_PATTERN.findall(text)
                    for key, placeholder_type in matches:
                        placeholders[key.strip()] = {
                            "key": key.strip(),
                            "type": placeholder_type.strip(),
                            "width": emu_to_pixels(cell.span_width),
                            "height": emu_to_pixels(cell.span_height)
                        }


    return list(placeholders.values())

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)

    file_path = sys.argv[1]

    try:
        result = parse_pptx(file_path)
        print(json.dumps(result))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
