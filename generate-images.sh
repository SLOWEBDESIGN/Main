#!/bin/bash

# Generate placeholder comparison images
# Run: bash generate-images.sh

# Create comparison images directory
mkdir -p public/comparison

# Create a simple "Outdated" placeholder image using ImageMagick or Python
# If you have ImageMagick installed:
# convert -size 1200x800 xc:white -pointsize 72 -fill black -gravity center -annotate +0+0 "Outdated Website" public/comparison/before.png

# If you don't have ImageMagick, use this Python script:

python3 << 'EOF'
from PIL import Image, ImageDraw, ImageFont

# Image dimensions
width, height = 1200, 800

# Create "Before" image
img_before = Image.new('RGB', (width, height), color='#E8E8E8')
draw_before = ImageDraw.Draw(img_before)

# Add placeholder elements to simulate outdated design
# Draw rectangles to simulate old layout
draw_before.rectangle([50, 100, 1150, 150], fill='#CCCCCC', outline='#999999')
draw_before.rectangle([50, 200, 400, 500], fill='#F0F0F0', outline='#999999')
draw_before.rectangle([450, 200, 1150, 500], fill='#FFFFFF', outline='#999999')
draw_before.text((width//2, height//2), "Outdated Website Design", fill='#666666', anchor='mm')

img_before.save('public/comparison/before.png')
print('✓ Created public/comparison/before.png')

# Create "After" image
img_after = Image.new('RGB', (width, height), color='#F5F5F0')
draw_after = ImageDraw.Draw(img_after)

# Add placeholder elements to simulate modern design
draw_after.rectangle([0, 0, width, 80], fill='#3d5e3f')  # Modern header
draw_after.rectangle([100, 150, 1100, 200], fill='#E0E0C8')  # Modern accent bar
draw_after.rectangle([100, 250, 1100, 700], fill='#FFFFFF', outline='#D0D0D0')
draw_after.text((width//2, height//2), "Modernized Design", fill='#3d5e3f', anchor='mm')

img_after.save('public/comparison/after.png')
print('✓ Created public/comparison/after.png')

print('\nComparison images generated successfully!')
print('Location: public/comparison/')

EOF

echo "Done! Replace these placeholder images with your real before/after screenshots."
