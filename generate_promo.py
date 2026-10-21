import os
import math
from PIL import Image, ImageDraw, ImageFont

# Output directory for thumbnails
OUTPUT_DIR = "promo_images"
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONT_PATH = "PressStart2P.ttf"

# Authentic in-game 16-bit palettes
PALETTES = {
    'cyan':   {'base': (0, 210, 255), 'hi': (128, 234, 255), 'sh': (0, 119, 182)},
    'yellow': {'base': (255, 204, 0), 'hi': (255, 234, 112), 'sh': (204, 153, 0)},
    'pink':   {'base': (255, 42, 133), 'hi': (255, 128, 183), 'sh': (179, 0, 75)},
    'green':  {'base': (0, 230, 118), 'hi': (128, 255, 189), 'sh': (0, 153, 68)},
    'orange': {'base': (255, 119, 0), 'hi': (255, 170, 85), 'sh': (179, 68, 0)},
    'purple': {'base': (157, 78, 221), 'hi': (199, 125, 255), 'sh': (90, 24, 154)},
    'red':    {'base': (255, 51, 51),  'hi': (255, 136, 136), 'sh': (170, 17, 17)},
    'blue':   {'base': (41, 121, 255), 'hi': (130, 177, 255), 'sh': (13, 71, 161)},
}

def draw_pixel_block(draw, x, y, size, color_name):
    """Draw a single 16-bit beveled pixel block."""
    p = PALETTES[color_name]
    s = int(size)
    bevel = max(2, int(s * 0.14))
    x, y = int(x), int(y)

    # Outer border
    draw.rectangle([x, y, x + s, y + s], fill=(6, 7, 10))

    # Base body
    draw.rectangle([x + bevel, y + bevel, x + s - bevel, y + s - bevel], fill=p['base'])

    # Top & Left Highlights
    draw.rectangle([x + 1, y + 1, x + s - 1, y + bevel], fill=p['hi'])
    draw.rectangle([x + 1, y + 1, x + bevel, y + s - 1], fill=p['hi'])

    # Bottom & Right Shadows
    draw.rectangle([x + 1, y + s - bevel, x + s - 1, y + s - 1], fill=p['sh'])
    draw.rectangle([x + s - bevel, y + 1, x + s - 1, y + s - 1], fill=p['sh'])

    # Specular Glint
    glint = max(2, int(bevel * 0.8))
    draw.rectangle([x + bevel + 1, y + bevel + 1, x + bevel + 1 + glint, y + bevel + 1 + glint], fill=(255, 255, 255))

def draw_shape(draw, start_x, start_y, matrix, block_size, color_name):
    """Draw a polyomino matrix shape."""
    h = len(matrix)
    w = len(matrix[0])
    for r in range(h):
        for c in range(w):
            if matrix[r][c] == 1:
                bx = start_x + c * block_size
                by = start_y + r * block_size
                draw_pixel_block(draw, bx, by, block_size, color_name)

def draw_sparkle(draw, cx, cy, size=4, color=(255, 255, 255)):
    """Draw retro pixel star sparkle."""
    s = int(size)
    draw.rectangle([cx - s, cy - s, cx + s, cy + s], fill=color)
    draw.rectangle([cx - s * 2, cy - s//2, cx + s * 2, cy + s//2], fill=color)
    draw.rectangle([cx - s//2, cy - s * 2, cx + s//2, cy + s * 2], fill=color)

def draw_background(width, height):
    """Create minimal dark vignette arcade background."""
    img = Image.new('RGB', (width, height), (12, 13, 20))
    draw = ImageDraw.Draw(img)

    # Subtle gradient rings / background glow
    cx, cy = width // 2, height // 2
    max_radius = math.hypot(width, height) / 1.4

    for r in range(int(max_radius), 0, -12):
        t = 1.0 - (r / max_radius)
        # Gradient from dark center (24, 28, 48) to dark edges (12, 13, 20)
        c_val = int(12 + 16 * t)
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(c_val, c_val + 3, c_val + 14))

    # Subtle faint grid dots
    grid_gap = 32
    for x in range(16, width, grid_gap):
        for y in range(16, height, grid_gap):
            draw.rectangle([x, y, x + 1, y + 1], fill=(26, 30, 48))

    return img, draw

# ==========================================
# 1. 512 x 512 (Square Main Thumbnail / Icon)
# ==========================================
def make_512x512():
    w, h = 512, 512
    img, draw = draw_background(w, h)

    # Shapes arrangement in center
    bs = 36
    # 2x2 Yellow
    draw_shape(draw, 140, 240, [[1, 1], [1, 1]], bs, 'yellow')
    # T-shape Cyan
    draw_shape(draw, 212, 240, [[1, 1, 1], [0, 1, 0]], bs, 'cyan')
    # L-shape Pink
    draw_shape(draw, 284, 204, [[1, 0], [1, 0], [1, 1]], bs, 'pink')
    # Plus Green
    draw_shape(draw, 70, 312, [[0, 1, 0], [1, 1, 1], [0, 1, 0]], bs, 'green')
    # Line Orange
    draw_shape(draw, 248, 348, [[1, 1, 1]], bs, 'orange')
    # Purple corner
    draw_shape(draw, 176, 384, [[1, 0], [1, 1]], bs, 'purple')

    # Sparkles
    draw_sparkle(draw, 120, 210, 4, (255, 255, 255))
    draw_sparkle(draw, 390, 220, 5, (0, 240, 255))
    draw_sparkle(draw, 370, 380, 4, (255, 190, 11))
    draw_sparkle(draw, 90, 440, 3, (255, 0, 127))

    # Title Typography
    font_large = ImageFont.truetype(FONT_PATH, 34)
    font_sub = ImageFont.truetype(FONT_PATH, 14)

    title = "PIXEL BLAST"
    sub = "BLOCK PUZZLE"

    # Draw shadow
    draw.text((w // 2 + 3, 90 + 3), title, font=font_large, fill=(0, 0, 0), anchor="mm")
    draw.text((w // 2, 90), title, font=font_large, fill=(0, 240, 255), anchor="mm")

    draw.text((w // 2 + 2, 135 + 2), sub, font=font_sub, fill=(0, 0, 0), anchor="mm")
    draw.text((w // 2, 135), sub, font=font_sub, fill=(255, 190, 11), anchor="mm")

    path = os.path.join(OUTPUT_DIR, "512x512.jpg")
    img.save(path, "JPEG", quality=95)
    print(f"Saved: {path}")

# ==========================================
# 2. 512 x 384 (4:3 Main Thumbnail)
# ==========================================
def make_512x384():
    w, h = 512, 384
    img, draw = draw_background(w, h)

    bs = 30
    # Left side colorful shapes
    draw_shape(draw, 60, 170, [[1, 1], [1, 1]], bs, 'cyan')
    draw_shape(draw, 120, 140, [[0, 1], [0, 1], [1, 1]], bs, 'pink')
    draw_shape(draw, 180, 200, [[1, 1, 1], [0, 1, 0]], bs, 'yellow')
    draw_shape(draw, 270, 170, [[1, 1], [1, 1]], bs, 'green')
    draw_shape(draw, 330, 200, [[1, 0], [1, 0], [1, 1]], bs, 'purple')
    draw_shape(draw, 210, 260, [[1, 1, 1, 1]], bs, 'orange')

    # Sparkles
    draw_sparkle(draw, 50, 130, 4, (255, 255, 255))
    draw_sparkle(draw, 420, 170, 5, (0, 240, 255))
    draw_sparkle(draw, 150, 310, 3, (255, 190, 11))
    draw_sparkle(draw, 380, 290, 4, (255, 0, 127))

    # Title
    font_large = ImageFont.truetype(FONT_PATH, 30)
    font_sub = ImageFont.truetype(FONT_PATH, 12)

    title = "PIXEL BLAST"
    sub = "BLOCK PUZZLE"

    draw.text((w // 2 + 3, 65 + 3), title, font=font_large, fill=(0, 0, 0), anchor="mm")
    draw.text((w // 2, 65), title, font=font_large, fill=(0, 240, 255), anchor="mm")

    draw.text((w // 2 + 2, 105 + 2), sub, font=font_sub, fill=(0, 0, 0), anchor="mm")
    draw.text((w // 2, 105), sub, font=font_sub, fill=(255, 190, 11), anchor="mm")

    path = os.path.join(OUTPUT_DIR, "512x384.jpg")
    img.save(path, "JPEG", quality=95)
    print(f"Saved: {path}")

# ==========================================
# 3. 200 x 120 (Small Thumbnail)
# ==========================================
def make_200x120():
    w, h = 200, 120
    img, draw = draw_background(w, h)

    bs = 16
    # Bold minimal shapes
    draw_shape(draw, 22, 56, [[1, 1], [1, 1]], bs, 'cyan')
    draw_shape(draw, 54, 56, [[1, 1, 1], [0, 1, 0]], bs, 'yellow')
    draw_shape(draw, 102, 40, [[1, 0], [1, 0], [1, 1]], bs, 'pink')
    draw_shape(draw, 134, 56, [[1, 1, 1]], bs, 'green')

    draw_sparkle(draw, 18, 38, 2, (255, 255, 255))
    draw_sparkle(draw, 175, 50, 3, (0, 240, 255))

    font = ImageFont.truetype(FONT_PATH, 13)
    title = "PIXEL BLAST"

    draw.text((w // 2 + 2, 22 + 2), title, font=font, fill=(0, 0, 0), anchor="mm")
    draw.text((w // 2, 22), title, font=font, fill=(0, 240, 255), anchor="mm")

    path = os.path.join(OUTPUT_DIR, "200x120.jpg")
    img.save(path, "JPEG", quality=95)
    print(f"Saved: {path}")

# ==========================================
# 4. 1280 x 720 (16:9 Hero Banner)
# ==========================================
def make_1280x720():
    w, h = 1280, 720
    img, draw = draw_background(w, h)

    # Left: Typography & branding
    font_hero = ImageFont.truetype(FONT_PATH, 58)
    font_sub = ImageFont.truetype(FONT_PATH, 24)
    font_tag = ImageFont.truetype(FONT_PATH, 16)

    title = "PIXEL BLAST"
    sub = "16-BIT BLOCK PUZZLE"
    tag = "CLEAR ROWS * COMBO STREAKS * HIGH SCORES"

    lx = 110
    draw.text((lx + 4, 250 + 4), title, font=font_hero, fill=(0, 0, 0))
    draw.text((lx, 250), title, font=font_hero, fill=(0, 240, 255))

    draw.text((lx + 3, 335 + 3), sub, font=font_sub, fill=(0, 0, 0))
    draw.text((lx, 335), sub, font=font_sub, fill=(255, 190, 11))

    draw.text((lx + 2, 400 + 2), tag, font=font_tag, fill=(0, 0, 0))
    draw.text((lx, 400), tag, font=font_tag, fill=(0, 255, 102))

    # Right: Large game board composition with blocks
    bs = 48
    rx = 760
    ry = 140

    # Draw mini retro grid frame
    gw = bs * 8
    draw.rectangle([rx - 10, ry - 10, rx + gw + 10, ry + gw + 10], fill=(28, 31, 51))
    draw.rectangle([rx, ry, rx + gw, ry + gw], fill=(14, 16, 28))

    # Empty cells sockets
    for r in range(8):
        for c in range(8):
            draw.rectangle([rx + c * bs + 2, ry + r * bs + 2, rx + (c + 1) * bs - 2, ry + (r + 1) * bs - 2], fill=(20, 23, 36))

    # Fill some blocks in board
    draw_shape(draw, rx + 0 * bs, ry + 5 * bs, [[1, 1], [1, 1]], bs, 'cyan')
    draw_shape(draw, rx + 2 * bs, ry + 6 * bs, [[1, 1, 1]], bs, 'yellow')
    draw_shape(draw, rx + 5 * bs, ry + 5 * bs, [[1, 1, 1], [0, 1, 0]], bs, 'pink')
    draw_shape(draw, rx + 1 * bs, ry + 2 * bs, [[1, 0], [1, 0], [1, 1]], bs, 'green')
    draw_shape(draw, rx + 4 * bs, ry + 1 * bs, [[1, 1, 1, 1]], bs, 'orange')
    draw_shape(draw, rx + 6 * bs, ry + 2 * bs, [[1, 1], [1, 0]], bs, 'purple')

    # Sparkles & Burst Particles
    draw_sparkle(draw, rx - 30, ry + 200, 7, (255, 255, 255))
    draw_sparkle(draw, rx + gw + 40, ry + 100, 8, (0, 240, 255))
    draw_sparkle(draw, rx + 200, ry - 40, 6, (255, 190, 11))
    draw_sparkle(draw, 350, 520, 6, (255, 0, 127))

    path = os.path.join(OUTPUT_DIR, "1280x720.jpg")
    img.save(path, "JPEG", quality=95)
    print(f"Saved: {path}")

# ==========================================
# 5. 1280 x 550 (Minimal Marketing Banner)
# ==========================================
def make_1280x550():
    w, h = 1280, 550
    img, draw = draw_background(w, h)

    # Left Title
    font_hero = ImageFont.truetype(FONT_PATH, 54)
    font_sub = ImageFont.truetype(FONT_PATH, 20)

    title = "PIXEL BLAST"
    sub = "MINIMAL RETRO BLOCK PUZZLE"

    lx = 100
    draw.text((lx + 4, 210 + 4), title, font=font_hero, fill=(0, 0, 0))
    draw.text((lx, 210), title, font=font_hero, fill=(0, 240, 255))

    draw.text((lx + 2, 290 + 2), sub, font=font_sub, fill=(0, 0, 0))
    draw.text((lx, 290), sub, font=font_sub, fill=(255, 190, 11))

    # Right side: Floating minimal polyomino blocks
    bs = 44
    draw_shape(draw, 750, 120, [[1, 1], [1, 1]], bs, 'yellow')
    draw_shape(draw, 880, 180, [[1, 1, 1], [0, 1, 0]], bs, 'cyan')
    draw_shape(draw, 1050, 100, [[1, 0], [1, 0], [1, 1]], bs, 'pink')
    draw_shape(draw, 720, 310, [[0, 1, 0], [1, 1, 1], [0, 1, 0]], bs, 'green')
    draw_shape(draw, 900, 360, [[1, 1, 1, 1]], bs, 'orange')
    draw_shape(draw, 1080, 300, [[1, 1], [1, 1]], bs, 'purple')

    # Sparkles
    draw_sparkle(draw, 700, 150, 6, (255, 255, 255))
    draw_sparkle(draw, 1000, 280, 7, (0, 240, 255))
    draw_sparkle(draw, 1200, 180, 5, (255, 190, 11))
    draw_sparkle(draw, 450, 380, 5, (255, 0, 127))

    path = os.path.join(OUTPUT_DIR, "1280x550.jpg")
    img.save(path, "JPEG", quality=95)
    print(f"Saved: {path}")

if __name__ == "__main__":
    print("Generating GameDistribution promotional thumbnails...")
    make_512x512()
    make_512x384()
    make_200x120()
    make_1280x720()
    make_1280x550()
    print("All thumbnails generated successfully!")
