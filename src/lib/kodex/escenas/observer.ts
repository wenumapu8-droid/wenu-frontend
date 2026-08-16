/**
 * KODEX−∞ · ESCENA 02 · OBSERVER
 *
 * La biblia la pone segunda en el orden de implementación y con una condición
 * que manda cómo hacerla:
 *
 *     "Migrate Observe V2 to the shared contracts."
 *     "…without flattening its current visual identity or telemetry."
 *
 * Por eso esta migración NO toca el renderizador. `kodex-observe-v2-client.ts`
 * son 732 líneas con ocho shaders y ya publica su estado y sus métricas al DOM
 * (`data-state`, `data-checksum`, `data-kdx-fps`, `data-kdx-metrics-json`).
 * El enganche lee eso. Reescribirlo para "unificar" habría sido exactamente el
 * aplanamiento que la biblia prohíbe.
 *
 * LO QUE ESTA ESCENA YA CUMPLÍA, y nadie había cotejado: sus cuatro estados
 * (`idle`, `aware`, `locked`, `observing`) son textualmente los cuatro primeros
 * que pide la biblia, y su telemetría —fps, tiempo de cuadro, cuadros perdidos—
 * es la que exige la compuerta de rendimiento. Estaba más cerca del canon que
 * cualquier escena del corredor, escondida en un lab con `noindex`.
 *
 * LO QUE NO CUMPLE, dicho sin maquillar: de los seis estados canónicos, el
 * renderizador implementa cuatro. `reflected` NO está implementado y no se
 * declara como si lo estuviera — el canon prohíbe llamar implementado a un
 * prototipo. `remembered` sí, pero en esta capa y no en el shader: es el estado
 * de quien ya observó antes, y eso lo sabe el registro, no la GPU.
 */

import type { SceneDefinition } from "../contratos";

export const OBSERVER_NODE_ID = "KDX-SCN-OBSERVER-002";

export const OBSERVER: SceneDefinition = {
  scene_id: "02_OBSERVER",
  node_id: OBSERVER_NODE_ID,
  /* Los seis de la biblia, línea 35. En el mismo orden. */
  states: ["idle", "aware", "locked", "observing", "reflected", "remembered"],
  canonical: {
    idle: "dormant",
    aware: "aware",
    locked: "resonant",
    /* Observar es el acto que cambia el mapa. Por eso `observing` es `mutated`
       y no un `resonant` más: la escena entera trata de que mirar no sea
       neutral. */
    observing: "mutated",
    reflected: "mutated",
    remembered: "remembered",
  },
  copy: {
    /** Línea 38, primera mitad. */
    reciprocity: "YOU SEE. YOU ARE SEEN.",
    /** Línea 38, segunda mitad. Es la tesis de la escena. */
    thesis: "THE OBSERVER CHANGES THE MAP BY TRAVERSING IT.",
  },
  emits: ["observer_focus", "observer_dwell", "observer_pattern_revisited"],
  renderer: "webgl",
  /* Línea 40, textual: "replace moving eyes with state changes in line weight,
     contrast and node activation". No es apagar: es cambiar de registro. */
  reducedMotion:
    "Los ojos dejan de moverse y el estado se lee en grosor de línea, contraste y nodos activos.",
  /* El renderizador ya marca `data-webgl=\"fallback\"` cuando no consigue
     contexto. El respaldo existe y está probado; acá sólo se declara. */
  fallback: "Campo en DOM/CSS con los mismos estados. Marcado con data-webgl=fallback.",
};

/**
 * Los estados que el renderizador implementa hoy, contra los seis del canon.
 * Está acá y no en un comentario para que una vista de depuración pueda mostrar
 * la brecha en vez de que haya que descubrirla leyendo dos archivos.
 */
export const OBSERVER_IMPLEMENTADOS = ["idle", "aware", "locked", "observing"] as const;

/** Milisegundos de observación sostenida antes de contar permanencia. */
export const UMBRAL_OBSERVACION = 4000;

/**
 * PROHIBIDO EN ESTA ESCENA, y es la única que lo dice por escrito.
 *
 * Línea 41: "Do not infer emotion, attention quality or psychological state."
 *
 * La escena mide foco como propiedad del CAMPO —cuántos nodos se activan, qué
 * densidad hay bajo el puntero—, nunca como propiedad de la persona. La
 * diferencia no es retórica: `focus` acá es un número del render, y llamarlo
 * "atención del visitante" lo convertiría en inferencia psicológica. No hay
 * webcam, y la biblia lo fija: "gaze-like pointer field without webcam by
 * default".
 */
export const OBSERVER_PROHIBIDO = [
  "inferir emoción",
  "inferir calidad de atención",
  "inferir estado psicológico",
  "activar cámara sin acto explícito",
] as const;
