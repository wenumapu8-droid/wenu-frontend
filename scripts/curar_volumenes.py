#!/usr/bin/env python3
"""
Curaduría rica de los volúmenes de opencode.

POR QUÉ ESTE SCRIPT Y NO EDICIÓN A MANO
---------------------------------------
El manifiesto es JSON generado. Editarlo a mano rompe el orden de claves y hace
ilegible el diff. Acá cada volumen se parchea por id, se preserva el resto tal
cual, y el diff muestra exactamente qué cambió.

CRITERIO (la vara es KODEX-CONTENT-ATLAS.md)
--------------------------------------------
· `titulo`      — el REAL, de project.json, sin el sufijo del autor.
· `curaduria_*` — bilingüe, describiendo la obra y no la categoría de Behance.
                  Lo que se afirma sobre las imágenes es lo que se vio.
· `marco`       — el registro del atlas: "documentado" (sello A) o "ficcion"
                  (sello B). Un portafolio de diseño es documentado; el lore
                  del Codex Estelar es ficción. Nunca se mezclan.
· `resonancias` — conceptos del atlas con los que el volumen dialoga. Son
                  puentes de lectura, no afirmaciones sobre la obra.

LO QUE ESTE SCRIPT NO HACE, Y ES DELIBERADO
-------------------------------------------
No glosa ni traduce las palabras en MAPUDUNGUN de los títulos (Wenu Mapu,
Weñelfe, Yayentru, TranaluÜkai). El atlas es explícito: "mapuche preciso y
central", "respeto + atribución cultural", y la instrucción fue usar `sources/`
TAL CUAL. `sources/` no está en este clon. Inventar una traducción sería
exactamente lo que la regla prohíbe.

Esos volúmenes quedan marcados con `requiere_fuente_mapuche: true` y su
curaduría describe la obra sin afirmar nada sobre la lengua. Cuando llegue
`sources/`, se completan desde ahí.
"""
import json
import pathlib
import sys

MANIFIESTO = pathlib.Path("public/kodex-content/opencode/manifest.json")

# ── La curaduría ────────────────────────────────────────────────────────────
# Sólo se afirma sobre las imágenes lo que se miró. Donde no se miró, la
# curaduría se apoya en metadatos verificables (título real, fecha, cantidad de
# piezas, tratamientos presentes) y no describe lo que no se vio.

CURADURIA = {
    # ── Series centrales del archivo KODEX ──────────────────────────────────
    "archivo": dict(
        titulo="EL ARCHIVO / The Archive",
        marco="ficcion",
        curaduria_es=(
            "Cincuenta y dos placas donde la fotografía de arquitectura se pliega sobre su propio "
            "eje hasta volverse mandala. El material de partida es reconocible —vigas, cables, "
            "estructuras vistas desde abajo— y el espejado radial lo convierte en signo: lo que era "
            "un techo pasa a ser una corola. Blanco y negro sin gris de transición, contraste llevado "
            "al límite. Del patrón brota el signo; del signo, la memoria. El archivo no almacena: recuerda."
        ),
        curaduria_en=(
            "Fifty-two plates in which architectural photography folds over its own axis until it "
            "becomes a mandala. The source material stays recognizable —beams, cables, structures seen "
            "from below— and radial mirroring turns it into a sign: what was a ceiling becomes a corolla. "
            "Black and white with no transitional grey, contrast pushed to its limit. Pattern births the "
            "sign; the sign births memory. The archive does not store: it remembers."
        ),
        resonancias=["geometría sagrada", "mandala como el Self (Jung)", "correspondencia hermética",
                     "sigilo", "simetría radial"],
    ),
    "behance-239877895": dict(
        titulo="KODEX−∞ // Arquitecturas Tecno-Tribales",
        marco="ficcion",
        curaduria_es=(
            "«YAYENTRU» reúne geometrías vivas que operan como códigos neo-ancestrales: estructuras "
            "tecno-tribales donde el caos primario se reorganiza en patrón. Ciento ocho piezas, la serie "
            "más extensa del archivo, y la que da nombre a uno de los seis estratos. Cada pieza funciona "
            "como sigilo generativo: no ilustra un símbolo, lo produce."
        ),
        curaduria_en=(
            "“YAYENTRU” gathers living geometries that work as neo-ancestral codes: techno-tribal "
            "structures where primary chaos reorganizes into pattern. One hundred and eight pieces —the "
            "archive's longest series, and the one that names one of the six strata. Each piece behaves "
            "as a generative sigil: it does not illustrate a symbol, it produces one."
        ),
        resonancias=["sigilo generativo", "estrato Yayentru", "patrón y memoria", "proto-portal"],
        requiere_fuente_mapuche=True,
    ),
    "tribu": dict(
        titulo="TRIBU / Tribe",
        marco="documentado",
        curaduria_es=(
            "Trama escalonada llevada a saturación óptica. Grecas de ángulo recto que se repiten, se "
            "espejan y convergen en un punto de fuga central hasta producir vibración en el ojo; abajo, "
            "una cenefa de meandro corrido en negro pleno. El vocabulario formal —escalonado, meandro, "
            "rombo con centro— pertenece a la gramática textil andina y del sur del continente, y su "
            "atribución precisa corresponde a la fuente del autor, no a esta ficha."
        ),
        curaduria_en=(
            "Stepped weave pushed to optical saturation. Right-angled fretwork repeats, mirrors and "
            "converges on a central vanishing point until the eye vibrates; below, a running meander band "
            "in solid black. The formal vocabulary —stepped fret, meander, centred lozenge— belongs to the "
            "textile grammar of the Andes and the southern cone, and its precise attribution belongs to "
            "the author's source, not to this record."
        ),
        resonancias=["gramática textil", "op-art", "simetría especular", "cenefa"],
        requiere_fuente_mapuche=True,
    ),

    # ── Portafolio de diseño (registro documentado) ─────────────────────────
    "behance-114558929": dict(
        titulo="patrones",
        marco="documentado",
        curaduria_es=(
            "Patrón de repetición continua sobre fondo blanco: una roseta de trazo fino, con centro "
            "macizo y corona de púas, distribuida en retícula alterna. Diseño de superficie —pensado para "
            "repetirse sin costura visible— y primer registro fechado del motivo radial que después "
            "atraviesa todo el archivo."
        ),
        curaduria_en=(
            "Seamless repeat pattern on white: a fine-line rosette with a solid core and a spiked crown, "
            "laid out on an alternating grid. Surface design —built to tile without a visible seam— and "
            "the earliest dated appearance of the radial motif that later runs through the whole archive."
        ),
        resonancias=["diseño de superficie", "roseta", "retícula", "motivo radial"],
    ),
    "behance-114619815": dict(
        titulo="Wenu Mapu",
        marco="documentado",
        curaduria_es=(
            "Joyería y diseño de piezas de artesanía, 2021. Trabajo de oficio: metal, forma y repetición "
            "a escala de cuerpo. El nombre de la serie está en mapudungun y su significado debe citarse "
            "desde la fuente del autor."
        ),
        curaduria_en=(
            "Jewelry and craft object design, 2021. Workshop practice: metal, form and repetition at body "
            "scale. The series title is in Mapudungun and its meaning must be cited from the author's source."
        ),
        resonancias=["oficio", "escala de cuerpo", "repetición"],
        requiere_fuente_mapuche=True,
    ),
    "behance-116138363": dict(
        titulo="TranaluÜkai",
        marco="documentado",
        curaduria_es=(
            "Diseño de producto con desarrollo técnico: ilustración, moda y dibujo asistido. El nombre "
            "está en mapudungun y su significado debe citarse desde la fuente del autor."
        ),
        curaduria_en=(
            "Product design with technical development: illustration, fashion and CAD. The title is in "
            "Mapudungun and its meaning must be cited from the author's source."
        ),
        resonancias=["diseño de producto", "dibujo técnico"],
        requiere_fuente_mapuche=True,
    ),
    "behance-212029615": dict(
        titulo="Weñelfe desk grafic",
        marco="documentado",
        curaduria_es=(
            "Dirección de arte e ilustración, 2024. El nombre está en mapudungun y su significado debe "
            "citarse desde la fuente del autor."
        ),
        curaduria_en=(
            "Art direction and illustration, 2024. The title is in Mapudungun and its meaning must be "
            "cited from the author's source."
        ),
        resonancias=["dirección de arte", "ilustración"],
        requiere_fuente_mapuche=True,
    ),
    "behance-166523785": dict(
        titulo="Wenü Mapü Online — propuesta de e-commerce",
        marco="documentado",
        curaduria_es=(
            "Propuesta completa de comercio electrónico, 2023: sesenta y nueve piezas entre identidad, "
            "interfaz y presentación. Es el antecedente directo del sitio donde hoy vive KODEX, y el "
            "volumen que muestra el pasaje del oficio de taller al sistema digital."
        ),
        curaduria_en=(
            "Full e-commerce proposal, 2023: sixty-nine pieces spanning identity, interface and "
            "presentation. It is the direct antecedent of the site KODEX now lives in, and the volume "
            "that shows the passage from workshop practice to digital system."
        ),
        resonancias=["identidad visual", "sistema digital", "interfaz"],
        requiere_fuente_mapuche=True,
    ),
    "behance-212025419": dict(
        titulo="Soma mushroom elixir",
        marco="documentado",
        curaduria_es=(
            "Ciento veintitrés piezas de un proyecto integral, 2024: identidad, fotografía, packaging y "
            "diseño editorial para una marca de elixir. Es el volumen más extenso del portafolio y el que "
            "muestra el sistema visual completo aplicado a un producto real."
        ),
        curaduria_en=(
            "One hundred and twenty-three pieces from an integrated project, 2024: identity, photography, "
            "packaging and editorial design for an elixir brand. The portfolio's largest volume, and the "
            "one showing the full visual system applied to a real product."
        ),
        resonancias=["identidad de marca", "packaging", "editorial", "fotografía de producto"],
    ),
    "behance-212026161": dict(
        titulo="Ascensión a la Visión Solar",
        marco="ficcion",
        curaduria_es=(
            "Dirección de arte e ilustración, 2024. Doce piezas. Por título y tratamiento pertenece al "
            "registro simbólico del archivo —el sol como centro y como umbral— y no al portafolio de "
            "encargo."
        ),
        curaduria_en=(
            "Art direction and illustration, 2024. Twelve pieces. By title and treatment it belongs to the "
            "archive's symbolic register —the sun as centre and as threshold— rather than to commissioned work."
        ),
        resonancias=["Sol Negro", "umbral", "Rubedo"],
    ),
    "behance-115816289": dict(
        titulo="tribe space ⅓",
        marco="documentado",
        curaduria_es=(
            "Primer tercio de una serie de tres, 2021: gráfica y styleframing sobre el mismo vocabulario "
            "escalonado del volumen TRIBU. La numeración ⅓ es del autor y anuncia una obra en partes."
        ),
        curaduria_en=(
            "First third of a three-part series, 2021: graphics and styleframing over the same stepped "
            "vocabulary as the TRIBU volume. The ⅓ numbering is the author's and announces a work in parts."
        ),
        resonancias=["styleframing", "serie en partes", "gramática textil"],
    ),
    "behance-116131849": dict(
        titulo="Aborígenes Cósmicos — diseño de servicios",
        marco="documentado",
        curaduria_es=(
            "Cuarenta y ocho piezas de diseño de servicios, 2021. El título nombra el cruce que después "
            "organiza todo KODEX —lo ancestral y lo cósmico en una sola expresión— y aquí aparece por "
            "primera vez, aplicado a un trabajo de metodología y no de imagen."
        ),
        curaduria_en=(
            "Forty-eight service-design pieces, 2021. The title names the crossing that later organizes all "
            "of KODEX —the ancestral and the cosmic in a single phrase— and here it appears for the first "
            "time, applied to methodology rather than to image."
        ),
        resonancias=["diseño de servicios", "neo-ancestral", "metodología"],
    ),
    "behance-116132027": dict(
        titulo="Hidro Espiral Solar — prototipo",
        marco="documentado",
        curaduria_es=(
            "Prototipo de producto con desarrollo en CAD, 2021. Cuarenta y dos piezas. La espiral aparece "
            "aquí como solución de ingeniería antes de aparecer como figura simbólica en el resto del archivo."
        ),
        curaduria_en=(
            "Product prototype with CAD development, 2021. Forty-two pieces. The spiral shows up here as an "
            "engineering solution before it appears as a symbolic figure anywhere else in the archive."
        ),
        resonancias=["espiral", "prototipo", "dibujo técnico"],
    ),
    "behance-116130919": dict(
        titulo="SONORA — tercer lugar en concurso",
        marco="documentado",
        curaduria_es=(
            "Proyecto de diseño industrial premiado, 2021: tercer lugar en concurso. Seis piezas de "
            "presentación con desarrollo en CAD y render."
        ),
        curaduria_en=(
            "Award-winning industrial design project, 2021: third place in competition. Six presentation "
            "pieces with CAD development and rendering."
        ),
        resonancias=["diseño industrial", "concurso"],
    ),
    "behance-114560597": dict(
        titulo="quinto fuego",
        marco="documentado",
        curaduria_es=(
            "Diseño de escenografía y paisaje, 2021. Quince piezas. El fuego como elemento de montaje: "
            "espacio construido para una experiencia y no para una permanencia."
        ),
        curaduria_en=(
            "Set and landscape design, 2021. Fifteen pieces. Fire as a staging element: space built for an "
            "experience rather than for permanence."
        ),
        resonancias=["escenografía", "fuego como elemento", "efímero"],
    ),
    "behance-114560005": dict(
        titulo="ballena jorobada",
        marco="documentado",
        curaduria_es=(
            "Arquitectura y diseño de exhibición, 2021. Treinta y tres piezas en torno a una estructura de "
            "gran escala: el cuerpo del animal como problema constructivo."
        ),
        curaduria_en=(
            "Architecture and exhibition design, 2021. Thirty-three pieces around a large-scale structure: "
            "the animal's body as a construction problem."
        ),
        resonancias=["gran escala", "exhibición", "estructura"],
    ),
    "behance-114620487": dict(
        titulo="Catálogo 2019",
        marco="documentado",
        curaduria_es=(
            "Catálogo de joyería y artesanía, fotografiado con Nikon D5100. Dieciocho piezas. Es el "
            "registro más temprano del archivo: el oficio antes del sistema."
        ),
        curaduria_en=(
            "Jewelry and craft catalogue, shot on a Nikon D5100. Eighteen pieces. The archive's earliest "
            "record: the craft before the system."
        ),
        resonancias=["catálogo", "oficio", "fotografía de producto"],
    ),
    "behance-116133407": dict(
        titulo="Emanes (act3), Pichilemu",
        marco="documentado",
        curaduria_es=(
            "Serie fotográfica en Pichilemu, 2021. Treinta piezas, Nikon D5100. Trabajo de locación: luz "
            "de costa y territorio concreto, con nombre y lugar."
        ),
        curaduria_en=(
            "Photographic series in Pichilemu, 2021. Thirty pieces, Nikon D5100. Location work: coastal "
            "light and a concrete territory, with a name and a place."
        ),
        resonancias=["fotografía de locación", "territorio", "luz natural"],
    ),
}


def main() -> int:
    if not MANIFIESTO.exists():
        print(f"no está {MANIFIESTO}", file=sys.stderr)
        return 1

    m = json.loads(MANIFIESTO.read_text())
    por_id = {v["id"]: v for v in m["volumenes"]}

    faltantes = [k for k in CURADURIA if k not in por_id]
    if faltantes:
        print(f"ids que no existen en el manifiesto: {faltantes}", file=sys.stderr)
        return 1

    tocados = 0
    for vid, campos in CURADURIA.items():
        vol = por_id[vid]
        antes = json.dumps(vol, ensure_ascii=False, sort_keys=True)
        vol.update(campos)
        if json.dumps(vol, ensure_ascii=False, sort_keys=True) != antes:
            tocados += 1

    MANIFIESTO.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n")

    mapuche = [k for k, v in CURADURIA.items() if v.get("requiere_fuente_mapuche")]
    print(f"curados: {tocados}/{len(m['volumenes'])} volúmenes")
    print(f"esperando sources/ para mapudungun: {len(mapuche)} -> {', '.join(mapuche)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
