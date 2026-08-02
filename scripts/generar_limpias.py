#!/usr/bin/env python3
"""
Genera la versión LIMPIA de cada lámina y la pone primera en el manifiesto.

POR QUÉ
-------
Hallazgo V-13. La regla del pliego es literal: *«la obra de Ocín va FIEL (sin
dither por defecto; tratamiento sólo al click)»*. Hoy se sirven **1197 de 1197
imágenes tratadas** y **cero limpias**: en `assets/` no existe ninguna versión
sin tratar, así que el sitio no puede mostrar la obra fiel aunque quiera.

Los originales sí existen, en `vol/*/raw/`, pero son JPG de hasta varios MB.
Referenciarlos crudos cumpliría la regla y arruinaría la carga.

QUÉ HACE
--------
Por cada original con tratamiento asociado, escribe `{stem}.limpio.webp` en
`assets/{volumen}/`:

· **Sin dither, sin duotono, sin recorte.** Es la obra.
· Lado mayor a 1600 px como techo. No se agranda nada: si el original es más
  chico, se deja como está.
· WEBP calidad 88.

Y con `--aplicar`, pone la limpia **primera** en la lista de assets de su
volumen, que es de donde sale el hero. Las tratadas **no se borran**: quedan
detrás, disponibles para el click.

PESA MENOS, NO MÁS
------------------
Contraintuitivo pero medido: el dither mete ruido de alta frecuencia y arruina
la compresión. `disco-01` limpia pesa 167 KB contra 1106 KB de su versión
dithered. La regla y el rendimiento van del mismo lado.

REVERSIBLE
----------
No borra nada. Para deshacer: `git checkout` del manifiesto y borrar los
`*.limpio.webp`.
"""
import argparse
import json
import pathlib
import sys

from PIL import Image

RAIZ = pathlib.Path("public/kodex-content/opencode")
MANIFIESTO = RAIZ / "manifest.json"
ASSETS = RAIZ / "assets"
VOL = RAIZ / "vol"

LADO_MAX = 1600
CALIDAD = 88
EXT = {".webp", ".png", ".jpg", ".jpeg", ".gif", ".avif"}


# Los originales no siempre viven en `raw/`. `prototipos` los tiene en
# `capturas/`, y por buscar sólo en `raw/` la primera pasada lo saltó en
# silencio: quedó sirviendo `kodex-blacksun.dither.webp` como hero, o sea
# **obra tratada por defecto**, que es exactamente lo que la regla dura
# prohíbe. Un único volumen, pero la regla no admite excepciones.
CARPETAS_ORIGEN = ("raw", "capturas", "originales")


def originales_de(vid: str) -> dict[str, pathlib.Path]:
    """{stem: ruta} de los originales sin tratar del volumen."""
    out: dict[str, pathlib.Path] = {}
    for nombre in CARPETAS_ORIGEN:
        d = VOL / vid / nombre
        if not d.exists():
            continue
        for f in sorted(d.iterdir()):
            if f.suffix.lower() in EXT and f.is_file():
                out.setdefault(f.stem, f)
    return out


def generar(origen: pathlib.Path, destino: pathlib.Path) -> tuple[int, str]:
    with Image.open(origen) as im:
        im = im.convert("RGB")
        w, h = im.size
        esc = min(1.0, LADO_MAX / max(w, h))
        if esc < 1.0:
            im = im.resize((round(w * esc), round(h * esc)), Image.LANCZOS)
        destino.parent.mkdir(parents=True, exist_ok=True)
        im.save(destino, "WEBP", quality=CALIDAD, method=6)
        return destino.stat().st_size, f"{im.size[0]}×{im.size[1]}"


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--aplicar", action="store_true",
                    help="además de generar, poner la limpia primera en el manifiesto")
    a = ap.parse_args()

    if not MANIFIESTO.exists():
        print(f"no está {MANIFIESTO}", file=sys.stderr)
        return 1

    m = json.loads(MANIFIESTO.read_text())

    generadas = 0
    bytes_nuevos = 0
    bytes_tratados = 0
    sin_original = []
    tocados = []

    for v in m["volumenes"]:
        vid = v["id"]
        assets = [x for x in (v.get("assets") or []) if isinstance(x, str)]
        if not assets:
            continue

        crudos = originales_de(vid)
        if not crudos:
            sin_original.append(vid)
            continue

        # El stem se saca quitando el sufijo de tratamiento y la extensión,
        # NO cortando en el primer punto: los archivos de Behance llevan dos
        # —"01-3b6e2d114558929.603dc4b2534b4.dither.webp"— y partir en el
        # primero deja "01-3b6e2d114558929", que no existe en `raw/`.
        # Ese error hacía que 241 de 399 láminas se saltaran en silencio.
        stems = []
        for f in assets:
            base = f
            for suf in (".dither", ".duo-bone", ".duo-signal", ".limpio"):
                base = base.replace(f"{suf}.webp", "")
            base = pathlib.Path(base).stem if base.endswith((".webp", ".png", ".jpg")) else base
            if base and base not in stems:
                stems.append(base)

        limpias_del_vol = []
        for stem in stems:
            origen = crudos.get(stem)
            if origen is None:
                continue
            nombre = f"{stem}.limpio.webp"
            destino = ASSETS / vid / nombre
            if not destino.exists():
                try:
                    n, _ = generar(origen, destino)
                except Exception as e:
                    print(f"  no se pudo con {origen}: {e}", file=sys.stderr)
                    continue
                generadas += 1
                bytes_nuevos += n
            limpias_del_vol.append(nombre)

        if not limpias_del_vol:
            continue

        # Peso de las tratadas equivalentes, para poder comparar de verdad.
        for f in assets:
            p = ASSETS / vid / f
            if p.exists():
                bytes_tratados += p.stat().st_size

        if a.aplicar:
            # Limpias primero (hero fiel), tratadas detrás (disponibles al click).
            restantes = [f for f in assets if f not in limpias_del_vol]
            v["assets"] = limpias_del_vol + restantes
            v["asset_total"] = len(v["assets"])
            tocados.append(vid)

    if a.aplicar:
        MANIFIESTO.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n")

    print(f"láminas limpias generadas : {generadas}")
    print(f"  peso de lo generado     : {bytes_nuevos/1e6:.1f} MB")
    if sin_original:
        print(f"\nvolúmenes sin `raw/` (no se tocan): {len(sin_original)}")
        print(f"  {', '.join(sin_original)}")
    if a.aplicar:
        print(f"\nmanifiesto actualizado: la limpia va primera en {len(tocados)} volúmenes")
    else:
        print("\n(ensayo — no se tocó el manifiesto; usar --aplicar)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
