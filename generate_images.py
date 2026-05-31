# Create placeholder comparison images
# Run: python generate_images.py

from PIL import Image, ImageDraw, ImageFont
import os

# Ensure directory exists
os.makedirs('public/comparison', exist_ok=True)

# Image dimensions
width, height = 1200, 800

# Create "Before" (Outdated) image
img_before = Image.new('RGB', (width, height), color='#E8E8E8')
draw_before = ImageDraw.Draw(img_before)

# Draw placeholder elements to simulate outdated design
draw_before.rectangle([50, 100, 1150, 150], fill='#CCCCCC', outline='#999999', width=2)
draw_before.rectangle([50, 200, 400, 500], fill='#F0F0F0', outline='#999999', width=2)
draw_before.rectangle([450, 200, 1150, 500], fill='#FFFFFF', outline='#999999', width=2)

# Add text
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 48)
except:
    font = ImageFont.load_default()

draw_before.text((width//2, height//2), "Outdated Website", fill='#666666', anchor='mm', font=font)
draw_before.text((width//2, height//2 + 60), "Click & drag to compare", fill='#999999', anchor='mm')

img_before.save('public/comparison/before.png')
print('✓ Created public/comparison/before.png')

# Create "After" (Modernized) image
img_after = Image.new('RGB', (width, height), color='#F5F5F0')
draw_after = ImageDraw.Draw(img_after)

# Draw placeholder elements to simulate modern design
draw_after.rectangle([0, 0, width, 80], fill='#3d5e3f')  # Modern header in forest green
draw_after.rectangle([100, 150, 1100, 200], fill='#E0E0C8')  # Accent bar
draw_after.rectangle([100, 250, 1100, 700], fill='#FFFFFF', outline='#D0D0D0', width=1)

# Add modern accents
draw_after.ellipse([100, 300, 200, 400], fill='#3d5e3f', outline='#3d5e3f')
draw_after.ellipse([1000, 500, 1100, 600], fill='#E0E0C8', outline='#E0E0C8')

draw_after.text((width//2, height//2), "Modernized Design", fill='#3d5e3f', anchor='mm', font=font)
draw_after.text((width//2, height//2 + 60), "Beautiful • Fast • Responsive", fill='#64748b', anchor='mm')

img_after.save('public/comparison/after.png')
print('✓ Created public/comparison/after.png')

print('\n✅ Placeholder comparison images generated successfully!')
print('📁 Location: public/comparison/')
print('\n⚠️  IMPORTANT: Replace these placeholder images with your actual before/after screenshots.')
print('   The images should have the same dimensions (1200x800px recommended).')
