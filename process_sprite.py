#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pillow>=10.0.0",
#     "numpy>=1.24.0",
# ]
# ///
"""
Process a 4x2 grid sprite sheet into a horizontal 8-frame sprite sheet.
- Input: 2816×1536 image (4×2 grid = 8 frames, each 704×768)
- Remove charcoal background (#2d2d2d, RGB < 80 and gray)
- Scale each frame to 80×96 
- Output: 640×96 horizontal sheet with transparency
"""

import sys
from pathlib import Path
from PIL import Image
import numpy as np

def remove_charcoal_background(img: Image.Image, threshold: int = 80) -> Image.Image:
    """Remove dark charcoal background, making it transparent."""
    # Convert to RGBA if needed
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    data = np.array(img)
    r, g, b, a = data[:,:,0], data[:,:,1], data[:,:,2], data[:,:,3]
    
    # Detect charcoal/dark pixels: all RGB channels < threshold and roughly equal (gray)
    is_dark = (r < threshold) & (g < threshold) & (b < threshold)
    # Check if it's grayish (channels within 30 of each other)
    max_rgb = np.maximum(np.maximum(r, g), b)
    min_rgb = np.minimum(np.minimum(r, g), b)
    is_gray = (max_rgb - min_rgb) < 30
    
    # Make matching pixels transparent
    mask = is_dark & is_gray
    data[mask, 3] = 0  # Set alpha to 0 for background pixels
    
    return Image.fromarray(data)

def process_sprite_sheet(input_path: str, output_path: str, 
                         grid_cols: int = 4, grid_rows: int = 2,
                         target_frame_width: int = 80, target_frame_height: int = 96) -> bool:
    """Process a grid sprite sheet into a horizontal strip."""
    try:
        img = Image.open(input_path)
        width, height = img.size
        
        # Calculate frame dimensions
        frame_width = width // grid_cols
        frame_height = height // grid_rows
        
        print(f"Input: {width}x{height}, Frame: {frame_width}x{frame_height}")
        
        # Extract frames in order (left-to-right, top-to-bottom)
        frames = []
        for row in range(grid_rows):
            for col in range(grid_cols):
                x = col * frame_width
                y = row * frame_height
                frame = img.crop((x, y, x + frame_width, y + frame_height))
                frames.append(frame)
        
        # Process each frame
        processed_frames = []
        for i, frame in enumerate(frames):
            # Remove background
            frame = remove_charcoal_background(frame)
            # Scale to target size
            frame = frame.resize((target_frame_width, target_frame_height), Image.Resampling.LANCZOS)
            processed_frames.append(frame)
        
        # Create output sprite sheet
        output_width = target_frame_width * len(processed_frames)
        output_height = target_frame_height
        output_img = Image.new('RGBA', (output_width, output_height), (0, 0, 0, 0))
        
        # Paste frames
        for i, frame in enumerate(processed_frames):
            output_img.paste(frame, (i * target_frame_width, 0))
        
        # Save
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        output_img.save(output_path, 'PNG')
        print(f"Saved: {output_path} ({output_width}x{output_height})")
        return True
        
    except Exception as e:
        print(f"Error processing {input_path}: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 process_sprite.py <input.png> <output.png>")
        sys.exit(1)
    
    success = process_sprite_sheet(sys.argv[1], sys.argv[2])
    sys.exit(0 if success else 1)
