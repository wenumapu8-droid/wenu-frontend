#!/usr/bin/env python3
# Classify KODEX archive works into 3 palette buckets: BW / GRAY / COLOR.
# Feeds the 3 themed movements of the archive (achroma / penumbra / disco solar).
import glob, math, colorsys, os
from PIL import Image

os.chdir(os.path.join(os.path.dirname(__file__), '..', 'public', 'img', 'kodex', 'archive'))
rows = []
for f in sorted(glob.glob('arch-*.jpg')):
    im = Image.open(f).convert('RGB').resize((48, 48))
    px = list(im.getdata()); n = len(px)
    sat = val = hx = hy = hw = 0.0
    for r, g, b in px:
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        sat += s; val += v
        if s > 0.15:
            hx += math.cos(h*2*math.pi)*s; hy += math.sin(h*2*math.pi)*s; hw += s
    sat /= n; val /= n
    hue = int(math.degrees(math.atan2(hy, hx)) % 360) if hw > 0 else -1
    rows.append((f.replace('.jpg', ''), round(sat, 3), round(val, 2), hue))

def bucket(s):
    return 'BW' if s < 0.07 else ('GRAY' if s < 0.16 else 'COLOR')

B = {'BW': [], 'GRAY': [], 'COLOR': []}
for f, s, v, h in rows:
    B[bucket(s)].append((f, s, h))

for k in ('BW', 'GRAY', 'COLOR'):
    print('== %s (%d) ==' % (k, len(B[k])))
    print(' '.join(f for f, s, h in B[k]))
    if k == 'COLOR':
        print('hues:', ' '.join('%s:%d' % (f, h) for f, s, h in B[k]))
