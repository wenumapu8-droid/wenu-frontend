/**
 * KODEX−∞ · RETURN SPECIMEN — the scoped legacy store, read-only and pure
 *
 * Work packet: MP-10 (unify the journey memory systems).
 * Canonical source: docs/decisions/ADR-0010-ALPHABETIC-MULTIVERSE-A-M-Y.md
 *
 * ── Why this module exists ────────────────────────────────────────────────
 *
 * Three things called themselves "journey memory":
 *
 *   1. `journey-state.ts` in this directory — the canonical kernel. A walk over
 *      the coordinates A–Y, folded from `type`-discriminated events, with no
 *      clock in the state and replay made idempotent by event identity.
 *   2. `src/kodex/return/memory.js` — a localStorage store under `kx-journey`,
 *      live to every visitor of the KODEX preview deploy.
 *   3. `journey-memory-bridge.ts` — a `kind`-discriminated bridge written
 *      against a different, now-superseded kernel, on five feature branches.
 *
 * MP-10 rules that (1) is the single journey memory. (3) is retired by not
 * being adopted. (2) is NOT migrated into (1), and that is a structural
 * finding, not a preference:
 *
 *   The canonical state is a walk over coordinates. The legacy store contains
 *   no coordinates. It holds route pathnames and visual-effect names, and
 *   there exists no pathname → letter mapping anywhere in the repository.
 *   Inventing one would assign A–Y coordinates, which the standing
 *   prohibitions forbid ("No canon invention"). So the legacy payload is not
 *   convertible into JourneyState — not lossily, not partially. Migration is
 *   unavailable until the creator assigns the coordinates.
 *
 * Therefore `kx-journey` is formally scoped: it is the RETURN scene's own
 * visual seed, and nothing else. This module is that scope made enforceable.
 *
 * ── What this module deliberately does NOT do ─────────────────────────────
 *
 *   - It has no write path. Not "a write path you should avoid" — there is no
 *     exported function that can set a storage key. The canonical kernel can
 *     therefore never become a fourth writer of `kx-journey`.
 *   - It never ranks, scores or classifies the visitor. Nothing here grows
 *     with how much the visitor did. See `deriveReturnSpecimen`.
 *   - It reads no clock. `Date.now()` does not appear in this file. A fallback
 *     seed is an explicit parameter, so the derivation is a pure function.
 *   - It carries no legacy scoring or timestamp field forward. `parseLegacy-
 *     JourneyPayload` admits exactly three fields; `signal`, `memory`,
 *     `started` and `last` are dropped at the boundary and cannot reach any
 *     consumer of this module.
 */

/* ------------------------------------------------------------------ *
 * The legacy contract
 * ------------------------------------------------------------------ */

/**
 * The localStorage key written by `src/kodex/return/memory.js` since before
 * the canonical kernel existed. Frozen: real payloads exist in the browsers of
 * everyone who has opened the KODEX preview deploy, and this module's job is to
 * keep reading them, not to rename or rewrite them.
 */
export const KODEX_RETURN_SPECIMEN_STORAGE_KEY = 'kx-journey' as const;

/** Shown when the journey recorded no work. Not a claim about the visitor. */
export const KODEX_RETURN_DEFAULT_LAST_WORK = '/img/kodex/works/bw-06.jpg' as const;

/**
 * The legacy payload, normalized to the only three fields the RETURN scene may
 * consume. Historical payloads also carry `started`, `last`, `signal` and
 * sometimes `memory`; those are read from storage and then discarded here.
 */
export interface KodexLegacyJourneyPayload {
  /** Route pathnames, in visit order, deduplicated only against the previous. */
  readonly views: readonly string[];
  /** Names of visual treatments the visitor applied, in order. */
  readonly effects: readonly string[];
  /** Count of completed RETURN visits. A record of returns, never a rank. */
  readonly cycle: number;
}

/**
 * The RETURN scene's specimen.
 *
 * The field names are a compatibility surface: `src/pages/kodex/return.astro`
 * reads `code`, `cycle`, `curated`, `seed`, `lastWork`, `chirality` and
 * `signal` by name, and that page is out of scope for this packet. The names
 * are preserved; the ranking semantics underneath them are not.
 */
export interface KodexReturnSpecimen {
  /** True when the journey recorded nothing, so the scene shows curated copy. */
  readonly curated: boolean;
  /** Deterministic 32-bit hash of the recorded journey. Drives the visuals. */
  readonly seed: number;
  /** `0x`-prefixed, 6-hex-digit rendering of the seed's middle bytes. */
  readonly seedHex: string;
  /** The displayed specimen code. Carries no classification of the visitor. */
  readonly code: string;
  /** 1-based ordinal of this RETURN visit. */
  readonly cycle: number;
  /** A hash coin flip, ±1. Not a measurement and not a property of anyone. */
  readonly chirality: 1 | -1;
  /**
   * A bounded value in [0, 1) used by the scene as a rotation coefficient.
   *
   * It is derived from the seed alone. It does NOT accumulate with the number
   * of effects applied, signals sent or pages visited — the pre-MP-10
   * derivation did exactly that, which made a visitor who did more spin
   * faster. That was a score, and scoring the visitor is forbidden outright.
   */
  readonly signal: number;
  /** Distinct visual treatments applied, in order of first use. */
  readonly visualChain: readonly string[];
  /** Route pathnames recorded, in order. */
  readonly works: readonly string[];
  /** The last route recorded, or the curated default. */
  readonly lastWork: string;
}

/* ------------------------------------------------------------------ *
 * Parsing
 * ------------------------------------------------------------------ */

function readStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

function readCount(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) return 0;
  return value as number;
}

/**
 * Parses a raw `kx-journey` string into the normalized payload.
 *
 * Tolerant on purpose: every payload shape this key has ever held is in some
 * visitor's browser right now, and a malformed one must degrade to the curated
 * RETURN rather than throw inside the scene's module graph. Returns `null` for
 * anything that is not a usable object.
 *
 * This is the boundary at which the legacy store is scoped. Fields outside the
 * three declared ones — including every scoring field and every timestamp —
 * are dropped here and cannot reach a consumer.
 */
export function parseLegacyJourneyPayload(
  raw: string | null | undefined,
): KodexLegacyJourneyPayload | null {
  if (typeof raw !== 'string' || raw.length === 0) return null;

  let decoded: unknown;
  try {
    decoded = JSON.parse(raw);
  } catch {
    return null;
  }

  if (decoded === null || typeof decoded !== 'object' || Array.isArray(decoded)) return null;

  const source = decoded as Record<string, unknown>;
  return Object.freeze({
    views: Object.freeze(readStringArray(source.views)),
    effects: Object.freeze(readStringArray(source.effects)),
    cycle: readCount(source.cycle),
  });
}

/* ------------------------------------------------------------------ *
 * Derivation
 * ------------------------------------------------------------------ */

/**
 * The legacy 32-bit rolling hash, reproduced exactly.
 *
 * Not replaced with the kernel's FNV-1a on purpose: the seed drives the RETURN
 * particle field, and changing the hash would change the artwork for every
 * visitor who already has a payload. Same input, same picture.
 */
function legacyHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash >>> 0;
}

function seedHexOf(seed: number): string {
  return `0x${((seed >>> 8) & 0xffffff).toString(16).toUpperCase().padStart(6, '0')}`;
}

export interface KodexReturnSpecimenOptions {
  /**
   * Material for the seed when the journey recorded nothing. Explicit because
   * this module reads no clock: purity is the point, and the caller that
   * currently passes `Date.now()` is a follow-up fix, not a hidden default.
   */
  readonly fallbackSeed?: string | number | null;
}

/**
 * Derives the specimen from a parsed payload. Pure: same payload and same
 * fallback seed produce the same specimen, on any machine, at any time.
 *
 * Nothing here is a measurement of the visitor. The seed is a hash of what was
 * recorded, `chirality` is one bit of it, `signal` is one byte of it, and
 * `cycle` counts returns. No value increases with effort, attention or
 * engagement, and no value classifies the visitor into a family or type.
 */
export function deriveReturnSpecimen(
  payload: KodexLegacyJourneyPayload | null,
  options: KodexReturnSpecimenOptions = {},
): KodexReturnSpecimen {
  const curated = !payload || (payload.views.length === 0 && payload.effects.length === 0);

  const recorded = payload ? payload.views.join('') + payload.effects.join('') : '';
  const material = recorded.length > 0
    ? recorded
    : String(options.fallbackSeed || 'CURATED');

  const seed = legacyHash(material);
  const seedHex = seedHexOf(seed);
  const cycle = payload ? Math.max(1, payload.cycle + 1) : 1;
  const chirality: 1 | -1 = (seed & 1) === 1 ? 1 : -1;

  // One byte of the seed, scaled into [0, 1). Bounded, deterministic, and flat
  // in the visitor's activity: doing more can never raise it.
  const signal = ((seed >>> 16) & 0xff) / 256;

  const views = payload ? payload.views : [];
  const lastWork = views.length > 0 ? views[views.length - 1] : KODEX_RETURN_DEFAULT_LAST_WORK;

  return Object.freeze({
    curated,
    seed,
    seedHex,
    code: formatSpecimenCode(cycle, chirality, seedHex),
    cycle,
    chirality,
    signal,
    visualChain: Object.freeze([...new Set(payload ? payload.effects : [])]),
    works: Object.freeze([...views]),
    lastWork,
  });
}

/**
 * `KDX-C07-R10-L-3F1A88`.
 *
 * The pre-MP-10 code carried a three-letter family segment chosen by
 * regex-matching the visitor's last route (`/disco|D0/` → `DIS`,
 * `/013|tribe/` → `TRB`, otherwise `ACH`). That segment classified the visitor
 * from their browsing and rendered the classification back at them as part of
 * their identity code. It is removed, not renamed.
 *
 * Removing it changes the displayed string, which breaks no promise: the seed
 * is a hash of the accumulated route list, so the code already changed on every
 * visit. It was never stable and was never presented as stable.
 *
 * `R10` is a fixed constant of the fiction, identical for every visitor. It
 * says nothing about anyone and is left untouched by this packet.
 */
function formatSpecimenCode(cycle: number, chirality: 1 | -1, seedHex: string): string {
  const cycleSegment = String(cycle).padStart(2, '0');
  const chiralitySegment = chirality > 0 ? 'R' : 'L';
  return `KDX-C${cycleSegment}-R10-${chiralitySegment}-${seedHex.slice(2)}`;
}

/* ------------------------------------------------------------------ *
 * Read-only storage access
 * ------------------------------------------------------------------ */

/** The read half of the Storage interface. There is deliberately no write half. */
export interface KodexReadOnlyStorage {
  getItem(key: string): string | null;
}

/**
 * Reads and parses the legacy payload from a storage-like object.
 *
 * Storage access can throw outright — Safari in private mode, and any browser
 * with site data blocked, throw on property access rather than returning null.
 * A failure here degrades to the curated RETURN, which is the correct visitor
 * experience, but it is reported through `onError` rather than swallowed: the
 * pre-MP-10 store discarded every storage error silently, so a store that had
 * never once succeeded was indistinguishable from a first-time visitor.
 */
export function readLegacyJourneyPayload(
  storage: KodexReadOnlyStorage | null | undefined,
  onError?: (error: unknown) => void,
): KodexLegacyJourneyPayload | null {
  if (!storage) return null;
  try {
    return parseLegacyJourneyPayload(storage.getItem(KODEX_RETURN_SPECIMEN_STORAGE_KEY));
  } catch (error) {
    onError?.(error);
    return null;
  }
}
