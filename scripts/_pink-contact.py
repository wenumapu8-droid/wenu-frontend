#!/usr/bin/env python3
# Contact sheet of pink candidates for visual review.
import glob, os
from PIL import Image, ImageDraw
D = "/Users/user1/wenu-frontend/kodex-source/pink-candidates"
files = sorted(glob.glob(os.path.join(D, "pink-*.jpg")))
cols, cell = 6, 300
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols*cell, rows*cell), (12, 12, 12))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB')
    im.thumbnail((cell-16, cell-40))
    x = (i % cols)*cell; y = (i // cols)*cell
    sheet.paste(im, (x+8, y+8))
    dr.text((x+8, y+cell-22), os.path.basename(f).replace('.jpg',''), fill=(230, 120, 180))
out = os.path.join(D, "_contact.jpg")
sheet.save(out, quality=82)
print(out, sheet.size)
