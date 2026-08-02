#!/usr/bin/env python3
"""
Mueve los nombres acreditados AL TEXTO QUE LA LÁMINA MUESTRA.

POR QUÉ
-------
En V-17 registré los créditos en `credito_en_lamina`. Después capturé la
página y ese campo **no se lee en ninguna parte** de `[slug].astro`. Resultado
medido sobre el HTML servido:

    "Claudio Pino"      → 0 apariciones
    "Alejandro Martín"  → 0 apariciones

Es decir: dejé la atribución en un campo que nadie muestra. Para quien visita
el sitio, esas personas **siguen sin crédito**. Guardar un dato no es publicarlo.

Lo que sí funciona es lo que hice en V-15 sin darme cuenta de por qué: allí los
nombres quedaron dentro de `curaduria_es`, que la lámina sí dibuja — y por eso
«Iván Orrego» y «GeoRoder» aparecen 21 veces en su página.

Acá se hace lo mismo con los tres volúmenes de V-17 que quedaron mudos.
`credito_en_lamina` se conserva: sirve como campo estructurado el día que la
lámina lo lea.

Techo: ~480 caracteres por idioma. Más arriba, la ficha trunca.
"""
import json
import pathlib
import sys

M = pathlib.Path("public/kodex-content/opencode/manifest.json")

VISIBLES = {
    "behance-116149759": dict(
        curaduria_es=(
            "Fotografía callejera en Santiago. Dos láminas. No es moda: es calle "
            "—tránsito de la Alameda, gente esperando— con viraje a magenta. Las "
            "dos llevan el crédito impreso al pie, y ahí está lo que los "
            "metadatos no dicen: es trabajo de un curso de Fotografía Digital, "
            "acreditado a Nicolás Ortega junto a su docente, Claudio Pino."),
        curaduria_en=(
            "Street photography in Santiago. Two plates. Not fashion: street "
            "—Alameda traffic, people waiting— with a magenta shift. Both carry a "
            "printed credit at the foot, which shows what the metadata does not: "
            "this is coursework from a Digital Photography class, credited to "
            "Nicolás Ortega alongside his instructor, Claudio Pino."),
    ),
    "behance-114620487": dict(
        curaduria_es=(
            "Catálogo comercial de la colección de joyería Wenü Mapü, 2019. Seis "
            "láminas. Es el origen de la marca que da nombre al sitio, y no es "
            "una obra: trae precios y condiciones de venta. La fotografía está "
            "acreditada en las láminas a tres personas —Nicolás Ortega, Alejandro "
            "Martín y Jesús Alejandro—. Las piezas se nombran desde el mapudungun "
            "y desde el pueblo selk'nam, y ese uso requiere fuente."),
        curaduria_en=(
            "Commercial catalogue of the Wenü Mapü jewellery collection, 2019. Six "
            "plates. It is the origin of the brand the site is named after, and "
            "not an artwork: it carries prices and sale terms. Photography is "
            "credited on the plates to three people —Nicolás Ortega, Alejandro "
            "Martín and Jesús Alejandro—. Pieces are named in Mapudungun and after "
            "the Selk'nam people, and that use requires sourcing."),
    ),
    "behance-114560597": dict(
        curaduria_es=(
            "Escenografía virtual en 3D para «Rave Virtual», festival de música, "
            "tecnología y arte psicodélico chileno, 28 de agosto de 2020, por "
            "NaciónStream. Cinco vistas de una estructura triangular escalonada. "
            "No es una pieza autónoma: es un encargo fechado, y el afiche acredita "
            "junto a Wenü Mapü a Almenara, Uará, De lo Absurdo y Pey-Tech."),
        curaduria_en=(
            "3D virtual stage design for «Rave Virtual», a Chilean festival of "
            "music, technology and psychedelic art, 28 August 2020, on "
            "NaciónStream. Five views of a stepped triangular structure. Not a "
            "standalone piece: a dated commission, and the poster credits "
            "Almenara, Uará, De lo Absurdo and Pey-Tech alongside Wenü Mapü."),
    ),
}


def main() -> int:
    aplicar = "--aplicar" in sys.argv
    m = json.loads(M.read_text())
    tocados = []
    for v in m["volumenes"]:
        if v["id"] in VISIBLES:
            v.update(VISIBLES[v["id"]])
            largos = {k: len(x) for k, x in VISIBLES[v["id"]].items()}
            tocados.append((v["id"], largos))
    if aplicar:
        M.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n")
    for vid, largos in tocados:
        techo = "OK" if max(largos.values()) <= 480 else "¡PASA EL TECHO!"
        print(f"  {vid}: es={largos['curaduria_es']} en={largos['curaduria_en']} · {techo}")
    print("\n" + ("manifiesto actualizado" if aplicar else "(ensayo — usar --aplicar)"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
