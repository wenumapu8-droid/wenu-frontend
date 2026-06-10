#!/usr/bin/env python3
"""Arma contact sheets numerados de /tmp/wenu-audit/match/*.jpg para revisión visual rápida."""
import os, glob
from PIL import Image, ImageDraw, ImageFont

SRC = "/tmp/wenu-audit/match"
OUT = "/tmp/wenu-audit/sheets"
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(f"{OUT}/*.jpg"):
    os.remove(f)

files = sorted(glob.glob(f"{SRC}/*.jpg"))
COLS, ROWS = 5, 4
CELL, PAD, LBL = 240, 8, 18
per = COLS * ROWS
try:
    font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 22)
except Exception:
    font = ImageFont.load_default()

def cell_img(path):
    bg = Image.new("RGB", (CELL, CELL + LBL), (20, 20, 20))
    try:
        im = Image.open(path).convert("RGB")
        im.thumbnail((CELL, CELL))
        bg.paste(im, ((CELL - im.width) // 2, LBL + (CELL - im.height) // 2))
    except Exception:
        pass
    return bg

sheets = 0
for s in range(0, len(files), per):
    chunk = files[s:s + per]
    W = COLS * (CELL + PAD) + PAD
    H = ROWS * (CELL + LBL + PAD) + PAD
    sheet = Image.new("RGB", (W, H), (0, 0, 0))
    d = ImageDraw.Draw(sheet)
    for i, path in enumerate(chunk):
        r, c = divmod(i, COLS)
        x = PAD + c * (CELL + PAD)
        y = PAD + r * (CELL + LBL + PAD)
        sheet.paste(cell_img(path), (x, y))
        n = os.path.basename(path).split(".")[0]  # '001'
        d.text((x + 4, y + 2), n, fill=(255, 220, 0), font=font)
    sheets += 1
    sheet.save(f"{OUT}/sheet_{sheets:02d}.jpg", quality=82)
    print(f"sheet_{sheets:02d}.jpg  ({len(chunk)} imgs: {os.path.basename(chunk[0]).split('.')[0]}–{os.path.basename(chunk[-1]).split('.')[0]})")
print(f"\n{sheets} hojas en {OUT}/")
