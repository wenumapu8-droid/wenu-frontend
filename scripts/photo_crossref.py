#!/usr/bin/env python3
"""
photo_crossref.py — Cruza el manifiesto del disco contra el catálogo NocoDB.

Lee:
  /tmp/wenu-audit/manifest.json  (fotos editadas en disco, con pista de SKU)
  /tmp/wenu-audit/catalog.json   (piezas NocoDB + estado de foto)

Produce:
  /tmp/wenu-audit/crossref.json  — por SKU: fotos en disco disponibles
  imprime:
    A) SKUs que NECESITAN foto y SÍ tienen macro editada en disco (ganancias directas)
    B) SKUs que necesitan foto y NO hay match por nombre (requieren match visual)
    C) macros editadas sin SKU (DSC_*, candidatas a match visual)
Solo lectura.
"""
import json
from collections import defaultdict

man = json.load(open("/tmp/wenu-audit/manifest.json"))
cat = json.load(open("/tmp/wenu-audit/catalog.json"))

# index disco por SKU
disk_by_sku = defaultdict(list)
untagged = []
for m in man:
    if m.get("error"):
        continue
    if m.get("sku"):
        disk_by_sku[m["sku"]].append(m)
    else:
        untagged.append(m)

cat_by_sku = {c["sku"]: c for c in cat if c.get("sku")}
needy = [c for c in cat if c["estado"] == "RAW" and c["photo"] in ("VACIA", "NEF_ONLY")]
needy_skus = {c["sku"] for c in needy}

A, B = [], []
for c in sorted(needy, key=lambda x: x["sku"] or ""):
    hits = disk_by_sku.get(c["sku"], [])
    if hits:
        views = sorted({h.get("view") or "?" for h in hits})
        best = max(hits, key=lambda h: h.get("w", 0) * h.get("h", 0))
        A.append((c, hits, views, best))
    else:
        B.append(c)

crossref = {
    "needy_with_disk_macro": [{
        "sku": c["sku"], "title": c["title"], "tipo": c["tipo"],
        "n_files": len(hits), "views": views,
        "files": [{"rel": h["rel"], "view": h.get("view"), "w": h.get("w"), "h": h.get("h"), "source": h["source"]} for h in hits],
    } for (c, hits, views, best) in A],
    "needy_no_match": [{"sku": c["sku"], "title": c["title"], "tipo": c["tipo"], "photo": c["photo"]} for c in B],
    "untagged_edited": [{"rel": u["rel"], "file": u["file"], "source": u["source"], "w": u.get("w"), "h": u.get("h")} for u in untagged],
}
json.dump(crossref, open("/tmp/wenu-audit/crossref.json", "w"), ensure_ascii=False, indent=1)

print(f"=== A) RAW que NECESITA foto y SÍ tiene macro editada en disco: {len(A)} ===")
for (c, hits, views, best) in A:
    print(f"  {c['sku']:12s} {','.join(views):28s} ({len(hits)} archivos)  {c['title']}")
print(f"\n=== B) RAW que necesita foto y NO hay match por nombre: {len(B)} ===")
for c in B:
    print(f"  {c['sku']:12s} [{c['photo']:8s}] {c['title']}")
print(f"\n=== C) macros editadas SIN SKU (candidatas a match visual): {len(untagged)} ===")
bysrc = defaultdict(int)
for u in untagged:
    bysrc[u["source"]] += 1
for s, n in sorted(bysrc.items(), key=lambda x: -x[1]):
    print(f"  {s:14s} {n}")
print(f"\ncrossref → /tmp/wenu-audit/crossref.json")
