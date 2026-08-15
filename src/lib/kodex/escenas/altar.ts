/**
 * KODEX−∞ · ESCENA 04 · DIGITAL ALTAR
 *
 * No existía. Su función, textual (línea 57): "convert an intentional act into
 * an addressable signal and memory record."
 *
 * ES EL PROTOTIPO LOCAL, Y ESO ES UNA DECISIÓN DEL CANON, NO UNA LIMITACIÓN:
 * "Digital Altar local-memory prototype before public Commons." Todo lo que se
 * ofrece acá vive en el navegador del visitante y no viaja a ningún lado. La
 * contribución pública vendrá después y será opt-in: "Public contribution is
 * always opt-in and separable from local/private memory."
 *
 * DOS MEMORIAS, A PROPÓSITO. La ofrenda lleva texto del visitante, y el
 * contrato de MemoryEvent no admite texto — su campo `detail` es numérico
 * justamente para que nada escrito por una persona entre al registro de
 * eventos. La biblia resuelve la tensión dándole al altar su PROPIO esquema
 * (línea 61): offering_id, timestamp, offering_type, local_or_public,
 * node_context, route_context, transformation_history, moderation_status.
 * Así que la ofrenda va a su propio almacén local con ese esquema, y el
 * MemoryEvent que la acompaña sólo dice QUE hubo ofrenda y de qué tipo — nunca
 * qué decía.
 *
 * LO QUE NO ESTÁ IMPLEMENTADO, dicho: de las seis acciones que lista la biblia
 * (write, draw, place a symbol, leave a word, select a coordinate,
 * release/return) este prototipo implementa escribir, colocar símbolo, elegir
 * coordenada y soltar. DIBUJAR NO — declararlo sería llamar implementado a un
 * prototipo. Queda en ALTAR_NO_IMPLEMENTADO.
 */

import type { SceneDefinition } from "../contratos";

export const ALTAR_NODE_ID = "KDX-SCN-ALTAR-004";

export const ALTAR: SceneDefinition = {
  scene_id: "04_ALTAR",
  node_id: ALTAR_NODE_ID,
  /* Línea 60, textual. */
  states: ["dormant", "receiving", "composing", "offered", "archived", "released"],
  canonical: {
    dormant: "dormant",
    receiving: "aware",
    composing: "resonant",
    /* Ofrecer es la transformación: el acto se vuelve señal direccionable. */
    offered: "mutated",
    archived: "mutated",
    released: "remembered",
  },
  copy: {
    /** Línea 64. La frase de la escena. */
    weave: "MEMORY IS NOT STORED. IT IS WOVEN.",
  },
  /* La biblia no nombra los eventos de esta escena (le da el esquema de la
     ofrenda en su lugar). Estos dos nombres son ELEGIDOS siguiendo el patrón
     de las otras escenas, y queda dicho que son elección y no cita. */
  emits: ["altar_offered", "altar_released"],
  renderer: "canvas",
  /* Línea 65, textual: "represent vortex as radial state progression rather
     than continuous spinning." */
  reducedMotion:
    "El vórtice deja de girar y avanza por estados radiales discretos.",
  fallback:
    "El altar es un formulario DOM con los mismos estados. Sin canvas, la ofrenda igual se teje al registro.",
};

/** Acciones de la biblia que este prototipo NO implementa todavía. */
export const ALTAR_NO_IMPLEMENTADO = ["draw"] as const;

/**
 * La ofrenda, con el esquema mínimo que fija la biblia (línea 61).
 * `local_or_public` es siempre "local" en este prototipo — el Commons público
 * es otra fase y será opt-in. `moderation_status`: la biblia dice "where
 * applicable"; en memoria local de un solo visitante no aplica.
 */
export interface Ofrenda {
  offering_id: string;
  timestamp: number;
  offering_type: "word" | "symbol" | "coordinate";
  local_or_public: "local";
  node_context: string;
  route_context: readonly string[];
  transformation_history: string[];
  moderation_status: "not_applicable_local";
  /** El contenido. Vive SOLO en este almacén local, nunca en los eventos. */
  content: string;
}

/**
 * Los símbolos que se pueden colocar. Marcas geométricas neutras más el sello
 * −∞ del propio sistema. NINGÚN símbolo cultural: universalizar símbolos de
 * una tradición está prohibido por la constitución, y el altar es el lugar
 * más fácil para cometer ese error sin darse cuenta.
 */
export const SIMBOLOS = ["−∞", "○", "△", "▢", "·"] as const;

export const MAX_PALABRA = 48;
