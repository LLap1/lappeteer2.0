"""
Script to extract placeholder values from PowerPoint presentations
Finds all strings in format {{ keyname : type }}
"""
import json
import re
import sys
import traceback
from io import BytesIO
from typing import Dict, List, Optional

from pptx import Presentation
from pptx.shapes.base import BaseShape
from pptx.text.text import TextFrame
from pptx.util import Length

EMU_PER_INCH = 914400
DPI = 96
PLACEHOLDER_PATTERN = re.compile(r'\{\{\s*(.*?)\s*\:\s*(.*?)\s*\}\}')


def emu_to_px(value: Length | int) -> float:
    return round((float(value) / EMU_PER_INCH) * DPI, 2)


def record_placeholder(
    placeholders: Dict[str, Dict[str, str | float]],
    key: str,
    type: str,
    width_emu: Optional[Length | int],
    height_emu: Optional[Length | int]
) -> None:
    if width_emu is None or height_emu is None:
        return
    
    width_px: float = emu_to_px(width_emu)
    height_px: float = emu_to_px(height_emu)
    
    if key not in placeholders:
        placeholders[key] = {
            'key': key,
            'type': type,
            'width': width_px,
            'height': height_px,
        }
        print(f"  Recorded placeholder: {key} - {width_px}x{height_px}px", file=sys.stderr)
    else:
        print(f"  Skipping duplicate placeholder: {key} (already recorded)", file=sys.stderr)


def find_placeholders_in_shape(shape: BaseShape) -> List[tuple[str, str]]:
    found_placeholders_set: set[tuple[str, str]] = set()

    for paragraph in shape.text_frame.paragraphs:
        for run in paragraph.runs:
            if run.text:
                text = run.text
                matches = PLACEHOLDER_PATTERN.findall(text)
                if matches:
                    print(f"  Found run text: {text}", file=sys.stderr)
                    print(f"  Matches: {matches}", file=sys.stderr)

                for key, type in matches:
                    found_placeholders_set.add((key, type))


    return list(found_placeholders_set)


def process_shape_for_placeholders(
    shape: BaseShape,
    placeholders: Dict[str, Dict[str, str | float]]
) -> None:
    found_placeholders: List[tuple[str, str]] = find_placeholders_in_shape(shape)
    
    if not found_placeholders:
        return
    
    width: Optional[Length | int] = getattr(shape, 'width', None)
    height: Optional[Length | int] = getattr(shape, 'height', None)
    
    for key, type in found_placeholders:
        record_placeholder(placeholders, key, type, width, height)


def extract_placeholders_from_presentation(pptx_data: BytesIO) -> List[Dict[str, str | float]]:
    prs: Presentation = Presentation(pptx_data)
    placeholders: Dict[str, Dict[str, str | float]] = {}
    
    print(f"Analyzing presentation with {len(prs.slides)} slides", file=sys.stderr)
    
    for slide_idx, slide in enumerate(prs.slides):
        print(f"Processing slide {slide_idx}...", file=sys.stderr)
        text_shapes = [shape for shape in slide.shapes if hasattr(shape, 'text_frame') and shape.text_frame ]
        for shape in text_shapes:
            process_shape_for_placeholders(shape, placeholders)
    
    print(f"\nTotal unique placeholders found: {len(placeholders)}", file=sys.stderr)
    
    return sorted(placeholders.values(), key=lambda item: item['key'])


def main() -> None:
    if len(sys.argv) < 2:
        sys.stderr.write("Usage: python3 parse.py <filepath>\n")
        sys.exit(1)
    
    filepath: str = sys.argv[1]
    
    try:
        with open(filepath, 'rb') as f:
            pptx_data: BytesIO = BytesIO(f.read())
    except Exception as e:
        trace = traceback.format_exc()
        sys.stderr.write(f"Error reading file {filepath}: {trace}\n")
        sys.exit(1)
    
    try:
        placeholders: List[Dict[str, str | float]] = extract_placeholders_from_presentation(pptx_data)
        output_data: str = json.dumps(placeholders)
        print(output_data, file=sys.stdout)
        sys.exit(0)
    except Exception as e:
        import traceback
        trace = traceback.format_exc()
        sys.stderr.write(trace)
        sys.exit(1)


if __name__ == "__main__":
    main()
