#!/usr/bin/env python3
"""
Extrae el texto de los PDFs del Codex Estelar.

Son PDFs de ReportLab con filtros `ASCII85Decode + FlateDecode`. Un extractor
que sólo intenta zlib devuelve CERO caracteres y parece que el archivo estuviera
vacío — que fue exactamente lo que me pasó. Hay que deshacer las dos capas, en
ese orden.

Sin dependencias: el mini no tiene poppler ni pypdf, y para leer texto no hace
falta instalar nada.
"""
import base64, re, sys, zlib


def texto(path: str) -> str:
    d = open(path, "rb").read()
    out = []
    # `stream(.*?)endstream` + strip, y NO `stream\r?\n(...)\r?\nendstream`:
    # el separador real varía y el patrón estricto no calzaba ninguno. Devolvía
    # cero caracteres y parecía que los PDFs estuvieran vacíos.
    for m in re.finditer(rb"stream(.*?)endstream", d, re.S):
        raw = m.group(1).strip()
        try:
            # ASCII85 primero; ReportLab cierra con `~>`.
            s = base64.a85decode(raw, adobe=True)
            s = zlib.decompress(s)
        except Exception:
            try:
                s = zlib.decompress(raw)
            except Exception:
                continue
        # Los operadores de texto: Tj sobre literales entre paréntesis.
        for lit in re.findall(rb"\((?:[^()\\]|\\.)*\)", s):
            t = lit[1:-1]
            t = re.sub(rb"\\([()\\])", rb"\1", t)
            # Escapes octales `\355` → el byte 0xED. ReportLab escribe el texto
            # en WinAnsi, así que sin esto la salida queda llena de `\363` en
            # vez de acentos y el material se vuelve inutilizable.
            t = re.sub(rb"\\([0-7]{1,3})", lambda m: bytes([int(m.group(1), 8)]), t)
            out.append(t.decode("cp1252", errors="replace"))
    return "\n".join(out)


if __name__ == "__main__":
    print(texto(sys.argv[1]))
