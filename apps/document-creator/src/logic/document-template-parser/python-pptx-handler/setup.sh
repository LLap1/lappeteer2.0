#!/bin/bash

# Setup script for PowerPoint Image Replacement Tool

echo "=========================================="
echo "PowerPoint Image Replacement Tool Setup"
echo "=========================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    echo "Please install Python 3 from https://www.python.org/"
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Create virtual environment
echo "Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "=========================================="
echo "✓ Setup complete!"
echo "=========================================="
echo ""
echo "To use the tool:"
echo "1. Activate the virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "2. Create sample files (optional):"
echo "   python create_sample_presentation.py"
echo ""
echo "3. View help:"
echo "   python replace_image.py --help"
echo ""
echo "4. Example usage:"
echo "   python replace_image.py input.pptx -o output.pptx -i new_image.png"
echo ""

