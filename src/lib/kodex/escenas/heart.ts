/**
 * KODEX−∞ · ESCENA 03 · HEART / NODE M
 *
 * No existía. Es la primera de las tres escenas P0 que la biblia pide y el
 * repositorio no tenía en ninguna forma — ni página, ni componente, ni rama.
 *
 * Su función, textual (línea 45): "orientation, integration and voluntary
 * convergence. The Heart does not score the visitor."
 *
 * Ésa es la regla dura de la escena, y decide el diseño entero: el Corazón
 * muestra el recorrido y ofrece caminos, y NUNCA los ordena por mérito. No hay
 * porcentaje de completitud, no hay "te falta ver", no hay camino correcto —
 * la biblia lo dice con todas las letras: "no forced 'correct' route".
 *
 * FUNDAMENTO EPISTÉMICO, porque esta escena lo necesita más que las otras. La
 * biblia lo acota así (línea 46): la interocepción —sentir, interpretar,
 * integrar y regular las señales internas del cuerpo— es la referencia
 * documentada para el lenguaje de sensado corporal, "while keeping toroides,
 * energetic fields and cosmic-heart correspondences explicitly symbolic". O
 * sea: el pulso de esta escena es SÍMBOLO, y presentarlo como biometría sería
 * mezclar capas que el canon manda no confundir. Por eso no hay —ni puede
 * haber— lectura de pulso real: el modo acompasado es un control del visitante,
 * no un sensor. "Optional breath-paced visual mode must be user-controlled,
 * not biometric."
 */

import type { SceneDefinition } from "../contratos";

export const HEART_NODE_ID = "KDX-SCN-HEART-003";

export const HEART: SceneDefinition = {
  scene_id: "03_HEART",
  node_id: HEART_NODE_ID,
  /* Línea 48, textual. */
  states: ["quiet", "pulsing", "orienting", "integrating", "returning"],
  canonical: {
    quiet: "dormant",
    pulsing: "aware",
    orienting: "resonant",
    /* Integrar es la transformación de esta escena: el recorrido suelto se
       vuelve un lugar desde donde elegir. */
    integrating: "mutated",
    returning: "remembered",
  },
  copy: {
    /** Línea 51. La frase que define la escena. */
    orientation: "THE HEART DOES NOT SCORE. IT ORIENTS.",
  },
  emits: [
    "heart_arrival",
    "heart_route_reviewed",
    "heart_choice",
    "heart_return_anchor",
  ],
  renderer: "canvas",
  /* Línea 53, textual: "pulsing becomes subtle luminance/line-weight change".
     El kit ya alarga el período con prefers-reduced-motion; acá además el
     latido baja de amplitud en vez de apagarse. */
  reducedMotion:
    "El latido se vuelve un cambio sutil de luminancia y grosor de línea. El período se alarga, no se apaga.",
  fallback:
    "La rosa de orientación y el recorrido son SVG/DOM y funcionan sin canvas. Sin latido, el Corazón sigue orientando.",
};

/**
 * Los caminos que el Corazón ofrece. Son puertas reales del sitio, no
 * promesas: cada una existe y se verificó. El orden es fijo y no significa
 * nada — ordenarlos por "recomendación" sería puntuar por la ventana.
 */
export const CAMINOS = [
  { ruta: "/kodex/", nombre: "THRESHOLD", detalle: "the gate, altered by memory" },
  { ruta: "/kodex/archive/", nombre: "ARCHIVE", detalle: "what the system remembers" },
  { ruta: "/kodex/lab/observe-v2/", nombre: "OBSERVER", detalle: "the field that watches back" },
  { ruta: "/kodex/return/", nombre: "RETURN", detalle: "leave with memory" },
] as const;
