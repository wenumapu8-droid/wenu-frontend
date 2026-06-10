#!/usr/bin/env python3
"""
photo_audit.py — Manifiesto + dedup de fotos de producto EDITADAS en el disco LaCie.

Camina las carpetas curadas (editadas / casi-listas), parsea pistas de SKU,
registra dimensiones/peso y calcula un perceptual hash (dHash 64-bit) para
detectar duplicados (caos de IA + repetidos del clasificador).

Salida:
  /tmp/wenu-audit/manifest.json   — un registro por imagen
  /tmp/wenu-audit/dupes.json      — grupos de duplicados (hamming <= THRESH)
  imprime resumen al stdout.

Solo lectura. No mueve ni borra nada.
"""
import os, re, json, hashlib, sys
from PIL import Image

INV = "/Volumes/LaCie/Wenu mapu/WenuMapu/📸 _INVENTARIO_FOTOS"
WCR = "/Volumes/LaCie/Wenu mapu/WenuMapu/📦 _WOOCOMMERCE_READY"

# (ruta, etiqueta_fuente, confianza) — confianza alta = curada/editada lista
ROOTS = [
    (f"{INV}/_PROCESADOS",        "procesados", "alta"),
    (f"{INV}/_REVISAR",           "revisar",    "media"),
    (f"{INV}/_NUEVOS",            "nuevos",     "media"),
    (f"{INV}/_PARA_MEJORAR",      "mejorar",    "media"),
    (f"{INV}/HAN",                "tipo",       "media"),
    (f"{INV}/LAB",                "tipo",       "media"),
    (f"{INV}/PLG",                "tipo",       "media"),
    (f"{INV}/RNG",                "tipo",       "media"),
    (f"{INV}/SEP",                "tipo",       "media"),
    (f"{INV}/Imagenes_Producto",  "img_prod",   "media"),
    (WCR,                          "wc_ready",   "alta"),
]

EXT = (".jpg", ".jpeg", ".png", ".webp")
SKU_RE = re.compile(r"(W[MN]-[A-Z]{2,3}-\d{2,3})", re.I)
VIEW_RE = re.compile(r"_(front|back|detail|macro|alt|side|web)\b", re.I)

def dhash(img, size=8):
    g = img.convert("L").resize((size + 1, size), Image.LANCZOS)
    px = list(g.getdata())
    bits = 0
    idx = 0
    for row in range(size):
        for col in range(size):
            left = px[row * (size + 1) + col]
            right = px[row * (size + 1) + col + 1]
            bits = (bits << 1) | (1 if left > right else 0)
            idx += 1
    return bits

def popcount(x):
    return bin(x).count("1")

def main():
    os.makedirs("/tmp/wenu-audit", exist_ok=True)
    records = []
    seen_paths = set()
    for root, source, conf in ROOTS:
        if not os.path.isdir(root):
            continue
        for dirpath, _, files in os.walk(root):
            for fn in files:
                if not fn.lower().endswith(EXT):
                    continue
                full = os.path.join(dirpath, fn)
                if full in seen_paths:
                    continue
                seen_paths.add(full)
                rel = os.path.relpath(full, "/Volumes/LaCie/Wenu mapu/WenuMapu")
                sku_m = SKU_RE.search(fn) or SKU_RE.search(dirpath)
                sku = sku_m.group(1).upper() if sku_m else None
                view_m = VIEW_RE.search(fn)
                view = view_m.group(1).lower() if view_m else None
                rec = {
                    "path": full, "rel": rel, "file": fn,
                    "source": source, "conf": conf,
                    "sku": sku, "view": view,
                }
                try:
                    st = os.stat(full)
                    rec["bytes"] = st.st_size
                    with Image.open(full) as im:
                        rec["w"], rec["h"] = im.size
                        rec["dhash"] = format(dhash(im), "016x")
                except Exception as e:
                    rec["error"] = str(e)[:80]
                records.append(rec)
    with open("/tmp/wenu-audit/manifest.json", "w") as f:
        json.dump(records, f, ensure_ascii=False, indent=1)

    # dedup por dhash (hamming <= THRESH)
    THRESH = 6
    hashed = [r for r in records if r.get("dhash")]
    used = [False] * len(hashed)
    groups = []
    for i in range(len(hashed)):
        if used[i]:
            continue
        hi = int(hashed[i]["dhash"], 16)
        grp = [i]
        used[i] = True
        for j in range(i + 1, len(hashed)):
            if used[j]:
                continue
            if popcount(hi ^ int(hashed[j]["dhash"], 16)) <= THRESH:
                grp.append(j)
                used[j] = True
        if len(grp) > 1:
            groups.append([{
                "rel": hashed[k]["rel"], "file": hashed[k]["file"],
                "source": hashed[k]["source"], "sku": hashed[k]["sku"],
                "w": hashed[k].get("w"), "h": hashed[k].get("h"),
                "bytes": hashed[k].get("bytes"),
            } for k in grp])
    groups.sort(key=len, reverse=True)
    with open("/tmp/wenu-audit/dupes.json", "w") as f:
        json.dump(groups, f, ensure_ascii=False, indent=1)

    # resumen
    by_source = {}
    by_sku = {}
    for r in records:
        by_source[r["source"]] = by_source.get(r["source"], 0) + 1
        if r["sku"]:
            by_sku.setdefault(r["sku"], 0)
            by_sku[r["sku"]] += 1
    print(f"Total imágenes escaneadas: {len(records)}")
    print(f"Con SKU en nombre/carpeta: {sum(1 for r in records if r['sku'])} ({len(by_sku)} SKUs únicos)")
    print("Por fuente:")
    for s, n in sorted(by_source.items(), key=lambda x: -x[1]):
        print(f"  {s:14s} {n}")
    dup_imgs = sum(len(g) for g in groups)
    print(f"Grupos de duplicados: {len(groups)}  (involucran {dup_imgs} imágenes)")
    print(f"Manifiesto: /tmp/wenu-audit/manifest.json")
    print(f"Duplicados: /tmp/wenu-audit/dupes.json")

if __name__ == "__main__":
    main()
