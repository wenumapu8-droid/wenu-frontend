#!/usr/bin/env python3
# Scan the chat uploads folder for Ocin's pink/magenta "Disco Solar" artworks.
# Ranks images by saturation + pink-hue weight; copies top candidates for review.
import glob, math, colorsys, os, shutil
from PIL import Image

UP = "/Users/user1/Library/Application Support/Claude/local-agent-mode-sessions/4814e213-bbe2-40ae-b139-8ba7b3337c45/0c515280-d897-4086-a1c6-f53a62fb974f/agent/local_ditto_0c515280-d897-4086-a1c6-f53a62fb974f/uploads"
OUT = "/Users/user1/wenu-frontend/kodex-source/pink-candidates"
os.makedirs(OUT, exist_ok=True)

def pink_score(path):
    try:
        im = Image.open(path).convert('RGB').resize((32, 32))
    except Exception:
        return None
    px = list(im.getdata()); n = len(px)
    sat = 0.0; pinkw = 0.0
    for r, g, b in px:
        h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
        sat += s
        deg = h * 360
        # pink / magenta band ~ 290..350 and hot-pink 320..340
        if s > 0.25 and v > 0.2 and (deg >= 285 or deg <= 5):
            pinkw += s
    return (sat/n, pinkw/n)

allf = glob.glob(os.path.join(UP, "*.jpg")) + glob.glob(os.path.join(UP, "*.png"))
allf.sort(key=lambda p: os.path.getmtime(p), reverse=True)
allf = allf[:500]  # most recent uploads only (this conversation)
rows = []
for f in allf:
    r = pink_score(f)
    if r is None:
        continue
    sat, pw = r
    rows.append((f, round(sat, 3), round(pw, 3)))

# rank by pink weight, then saturation
rows.sort(key=lambda x: (x[2], x[1]), reverse=True)
top = [r for r in rows if r[2] > 0.04][:40]
print("total scanned:", len(rows), "| pink candidates:", len(top))
for i, (f, sat, pw) in enumerate(top):
    dst = os.path.join(OUT, "pink-%02d.jpg" % (i + 1))
    try:
        Image.open(f).convert('RGB').save(dst, quality=90)
    except Exception:
        continue
    print("pink-%02d  sat=%.2f pink=%.2f  %s" % (i + 1, sat, pw, os.path.basename(f)))
print("copied to:", OUT)
