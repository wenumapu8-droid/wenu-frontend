#!/usr/bin/env python3
"""
Mide el contraste real de una captura, en vez de opinar sobre ella.

POR QUÉ
-------
El hallazgo V-07 de la auditoría decía que las etiquetas del dossier «parecen
poco legibles». Eso no es un hallazgo: es una impresión. Esto lo convierte en un
número contra el criterio WCAG 2.x, que es el que usa todo el mundo.

CÓMO
----
Se recorta una región de la captura, se separan sus píxeles en dos grupos por
luminancia —el fondo, que es la moda, y la tinta, que es lo que se aparta— y se
calcula la razón de contraste entre ambos.

No se asume qué color es el texto ni cuál el fondo: se deduce de la propia
imagen. Así sirve igual para tinta clara sobre oscuro que al revés.

REFERENCIA
----------
WCAG 2.x pide 4.5:1 para texto normal y 3:1 para texto grande (>=24px, o >=19px
en negrita). Debajo de 3:1 no hay caso de uso que lo justifique.
"""
import pathlib
import sys
from collections import Counter

from PIL import Image


def luminancia(rgb) -> float:
    """Luminancia relativa WCAG. Los coeficientes y el umbral son de la norma."""
    def canal(c: int) -> float:
        s = c / 255
        return s / 12.92 if s <= 0.04045 else ((s + 0.055) / 1.055) ** 2.4
    r, g, b = rgb[:3]
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)


def contraste(a, b) -> float:
    la, lb = luminancia(a), luminancia(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def medir(img: Image.Image, caja, nombre: str) -> dict:
    """caja = (x0, y0, x1, y1). Devuelve fondo, tinta y razón."""
    region = img.convert("RGB").crop(caja)
    pixeles = list(region.getdata())
    if not pixeles:
        raise ValueError(f"{nombre}: región vacía")

    # El fondo es el color más frecuente. En una caja de texto siempre gana,
    # porque hay muchos más píxeles de fondo que de trazo.
    fondo = Counter(pixeles).most_common(1)[0][0]
    lf = luminancia(fondo)

    # La tinta es el píxel que más se aparta del fondo en luminancia. Se toma el
    # extremo y no el promedio: promediar mete el antialiasing y miente hacia
    # arriba, que es justo el error que hace pasar por legible lo que no lo es.
    tinta = max(pixeles, key=lambda p: abs(luminancia(p) - lf))

    return {
        "nombre": nombre,
        "fondo": fondo,
        "tinta": tinta,
        "razon": contraste(fondo, tinta),
        "px": len(pixeles),
    }


def veredicto(r: float) -> str:
    if r >= 4.5:
        return "PASA texto normal (>=4.5)"
    if r >= 3.0:
        return "pasa solo como texto grande (>=3.0) — FALLA como texto normal"
    return "FALLA todo (<3.0)"


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 1

    ruta = pathlib.Path(sys.argv[1])
    if not ruta.exists():
        print(f"no está {ruta}", file=sys.stderr)
        return 1

    img = Image.open(ruta)
    w, h = img.size
    print(f"{ruta.name} — {w}×{h}\n")

    # Regiones de /kodex/vol/[slug] a 1440×900, tomadas de la captura.
    # Cada una es una franja estrecha sobre una sola línea de texto, para no
    # mezclar dos colores distintos en la misma medición.
    regiones = [
        ((24, 163, 120, 176), "01·DOSSIER — etiqueta CLASE"),
        ((24, 185, 120, 198), "01·DOSSIER — etiqueta ESTRATO"),
        ((24, 231, 130, 243), "01·DOSSIER — etiqueta INTEGRIDAD"),
        ((200, 163, 272, 176), "01·DOSSIER — valor GALLERY"),
        ((24, 136, 90, 148), "título de panel 01·DOSSIER"),
        ((24, 512, 272, 560), "03·CURADURÍA — cuerpo español"),
        ((24, 665, 272, 700), "03·CURADURÍA — cuerpo inglés"),
        ((1140, 160, 1240, 172), "04·GLIFOS — CONSTANTES Y RAZONES"),
        ((1140, 340, 1300, 352), "04·GLIFOS — fuente al pie"),
        ((1140, 515, 1200, 527), "05·DIAGNÓSTICO — etiqueta UTC"),
    ]

    filas = []
    for caja, nombre in regiones:
        if caja[2] > w or caja[3] > h:
            print(f"  (fuera de la imagen: {nombre})")
            continue
        try:
            filas.append(medir(img, caja, nombre))
        except ValueError as e:
            print(f"  {e}")

    filas.sort(key=lambda f: f["razon"])
    print(f"{'región':<40} {'razón':>7}  veredicto")
    print("-" * 92)
    for f in filas:
        print(f"{f['nombre']:<40} {f['razon']:>6.2f}:1  {veredicto(f['razon'])}")

    fallan = [f for f in filas if f["razon"] < 3.0]
    justo = [f for f in filas if 3.0 <= f["razon"] < 4.5]
    print()
    print(f"por debajo de 3.0:1 → {len(fallan)} de {len(filas)}")
    print(f"entre 3.0 y 4.5:1  → {len(justo)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
