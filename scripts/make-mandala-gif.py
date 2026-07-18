#!/usr/bin/env python3
"""
Build a seamless spinning-mandala GIF for the Wenu Mapu welcome email.
Source: public/img/portal-mandala-white.png (white mandala on transparent).
Output: public/img/email/mandala-spin.gif  (ember/gold on obsidian, loop).

No external deps beyond Pillow. Palette: obsidian #0a0a0a, ember #c9a84c.
"""
from PIL import Image
import os

SRC = "/Users/user1/wenu-frontend/public/img/portal-mandala-white.png"
OUT_DIR = "/Users/user1/wenu-frontend/public/img/email"
OUT = os.path.join(OUT_DIR, "mandala-spin.gif")

os.makedirs(OUT_DIR, exist_ok=True)

OBSIDIAN = (10, 10, 10)      # #0a0a0a
EMBER    = (201, 168, 76)    # #c9a84c

SIZE   = 300     # final canvas px (keeps file small, retina via 2x display width)
FRAMES = 36      # 10deg steps -> smooth + seamless full turn
DUR    = 90      # ms per frame -> ~3.2s per revolution, calm ritual pace

# Load mandala, use its alpha as a mask, recolor to ember.
mandala = Image.open(SRC).convert("RGBA")
# Work at 2x for crisp downscale/antialiasing on rotation.
work = SIZE * 3
mandala = mandala.resize((work, work), Image.LANCZOS)
alpha = mandala.split()[-1]

# Solid ember plate, punched by the mandala alpha -> ember mandala on transparent.
ember_plate = Image.new("RGBA", (work, work), EMBER + (0,))
ember_plate.putalpha(alpha)

frames = []
for i in range(FRAMES):
    ang = 360.0 * i / FRAMES
    rot = ember_plate.rotate(ang, resample=Image.BICUBIC, expand=False)
    # Composite over obsidian, then downscale.
    canvas = Image.new("RGBA", (work, work), OBSIDIAN + (255,))
    canvas.alpha_composite(rot)
    frame = canvas.convert("RGB").resize((SIZE, SIZE), Image.LANCZOS)
    # Quantize to a tight palette for small GIF size.
    frame = frame.quantize(colors=32, method=Image.MEDIANCUT, dither=Image.NONE)
    frames.append(frame)

frames[0].save(
    OUT,
    save_all=True,
    append_images=frames[1:],
    duration=DUR,
    loop=0,
    optimize=True,
    disposal=1,
)
sz = os.path.getsize(OUT)
print(f"WROTE {OUT}  {sz/1024:.1f} KB  {FRAMES} frames @ {SIZE}px")
