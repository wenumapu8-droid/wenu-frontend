#!/usr/bin/env python3
"""
Corrige dos cosas del manifiesto, las dos verificadas contra las láminas.

1. LOS CONTEOS DE OBRAS ESTABAN INFLADOS ×3 — EN LAS 14 FICHAS QUE LOS DAN
---------------------------------------------------------------------------
Yo escribí «Nueve piezas» para `princesa yuyo`, que tiene **tres** láminas.
Y «Treinta y tres» para `render`, que tiene **once**. Y así las catorce.

El error es mío y es sistemático: conté las entradas de `assets`, que incluyen
**tres derivados tratados por cada original** (dither, duo-bone, duo-signal).
Contar tres veces la misma lámina triplicó la obra de Ocín en cada ficha.

Verificación: `dicho == raw×3` en **14 de 14**, sin una sola excepción. Ninguna
ficha daba el número real. Un error uniforme no es un descuido de redacción: es
haber medido la cosa equivocada.

Acá se reemplaza por el número de originales en `vol/<id>/raw/`.

2. CRÉDITOS Y ENCUADRES QUE SÓLO APARECEN AL ABRIR LA LÁMINA
------------------------------------------------------------
Ocho volúmenes quedaban sin revisar con el criterio de V-15. Se revisaron los
49 originales. **Los metadatos de Behance no traen nada de esto.**

Lo más grave no eran los créditos: era que dos fichas describían mal la obra.
`Emanes` figuraba como «serie fotográfica de locación, luz de costa». Las
láminas llevan **«NO +» y «SENAME»** — es una obra de protesta sobre el
servicio estatal de menores, con una artista aérea en escena. Eso no es un
matiz de curaduría.

REVERSIBLE
----------
Sólo toca los volúmenes nombrados y sólo los campos indicados. Para deshacer:
`git checkout` del manifiesto.
"""
import json
import pathlib
import re
import sys

RAIZ = pathlib.Path("public/kodex-content/opencode")
MANIFIESTO = RAIZ / "manifest.json"
VOL = RAIZ / "vol"
EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}

PALABRA = {1: "Una", 2: "Dos", 3: "Tres", 4: "Cuatro", 5: "Cinco", 6: "Seis",
           7: "Siete", 8: "Ocho", 9: "Nueve", 10: "Diez", 11: "Once", 12: "Doce",
           13: "Trece", 14: "Catorce", 15: "Quince", 16: "Dieciséis",
           23: "Veintitrés", 36: "Treinta y seis", 41: "Cuarenta y una",
           55: "Cincuenta y cinco"}
NUMERALES = {}
INGLESES = {}
INGLES = {1: "One", 2: "Two", 3: "Three", 4: "Four", 5: "Five", 6: "Six",
          7: "Seven", 8: "Eight", 9: "Nine", 10: "Ten", 11: "Eleven", 12: "Twelve",
          13: "Thirteen", 14: "Fourteen", 15: "Fifteen", 16: "Sixteen",
          23: "Twenty-three", 36: "Thirty-six", 41: "Forty-one", 55: "Fifty-five"}

# Los numerales que hay que RECONOCER incluyen los inflados (hasta 72), no sólo
# los que se van a escribir.
for _n, _w in {1:"una",2:"dos",3:"tres",4:"cuatro",5:"cinco",6:"seis",7:"siete",
  8:"ocho",9:"nueve",10:"diez",11:"once",12:"doce",13:"trece",14:"catorce",
  15:"quince",16:"dieciséis",17:"diecisiete",18:"dieciocho",19:"diecinueve",
  20:"veinte",21:"veintiuna",22:"veintidós",24:"veinticuatro",25:"veinticinco",
  27:"veintisiete",30:"treinta",33:"treinta y tres",36:"treinta y seis",40:"cuarenta",
  42:"cuarenta y dos",45:"cuarenta y cinco",48:"cuarenta y ocho",50:"cincuenta",
  54:"cincuenta y cuatro",55:"cincuenta y cinco",60:"sesenta",66:"sesenta y seis",
  69:"sesenta y nueve",72:"setenta y dos",99:"noventa y nueve",108:"ciento ocho",
  120:"ciento veinte",123:"ciento veintitrés",132:"ciento treinta y dos"}.items():
    NUMERALES[_w] = _n
for _n, _w in {1:"one",2:"two",3:"three",4:"four",5:"five",6:"six",7:"seven",8:"eight",
  9:"nine",10:"ten",11:"eleven",12:"twelve",13:"thirteen",14:"fourteen",15:"fifteen",
  16:"sixteen",17:"seventeen",18:"eighteen",19:"nineteen",20:"twenty",22:"twenty-two",
  24:"twenty-four",25:"twenty-five",27:"twenty-seven",30:"thirty",33:"thirty-three",
  36:"thirty-six",40:"forty",42:"forty-two",45:"forty-five",48:"forty-eight",
  50:"fifty",54:"fifty-four",55:"fifty-five",60:"sixty",66:"sixty-six",69:"sixty-nine",
  72:"seventy-two",108:"one hundred and eight",120:"one hundred and twenty"}.items():
    INGLESES[_w] = _n


def originales(vid: str) -> int:
    d = VOL / vid / "raw"
    if not d.exists():
        return 0
    return len([f for f in d.iterdir() if f.suffix.lower() in EXT and f.is_file()])


# Fichas que se reescriben porque describían mal la obra, no sólo el número.
# El techo es ~480 caracteres por idioma: más arriba, la lámina trunca.
# Corrección aparte, de aritmética: la ficha de Soma dice que el motivo «cruza
# trece años» entre 2021 y 2024. Son tres.
ARITMETICA = {"behance-212025419": [("el motivo cruza trece años", "el motivo cruza tres años"),
                                    ("the motif crosses thirteen years", "the motif crosses three years")]}

REESCRITAS = {
    "behance-116133407": dict(  # Emanes (act3), Pichilemu
        titulo_real="Emanes (acto 3), Pichilemu",
        categoria="obra de protesta · registro de performance",
        curaduria_es=(
            "Registro de performance aérea, Pichilemu. Diez láminas en espejo. "
            "No es una serie de paisaje: las piezas llevan «NO +» y «SENAME» "
            "sobre el cuerpo de la artista, y esa fórmula —«no más»— es la del "
            "arte de protesta chileno. La obra nombra al servicio estatal de "
            "menores. La acróbata en escena no está identificada en las láminas "
            "y el crédito falta."),
        curaduria_en=(
            "Documentation of an aerial performance, Pichilemu. Ten mirrored "
            "plates. Not a landscape series: the pieces carry «NO +» and "
            "«SENAME» over the performer's body, and that formula —«no more»— "
            "belongs to Chilean protest art. The work names the state child "
            "welfare service. The aerialist is not identified on the plates and "
            "her credit is missing."),
        credito_en_lamina="Artista aérea en escena, sin identificar en la lámina. Falta el crédito.",
    ),
    "behance-116149759": dict(  # Santiago
        titulo_real="Santiago",
        categoria="fotografía callejera · trabajo de curso",
        curaduria_es=(
            "Fotografía callejera en Santiago. Dos láminas. No es moda: es calle "
            "—tránsito de la Alameda, gente esperando— con viraje a magenta. "
            "Las dos llevan el crédito impreso al pie, y ahí se ve lo que los "
            "metadatos no dicen: es trabajo de un curso de Fotografía Digital, "
            "con su docente al pie junto al autor."),
        curaduria_en=(
            "Street photography in Santiago. Two plates. Not fashion: street "
            "—Alameda traffic, people waiting— with a magenta shift. Both carry "
            "a printed credit at the foot, which shows what the metadata does "
            "not: this is coursework from a Digital Photography class, with the "
            "instructor credited alongside the author."),
        credito_en_lamina="«NICOLAS ORTEGA · Claudio Pino — Fotografía Digital», impreso al pie de las dos láminas.",
    ),
    "behance-114560597": dict(  # quinto fuego
        titulo_real="Quinto Fuego — stage virtual 3D",
        categoria="escenografía virtual · encargo para evento",
        curaduria_es=(
            "Escenografía virtual en 3D para «Rave Virtual», festival de música, "
            "tecnología y arte psicodélico chileno, 28 de agosto de 2020, por "
            "NaciónStream. Cinco vistas de una estructura triangular con "
            "iconografía escalonada. No es una pieza autónoma: es un encargo "
            "fechado, y el afiche acredita a varios colectivos junto a Wenü Mapü."),
        curaduria_en=(
            "3D virtual stage design for «Rave Virtual», a Chilean festival of "
            "music, technology and psychedelic art, 28 August 2020, on "
            "NaciónStream. Five views of a triangular structure with stepped "
            "iconography. Not a standalone piece: a dated commission, and the "
            "poster credits several collectives alongside Wenü Mapü."),
        credito_en_lamina=(
            "El afiche acredita, junto a Wenü Mapü: Almenara, Uará, De lo Absurdo, "
            "Pey-Tech y otro nombre ilegible en esta resolución. Plataforma: NaciónStream."),
    ),
    "behance-114620487": dict(  # Catálogo 2019
        titulo_real="Wenü Mapü — Jewelry Collection 2019",
        categoria="catálogo comercial · identidad de marca",
        curaduria_es=(
            "Catálogo comercial de la colección de joyería Wenü Mapü, 2019. Seis "
            "láminas. Es el origen de la marca que da nombre al sitio. No es una "
            "obra: trae condiciones de venta y precios. Acredita a tres "
            "fotógrafos distintos. Las piezas se nombran desde el mapudungun y "
            "desde el pueblo selk'nam, y ese uso requiere fuente."),
        curaduria_en=(
            "Commercial catalogue of the Wenü Mapü jewellery collection, 2019. "
            "Six plates. It is the origin of the brand the site is named after. "
            "Not an artwork: it carries sale terms and prices. It credits three "
            "different photographers. Pieces are named in Mapudungun and after "
            "the Selk'nam people, and that use requires sourcing."),
        credito_en_lamina=(
            "Fotografía acreditada en las láminas a tres personas: Nicolás Ortega, "
            "Alejandro Martín y Jesús Alejandro — transcritos tal como figuran, sin "
            "resolver si los dos últimos son la misma persona."),
        requiere_fuente_mapuche=True,
    ),
    "behance-114559111": dict(  # princesa yuyo
        titulo_real="Princesa Yuyo",
        categoria="composición en espejo · retrato",
        curaduria_es=(
            "Composición en espejo sobre fotografía de cuerpo, entre flores de "
            "yuyo. Tres láminas. No es fotografía de moda: no hay vestuario ni "
            "producto, hay un cuerpo y un campo. La persona retratada es "
            "reconocible y aparece parcialmente desnuda; no está identificada en "
            "las láminas ni acreditada."),
        curaduria_en=(
            "Mirrored composition over body photography, among wild mustard "
            "flowers. Three plates. Not fashion photography: there is no styling "
            "and no product, there is a body and a field. The person portrayed is "
            "recognisable and partly nude; she is not identified on the plates "
            "and not credited."),
        credito_en_lamina="Persona retratada reconocible y sin identificar. Falta el crédito y conviene verificar el consentimiento de publicación.",
    ),
    "behance-114563539": dict(  # render
        titulo_real="Render",
        categoria="render 3D · arquitectura y producto",
        curaduria_es=(
            "Ejercicios de render 3D, 2021. Once láminas. Es sobre todo "
            "arquitectura —interiores, una casa sobre pilotes, aberturas contra "
            "el atardecer— más que mobiliario: hay también un mecanismo rodante "
            "y una mesa con discos. El volumen más técnico del portafolio: "
            "materia, medida y luz calculada."),
        curaduria_en=(
            "3D rendering exercises, 2021. Eleven plates. Mostly architecture "
            "—interiors, a house on stilts, openings against a sunset— rather "
            "than furniture: there is also a rolling mechanism and a table with "
            "discs. The most technical volume in the portfolio: material, "
            "measure and calculated light."),
    ),
    "behance-116138363": dict(  # TranaluÜkai
        titulo_real="TranaluÜkai",
        categoria="diseño de producto · planos técnicos",
        curaduria_es=(
            "Planos técnicos de producción de joyería, con cotas en milímetros. "
            "Seis láminas. No son ilustraciones: son dibujos de taller, con "
            "vistas, medidas y despiece. Las piezas y las cenefas reproducen "
            "iconografía textil mapuche. El nombre está en mapudungun y tanto él "
            "como los motivos deben citarse desde la fuente del autor."),
        curaduria_en=(
            "Technical production drawings for jewellery, dimensioned in "
            "millimetres. Six plates. Not illustrations: workshop drawings, with "
            "views, measurements and part breakdowns. The pieces and borders "
            "reproduce Mapuche textile iconography. The name is in Mapudungun and "
            "both it and the motifs must be sourced from the author."),
        requiere_fuente_mapuche=True,
    ),
    "behance-114589235": dict(  # paletas de colores
        titulo_real="Paletas de colores",
        categoria="estudio de color · pieza de método",
        curaduria_es=(
            "Estudio de color: paletas extraídas de fotografías propias. Seis "
            "láminas. Es una pieza de método, no de obra —el material viene de "
            "otros volúmenes del archivo, incluida «Princesa Yuyo», y una lámina "
            "muestra la escenografía de Quinto Fuego ya montada e iluminada. "
            "Aquí el color es el tema; más tarde su ausencia será la obra."),
        curaduria_en=(
            "Colour study: palettes extracted from the author's own photographs. "
            "Six plates. A methodological piece rather than a work —the source "
            "imagery comes from other volumes in the archive, including «Princesa "
            "Yuyo», and one plate shows the Quinto Fuego stage built and lit. "
            "Here colour is the subject; later its absence will be the work."),
    ),
}


def main() -> int:
    if not MANIFIESTO.exists():
        print(f"no está {MANIFIESTO}", file=sys.stderr)
        return 1

    aplicar = "--aplicar" in sys.argv
    m = json.loads(MANIFIESTO.read_text())

    conteos, fichas, sin_raw = [], [], []

    for v in m["volumenes"]:
        vid = v["id"]
        n = originales(vid)
        # Primero que nada, y para TODOS: el `continue` de más abajo se lo
        # saltaba y sólo 7 volúmenes lo recibían.
        v["obras_reales"] = n or None

        for campo in ("curaduria_es", "curaduria_en"):
            for viejo, nuevo in ARITMETICA.get(vid, []):
                if viejo in (v.get(campo) or ""):
                    v[campo] = v[campo].replace(viejo, nuevo)
                    conteos.append(f"{vid}: «{viejo}» → «{nuevo}» (aritmética)")

        if vid in REESCRITAS:
            if n == 0:
                sin_raw.append(vid)
            else:
                v.update(REESCRITAS[vid])
                fichas.append(f"{vid} · {v.get('titulo_real') or v.get('titulo')}")

        # Conteo. Dos cuidados aprendidos del ensayo:
        #
        # · Las fichas reescritas arriba YA traen el número bueno. Volver a
        #   pasarles el corrector las rompía.
        # · Buscar «piezas» a secas agarra otros usos de la palabra —«Las piezas
        #   se nombran desde el mapudungun»— y los reemplazaba por un numeral,
        #   destrozando la frase. Sólo cuenta un NUMERAL seguido de «piezas».
        if vid in REESCRITAS:
            continue

        c = v.get("curaduria_es") or ""
        palabra = PALABRA.get(n)
        if not (c and n and palabra):
            continue

        patron = re.compile(
            r"\b(" + "|".join(sorted(NUMERALES, key=len, reverse=True)) + r")\s+piezas\b",
            re.IGNORECASE)
        mm = patron.search(c)
        if not mm:
            continue
        if NUMERALES[mm.group(1).lower()] == n:
            continue  # ya estaba bien

        v["curaduria_es"] = c[:mm.start()] + f"{palabra} láminas" + c[mm.end():]
        conteos.append(f"{vid}: «{mm.group(0)}» → «{palabra} láminas» (raw={n})")

        ci = v.get("curaduria_en") or ""
        mi = re.compile(
            r"\b(" + "|".join(sorted(INGLESES, key=len, reverse=True)) + r")\s+pieces\b",
            re.IGNORECASE).search(ci)
        if mi:
            v["curaduria_en"] = ci[:mi.start()] + f"{INGLES[n]} plates" + ci[mi.end():]

    if aplicar:
        MANIFIESTO.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n")

    print(f"fichas reescritas por encuadre : {len(fichas)}")
    for f in fichas:
        print(f"  · {f}")
    print(f"\nconteos corregidos             : {len(conteos)}")
    for c in conteos:
        print(f"  · {c}")
    if sin_raw:
        print(f"\nsin raw/, no se tocaron: {', '.join(sin_raw)}")
    print("\n" + ("manifiesto actualizado" if aplicar else "(ensayo — usar --aplicar)"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
