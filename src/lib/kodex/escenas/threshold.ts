/**
 * KODEX−∞ · ESCENA 00 · THRESHOLD
 *
 * THRESHOLD es el ejemplar del que las otras seis escenas toman los contratos
 * compartidos. Por eso declara `node_id`, estados, copy, eventos, renderer,
 * movimiento reducido y respaldo aunque para dibujar no haga falta.
 *
 * EL COPY ES CANON, NO DISEÑO. Cambiar estas frases requiere decisión de canon;
 * la implementación sólo puede decidir cómo hacer legible y accesible el gesto.
 */

import type { SceneDefinition } from "../contratos";

export const THRESHOLD_NODE_ID = "KDX-SCN-THRESHOLD-001";

/**
 * Estados propios de THRESHOLD y su lectura en el vocabulario del sistema.
 * `crossed` es `mutated` porque cruzar es la transformación de esta escena.
 */
export const THRESHOLD: SceneDefinition = {
  scene_id: "01_THRESHOLD",
  node_id: THRESHOLD_NODE_ID,
  states: ["dormant", "listening", "aware", "open", "crossed", "remembered"],
  canonical: {
    dormant: "dormant",
    listening: "aware",
    aware: "aware",
    open: "resonant",
    crossed: "mutated",
    remembered: "remembered",
  },
  copy: {
    question: "WILL YOU ENTER A SYSTEM THAT REMEMBERS TRANSFORMATION?",
    agreement: "THE GATE IS A LIVING AGREEMENT.",
    invitation: "ENTER VOLUNTARILY.",
  },
  emits: [
    "threshold_seen",
    "threshold_dwell",
    "threshold_crossed",
    "threshold_returned",
  ],
  renderer: "webgl",
  reducedMotion:
    "Estados de apertura fijos, con cambios de opacidad y contraste. Sin parallax grande ni túnel continuo.",
  fallback:
    "Apertura en SVG con los mismos seis estados. Sin WebGL la puerta sigue abriendo.",
};

/**
 * Contrato de interacción vigente para el cruce.
 *
 * La LEY canónica es: hold sostenido + progreso visible + soltar interrumpe y
 * decae + sólo completar cruza. Los milisegundos son parámetros de UX sujetos a
 * QA; no son una afirmación narrativa ni científica.
 */
export const THRESHOLD_HOLD = {
  required: true,
  durationMs: 1800,
  decayMaxMs: 900,
  releaseInterrupts: true,
  inputs: ["pointer", "touch", "keyboard"],
  reducedMotionDecay: "instant",
} as const;

/**
 * El umbral de permanencia no es el umbral de cruce.
 * Quedarse puede estabilizar la escena y registrar `threshold_dwell`, pero jamás
 * cruza automáticamente. Cuatro segundos conserva el valor ya usado por la
 * memoria histórica del runtime.
 */
export const UMBRAL_PERMANENCIA = 4000;
