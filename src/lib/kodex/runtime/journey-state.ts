/**
 * KODEX-∞ · KERNEL DE ESTADO DE VIAJE (JOURNEY STATE)
 *
 * Implementa el núcleo determinístico y serializable del recorrido A–M–Y del
 * packet KOD-28. Es lógica pura: no toca DOM, localStorage ni temporizadores,
 * y por eso se puede testear con `node --test` fuera del navegador.
 *
 * Las reglas que este kernel cumple son las del canon:
 *
 *   A es el origen común de todo recorrido completo.
 *   M / HEART es opcional y nunca es una puntuación.
 *   Y no se compone en este packet (queda para el resolver de bordes).
 *   B–L y N–X no reciben significado inventado.
 *   Las revisitas preservan el rastro previo e incrementan el contador.
 *
 * El kernel es un reducer puro: dado el mismo estado y la misma secuencia
 * ordenada de eventos, produce el mismo estado resultante. La identidad del
 * evento (`id`) es lo que garantiza el replay idempotente: re-aplicar un
 * evento ya presente en el rastro no escribe memoria dos veces.
 */

export type KodexLetter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L"
  | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X"
  | "Y";

/** Las letras que el canon define explícitamente. B–L y N–X permanecen LATENT. */
export const CANONICAL_LETTERS: ReadonlyArray<KodexLetter> = ["A", "M", "Y"] as const;

export type JourneyEventKind =
  | "arrive"
  | "commit"
  | "trace"
  | "ignore"
  | "heart"
  | "anchor"
  | "spectral";

export type HeartPortalState = "LATENT" | "RESONANT" | "AVAILABLE";

export interface ReturnAnchor {
  /** Nodo del que se salió hacia Heart. */
  letter: KodexLetter;
  world: string | null;
  focus: string | null;
  localState: string | null;
  /** Largo del rastro al momento de anclar, para restaurar exactamente. */
  traceLength: number;
}

export interface TracedRelation {
  from: KodexLetter;
  to: KodexLetter;
  relation: string;
}

export interface JourneyEvent {
  /** Identidad única del evento; base del replay idempotente. */
  id: string;
  kind: JourneyEventKind;
  letter: KodexLetter;
  world?: string;
  /** Detalle semántico (acción, relación, señal). No acepta telemetría cruda. */
  detail?: string;
  /** Marca de orden externa; el reducer la usa sólo para ordenar. */
  at: number;
  /** Payload semántico opcional. Nunca pointer telemetry. */
  payload?: Record<string, string | number | boolean>;
}

export interface JourneyState {
  current: KodexLetter;
  currentWorld: string | null;
  letterTrace: KodexLetter[];
  visitCounts: Partial<Record<KodexLetter, number>>;
  trace: JourneyEvent[];
  committedActions: string[];
  tracedRelations: TracedRelation[];
  /** Señales ignoradas con posible consecuencia diferida (placeholders). */
  ignoredSignals: string[];
  spectralTrace: string[];
  heart: {
    portalState: HeartPortalState;
    visitCount: number;
  };
  returnAnchor: ReturnAnchor | null;
  /** Semilla de serendipidad acotada, derivada determinísticamente del rastro. */
  serendipitySeed: number;
}

const LETTERS: KodexLetter[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
  "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y",
];

function isLetter(value: string): value is KodexLetter {
  return (LETTERS as string[]).includes(value);
}

/** Estado inicial determinístico: todo recorrido completo comienza en A. */
export function createInitialJourneyState(): JourneyState {
  return {
    current: "A",
    currentWorld: null,
    letterTrace: [],
    visitCounts: {},
    trace: [],
    committedActions: [],
    tracedRelations: [],
    ignoredSignals: [],
    spectralTrace: [],
    heart: {
      portalState: "LATENT",
      visitCount: 0,
    },
    returnAnchor: null,
    serendipitySeed: 0,
  };
}

/**
 * Semilla de serendipidad acotada (0..1), derivada de forma determinística
 * de la identidad del último evento. Nunca usa aleatoriedad: el mismo rastro
 * produce la misma semilla.
 */
function deriveSeed(state: JourneyState, eventId: string): number {
  let hash = 2166136261;
  const input = `${state.trace.length}:${eventId}`;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff;
}

/**
 * Reducer puro del viaje. Re-aplicar un evento ya presente en el rastro
 * (misma `id`) devuelve el estado sin cambios: no doble-escribe memoria.
 */
export function journeyReducer(state: JourneyState, event: JourneyEvent): JourneyState {
  if (!isLetter(event.letter)) return state;
  if (state.trace.some((e) => e.id === event.id)) return state;

  const next: JourneyState = {
    ...state,
    trace: [...state.trace, { ...event, payload: event.payload ? { ...event.payload } : undefined }],
  };

  const visitCounts = { ...state.visitCounts };
  const letterTrace = [...state.letterTrace];

  switch (event.kind) {
    case "arrive": {
      letterTrace.push(event.letter);
      visitCounts[event.letter] = (visitCounts[event.letter] ?? 0) + 1;
      next.letterTrace = letterTrace;
      next.visitCounts = visitCounts;
      next.current = event.letter;
      if (event.world !== undefined) next.currentWorld = event.world;
      break;
    }
    case "commit": {
      next.committedActions = [...state.committedActions, event.detail ?? event.id];
      break;
    }
    case "trace": {
      const payload = event.payload ?? {};
      const to = typeof payload.to === "string" ? payload.to : null;
      if (to && isLetter(to)) {
        next.tracedRelations = [
          ...state.tracedRelations,
          { from: event.letter, to, relation: event.detail ?? "UNSPECIFIED" },
        ];
      }
      break;
    }
    case "ignore": {
      next.ignoredSignals = [...state.ignoredSignals, event.detail ?? event.id];
      break;
    }
    case "heart": {
      const payload = event.payload ?? {};
      const portal = typeof payload.portalState === "string" ? payload.portalState : null;
      if (portal === "LATENT" || portal === "RESONANT" || portal === "AVAILABLE") {
        next.heart = {
          ...state.heart,
          portalState: portal,
          visitCount: state.heart.visitCount + (portal === "AVAILABLE" ? 1 : 0),
        };
      }
      break;
    }
    case "anchor": {
      const payload = event.payload ?? {};
      next.returnAnchor = {
        letter: event.letter,
        world: event.world ?? null,
        focus: typeof payload.focus === "string" ? payload.focus : null,
        localState: typeof payload.localState === "string" ? payload.localState : null,
        traceLength: state.trace.length,
      };
      break;
    }
    case "spectral": {
      next.spectralTrace = [...state.spectralTrace, event.detail ?? event.letter];
      break;
    }
  }

  next.serendipitySeed = deriveSeed(next, event.id);
  return next;
}

/**
 * Aplica una secuencia de eventos en orden. El resultado es determinístico:
 * la misma secuencia produce el mismo estado final.
 */
export function replayJourney(events: JourneyEvent[], from?: JourneyState): JourneyState {
  const base = from ?? createInitialJourneyState();
  return events.reduce((acc, e) => journeyReducer(acc, e), base);
}

/** Restaura un estado desde su forma serializada. */
export function restoreJourney(serialized: SerializedJourneyState): JourneyState {
  return {
    current: isLetter(serialized.current) ? serialized.current : "A",
    currentWorld: serialized.currentWorld ?? null,
    letterTrace: serialized.letterTrace.filter(isLetter),
    visitCounts: { ...serialized.visitCounts },
    trace: serialized.trace,
    committedActions: [...serialized.committedActions],
    tracedRelations: [...serialized.tracedRelations],
    ignoredSignals: [...serialized.ignoredSignals],
    spectralTrace: [...serialized.spectralTrace],
    heart: {
      portalState: serialized.heart?.portalState ?? "LATENT",
      visitCount: serialized.heart?.visitCount ?? 0,
    },
    returnAnchor: serialized.returnAnchor ? { ...serialized.returnAnchor } : null,
    serendipitySeed: serialized.serendipitySeed ?? 0,
  };
}

/** Forma serializable, con privacidad minimizada: sin telemetría cruda de puntero. */
export interface SerializedJourneyState {
  current: string;
  currentWorld: string | null;
  letterTrace: string[];
  visitCounts: Partial<Record<KodexLetter, number>>;
  trace: JourneyEvent[];
  committedActions: string[];
  tracedRelations: TracedRelation[];
  ignoredSignals: string[];
  spectralTrace: string[];
  heart: { portalState: HeartPortalState; visitCount: number };
  returnAnchor: ReturnAnchor | null;
  serendipitySeed: number;
}

/**
 * Serializa el estado excluyendo cualquier telemetría cruda. El kernel nunca
 * acepta pointer telemetry en `payload`; esta función lo vuelve explícito
 * filtrando claves que la representarían.
 */
export function serializeJourney(state: JourneyState): SerializedJourneyState {
  const sanitizePayload = (e: JourneyEvent): JourneyEvent => {
    const payload: Record<string, string | number | boolean> = {};
    if (e.payload) {
      for (const [k, v] of Object.entries(e.payload)) {
        if (k === "x" || k === "y" || k === "targetX" || k === "targetY" || k === "velocity") continue;
        payload[k] = v;
      }
    }
    return { ...e, payload: Object.keys(payload).length ? payload : undefined };
  };

  return {
    current: state.current,
    currentWorld: state.currentWorld,
    letterTrace: state.letterTrace,
    visitCounts: { ...state.visitCounts },
    trace: state.trace.map(sanitizePayload),
    committedActions: [...state.committedActions],
    tracedRelations: [...state.tracedRelations],
    ignoredSignals: [...state.ignoredSignals],
    spectralTrace: [...state.spectralTrace],
    heart: { ...state.heart },
    returnAnchor: state.returnAnchor ? { ...state.returnAnchor } : null,
    serendipitySeed: state.serendipitySeed,
  };
}
