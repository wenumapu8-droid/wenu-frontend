#!/usr/bin/env python3
"""
Reagrupa las reps únicas de una wave (reps.json) en hojas de contacto POR CATEGORÍA,
deducida del path de origen. Reusa los thumbs ya generados (no reconvierte NEF).
Uso: python3 scripts/photo_regroup_by_cat.py <wave_name>
Salida: /tmp/wenu-audit/<wave>/by_cat/<bucket>/sheet_NN.jpg  +  index.json
"""
import sys, os, json, re, unicodedata
from PIL import Image, ImageDraw, ImageFont

WAVE = sys.argv[1]
OUT = f"/tmp/wenu-audit/{WAVE}"
reps = json.load(open(f"{OUT}/reps.json"))

def bucket(src):
    s = unicodedata.normalize('NFC', src)
    m = re.search(r'/_RAW_SOURCE/(.+)/[^/]+$', s)
    if not m:
        return "otros"
    rel = m.group(1)
    # quitar prefijo redundante "Colección 2023/" para acortar labels
    rel = rel.replace('Colección 2023/', '').replace('Colección 2023', 'Colección_2023')
    label = rel.strip().replace('/', '__').replace('\\', '').replace(' ', '_')
    label = re.sub(r'_+', '_', label).strip('_')
    return label or "otros"

buckets = {}
for i, r in enumerate(reps):
    buckets.setdefault(bucket(r['src']), []).append((i + 1, r))  # 1-indexed global PRO num

try: font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 24)
except: font = ImageFont.load_default()

cols, rows = 4, 3
cell, lbl, pad = 300, 26, 8
per = cols * rows
index = {}
for bk, items in sorted(buckets.items()):
    bdir = f"{OUT}/by_cat/{bk}"
    os.makedirs(bdir, exist_ok=True)
    os.system(f"rm -f '{bdir}'/sheet_*.jpg")
    nsheets = (len(items) + per - 1) // per
    for s in range(nsheets):
        batch = items[s * per:(s + 1) * per]
        W = cols * (cell + pad) + pad
        H = rows * (cell + lbl + pad) + pad
        sheet = Image.new("RGB", (W, H), (16, 16, 18))
        d = ImageDraw.Draw(sheet)
        for k, (pro, r) in enumerate(batch):
            rr, cc = divmod(k, cols)
            x = pad + cc * (cell + pad); y = pad + rr * (cell + lbl + pad)
            try:
                im = Image.open(r['thumb']); im.thumbnail((cell, cell))
                sheet.paste(im, (x + (cell - im.width) // 2, y + lbl + (cell - im.height) // 2))
            except Exception:
                pass
            d.text((x + 4, y + 2), f"RS-{pro:04d}", fill=(255, 205, 90), font=font)
        sheet.save(f"{bdir}/sheet_{s + 1:02d}.jpg", quality=86)
    index[bk] = {"uniques": len(items), "sheets": nsheets}
    print(f"{bk:32s} {len(items):4d} únicas · {nsheets} hojas")

json.dump(index, open(f"{OUT}/by_cat/index.json", "w"), ensure_ascii=False, indent=2)
print(f"\nTotal buckets: {len(buckets)} · index: {OUT}/by_cat/index.json")
