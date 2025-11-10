# Quick Start Guide

## Installation

Run the setup script:

```bash
chmod +x setup.sh
./setup.sh
```

Or manually:

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Usage

### 1. List images in a presentation

```bash
python replace_image.py presentation.pptx --list
```

### 2. Replace first image in first slide

```bash
python replace_image.py input.pptx -o output.pptx -i new_image.png
```

### 3. Replace image in specific slide

```bash
python replace_image.py input.pptx -o output.pptx -i new_image.png --slide 2
```

### 4. Replace ALL images

```bash
python replace_image.py input.pptx -o output.pptx -i new_image.png --all
```

## Test with Sample Files

Create sample presentation and images:

```bash
python create_sample_presentation.py
```

Then test:

```bash
python replace_image.py sample_presentation.pptx --list
python replace_image.py sample_presentation.pptx -o output.pptx -i new_image.png
```

## Common Options

- `-o, --output` - Output file path
- `-i, --image` - Replacement image path
- `-s, --slide` - Slide index (0-based)
- `-a, --all` - Replace all images
- `-l, --list` - List images only
- `-h, --help` - Show help

## Examples

```bash
# View all images
python replace_image.py presentation.pptx --list

# Replace in slide 0 (first slide)
python replace_image.py input.pptx -o output.pptx -i logo.png

# Replace in slide 3
python replace_image.py input.pptx -o output.pptx -i photo.jpg --slide 3

# Replace all images
python replace_image.py input.pptx -o output.pptx -i banner.png --all
```
