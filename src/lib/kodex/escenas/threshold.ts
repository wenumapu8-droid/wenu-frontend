/**
 * KODEX−∞ · ESCENA 01 · THRESHOLD
 *
 * La biblia manda construir ésta primero y sola:
 *
 *     "Claude Code should audit current repository reality, then implement the
 *      shared contracts and THRESHOLD only."
 *
 * y  "Implementation target: establish canonical SceneDefinition + MemoryEvent
 *      contract here first."
 *
 * O sea que este archivo no es una escena más: es el ejemplar del que las otras
 * cinco se copian. Por eso declara TODO lo que la biblia exige exponer —
 * `node_id`, estados, copy, eventos, renderer, movimiento reducido y respaldo—
 * aunque para dibujar no haga falta.
 *
 * EL COPY ES CANON, NO DISEÑO. Las tres frases de abajo están textuales en
 * `10_P0_SCENE_BIBLE`, líneas 19 y 25. La compuerta de terminado dice "copy and
 * visual behavior match the canon", así que cambiarlas no es una decisión de
 * maquetado: es cambiar canon, y eso no lo hace un agente.
 */

import type { SceneDefinition } from "../contratos";

export const THRESHOLD_NODE_ID = "KDX-SCN-THRESHOLD-001";

/**
 * Los estados propios que la biblia le da a esta escena (línea 22), y su lectura
 * en el vocabulario canónico del sistema.
 *
 * `listening` y `aware` caen los dos en `aware`: la escena distingue "atento" de
 * "advertido" y el ciclo del sistema no. `crossed` es `mutated` porque cruzar es
 * la transformación de esta escena — es el único acto que deja al visitante
 * distinto del que llegó.
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
    /** Línea 19. Es la pregunta primaria de la escena. */
    question: "WILL YOU ENTER A SYSTEM THAT REMEMBERS TRANSFORMATION?",
    /** Línea 25, primera mitad. */
    agreement: "THE GATE IS A LIVING AGREEMENT.",
    /** Línea 25, segunda mitad. La entrada es voluntaria y hay que decirlo. */
    invitation: "ENTER VOLUNTARILY.",
  },
  emits: [
    "threshold_seen",
    "threshold_dwell",
    "threshold_crossed",
    "threshold_returned",
  ],
  renderer: "webgl",
  /* Línea 27, textual: "static aperture states + opacity/contrast changes, no
     large parallax or continuous tunnel motion." No es apagar: es cambiar de
     registro. */
  reducedMotion:
    "Estados de apertura fijos, con cambios de opacidad y contraste. Sin parallax grande ni túnel continuo.",
  fallback:
    "Apertura en SVG con los mismos seis estados. Sin WebGL la puerta sigue abriendo.",
};

/**
 * El umbral de permanencia, en milisegundos.
 *
 * La biblia pide distinguir pasar de quedarse ("dwell stabilizes the opening").
 * Cuatro segundos es el mismo valor que ya usa `KodexRecuerda.astro`; se copia a
 * propósito para que las dos lecturas de "se quedó" no discrepen.
 */
export const UMBRAL_PERMANENCIA = 4000;
