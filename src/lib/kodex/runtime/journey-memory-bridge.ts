import {
  KODEX_INTERACTION_EVENT,
  isMeaningfulKodexInteraction,
  type KodexInteractionEventDetail,
} from "./interaction-events.ts";
import {
  createInitialJourneyState,
  journeyReducer,
  restoreJourney,
  serializeJourney,
  type JourneyEvent,
  type JourneyState,
  type SerializedJourneyState,
} from "./journey-state.ts";

export const KODEX_ORGANISM_ACTION_EVENT = "kodex:organism-action" as const;
export const KODEX_JOURNEY_STATE_EVENT = "kodex:journey-state" as const;
export const KODEX_JOURNEY_STORAGE_KEY = "kdx:journey:v1" as const;

export interface KodexOrganismActionEventDetail {
  id: string;
  createdAt: number;
  presetId: string;
  family: string;
  action: string;
  memoryWrites: string[];
}

export interface KodexJourneyStateEventDetail {
  source: "interaction" | "organism" | "reset";
  state: SerializedJourneyState;
}

export interface KodexJourneyStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface KodexJourneyMemoryBridge {
  getState(): JourneyState;
  reset(): void;
  destroy(): void;
}

function cloneState(state: JourneyState): JourneyState {
  return restoreJourney(serializeJourney(state));
}

export function interactionToJourneyEvents(
  detail: KodexInteractionEventDetail,
  state: JourneyState,
): JourneyEvent[] {
  if (!isMeaningfulKodexInteraction(detail)) return [];

  return [
    {
      id: `interaction:${detail.id}`,
      kind: "commit",
      letter: state.current,
      world: state.currentWorld ?? undefined,
      detail: detail.semanticTarget,
      // Journey memory preserves sequence, not wall-clock behavior timing.
      at: state.trace.length,
    },
  ];
}

export function organismActionToJourneyEvents(
  detail: KodexOrganismActionEventDetail,
  state: JourneyState,
): JourneyEvent[] {
  const writes = [...new Set(detail.memoryWrites.filter(Boolean))];

  return writes.map((write, index) => ({
    id: `organism:${detail.id}:${index}`,
    kind: "commit" as const,
    letter: state.current,
    world: state.currentWorld ?? undefined,
    detail: write,
    // Ordered semantic writes; incoming timestamps are intentionally discarded.
    at: state.trace.length + index,
  }));
}

export function restoreJourneyFromStorage(
  storage: KodexJourneyStorage | null | undefined,
): JourneyState {
  if (!storage) return createInitialJourneyState();

  try {
    const raw = storage.getItem(KODEX_JOURNEY_STORAGE_KEY);
    if (!raw) return createInitialJourneyState();
    return restoreJourney(JSON.parse(raw) as SerializedJourneyState);
  } catch {
    return createInitialJourneyState();
  }
}

function persistJourney(storage: KodexJourneyStorage | null | undefined, state: JourneyState): void {
  if (!storage) return;
  try {
    storage.setItem(KODEX_JOURNEY_STORAGE_KEY, JSON.stringify(serializeJourney(state)));
  } catch {
    // Memory remains valid for the current page even if storage is unavailable/full.
  }
}

function customDetail<T>(event: Event): T | null {
  const detail = (event as Event & { detail?: T }).detail;
  return detail ?? null;
}

export function createKodexJourneyMemoryBridge(
  target: EventTarget,
  storage?: KodexJourneyStorage | null,
): KodexJourneyMemoryBridge {
  let state = restoreJourneyFromStorage(storage);
  let destroyed = false;

  const emitState = (source: KodexJourneyStateEventDetail["source"]) => {
    const detail: KodexJourneyStateEventDetail = {
      source,
      state: serializeJourney(state),
    };

    if (typeof CustomEvent !== "undefined") {
      target.dispatchEvent(new CustomEvent<KodexJourneyStateEventDetail>(KODEX_JOURNEY_STATE_EVENT, { detail }));
    }
  };

  const applyEvents = (
    events: JourneyEvent[],
    source: Exclude<KodexJourneyStateEventDetail["source"], "reset">,
  ) => {
    if (!events.length) return;

    let next = state;
    for (const event of events) next = journeyReducer(next, event);
    if (next === state) return;

    state = next;
    persistJourney(storage, state);
    emitState(source);
  };

  const onInteraction = (event: Event) => {
    const detail = customDetail<KodexInteractionEventDetail>(event);
    if (!detail) return;
    applyEvents(interactionToJourneyEvents(detail, state), "interaction");
  };

  const onOrganismAction = (event: Event) => {
    const detail = customDetail<KodexOrganismActionEventDetail>(event);
    if (!detail) return;
    applyEvents(organismActionToJourneyEvents(detail, state), "organism");
  };

  target.addEventListener(KODEX_INTERACTION_EVENT, onInteraction);
  target.addEventListener(KODEX_ORGANISM_ACTION_EVENT, onOrganismAction);

  return {
    getState: () => cloneState(state),
    reset: () => {
      state = createInitialJourneyState();
      try {
        storage?.removeItem(KODEX_JOURNEY_STORAGE_KEY);
      } catch {
        // Reset the in-memory state even when storage is unavailable.
      }
      emitState("reset");
    },
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      target.removeEventListener(KODEX_INTERACTION_EVENT, onInteraction);
      target.removeEventListener(KODEX_ORGANISM_ACTION_EVENT, onOrganismAction);
    },
  };
}

declare global {
  interface Window {
    __kdxJourney?: KodexJourneyMemoryBridge;
  }
}

export function mountKodexJourneyMemoryBridge(): KodexJourneyMemoryBridge | null {
  if (typeof window === "undefined" || typeof document === "undefined") return null;
  if (window.__kdxJourney) return window.__kdxJourney;

  let storage: Storage | null = null;
  try {
    storage = window.sessionStorage;
  } catch {
    storage = null;
  }

  const bridge = createKodexJourneyMemoryBridge(document, storage);
  window.__kdxJourney = bridge;
  return bridge;
}
