# PowerPoint Image Replacement with python-pptx

This project demonstrates how to load a PowerPoint presentation and replace images in slides using the python-pptx library.

## Features

- Load existing PowerPoint presentations
- Find and replace specific images in slides
- Replace all images in the entire presentation
- Maintain original image position and size
- List all images in a presentation with details

## Installation

1. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

## Usage

### Quick Start

1. **Create a sample presentation for testing:**
```bash
python create_sample_presentation.py
```

This will create:
- `sample_presentation.pptx` - A sample PowerPoint with 3 slides
- `original_image.png` - The original image used in the presentation
- `new_image.png` - The replacement image

2. **View help and available options:**
```bash
python replace_image.py --help
```

### CLI Usage

The script now has a full command-line interface with various options:

#### List all images in a presentation
```bash
python replace_image.py sample_presentation.pptx --list
```

#### Replace first image in first slide (default behavior)
```bash
python replace_image.py sample_presentation.pptx -o output.pptx -i new_image.png
```

#### Replace image in a specific slide
```bash
python replace_image.py sample_presentation.pptx -o output.pptx -i new_image.png --slide 1
```

#### Replace ALL images in the entire presentation
```bash
python replace_image.py sample_presentation.pptx -o output.pptx -i new_image.png --all
```

### CLI Options

- `input` - Input PowerPoint file path (required)
- `-o, --output` - Output PowerPoint file path (required for replacement)
- `-i, --image` - Path to the new image file (required for replacement)
- `-s, --slide` - Slide index to replace image in (0-based, default: 0)
- `-a, --all` - Replace all images in all slides
- `-l, --list` - List all images in the presentation without modification
- `-h, --help` - Show help message

### Available Functions

#### 1. Replace Image in Specific Slide
```python
from replace_image import find_and_replace_image

find_and_replace_image(
    pptx_path="input.pptx",
    output_path="output.pptx",
    new_image_path="new_image.png",
    slide_index=0  # First slide (0-based index)
)
```

#### 2. Replace All Images in Presentation
```python
from replace_image import replace_all_images

replace_all_images(
    pptx_path="input.pptx",
    output_path="output.pptx",
    new_image_path="new_image.png"
)
```

#### 3. List All Images in Presentation
```python
from replace_image import list_images_in_presentation

list_images_in_presentation("input.pptx")
```

## How It Works

1. **Loading**: The script loads the PowerPoint file using `Presentation()`
2. **Finding Images**: Iterates through shapes in slides looking for picture shapes (shape_type == 13)
3. **Replacing**: 
   - Captures the original image's position and size
   - Removes the old image from the slide
   - Adds the new image at the same position with the same dimensions
4. **Saving**: Saves the modified presentation to a new file

## Key Concepts

### Shape Types
- Pictures in PowerPoint are shapes with `shape_type == 13` (MSO_SHAPE_TYPE.PICTURE)

### Positioning
- Positions and sizes use EMUs (English Metric Units)
- Use `Inches()` or `Cm()` from `pptx.util` for easier measurements
- Example: `Inches(2)` = 2 inches from the top/left

### Image Replacement Process
```python
# Get original properties
left = shape.left
top = shape.top
width = shape.width
height = shape.height

# Remove old image
shape.element.getparent().remove(shape.element)

# Add new image
slide.shapes.add_picture(new_image_path, left, top, width=width, height=height)
```

## Example Output

### Listing images
```bash
$ python replace_image.py sample_presentation.pptx --list

Analyzing presentation: sample_presentation.pptx
Total slides: 3

Slide 0:
  - Image: Picture 2
    Position: (2286000, 1828800)
    Size: 4572000 x 3429000

Slide 1:
  - Image: Picture 2
    Position: (457200, 1828800)
    Size: 3657600 x 2743200
  - Image: Picture 3
    Position: (5029200, 1828800)
    Size: 3657600 x 2743200

Slide 2:
  No images found

Total images in presentation: 3
```

### Replacing an image
```bash
$ python replace_image.py sample_presentation.pptx -o output.pptx -i new_image.png

Replacing image in slide 0 of 'sample_presentation.pptx'...
Loaded presentation with 3 slides

Processing slide 0...
Found image: Picture 2
Replaced image at position (2286000, 1828800) with size (4572000, 3429000)
New image: new_image.png

Saved modified presentation to: output_presentation.pptx

✓ Success! Saved to 'output.pptx'
```

### Replacing all images
```bash
$ python replace_image.py sample_presentation.pptx -o output.pptx -i new_image.png --all

Replacing all images in 'sample_presentation.pptx'...
Loaded presentation with 3 slides

Processing slide 0...
  Found image: Picture 2
  Replaced image at position (2286000, 1828800)

Processing slide 1...
  Found image: Picture 2
  Replaced image at position (457200, 1828800)
  Found image: Picture 3
  Replaced image at position (5029200, 1828800)

Processing slide 2...

Total images replaced: 3
Saved modified presentation to: output.pptx

✓ Success! Saved to 'output.pptx'
```

## Supported Image Formats

python-pptx supports common image formats:
- PNG
- JPEG/JPG
- GIF
- BMP
- TIFF

## Tips

1. **Preserve Aspect Ratio**: To maintain the aspect ratio of your new image, calculate the appropriate width and height before adding it
2. **Image Quality**: Use high-resolution images for better quality in presentations
3. **File Size**: Be mindful of image file sizes as they affect the final presentation size
4. **Testing**: Always test on a copy of your presentation first

## Troubleshooting

### "No images found in slide"
- Verify that the slide actually contains images
- Check that the images are not embedded in groups or other containers

### "Slide index out of range"
- Slide indices are 0-based (first slide is 0)
- Check the total number of slides first

### Import errors
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Activate your virtual environment

## License

MIT License - Feel free to use and modify for your needs.

