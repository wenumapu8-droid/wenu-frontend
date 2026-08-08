import {
  createInitialJourneyState,
  journeyReducer,
  restoreJourney,
  serializeJourney,
  type JourneyEvent,
  type JourneyState,
  type SerializedJourneyState,
} from "./journey-state.ts";
import { canonicalGraphProjection } from "./journeyGraph/canonical-graph.ts";

export type AssemblyChoice = "OBSERVE" | "REMEMBER";
export type AssemblyStage = "THRESHOLD" | "ARCHIVE" | "HEART" | "RETURN";
export type AssemblyMotion = "FULL" | "REDUCED" | "OFF";

export interface ArchiveEvidence {
  nodeId: string;
  sourceId: string;
  title: string;
  creator: string;
  rightsStatus: string;
  culturalStatus: string;
  epistemicStatus: string;
  canonicalRecord: string;
}

export interface VisibleAssemblyState {
  version: 1;
  stage: AssemblyStage;
  choice: AssemblyChoice | null;
  archiveOpened: boolean;
  heartEntered: boolean;
  heartReturned: boolean;
  returnSignature: string | null;
  reentryCount: number;
  motion: AssemblyMotion;
  journey: JourneyState;
}

export interface SerializedVisibleAssemblyState
  extends Omit<VisibleAssemblyState, "journey"> {
  journey: SerializedJourneyState;
}

/**
 * Exact public/reference-only source inspected from Bridge 1 sources.json.
 * It is evidence/provenance for the Archive interaction, not an assigned B–X
 * coordinate and not permission to republish any underlying external asset.
 */
export const ARCHIVE_EVIDENCE: ArchiveEvidence = {
  nodeId: "NODE-KDX-CORPUS-002",
  sourceId: "SRC-KDX-CORPUS-002",
  title: "PROTO-OBSERVE-001",
  creator: "KODEX−∞ / Nicolás Ortega / Ocín",
  rightsStatus: "REFERENCE_ONLY",
  culturalStatus: "STANDARD",
  epistemicStatus: "VERIFIED",
  canonicalRecord: "kodex-minus-infinity/data/bridges/bridge-1-v0/sources.json",
};

const ENTER_EVENT = "kdx-va-enter-v1";

function event(
  id: string,
  kind: JourneyEvent["kind"],
  detail: string,
  options: Partial<JourneyEvent> = {},
): JourneyEvent {
  return {
    id,
    kind,
    letter: options.letter ?? "A",
    at: options.at ?? 0,
    detail,
    world: options.world,
    payload: options.payload,
  };
}

function apply(state: VisibleAssemblyState, nextEvent: JourneyEvent): VisibleAssemblyState {
  return {
    ...state,
    journey: journeyReducer(state.journey, nextEvent),
  };
}

export function createVisibleAssemblyState(): VisibleAssemblyState {
  const initial = createInitialJourneyState();
  const entered = journeyReducer(
    initial,
    event(ENTER_EVENT, "arrive", "ENTER_THRESHOLD", {
      letter: "A",
      world: "THRESHOLD",
    }),
  );

  return {
    version: 1,
    stage: "THRESHOLD",
    choice: null,
    archiveOpened: false,
    heartEntered: false,
    heartReturned: false,
    returnSignature: null,
    reentryCount: 0,
    motion: "FULL",
    journey: entered,
  };
}

export function commitAssemblyChoice(
  state: VisibleAssemblyState,
  choice: AssemblyChoice,
): VisibleAssemblyState {
  if (state.choice) return state;
  const action = choice === "OBSERVE" ? "OBSERVE_RELATIONS" : "REMEMBER_TRACE";
  let next = apply(
    state,
    event(`kdx-va-choice-${choice.toLowerCase()}-v1`, "commit", action, {
      letter: "A",
      world: "THRESHOLD",
    }),
  );
  next = apply(
    next,
    event(`kdx-va-choice-${choice.toLowerCase()}-spectral-v1`, "spectral", choice, {
      letter: "A",
      world: "THRESHOLD",
    }),
  );
  return { ...next, choice, stage: "ARCHIVE" };
}

export function openArchiveEvidence(state: VisibleAssemblyState): VisibleAssemblyState {
  if (!state.choice || state.archiveOpened) return state;
  let next = apply(
    state,
    event("kdx-va-archive-open-source-v1", "commit", `OPEN_SOURCE:${ARCHIVE_EVIDENCE.sourceId}`, {
      letter: "A",
      world: "ARCHIVE",
    }),
  );
  next = apply(
    next,
    event("kdx-va-archive-inspect-v1", "commit", `INSPECT_NODE:${ARCHIVE_EVIDENCE.nodeId}`, {
      letter: "A",
      world: "ARCHIVE",
    }),
  );
  next = apply(
    next,
    event("kdx-va-heart-available-v1", "heart", "HEART_AVAILABLE_AFTER_SOURCE", {
      letter: "A",
      world: "ARCHIVE",
      payload: { portalState: "AVAILABLE" },
    }),
  );
  return { ...next, archiveOpened: true };
}

export function enterHeart(state: VisibleAssemblyState): VisibleAssemblyState {
  if (!state.archiveOpened || state.heartEntered) return state;

  let next = apply(
    state,
    event("kdx-va-heart-anchor-v1", "anchor", "ANCHOR_ARCHIVE_BEFORE_HEART", {
      letter: "A",
      world: "ARCHIVE",
      payload: {
        focus: ARCHIVE_EVIDENCE.sourceId,
        localState: state.choice ?? "UNSET",
      },
    }),
  );
  next = apply(
    next,
    event("kdx-va-heart-enter-v1", "arrive", "ENTER_OPTIONAL_HEART", {
      letter: "M",
      world: "HEART",
    }),
  );
  return { ...next, stage: "HEART", heartEntered: true };
}

export function leaveHeart(state: VisibleAssemblyState): VisibleAssemblyState {
  if (state.stage !== "HEART" || !state.journey.returnAnchor) return state;
  const anchor = state.journey.returnAnchor;
  const next = apply(
    state,
    event("kdx-va-heart-return-anchor-v1", "arrive", "RESTORE_EXACT_PRIOR_ROUTE_ANCHOR", {
      letter: anchor.letter,
      world: anchor.world ?? "ARCHIVE",
    }),
  );
  return { ...next, stage: "ARCHIVE", heartReturned: true };
}

export function canEnterReturn(state: VisibleAssemblyState): boolean {
  return Boolean(
    state.choice &&
      state.archiveOpened &&
      state.journey.committedActions.some((item) => item.startsWith("OPEN_SOURCE:")),
  );
}

export function completeReturn(state: VisibleAssemblyState): VisibleAssemblyState {
  if (!canEnterReturn(state) || state.stage === "RETURN") return state;
  const signature = createReturnSignature(state.journey);
  const next = apply(
    state,
    event("kdx-va-return-enter-v1", "arrive", "RETURN_FROM_ACTUAL_EVENT_TRACE", {
      letter: "Y",
      world: "RETURN",
    }),
  );
  return { ...next, stage: "RETURN", returnSignature: signature };
}

export function reenterArchive(state: VisibleAssemblyState): VisibleAssemblyState {
  if (state.stage !== "RETURN") return state;
  const count = state.reentryCount + 1;
  const next = apply(
    state,
    event(`kdx-va-reenter-archive-${count}`, "commit", "REENTER_ARCHIVE_AFTER_RETURN", {
      letter: "Y",
      world: "RETURN",
    }),
  );
  return { ...next, stage: "ARCHIVE", reentryCount: count };
}

export function setAssemblyMotion(
  state: VisibleAssemblyState,
  motion: AssemblyMotion,
): VisibleAssemblyState {
  return { ...state, motion };
}

export function createReturnSignature(journey: JourneyState): string {
  const payload = JSON.stringify(
    serializeJourney(journey).trace.map((item) => ({
      id: item.id,
      kind: item.kind,
      letter: item.letter,
      world: item.world ?? null,
      detail: item.detail ?? null,
      payload: item.payload ?? null,
    })),
  );

  let hash = 2166136261;
  for (let index = 0; index < payload.length; index += 1) {
    hash ^= payload.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `KDX-R-${(hash >>> 0).toString(16).padStart(8, "0").toUpperCase()}`;
}

export function serializeVisibleAssembly(
  state: VisibleAssemblyState,
): SerializedVisibleAssemblyState {
  return {
    ...state,
    journey: serializeJourney(state.journey),
  };
}

export function restoreVisibleAssembly(
  value: SerializedVisibleAssemblyState,
): VisibleAssemblyState {
  const restored: VisibleAssemblyState = {
    ...value,
    version: 1,
    journey: restoreJourney(value.journey),
  };

  // Never accept a stale/forged Archive source marker from browser storage as
  // evidence by itself. The sanitized semantic trace remains authoritative.
  restored.archiveOpened = restored.journey.committedActions.includes(
    `OPEN_SOURCE:${ARCHIVE_EVIDENCE.sourceId}`,
  );
  restored.choice = restored.journey.committedActions.includes("OBSERVE_RELATIONS")
    ? "OBSERVE"
    : restored.journey.committedActions.includes("REMEMBER_TRACE")
      ? "REMEMBER"
      : null;

  return restored;
}

export function verifyArchiveProjectionBoundary(): boolean {
  const node = canonicalGraphProjection.nodeById.get(ARCHIVE_EVIDENCE.nodeId);
  return Boolean(
    node &&
      node.sourceIds.includes(ARCHIVE_EVIDENCE.sourceId) &&
      node.roles.includes("ARCHIVE") &&
      node.rightsStatus === ARCHIVE_EVIDENCE.rightsStatus &&
      node.culturalStatus === ARCHIVE_EVIDENCE.culturalStatus,
  );
}
