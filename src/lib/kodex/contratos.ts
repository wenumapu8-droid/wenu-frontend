/**
 * KODEX−∞ · LOS CONTRATOS COMPARTIDOS
 *
 * La P0 Scene Bible abre diciendo qué son las seis escenas y qué NO son:
 *
 *     "These six scenes must share one memory model, one signal/modulation
 *      layer, one provenance contract and one accessibility/performance
 *      standard. They are not six isolated microsites."
 *
 * Y el blueprint lo prohíbe explícitamente al revés: no se deben
 * "hard-code per-scene systems that should be shared".
 *
 * Hoy es exactamente lo que pasa. Cada escena trae su propio cliente
 * —`kodex-portal-client.ts`, `kodex-gate-client.ts`, `kodex-transition-client.ts`,
 * `kodex-observe-client.ts`— y cada uno guarda lo suyo en `localStorage` con su
 * propia clave y su propio criterio. Coinciden por casualidad, no por contrato.
 *
 * Este módulo es el vocabulario único. No dibuja ni anima: nombra.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CONFLICTO REGISTRADO · vocabulario de estados
 *
 * Hay dos máquinas de estado con nombres distintos para lo mismo, y el canon
 * manda no resolver eso en silencio:
 *
 *     "Ningún agente debe resolver silenciosamente un conflicto. Debe
 *      conservarlo, clasificarlo y proponer una acción verificable."
 *
 *   · `lib/kodex/estado.ts` usa  idle → aware → locked → active → transitionOut,
 *     citando "La Receta Madre §8". Está en uso y funciona.
 *   · La P0 Scene Bible fija     dormant → aware → resonant → mutated → remembered.
 *
 * No se renombra nada. Se declara el vocabulario canónico acá, se deja el otro
 * donde está, y `estadoCanonico()` traduce de uno al otro de forma explícita y
 * verificable. Cuál de los dos gana es decisión del creador, no de un agente.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** El ciclo del sistema, textual de la biblia. */
export type SceneState =
  | "dormant"
  | "aware"
  | "resonant"
  | "mutated"
  | "remembered";

/**
 * Los estados propios de una escena. La biblia le da a cada una los suyos
 * —THRESHOLD es `dormant / listening / aware / open / crossed / remembered`—
 * así que el contrato acepta el vocabulario local y pide su traducción al
 * canónico. Ése es el punto: que la traducción exista y esté escrita.
 */
export type SceneLocalState = string;

/** El vocabulario de `estado.ts`, para poder traducirlo sin tocarlo. */
export type EstadoReceta =
  | "idle"
  | "aware"
  | "locked"
  | "active"
  | "transitionOut";

/**
 * La traducción del conflicto, en un solo lugar.
 *
 * `locked` y `active` caen los dos en `resonant`: la Receta separa "enganchado"
 * de "andando" y la biblia no hace esa distinción. Se pierde granularidad hacia
 * el canon, no al revés — es la dirección segura.
 */
const CANONICO: Record<EstadoReceta, SceneState> = {
  idle: "dormant",
  aware: "aware",
  locked: "resonant",
  active: "resonant",
  transitionOut: "remembered",
};

export function estadoCanonico(e: EstadoReceta): SceneState {
  return CANONICO[e];
}

/**
 * Un nodo, recortado del `04_NODE_STANDARD`.
 *
 * El estándar pide diez bloques y unos ochenta campos. Esto es el subconjunto
 * que el runtime necesita para funcionar: identificación, estatus y procedencia.
 * El resto vive en el registro, no en el código — y por eso `KodexNode` es
 * deliberadamente chico. Declarar ochenta campos que nadie llena sería
 * exactamente lo que el canon llama llamar implementado a un prototipo.
 */
export interface KodexNode {
  /** Forma canónica del estándar: `KDX-SYM-SOL-NEGRO-001`. */
  node_id: string;
  title: string;
  node_type:
    | "concept"
    | "symbol"
    | "entity"
    | "geometry"
    | "algorithm"
    | "scene"
    | "protocol"
    | "asset"
    | "product"
    | "source";
  status:
    | "PROPOSED"
    | "CANONICAL"
    | "EXPERIMENTAL"
    | "IMPLEMENTED"
    | "VALIDATED"
    | "DEPRECATED";
  priority?: "P0" | "P1" | "P2";
  /**
   * Procedencia. El estándar la exige cuando aplica, y el canon manda estudiar
   * cada tradición por separado: nada de "sabiduría ancestral" como categoría.
   * Si una escena toca material cultural y esto viene vacío, es un bloqueo.
   */
  provenance?: {
    cultural_origin?: string;
    author_or_custodian?: string;
    source?: string;
    license_or_permission?: string;
    consultation_status?: "NOT_REQUIRED" | "PENDING" | "GRANTED" | "REFUSED";
  };
}

/** Las relaciones permitidas entre nodos. Son trece y están cerradas. */
export type NodeRelation =
  | "DERIVES_FROM"
  | "MUTATION_OF"
  | "RESPONDS_TO"
  | "CONTAINS"
  | "CONTRADICTS"
  | "EXPANDS"
  | "RETURNS_TO"
  | "SHARES_ORIGIN"
  | "SHARES_GEOMETRY"
  | "SHARES_SIGNAL"
  | "ACTIVATES"
  | "TRANSFORMS"
  | "ARCHIVES";

/**
 * Lo que una escena debe exponer. La biblia lo enumera y este tipo lo obliga:
 *
 *     "Every scene must expose: node_id, epistemic layers, state, interaction
 *      events, memory events, renderer mode, reduced-motion mode, fallback
 *      mode, telemetry and provenance."
 */
export interface SceneDefinition {
  scene_id: string;
  node_id: string;
  /** Los estados propios, en el orden en que ocurren. */
  states: readonly SceneLocalState[];
  /** Cómo se lee cada estado propio en el vocabulario canónico. */
  canonical: Readonly<Record<SceneLocalState, SceneState>>;
  /** El copy que fija el canon. Cambiarlo es cambiar canon, no diseño. */
  copy: Readonly<Record<string, string>>;
  /** Qué eventos de memoria puede emitir. Cerrado a propósito. */
  emits: readonly string[];
  renderer: "webgl" | "canvas" | "svg" | "dom";
  /** Qué hace con `prefers-reduced-motion`. Nunca "nada". */
  reducedMotion: string;
  /** Qué se ve si el renderer no está disponible. Nunca "nada". */
  fallback: string;
}

/**
 * Un evento de memoria.
 *
 * El blueprint es explícito en lo que NO es: "Do not store only page visits.
 * Record meaningful transitions… Memory must modify later scenes in small but
 * perceivable ways."
 *
 * Y la regla de privacidad de la biblia acota lo que puede entrar acá:
 * "no fingerprinting, emotion inference, spiritual scoring, health inference or
 * hidden microphone activation." Por eso no hay campo libre para datos del
 * visitante: `detail` es numérico y acotado. Un evento no puede llevar texto
 * arbitrario del usuario ni nada que identifique a nadie.
 */
export interface MemoryEvent {
  /** `threshold_crossed`, `observer_dwell`, … Los declara cada escena en `emits`. */
  type: string;
  node_id: string;
  /** Milisegundos desde época. Se guarda para ordenar, no para perfilar. */
  at: number;
  /** El ciclo de visita en que ocurrió. Empieza en 1. */
  cycle: number;
  /** Números acotados de la escena: tensión, permanencia, profundidad. */
  detail?: Readonly<Record<string, number>>;
}

/**
 * El bus de señales.
 *
 * El blueprint: "Create shared normalized signals available to visual, audio and
 * UI systems… Avoid hard-coding independent interaction logic per scene."
 *
 * Normalizado quiere decir 0..1. Una señal fuera de rango es un error de quien
 * la emite, no algo que el consumidor deba acomodar.
 */
export type SignalName =
  /** Cercanía del puntero al centro activo. */
  | "proximity"
  /** Permanencia sostenida sin salir. */
  | "dwell"
  /** Energía del audio de escena, si está encendido y consentido. */
  | "audio"
  /** Avance del scroll dentro de la escena. */
  | "scroll"
  /** Cuánto recuerda el sistema: crece entre visitas. */
  | "memory";

export interface SignalBus {
  /** Lee una señal. Siempre devuelve algo en 0..1. */
  get(name: SignalName): number;
  /** Publica una señal. Se recorta a 0..1 en vez de confiar en quien llama. */
  set(name: SignalName, value: number): void;
  /** Escucha cambios. Devuelve la función para dejar de escuchar. */
  subscribe(name: SignalName, fn: (value: number) => void): () => void;
}
