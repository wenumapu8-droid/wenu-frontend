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
    # CORRECCIÓN (V-06 de la auditoría, y era error mío): la primera versión de
    # esta ficha describía la greca escalonada de `tribe-01`, pero el hero que
    # la lámina muestra es `patrones-01`, que es la roseta. El volumen tiene DOS
    # series y la curaduría hablaba de la que no se ve. Ahora abre por lo que
    # efectivamente está en pantalla y nombra las dos.
    "tribu": dict(
        titulo="TRIBU / Tribe",
        marco="documentado",
        # El largo importa: la ficha tiene que entrar en el panel `03 · CURADURÍA`
        # sin cortarse. Una primera versión de 652 caracteres dejaba el inglés
        # truncado a media frase en 1440×900. Techo práctico: ~440.
        curaduria_es=(
            "Dos series en un volumen. Una roseta de trazo fino, repetida en retícula alterna sobre fondo "
            "claro, sin costura visible. Y su reverso: trama escalonada en saturación óptica, grecas de "
            "ángulo recto que se espejan hasta hacer vibrar el ojo, cerradas por una cenefa de meandro en "
            "negro pleno. Una respira; la otra aprieta. El vocabulario de la segunda pertenece a la "
            "gramática textil andina y del sur del continente; su atribución precisa es de la fuente del "
            "autor, no de esta ficha."
        ),
        curaduria_en=(
            "Two series in one volume. A fine-line rosette, repeated on an alternating grid over a light "
            "ground, with no visible seam. And its reverse: stepped weave in optical saturation, "
            "right-angled fretwork mirroring until the eye vibrates, closed by a meander band in solid "
            "black. One breathes; the other tightens. The second's vocabulary belongs to the textile "
            "grammar of the Andes and the southern cone; its precise attribution is the author's source, "
            "not this record."
        ),
        resonancias=["gramática textil", "op-art", "simetría especular", "cenefa", "dos series"],
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
        # Ampliada tras mirar la obra: el hallazgo es que la roseta del logo es
        # LA MISMA de `patrones` (2021) y de los sigilos del archivo.
        curaduria_es=(
            "Identidad, packaging y fotografía para una marca de elixires, 2024. Lata con degradado de "
            "verde a rojo sobre fondo rosa, hongos secos y roca volcánica en el set: bodegón de producto "
            "con puesta de escena. **El sello de la marca es la misma roseta de trazo fino que aparece en "
            "«patrones» en 2021 y en los sigilos del archivo — el motivo cruza trece años y cambia de "
            "función: de patrón textil a marca comercial. Ciento veintitrés piezas, el volumen más extenso."
        ),
        curaduria_en=(
            "Identity, packaging and photography for an elixir brand, 2024. A can graded from green to red "
            "against pink, with dried mushrooms and volcanic rock in the set: product still life with "
            "staging. **The brand mark is the same fine-line rosette that appears in “patrones” in 2021 "
            "and in the archive sigils — the motif crosses thirteen years and changes function: from "
            "textile pattern to commercial mark. One hundred and twenty-three pieces, the largest volume."
        ),
        resonancias=["roseta", "continuidad del motivo", "packaging", "bodegón de producto"],
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
    # CORREGIDA tras mirar la lámina. La versión anterior salía de los metadatos
    # y decía "metodología y no imagen" — es las dos cosas. Y omitía lo que la
    # propia lámina declara al pie: es un trabajo ACADÉMICO y va CO-FIRMADO.
    # Atribuirlo entero a Ocín habría sido un error de crédito.
    "behance-116131849": dict(
        titulo="Aborígenes Cósmicos — intervenciones",
        marco="documentado",
        curaduria_es=(
            "Axonometría isométrica de una intervención nocturna: barra, pista, cabina, cola de entrada y "
            "cincuenta y tantas figuras en movimiento, resueltas en naranja, magenta y azul plenos. Un "
            "plano de servicio dibujado como escena. Trabajo de taller en Duoc UC —Diseño de Servicios y "
            "Experiencias, docente Luis Elizondo O.— **firmado junto a Nicolás Silva**. El título nombra "
            "el cruce que años después organiza todo KODEX, y aquí aparece por primera vez."
        ),
        curaduria_en=(
            "Isometric axonometry of a nightlife intervention: bar, dance floor, booth, entrance queue and "
            "some fifty figures in motion, resolved in flat orange, magenta and blue. A service blueprint "
            "drawn as a scene. Studio work at Duoc UC —Service and Experience Design, tutor Luis Elizondo "
            "O.— co-signed with Nicolás Silva. The title names the crossing that years later organizes "
            "all of KODEX, and here it appears for the first time."
        ),
        resonancias=["axonometría", "diseño de servicios", "neo-ancestral", "obra en coautoría"],
        coautoria="Nicolás Silva · Nicolás Ortega G. (Duoc UC)",
    ),
    "behance-116132027": dict(
        titulo="Hidro Espiral Solar — prototipo",
        marco="documentado",
        curaduria_es=(
            "Torre de cultivo vertical: una hélice blanca que envuelve una columna central, con la "
            "plantación asomando en rojo y verde por cada vuelta. Render limpio sobre fondo neutro, sin "
            "contexto ni escala — el objeto solo. Cuarenta y dos piezas, 2021. La espiral aparece aquí "
            "resolviendo un problema de superficie y de riego, años antes de volverse figura simbólica en "
            "el resto del archivo."
        ),
        curaduria_en=(
            "Vertical growing tower: a white helix wrapping a central column, with planting emerging in red "
            "and green at every turn. Clean render on a neutral ground, no context and no scale — the "
            "object alone. Forty-two pieces, 2021. The spiral appears here solving a problem of surface and "
            "irrigation, years before it becomes a symbolic figure elsewhere in the archive."
        ),
        resonancias=["espiral", "cultivo vertical", "render de objeto"],
    ),
    # CORREGIDA mirando la lámina. La versión anterior decía "proyecto premiado,
    # tercer lugar en concurso" —que sale del título de Behance— y no decía QUÉ
    # es el objeto ni que es trabajo académico con créditos de terceros.
    "behance-116130919": dict(
        titulo="SONORA — mesa de centro",
        marco="documentado",
        curaduria_es=(
            "Mesa de centro con caja de resonancia: forma cúbica pensada como recinto acústico, con "
            "parlante inalámbrico integrado. Lámina de examen del Taller de Producto Centrado en el "
            "Usuario, Duoc UC Plaza Oeste, profesor Iván Orrego Salcedo; la lámina firma «Alumno: Rodrigo "
            "Nicolás Ortega». El título de la publicación le atribuye un tercer lugar en concurso. Seis "
            "piezas, 2021."
        ),
        curaduria_en=(
            "A coffee table built as a resonance box: cubic form conceived as an acoustic enclosure, with "
            "an integrated wireless speaker. Exam board from the User-Centred Product studio, Duoc UC Plaza "
            "Oeste, tutor Iván Orrego Salcedo; the board is signed “Alumno: Rodrigo Nicolás Ortega”. The "
            "publication's title credits it with third place in a competition. Six pieces, 2021."
        ),
        resonancias=["diseño industrial", "acústica", "lámina de examen", "obra académica"],
        credito_en_lamina="Alumno: Rodrigo Nicolás Ortega · Profesor: Iván Orrego Salcedo (Duoc UC)",
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
            "El cuerpo del animal como problema constructivo, y resuelto en fierro: una armadura "
            "triangulada de acero soldado, del largo de un remolque, fotografiada en terreno el día que se "
            "trasladó. No es una maqueta ni un render — se construyó. Treinta y tres piezas entre "
            "estructura, montaje y exhibición."
        ),
        curaduria_en=(
            "The animal's body as a construction problem, solved in steel: a welded triangulated armature "
            "the length of a trailer, photographed on site the day it was moved. Not a model and not a "
            "render — it was built. Thirty-three pieces across structure, assembly and exhibition."
        ),
        resonancias=["gran escala", "estructura triangulada", "obra construida", "exhibición"],
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
    # ── Segunda tanda ───────────────────────────────────────────────────────
    # Hallazgo al mirar los raw: `tribu`, `disco-solar` y `achroma` comparten
    # UNA MISMA gramática formal —greca escalonada, meandro, rombo con centro,
    # trazo granulado de textil— aplicada a tres soportes distintos. No es
    # repetición: es un vocabulario. Queda dicho en las tres fichas.
    "achroma": dict(
        titulo="ACHROMA — ediciones en blanco y negro",
        marco="ficcion",
        curaduria_es=(
            "Corona de motivos escalonados en blanco hueso sobre negro absoluto, cerrada en anillo "
            "alrededor de un disco vacío. El trazo tiene grano de bordado —punto contado, no línea— y el "
            "centro no está ocupado por nada: es el fondo mismo. Un eclipse hecho con vocabulario textil. "
            "Treinta y seis ediciones de colección; la ausencia de color es la obra, no una reducción de ella."
        ),
        curaduria_en=(
            "A crown of stepped motifs in bone white on absolute black, closed into a ring around an empty "
            "disc. The stroke has the grain of embroidery —counted stitch, not line— and the centre holds "
            "nothing: it is the ground itself. An eclipse built from textile vocabulary. Thirty-six "
            "collector editions; the absence of colour is the work, not a reduction of it."
        ),
        resonancias=["Sol Negro", "Nigredo", "eclipse", "punto contado", "vacío como centro"],
    ),
    "disco-solar": dict(
        titulo="DISCO SOLAR / Solar Disc",
        marco="ficcion",
        curaduria_es=(
            "Un disco de piedra partido en cuatro cuartos que giran sobre un centro encendido. Los anillos "
            "llevan greca escalonada y rombos con centro; el núcleo es una almendra de luz magenta con un "
            "sello romboidal adentro. Es la misma gramática de TRIBU y ACHROMA llevada al relieve y al "
            "único color que el sistema admite sobre negro. Treinta y tres piezas: disco, órbita, eclipse."
        ),
        curaduria_en=(
            "A stone disc split into four quarters turning on a lit centre. The rings carry stepped fretwork "
            "and centred lozenges; the core is a magenta almond of light with a rhomboid seal inside. The "
            "same grammar as TRIBU and ACHROMA, taken into relief and into the single colour the system "
            "allows over black. Thirty-three pieces: disc, orbit, eclipse."
        ),
        resonancias=["disco solar", "vesica / almendra", "cuaternidad", "acento único sobre negro"],
    ),
    "posters": dict(
        titulo="LÁMINAS TRANSMITIDAS / Transmitted Plates",
        marco="ficcion",
        curaduria_es=(
            "Cincuenta y cinco láminas enviadas sin título, una a una, por mensajería. No son ilustraciones "
            "del sistema: son sus planos. Entre ellas está la lámina que fija los ocho organismos visuales y "
            "los ocho tratamientos con sus parámetros exactos, y de la que sale el motor. Se conservan sin "
            "nombre porque así llegaron."
        ),
        curaduria_en=(
            "Fifty-five plates sent untitled, one by one, over messaging. They are not illustrations of the "
            "system: they are its blueprints. Among them is the plate that fixes the eight visual organisms "
            "and the eight treatments with their exact parameters, from which the engine derives. They are "
            "kept unnamed because that is how they arrived."
        ),
        resonancias=["plano de construcción", "transmisión", "ocho organismos", "sin título"],
    ),
    "pinterest": dict(
        titulo="PIN-PLACAS / Pin Plates",
        marco="documentado",
        curaduria_es=(
            "Quince placas del archivo preparadas para circular: título, descripción y texto alternativo "
            "escritos uno por uno, en inglés y con etiquetas. Es el volumen donde la obra se traduce a la "
            "lengua de las plataformas sin perder su nombre — cada pieza sigue apuntando al archivo."
        ),
        curaduria_en=(
            "Fifteen archive plates prepared to circulate: title, description and alt text written one by "
            "one, in English and tagged. This is the volume where the work is translated into platform "
            "language without losing its name — each piece still points back to the archive."
        ),
        resonancias=["difusión", "texto alternativo", "accesibilidad"],
    ),
    "printful": dict(
        titulo="APLICACIONES FÍSICAS / Physical Applications",
        marco="documentado",
        curaduria_es=(
            "Nueve pruebas de la obra fuera de la pantalla: póster, sticker, remera. Es el único volumen "
            "donde el archivo se enfrenta al soporte real —tinta, tela, escala de cuerpo— y donde el negro "
            "deja de ser luz apagada para ser pigmento."
        ),
        curaduria_en=(
            "Nine tests of the work off-screen: poster, sticker, shirt. The only volume where the archive "
            "meets a real substrate —ink, fabric, body scale— and where black stops being unlit light and "
            "becomes pigment."
        ),
        resonancias=["soporte físico", "tinta sobre papel", "escala de cuerpo"],
    ),
    "boveda": dict(
        titulo="LA BÓVEDA / The Vault",
        marco="documentado",
        curaduria_es=(
            "Cuarenta notas de trabajo: estrategia, fórmulas, cosmología, decisiones de contenido. No es "
            "obra terminada — es el cuaderno donde se decide qué entra al archivo y con qué regla. Se "
            "conserva porque el criterio también es material."
        ),
        curaduria_en=(
            "Forty working notes: strategy, formulas, cosmology, content decisions. Not finished work — the "
            "notebook where it is decided what enters the archive and under which rule. It is kept because "
            "criteria are material too."
        ),
        resonancias=["cuaderno de trabajo", "criterio", "proceso"],
    ),
    "atlas": dict(
        titulo="ATLAS — Cosmogonías Antiguas Vol. I · Infinito",
        marco="documentado",
        curaduria_es=(
            "Dos volúmenes en PDF que ordenan el fondo del proyecto: el Atlas de Cosmogonías Antiguas y el "
            "Atlas Físico Operativo. Es donde se separan los dos registros que el resto del archivo respeta "
            "—lo documentado y lo mítico— y de donde sale la vara de curaduría."
        ),
        curaduria_en=(
            "Two PDF volumes that organize the project's background: the Atlas of Ancient Cosmogonies and "
            "the Operative Physical Atlas. This is where the two registers the rest of the archive honours "
            "are separated —the documented and the mythic— and where the curatorial standard comes from."
        ),
        resonancias=["dos registros", "vara de curaduría", "cosmogonía comparada"],
    ),
    "mandalas": dict(
        titulo="MANDALAS — obra en JSON",
        marco="documentado",
        curaduria_es=(
            "Cuatro mandalas guardados no como imagen sino como instrucciones: trazos con rotación y espejo, "
            "en JSON. Es el volumen que muestra que en este archivo la obra no es el archivo exportado — es "
            "la regla que lo genera, y por eso se puede volver a dibujar a cualquier tamaño."
        ),
        curaduria_en=(
            "Four mandalas stored not as image but as instructions: strokes with rotation and mirroring, in "
            "JSON. The volume that shows that here the work is not the exported file — it is the rule that "
            "generates it, and can therefore be redrawn at any size."
        ),
        resonancias=["obra generativa", "mandala como el Self (Jung)", "regla antes que resultado"],
    ),
    "prototipos": dict(
        titulo="PROTOTIPOS — shaders y laboratorio",
        marco="documentado",
        curaduria_es=(
            "Shaders, prototipos HTML y capturas del laboratorio. Es el registro de lo que todavía no "
            "funciona: la parte del archivo que se conserva por lo que enseña y no por lo que muestra."
        ),
        curaduria_en=(
            "Shaders, HTML prototypes and lab captures. The record of what does not work yet: the part of "
            "the archive kept for what it teaches rather than for what it shows."
        ),
        resonancias=["laboratorio", "shader", "prueba y error"],
    ),
    "sistemas": dict(
        titulo="SISTEMAS — gramática visual abierta",
        marco="documentado",
        curaduria_es=(
            "Pack SVG, gramática visual, tipografía y micro-elementos. Las piezas sueltas con las que se "
            "arma todo lo demás: márgenes, sellos, barcodes, rótulos. Nada de esto es una obra; todo esto "
            "está adentro de cada obra."
        ),
        curaduria_en=(
            "SVG pack, visual grammar, typography and micro-elements. The loose parts everything else is "
            "assembled from: margins, seals, barcodes, labels. None of it is a work; all of it is inside "
            "every work."
        ),
        resonancias=["gramática visual", "sistema de diseño", "micro-elementos"],
    ),
    "giphy": dict(
        titulo="GIPHY — herramienta de curaduría",
        marco="documentado",
        curaduria_es=(
            "Herramienta local para curar material en movimiento. Se conserva como volumen porque en este "
            "archivo las herramientas también se catalogan: lo que se usa para elegir forma parte de lo elegido."
        ),
        curaduria_en=(
            "Local tool for curating moving material. Kept as a volume because in this archive tools are "
            "catalogued too: what is used to choose is part of what is chosen."
        ),
        resonancias=["herramienta", "imagen en movimiento", "curaduría"],
    ),
    "codex-estelar": dict(
        titulo="CODEX ESTELAR — los cuatro libros",
        marco="ficcion",
        curaduria_es=(
            "Cuatro tomos de lore: La Génesis de la Luz, El Pacto de Nibiru, El Engaño de los Templos y El "
            "ADN Sagrado. Es el registro mítico del proyecto, marcado como ficción y sostenido aparte de "
            "todo lo documentado. Ninguna de sus afirmaciones es histórica, científica ni sanitaria."
        ),
        curaduria_en=(
            "Four volumes of lore: The Genesis of Light, The Pact of Nibiru, The Deception of the Temples "
            "and The Sacred DNA. The project's mythic register, marked as fiction and held apart from "
            "everything documented. None of its claims are historical, scientific or medical."
        ),
        resonancias=["registro mítico", "sello B", "cosmogonía propia"],
    ),
    "portafolio": dict(
        titulo="PORTAFOLIO — book de obra",
        marco="documentado",
        curaduria_es=(
            "Book de obra del autor: mandalas, rosetones y series reunidas en un solo documento. Es la "
            "versión que existía antes de que hubiera archivo, y sirve para ver qué había ya y qué apareció "
            "con el sistema."
        ),
        curaduria_en=(
            "The author's portfolio book: mandalas, rose windows and series gathered into a single "
            "document. The version that existed before there was an archive, useful for seeing what was "
            "already there and what appeared with the system."
        ),
        resonancias=["antes del sistema", "rosetón", "compilación"],
    ),
    "behance-114559111": dict(
        titulo="princesa yuyo",
        marco="documentado",
        curaduria_es=(
            "Styleframing y fotografía de moda, 2021. Nueve piezas. Trabajo de dirección visual sobre cuerpo "
            "y vestuario, anterior al sistema de blanco y negro."
        ),
        curaduria_en=(
            "Styleframing and fashion photography, 2021. Nine pieces. Visual direction over body and "
            "wardrobe, predating the black-and-white system."
        ),
        resonancias=["styleframe", "moda", "dirección visual"],
    ),
    "behance-114563539": dict(
        titulo="render",
        marco="documentado",
        curaduria_es=(
            "Diseño industrial y de mobiliario con render 3D, 2021. Treinta y tres piezas. El volumen más "
            "técnico del portafolio: materia, medida y luz calculada."
        ),
        curaduria_en=(
            "Industrial and furniture design with 3D rendering, 2021. Thirty-three pieces. The portfolio's "
            "most technical volume: matter, measure and computed light."
        ),
        resonancias=["render", "mobiliario", "luz calculada"],
    ),
    "behance-114589235": dict(
        titulo="paletas de colores",
        marco="documentado",
        curaduria_es=(
            "Dirección de arte y estudio de color, 2021. Dieciocho piezas. Es el reverso exacto de lo que el "
            "archivo haría después: aquí el color es el tema, y más tarde su ausencia será la obra."
        ),
        curaduria_en=(
            "Art direction and colour study, 2021. Eighteen pieces. The exact reverse of what the archive "
            "would later do: here colour is the subject; later its absence becomes the work."
        ),
        resonancias=["paleta", "estudio de color", "antes del blanco y negro"],
    ),
    # CORREGIDA. Mi ficha decía "canil de mascotas, encargo concreto, 2021".
    # La lámina se titula PROYECTO COLABORATIVO / GEORODER y el objeto es otra
    # cosa: una carpa plegable para mascotas acoplada a un tráiler teardrop.
    "behance-116132939": dict(
        titulo="OUTSIDE — proyecto colaborativo con GeoRoder",
        marco="documentado",
        curaduria_es=(
            "Carpa plegable para mascotas acoplada a un tráiler teardrop, desarrollada en co-creación con "
            "GeoRoder para el concurso Turismo con Diseño 2019. La lámina no es un producto: es un sistema "
            "—persona usuaria, matriz de requisitos, mapa de sistema con quince entidades y un customer "
            "journey de quince fases con su curva emocional—. Taller de Sistema Producto TSD5011, Duoc UC "
            "Plaza Oeste, docente Luis Elizondo O. Treinta piezas."
        ),
        curaduria_en=(
            "A folding pet tent that attaches to a teardrop trailer, co-created with GeoRoder for the 2019 "
            "Turismo con Diseño competition. The board is not a product: it is a system —user persona, "
            "requirements matrix, a system map with fifteen entities, and a fifteen-stage customer journey "
            "with its emotional curve. Product System studio TSD5011, Duoc UC Plaza Oeste, tutor Luis "
            "Elizondo O. Thirty pieces."
        ),
        resonancias=["co-creación", "mapa de sistema", "customer journey", "obra académica"],
        credito_en_lamina="Docente: Luis Elizondo O. · Alumno: Nicolás Ortega G. · Co-creación: GeoRoder (Duoc UC)",
    ),
    "behance-116149759": dict(
        titulo="Santiago",
        marco="documentado",
        curaduria_es=(
            "Moda, fotografía y arquitectura, 2021. Seis piezas. La ciudad como escenario y como material: "
            "geometría construida antes de que la geometría se volviera signo."
        ),
        curaduria_en=(
            "Fashion, photography and architecture, 2021. Six pieces. The city as stage and as material: "
            "built geometry before geometry became sign."
        ),
        resonancias=["ciudad", "arquitectura", "geometría construida"],
    ),
    "behance-242737721": dict(
        titulo="MTG cortinas roller",
        marco="documentado",
        curaduria_es=(
            "Gráfica publicitaria y diseño industrial para una marca de cortinas, 2026. Doce piezas. Es el "
            "trabajo comercial más reciente del archivo y se conserva sin jerarquía respecto del resto: el "
            "oficio también es obra."
        ),
        curaduria_en=(
            "Advertising graphics and industrial design for a blinds brand, 2026. Twelve pieces. The "
            "archive's most recent commercial work, kept without hierarchy relative to the rest: the trade "
            "is work too."
        ),
        resonancias=["encargo comercial", "gráfica aplicada"],
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


def limpiar(texto: str) -> str:
    """Quita el énfasis de markdown de una ficha.

    La lámina dibuja `curaduria_*` como TEXTO PLANO. Un `**así**` no se ve en
    negrita: se ve con los asteriscos. Me pasó al escribir la ficha de
    `behance-116131849` y quedó `**firmado junto a Nicolás Silva**` a la vista
    en la página.

    Se sanea acá y no en cada string porque el error es fácil de repetir —uno
    escribe en markdown por costumbre— y una regla que se aplica sola no se
    olvida.
    """
    if not isinstance(texto, str):
        return texto
    return texto.replace("**", "").replace("__", "")


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
        vol.update({k: limpiar(v) if k.startswith("curaduria") else v
                    for k, v in campos.items()})
        if json.dumps(vol, ensure_ascii=False, sort_keys=True) != antes:
            tocados += 1

    MANIFIESTO.write_text(json.dumps(m, ensure_ascii=False, indent=2) + "\n")

    mapuche = [k for k, v in CURADURIA.items() if v.get("requiere_fuente_mapuche")]
    print(f"curados: {tocados}/{len(m['volumenes'])} volúmenes")
    print(f"esperando sources/ para mapudungun: {len(mapuche)} -> {', '.join(mapuche)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
