/**
 * KODEX−∞ · ORGANISM MEMORY ADAPTER
 *
 * Canonical source: docs/decisions/ADR-0010-ALPHABETIC-MULTIVERSE-A-M-Y.md
 * Work packet: MP-12 (wire `preset.memory.writes` to JourneyState).
 *
 * `kodex:organism-action` already carries the memory writes an organism preset
 * declares (`preset.memory.writes`), and until now nothing listened to it. This
 * module is that listener: it translates declared memory writes into
 * `KodexJourneyEvent`s and folds them through the JourneyState kernel.
 *
 * ------------------------------------------------------------------
 * What this adapter deliberately does NOT do
 * ------------------------------------------------------------------
 *
 * A declared write is a bare token — `"FIELD_ACTIVATED"`, `"SEED_PLANTED"`,
 * `"ORBITAL_RELATION_OBSERVED"`. It names a fact; it does not name a coordinate,
 * a relation id, a question, a spectral band or a portal state. Therefore:
 *
 *   - No `ENTER_LETTER`. Placing an organism on a letter would mean deciding
 *     what that letter is for. The meanings of B–L and N–X are unassigned and
 *     may not be invented to complete a list (ADR-0010, "Concept assignment
 *     law"). An organism action never moves the visitor.
 *   - No `SET_HEART_PORTAL`. Making M resonate because an organism was
 *     activated would turn M into a reward for activity. M is optional,
 *     distributed, and never a score (ADR-0010).
 *   - No `TRACE_RELATION` for `"ORBITAL_RELATION_OBSERVED"`, no
 *     `OBSERVE_SPECTRAL` for `"VORTEX_OBSERVED"`, no `RAISE_QUESTION` for
 *     `"TERRAIN_LAYER_ANALYZED"`. Each of those kernel events requires an
 *     identifier the preset does not declare (`relationId`, `bandId`,
 *     `questionId`). Synthesizing one would be fabricating canon out of a
 *     string that merely reads like it.
 *
 * Every declared write therefore becomes exactly one `COMMIT_ACTION`: the one
 * mapping that records what the producer actually declared and infers nothing.
 * Routing specific tokens to richer kernel events is a creator decision, not an
 * implementation detail.
 *
 * ------------------------------------------------------------------
 * Privacy
 * ------------------------------------------------------------------
 *
 * Only `presetId`, `action` and the declared write tokens are read off the
 * event. Pointer position, velocity, timing, device and audio data are never
 * read, so nothing pointer-derived can reach serialized state. Passive pointer
 * movement alone cannot write consequential memory (ADR-0010, "Edge-resolution
 * law"); this adapter fires only on a deliberate committed primary action, and
 * only when that preset declares a write. Nothing here scores, ranks or
 * profiles the visitor.
 *
 * ------------------------------------------------------------------
 * Identity
 * ------------------------------------------------------------------
 *
 * Ids are content-addressed with the same discipline MP-1 established for
 * interaction events: a deterministic digest over the declared payload plus a
 * recorded occurrence token. `Date.now()` is never called here, and the id of a
 * write is reproducible from the event alone, so replaying an event folds it in
 * exactly once.
 *
 * See `ORGANISM_OCCURRENCE_CAVEAT` below for the one limitation this inherits
 * from the current producer.
 */

import type {
  KodexAlphabetJourneyState,
  KodexJourneyEvent,
} from './journey-state.ts';
import { applyJourneyEvents, createInitialJourneyState } from './journey-state.ts';

export const KODEX_ORGANISM_ACTION_EVENT = 'kodex:organism-action' as const;

/** Identity scheme version. Bumping it invalidates every previously minted id. */
const IDENTITY_SCHEME = 'kdxo1';

/**
 * The producer (`kodex-organism-client`) currently derives `detail.id` from
 * `Date.now()` plus a per-page counter. This adapter never calls the clock and
 * never parses that id — it consumes it opaquely as the occurrence token that
 * distinguishes one activation from the next.
 *
 * The consequence, stated plainly: replay is idempotent WITHIN the session that
 * recorded the trace, because a replayed event carries the same recorded
 * `detail.id`. A trace restored into a fresh session cannot reproduce its ids,
 * because the token was never content-addressed at the source. Fixing that
 * means giving the producer a recorded causal ordinal the way MP-1 gave one to
 * interaction events. That is a change to the producer, outside this module.
 */
export const ORGANISM_OCCURRENCE_CAVEAT =
  'organism-action ids are occurrence-scoped, not content-addressed at the source';

/**
 * The `kodex:organism-action` payload, as the producer emits it.
 *
 * `family` and `createdAt` are observational: they are deliberately not read by
 * this adapter and never enter an id or the state.
 */
export interface KodexOrganismActionDetail {
  /** Opaque occurrence token. Never parsed; only digested and compared. */
  id: string;
  presetId: string;
  action: string;
  /** `preset.memory.writes` — the writes this preset declares. */
  memoryWrites: readonly string[];
  family?: string;
  createdAt?: number;
}

/* ------------------------------------------------------------------ *
 * Digest
 * ------------------------------------------------------------------ */

/**
 * FNV-1a, 32-bit, parameterised by offset basis. Deterministic everywhere.
 *
 * Duplicated from `interaction-events.ts` rather than imported because that
 * module does not export its digest primitive and this packet does not own it.
 * Sharing one primitive is a worthwhile follow-up, not a licence to edit a file
 * outside this packet.
 */
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
  const hi = fnv1a(`${material.length}${material}`, 0x01000193);
  return `${hex32(hi)}${hex32(lo)}`;
}

function requireText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(
      `[kodex/organism-memory-adapter] ${field} must be a non-empty string`,
    );
  }
  return value;
}

/**
 * The identity function for one declared write.
 *
 * JSON framing makes field boundaries injection-proof: no combination of preset
 * strings can forge another write's material. Exported so a replayer can verify
 * an id without reconstructing the event.
 */
export function computeOrganismWriteEventId(
  occurrenceId: string,
  presetId: string,
  action: string,
  write: string,
): string {
  const material = JSON.stringify([
    IDENTITY_SCHEME,
    requireText(occurrenceId, 'id'),
    requireText(presetId, 'presetId'),
    requireText(action, 'action'),
    requireText(write, 'memoryWrites[]'),
  ]);
  return `${IDENTITY_SCHEME}_${digest64(material)}`;
}

/**
 * The action identity recorded in `committedActionIds`.
 *
 * Qualified by the preset that declared it so two presets declaring the same
 * token stay distinguishable, and so provenance survives into the trace.
 */
export function organismActionId(presetId: string, write: string): string {
  return `${presetId}:${write}`;
}

/* ------------------------------------------------------------------ *
 * Translation
 * ------------------------------------------------------------------ */

function normalizeWrites(writes: readonly string[] | undefined): string[] {
  if (!Array.isArray(writes)) return [];
  const seen = new Set<string>();
  for (const raw of writes) {
    if (typeof raw !== 'string') continue;
    const write = raw.trim();
    // A preset that declares the same token twice still writes it once.
    if (write.length > 0) seen.add(write);
  }
  return [...seen];
}

/**
 * Translates one `kodex:organism-action` payload into journey events.
 *
 * An atmospheric preset — one whose `memory.writes` is empty — yields no
 * events, so folding it changes nothing. Atmosphere is not memory.
 */
export function organismActionToJourneyEvents(
  detail: KodexOrganismActionDetail | null | undefined,
): KodexJourneyEvent[] {
  if (!detail || typeof detail !== 'object') return [];

  const writes = normalizeWrites(detail.memoryWrites);
  if (writes.length === 0) return [];

  const occurrenceId = requireText(detail.id, 'id');
  const presetId = requireText(detail.presetId, 'presetId');
  const action = requireText(detail.action, 'action');

  return writes.map((write) => ({
    id: computeOrganismWriteEventId(occurrenceId, presetId, action, write),
    type: 'COMMIT_ACTION' as const,
    actionId: organismActionId(presetId, write),
  }));
}

/**
 * Folds one payload into a state. Pure: no DOM, no storage, no clock.
 *
 * Idempotent by construction — the kernel drops any event id already present in
 * `appliedEventIds`, and this module derives that id from the event's own
 * recorded content.
 */
export function foldOrganismAction(
  state: KodexAlphabetJourneyState,
  detail: KodexOrganismActionDetail | null | undefined,
): KodexAlphabetJourneyState {
  return applyJourneyEvents(state, organismActionToJourneyEvents(detail));
}

/* ------------------------------------------------------------------ *
 * Listener
 * ------------------------------------------------------------------ */

export interface KodexOrganismMemoryListener {
  /** The state as folded so far. */
  getState(): KodexAlphabetJourneyState;
  /** Detaches the listener. Safe to call more than once. */
  destroy(): void;
}

export interface KodexOrganismMemoryListenerOptions {
  /** Seed state. Defaults to a fresh journey at A. */
  initialState?: KodexAlphabetJourneyState;
  /** Called only when a fold actually changed the state. */
  onChange?: (state: KodexAlphabetJourneyState) => void;
}

/**
 * Attaches to an `EventTarget` and folds every `kodex:organism-action` it sees.
 *
 * `onChange` fires only on a real transition: an atmospheric action, or a
 * replay of an action already folded in, leaves the state object identical and
 * stays silent.
 */
export function createKodexOrganismMemoryListener(
  target: EventTarget,
  options: KodexOrganismMemoryListenerOptions = {},
): KodexOrganismMemoryListener {
  let state = options.initialState ?? createInitialJourneyState();
  let destroyed = false;

  const onOrganismAction = (event: Event) => {
    const detail = (event as Event & { detail?: KodexOrganismActionDetail })
      .detail;
    const next = foldOrganismAction(state, detail);
    if (next === state) return;
    state = next;
    options.onChange?.(state);
  };

  target.addEventListener(KODEX_ORGANISM_ACTION_EVENT, onOrganismAction);

  return {
    getState: () => state,
    destroy: () => {
      if (destroyed) return;
      destroyed = true;
      target.removeEventListener(KODEX_ORGANISM_ACTION_EVENT, onOrganismAction);
    },
  };
}
