/**
 * KODEX−∞ · ESCENA 05 · SIGNAL TEMPLE
 *
 * No existía. Su función, textual (línea 69): "persistent architecture that
 * manifests accumulated system state. The altar contains the act; the temple
 * contains the state."
 *
 * Es la escena para la que se construyeron los derivados de la memoria: la
 * biblia da el mapeo POR NOMBRE (línea 74) y este archivo lo implementa tal
 * cual, sin inventar correspondencias:
 *
 *     archiveDepth     → densidad de columnas
 *     routeDiversity   → ramificación de corredores
 *     returnCount      → conexiones de raíz y techo
 *     collectiveSignals→ densidad de constelación — NO IMPLEMENTADO: las
 *                        señales colectivas son la fase pública del Commons,
 *                        que todavía no existe. Declararlo sería llamar
 *                        implementado a un prototipo.
 *
 * LA REGLA DURA DE LA ESCENA (líneas 72-73): "Mutation must be deterministic
 * enough to be explainable/debuggable… architecture changes should correspond
 * to real state variables, not decorative randomness." Consecuencia concreta:
 * el dibujo del templo NO usa azar. Cada columna, cada rama y cada conexión
 * sale aritméticamente de los tres derivados, así que dos visitantes con la
 * misma memoria ven el mismo templo, y el panel de la escena muestra los tres
 * números que lo explican.
 */

import type { SceneDefinition } from "../contratos";

export const TEMPLE_NODE_ID = "KDX-SCN-TEMPLE-005";

export const TEMPLE: SceneDefinition = {
  scene_id: "05_TEMPLE",
  node_id: TEMPLE_NODE_ID,
  /* Línea 71, textual. */
  states: ["dormant", "aware", "mutated", "resonant"],
  canonical: {
    dormant: "dormant",
    aware: "aware",
    mutated: "mutated",
    resonant: "resonant",
  },
  copy: {
    /** Línea 76. La frase de la escena. */
    containment: "THE ALTAR CONTAINS THE ACT. THE TEMPLE CONTAINS THE STATE.",
  },
  /* Línea 75, textual. */
  emits: ["temple_entered", "temple_state_seen", "temple_mutation_unlocked"],
  renderer: "canvas",
  /* Línea 78, textual: "preserve architecture mutations as static layout/state
     changes." La arquitectura muta igual; lo que se quita es el movimiento. */
  reducedMotion:
    "Las mutaciones de arquitectura se conservan como cambios estáticos de disposición. Sin deriva continua.",
  fallback:
    "La nave y las columnas son geometría 2D; sin canvas queda el panel de estado con los tres derivados. El templo sigue conteniendo el estado.",
};

/** Entradas de mutación de la biblia que este prototipo NO implementa. */
export const TEMPLE_NO_IMPLEMENTADO = ["collectiveSignals"] as const;

/**
 * El umbral de mutación desbloqueada. `temple_mutation_unlocked` se emite la
 * primera vez que algún derivado cruza este valor: antes de eso el templo se
 * ve, pero todavía no ha cambiado por causa del visitante. Elegido, no medido
 * — con nombre para ajustarlo cuando haya visitas reales.
 */
export const UMBRAL_MUTACION = 0.25;
