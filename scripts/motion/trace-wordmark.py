#!/usr/bin/env python3
"""Traza un wordmark desde una captura de pantalla y lo emite como SVG.

    python3 scripts/motion/trace-wordmark.py <png> <salida.svg> <x0> <y0> <x1> <y1>

El origen suele ser chico (un logo de ~530x70 px con trazo de 3 px). Trazar eso
directo da contornos temblorosos: el upscale con Lanczos ANTES del umbral
promedia los bordes a nivel subpíxel, así que el umbral cae sobre un borde
suave en vez de sobre una escalera de 3 px.

Cuidado con la API de potracer: su Bitmap hace `data > (255 * blacklevel)` y
después invierte. Pasarle una máscara 0/1 deja todo por debajo del umbral y
sale un rectángulo lleno. Hay que pasarle escala de grises 0-255 con la tinta
oscura, como cualquier imagen.
"""
import sys
import numpy as np
from PIL import Image, ImageOps
import potrace

src, out = sys.argv[1], sys.argv[2]
box = tuple(int(v) for v in sys.argv[3:7])
UP = 6

im = Image.open(src).convert('L').crop(box)
im = ImageOps.autocontrast(im, cutoff=1)
im = im.resize((im.width * UP, im.height * UP), Image.LANCZOS)

a = np.asarray(im, dtype=np.float32) / 255.0
thr = (a.min() + a.max()) / 2 * 0.92 + a.mean() * 0.08
# tinta a negro, papel a blanco: el formato que potracer espera
gray = np.where(a < thr, 0, 255).astype(np.uint8)
print(f"  tinta {np.mean(a < thr) * 100:.1f}%  umbral {thr:.3f}")

bmp = potrace.Bitmap(gray, blacklevel=0.5)
# turdsize limpia el grano del papel — lo hace potrace, no hace falta a mano
path = bmp.trace(turdsize=12 * UP, alphamax=1.0, opticurve=True, opttolerance=0.2)

P = lambda p: (p.x, p.y)          # _Point no es iterable en potracer
H, W = gray.shape
d, n = [], 0
for curve in path:
    n += 1
    sx, sy = P(curve.start_point)
    d.append(f"M{sx:.1f} {sy:.1f}")
    for seg in curve:
        ex, ey = P(seg.end_point)
        if seg.is_corner:
            cx, cy = P(seg.c)
            d.append(f"L{cx:.1f} {cy:.1f}L{ex:.1f} {ey:.1f}")
        else:
            x1, y1 = P(seg.c1)
            x2, y2 = P(seg.c2)
            d.append(f"C{x1:.1f} {y1:.1f} {x2:.1f} {y2:.1f} {ex:.1f} {ey:.1f}")
    d.append("Z")

svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" '
       f'style="color:#ffffff">\n<title>KODEX wordmark</title>\n'
       f'<path fill="currentColor" fill-rule="evenodd" d="{"".join(d)}"/>\n</svg>\n')
open(out, 'w').write(svg)
print(f"  {n} contornos · {W}x{H} · {len(svg) / 1024:.1f} KB → {out}")
