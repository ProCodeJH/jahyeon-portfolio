"""Generate PWA icons at various sizes from base image."""
from PIL import Image
import os

# Paths
BASE_IMAGE = r"C:\Users\yoonjae\.gemini\antigravity\brain\81a48bc4-db3d-46c1-8966-6fe99c56a6b5\pwa_icon_base_1768355278330.png"
OUTPUT_DIR = r"c:\Users\yoonjae\Desktop\jahyeon-portfolio\client\public\icons"

# Icon sizes required by manifest.json
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def generate_icons():
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Open base image
    with Image.open(BASE_IMAGE) as img:
        # Convert to RGBA if needed
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        for size in SIZES:
            # High-quality resize using LANCZOS
            resized = img.resize((size, size), Image.LANCZOS)
            
            # Save as PNG
            output_path = os.path.join(OUTPUT_DIR, f"icon-{size}x{size}.png")
            resized.save(output_path, 'PNG', optimize=True)
            print(f"Created: icon-{size}x{size}.png")
    
    print(f"\n✅ All {len(SIZES)} icons generated successfully!")

if __name__ == "__main__":
    generate_icons()
