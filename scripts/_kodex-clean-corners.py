#!/usr/bin/env python3
# Remove the small pattern fragments that leak into the 4 CORNERS of the B/W
# ring works (export artifacts) by filling black corner triangles. The ring
# fills the cardinal edges but the corners are empty → safe, never touches art.
# Source = pristine originals in kodex-source/bw-raw; output → public works.
import glob, os
from PIL import Image, ImageDraw

SRC = '/Users/user1/wenu-frontend/kodex-source/bw-raw'
OUT = '/Users/user1/wenu-frontend/public/img/kodex/works'
LEG_FRAC = 0.14   # corner triangle leg as fraction of side (safe: ring is centred)

for src in sorted(glob.glob(SRC + '/bw-*.jpg')):
    name = os.path.basename(src)
    im = Image.open(src).convert('RGB')
    w, h = im.size
    L = int(min(w, h) * LEG_FRAC)
    d = ImageDraw.Draw(im)
    black = (0, 0, 0)
    d.polygon([(0, 0), (L, 0), (0, L)], fill=black)                 # top-left
    d.polygon([(w, 0), (w - L, 0), (w, L)], fill=black)             # top-right
    d.polygon([(0, h), (L, h), (0, h - L)], fill=black)             # bottom-left
    d.polygon([(w, h), (w - L, h), (w, h - L)], fill=black)         # bottom-right
    im.save(os.path.join(OUT, name), quality=92)
    print('cleaned', name, f'{w}x{h} leg={L}')
print('done')
