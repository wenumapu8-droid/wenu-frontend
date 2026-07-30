#!/usr/bin/env python3
# Crop the thin app-UI bars (top title bar + bottom home indicator) off the
# two screenshots in family 011 (arch-30, arch-31). The star artwork is
# full-bleed and centred; trimming ~8% top/bottom removes UI, keeps the art.
from PIL import Image
import os
BASE = '/Users/user1/wenu-frontend/public/img/kodex/archive'
for n in (30, 31):
    p = os.path.join(BASE, 'arch-%02d.jpg' % n)
    im = Image.open(p).convert('RGB')
    w, h = im.size
    top = int(h * 0.085)
    bot = int(h * 0.085)
    im.crop((0, top, w, h - bot)).save(p, quality=92)
    print('cropped arch-%02d %dx%d -> keep y[%d:%d]' % (n, w, h, top, h - bot))
print('done')
