#!/usr/bin/env python3
"""
Mide la proporción REAL de cada lámina y regenera `aspectos.json`.

POR QUÉ
-------
Hallazgo V-04 de la auditoría. `aspectos.json` cubría 461 de 1197 imágenes del
manifiesto (38 %). Las 736 restantes caían al `?? "1/1"` de `deOpencode()` y se
dibujaban en una caja cuadrada con recorte.

De una muestra de 200 de esas 736, el **88 % no era cuadrada**. El peor caso era
una tira de 1400×169 —proporción 8.28— metida en un cuadrado: perdía el 88 % de
su ancho.

La regla del proyecto es que la obra de Ocín se ve COMPLETA. Suponer que todo es
cuadrado la incumple 736 veces.

QUÉ HACE
--------
Recorre todos los assets de imagen del manifiesto, **abre cada archivo y lee sus
dimensiones**, y escribe la tabla. No infiere nada del nombre ni del volumen.

Los que no existan en disco quedan fuera y se listan: un asset declarado que no
está es un problema aparte, y taparlo con un valor inventado sería peor.

FORMATO
-------
Se conserva el existente —`{"volumen/archivo": {"aspecto": "w/h", "w": n, "h": n}}`—
porque es la clave que arma `deOpencode()`: `${v.id}/${f}`.
"""
import json
import pathlib
import sys
from math import gcd

from PIL import Image

RAIZ = pathlib.Path("public/kodex-content/opencode")
MANIFIESTO = RAIZ / "manifest.json"
SALIDA = RAIZ / "aspectos.json"
ASSETS = RAIZ / "assets"

EXT = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif", ".svg"}


def es_imagen(nombre: str) -> bool:
    return pathlib.Path(nombre).suffix.lower() in EXT


def proporcion(w: int, h: int) -> str:
    """`w/h` reducido. 1400×169 → 1400/169, no 8.28: el CSS quiere la razón."""
    d = gcd(w, h) or 1
    return f"{w // d}/{h // d}"


def main() -> int:
    if not MANIFIESTO.exists():
        print(f"no está {MANIFIESTO}", file=sys.stderr)
        return 1

    m = json.loads(MANIFIESTO.read_text())
    previo = json.loads(SALIDA.read_text()) if SALIDA.exists() else {}

    tabla: dict[str, dict] = {}
    faltan: list[str] = []
    ilegibles: list[str] = []

    for v in m["volumenes"]:
        for f in v.get("assets", []) or []:
            if not es_imagen(f):
                continue
            rel = f"{v['id']}/{f}"
            ruta = ASSETS / rel
            if not ruta.exists():
                faltan.append(rel)
                continue
            try:
                with Image.open(ruta) as im:
                    w, h = im.size
            except Exception:
                ilegibles.append(rel)
                continue
            if not w or not h:
                ilegibles.append(rel)
                continue
            tabla[rel] = {"aspecto": proporcion(w, h), "w": w, "h": h}

    # Comparación honesta contra lo que había, para que el diff se pueda leer.
    nuevos = sum(1 for k in tabla if k not in previo)
    cambiados = sum(
        1 for k, d in tabla.items()
        if k in previo and previo[k].get("aspecto") != d["aspecto"]
    )
    perdidos = [k for k in previo if k not in tabla]

    SALIDA.write_text(json.dumps(tabla, ensure_ascii=False, indent=1, sort_keys=True) + "\n")

    print(f"medidas escritas : {len(tabla)}")
    print(f"  antes había    : {len(previo)}")
    print(f"  nuevas         : {nuevos}")
    print(f"  corregidas     : {cambiados}")
    if perdidos:
        print(f"  ya no aparecen : {len(perdidos)} (no están en el manifiesto)")
    if faltan:
        print(f"\ndeclarados en el manifiesto y NO en disco: {len(faltan)}")
        for r in faltan[:8]:
            print(f"    {r}")
    if ilegibles:
        print(f"\nilegibles como imagen: {len(ilegibles)}")
        for r in ilegibles[:8]:
            print(f"    {r}")

    cuadradas = sum(1 for d in tabla.values() if d["aspecto"] == "1/1")
    print(f"\nde las {len(tabla)}: {cuadradas} cuadradas · {len(tabla) - cuadradas} NO cuadradas")
    print("Las no cuadradas son exactamente las que antes se recortaban.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
