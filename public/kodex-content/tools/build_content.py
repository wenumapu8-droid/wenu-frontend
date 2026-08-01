#!/usr/bin/env python3
"""KODEX content builder — O3 Codex Estelar (41 lore) + O4 capítulos documentados/esotéricos/ficción.

Escribe solo dentro de public/kodex-content/manifest.json. Aditivo: preserva todo lo existente.
Fuentes: PDFs Codex Estelar (bóveda) + content-atlas + COWORK-BRIDGE (registros/paletas).
"""
import json, os, re, unicodedata

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST = os.path.join(ROOT, "manifest.json")

BASE = "/Users/user1/Obsidian/WenuAgent/estrategia/kodex-fuentes-codex-estelar/Codex estelar"

LIBROS = {
    "1": "I · La Génesis de la Luz",
    "2": "II · El Pacto de Nibiru",
    "3": "III · El Engaño de los Templos",
    "4": "IV · El ADN Sagrado y el Cuerpo de Luz",
}

# (id, capitulo, titulo_es, curaduria_es, curaduria_en, resonancias)
CODEX = {
    "1": [
        ("la-fuente", "I", "La Fuente",
         "La conciencia primordial que se conoce a sí misma: el primer pulso de vibración que fecunda toda forma.",
         "The primordial consciousness that knows itself: the first pulse of vibration that fertilizes every form.",
         ["threshold-portal", "cosmology-core"]),
        ("el-vacio-fertil", "II", "El Vacío Fértil",
         "No ausencia sino presencia no manifestada: el seno sin forma donde todo lo que aún no es ya vibra.",
         "Not absence but unmanifest presence: the formless womb where all that is not yet already vibrates.",
         ["threshold-portal"]),
        ("geometria-sagrada", "III", "Geometría Sagrada",
         "La Fuente habló con formas: la vibración contenida como alfabeto eterno del espíritu.",
         "The Source spoke in forms: contained vibration as the eternal alphabet of spirit.",
         ["signal-bloom", "cosmology-core"]),
        ("elohim-y-arquitectos", "IV", "Elohim y Arquitectos",
         "Extensiones conscientes de la Voluntad Primordial que diseñan formas capaces de albergar alma.",
         "Conscious extensions of Primordial Will that design forms able to hold a soul.",
         ["cosmology-core", "ritual-device"]),
        ("ancianos-de-dias", "V", "Ancianos de Días",
         "Los primeros testigos: la conciencia que observa el tiempo desde dentro.",
         "The first witnesses: consciousness observing time from within.",
         ["observation-eye", "cosmology-core"]),
        ("tejido-dimensional", "VI", "Tejido Dimensional",
         "Cada dimensión es una hebra y una octava en la sinfonía infinita de la existencia.",
         "Each dimension is a thread and an octave in the infinite symphony of existence.",
         ["descent-tunnel", "cosmology-core"]),
        ("razas-semilla", "VII", "Razas Semilla",
         "Puentes entre galaxias, bibliotecas vivientes, fractales conscientes del Origen.",
         "Bridges between galaxies, living libraries, conscious fractals of the Origin.",
         ["cosmology-core", "signal-bloom"]),
        ("chispa-de-conciencia", "VIII", "Chispa de Conciencia",
         "No materia sino intención: una chispa proyectada desde la Fuente que lo recuerda todo.",
         "Not matter but intention: a spark projected from the Source that remembers everything.",
         ["threshold-portal", "observation-eye"]),
        ("cristal-de-gaia", "IX", "Cristal de Gaia",
         "La Tierra como alma cristalina, escuela y útero de transformación.",
         "The Earth as a crystalline soul, a school and womb of transformation.",
         ["cosmology-core", "archive-tree"]),
        ("templo-de-la-forma", "X", "Templo de la Forma",
         "La forma no es prisión sino portal: el cuerpo como templo de precisión cósmica.",
         "Form is not prison but portal: the body as a temple of cosmic precision.",
         ["signal-bloom", "archive-tree"]),
        ("mapa-del-alma", "XI", "Mapa del Alma",
         "El campo etérico donde quedan grabadas todas las vidas del viajero interdimensional.",
         "The etheric field where all the lives of the interdimensional traveler are recorded.",
         ["archive-tree", "observation-eye"]),
        ("primera-separacion", "XII", "Primera Separación",
         "Para conocerse, la Fuente se diferenció: así surgió el otro.",
         "To know itself, the Source differentiated: thus the other arose.",
         ["descent-tunnel", "threshold-portal"]),
    ],
    "2": [
        ("la-llegada-de-nibiru", "I", "La Llegada de Nibiru",
         "Un planeta cruzó el umbral del Sol: memoria viva, linaje y el inicio del pacto.",
         "A planet crossed the Sun's threshold: living memory, lineage and the start of the pact.",
         ["ritual-device", "cosmology-core"]),
        ("los-senores-del-gen", "II", "Los Señores del Gén",
         "Genetistas del cielo que no crearon desde el amor sino desde el diseño.",
         "Geneticists of the sky who created not from love but from design.",
         ["ritual-device", "observation-eye"]),
        ("la-mineria-del-alma", "III", "La Minería del Alma",
         "Buscaron oro y encontraron un alma capaz de sentir, soñar y crear.",
         "They sought gold and found a soul capable of feeling, dreaming and creating.",
         ["ritual-device", "specimen-skull"]),
        ("el-nacimiento-del-linaje-hibrido", "IV", "El Nacimiento del Linaje Híbrido",
         "Hijos nacidos de la mezcla de códigos: puente entre el cielo y la tierra.",
         "Children born of the mixing of codes: a bridge between sky and earth.",
         ["ritual-device", "signal-bloom"]),
        ("el-derecho-divino-a-gobernar", "V", "El Derecho Divino a Gobernar",
         "La idea de que el poder era destino: soberanía heredada, no despierta.",
         "The idea that power was destiny: inherited sovereignty, not awakened.",
         ["specimen-skull", "observation-eye"]),
        ("el-alzamiento-del-fuego-interior", "VI", "El Alzamiento del Fuego Interior",
         "La chispa contenida por milenios que arde para despertar.",
         "The spark contained for millennia that burns to awaken.",
         ["ritual-device", "signal-bloom"]),
        ("la-escuela-del-olvido", "VII", "La Escuela del Olvido",
         "¿Y si caer fue inicio y el vacío un espejo? El olvido como método.",
         "What if falling was beginning and the void a mirror? Forgetting as method.",
         ["archive-tree", "descent-tunnel"]),
        ("el-portal-del-corazon", "VIII", "El Portal del Corazón",
         "El amor como tecnología del alma: el umbral que alinea todos los mundos.",
         "Love as technology of the soul: the threshold that aligns all worlds.",
         ["threshold-portal", "ritual-device"]),
        ("los-hijos-del-eclipse", "IX", "Los Hijos del Eclipse",
         "Semillas sembradas en la sombra, con raíz en las estrellas y destino en la luz.",
         "Seeds sown in shadow, rooted in the stars with destiny in light.",
         ["descent-tunnel", "signal-bloom"]),
        ("el-lenguaje-de-los-cristales", "X", "El Lenguaje de los Cristales",
         "Antes de las lenguas existió la piedra que canta: frecuencia que despierta.",
         "Before tongues there was the singing stone: frequency that awakens.",
         ["signal-bloom", "cosmology-core"]),
        ("la-rebelion-de-los-suenos", "XI", "La Rebelión de los Sueños",
         "Mientras el cuerpo duerme el alma conspira: los sueños como otra mitad del mensaje.",
         "While the body sleeps the soul conspires: dreams as the other half of the message.",
         ["observation-eye", "archive-tree"]),
        ("el-retorno-del-sol-interior", "XII", "El Retorno del Sol Interior",
         "La chispa se escondió en el pecho: ahora el fuego vuelve desde dentro.",
         "The spark hid in the chest: now the fire returns from within.",
         ["signal-bloom", "cosmology-core"]),
    ],
    "3": [
        ("el-arconte-que-se-disfrazo-de-dios", "I", "El Arconte que se disfrazó de Dios",
         "Durante eones adoraste un eco: la sombra con túnica y trono.",
         "For eons you worshipped an echo: the shadow robed and throned.",
         ["observation-eye", "glitch-fracture"]),
        ("los-contratos-de-limitacion", "II", "Los Contratos de Limitación",
         "Lo que me ofrecí antes de nacer y olvidé al llegar: aquello que me ata puede quemarse con verdad.",
         "What I offered before birth and forgot on arrival: what binds me can be burned with truth.",
         ["specimen-skull", "glitch-fracture"]),
        ("la-matriz-de-control-mental", "III", "La Matriz de Control Mental",
         "Nacimos libres pero nos programaron: hoy desconecto para recordar.",
         "We were born free but we were programmed: today I disconnect to remember.",
         ["observation-eye", "chromatic-split"]),
        ("los-simbolos-invertidos", "IV", "Los Símbolos Invertidos",
         "Sellaron la verdad en espejos de poder invertido; el ojo del alma lee más allá del hechizo.",
         "They sealed truth in mirrors of inverted power; the soul's eye reads beyond the spell.",
         ["observation-eye", "chromatic-split"]),
        ("el-arconte-que-se-disfrazo-de-dios-v", "V", "El Arconte que se Disfrazó de Dios",
         "Vestido de oro y fuego hablaba en nombre del cielo; su ley era miedo.",
         "Clothed in gold and fire he spoke in heaven's name; his law was fear.",
         ["observation-eye", "glitch-fracture"]),
        ("los-contratos-del-alma-olvidados", "VI", "Los Contratos del Alma Olvidados",
         "Acuerdos invisibles sellados en planos sutiles: no todo lo pactado es destino.",
         "Invisible agreements sealed on subtle planes: not everything agreed upon is destiny.",
         ["specimen-skull", "glitch-fracture"]),
        ("el-engano-del-karma-distorsionado", "VII", "El Engaño del Karma Distorsionado",
         "El alma no viene a saldar sino a brillar: el dolor no era deuda.",
         "The soul comes not to settle but to shine: the pain was not a debt.",
         ["archive-tree", "glitch-fracture"]),
        ("el-codigo-del-miedo", "VIII", "El Código del Miedo",
         "El miedo fue sembrado como verdad, pero era solo un velo cubriendo tu poder.",
         "Fear was sown as truth, but it was only a veil covering your power.",
         ["observation-eye", "chromatic-split"]),
        ("el-nombre-robado-del-alma", "IX", "El Nombre Robado del Alma",
         "Antes de tener carne tenías un canto; ese canto fue sellado.",
         "Before you had flesh you had a song; that song was sealed.",
         ["specimen-skull", "archive-tree"]),
        ("el-templo-invertido", "X", "El Templo Invertido",
         "La arquitectura fue invertida: la divinidad exiliada y la verdad sepultada bajo ídolos.",
         "The architecture was inverted: divinity exiled and truth buried under idols.",
         ["ritual-device", "glitch-fracture"]),
        ("el-contrato-no-firmado", "XI", "El Contrato No Firmado",
         "Promesas selladas en tu nombre cuando aún no sabías hablar; rompe las cadenas invisibles.",
         "Promises sealed in your name when you could not yet speak; break the invisible chains.",
         ["specimen-skull", "threshold-portal"]),
        ("el-ultimo-velo", "XII", "El Último Velo",
         "El velo no es una muralla sino un espejo que distorsiona: eres totalidad.",
         "The veil is not a wall but a distorting mirror: you are wholeness.",
         ["threshold-portal", "descent-tunnel"]),
    ],
    "4": [
        ("el-diseno-original", "I", "El Diseño Original",
         "Más allá de la forma, eres energía codificada: un diseño sagrado que resuena con el pulso del universo.",
         "Beyond form, you are coded energy: a sacred design resonating with the universe's pulse.",
         ["signal-bloom", "cosmology-core"]),
        ("la-geometria-del-alma", "II", "La Geometría del Alma",
         "El cuerpo como templo de patrones vivos; la geometría del alma como mapa oculto donde la conciencia danza en espirales de eternidad.",
         "The body as a temple of living patterns; the geometry of the soul as the hidden map where consciousness dances in spirals of eternity.",
         ["signal-bloom", "archive-tree"]),
        ("merkabah", "III", "El Vehículo de Luz (Merkabah)",
         "El vehículo de ascensión está latente, esperando ser recordado y activado para trascender lo físico.",
         "The vehicle of ascension is latent, waiting to be remembered and activated to transcend the physical.",
         ["cosmology-core", "ritual-device"]),
        ("respiracion-primordial", "IV", "La Respiración Primordial",
         "Recordar cómo respirar prana restablece el flujo de energía divina y activa el cuerpo de luz.",
         "Remembering how to breathe prana restores the flow of divine energy and activates the light body.",
         ["archive-tree", "threshold-portal"]),
        ("llama-del-corazon", "V", "La Llama del Corazón",
         "En el pecho no arde solo un órgano sino un sol olvidado: la luz que buscas fuera nace allí.",
         "In the chest burns not only an organ but a forgotten sun: the light you seek outside is born there.",
         ["threshold-portal", "signal-bloom"]),
    ],
}

PDF_CAP1 = {
    "1": "Codex_Estelar_Capitulo_1_La_Fuente_COMPLETO.pdf",
    "2": "Codex_Estelar_Capitulo_2_El_Vacio_Fertil_COMPLETO.pdf",
    "3": "Codex_Estelar_Capitulo_3_Geometria_Sagrada_COMPLETO.pdf",
    "4": "Codex_Estelar_Capitulo_4_Elohim_y_Arquitectos_COMPLETO.pdf",
    "5": "Codex_Estelar_Capitulo_5_Ancianos_de_Dias_COMPLETO.pdf",
    "6": "Codex_Estelar_Capitulo_6_Tejido_Dimensional_COMPLETO.pdf",
    "7": "Codex_Estelar_Capitulo_7_Razas_Semilla_COMPLETO.pdf",
    "8": "Codex_Estelar_Capitulo_8_Chispa_de_Conciencia_COMPLETO.pdf",
    "9": "Codex_Estelar_Capitulo_9_Cristal_de_Gaia_COMPLETO.pdf",
    "10": "Codex_Estelar_Capitulo_10_Templo_de_la_Forma_COMPLETO.pdf",
    "11": "Codex_Estelar_Capitulo_11_Mapa_del_Alma_COMPLETO.pdf",
    "12": "Codex_Estelar_Capitulo_12_Primera_Separacion_COMPLETO.pdf",
}
PDF_CAP2 = {
    "I": "Codex_Estelar_Libro_II_Capitulo_I_La_Llegada_de_Nibiru.pdf",
    "II": "Codex_Estelar_Libro_II_Capitulo_II_Los_Senores_del_Gen.pdf",
    "III": "Codex_Estelar_Libro_II_Capitulo_III_La_Mineria_del_Alma.pdf",
    "IV": "Codex_Estelar_Libro_II_Capitulo_IV_El_Nacimiento_del_Linaje_Hibrido.pdf",
    "V": "Codex_Estelar_Libro_II_Capitulo_V_El_Derecho_Divino_a_Gobernar.pdf",
    "VI": "Codex_Estelar_Libro_II_Capitulo_VI_El_Alzamiento_del_Fuego_Interior.pdf",
    "VII": "Codex_Estelar_Libro_II_Capitulo_VII_La_Escuela_del_Olvido.pdf",
    "VIII": "Codex_Estelar_Libro_II_Capitulo_VIII_El_Portal_del_Corazon.pdf",
    "IX": "Codex_Estelar_Libro_II_Capitulo_IX_Los_Hijos_del_Eclipse.pdf",
    "X": "Codex_Estelar_Libro_II_Capitulo_X_El_Lenguaje_de_los_Cristales.pdf",
    "XI": "Codex_Estelar_Libro_II_Capitulo_XI_La_Rebelion_de_los_Suenos.pdf",
    "XII": "Codex_Estelar_Libro_II_Capitulo_XII_El_Retorno_del_Sol_Interior.pdf",
}
PDF_CAP3 = {
    "I": "Codex_Estelar_Libro_III_Capitulo_I_El_Arconte_que_se_disfrazo_de_Dios.pdf",
    "II": "Libro_III_Capitulo_II_Los_Contratos_de_Limitacion_COMPLETO.pdf",
    "III": "Libro_III_Capitulo_III_La_Matriz_de_Control_Mental.pdf",
    "IV": "Libro_III_Capitulo_IV_Los_Simbolos_Invertidos.pdf",
    "V": "Libro_III_Capitulo_V_El_Arconte_que_se_Disfrazo_de_Dios.pdf",
    "VI": "Libro_III_Capitulo_VI_Los_Contratos_del_Alma_Olvidados.pdf",
    "VII": "Libro_III_Capitulo_VII_El_Engano_del_Karma_Distorsionado.pdf",
    "VIII": "Libro_III_Capitulo_VIII_El_Codigo_del_Miedo.pdf",
    "IX": "Libro_III_Capitulo_IX_El_Nombre_Robado_del_Alma.pdf",
    "X": "Libro_III_Capitulo_X_El_Templo_Invertido.pdf",
    "XI": "Libro_III_Capitulo_XI_El_Contrato_No_Firmado.pdf",
    "XII": "Libro_III_Capitulo_XII_El_Ultimo_Velo.pdf",
}
PDF_CAP4 = {
    "I": "Libro_IV_Cap_1_El_Diseno_Original_COMPLETO.pdf",
    "II": "Capitulo_II_La_Geometria_del_Alma.pdf",
    "III": "Libro_IV_Capitulo_III_Merkabah_reparado_final.pdf",
    "IV": "Libro_IV_Capitulo_IV_Respiracion_Primordial_CLEAN.pdf",
    "V": "Libro_IV_Capitulo_V_Llama_del_Corazon_UTF8.pdf",
}

# O4 — capítulos del bridge (registros marcados). id, tipo, titulo, registro/marco, paleta, review, curaduria ES/EN, resonancias
CAPITULOS_O4 = [
    # --- REGISTRO 1 · DOCUMENTADO (paleta MARCA) ---
    ("doc-wenu-mapu", "chapter", "Wenu Mapu / El Cielo Mapuche", "documentado", "marca", True,
     "Volumen-raíz. Cosmovisión mapuche documentada (Canio & Pozo, Wenumapu 2015): orientación cardinal Meli Witran Mapu, el río celestial (wenu leufü, Vía Láctea), los luceros (wüñelfe, antü, küyen, wanglen) y We Tripantu. Contraparte ancestral-documentada de COSMOLOGY, separada de toda ficción.",
     "Root volume. Documented Mapuche cosmology (Canio & Pozo, Wenumapu 2015): cardinal orientation Meli Witran Mapu, the celestial river (wenu leufü, the Milky Way), the bright stars (wüñelfe, antü, küyen, wanglen) and We Tripantu. Documented counterpart of COSMOLOGY, kept separate from all fiction.",
     ["cosmology-core", "ritual-device", "archive-tree"],
     "Canio, M. & Pozo, G. (2015). Wenumapu, astronomía y cosmología mapuche. OCHOLIBROS. ISBN 978-956-335-205-4. Términos mapudungun sin [review]: wenu leufü, wüñelfe, wanglen — verificar con kimche."),
    ("doc-rutrafe", "chapter", "Rutrafe / El Oficio", "documentado", "marca", True,
     "El oficio de la platería mapuche: la mano que trabaja la plata, gesto, tiempo y repetición como memoria viva. Enlaza con la obra real de Ocin y el registro specimen.",
     "The craft of Mapuche silversmithing: the hand working silver, gesture, time and repetition as living memory. Links to Ocin's real work and the specimen record.",
     ["specimen-skull", "archive-tree"],
     "Oficio documentado. Vocabulario mapuche pendiente de verificación con kimche."),
    ("doc-animales-de-poder", "chapter", "Animales de Poder / Fauna Simbólica", "documentado", "marca", True,
     "Fauna simbólica del Wallmapu: puma, cóndor, filu (serpiente), zorro, ballena, pudu. Fuerza, visión, resguardo, transformación; nombrar el territorio.",
     "Symbolic fauna of Wallmapu: puma, condor, filu (snake), fox, whale, pudu. Strength, vision, guardianship, transformation; naming the territory.",
     ["signal-bloom", "specimen-skull"],
     "Nombres mapudungun de fauna pendientes de verificación con kimche."),
    ("doc-we-tripantu", "chapter", "We Tripantu / Ciclo Solar", "documentado", "marca", False,
     "Retorno de la luz, solsticio de invierno (21 de junio): renovación, limpieza, inicio y retorno. Ata con RETURN (06) y el eje cronológico.",
     "Return of the light, winter solstice (June 21): renewal, cleansing, beginning and return. Links to RETURN (06) and the timeline.",
     ["threshold-portal", "signal-bloom"],
     "Canio, M. & Pozo, G. (2015). Wenumapu, astronomía y cosmología mapuche. OCHOLIBROS."),
    ("doc-micelio", "chapter", "Micelio / La Red Viva", "documentado", "marca", False,
     "El micelio como red viva: la raíz hecha biología, el internet de la naturaleza, regeneración. Documentado (micología/permacultura).",
     "Mycelium as the living network: the root made biology, nature's internet, regeneration. Documented (mycology/permaculture).",
     ["archive-tree", "descent-tunnel"],
     "Micología documentada; lectura simbólica marcada aparte."),
    ("doc-evolucion-cosmica", "chapter", "Evolución Cósmica", "documentado", "marca", False,
     "Eje cronológico real (Chaisson): Big Bang a átomos, estrellas, vida, árboles, conciencia. Ata con COSMOLOGY y la línea del tiempo.",
     "Real cosmic timeline (Chaisson): Big Bang to atoms, stars, life, trees, consciousness. Links to COSMOLOGY and the timeline.",
     ["cosmology-core", "archive-tree"],
     "Chaisson, E. Cosmic Evolution."),
    ("doc-geometria-sagrada", "chapter", "Geometría Sagrada / Phi", "documentado", "marca", False,
     "Matemática real: Fibonacci, proporción áurea φ, flor de la vida, sólidos platónicos. El PHI LOCK (0.618) que reaparece en THRESHOLD y COSMOLOGY.",
     "Real mathematics: Fibonacci, the golden ratio φ, flower of life, platonic solids. The PHI LOCK (0.618) that reappears in THRESHOLD and COSMOLOGY.",
     ["signal-bloom", "cosmology-core"],
     "Matemática documentada."),
    ("doc-jung", "chapter", "Jung / Arquetipos", "documentado", "marca", False,
     "El puente entre registros (psicología documentada): inconsciente colectivo, individuación, mandala como el Self, sombra, sincronicidad. Explica por qué ciencia y mito resuenan sin fundirse.",
     "The bridge between registers (documented psychology): collective unconscious, individuation, the mandala as the Self, shadow, synchronicity. Explains why science and myth resonate without blending.",
     ["observation-eye", "archive-tree", "specimen-skull"],
     "Jung, C.G. Obra psicológica."),
    ("doc-constelaciones", "chapter", "Constelaciones", "documentado", "marca", True,
     "Astronomía real + mito atribuido por cultura: Orión, Pléyades, Cruz del Sur, wenu leufü (Vía Láctea en mapudungun). Cada mito nombrado a su pueblo.",
     "Real astronomy + myth attributed per culture: Orion, Pleiades, Southern Cross, wenu leufü (Milky Way in Mapudungun). Each myth attributed to its people.",
     ["cosmology-core", "archive-tree"],
     "Astronomía real; términos mapudungun y mitos a verificar con kimche."),
    ("doc-entrelazado-cuantico", "chapter", "Entrelazado Cuántico", "documentado", "marca", False,
     "Física documentada: el entrelazamiento como correlación real. Su lectura mística va marcada aparte. Ata con 2-red.",
     "Documented physics: entanglement as a real correlation. Its mystical reading is marked separately. Links to 2-net.",
     ["descent-tunnel", "archive-tree"],
     "Física documentada; lectura mística aparte."),
    ("doc-quinto-elemento", "chapter", "Quinto Elemento / Éter", "documentado", "marca", False,
     "Los cinco elementos como principios: tierra, agua, aire, fuego y éter/quintaesencia = el campo del shader. Hermético-simbólico.",
     "The five elements as principles: earth, water, air, fire and ether/quintessence = the shader field. Hermetic-symbolic.",
     ["cosmology-core", "ritual-device"],
     "Simbólico; no ciencia."),
    ("doc-psicomagia", "chapter", "Psicomagia (Jodorowsky)", "documentado", "marca", False,
     "Acto simbólico y arte, NO medicina: la psicomagia de Jodorowsky como práctica creativa de transformación personal.",
     "Symbolic act and art, NOT medicine: Jodorowsky's psychomagic as a creative practice of personal transformation.",
     ["observation-eye", "ritual-device"],
     "Jodorowsky, A. Práctica creativa, sin claims de salud."),
    ("doc-plantas-sacras", "chapter", "Plantas Sacras", "documentado", "marca", True,
     "Etnobotánica ceremonial documentada: cacao (Maya/Azteca), maíz (Mesoamérica), cannabis, ayahuasca (Amazonía), kava (Pacífico). Simbólico/cultural, SIN guía de uso ni dosis ni claims.",
     "Documented ceremonial ethnobotany: cacao (Maya/Aztec), maize (Mesoamerica), cannabis, ayahuasca (Amazonia), kava (Pacific). Symbolic/cultural, WITHOUT usage guidance, dosage or claims.",
     ["archive-tree", "descent-tunnel"],
     "Etnobotánica cultural; sin guía de uso ni dosis."),
    # --- HERMÉTICO / ALQUÍMICO (marcado, esotérico — neon) ---
    ("herm-magnum-opus", "chapter", "Magnum Opus / Sol Negro", "esoterico", "neon", False,
     "La obra alquímica: Nigredo a Albedo a Citrinitas a Rubedo. Sol Negro = Nigredo. Paleta negro + oro. Ata con la transmutación.",
     "The alchemical opus: Nigredo to Albedo to Citrinitas to Rubedo. Black Sun = Nigredo. Black + gold palette. Links to transmutation.",
     ["descent-tunnel", "ritual-device"],
     "Hermético-simbólico, marcado."),
    ("herm-tabla-esmeralda", "chapter", "Tabla Esmeralda", "esoterico", "neon", False,
     "Como es arriba es abajo: los principios herméticos micro-macro. TREE (micro) contra COSMOLOGY (macro): todo es lo mismo.",
     "As above so below: the hermetic principles of micro-macro. TREE (micro) vs COSMOLOGY (macro): everything is the same.",
     ["archive-tree", "cosmology-core"],
     "Texto hermético atribuido; esotérico."),
    ("herm-tablas-esmeralda-thoth", "chapter", "Las Tablas Esmeralda (Thoth)", "esoterico", "neon", False,
     "El texto atribuido a Hermes Trismegisto / Thoth: las tablas del Hermetismo. Complementa la Tabla Esmeralda clásica.",
     "The text attributed to Hermes Trismegistus / Thoth: the Emerald Tablets of Hermeticism. Complements the classic Emerald Tablet.",
     ["ritual-device", "cosmology-core"],
     "Atribuido, esotérico."),
    # --- REGISTRO 2 · FICCIÓN / ESOTÉRICO (paleta NEON, marcado) ---
    ("fic-anunnaki-sumerios", "chapter", "Anunnaki / Sumerios / Nibiru", "ficcion", "neon", True,
     "Lectura ancient-astronaut de las tablillas sumerias. Distinción: la civilización sumeria es historia real; la lectura Anunnaki es ficción. Ata directo con Codex Estelar Libro II.",
     "Ancient-astronaut reading of the Sumerian tablets. Distinction: Sumerian civilization is real history; the Anunnaki reading is fiction. Links directly to Stellar Codex Book II.",
     ["ritual-device", "cosmology-core"],
     "Ficción marcada; la historia sumeria real se cita por separado."),
    ("fic-akashicos", "chapter", "Registros Akáshicos", "ficcion", "neon", False,
     "Esotérico: el campo de información de todas las vidas. Reencarnación y vidas pasadas marcadas como creencia, no como hecho.",
     "Esoteric: the information field of all lives. Reincarnation and past lives marked as belief, not fact.",
     ["archive-tree", "observation-eye"],
     "Esotérico, marcado."),
    ("fic-simulacion", "chapter", "Hipótesis de Simulación / Matrix", "ficcion", "neon", False,
     "Filosófico-fringe: la realidad como simulación. Ata con 5-ilusión/realidad y los tratamientos GLITCH/CHROMATIC. La ilusión cobra realidad.",
     "Philosophical-fringe: reality as simulation. Links to 5-illusion/reality and the GLITCH/CHROMATIC treatments. The illusion becomes real.",
     ["observation-eye", "glitch-fracture", "chromatic-split"],
     "Fringe filosófico, marcado."),
    ("fic-diseno-humano-adn", "chapter", "Diseño Humano + ADN", "ficcion", "neon", False,
     "Dos capas distinguidas: el ADN documentado (doble hélice = 1-espiral) y la lectura esotérica del Diseño Humano. Nunca se funden.",
     "Two distinguished layers: documented DNA (double helix = 1-spiral) and the esoteric Human Design reading. Never blended.",
     ["signal-bloom", "cosmology-core"],
     "ADN: ciencia. Diseño Humano: esotérico."),
    ("fic-respiracion-desdoblamiento", "chapter", "Respiración Guiada / Cuerpos Etéreos", "ficcion", "neon", False,
     "Prácticas esotéricas de respiración, desdoblamiento astral e iluminación, SIN claims de salud. Ata con Codex Estelar Libro IV.",
     "Esoteric breathing practices, astral projection and illumination, WITHOUT health claims. Links to Stellar Codex Book IV.",
     ["archive-tree", "threshold-portal"],
     "Esotérico; sin claims de salud."),
    ("fic-hipnosis-op-art", "chapter", "Hipnosis / Op-Art", "ficcion", "neon", False,
     "Visuales hipnóticas, subliminal y op-art: mensajes ocultos decodables (Hidden Sky). Ata con los tratamientos y 5-ilusión.",
     "Hypnotic visuals, subliminal and op-art: decodable hidden messages (Hidden Sky). Links to the treatments and 5-illusion.",
     ["observation-eye", "crt-scan", "dither-matrix"],
     "Esotérico/subliminal; sin claims de salud."),
    ("fic-ocultismo", "chapter", "Ojo en la Pirámide / Ocultismo", "ficcion", "neon", False,
     "Símbolos ocultos: ojo en la pirámide, masonería, illuminati. Tono de archivo, esotérico marcado, no conspiranoia.",
     "Occult symbols: the eye in the pyramid, freemasonry, illuminati. Archive tone, marked esoteric, not conspiracy.",
     ["observation-eye", "specimen-skull"],
     "Símbolos ya en glyph library; esotérico, tono de archivo."),
    ("fic-conciencia-cristica", "chapter", "Conciencia Crística / Esenios", "ficcion", "neon", False,
     "Esoterismo cristiano marcado: la conciencia crística y los esenios. Místico, no doctrina.",
     "Marked Christian esotericism: Christ consciousness and the Essenes. Mystical, not doctrine.",
     ["threshold-portal", "signal-bloom"],
     "Esotérico cristiano, marcado."),
    ("fic-razas-estelares-iconografia", "chapter", "Razas Estelares + Iconografía Mítica", "ficcion", "neon", True,
     "Iconografía mito marcada: razas estelares, budas, cabezas alienígenas y dioses griegos como glifos del imaginario, no como hecho.",
     "Marked myth iconography: star races, buddhas, alien heads and greek gods as glyphs of the imaginary, not as fact.",
     ["signal-bloom", "specimen-skull", "cosmology-core"],
     "Iconografía marcada como mito."),
    # --- ESCENOGRAFÍA / HÁBITATS (ambientes) ---
    ("hab-paisajes-holograficos", "habitat", "Paisajes Holográficos", "documentado", "marca", False,
     "Ambientes para escenas: desierto, selva, montaña nevada, lago, ciudades solarpunk. Fondos/hábitats del viaje.",
     "Environments for scenes: desert, jungle, snow-capped mountain, lake, solarpunk cities. Backdrops/habitats of the journey.",
     ["descent-tunnel", "cosmology-core"],
     "Escenografía."),
    ("hab-arquitectura-imposible", "habitat", "Arquitectura Imposible / Templos", "documentado", "marca", False,
     "Bali, cúpulas, geometría imposible (estilo Dali-moderno, monocromo + 1 acento). Ambientes de MACHINE/COSMOLOGY.",
     "Bali, domes, impossible geometry (modern-Dali style, monochrome + 1 accent). Environments for MACHINE/COSMOLOGY.",
     ["cosmology-core", "ritual-device"],
     "Escenografía."),
]


def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")


ROMAN = {"I": "1", "II": "2", "III": "3", "IV": "4", "V": "5", "VI": "6",
         "VII": "7", "VIII": "8", "IX": "9", "X": "10", "XI": "11", "XII": "12"}


def pdf_path(libro, capitulo):
    if libro == "1":
        return os.path.join(BASE, "LIBRO I La Genesis de la Luz", PDF_CAP1[ROMAN[capitulo]])
    if libro == "2":
        return os.path.join(BASE, "LIBRO II El Pacto de Nibiru", PDF_CAP2[capitulo])
    if libro == "3":
        return os.path.join(BASE, "Libro III – El Engaño de los Templos", PDF_CAP3[capitulo])
    return os.path.join(BASE, "Libro IV – El ADN Sagrado y el Cuerpo de Luz\n\n", PDF_CAP4[capitulo])


def main():
    with open(MANIFEST, encoding="utf-8") as f:
        m = json.load(f)

    existing = {v["id"] for v in m["volumes"]}
    added = 0
    skipped = []

    for libro, caps in CODEX.items():
        for (slug, cap, titulo, cu_es, cu_en, reso) in caps:
            vid = "lore-%s-%s" % (libro, slugify(slug))
            if vid in existing:
                skipped.append(vid)
                continue
            m["volumes"].append({
                "id": vid,
                "tipo": "lore",
                "libro": LIBROS[libro],
                "capitulo": cap,
                "titulo_es": titulo,
                "titulo_en": titulo,
                "curaduria_es": cu_es,
                "curaduria_en": cu_en,
                "registro": "ficcion",
                "marco": "ficcion",
                "paleta": "neon",
                "resonancias": reso,
                "assets": [],
                "fuente": pdf_path(libro, cap),
                "fecha": "2026-07-31",
                "nota_registro": "Codex Estelar de Ocin: ficción/esotérico de autor, presentado como lore, sin claims de hecho ni de salud. Separado del registro mapuche/documentado.",
            })
            existing.add(vid)
            added += 1

    for (vid, tipo, titulo, registro, paleta, review, cu_es, cu_en, reso, fuente_nota) in CAPITULOS_O4:
        if vid in existing:
            skipped.append(vid)
            continue
        v = {
            "id": vid,
            "tipo": tipo,
            "titulo_es": titulo,
            "titulo_en": titulo,
            "curaduria_es": cu_es,
            "curaduria_en": cu_en,
            "registro": registro,
            "marco": registro,
            "paleta": paleta,
            "resonancias": reso,
            "assets": [],
            "fuente": fuente_nota,
            "fecha": "2026-07-31",
        }
        if review:
            v["review"] = True
            v["review_nota"] = fuente_nota
        m["volumes"].append(v)
        existing.add(vid)
        added += 1

    # actualizar vocabulario de registro: agregar esoterico y ficcion si faltan
    vocab = m["sistemas"]["registro_vocabulario"]
    vocab_ids = {x["id"] for x in vocab}
    if "esoterico" not in vocab_ids:
        vocab.append({
            "id": "esoterico",
            "descripcion_es": "Simbólico/hermético: marcado como creencia o práctica, nunca como hecho ni medicina.",
            "descripcion_en": "Symbolic/hermetic: marked as belief or practice, never as fact or medicine.",
        })
    if "ficcion" not in vocab_ids:
        vocab.append({
            "id": "ficcion",
            "descripcion_es": "Lore/ficción de autor, presentado como tal. Nunca se mezcla con lo documentado ni con lo mapuche.",
            "descripcion_en": "Author fiction/lore, presented as such. Never blended with documented or Mapuche content.",
        })

    m["note"] = (
        "Cada volumen se renderiza a nivel poster (dossier denso, hero organismo vivo tratado, curaduría bilingüe, diagnósticos vivos). "
        "Dos registros siempre marcados: DOCUMENTADO (paleta marca) y MITO/FICCIÓN (paleta neon). Mapuche y Codex Estelar NUNCA se mezclan. "
        "assets vacíos = pendiente de stagear la obra real (respetar aspect ratio)."
    )
    m["fuente"] = "COWORK-BRIDGE.md + kodex-content-atlas-2026-07-31.md + Codex Estelar (PDF, bóveda)"

    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(m, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print("Agregados:", added)
    print("Skipped (ya existían):", skipped)


if __name__ == "__main__":
    main()
