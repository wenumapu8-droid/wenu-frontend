/**
 * KODEX−∞ · JOURNEY STATE + EVENT TRACE CORE
 *
 * Canonical source: docs/decisions/ADR-0010-ALPHABETIC-MULTIVERSE-A-M-Y.md
 * Work packet: KDX-WP-RUNTIME-01 (KOD-28)
 *
 * This module is the smallest deterministic, serializable state kernel for the
 * A–M–Y journey. It is pure: no DOM, no storage, no clock, no randomness. Every
 * value in the state is a function of the ordered event trace that produced it.
 *
 * What this module deliberately does NOT do:
 *
 *   - It does not compose Y. Y synthesis is out of scope for this packet;
 *     `completionEligible` is a structural gate, not a Y artifact.
 *   - It does not assign meaning to B–L or N–X. Letters are coordinates and
 *     stable IDs. Concept assignment requires creator approval (ADR-0010,
 *     "Concept assignment law"); until then the letters carry no semantics here.
 *   - It does not infer spiritual, biometric or psychological state, and it
 *     never ranks or scores the visitor. M is optional and never a score.
 *   - It does not read pointer telemetry into memory. Passive pointer movement
 *     alone cannot write consequential personal memory (ADR-0010,
 *     "Edge-resolution law"), so raw pointer coordinates and velocity are
 *     structurally unable to enter the state: no field can hold them.
 */

/* ------------------------------------------------------------------ *
 * Coordinates
 * ------------------------------------------------------------------ */

/** The 25 KODEX coordinates. Not a claim about any natural alphabet. */
export const KODEX_LETTERS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y',
] as const;

export type KodexLetter = (typeof KODEX_LETTERS)[number];

/** A is the only canonical beginning (ADR-0010, "A — Common origin"). */
export const KODEX_ORIGIN_LETTER = 'A' as const;

/** M is HEART / 0: always potentially discoverable, never compulsory. */
export const KODEX_HEART_LETTER = 'M' as const;

/** Y is RETURN / +∞, the canonical terminal. Not composed in this packet. */
export const KODEX_TERMINAL_LETTER = 'Y' as const;

/** Progressive disclosure of the Heart portal. Never a score, never a rank. */
export type KodexHeartPortalState = 'LATENT' | 'RESONANT' | 'AVAILABLE';

const LETTER_SET: ReadonlySet<string> = new Set(KODEX_LETTERS);

/**
 * Letters from which a relation to M must be discoverable. Per
 * data/alphabet-topology.json this is every nonterminal letter except M itself.
 */
const HEART_PORTAL_HOST_LETTERS: ReadonlySet<string> = new Set(
  KODEX_LETTERS.filter((l) => l !== KODEX_HEART_LETTER && l !== KODEX_TERMINAL_LETTER),
);

/**
 * B–X excluding M. Used only to decide whether a route has any intermediate
 * substance to synthesize. Carries no meaning about the individual letters.
 */
const INTERMEDIATE_LETTERS: ReadonlySet<string> = new Set(
  KODEX_LETTERS.filter(
    (l) => l !== KODEX_ORIGIN_LETTER && l !== KODEX_TERMINAL_LETTER && l !== KODEX_HEART_LETTER,
  ),
);

export function isKodexLetter(value: unknown): value is KodexLetter {
  return typeof value === 'string' && LETTER_SET.has(value);
}

function assertLetter(value: unknown, field: string): KodexLetter {
  if (!isKodexLetter(value)) {
    throw new TypeError(`[kodex/journey-state] ${field} must be a KODEX letter A–Y, received ${String(value)}`);
  }
  return value;
}

/* ------------------------------------------------------------------ *
 * Accessibility and consent
 * ------------------------------------------------------------------ */

export type KodexMotionSetting = 'FULL' | 'REDUCED' | 'OFF';
export type KodexSoundSetting = 'ON' | 'OFF';

export interface KodexAccessibilityState {
  motion: KodexMotionSetting;
  sound: KodexSoundSetting;
}

/**
 * Consent is an open map of named grants. Nothing is granted by default; A is
 * where orientation and consent happen, and it must be explicit.
 */
export type KodexConsentState = Readonly<Record<string, boolean>>;

/* ------------------------------------------------------------------ *
 * Return anchor
 * ------------------------------------------------------------------ */

/**
 * The exact prior position, captured on entering M so that leaving M restores
 * "the exact prior node, focus, state and route anchor" (ADR-0010, "M").
 *
 * `focusId` is a semantic element identity (e.g. a data-kdx-interaction-id),
 * never a pointer coordinate.
 */
export interface KodexRouteAnchor {
  letter: KodexLetter;
  /** 1-based index of the visit to `letter` that was interrupted. */
  visitIndex: number;
  focusId: string | null;
  worldId: string | null;
  /** Route signature at the moment of capture. Historical, not restored. */
  routeSignature: string;
  /** Length of the event trace at the moment of capture. */
  traceLength: number;
}

/* ------------------------------------------------------------------ *
 * Journey state
 * ------------------------------------------------------------------ */

export const KODEX_JOURNEY_STATE_VERSION = 1;

export interface KodexAlphabetJourneyState {
  readonly version: number;
  readonly sessionId: string;

  /** Current coordinate and the world metadata reference bound to it. */
  readonly currentLetter: KodexLetter;
  readonly previousLetter: KodexLetter | null;
  readonly currentWorldId: string | null;
  readonly currentFocusId: string | null;

  /** The walk actually taken, with repeats, in order. */
  readonly path: readonly KodexLetter[];
  /** Distinct letters, in order of first visit. */
  readonly visitedLetters: readonly KodexLetter[];
  readonly visitCounts: Readonly<Partial<Record<KodexLetter, number>>>;

  /** Ordered event trace: the identities of every event folded into this state. */
  readonly appliedEventIds: readonly string[];

  readonly committedActionIds: readonly string[];
  /** Signals the visitor passed over. Delayed-consequence placeholders. */
  readonly ignoredSignalIds: readonly string[];
  readonly tracedRelationIds: readonly string[];
  readonly tracedEntityIds: readonly string[];
  readonly contradictionIds: readonly string[];
  readonly unresolvedIds: readonly string[];
  readonly sourceIds: readonly string[];

  /** Edges currently resolved as available. Recomputed, not accumulated. */
  readonly openEdgeIds: readonly string[];

  readonly routeSignature: string;
  readonly spectralState: readonly string[];

  readonly mPortalStateByLetter: Readonly<Partial<Record<KodexLetter, KodexHeartPortalState>>>;
  readonly mVisitCount: number;
  readonly returnAnchor: KodexRouteAnchor | null;

  /** Bounded serendipity seed, derived from the trace. Never Math.random(). */
  readonly serendipitySeed: number;

  readonly completionEligible: boolean;

  readonly accessibility: Readonly<KodexAccessibilityState>;
  readonly consent: KodexConsentState;
}

/* ------------------------------------------------------------------ *
 * Events
 * ------------------------------------------------------------------ */

/**
 * Every event carries a stable `id`. That id is the sole identity used for
 * replay de-duplication: an event whose id has already been folded into the
 * state can never be folded in again.
 *
 * There is deliberately no timestamp field on the state side. Wall-clock time
 * is not part of journey state, so replaying the same ordered event sequence
 * always yields the same state.
 */
export interface KodexJourneyEventBase {
  readonly id: string;
}

export type KodexJourneyEvent =
  | (KodexJourneyEventBase & {
      type: 'ENTER_LETTER';
      letter: KodexLetter;
      worldId?: string | null;
      focusId?: string | null;
    })
  | (KodexJourneyEventBase & { type: 'LEAVE_HEART' })
  | (KodexJourneyEventBase & { type: 'COMMIT_ACTION'; actionId: string; sourceIds?: readonly string[] })
  | (KodexJourneyEventBase & { type: 'IGNORE_SIGNAL'; signalId: string })
  | (KodexJourneyEventBase & { type: 'TRACE_RELATION'; relationId: string; entityIds?: readonly string[] })
  | (KodexJourneyEventBase & { type: 'OBSERVE_CONTRADICTION'; contradictionId: string })
  | (KodexJourneyEventBase & { type: 'RAISE_QUESTION'; questionId: string })
  | (KodexJourneyEventBase & { type: 'OBSERVE_SPECTRAL'; bandId: string })
  | (KodexJourneyEventBase & { type: 'RESOLVE_EDGES'; edgeIds: readonly string[] })
  | (KodexJourneyEventBase & {
      type: 'SET_HEART_PORTAL';
      letter: KodexLetter;
      portalState: KodexHeartPortalState;
    })
  | (KodexJourneyEventBase & { type: 'SET_ACCESSIBILITY'; accessibility: Partial<KodexAccessibilityState> })
  | (KodexJourneyEventBase & { type: 'SET_CONSENT'; grant: string; granted: boolean });

export type KodexJourneyEventType = KodexJourneyEvent['type'];

/* ------------------------------------------------------------------ *
 * Pure helpers
 * ------------------------------------------------------------------ */

/** FNV-1a, 32-bit. Deterministic across platforms and runs. */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function appendUnique(list: readonly string[], value: string): readonly string[] {
  if (!value || list.includes(value)) return list;
  return [...list, value];
}

function appendAllUnique(list: readonly string[], values: readonly string[] | undefined): readonly string[] {
  if (!values || values.length === 0) return list;
  let next = list;
  for (const value of values) next = appendUnique(next, value);
  return next;
}

function sortedRecord<V>(record: Readonly<Partial<Record<KodexLetter, V>>>): Partial<Record<KodexLetter, V>> {
  const out: Partial<Record<KodexLetter, V>> = {};
  for (const letter of KODEX_LETTERS) {
    const value = record[letter];
    if (value !== undefined) out[letter] = value;
  }
  return out;
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`[kodex/journey-state] ${field} must be a non-empty string`);
  }
  return value;
}

/**
 * Deterministic route signature over the trace that produced the state.
 * Contains no timestamp, no session id and no telemetry.
 */
function computeRouteSignature(parts: {
  path: readonly KodexLetter[];
  committedActionIds: readonly string[];
  ignoredSignalIds: readonly string[];
  tracedRelationIds: readonly string[];
  spectralState: readonly string[];
  mVisitCount: number;
}): string {
  const walk = parts.path.join('');
  const material = [
    walk,
    parts.committedActionIds.join(','),
    parts.ignoredSignalIds.join(','),
    parts.tracedRelationIds.join(','),
    parts.spectralState.join(','),
    String(parts.mVisitCount),
  ].join('|');

  const digest = fnv1a(material).toString(16).toUpperCase().padStart(8, '0');
  return `KDX-${parts.path.length}-${digest}`;
}

/**
 * A journey has something to synthesize when it began at A, committed at least
 * one action, and touched at least one intermediate coordinate.
 *
 * M is excluded from this test on purpose: visiting the Heart can never make a
 * journey eligible, and never visiting it can never make a journey ineligible.
 * This is a structural gate only. It is not Y, and it is not a score.
 */
function computeCompletionEligibility(parts: {
  path: readonly KodexLetter[];
  visitedLetters: readonly KodexLetter[];
  committedActionIds: readonly string[];
}): boolean {
  if (parts.path[0] !== KODEX_ORIGIN_LETTER) return false;
  if (parts.committedActionIds.length === 0) return false;
  return parts.visitedLetters.some((letter) => INTERMEDIATE_LETTERS.has(letter));
}

function freezeState(state: KodexAlphabetJourneyState): KodexAlphabetJourneyState {
  Object.freeze(state.path);
  Object.freeze(state.visitedLetters);
  Object.freeze(state.visitCounts);
  Object.freeze(state.appliedEventIds);
  Object.freeze(state.committedActionIds);
  Object.freeze(state.ignoredSignalIds);
  Object.freeze(state.tracedRelationIds);
  Object.freeze(state.tracedEntityIds);
  Object.freeze(state.contradictionIds);
  Object.freeze(state.unresolvedIds);
  Object.freeze(state.sourceIds);
  Object.freeze(state.openEdgeIds);
  Object.freeze(state.spectralState);
  Object.freeze(state.mPortalStateByLetter);
  Object.freeze(state.accessibility);
  Object.freeze(state.consent);
  if (state.returnAnchor) Object.freeze(state.returnAnchor);
  return Object.freeze(state);
}

/**
 * Recomputes every derived field, then freezes. Derived fields are never
 * assigned by individual event handlers, so they cannot drift out of sync.
 */
function finalize(draft: KodexAlphabetJourneyState): KodexAlphabetJourneyState {
  const routeSignature = computeRouteSignature(draft);
  const next: KodexAlphabetJourneyState = {
    ...draft,
    visitCounts: sortedRecord(draft.visitCounts),
    mPortalStateByLetter: sortedRecord(draft.mPortalStateByLetter),
    routeSignature,
    serendipitySeed: fnv1a(`${routeSignature}|serendipity`),
    completionEligible: computeCompletionEligibility(draft),
  };
  return freezeState(next);
}

/* ------------------------------------------------------------------ *
 * Initial state
 * ------------------------------------------------------------------ */

export interface KodexInitialJourneyOptions {
  /** Stable identity for the session. Defaults to a fixed, non-identifying id. */
  sessionId?: string;
  accessibility?: Partial<KodexAccessibilityState>;
  consent?: Readonly<Record<string, boolean>>;
}

/**
 * The deterministic initial state. The journey begins at A, already counted as
 * visited: A is the common origin and the site of the first memory write.
 *
 * Accessibility defaults are conservative (reduced motion, sound off) because A
 * is where the visitor configures them, not where we assume them.
 */
export function createInitialJourneyState(
  options: KodexInitialJourneyOptions = {},
): KodexAlphabetJourneyState {
  const draft: KodexAlphabetJourneyState = {
    version: KODEX_JOURNEY_STATE_VERSION,
    sessionId: options.sessionId ?? 'kdx-session',
    currentLetter: KODEX_ORIGIN_LETTER,
    previousLetter: null,
    currentWorldId: null,
    currentFocusId: null,
    path: [KODEX_ORIGIN_LETTER],
    visitedLetters: [KODEX_ORIGIN_LETTER],
    visitCounts: { [KODEX_ORIGIN_LETTER]: 1 },
    appliedEventIds: [],
    committedActionIds: [],
    ignoredSignalIds: [],
    tracedRelationIds: [],
    tracedEntityIds: [],
    contradictionIds: [],
    unresolvedIds: [],
    sourceIds: [],
    openEdgeIds: [],
    routeSignature: '',
    spectralState: [],
    mPortalStateByLetter: {},
    mVisitCount: 0,
    returnAnchor: null,
    serendipitySeed: 0,
    completionEligible: false,
    accessibility: {
      motion: options.accessibility?.motion ?? 'REDUCED',
      sound: options.accessibility?.sound ?? 'OFF',
    },
    consent: { ...(options.consent ?? {}) },
  };

  return finalize(draft);
}

/* ------------------------------------------------------------------ *
 * Reducer
 * ------------------------------------------------------------------ */

function enterLetter(
  state: KodexAlphabetJourneyState,
  letter: KodexLetter,
  worldId: string | null,
  focusId: string | null,
): KodexAlphabetJourneyState {
  const enteringHeart = letter === KODEX_HEART_LETTER;
  const alreadyInHeart = state.currentLetter === KODEX_HEART_LETTER;

  // Entering M captures the exact prior position so that leaving restores it.
  // Re-entering M from inside M must not overwrite the original anchor.
  const returnAnchor: KodexRouteAnchor | null =
    enteringHeart && !alreadyInHeart
      ? {
          letter: state.currentLetter,
          visitIndex: state.visitCounts[state.currentLetter] ?? 1,
          focusId: state.currentFocusId,
          worldId: state.currentWorldId,
          routeSignature: state.routeSignature,
          traceLength: state.appliedEventIds.length,
        }
      : state.returnAnchor;

  return {
    ...state,
    currentLetter: letter,
    previousLetter: state.currentLetter,
    currentWorldId: worldId,
    currentFocusId: focusId,
    path: [...state.path, letter],
    visitedLetters: state.visitedLetters.includes(letter)
      ? state.visitedLetters
      : [...state.visitedLetters, letter],
    visitCounts: { ...state.visitCounts, [letter]: (state.visitCounts[letter] ?? 0) + 1 },
    mVisitCount: enteringHeart ? state.mVisitCount + 1 : state.mVisitCount,
    returnAnchor,
    // Edges are state-dependent and must be re-resolved after every move.
    openEdgeIds: [],
  };
}

/**
 * Leaving M restores the exact prior node, focus and world. This is a
 * restoration, not a new visit: it does not append to the walk and does not
 * increment any visit count, so the anchor round-trips exactly.
 */
function leaveHeart(state: KodexAlphabetJourneyState): KodexAlphabetJourneyState {
  const anchor = state.returnAnchor;
  if (!anchor || state.currentLetter !== KODEX_HEART_LETTER) return state;

  return {
    ...state,
    currentLetter: anchor.letter,
    previousLetter: KODEX_HEART_LETTER,
    currentWorldId: anchor.worldId,
    currentFocusId: anchor.focusId,
    returnAnchor: null,
    openEdgeIds: [],
  };
}

function reduce(
  state: KodexAlphabetJourneyState,
  event: KodexJourneyEvent,
): KodexAlphabetJourneyState {
  switch (event.type) {
    case 'ENTER_LETTER':
      return enterLetter(
        state,
        assertLetter(event.letter, 'ENTER_LETTER.letter'),
        event.worldId ?? null,
        event.focusId ?? null,
      );

    case 'LEAVE_HEART':
      return leaveHeart(state);

    case 'COMMIT_ACTION':
      return {
        ...state,
        committedActionIds: [
          ...state.committedActionIds,
          requireText(event.actionId, 'COMMIT_ACTION.actionId'),
        ],
        sourceIds: appendAllUnique(state.sourceIds, event.sourceIds),
      };

    case 'IGNORE_SIGNAL':
      return {
        ...state,
        ignoredSignalIds: appendUnique(
          state.ignoredSignalIds,
          requireText(event.signalId, 'IGNORE_SIGNAL.signalId'),
        ),
      };

    case 'TRACE_RELATION':
      return {
        ...state,
        tracedRelationIds: appendUnique(
          state.tracedRelationIds,
          requireText(event.relationId, 'TRACE_RELATION.relationId'),
        ),
        tracedEntityIds: appendAllUnique(state.tracedEntityIds, event.entityIds),
      };

    case 'OBSERVE_CONTRADICTION':
      return {
        ...state,
        contradictionIds: appendUnique(
          state.contradictionIds,
          requireText(event.contradictionId, 'OBSERVE_CONTRADICTION.contradictionId'),
        ),
      };

    case 'RAISE_QUESTION':
      return {
        ...state,
        unresolvedIds: appendUnique(
          state.unresolvedIds,
          requireText(event.questionId, 'RAISE_QUESTION.questionId'),
        ),
      };

    case 'OBSERVE_SPECTRAL':
      return {
        ...state,
        spectralState: appendUnique(
          state.spectralState,
          requireText(event.bandId, 'OBSERVE_SPECTRAL.bandId'),
        ),
      };

    case 'RESOLVE_EDGES': {
      // availableEdges(t) is recomputed, never accumulated.
      let edges: readonly string[] = [];
      edges = appendAllUnique(edges, event.edgeIds);
      return { ...state, openEdgeIds: edges };
    }

    case 'SET_HEART_PORTAL': {
      const letter = assertLetter(event.letter, 'SET_HEART_PORTAL.letter');
      if (!HEART_PORTAL_HOST_LETTERS.has(letter)) {
        throw new RangeError(
          `[kodex/journey-state] the Heart portal cannot be hosted by ${letter}; ` +
            'M is reachable from nonterminal letters other than itself',
        );
      }
      return {
        ...state,
        mPortalStateByLetter: { ...state.mPortalStateByLetter, [letter]: event.portalState },
      };
    }

    case 'SET_ACCESSIBILITY':
      return {
        ...state,
        accessibility: {
          motion: event.accessibility.motion ?? state.accessibility.motion,
          sound: event.accessibility.sound ?? state.accessibility.sound,
        },
      };

    case 'SET_CONSENT':
      return {
        ...state,
        consent: { ...state.consent, [requireText(event.grant, 'SET_CONSENT.grant')]: event.granted },
      };

    default: {
      const exhaustive: never = event;
      throw new TypeError(
        `[kodex/journey-state] unknown event type ${String((exhaustive as { type?: unknown }).type)}`,
      );
    }
  }
}

/**
 * Folds one event into the state.
 *
 * Replay is idempotent by event identity: if `event.id` is already present in
 * `appliedEventIds`, the state is returned unchanged — the same object
 * reference, so no memory write of any kind can occur.
 */
export function applyJourneyEvent(
  state: KodexAlphabetJourneyState,
  event: KodexJourneyEvent,
): KodexAlphabetJourneyState {
  const id = requireText(event?.id, 'event.id');
  if (state.appliedEventIds.includes(id)) return state;

  const reduced = reduce(state, event);
  return finalize({ ...reduced, appliedEventIds: [...state.appliedEventIds, id] });
}

/** Folds an ordered sequence of events. */
export function applyJourneyEvents(
  state: KodexAlphabetJourneyState,
  events: readonly KodexJourneyEvent[],
): KodexAlphabetJourneyState {
  return events.reduce(applyJourneyEvent, state);
}

/** True when this exact event identity has already been folded in. */
export function hasAppliedEvent(state: KodexAlphabetJourneyState, eventId: string): boolean {
  return state.appliedEventIds.includes(eventId);
}

/**
 * Bounded serendipity: a deterministic index in [0, bucketCount) derived from
 * the route. The system may surprise the visitor, but only within a bounded set
 * of already-valid options — it never produces arbitrary navigation.
 */
export function boundedSerendipityIndex(
  state: KodexAlphabetJourneyState,
  bucketCount: number,
  salt = '',
): number {
  if (!Number.isInteger(bucketCount) || bucketCount <= 0) {
    throw new RangeError('[kodex/journey-state] bucketCount must be a positive integer');
  }
  return fnv1a(`${state.serendipitySeed}|${salt}`) % bucketCount;
}

/* ------------------------------------------------------------------ *
 * Serialization
 * ------------------------------------------------------------------ */

export interface KodexJourneySnapshot {
  version: number;
  sessionId: string;
  currentLetter: KodexLetter;
  previousLetter: KodexLetter | null;
  currentWorldId: string | null;
  currentFocusId: string | null;
  path: KodexLetter[];
  visitedLetters: KodexLetter[];
  visitCounts: Partial<Record<KodexLetter, number>>;
  appliedEventIds: string[];
  committedActionIds: string[];
  ignoredSignalIds: string[];
  tracedRelationIds: string[];
  tracedEntityIds: string[];
  contradictionIds: string[];
  unresolvedIds: string[];
  sourceIds: string[];
  openEdgeIds: string[];
  routeSignature: string;
  spectralState: string[];
  mPortalStateByLetter: Partial<Record<KodexLetter, KodexHeartPortalState>>;
  mVisitCount: number;
  returnAnchor: KodexRouteAnchor | null;
  serendipitySeed: number;
  completionEligible: boolean;
  accessibility: KodexAccessibilityState;
  consent: Record<string, boolean>;
}

/**
 * Produces a plain, JSON-safe snapshot. Nothing is dropped here because nothing
 * private is ever admitted into the state in the first place: there is no field
 * for pointer position, velocity, pointer type, timing or device data.
 */
export function serializeJourneyState(state: KodexAlphabetJourneyState): KodexJourneySnapshot {
  return {
    version: state.version,
    sessionId: state.sessionId,
    currentLetter: state.currentLetter,
    previousLetter: state.previousLetter,
    currentWorldId: state.currentWorldId,
    currentFocusId: state.currentFocusId,
    path: [...state.path],
    visitedLetters: [...state.visitedLetters],
    visitCounts: sortedRecord(state.visitCounts),
    appliedEventIds: [...state.appliedEventIds],
    committedActionIds: [...state.committedActionIds],
    ignoredSignalIds: [...state.ignoredSignalIds],
    tracedRelationIds: [...state.tracedRelationIds],
    tracedEntityIds: [...state.tracedEntityIds],
    contradictionIds: [...state.contradictionIds],
    unresolvedIds: [...state.unresolvedIds],
    sourceIds: [...state.sourceIds],
    openEdgeIds: [...state.openEdgeIds],
    routeSignature: state.routeSignature,
    spectralState: [...state.spectralState],
    mPortalStateByLetter: sortedRecord(state.mPortalStateByLetter),
    mVisitCount: state.mVisitCount,
    returnAnchor: state.returnAnchor ? { ...state.returnAnchor } : null,
    serendipitySeed: state.serendipitySeed,
    completionEligible: state.completionEligible,
    accessibility: { ...state.accessibility },
    consent: { ...state.consent },
  };
}

/**
 * Restores a snapshot. Derived fields are recomputed from the restored trace
 * rather than trusted, so a tampered signature or seed cannot survive.
 */
export function restoreJourneyState(snapshot: KodexJourneySnapshot): KodexAlphabetJourneyState {
  if (!snapshot || typeof snapshot !== 'object') {
    throw new TypeError('[kodex/journey-state] snapshot must be an object');
  }
  if (snapshot.version !== KODEX_JOURNEY_STATE_VERSION) {
    throw new RangeError(
      `[kodex/journey-state] unsupported snapshot version ${String(snapshot.version)}`,
    );
  }

  const path = [...snapshot.path].map((l, i) => assertLetter(l, `snapshot.path[${i}]`));
  if (path.length > 0 && path[0] !== KODEX_ORIGIN_LETTER) {
    throw new RangeError('[kodex/journey-state] every journey begins at A');
  }

  const draft: KodexAlphabetJourneyState = {
    version: KODEX_JOURNEY_STATE_VERSION,
    sessionId: snapshot.sessionId,
    currentLetter: assertLetter(snapshot.currentLetter, 'snapshot.currentLetter'),
    previousLetter: snapshot.previousLetter,
    currentWorldId: snapshot.currentWorldId ?? null,
    currentFocusId: snapshot.currentFocusId ?? null,
    path,
    visitedLetters: [...snapshot.visitedLetters],
    visitCounts: { ...snapshot.visitCounts },
    appliedEventIds: [...snapshot.appliedEventIds],
    committedActionIds: [...snapshot.committedActionIds],
    ignoredSignalIds: [...snapshot.ignoredSignalIds],
    tracedRelationIds: [...snapshot.tracedRelationIds],
    tracedEntityIds: [...snapshot.tracedEntityIds],
    contradictionIds: [...snapshot.contradictionIds],
    unresolvedIds: [...snapshot.unresolvedIds],
    sourceIds: [...snapshot.sourceIds],
    openEdgeIds: [...snapshot.openEdgeIds],
    routeSignature: '',
    spectralState: [...snapshot.spectralState],
    mPortalStateByLetter: { ...snapshot.mPortalStateByLetter },
    mVisitCount: snapshot.mVisitCount,
    returnAnchor: snapshot.returnAnchor ? { ...snapshot.returnAnchor } : null,
    serendipitySeed: 0,
    completionEligible: false,
    accessibility: { ...snapshot.accessibility },
    consent: { ...snapshot.consent },
  };

  return finalize(draft);
}

/* ------------------------------------------------------------------ *
 * Session memory projection
 * ------------------------------------------------------------------ */

/**
 * The shared session-memory contract, matching
 * kodex-minus-infinity:schemas/session-memory.schema.json. That schema declares
 * `additionalProperties: false`, so this projection emits only keys it allows.
 */
export interface KodexSessionMemory {
  version: number;
  sessionId: string;
  path: string[];
  decisions: string[];
  sourcesOpened: string[];
  entitiesTraced: string[];
  relationsTraced: string[];
  contradictionsSeen: string[];
  unresolved: string[];
  artifactSeed: string | null;
  accessibility: KodexAccessibilityState;
  consent: Record<string, boolean>;
}

/**
 * Projects journey state onto the shared session-memory shape.
 *
 * Ignored signals are surfaced as `unresolved` delayed-consequence
 * placeholders. Heart portal states, M visit count, the return anchor and the
 * raw event trace are deliberately NOT projected: they are runtime routing
 * concerns, and mVisitCount in particular must never read as a score.
 */
export function toSessionMemory(state: KodexAlphabetJourneyState): KodexSessionMemory {
  return {
    version: state.version,
    sessionId: state.sessionId,
    path: [...state.path],
    decisions: [...state.committedActionIds],
    sourcesOpened: [...state.sourceIds],
    entitiesTraced: [...state.tracedEntityIds],
    relationsTraced: [...state.tracedRelationIds],
    contradictionsSeen: [...state.contradictionIds],
    unresolved: [...state.unresolvedIds, ...state.ignoredSignalIds],
    artifactSeed: state.routeSignature,
    accessibility: { ...state.accessibility },
    consent: { ...state.consent },
  };
}
