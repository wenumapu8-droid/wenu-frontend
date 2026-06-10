#!/usr/bin/env python3
"""
photo_error_triage.py — Tría la carpeta _ERROR (872 imgs JPG/HEIC/PNG).

Hashea, descarta lo que ya es duplicado perceptual de (a) una macro con SKU ya
cargada y (b) las 171 macros únicas ya revisadas en la pasada anterior. Colapsa
near-dupes entre sí. Deja SOLO candidatos NUEVOS de producto para revisar.

Salida:
  /tmp/wenu-audit/error_unique.json
  /tmp/wenu-audit/error_match/NNN.jpg  (thumbnails 420px)
Solo lectura sobre el disco (sips escribe thumbnails en /tmp).
"""
import json, os, subprocess
from PIL import Image

INV = "/Volumes/LaCie/Wenu mapu/WenuMapu/📸 _INVENTARIO_FOTOS"
ERR = f"{INV}/_ERROR"
THRESH = 6
EXT = (".jpg", ".jpeg", ".png")  # HEIC no lo abre PIL; se convierte aparte si hace falta

man = json.load(open("/tmp/wenu-audit/manifest.json"))
prev = json.load(open("/tmp/wenu-audit/unique_untagged.json"))

def pc(x): return bin(x).count("1")

def dhash(img, size=8):
    g = img.convert("L").resize((size + 1, size), Image.LANCZOS)
    px = list(g.getdata())
    bits = 0
    for row in range(size):
        for col in range(size):
            l = px[row*(size+1)+col]; r = px[row*(size+1)+col+1]
            bits = (bits << 1) | (1 if l > r else 0)
    return bits

# hashes a evitar: macros con SKU + las 171 ya revisadas
avoid = [int(m["dhash"],16) for m in man if m.get("sku") and m.get("dhash")]
avoid += [int(m["dhash"],16) for m in prev if m.get("dhash")]

def is_known(h):
    return any(pc(h ^ a) <= THRESH for a in avoid)

# hashear _ERROR
records = []
for dp, _, files in os.walk(ERR):
    for fn in files:
        if not fn.lower().endswith(EXT):
            continue
        full = os.path.join(dp, fn)
        try:
            with Image.open(full) as im:
                w, h = im.size
                hh = dhash(im)
            records.append({"path": full, "file": fn, "w": w, "h": h, "dhash": format(hh,"016x")})
        except Exception:
            pass

# quitar conocidos
new = [r for r in records if not is_known(int(r["dhash"],16))]

# colapsar near-dupes entre los nuevos → mayor resolución
used = [False]*len(new); reps = []
for i in range(len(new)):
    if used[i]: continue
    hi = int(new[i]["dhash"],16); cluster=[new[i]]; used[i]=True
    for j in range(i+1,len(new)):
        if used[j]: continue
        if pc(hi ^ int(new[j]["dhash"],16)) <= THRESH:
            cluster.append(new[j]); used[j]=True
    rep = max(cluster, key=lambda m:m["w"]*m["h"]); rep=dict(rep); rep["cluster_size"]=len(cluster)
    reps.append(rep)

reps.sort(key=lambda m:-(m["w"]*m["h"]))
json.dump(reps, open("/tmp/wenu-audit/error_unique.json","w"), ensure_ascii=False, indent=1)

out="/tmp/wenu-audit/error_match"; os.makedirs(out, exist_ok=True)
for f in os.listdir(out): os.remove(os.path.join(out,f))
for n,m in enumerate(reps,1):
    subprocess.run(["sips","-Z","420",m["path"],"--out",os.path.join(out,f"{n:03d}.jpg")],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print(f"_ERROR escaneadas (JPG/PNG): {len(records)}")
print(f"tras quitar dupes de producto cargado + 171 ya vistas: {len(new)}")
print(f"candidatos NUEVOS unicos: {len(reps)}")
print(f"thumbnails: /tmp/wenu-audit/error_match/  · json: error_unique.json")
