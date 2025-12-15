import sys
import json
import re
from pptx import Presentation
from pptx.util import Emu

PLACEHOLDER_PATTERN = re.compile(r'\{\{([^:}]+):([^}]+)\}\}')

def emu_to_pixels(emu_value: int) -> float:
    return round(Emu(emu_value).pt * 96 / 72, 2)

def parse_pptx(file_path: str) -> list[dict]:
    prs = Presentation(file_path)
    placeholders = []

    for slide in prs.slides:
        for shape in slide.shapes:
            if not shape.has_text_frame:
                continue

            text = shape.text_frame.text
            matches = PLACEHOLDER_PATTERN.findall(text)

            for key, placeholder_type in matches:
                placeholders.append({
                    "key": key.strip(),
                    "type": placeholder_type.strip(),
                    "width": emu_to_pixels(shape.width),
                    "height": emu_to_pixels(shape.height)
                })

    return placeholders

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
