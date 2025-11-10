"""
Script to replace an image in a PowerPoint presentation using python-pptx
"""
from pptx import Presentation
from pptx.util import Inches
import os
import argparse
import sys
from io import BytesIO
import struct
import json
import re


def ensure_stream(data):
    if isinstance(data, BytesIO):
        data.seek(0)
        return data
    if isinstance(data, (bytes, bytearray)):
        return BytesIO(data)
    if isinstance(data, str):
        return data
    if hasattr(data, "read"):
        data.seek(0)
        return data
    return data


def find_and_replace_image(pptx_data, new_image_data, placeholders=None, output_buffer=None):
    """
    Replace the first image found in the first slide with a new image.
    
    Args:
        pptx_data: BytesIO buffer or file path for the input PowerPoint file
        new_image_data: BytesIO buffer or file path for the new image
        placeholders: Dict of placeholder strings to replacement values
        output_buffer: If provided, writes to buffer; otherwise writes to stdout
    
    Returns:
        BytesIO buffer containing the modified presentation
    """
    # Load the presentation
    pptx_stream = ensure_stream(pptx_data)
    prs = Presentation(pptx_stream)
    
    print(f"Loaded presentation with {len(prs.slides)} slides", file=sys.stderr)
    
    slide = prs.slides[0]
    image_stream = ensure_stream(new_image_data)
    
    # Find and replace images in the slide
    image_found = False
    for shape in slide.shapes:
        # Check if shape is a picture
        if shape.shape_type == 13:  # MSO_SHAPE_TYPE.PICTURE
            image_found = True
            print(f"Found image: {shape.name}", file=sys.stderr)
            
            # Store the position and size of the original image
            left = shape.left
            top = shape.top
            width = shape.width
            height = shape.height
            
            # Remove the old image
            sp = shape.element
            sp.getparent().remove(sp)
            
            # Add the new image with the same position and size
            if hasattr(image_stream, "seek"):
                image_stream.seek(0)
                slide.shapes.add_picture(
                  image_stream,
                  left,
                  top,
                  width=width,
                  height=height
                )
            else:
                slide.shapes.add_picture(
                  image_stream,
                  left,
                  top,
                  width=width,
                  height=height
                )
            
            print(f"Replaced image at position ({left}, {top}) with size ({width}, {height})", file=sys.stderr)
            break
    
    if not image_found:
        print("No images found in slide 0", file=sys.stderr)
        print("Adding new image to center of slide...", file=sys.stderr)
        # Add image to center of slide
        left = Inches(2)
        top = Inches(2)
        if hasattr(image_stream, "seek"):
            image_stream.seek(0)
            slide.shapes.add_picture(image_stream, left, top, width=Inches(4))
        else:
            slide.shapes.add_picture(image_stream, left, top, width=Inches(4))
    
    placeholders = placeholders or {}
    placeholder_pattern = re.compile(r'\{\{\s*([^\}]+?)\s*\}\}')
    
    def replace_text(text: str) -> str:
        if not text:
            return text
        
        def replacer(match):
            key = match.group(1).strip()
            return placeholders.get(key, match.group(0))
        
        return placeholder_pattern.sub(replacer, text)
    
    def replace_in_shape(shape):
        if hasattr(shape, "text_frame") and shape.text_frame:
            for paragraph in shape.text_frame.paragraphs:
                for run in paragraph.runs:
                    run.text = replace_text(run.text)
        if hasattr(shape, "text") and shape.text:
            shape.text = replace_text(shape.text)
        if shape.has_table:
            for row in shape.table.rows:
                for cell in row.cells:
                    cell.text = replace_text(cell.text)
    
    if placeholders:
        print(f"Applying placeholders: {placeholders}", file=sys.stderr)
        for slide in prs.slides:
            for shape in slide.shapes:
                replace_in_shape(shape)
    
    # Save to buffer
    if output_buffer is None:
        output_buffer = BytesIO()
    
    prs.save(output_buffer)
    output_buffer.seek(0)
    
    return output_buffer


def list_images_in_presentation(pptx_path):
    """
    List all images found in the presentation with their details.
    
    Args:
        pptx_path (str): Path to the PowerPoint file
    """
    prs = Presentation(pptx_path)
    
    print(f"Analyzing presentation: {pptx_path}")
    print(f"Total slides: {len(prs.slides)}\n")
    
    total_images = 0
    
    for slide_idx, slide in enumerate(prs.slides):
        print(f"Slide {slide_idx}:")
        
        images = [shape for shape in slide.shapes if shape.shape_type == 13]
        
        if images:
            for img in images:
                print(f"  - Image: {img.name}")
                print(f"    Position: ({img.left}, {img.top})")
                print(f"    Size: {img.width} x {img.height}")
                total_images += 1
        else:
            print("  No images found")
        print()
    
    print(f"Total images in presentation: {total_images}")


def main():
    """Main CLI entry point"""
    parser = argparse.ArgumentParser(
        description='Replace images in PowerPoint presentations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # List all images in a presentation
  python replace_image.py input.pptx --list

  # Replace first image from files and save to file
  python replace_image.py input.pptx -o output.pptx -i new_image.png

  # Replace first image from files and output to stdout
  python replace_image.py input.pptx -i new_image.png > output.pptx

  # Replace using stdin (length-prefixed: 8 bytes size + template + image)
  python replace_image.py --stdin > output.pptx
        """
    )
    
    parser.add_argument(
        'input',
        nargs='?',
        help='Input PowerPoint file path (not required with --stdin)',
        default=None
    )
    
    parser.add_argument(
        '-o', '--output',
        help='Output PowerPoint file path (optional - outputs to stdout if not provided)',
        default=None
    )
    
    parser.add_argument(
        '-i', '--image',
        help='Path to the new image file (optional - uses stdin if not provided)',
        default=None
    )
    
    parser.add_argument(
        '--stdin',
        action='store_true',
        help='Read both template and image data from stdin (length-prefixed protocol)'
    )
    
    parser.add_argument(
        '--placeholder',
        '-p',
        action='append',
        help='Placeholder replacement in KEY=VALUE format (can be specified multiple times)'
    )
    
    parser.add_argument(
        '--placeholder-json',
        help='Path to JSON file containing placeholder mappings'
    )
    
    parser.add_argument(
        '--stdout',
        action='store_true',
        help='Output the modified presentation to stdout as binary'
    )
    
    parser.add_argument(
        '-l', '--list',
        action='store_true',
        help='List all images in the presentation (no modification)'
    )
    
    args = parser.parse_args()
    
    # Validate input file exists (unless using stdin)
    if not args.stdin and args.input and not os.path.exists(args.input):
        print(f"Error: Input file '{args.input}' not found", file=sys.stderr)
        sys.exit(1)
    
    # Check for required arguments
    if not args.stdin and not args.input:
        print("Error: Input file path is required when not using --stdin", file=sys.stderr)
        sys.exit(1)
    
    # List mode - just show images and exit
    if args.list:
        list_images_in_presentation(args.input)
        return
    
    # For replacement operations, validate required arguments
    if not args.stdin and not args.image:
        print("Error: Either --image (-i) or --stdin is required for image replacement", file=sys.stderr)
        print("Use --list to only view images without modifying", file=sys.stderr)
        sys.exit(1)
    
    # Get template and image data
    if args.stdin:
        print("Reading template and image from stdin...", file=sys.stderr)
        # Read length-prefixed data
        # First 8 bytes: template size
        template_size_bytes = sys.stdin.buffer.read(8)
        if len(template_size_bytes) < 8:
            print("Error: Unable to read template size", file=sys.stderr)
            sys.exit(1)
        template_size = struct.unpack('>Q', template_size_bytes)[0]
        print(f"Template size: {template_size} bytes", file=sys.stderr)
        
        # Read template data
        template_data = BytesIO(sys.stdin.buffer.read(template_size))
        print(f"Template data read: {len(template_data.getvalue())} bytes", file=sys.stderr)
        
        # Next 8 bytes: map size
        map_size_bytes = sys.stdin.buffer.read(8)
        if len(map_size_bytes) < 8:
            print("Error: Unable to read map size", file=sys.stderr)
            sys.exit(1)
        map_size = struct.unpack('>Q', map_size_bytes)[0]
        print(f"Map size: {map_size} bytes", file=sys.stderr)
        
        # Read map data
        image_data = BytesIO(sys.stdin.buffer.read(map_size))
        print(f"Image data read: {len(image_data.getvalue())} bytes", file=sys.stderr)
        
        # Next 8 bytes: placeholders JSON size
        placeholders_size_bytes = sys.stdin.buffer.read(8)
        if len(placeholders_size_bytes) < 8:
            print("Error: Unable to read placeholders size", file=sys.stderr)
            sys.exit(1)
        placeholders_size = struct.unpack('>Q', placeholders_size_bytes)[0]
        print(f"Placeholders JSON size: {placeholders_size} bytes", file=sys.stderr)
        
        placeholders = {}
        if placeholders_size > 0:
            placeholders_json = sys.stdin.buffer.read(placeholders_size).decode('utf-8')
            placeholders = json.loads(placeholders_json)
            print(f"Placeholders loaded: {placeholders}", file=sys.stderr)
        else:
            print("No placeholders provided", file=sys.stderr)
    else:
        # Validate files exist
        if not os.path.exists(args.input):
            print(f"Error: Template file '{args.input}' not found", file=sys.stderr)
            sys.exit(1)
        
        if not os.path.exists(args.image):
            print(f"Error: Image file '{args.image}' not found", file=sys.stderr)
            sys.exit(1)
        
        template_data = args.input
        image_data = args.image
        placeholders = {}
        if args.placeholder_json:
            with open(args.placeholder_json, 'r') as f:
                placeholders.update(json.load(f))
        if args.placeholder:
            for entry in args.placeholder:
                if '=' not in entry:
                    print(f"Warning: Ignoring invalid placeholder '{entry}'. Expected format KEY=VALUE", file=sys.stderr)
                    continue
                key, value = entry.split('=', 1)
                placeholders[key.strip()] = value
    
    # Perform the requested operation
    try:
        print(f"Replacing image...", file=sys.stderr)
        buffer = find_and_replace_image(template_data, image_data, placeholders)
        
        if args.output:
            # Save to file
            with open(args.output, 'wb') as f:
                f.write(buffer.read())
            print(f"\n✓ Success! Saved to '{args.output}'", file=sys.stderr)
        else:
            # Output to stdout as binary
            sys.stdout.buffer.write(buffer.read())
    
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()

