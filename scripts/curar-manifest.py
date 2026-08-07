#!/usr/bin/env python3
"""Curaduría del manifest — pasada sobre los volúmenes con review:true.

Regla dura: solo se afirma lo que está en public/kodex-content/sources/.
Lo que no se verifica ahí conserva review:true con una nota que dice qué falta.
Regla de los dos registros: ningún volumen documentado de raíz mapuche enlaza
a la ficción (KODEX ESTELAR / Nibiru / razas estelares), ni al revés.
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent / "public" / "kodex-content"
MANIFEST = ROOT / "manifest.json"

# Verificado contra sources/wenu-mapu.md (tabla de términos, 2026-08-01).
TERMINOS_WENU = (
    "2026-08-01 · verificados contra Canio & Pozo (2015); grafía del libro entre paréntesis: "
    "wüñelfe = lucero del alba / Venus, también guñelve (C&P: wüñellfe) · "
    "wangülen = estrellas (C&P: wanglen) · "
    "wenu leufü = río de arriba / Vía Láctea (C&P: Wenuleufu; también «Wangelen Leufu», río de estrellas). "
    "Registro transcrito a sources/wenu-mapu.md."
)

AISLAMIENTO = (
    "Volumen del registro documentado de raíz mapuche: no se enlaza a las razas estelares, "
    "Nibiru, Atlantis ni a ningún nodo del KODEX ESTELAR (ficción). El puente entre registros, "
    "si se quiere, es solo conceptual vía arquetipos, nunca presentando lo mapuche como ficción."
)

TONO = (
    "Sobrio, respetuoso, preciso. NO turístico, NO exotizante, NO new age, NO pan-indígena, "
    "NO «tribal genérico». Nombrar siempre pueblo y contexto (mapuche, Wallmapu). "
    "Sin claims espirituales inventados."
)

FUENTE_CP = (
    "Canio Llanquinao, M. & Pozo Menares, G. (2015). Wenumapu: astronomía y cosmología mapuche. "
    "Ocho Libros. ISBN 978-956-335-205-4."
)

# ── Curaduría por volumen ────────────────────────────────────────────────────
# 'review': False  → verificado en sources/, sale la marca.
# 'review': True   → queda marcado; review_nota dice exactamente qué falta.

CURADURIA = {

    # ── Registro documentado · raíz mapuche ─────────────────────────────────
    "doc-wenu-mapu": {
        "curaduria_es": (
            "Volumen-raíz del registro documentado. En la cosmovisión mapuche, Wenu Mapu es la "
            "tierra de arriba: el cielo entendido no como vacío sino como territorio habitado, con "
            "su propio orden. El espacio se estructura desde el Meli Witran Mapu, los cuatro puntos "
            "que orientan el mundo. La bóveda tiene sus astros propios —el sol (antü) y la luna "
            "(küyen)—, sus estrellas (wangülen) y el río de arriba que la cruza (wenu leufü, la Vía "
            "Láctea), con el lucero del alba (wüñelfe) abriendo la mañana. El ciclo se renueva en el "
            "We Tripantu, la nueva salida del sol en pleno invierno: el retorno de la luz, el "
            "comienzo que vuelve. Aquí el cielo no se contempla desde afuera; se habita, se orienta "
            "y se recuerda. Registro documentado (mapuche, Wallmapu), citado a Canio & Pozo (2015) y "
            "mantenido aparte de toda ficción."
        ),
        "curaduria_en": (
            "Root volume of the documented record. In Mapuche cosmology, Wenu Mapu is the land "
            "above: the sky understood not as emptiness but as inhabited territory with its own "
            "order. Space is structured from the Meli Witran Mapu, the four points that orient the "
            "world. The vault holds its own bodies —the sun (antü) and the moon (küyen)—, its stars "
            "(wangülen) and the river above that crosses it (wenu leufü, the Milky Way), with the "
            "morning star (wüñelfe) opening the day. The cycle renews at We Tripantu, the sun's new "
            "rising in deep winter: the return of light, the beginning that comes back. Here the sky "
            "is not observed from outside; it is inhabited, oriented, and remembered. Documented "
            "record (Mapuche, Wallmapu), cited to Canio & Pozo (2015) and kept apart from all fiction."
        ),
        "resumen_poetico": (
            "Volumen-raíz: el cielo mapuche se habita y se orienta. El Meli Witran Mapu ordena los "
            "cuatro puntos, un río de estrellas cruza la bóveda y el sol vuelve cada invierno; lo "
            "documentado nunca se funde con la ficción."
        ),
        "fuente": FUENTE_CP,
        "terminos_verificados": TERMINOS_WENU,
        "aislamiento": AISLAMIENTO,
        "tono": TONO,
        "review": False,
        "review_nota": (
            "Verificado contra sources/wenu-mapu.md, que se usa tal cual. Los tres términos que la "
            "fuente marcaba [review] —wüñelfe, wangülen, wenu leufü— quedaron confirmados contra "
            "Canio & Pozo (2015) el 2026-08-01; ver campo terminos_verificados y la tabla de la "
            "fuente. Ningún término mapudungun fuera de esa tabla se glosa en este volumen."
        ),
    },

    "doc-constelaciones": {
        "curaduria_es": (
            "Astronomía y mito, cada uno en su registro y en ese orden. Orión, las Pléyades y la Cruz "
            "del Sur se nombran primero como lo que se observa en el cielo austral, y recién después "
            "como figuras que distintas culturas leyeron ahí —siempre atribuyendo cada relato a su "
            "pueblo, nunca a «los antiguos» en general. La lectura mapuche se remite al volumen-raíz "
            "Wenu Mapu y a Canio & Pozo (2015): el río de arriba, wenu leufü, es la Vía Láctea. "
            "Ningún mito se presenta como hecho y ninguna cultura habla por otra."
        ),
        "curaduria_en": (
            "Astronomy and myth, each in its own record and in that order. Orion, the Pleiades and "
            "the Southern Cross are first named as what is observed in the southern sky, and only "
            "then as figures different cultures read there —each account always attributed to its "
            "people, never to «the ancients» in general. The Mapuche reading refers back to the root "
            "volume Wenu Mapu and to Canio & Pozo (2015): the river above, wenu leufü, is the Milky "
            "Way. No myth is presented as fact and no culture speaks for another."
        ),
        "resumen_poetico": (
            "Orión, las Pléyades, la Cruz del Sur: primero el cielo que se observa, después el mito, "
            "y cada mito con el nombre de su pueblo."
        ),
        "fuente": FUENTE_CP,
        "terminos_verificados": TERMINOS_WENU,
        "aislamiento": AISLAMIENTO,
        "tono": TONO,
        "quitar_resonancias": ["lore-2-la-llegada-de-nibiru"],
        "review": True,
        "review_nota": (
            "Parcialmente verificado. wenu leufü está confirmado en sources/wenu-mapu.md (tabla de "
            "términos, Canio & Pozo 2015). Lo que NO está cubierto por sources/ y por eso mantiene "
            "la marca: las atribuciones míticas de Orión, las Pléyades y la Cruz del Sur a culturas "
            "concretas —cada una necesita fuente citable antes de afirmarse. Se retiró el enlace a "
            "lore-2-la-llegada-de-nibiru por la regla de los dos registros."
        ),
    },

    "doc-rutrafe": {
        "curaduria_es": (
            "El oficio de la platería mapuche mirado como trabajo y no como folclore: la mano sobre "
            "el metal, el gesto que se repite hasta que sale solo, el tiempo que el material exige y "
            "que no se puede acortar. La pieza terminada guarda la memoria del oficio que la hizo. "
            "Registro documentado (mapuche, Wallmapu); enlaza con la obra real de Ocín en el registro "
            "specimen y se mantiene fuera de toda ficción. El vocabulario en mapudungun —empezando "
            "por el propio término que da título al volumen— no se glosa aquí: falta verificarlo."
        ),
        "curaduria_en": (
            "The craft of Mapuche silverwork seen as labour, not folklore: the hand on the metal, the "
            "gesture repeated until it comes by itself, the time the material demands and that cannot "
            "be shortened. The finished piece holds the memory of the craft that made it. Documented "
            "record (Mapuche, Wallmapu); it links to Ocín's real work in the specimen record and stays "
            "outside all fiction. The Mapudungun vocabulary —starting with the term that titles the "
            "volume— is not glossed here: it still needs verification."
        ),
        "resumen_poetico": (
            "La mano sobre la plata: gesto, tiempo y repetición. La pieza guarda la memoria del "
            "oficio que la hizo."
        ),
        "aislamiento": AISLAMIENTO,
        "tono": TONO,
        "review": True,
        "review_nota": (
            "Sin cobertura en sources/. El término «rutrafe» no está en la tabla verificada de "
            "sources/wenu-mapu.md, así que no se traduce ni se glosa hasta tener fuente citable y "
            "contraste con un kimche. La descripción del oficio se mantiene en lo genérico y "
            "comprobable (materia, gesto, tiempo) justamente para no afirmar de más."
        ),
    },

    "doc-animales-de-poder": {
        "curaduria_es": (
            "Fauna del Wallmapu como figura del archivo: puma, cóndor, filu (la serpiente), zorro, "
            "ballena, pudú. El volumen los nombra como animales de un territorio concreto —no como "
            "símbolos universales ni como panteón portátil— y ahí se detiene. Filu ata además, solo "
            "como eco simbólico y sin fundir registros, con la firma de Ocín, Serpiente Espectral "
            "Roja. Los demás nombres en mapudungun y toda atribución simbólica a comunidades "
            "determinadas quedan pendientes de fuente y por eso no se afirman."
        ),
        "curaduria_en": (
            "Wallmapu fauna as a figure of the archive: puma, condor, filu (the snake), fox, whale, "
            "pudú. The volume names them as animals of a specific territory —not as universal symbols "
            "nor as a portable pantheon— and stops there. Filu also ties, as symbolic echo only and "
            "without merging records, to Ocín's signature, Serpiente Espectral Roja. The remaining "
            "Mapudungun names and any symbolic attribution to particular communities await a source "
            "and are therefore not asserted."
        ),
        "resumen_poetico": (
            "Puma, cóndor, filu, zorro, ballena, pudú: animales de un territorio con nombre, no "
            "símbolos de cualquier parte."
        ),
        "aislamiento": AISLAMIENTO,
        "tono": TONO,
        "review": True,
        "review_nota": (
            "Parcialmente verificado. «filu = serpiente» está atestiguado en "
            "sources/ocin-arte-digital-ritual.md, que también fija que el vínculo con la firma "
            "Serpiente Espectral Roja va SOLO como eco simbólico. Lo que mantiene la marca: los "
            "nombres en mapudungun del resto de la fauna y las atribuciones de fuerza, visión, "
            "resguardo o transformación a comunidades concretas —no están en sources/ y se retiraron "
            "de la curaduría hasta tener fuente citable."
        ),
    },

    # ── Registro documentado · sin raíz mapuche ─────────────────────────────
    "doc-plantas-sacras": {
        "curaduria_es": (
            "Etnobotánica ceremonial: cacao, maíz, cannabis, ayahuasca, kava. El volumen las registra "
            "como plantas con historia cultural documentada, cada una nombrada junto al pueblo y la "
            "región que la usa, y ahí se detiene. No hay aquí guía de uso, preparación, dosis ni "
            "indicación de salud de ninguna clase, y no se afirma ninguna propiedad terapéutica. "
            "Registro documentado; cualquier lectura simbólica va marcada aparte y nunca se presenta "
            "como hecho."
        ),
        "curaduria_en": (
            "Ceremonial ethnobotany: cacao, maize, cannabis, ayahuasca, kava. The volume records them "
            "as plants with documented cultural history, each named alongside the people and region "
            "that use it, and stops there. There is no usage guidance, no preparation, no dosage and "
            "no health indication of any kind here, and no therapeutic property is claimed. "
            "Documented record; any symbolic reading is marked separately and never presented as fact."
        ),
        "resumen_poetico": (
            "Cacao, maíz, cannabis, ayahuasca, kava: plantas con historia y con pueblo. Sin dosis, "
            "sin guía de uso, sin promesa."
        ),
        "review": True,
        "review_nota": (
            "Sin cobertura en sources/. Las atribuciones por pueblo y región (cacao maya y mexica, "
            "maíz mesoamericano, ayahuasca amazónica, kava del Pacífico) necesitan fuente citable "
            "antes de publicarse sin marca. Regla fija del volumen, independiente de la revisión: "
            "sin guía de uso, sin dosis, sin claims terapéuticos."
        ),
    },

    # ── Registro ficción · marcado como tal ─────────────────────────────────
    "fic-anunnaki-sumerios": {
        "curaduria_es": (
            "Ficción marcada. Lectura ancient-astronaut de las tablillas sumerias: la que el KODEX "
            "ESTELAR desarrolla en su Libro II. La distinción se declara antes que el relato —Sumer y "
            "Babilonia existieron, y los Anunnaki son deidades de la religión mesopotámica con "
            "tablillas, templos y una literatura que se estudia en serio; el planeta Nibiru habitado, "
            "la órbita de 3.600 años y el pacto son mitología moderna. Este volumen no los presenta "
            "como historia y no habla en nombre de ninguna tradición. Registro ficción, paleta neon: "
            "el mito se ve como mito."
        ),
        "curaduria_en": (
            "Marked fiction. An ancient-astronaut reading of the Sumerian tablets: the one KODEX "
            "ESTELAR develops in its Book II. The distinction is stated before the story —Sumer and "
            "Babylon existed, and the Anunnaki are deities of Mesopotamian religion with tablets, "
            "temples and a literature studied seriously; the inhabited planet Nibiru, the 3,600-year "
            "orbit and the pact are modern mythology. This volume does not present them as history "
            "and speaks for no tradition. Fiction record, neon palette: the myth looks like myth."
        ),
        "resumen_poetico": (
            "Sumer existió; Nibiru es mito. Dos capas sobre la misma tablilla, y el libro dice cuál "
            "es cuál antes de empezar."
        ),
        "fuente": (
            "Ficción marcada (KODEX ESTELAR, Libro II). La historia sumeria y babilónica real se cita "
            "aparte y no se funde con este relato."
        ),
        "quitar_resonancias": ["doc-constelaciones"],
        "review": False,
        "review_nota": (
            "Verificado contra sources/curaduria-registros-audit.md: registro=ficcion, paleta=neon, "
            "mito marcado como tal y nunca presentado como hecho. Se retiró el enlace a "
            "doc-constelaciones (documentado, con término mapudungun) por la regla de aislamiento "
            "entre registros. No queda ningún dato cultural sin verificar afirmado en la curaduría."
        ),
    },

    "fic-razas-estelares-iconografia": {
        "curaduria_es": (
            "Ficción marcada. Iconografía del imaginario estelar del KODEX: razas semilla, budas, "
            "cabezas alienígenas, dioses griegos. Se tratan como glifos —formas que el mito repite "
            "porque le sirven— y no como afirmaciones sobre el origen de ninguna especie ni de ningún "
            "pueblo. Donde una imagen viene de una tradición viva se nombra como préstamo del "
            "imaginario y no como su doctrina. Registro ficción, paleta neon; sin cruce con el "
            "registro documentado."
        ),
        "curaduria_en": (
            "Marked fiction. Iconography of the KODEX stellar imaginary: seed races, buddhas, alien "
            "heads, Greek gods. They are handled as glyphs —forms the myth repeats because they serve "
            "it— and not as claims about the origin of any species or any people. Where an image "
            "comes from a living tradition it is named as a borrowing from the imaginary, not as its "
            "doctrine. Fiction record, neon palette; no crossing into the documented record."
        ),
        "resumen_poetico": (
            "Razas estelares, budas, dioses griegos: glifos del imaginario. El mito se muestra como "
            "mito, no como el origen de nadie."
        ),
        "fuente": "Iconografía marcada como mito (KODEX ESTELAR). No es afirmación histórica ni religiosa.",
        "review": False,
        "review_nota": (
            "Verificado contra sources/curaduria-registros-audit.md: registro=ficcion, paleta=neon, "
            "iconografía marcada como mito, sin fusión con el registro documentado. Sus resonancias "
            "no tocan ningún volumen documentado de raíz mapuche."
        ),
    },

    # ── Specimens · obra real de Ocín (Behance) ─────────────────────────────
    "spec-princesa-yuyo": {
        "curaduria_es": (
            "Obra real de Ocín —firmada Serpiente Espectral Roja— publicada en 2021. Styleframe de "
            "moda donde la figura se vuelve vegetal: el cuerpo tratado como planta, algo que se "
            "exhibe y se oculta en el mismo gesto. Registro documentado, porque es obra de autor y no "
            "lore, y se lee dentro del cuerpo de trabajo que reúne la monografía Arte Digital Ritual."
        ),
        "curaduria_en": (
            "Ocín's own work —signed Serpiente Espectral Roja— published in 2021. A fashion styleframe "
            "where the figure turns botanical: the body treated as a plant, something that displays "
            "and hides itself in the same gesture. Documented record, because it is authored work and "
            "not lore, read within the body of work gathered in the Arte Digital Ritual monograph."
        ),
        "resumen_poetico": (
            "El cuerpo tratado como planta: un styleframe donde la figura se exhibe y se oculta en el "
            "mismo gesto."
        ),
        "review": True,
        "review_nota": (
            "Autoría, firma y registro verificados contra sources/ocin-arte-digital-ritual.md; año y "
            "procedencia, contra la galería de Behance que el propio volumen cita. Mantiene la marca "
            "porque la categoría (organic pattern) y las resonancias siguen inferidas del título y de "
            "la descripción: falta el pase visual del autor."
        ),
    },

    "spec-paletas-de-colores": {
        "curaduria_es": (
            "Obra real de Ocín —firmada Serpiente Espectral Roja— publicada en 2021. Dirección de "
            "arte para fotografía: el color tratado como sistema y no como acabado, paletas usadas "
            "como campo de prueba antes de que exista la imagen final. Registro documentado, dentro "
            "del cuerpo de obra que reúne la monografía Arte Digital Ritual."
        ),
        "curaduria_en": (
            "Ocín's own work —signed Serpiente Espectral Roja— published in 2021. Art direction for "
            "photography: colour handled as a system rather than a finish, palettes used as a testing "
            "ground before the final image exists. Documented record, within the body of work gathered "
            "in the Arte Digital Ritual monograph."
        ),
        "resumen_poetico": (
            "El color como sistema y no como acabado: paletas que son campo de prueba antes de la "
            "imagen final."
        ),
        "review": True,
        "review_nota": (
            "Autoría, firma y registro verificados contra sources/ocin-arte-digital-ritual.md; año y "
            "procedencia, contra la galería de Behance que el propio volumen cita. Mantiene la marca "
            "porque la categoría (organic pattern) y las resonancias siguen inferidas del título y de "
            "la descripción: falta el pase visual del autor."
        ),
    },

    "spec-_": {
        "curaduria_es": (
            "Obra real de Ocín —firmada Serpiente Espectral Roja— publicada en 2021 y sin título. "
            "Gráfica y arte digital móvil: imágenes que se quedan entre el signo y la señal, sin un "
            "nombre que las fije de un lado. Registro documentado, dentro del cuerpo de obra que "
            "reúne la monografía Arte Digital Ritual."
        ),
        "curaduria_en": (
            "Ocín's own work —signed Serpiente Espectral Roja— published in 2021 and untitled. Mobile "
            "graphic and digital art: images that stay between sign and signal, with no name to fix "
            "them on either side. Documented record, within the body of work gathered in the Arte "
            "Digital Ritual monograph."
        ),
        "resumen_poetico": (
            "Sin título y sin lado: imágenes que se quedan entre el signo y la señal."
        ),
        "review": True,
        "review_nota": (
            "Autoría, firma y registro verificados contra sources/ocin-arte-digital-ritual.md; año y "
            "procedencia, contra la galería de Behance que el propio volumen cita. Mantiene la marca "
            "porque la serie no tiene título del autor y la categoría (cosmic origin) y las "
            "resonancias están inferidas: falta el pase visual del autor."
        ),
    },

    "spec-tranaluuekai": {
        "curaduria_es": (
            "Obra real de Ocín —firmada Serpiente Espectral Roja— publicada en 2021. Producto, moda e "
            "ilustración en una misma serie: objetos trabajados hasta que el material deja de leerse "
            "como material y pasa a leerse como signo. Registro documentado, dentro del cuerpo de "
            "obra que reúne la monografía Arte Digital Ritual. El título va tal como el autor lo "
            "escribió, sin normalizar y sin traducir."
        ),
        "curaduria_en": (
            "Ocín's own work —signed Serpiente Espectral Roja— published in 2021. Product, fashion "
            "and illustration in a single series: objects worked until the material stops reading as "
            "material and starts reading as sign. Documented record, within the body of work gathered "
            "in the Arte Digital Ritual monograph. The title is kept exactly as the author wrote it, "
            "unnormalised and untranslated."
        ),
        "resumen_poetico": (
            "Objetos trabajados hasta que el material deja de ser material y pasa a ser signo."
        ),
        "review": True,
        "review_nota": (
            "Autoría, firma y registro verificados contra sources/ocin-arte-digital-ritual.md; año y "
            "procedencia, contra la galería de Behance que el propio volumen cita. Mantiene la marca "
            "por dos cosas: el nombre «TranaluUEkai» no está cubierto por sources/ y por eso no se "
            "traduce ni se glosa, y la categoría (ritual tech) y las resonancias siguen inferidas "
            "—falta el pase visual del autor."
        ),
    },

    "spec-wenelfe-desk-grafic": {
        "curaduria_es": (
            "Obra real de Ocín —firmada Serpiente Espectral Roja— publicada en 2024. Ilustración y "
            "dirección de arte: una gráfica de escritorio construida alrededor de un solo nodo "
            "luminoso. El título remite a wüñelfe, el lucero del alba —Venus— en mapudungun; Canio & "
            "Pozo (2015) lo escriben wüñellfe, y la grafía del volumen es la del autor, no la del "
            "libro. Se nombra el pueblo y el contexto (mapuche, Wallmapu) y ahí termina la lectura "
            "cultural: la pieza es obra gráfica, no documento etnográfico. Registro documentado, "
            "paleta de marca, sin enlace con la ficción."
        ),
        "curaduria_en": (
            "Ocín's own work —signed Serpiente Espectral Roja— published in 2024. Illustration and "
            "art direction: a desk graphic built around a single luminous node. The title refers to "
            "wüñelfe, the morning star —Venus— in Mapudungun; Canio & Pozo (2015) spell it wüñellfe, "
            "and the volume's spelling is the author's, not the book's. The people and context are "
            "named (Mapuche, Wallmapu) and the cultural reading ends there: the piece is graphic work, "
            "not an ethnographic document. Documented record, brand palette, no link to fiction."
        ),
        "resumen_poetico": (
            "Un solo nodo luminoso sostiene toda la gráfica: el lucero del alba vuelto marca, con su "
            "nombre dicho y su grafía anotada."
        ),
        "terminos_verificados": TERMINOS_WENU,
        "aislamiento": AISLAMIENTO,
        "tono": TONO,
        "review": True,
        "review_nota": (
            "Parcialmente verificado. wüñelfe = lucero del alba / Venus está confirmado en la tabla "
            "de sources/wenu-mapu.md (Canio & Pozo 2015, que escriben wüñellfe): la glosa ya se puede "
            "afirmar, anotando la diferencia de grafía. Mantiene la marca porque la categoría "
            "(cosmic origin) y las resonancias siguen inferidas del título y de la descripción, y "
            "porque falta el pase visual del autor sobre la pieza."
        ),
    },
}


# ── Regla de los dos registros · enlaces a retirar ──────────────────────────
# doc-constelaciones es registro documentado y nombra un término mapudungun
# verificado (wenu leufü). La ficción no puede enlazarlo. Los volúmenes de
# ficción que buscaban el ancla astronómica ya tienen cos-03-estrellas, que es
# ciencia y sí puede resonar con el mito con su registro visible y distinto.
AISLAMIENTO_QUITAR = {
    "cap-06-discos-solares": ["doc-constelaciones"],
    "cap-08-meteoritos": ["doc-constelaciones"],
    "lore-2-la-llegada-de-nibiru": ["doc-constelaciones"],
    "lore-2-los-hijos-del-eclipse": ["doc-constelaciones"],
}


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    by_id = {v["id"]: v for v in data["volumes"]}

    faltantes = [k for k in CURADURIA if k not in by_id]
    if faltantes:
        raise SystemExit(f"IDs no encontrados en el manifest: {faltantes}")

    tocados, desmarcados = [], []
    for vid, campos in CURADURIA.items():
        vol = by_id[vid]
        quitar = campos.pop("quitar_resonancias", None)
        if quitar:
            vol["resonancias"] = [r for r in vol.get("resonancias", []) if r not in quitar]
        antes_review = bool(vol.get("review"))
        vol.update(campos)
        if antes_review and not vol.get("review"):
            desmarcados.append(vid)
        tocados.append(vid)

    enlaces_retirados = 0
    for vid, quitar in AISLAMIENTO_QUITAR.items():
        vol = by_id.get(vid)
        if vol is None:
            raise SystemExit(f"ID no encontrado en el manifest: {vid}")
        antes = vol.get("resonancias", [])
        vol["resonancias"] = [r for r in antes if r not in quitar]
        enlaces_retirados += len(antes) - len(vol["resonancias"])

    # mismo formato que el archivo original: indent=2, sin newline final
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")

    pendientes = [v["id"] for v in data["volumes"] if v.get("review")]
    mecanicos = [
        v["id"] for v in data["volumes"]
        if v.get("review") and str(v.get("review_nota", "")).startswith("Ingesta")
    ]
    print(f"volúmenes curados: {len(tocados)}")
    print(f"enlaces retirados por la regla de los dos registros: {enlaces_retirados}")
    print(f"review:true retirado en: {len(desmarcados)} → {desmarcados}")
    print(f"review:true restante: {len(pendientes)}")
    print(f"  · de ingesta mecánica (sin curaduría posible desde sources/): {len(mecanicos)}")
    print(f"  · curados y aún marcados: {len(pendientes) - len(mecanicos)}")


if __name__ == "__main__":
    main()
