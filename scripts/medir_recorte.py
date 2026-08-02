#!/usr/bin/env python3
"""
Detecta recorte por borde y mide el negro dominante de una captura.

DOS COSAS QUE HACE
------------------
1. `--recorte`  Dice si hay contenido tocando el borde derecho. Cuando una
   página desborda, lo que se ve no es un hueco sino contenido cortado al ras:
   la última columna de píxeles tiene tinta. Una página bien contenida deja
   fondo en el margen.

2. `--negro`    Mide qué porcentaje de píxeles está por debajo de un umbral de
   luminancia. Sirve para verificar la regla de "negro dominante" en vez de
   citarla de memoria.

POR QUÉ MEDIR EL BORDE Y NO EL ANCHO DEL DOCUMENTO
--------------------------------------------------
Chrome headless no expone `scrollWidth` en una captura. Pero el síntoma que
importa —que al usuario se le corta algo— sí es visible en los píxeles. Se mide
el efecto, que es lo que se reporta, y no la causa, que se lee en el CSS.

LÍMITE HONESTO
--------------
Un elemento que llega al borde *por diseño* —una regla, una barra de progreso,
un degradado a sangre— da el mismo positivo que uno cortado. Esto señala dónde
mirar; no reemplaza mirar.
"""
import argparse
import pathlib
import sys
from collections import Counter

from PIL import Image


def luma(p) -> float:
    r, g, b = p[:3]
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255


def fondo_de(img: Image.Image) -> tuple:
    """El color más frecuente del cuadro. En este sitio siempre es el negro."""
    ch = img.convert("RGB").resize((160, 100))
    return Counter(ch.getdata()).most_common(1)[0][0]


def dista(a, b) -> float:
    return max(abs(a[i] - b[i]) for i in range(3)) / 255


def recorte(ruta: pathlib.Path, cols: int = 3, tol: float = 0.10) -> dict:
    img = Image.open(ruta).convert("RGB")
    w, h = img.size
    fondo = fondo_de(img)

    def franja(x0, x1):
        px = [img.getpixel((x, y)) for x in range(x0, x1) for y in range(0, h, 2)]
        tinta = [p for p in px if dista(p, fondo) > tol]
        return 100 * len(tinta) / max(len(px), 1)

    return {
        "archivo": ruta.name,
        "wh": f"{w}×{h}",
        "fondo": fondo,
        "derecha": franja(w - cols, w),
        "izquierda": franja(0, cols),
        "abajo": 100 * sum(
            1 for x in range(0, w, 2) for y in range(h - cols, h)
            if dista(img.getpixel((x, y)), fondo) > tol
        ) / max(len(range(0, w, 2)) * cols, 1),
    }


def negro(ruta: pathlib.Path, umbral: float = 0.20) -> dict:
    img = Image.open(ruta).convert("RGB").resize((480, 300))
    px = list(img.getdata())
    osc = sum(1 for p in px if luma(p) < umbral)
    return {"archivo": ruta.name, "pct": 100 * osc / len(px)}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("rutas", nargs="+")
    ap.add_argument("--negro", action="store_true", help="medir negro dominante")
    a = ap.parse_args()

    rutas = [pathlib.Path(r) for r in a.rutas]
    faltan = [r for r in rutas if not r.exists()]
    if faltan:
        print(f"no están: {[str(r) for r in faltan]}", file=sys.stderr)
        return 1

    if a.negro:
        print(f"{'captura':<30} {'% oscuro':>9}   canon >=85 %")
        print("-" * 62)
        filas = sorted((negro(r) for r in rutas), key=lambda f: f["pct"])
        for f in filas:
            marca = "cumple" if f["pct"] >= 85 else "NO cumple"
            print(f"{f['archivo']:<30} {f['pct']:>8.1f}%   {marca}")
        ok = sum(1 for f in filas if f["pct"] >= 85)
        print(f"\ncumplen: {ok} de {len(filas)}")
        return 0

    print(f"{'captura':<28} {'tamaño':>10} {'izq':>7} {'DER':>7} {'abajo':>7}")
    print("-" * 66)
    for r in rutas:
        d = recorte(r)
        print(f"{d['archivo']:<28} {d['wh']:>10} {d['izquierda']:>6.1f}% "
              f"{d['derecha']:>6.1f}% {d['abajo']:>6.1f}%")
    print("\nTinta en el borde derecho = contenido cortado al ras.")
    print("Un margen sano deja ~0 %.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
