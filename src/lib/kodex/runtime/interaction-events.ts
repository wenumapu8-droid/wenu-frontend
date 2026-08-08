/**
 * KODEX−∞ · INTERACTION EVENT IDENTITY
 *
 * Work packet: MP-1 (content-addressed event identity), unblocks KOD-41.
 *
 * An interaction event's identity is a pure function of WHAT happened
 * (node, interaction, role, semantic target, state transition, cited sources
 * and claims) plus WHICH OCCURRENCE of it this is (a causal ordinal). Wall
 * clock time is not an input, and neither is randomness.
 *
 * Why not `Date.now()`:
 *
 *   - Replaying the same logical event (Browser Back/Forward, snapshot
 *     restore, trace re-fold) minted a NEW id every time, so the JourneyState
 *     reducer could not recognise it as already applied and wrote memory a
 *     second time. Identity must be reproducible from the event itself.
 *   - Two genuinely distinct interactions on the same node + interaction id
 *     inside the same millisecond collapsed into ONE identity, and the reducer
 *     silently dropped the second. Identity must separate distinct occurrences.
 *
 * The causal ordinal does both: it is recorded on the event, so a replay
 * reproduces the id exactly, and it advances for every genuinely new
 * occurrence, so two same-millisecond interactions never share an identity.
 *
 * `createdAt` survives as observational metadata only. It is deliberately NOT
 * part of the digest: an event replayed an hour later is the same event.
 */

export type KodexInteractionRole =
  | 'REVEAL'
  | 'TRANSFORM'
  | 'TRACE'
  | 'COMPARE'
  | 'NAVIGATE'
  | 'ORIENT'
  | 'ANNOTATE'
  | 'CONTRIBUTE'
  | 'CONTEMPLATE';

export interface KodexInteractionEventDetail {
  /** Opaque, content-addressed identity. Never parse it; only compare it. */
  id: string;
  interactionId: string;
  nodeId: string;
  role: KodexInteractionRole;
  semanticTarget: string;
  stateBefore: string;
  stateAfter: string;
  writesToMemory: boolean;
  sourceIds: string[];
  claimIds: string[];
  /**
   * 0-based causal position: the n-th occurrence of this interaction on this
   * node within the session. Causal, never temporal. Carried on the event so
   * that a replay can reproduce the identity exactly.
   */
  ordinal: number;
  /** Observational only. Not an input to `id`. */
  createdAt: number;
}

/**
 * What a producer supplies. `id`, `ordinal` and `createdAt` are derived, so
 * existing call sites that pass only the semantic fields keep compiling.
 */
export type KodexInteractionEventInput = Omit<
  KodexInteractionEventDetail,
  'id' | 'ordinal' | 'createdAt'
>;

export const KODEX_INTERACTION_EVENT = 'kodex:interaction' as const;

/** Identity scheme version. Bumping it invalidates every previously minted id. */
const IDENTITY_SCHEME = 'kdxe1';

/* ------------------------------------------------------------------ *
 * Causal sequence
 * ------------------------------------------------------------------ */

/**
 * A monotonic occurrence counter, keyed per (nodeId, interactionId).
 *
 * Per-key rather than session-global on purpose: the ordinal then means "the
 * n-th time this interaction fired on this node", which is stable even when
 * unrelated events interleave, so a partial subtrace replays to the same ids
 * as the full trace.
 */
export interface KodexInteractionSequence {
  /** Consumes and returns the next ordinal for this key. */
  next(nodeId: string, interactionId: string): number;
  /** Returns the ordinal `next` would hand out, without consuming it. */
  peek(nodeId: string, interactionId: string): number;
  /**
   * Restores a counter after a reload, so that resuming a persisted session
   * continues the causal sequence instead of restarting it and re-minting ids
   * the journey state has already applied. Never lowers a counter.
   */
  prime(nodeId: string, interactionId: string, nextOrdinal: number): void;
  /** Drops all counters. Call at a genuine session boundary, never on replay. */
  reset(): void;
}

function sequenceKey(nodeId: string, interactionId: string): string {
  return `${nodeId.length}:${nodeId}${interactionId}`;
}

export function createKodexInteractionSequence(): KodexInteractionSequence {
  const counters = new Map<string, number>();

  return {
    next(nodeId, interactionId) {
      const key = sequenceKey(nodeId, interactionId);
      const ordinal = counters.get(key) ?? 0;
      counters.set(key, ordinal + 1);
      return ordinal;
    },
    peek(nodeId, interactionId) {
      return counters.get(sequenceKey(nodeId, interactionId)) ?? 0;
    },
    prime(nodeId, interactionId, nextOrdinal) {
      const key = sequenceKey(nodeId, interactionId);
      counters.set(key, Math.max(counters.get(key) ?? 0, requireOrdinal(nextOrdinal)));
    },
    reset() {
      counters.clear();
    },
  };
}

/**
 * The ambient sequence used when a caller supplies neither an ordinal nor a
 * sequence. It supplies causal position only; the identity itself stays a pure
 * function of its recorded inputs.
 */
export const defaultKodexInteractionSequence: KodexInteractionSequence =
  createKodexInteractionSequence();

/* ------------------------------------------------------------------ *
 * Digest
 * ------------------------------------------------------------------ */

/** FNV-1a, 32-bit, parameterised by offset basis. Deterministic everywhere. */
function fnv1a(input: string, basis: number): number {
  let hash = basis >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function hex32(value: number): string {
  return value.toString(16).padStart(8, '0');
}

/** 64-bit digest: two FNV-1a passes over distinct bases and framings. */
function digest64(material: string): string {
  const lo = fnv1a(material, 0x811c9dc5);
  const hi = fnv1a(`${material.length}${material}`, 0x01000193);
  return `${hex32(hi)}${hex32(lo)}`;
}

function normalizeIdList(values: readonly string[] | undefined): string[] {
  if (!values) return [];
  return [...new Set(values)];
}

/**
 * Canonical, unambiguous serialization of the semantic payload.
 *
 * JSON encoding makes field boundaries injection-proof: no combination of user
 * strings can forge a different event's material. `sourceIds` and `claimIds`
 * are deduped and sorted because they are sets — a replay that presents them in
 * a different order is still the same event.
 */
function identityMaterial(
  input: KodexInteractionEventInput,
  ordinal: number,
): string {
  return JSON.stringify([
    IDENTITY_SCHEME,
    input.nodeId,
    input.interactionId,
    ordinal,
    input.role,
    input.semanticTarget,
    input.stateBefore,
    input.stateAfter,
    input.writesToMemory === true,
    normalizeIdList(input.sourceIds).sort(),
    normalizeIdList(input.claimIds).sort(),
  ]);
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(
      `[kodex/interaction-events] ${field} must be a non-empty string`,
    );
  }
  return value;
}

function requireOrdinal(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new RangeError(
      `[kodex/interaction-events] ordinal must be a non-negative safe integer, received ${String(value)}`,
    );
  }
  return value as number;
}

/**
 * The identity function. Same inputs → same id, on any machine, at any time.
 * Exported so a replayer can verify an id without reconstructing an event.
 */
export function computeKodexInteractionEventId(
  input: KodexInteractionEventInput,
  ordinal: number,
): string {
  requireText(input?.nodeId, 'nodeId');
  requireText(input?.interactionId, 'interactionId');
  requireOrdinal(ordinal);
  return `${IDENTITY_SCHEME}_${digest64(identityMaterial(input, ordinal))}`;
}

/* ------------------------------------------------------------------ *
 * Construction
 * ------------------------------------------------------------------ */

export interface KodexInteractionEventOptions {
  /**
   * Explicit causal position. Supply the ordinal recorded on the original
   * event to replay it: the id comes out identical and the JourneyState
   * reducer folds it in exactly once.
   */
  ordinal?: number;
  /** Sequence that supplies the ordinal when none is given. */
  sequence?: KodexInteractionSequence;
  /** Observational timestamp. Never enters the identity. */
  createdAt?: number;
}

/** Builds the event detail, including its content-addressed identity. */
export function createKodexInteractionEventDetail(
  input: KodexInteractionEventInput,
  options: KodexInteractionEventOptions = {},
): KodexInteractionEventDetail {
  const nodeId = requireText(input?.nodeId, 'nodeId');
  const interactionId = requireText(input?.interactionId, 'interactionId');

  const ordinal =
    options.ordinal === undefined
      ? (options.sequence ?? defaultKodexInteractionSequence).next(nodeId, interactionId)
      : requireOrdinal(options.ordinal);

  const normalized: KodexInteractionEventInput = {
    ...input,
    sourceIds: normalizeIdList(input.sourceIds),
    claimIds: normalizeIdList(input.claimIds),
  };

  return {
    ...normalized,
    id: computeKodexInteractionEventId(normalized, ordinal),
    ordinal,
    createdAt: options.createdAt ?? Date.now(),
  };
}

export function createKodexInteractionEvent(
  detail: KodexInteractionEventInput,
  options: KodexInteractionEventOptions = {},
): CustomEvent<KodexInteractionEventDetail> {
  return new CustomEvent<KodexInteractionEventDetail>(KODEX_INTERACTION_EVENT, {
    bubbles: true,
    composed: true,
    detail: createKodexInteractionEventDetail(detail, options),
  });
}

/**
 * Reconstructs a recorded event for replay (Browser Back/Forward, snapshot
 * restore). The identity is recomputed from the recorded payload and ordinal,
 * so it must equal the original — a mismatch means the payload was mutated in
 * transit and is reported rather than silently re-identified.
 */
export function replayKodexInteractionEvent(
  detail: KodexInteractionEventDetail,
): CustomEvent<KodexInteractionEventDetail> {
  const replayed = createKodexInteractionEventDetail(detail, {
    ordinal: requireOrdinal(detail?.ordinal),
    createdAt: detail.createdAt,
  });

  if (replayed.id !== detail.id) {
    throw new Error(
      '[kodex/interaction-events] replayed payload does not match its recorded identity',
    );
  }

  return new CustomEvent<KodexInteractionEventDetail>(KODEX_INTERACTION_EVENT, {
    bubbles: true,
    composed: true,
    detail: replayed,
  });
}

export function isMeaningfulKodexInteraction(
  detail: KodexInteractionEventDetail,
): boolean {
  if (!detail.writesToMemory) return false;

  return (
    detail.stateBefore !== detail.stateAfter ||
    detail.sourceIds.length > 0 ||
    detail.claimIds.length > 0 ||
    ['NAVIGATE', 'ANNOTATE', 'CONTRIBUTE'].includes(detail.role)
  );
}
