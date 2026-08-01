/**
 * KODEX-∞ · CAPÍTULOS
 *
 * Los pósters de Ocín no son imágenes para catalogar: son **planos de
 * construcción**. Cada panel numerado del póster es un módulo real de la
 * página, y este módulo guarda los datos que esos paneles muestran.
 *
 * Están acá y no escritos a mano en la página por una razón concreta: son
 * dieciocho capítulos con la misma anatomía y distinto contenido. Separar el
 * dato del dibujo es lo que hace que el capítulo diecisiete cueste horas y no
 * días.
 *
 * Todo lo que sigue está transcrito del póster **al pie de la letra** —
 * radios, períodos, masas, estados. Cuando un número se ve en el plano, es ese
 * número el que corre en la animación: la lógica orbital del panel 08 mueve
 * los cuerpos del panel 09 con los valores del panel 09. El plano no ilustra
 * la escena; la escena ES el plano corriendo.
 */

import type { Sello } from "./simbolos";

export type TipoCuerpo = "planet" | "satellite" | "node" | "gate" | "core";

export type Cuerpo = {
  id: string;
  tipo: TipoCuerpo;
  nombre: string;
  masa: string;
  /** Radio orbital en AU, tal como lo declara la tabla. */
  radio: number;
  /** Período en días. Manda la velocidad angular: ω = 2π / período. */
  periodo: number;
  estado: "STABLE" | "ACTIVE" | "ANOMALY" | "LOCKED";
  /** Inclinación: el término `z` del pseudocódigo. Da la profundidad. */
  inclinacion: number;
  /** Con quién se dibuja el vector, si lo hay. */
  enlace?: string;
  /** Sólo NODE: frecuencia de su pulso. */
  frecuencia?: number;
  /** A qué sub-universo lleva. */
  destino?: string;
};

export type Sector = {
  n: string;
  nombre: string;
  claves: [string, string];
  /** Ángulo en el mapa, en grados. 0 = derecha, crece antihorario. */
  angulo: number;
  destino?: string;
};

export type Portal = { nombre: string; angulo: number; destino?: string };

export type Estado = {
  id: "MAP" | "ORBIT" | "ALIGN" | "REVEAL";
  lineas: [string, string, string];
};

export type Capitulo = {
  slug: string;
  titulo: string;
  subtitulo_en: string;
  subtitulo_es: string;
  tanda: string;
  archiveId: string;
  fecha: string;
  sysVer: string;
  build: string;
  /** Acento del capítulo y su apoyo. Negro dominante, siempre. */
  acento: string;
  apoyo: string;
  sello: Sello;
  selloTexto: string;
};

/* ────────────────────────────────────────────────────────────────────────────
   TANDA 01 · COSMOLOGY CORE
   ──────────────────────────────────────────────────────────────────────── */

export const COSMOLOGY_CORE: Capitulo = {
  slug: "cosmology-core",
  titulo: "COSMOLOGY CORE",
  subtitulo_en: "ORBIT MAP",
  subtitulo_es: "NÚCLEO COSMOLÓGICO",
  tanda: "TANDA-01",
  archiveId: "KX-T01-01A",
  fecha: "2025-05-22",
  sysVer: "v2.0.0",
  build: "T01A-CORE",
  acento: "#FF2E7E",
  apoyo: "#4FC3F7",
  // El sistema orbital de este capítulo es invención de KODEX: los cuerpos, los
  // sectores y las puertas no existen. Va marcado como tal.
  sello: "B",
  selloTexto: "REGISTRO ② · CARTOGRAFÍA DE FICCIÓN — NO ES ASTRONOMÍA",
};

/** Panel 09 · ORBITAL SYSTEM DATA, transcrito del plano. */
export const CUERPOS: Cuerpo[] = [
  {
    id: "KX-07", tipo: "planet", nombre: "AEON PRIME", masa: "5.21",
    radio: 1.0, periodo: 365.25, estado: "STABLE", inclinacion: 0.18,
    destino: "archivo",
  },
  {
    id: "KX-11", tipo: "planet", nombre: "LUMEN-11", masa: "3.77",
    radio: 1.68, periodo: 687.12, estado: "STABLE", inclinacion: 0.32,
    destino: "achroma",
  },
  {
    id: "KX-13", tipo: "planet", nombre: "CRADLE-13", masa: "2.11",
    radio: 2.54, periodo: 1024.55, estado: "ACTIVE", inclinacion: 0.24,
    destino: "tribu",
  },
  {
    id: "KX-17", tipo: "planet", nombre: "MIRROR-17", masa: "1.62",
    radio: 3.33, periodo: 1533.20, estado: "STABLE", inclinacion: 0.41,
    destino: "posters",
  },
  {
    // Satélite: orbita a KX-13, no al núcleo. El vector se dibuja hacia él.
    id: "KX-19", tipo: "satellite", nombre: "ECHO-19", masa: "0.14",
    radio: 0.32, periodo: 65.21, estado: "ACTIVE", inclinacion: 0.12,
    enlace: "KX-13",
  },
  {
    id: "KX-21", tipo: "planet", nombre: "ATRIUM-21", masa: "4.98",
    radio: 4.21, periodo: 2011.88, estado: "STABLE", inclinacion: 0.29,
    destino: "disco-solar",
  },
  {
    // `N/A` en masa, radio y período. Un nodo no orbita: late.
    id: "KX-Δ7", tipo: "node", nombre: "VOID NODE", masa: "N/A",
    radio: 2.95, periodo: 0, estado: "ANOMALY", inclinacion: 0.5,
    frecuencia: 1.7, enlace: "KX-17",
  },
  {
    // La puerta serpiente está LOCKED: sólo se abre en REVEAL.
    id: "KX-Ω8", tipo: "gate", nombre: "SERPENT GATE", masa: "N/A",
    radio: 4.85, periodo: 0, estado: "LOCKED", inclinacion: 0.0,
    destino: "codex-estelar",
  },
];

/** Panel 04 · los cuatro sectores del mapa. */
export const SECTORES: Sector[] = [
  { n: "01", nombre: "AEON PRIMUS",   claves: ["S-01A", "S-01B"], angulo: 145, destino: "archivo" },
  { n: "02", nombre: "VOID SERPENTIS", claves: ["S-02A", "S-02B"], angulo: 35,  destino: "codex-estelar" },
  { n: "03", nombre: "CRADLE DEEPS",   claves: ["S-03A", "S-03B"], angulo: 215, destino: "tribu" },
  { n: "04", nombre: "ECHO ATRIUM",    claves: ["S-04A", "S-04B"], angulo: 325, destino: "disco-solar" },
];

/** Panel 04 · las cuatro puertas. HORIZON aparece dos veces, a los lados. */
export const PORTALES: Portal[] = [
  { nombre: "ZENITH GATE",  angulo: 90,  destino: "boveda" },
  { nombre: "HORIZON GATE", angulo: 180, destino: "atlas" },
  { nombre: "HORIZON GATE", angulo: 0,   destino: "sistemas" },
  { nombre: "NADIR GATE",   angulo: 270, destino: "mandalas" },
];

/**
 * Panel 02 · los cuatro estados de escena.
 *
 * No son etiquetas: son las cuatro fases por las que pasa el visitante, y cada
 * una cambia de verdad lo que hace el mapa. El recorrido es MAP → ORBIT →
 * ALIGN → REVEAL, y en REVEAL se rompe el sello.
 */
export const ESTADOS: Estado[] = [
  { id: "MAP",    lineas: ["Reveal the field.", "Layer scan.", "Establish scale."] },
  { id: "ORBIT",  lineas: ["Follow the path.", "Track movement.", "Read the nodes."] },
  { id: "ALIGN",  lineas: ["Synchronize vectors.", "Lock the geometry.", "Stabilize the core."] },
  { id: "REVEAL", lineas: ["Break the seal.", "Surface the truth.", "Transmit the signal."] },
];

/** Panel 03 · notas de movimiento. */
export const MOVIMIENTO = [
  { n: "ORBIT",    lineas: ["Continuous rotation.", "Elliptical paths.", "Parallax shift.", "Inertia dampened."] },
  { n: "TRANSMIT", lineas: ["Signal outbound.", "Pulse along route.", "Data leaves trail.", "Echo return."] },
  { n: "EXPAND",   lineas: ["Field grows.", "Rings unfold.", "New nodes awaken.", "Scale increases."] },
  { n: "CONTRACT", lineas: ["Field collapses.", "Paths converge.", "Energy draws in.", "Core stabilizes."] },
];

/** Panel 01 · leyenda de glifos. */
export const LEYENDA = [
  { g: "◉", es: "NÚCLEO", en: "CORE" },
  { g: "●", es: "MUNDO", en: "PLANET" },
  { g: "○", es: "LUNA", en: "SATELLITE" },
  { g: "◈", es: "NODO", en: "NODE" },
  { g: "⬡", es: "PORTAL", en: "GATE" },
  { g: "↗", es: "RUTA", en: "VECTOR" },
  { g: "⊗", es: "ANOMALÍA", en: "ANOMALY" },
];

/** Panel 06 · los siete arquetipos. Cada uno es una resonancia navegable. */
export const ARQUETIPOS = [
  { nombre: "THE SEED",    nodos: 5, destino: "archivo" },
  { nombre: "THE WITNESS", nodos: 6, destino: "pinterest" },
  { nombre: "THE SPIRAL",  nodos: 7, destino: "disco-solar" },
  { nombre: "THE MIRROR",  nodos: 6, destino: "achroma" },
  { nombre: "THE LATTICE", nodos: 8, destino: "sistemas" },
  { nombre: "THE VOID",    nodos: 4, destino: "codex-estelar" },
  { nombre: "THE ANCHOR",  nodos: 5, destino: "boveda" },
];

/** Panel 07 · las cinco bandas del espectro. */
export const BANDAS = ["SUB-ASTRAL", "ASTRAL", "ETHEREAL", "CELESTIAL", "BEYOND"];

/** Panel 01 · referencia orbital. */
export const REFERENCIA = [
  ["PLANE", "ECLIPTIC-7"],
  ["EPOCH", "2025.142"],
  ["FRAME", "KODEX INERTIAL"],
  ["GRID", "HEX / TRIAD"],
  ["UNIT", "ASTRAL"],
];

/**
 * Panel 10 · telemetría del núcleo.
 *
 * `vivo` marca los que tickean. Los otros son constantes del plano y se
 * quedan quietos: si todo se moviera, nada se leería como medición — se leería
 * como decoración que parpadea.
 */
export const TELEMETRIA = [
  { k: "CORE TEMP", v: "87.3", u: " K", vivo: true, amp: 0.4 },
  { k: "FIELD STABILITY", v: "94.6", u: "%", vivo: true, amp: 0.8 },
  { k: "GRAVITY SHEAR", v: "0.0021", u: " g", vivo: false },
  { k: "DARK FLOW", v: "13.7", u: "%", vivo: true, amp: 1.2 },
  { k: "QUANTUM NOISE", v: "2.7", u: " dB", vivo: true, amp: 0.6 },
  { k: "TIMELINE DRIFT", v: "0.0009", u: "%", vivo: false },
  { k: "ANCHOR LOCK", v: "ENGAGED", u: "", vivo: false },
];

/* ────────────────────────────────────────────────────────────────────────────
   TANDA 01 · SIGNAL BLOOM · seed KX∞-T01-172A
   ──────────────────────────────────────────────────────────────────────── */

/**
 * El registro de capítulos.
 *
 * El motor recorre esto: agregar un capítulo es agregar una entrada, no
 * escribir una página. Es la misma división que sostiene la biblioteca de
 * volúmenes — el contenido es dato, el renderizador es código — y es lo que
 * hace que el capítulo diecisiete cueste horas y no días.
 */
export type Plano = "bloom" | "orbita";

export type CapituloMotor = Capitulo & {
  plano: Plano;
  /** Paleta EXACTA del plano. No se interpreta: se transcribe. */
  paleta: string[];
  seedHash: string;
  archivo: string;
  categoria: string;
  clase: string;
  clearance: string;
};

export const SIGNAL_BLOOM: CapituloMotor = {
  slug: "signal-bloom",
  titulo: "SIGNAL BLOOM",
  subtitulo_en: "TRANSMISSION FIELD",
  subtitulo_es: "FLORACIÓN DE SEÑAL",
  tanda: "TANDA-01",
  archiveId: "KX∞-T01-172A",
  fecha: "2025-05-22",
  sysVer: "v2.0.0",
  build: "T01A-BLOOM",
  acento: "#FF00FF",
  apoyo: "#00C5FF",
  sello: "B",
  selloTexto: "REGISTRO ② · PATRÓN VIVO — FICCIÓN DE KODEX",
  plano: "bloom",
  paleta: ["#FF00FF", "#9000FF", "#6A00FF", "#00C5FF", "#FF2A2A", "#FFFFFF"],
  seedHash: "KX∞-T01-172A",
  archivo: "LPA-2025-05-22",
  categoria: "TRANSMISSION FIELD",
  clase: "LIVING PATTERN",
  clearance: "C-4",
};

/**
 * Panel 01 · SIGNAL STATES.
 *
 * Los cuatro umbrales salen del panel 06 del plano y son lo ÚNICO que cambia
 * entre estados en el shader. Cada uno trae además su color de la paleta: el
 * póster los pinta distinto y esa es la lectura — el estado se reconoce por
 * color antes que por su nombre.
 */
export const ESTADOS_SENAL = [
  { id: "IDLE",     color: "#00C5FF", threshold: 0.80, lineas: ["BACKGROUND HUM", "STABLE FIELD", "LOW ENERGY"] },
  { id: "BUILD",    color: "#6A00FF", threshold: 0.55, lineas: ["AMPLITUDE RISE", "PATTERN FORMATION", "ENERGY ACCUMULATION"] },
  { id: "BLOOM",    color: "#FF00FF", threshold: 0.30, lineas: ["SIGNAL PEAK", "STRUCTURE BLOOMS", "TRANSMISSION ACTIVE"] },
  { id: "DISPERSE", color: "#FF2A2A", threshold: 0.75, lineas: ["SIGNAL FRACTURES", "DATA SCATTERS", "FIELD RETURNS"] },
];

/** Panel 02 · MOTION NOTES. */
export const MOTION_SENAL = [
  { n: "PULSE",    color: "#00C5FF", lineas: ["RHYTHMIC THROB", "BREATH OF FIELD", "SYNC TO HEARTBEAT"] },
  { n: "TRANSMIT", color: "#6A00FF", lineas: ["DATA OUTBOUND", "SIGNAL BEAM", "CONNECT & SEND"] },
  { n: "GLITCH",   color: "#FF00FF", lineas: ["INTERFERENCE", "PIXEL SHIFT", "REALITY BREAK"] },
  { n: "RETURN",   color: "#FF2A2A", lineas: ["DECAY & RESET", "ENERGY FALL", "BACK TO SOURCE"] },
];

/** Panel 03 · TEXTURE CROPS / materiales de señal. */
export const TEXTURAS = [
  { n: "BITMAP NOISE",  color: "#FF00FF" },
  { n: "PIXEL SORT",    color: "#9000FF" },
  { n: "GLITCH MODE",   color: "#00C5FF" },
  { n: "CRT SCANLINES", color: "#FF2A2A" },
];

/** Panel 06 · SIGNAL LOGIC, transcrito letra por letra del plano. */
export const LOGICA_SENAL = [
  "// KODEX-∞ SIGNAL BLOOM v2.0",
  "float time  = u_time * SPEED;",
  "vec2  uv    = v_uv * SCALE;",
  "float pulse = sin(time * BPM) * 0.5 + 0.5;",
  "float n     = fbm(uv * 3.0 + time * 0.1);",
  "float bloom = pow(max(n - THRESHOLD, 0.0), 2.0);",
  "",
  "float field = length(uv) * 2.0;",
  "field += sin(field * 8.0 - time) * 0.1;",
  "",
  "vec3 col = mix(COLOR_A, COLOR_B, bloom);",
  "col += vec3(pulse) * 0.2;",
  "col  = glitch(col, uv, time);",
  "col  = scanlines(col, uv, 1024.0);",
  "",
  "out_color = vec4(col, 1.0);",
];

/** Panel 05 · AUTH SEALS: el mismo árbol en cuatro colores. */
export const SELLOS = ["#FF00FF", "#9000FF", "#00C5FF", "#FF2A2A"];

/** Anclas de identidad del plano. */
export const ANCLAS = [
  { n: "PRIMARY ANCHOR", tipo: "marca" },
  { n: "VISUAL ANCHOR", tipo: "orbe" },
  { n: "DATA ANCHOR", tipo: "barcode" },
  { n: "SIGNAL ANCHOR", tipo: "qr" },
];


/* ────────────────────────────────────────────────────────────────────────────
   TANDA 01 · SPECIMEN SKULL · doc KX-7A19-SK01
   ──────────────────────────────────────────────────────────────────────── */

/**
 * El espécimen.
 *
 * **Comparte Gate ID con THRESHOLD PORTAL: KX-7A19.** No es coincidencia de
 * nomenclatura — es la conexión interna del archivo: el cráneo cruzó ese
 * umbral, y las dos escenas se enlazan por ese dato. Lo mismo el ∞ y el sello
 * del árbol, que recurren en THRESHOLD, SIGNAL BLOOM y acá: son el sello común
 * del sistema, no un adorno repetido.
 */
export const SPECIMEN_SKULL: CapituloMotor = {
  slug: "specimen-skull",
  titulo: "SPECIMEN SKULL",
  subtitulo_en: "BIO-VESSEL",
  subtitulo_es: "CRÁNEO ESPECIMEN",
  tanda: "TANDA-01",
  archiveId: "KX-7A19-SK01",
  fecha: "2025-05-22",
  sysVer: "v2.0.0",
  build: "T01A-SKULL",
  acento: "#FF2A2A",
  apoyo: "#00C5FF",
  sello: "B",
  selloTexto: "REGISTRO ② · ESPÉCIMEN DE FICCIÓN — NO ES ANATOMÍA",
  plano: "craneo",
  paleta: ["#FF2A2A", "#FF5C5C", "#00C5FF", "#7FFF3C", "#FFFFFF", "#8892A0"],
  seedHash: "KX-7A19-SK01",
  archivo: "BLACK ARCHIVE",
  categoria: "CYBER-ORGANIC PATTERN",
  clase: "ARCHIVE VESSEL",
  clearance: "C-4",
};

/** El portal por el que entró. La conexión es un dato, no una nota al pie. */
export const GATE_ID = "KX-7A19";

/** Panel 03 · TREATMENT MODES. Cinco lecturas del MISMO cráneo. */
export const TRATAMIENTOS_SK = [
  { n: "X-RAY",    color: "#FF2A2A", lee: "ESTRUCTURA ÓSEA · CAPA BASE" },
  { n: "LINEWORK", color: "#8892A0", lee: "TRAZO PURO · SIN RELLENO" },
  { n: "BITMAP",   color: "#FFFFFF", lee: "UN BIT POR CELDA" },
  { n: "THERMAL",  color: "#FF5C5C", lee: "SEÑAL COMO TEMPERATURA" },
  { n: "GLITCH",   color: "#00C5FF", lee: "RUPTURA · CANAL SEPARADO" },
];

/** Panel 05 · SCAN PROTOCOLS. La interacción del capítulo. */
export const PROTOCOLOS_SK = [
  { n: "SCAN",    lineas: ["Sweep the layers.", "Map the vessel."] },
  { n: "ISOLATE", lineas: ["Drop the field.", "Specimen alone."] },
  { n: "REVEAL",  lineas: ["Open the matrix.", "Surface the mesh."] },
  { n: "GLITCH",  lineas: ["Break the read.", "Signal fractures."] },
  { n: "ARCHIVE", lineas: ["Seal the record.", "Return to ember."] },
];

/** Nodos de anatomía que el escáner mide. */
export const ANATOMIA = [
  { n: "FRONTAL", v: "97.6" },
  { n: "ORBITAL", v: "94.1" },
  { n: "NASAL",   v: "88.7" },
  { n: "JAW",     v: "91.3" },
];

/** Panel 04 · lecturas. Las que tickean llevan `vivo`. */
export const LECTURAS_SK = [
  { k: "SIGNAL LOCK", v: "97.6", u: "%", vivo: true, amp: 0.5 },
  { k: "NEURAL INTERFACE", v: "82.0", u: "%", vivo: true, amp: 1.4 },
  { k: "SIGNAL INTEGRITY", v: "97.6", u: "%", vivo: true, amp: 0.4 },
  { k: "CORE FREQ", v: "13.610", u: " THz", vivo: true, amp: 0.008 },
  { k: "ANOMALY", v: "HIGH", u: "", vivo: false },
  { k: "THREAT", v: "C-4", u: "", vivo: false },
];

/** Panel 09 · notas del expediente, transcritas del plano. */
export const NOTAS_SK = [
  "Subject displays bio-synthetic integration far beyond known baseline.",
  "Cranial matrix acts as both processor and signal amplifier.",
  "Unknown origin. Non-human.",
  "Extreme adaptive behavior in hostile environments.",
];

/** Panel 10 · etiquetas de archivo. */
export const TAGS_SK = [
  "SKULL", "CYBER-ORGANIC", "CRANIAL_MATRIX", "HOSTILE",
  "ADAPTIVE", "UNKNOWN_ORIGIN", "HIGH_SIGNAL", "BLACK_ARCHIVE",
];

/**
 * Las escenas hermanas.
 *
 * El plano pide enlace explícito entre capítulos: el cráneo cruzó el umbral de
 * KX-7A19, y su GLITCH es el mismo vocabulario que el de SIGNAL BLOOM. Enlazar
 * es lo que convierte tres láminas sueltas en un archivo.
 */
export const HERMANAS_SK = [
  { url: "/kodex/", titulo: "THRESHOLD PORTAL", razon: `MISMO GATE ID · ${GATE_ID}` },
  { url: "/kodex/capitulo/signal-bloom/", titulo: "SIGNAL BLOOM", razon: "GLITCH · MISMO VOCABULARIO" },
  { url: "/kodex/capitulo/cosmology-core/", titulo: "COSMOLOGY CORE", razon: "SELLO ∞ · ARCHIVO COMÚN" },
];

/**
 * El motor recorre esto. Agregar un capítulo es agregar una línea.
 *
 * Va al FINAL del archivo a propósito: un `const` no se iza, así que declarar
 * la lista antes que los capítulos que la componen revienta con un error de
 * zona muerta al evaluar el módulo — y revienta el build entero, no sólo la
 * página.
 */
export const CAPITULOS: CapituloMotor[] = [SIGNAL_BLOOM, SPECIMEN_SKULL];
