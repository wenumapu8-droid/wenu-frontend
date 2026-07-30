#!/usr/bin/env python3
# Extract COMPLETE artworks from the KODEX Behance PDF — never crop.
# Outputs: full embedded artwork bitmaps + full page renders (for study).
import fitz, os, glob, hashlib
from PIL import Image

PDF = os.path.expanduser('~/.hermes/cache/documents/doc_c95df21a7d2a_KODEX_∞_Arquitecturas_Tecno_Tribales_Behance_compressed.pdf')
OUT = '/Users/user1/wenu-frontend/public/img/kodex'
PAGES = OUT + '/pdf-pages'
ART = OUT + '/art-full'
os.makedirs(PAGES, exist_ok=True); os.makedirs(ART, exist_ok=True)

doc = fitz.open(PDF)
print('pages', doc.page_count)

# 1) render each page at 2x for study
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    pix.save(f'{PAGES}/p{i+1:02d}.png')

# 2) extract embedded images (the raw complete artworks), dedup by xref, keep big ones
seen = set(); saved = []
for i, page in enumerate(doc):
    for img in page.get_images(full=True):
        xref = img[0]
        if xref in seen: continue
        seen.add(xref)
        d = doc.extract_image(xref)
        w, h = d.get('width', 0), d.get('height', 0)
        if w < 500 or h < 500:  # skip tiny/ui bits
            continue
        ext = d['ext']
        fn = f'{ART}/img-p{i+1:02d}-x{xref}-{w}x{h}.{ext}'
        with open(fn, 'wb') as f:
            f.write(d['image'])
        saved.append((i+1, xref, w, h, ext))

print('artworks extracted:', len(saved))
for s in saved:
    print('  p%02d xref%s %dx%d .%s' % s)

# 3) study contact sheet of extracted artworks
files = sorted(glob.glob(ART + '/*'))
if files:
    cols = 4; tw = 300; th = 300; pad = 10
    rows = (len(files) + cols - 1) // cols
    sheet = Image.new('RGB', (cols*(tw+pad)+pad, rows*(th+pad)+pad), (16,16,16))
    from PIL import ImageDraw
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(files):
        try:
            im = Image.open(f).convert('RGB'); im.thumbnail((tw, th))
        except Exception:
            continue
        x = pad + (i % cols)*(tw+pad); y = pad + (i//cols)*(th+pad)
        sheet.paste(im, (x, y))
        d.text((x+3, y+3), os.path.basename(f)[:26], fill=(240,200,80))
    sheet.save(OUT + '/_art_contact.png')
    print('contact ->', OUT + '/_art_contact.png')
