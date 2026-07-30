#!/usr/bin/env python3
# For each family, order members by mean saturation (B/W = lowest first = cover).
from PIL import Image
import os
BASE = '/Users/user1/wenu-frontend/public/img/kodex/archive'
fams = {'001':[1,2,3,7],'002':[4,5,6],'003':[8,10,12,13,14],'004':[15,24],
        '005':[16,17,18],'006':[19,20,28,38,39],'007':[21,23],'008':[25,26],
        '009':[32,33],'010':[27,29,34,35],'011':[30,31],'012':[36,37]}
def sat(n):
    im = Image.open(os.path.join(BASE, 'arch-%02d.jpg' % n)).convert('HSV').resize((64, 64))
    px = list(im.getdata())
    return sum(p[1] for p in px) / len(px)
for k, mem in fams.items():
    scored = sorted(mem, key=sat)
    print(k, '->', ','.join(str(n) for n in scored), '  sat:', ['%02d=%d' % (n, int(sat(n))) for n in scored])
