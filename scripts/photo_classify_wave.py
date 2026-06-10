#!/usr/bin/env python3
"""
Dedupe + contact-sheet de fotos de producto SIN clasificar del disco LaCie.
Recorre las carpetas dadas, convierte NEF→jpg thumb, dHash perceptual,
colapsa duplicados (THRESH hamming) y emite reps únicas + hojas de contacto numeradas.
Uso: python3 scripts/photo_classify_wave.py <wave_name> <folder1> [folder2 ...]
Salida: /tmp/wenu-audit/<wave_name>/{thumbs/, reps.json, sheet_NN.jpg}
"""
import sys, os, glob, json, subprocess, hashlib
from PIL import Image, ImageDraw, ImageFont

WAVE=sys.argv[1]
FOLDERS=sys.argv[2:]
OUT=f"/tmp/wenu-audit/{WAVE}"
TH=f"{OUT}/thumbs"; os.makedirs(TH, exist_ok=True)
os.system(f"rm -f {TH}/*.jpg {OUT}/sheet_*.jpg")
THRESH=6
EXT=('.jpg','.jpeg','.nef','.png','.webp','.JPG','.JPEG','.NEF','.PNG','.WEBP')

def collect():
    files=[]
    for fo in FOLDERS:
        for root,_,fs in os.walk(fo):
            for f in fs:
                if f.endswith(EXT) and not f.startswith('._'):
                    files.append(os.path.join(root,f))
    return sorted(files)

def thumb(src, dst):
    # sips reads NEF/JPG/PNG; emit 400px jpeg
    r=subprocess.run(['sips','-s','format','jpeg','-Z','400',src,'--out',dst],
                     stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return r.returncode==0 and os.path.exists(dst) and os.path.getsize(dst)>0

def dhash(path, size=8):
    try:
        im=Image.open(path).convert('L').resize((size+1,size),Image.LANCZOS)
    except: return None
    px=list(im.getdata()); bits=0; idx=0
    for r in range(size):
        for c in range(size):
            bits |= (1<<idx) if px[r*(size+1)+c] < px[r*(size+1)+c+1] else 0
            idx+=1
    return bits

def ham(a,b): return bin(a^b).count('1')

files=collect()
print(f"[{WAVE}] candidatos crudos: {len(files)}", flush=True)
reps=[]  # (hash, thumbpath, srcpath)
n=0
for src in files:
    n+=1
    h=hashlib.md5(src.encode()).hexdigest()[:10]
    dst=f"{TH}/{h}.jpg"
    if not os.path.exists(dst):
        if not thumb(src,dst): continue
    d=dhash(dst)
    if d is None: continue
    dup=False
    for rh,_,_ in reps:
        if ham(d,rh)<=THRESH: dup=True; break
    if not dup: reps.append((d,dst,src))
    if n%50==0: print(f"  ...{n}/{len(files)} procesadas, {len(reps)} únicas", flush=True)

print(f"[{WAVE}] ÚNICAS tras dedupe: {len(reps)}", flush=True)
json.dump([{'thumb':t,'src':s} for _,t,s in reps], open(f"{OUT}/reps.json","w"))

# contact sheets
try: font=ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf",26)
except: font=ImageFont.load_default()
cols,rows=4,3; cell=300; lbl=26; pad=8; per=cols*rows
for s in range((len(reps)+per-1)//per):
    batch=reps[s*per:(s+1)*per]
    Wpx=cols*(cell+pad)+pad; Hpx=rows*(cell+lbl+pad)+pad
    sheet=Image.new("RGB",(Wpx,Hpx),(16,16,18)); d=ImageDraw.Draw(sheet)
    for i,(_,t,_2) in enumerate(batch):
        r,c=divmod(i,cols); x=pad+c*(cell+pad); y=pad+r*(cell+lbl+pad)
        try:
            im=Image.open(t); im.thumbnail((cell,cell))
            sheet.paste(im,(x+(cell-im.width)//2, y+lbl+(cell-im.height)//2))
        except: pass
        d.text((x+4,y+2), f"{WAVE[:3].upper()}-{s*per+i+1:03d}", fill=(255,205,90), font=font)
    out=f"{OUT}/sheet_{s+1:02d}.jpg"; sheet.save(out,quality=86)
print(f"[{WAVE}] hojas: {(len(reps)+per-1)//per}", flush=True)
