#!/usr/bin/env python3
"""
photo_reduce.py — Reduce las 212 macros sin SKU a representantes ÚNICOS.

Quita: (a) las que son duplicado perceptual de una macro YA etiquetada con SKU
(= copias de productos ya cargados), (b) colapsa near-dupes entre sí dejando la
de mayor resolución. Genera thumbnails para revisión visual.

Salida:
  /tmp/wenu-audit/unique_untagged.json
  /tmp/wenu-audit/match/NN_<file>.jpg   (thumbnails 420px para Read)
Solo lectura sobre el disco; escribe thumbnails en /tmp.
"""
import json, os, subprocess
from collections import defaultdict

man = json.load(open("/tmp/wenu-audit/manifest.json"))
THRESH = 6

def pc(x): return bin(x).count("1")

tagged = [int(m["dhash"],16) for m in man if m.get("sku") and m.get("dhash")]
untag  = [m for m in man if not m.get("sku") and m.get("dhash")]

def is_dupe_of_tagged(h):
    for t in tagged:
        if pc(h ^ t) <= THRESH:
            return True
    return False

# 1) quitar copias de productos ya cargados
candidates = [m for m in untag if not is_dupe_of_tagged(int(m["dhash"],16))]

# 2) colapsar near-dupes entre candidatos → representante de mayor resolución
used = [False]*len(candidates)
reps = []
for i in range(len(candidates)):
    if used[i]: continue
    hi = int(candidates[i]["dhash"],16)
    cluster = [candidates[i]]
    used[i] = True
    for j in range(i+1,len(candidates)):
        if used[j]: continue
        if pc(hi ^ int(candidates[j]["dhash"],16)) <= THRESH:
            cluster.append(candidates[j]); used[j]=True
    rep = max(cluster, key=lambda m:(m.get("w",0)*m.get("h",0)))
    rep = dict(rep); rep["cluster_size"]=len(cluster)
    reps.append(rep)

reps.sort(key=lambda m:(m["source"], m["file"]))
json.dump(reps, open("/tmp/wenu-audit/unique_untagged.json","w"), ensure_ascii=False, indent=1)

# 3) thumbnails
out="/tmp/wenu-audit/match"; os.makedirs(out, exist_ok=True)
for f in os.listdir(out):
    os.remove(os.path.join(out,f))
for n,m in enumerate(reps,1):
    dst=os.path.join(out, f"{n:03d}.jpg")
    subprocess.run(["sips","-Z","420",m["path"],"--out",dst],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

print(f"untag totales: {len(untag)}")
print(f"tras quitar copias de productos ya cargados: {len(candidates)}")
print(f"representantes ÚNICOS a revisar: {len(reps)}")
print("\nindice (n -> archivo, fuente, cluster):")
for n,m in enumerate(reps,1):
    print(f"  {n:03d}  {m['source']:10s} c{m['cluster_size']:<2} {m['file'][:54]}")
print(f"\nthumbnails en /tmp/wenu-audit/match/  · json: unique_untagged.json")
