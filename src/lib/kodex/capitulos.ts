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
