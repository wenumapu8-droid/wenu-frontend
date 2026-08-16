/**
 * KODEX−∞ · ESCENA 06 · RETURN
 *
 * A diferencia de HEART, ALTAR y TEMPLE, esta escena YA EXISTÍA y ya cumplía
 * su función central: `readSpecimen()` construye la firma del recorrido desde
 * los nodos realmente visitados —"summarize route as a visual signature built
 * from actual visited nodes"— y `record({type:'cycle'})` incrementa el ciclo.
 * Eso no se toca: la migración es sumarle el contrato, no reescribirla.
 *
 * Su función, textual (línea 82): "reintegration, not reset. Return creates a
 * new initial condition."
 */

import type { SceneDefinition } from "../contratos";

export const RETURN_NODE_ID = "KDX-SCN-RETURN-006";

export const RETURN: SceneDefinition = {
  scene_id: "06_RETURN",
  node_id: RETURN_NODE_ID,
  /* Línea 84, textual. */
  states: ["approaching", "integrating", "signature_generated", "returned"],
  canonical: {
    approaching: "aware",
    integrating: "resonant",
    signature_generated: "mutated",
    returned: "remembered",
  },
  copy: {
    /** Línea 87. La frase de la escena. */
    reintegration: "RETURN WITH MEMORY. NOT TO THE SAME POINT.",
  },
  /* Línea 86, textual. */
  emits: [
    "return_started",
    "route_signature_created",
    "return_completed",
    "cycle_incremented",
  ],
  renderer: "canvas",
  /* Línea 88, textual. */
  reducedMotion:
    "Fundido cruzado y reordenamiento estructural en vez de túnel o vuelo.",
  fallback:
    "La firma es un código y un sello 2D; sin canvas se muestra el código. Volver sigue creando una condición inicial nueva.",
};
