/**
 * KODEX−∞ · RETURN specimen — unit tests (MP-10).
 *
 * Run with the repository's pinned Node (24.14.1), which strips TypeScript
 * types natively and ships the test runner. There is no `test` script in
 * package.json and no TypeScript compiler installed, so this is the only way
 * these files are checked:
 *
 *     node --test src/lib/kodex/runtime/return-specimen.test.ts
 *
 * What these tests are for, in order of importance:
 *
 *   1. A `kx-journey` payload that is already in a visitor's browser still
 *      loads, and `record()` still extends it without discarding a single key.
 *   2. Nothing produced by either implementation ranks, scores or classifies
 *      the visitor.
 *   3. The derivation is pure — no clock, no randomness, no accumulation.
 *   4. `src/kodex/return/memory.js` and `return-specimen.ts` agree exactly, so
 *      the deliberate temporary duplication cannot drift.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  KODEX_RETURN_DEFAULT_LAST_WORK,
  KODEX_RETURN_SPECIMEN_STORAGE_KEY,
  deriveReturnSpecimen,
  parseLegacyJourneyPayload,
  readLegacyJourneyPayload,
  type KodexReturnSpecimen,
} from './return-specimen.ts';

import * as legacyStore from '../../../kodex/return/memory.js';

/* ------------------------------------------------------------------ *
 * Harness
 * ------------------------------------------------------------------ */

/** Minimal localStorage stand-in. `memory.js` resolves the bare global. */
function installStorage(seedValue?: string | null): Map<string, string> {
  const cells = new Map<string, string>();
  if (typeof seedValue === 'string') cells.set(KODEX_RETURN_SPECIMEN_STORAGE_KEY, seedValue);

  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem: (key: string) => (cells.has(key) ? cells.get(key)! : null),
      setItem: (key: string, value: string) => void cells.set(key, String(value)),
      removeItem: (key: string) => void cells.delete(key),
    },
  });

  return cells;
}

/** A storage whose every access throws, as Safari private mode does. */
function installHostileStorage(): void {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    writable: true,
    value: {
      getItem() { throw new DOMException('SecurityError'); },
      setItem() { throw new DOMException('QuotaExceededError'); },
      removeItem() { throw new DOMException('SecurityError'); },
    },
  });
}

const raw = (value: unknown) => JSON.stringify(value);

/**
 * Real payload shapes. The first four are pre-MP-10: they carry `started`,
 * `last` and `signal`, which the store wrote before this packet and which are
 * sitting in visitors' browsers right now.
 */
const LEGACY_CORPUS: Record<string, string> = {
  'pre-MP-10 · a journey with routes and effects': raw({
    started: 1_754_000_000_000,
    views: ['/kodex', '/kodex/works', '/kodex/observe'],
    effects: ['bloom', 'grain', 'bloom'],
    signal: 0,
    cycle: 2,
    last: 1_754_000_900_000,
  }),
  'pre-MP-10 · first visit, shell recorded one route': raw({
    started: 1_754_000_000_000, views: ['/kodex'], effects: [], signal: 0, cycle: 0, last: 1_754_000_000_100,
  }),
  'pre-MP-10 · nothing recorded': raw({
    started: 1_754_000_000_000, views: [], effects: [], signal: 0, cycle: 0, last: 1_754_000_000_000,
  }),
  'pre-MP-10 · signal counter had been incremented': raw({
    started: 1_754_000_000_000, views: ['/kodex/disco'], effects: ['warp'], signal: 3, cycle: 1, last: 1_754_000_500_000,
  }),
  'post-MP-10 · no clock, no signal': raw({ views: ['/kodex', '/kodex/return'], effects: ['grain'], cycle: 4 }),
  'saturated · long journey': raw({
    views: Array.from({ length: 64 }, (_, i) => `/kodex/w/${i}`),
    effects: Array.from({ length: 128 }, (_, i) => `fx-${i % 9}`),
    cycle: 11,
  }),
  'no key at all': '',
  'literal null': 'null',
  'not json': '{oops',
  'json array': '[]',
  'json string': '"str"',
  'json zero': '0',
  'empty object': '{}',
  'wrong field types': raw({ views: 'nope', effects: 7, cycle: -4 }),
  'array with non-strings': raw({ views: ['/kodex', 42, null, ''], effects: [{ x: 1 }, 'grain'], cycle: 1 }),
};

/* ------------------------------------------------------------------ *
 * AC1 · the payload already in visitors' browsers survives
 * ------------------------------------------------------------------ */

test('AC1 · a pre-MP-10 payload still loads and yields a usable specimen', () => {
  const cells = installStorage(LEGACY_CORPUS['pre-MP-10 · a journey with routes and effects']);
  const spec = legacyStore.readSpecimen('fallback') as KodexReturnSpecimen;

  assert.equal(spec.curated, false);
  assert.deepEqual(spec.works, ['/kodex', '/kodex/works', '/kodex/observe']);
  assert.deepEqual(spec.visualChain, ['bloom', 'grain']);
  assert.equal(spec.cycle, 3, 'cycle is the stored count plus this visit');
  assert.equal(spec.lastWork, '/kodex/observe');
  assert.equal(typeof spec.seed, 'number');
  assert.ok(cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY), 'reading must not clear the payload');
});

test('AC1 · every field the RETURN scene reads by name is present and in range', () => {
  // src/pages/kodex/return.astro reads: code, cycle, curated, seed, lastWork,
  // chirality and signal. That page is out of scope for this packet, so the
  // contract it depends on is asserted here instead.
  for (const [label, payload] of Object.entries(LEGACY_CORPUS)) {
    installStorage(payload);
    const spec = legacyStore.readSpecimen(12345) as KodexReturnSpecimen;

    assert.equal(typeof spec.code, 'string', label);
    assert.ok(Number.isSafeInteger(spec.cycle) && spec.cycle >= 1, `${label} · cycle`);
    assert.equal(typeof spec.curated, 'boolean', label);
    assert.ok(Number.isInteger(spec.seed) && spec.seed >= 0, `${label} · seed`);
    assert.equal(typeof spec.lastWork, 'string', label);
    assert.ok(spec.lastWork.length > 0, `${label} · lastWork non-empty`);

    // return.astro:190 computes chirality * (0.15 + signal * 0.3). Either being
    // undefined makes the whole rotation NaN and freezes the scene.
    assert.ok(spec.chirality === 1 || spec.chirality === -1, `${label} · chirality`);
    assert.ok(Number.isFinite(spec.signal) && spec.signal >= 0 && spec.signal < 1, `${label} · signal`);
  }
});

test('AC1 · record() extends a pre-MP-10 payload without dropping any key', () => {
  const original = {
    started: 1_754_000_000_000,
    views: ['/kodex', '/kodex/works'],
    effects: ['bloom'],
    signal: 3,
    cycle: 2,
    last: 1_754_000_900_000,
  };
  const cells = installStorage(raw(original));

  legacyStore.record({ type: 'view', work: '/kodex/return' });

  const after = JSON.parse(cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY)!);
  assert.deepEqual(after.views, ['/kodex', '/kodex/works', '/kodex/return']);
  assert.deepEqual(after.effects, ['bloom'], 'effects untouched');
  assert.equal(after.cycle, 2, 'cycle untouched');
  assert.equal(after.started, original.started, 'the legacy started stamp survives verbatim');
  assert.equal(after.last, original.last, 'the legacy last stamp survives verbatim, and is not refreshed');
  assert.equal(after.signal, 3, 'the retired counter is preserved, never read, never incremented');
});

test('AC1 · a corrupt or missing payload degrades to the curated RETURN', () => {
  for (const label of ['not json', 'literal null', 'json zero', 'no key at all']) {
    installStorage(LEGACY_CORPUS[label]);
    const spec = legacyStore.readSpecimen('CURATED') as KodexReturnSpecimen;
    assert.equal(spec.curated, true, label);
    assert.equal(spec.lastWork, KODEX_RETURN_DEFAULT_LAST_WORK, label);
  }
});

/* ------------------------------------------------------------------ *
 * AC2 · nothing ranks, scores or classifies the visitor
 * ------------------------------------------------------------------ */

test('AC2 · the specimen carries no engagement count', () => {
  for (const [label, payload] of Object.entries(LEGACY_CORPUS)) {
    installStorage(payload);
    const spec = legacyStore.readSpecimen(1) as Record<string, unknown>;
    assert.equal('memory' in spec, false, `${label} · the views+effects+signal count is gone`);
    assert.equal('fam' in spec, false, label);
    assert.equal('score' in spec, false, label);
    assert.equal('rank' in spec, false, label);
  }
});

test('AC2 · the code carries no classification of the visitor', () => {
  const shape = /^KDX-C\d{2,}-R10-[RL]-[0-9A-F]{6}$/;

  // These are exactly the routes the retired regex classified: /disco|D0/ was
  // labelled DIS, /013|tribe/ was labelled TRB, everything else ACH.
  const previouslyClassified = ['/kodex/disco-solar', '/kodex/D0', '/kodex/013', '/kodex/tribe', '/kodex/other'];

  for (const route of previouslyClassified) {
    installStorage(raw({ views: [route], effects: [], cycle: 0 }));
    const spec = legacyStore.readSpecimen(1) as KodexReturnSpecimen;

    assert.match(spec.code, shape, route);
    for (const family of ['DIS', 'TRB', 'ACH']) {
      assert.equal(spec.code.includes(family), false, `${route} must not be labelled ${family}`);
    }
  }
});

test('AC2 · signal is a projection of the seed, not a measure of activity', () => {
  for (const [label, payload] of Object.entries(LEGACY_CORPUS)) {
    installStorage(payload);
    const spec = legacyStore.readSpecimen(99) as KodexReturnSpecimen;
    assert.equal(spec.signal, ((spec.seed >>> 16) & 0xff) / 256, label);
  }
});

test('AC2 · doing more does not raise signal — the old formula guaranteed it would', () => {
  const signalFor = (views: string[], effects: string[]): number => {
    installStorage(raw({ views, effects, cycle: 0 }));
    return (legacyStore.readSpecimen(1) as KodexReturnSpecimen).signal;
  };

  // The retired derivation was min(1, signals * 0.34 + effects.length * 0.04):
  // strictly nondecreasing in the number of effects applied. Under a rank, a
  // superset of activity can never score lower. Find one that does.
  const base = signalFor(['/kodex'], []);
  let foundLower = false;

  for (let n = 1; n <= 40 && !foundLower; n += 1) {
    const grown = signalFor(['/kodex'], Array.from({ length: n }, (_, i) => `fx-${i}`));
    if (grown < base) foundLower = true;
  }

  assert.ok(foundLower, 'a strictly longer journey must be able to yield a lower signal');
});

test('AC2 · cycle counts returns and nothing else', () => {
  const cells = installStorage(raw({ views: ['/kodex'], effects: [], cycle: 0 }));

  legacyStore.record({ type: 'view', work: '/kodex/works' });
  legacyStore.record({ type: 'effect', effect: 'grain' });
  assert.equal(JSON.parse(cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY)!).cycle, 0);

  legacyStore.record({ type: 'cycle' });
  assert.equal(JSON.parse(cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY)!).cycle, 1);
});

test('AC2 · the retired signal event writes nothing', () => {
  const cells = installStorage(raw({ views: ['/kodex'], effects: [], cycle: 0 }));
  const before = cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY);

  legacyStore.record({ type: 'signal' });

  assert.equal(cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY), before);
});

/* ------------------------------------------------------------------ *
 * AC3 · purity, determinism, no clock
 * ------------------------------------------------------------------ */

test('AC3 · deriveReturnSpecimen is a pure function of its inputs', () => {
  for (const [label, payload] of Object.entries(LEGACY_CORPUS)) {
    const parsed = parseLegacyJourneyPayload(payload);
    const first = deriveReturnSpecimen(parsed, { fallbackSeed: 'SEED' });
    const second = deriveReturnSpecimen(parseLegacyJourneyPayload(payload), { fallbackSeed: 'SEED' });
    assert.deepEqual(first, second, label);
  }
});

test('AC3 · neither implementation reads a clock', () => {
  const here = import.meta.dirname;
  const sources: Array<[string, string]> = [
    ['return-specimen.ts', readFileSync(join(here, 'return-specimen.ts'), 'utf8')],
    ['memory.js', readFileSync(join(here, '../../../kodex/return/memory.js'), 'utf8')],
  ];

  for (const [name, source] of sources) {
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*(\/\/|\*).*$/gm, '');
    assert.equal(/Date\.now|performance\.now|new Date|Math\.random/.test(code), false, `${name} must be clock- and randomness-free`);
  }
});

test('AC3 · re-recording the route you are already on is a no-op', () => {
  const cells = installStorage(raw({ views: ['/kodex'], effects: [], cycle: 0 }));

  legacyStore.record({ type: 'view', work: '/kodex/works' });
  const afterFirst = cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY);

  legacyStore.record({ type: 'view', work: '/kodex/works' });
  legacyStore.record({ type: 'view', work: '/kodex/works' });

  assert.equal(cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY), afterFirst, 'a replayed view must not grow the payload');
});

test('AC3 · the view list stays bounded at 64 and the effect list at 128', () => {
  const cells = installStorage(raw({ views: [], effects: [], cycle: 0 }));

  for (let i = 0; i < 200; i += 1) legacyStore.record({ type: 'view', work: `/w/${i}` });
  for (let i = 0; i < 300; i += 1) legacyStore.record({ type: 'effect', effect: `fx-${i}` });

  const stored = JSON.parse(cells.get(KODEX_RETURN_SPECIMEN_STORAGE_KEY)!);
  assert.equal(stored.views.length, 64);
  assert.equal(stored.effects.length, 128);
  assert.equal(stored.views.at(-1), '/w/199');
});

/* ------------------------------------------------------------------ *
 * AC4 · the store is scoped, and read-only from the canonical side
 * ------------------------------------------------------------------ */

test('AC4 · the parser refuses to carry scoring or clock fields across the boundary', () => {
  const parsed = parseLegacyJourneyPayload(
    raw({ started: 1, last: 2, signal: 9, memory: 42, fam: 'DIS', views: ['/a'], effects: ['b'], cycle: 1 }),
  );

  assert.ok(parsed);
  assert.deepEqual(Object.keys(parsed).sort(), ['cycle', 'effects', 'views']);
});

test('AC4 · the parser normalizes every historical and hostile shape without throwing', () => {
  for (const [label, payload] of Object.entries(LEGACY_CORPUS)) {
    const parsed = parseLegacyJourneyPayload(payload);
    if (parsed === null) continue;
    assert.ok(Array.isArray(parsed.views), `${label} · views`);
    assert.ok(Array.isArray(parsed.effects), `${label} · effects`);
    assert.ok(parsed.views.every((v) => typeof v === 'string' && v.length > 0), `${label} · view entries`);
    assert.ok(Number.isSafeInteger(parsed.cycle) && parsed.cycle >= 0, `${label} · cycle`);
  }

  const cleaned = parseLegacyJourneyPayload(LEGACY_CORPUS['array with non-strings']);
  assert.deepEqual(cleaned?.views, ['/kodex']);
  assert.deepEqual(cleaned?.effects, ['grain']);
  assert.equal(parseLegacyJourneyPayload(LEGACY_CORPUS['wrong field types'])?.cycle, 0);
});

test('AC4 · the canonical side cannot become a fourth writer of kx-journey', () => {
  // Enforcement by construction, not by convention: the module never names a
  // mutating storage call and never reaches for an ambient storage object, so
  // there is no code path through it that can set this key.
  const source = readFileSync(join(import.meta.dirname, 'return-specimen.ts'), 'utf8');
  const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*(\/\/|\*).*$/gm, '');

  for (const call of ['setItem', 'removeItem', 'clear(', 'localStorage', 'sessionStorage']) {
    assert.equal(code.includes(call), false, `return-specimen.ts must never name ${call}`);
  }

  // And the storage port it accepts is read-only: a full Storage satisfies it,
  // but the module can only ever call the one method it declares.
  const port: unknown = { getItem: () => null };
  assert.deepEqual(Object.keys(port as object), ['getItem']);
  assert.equal(readLegacyJourneyPayload(port as { getItem(k: string): string | null }), null);
});

test('AC4 · a storage that throws on access is reported, not swallowed', () => {
  const seen: unknown[] = [];
  const hostile = { getItem() { throw new Error('SecurityError'); } };

  assert.equal(readLegacyJourneyPayload(hostile, (e) => seen.push(e)), null);
  assert.equal(seen.length, 1);

  installHostileStorage();
  legacyStore.memoryDiagnostics.readErrors = 0;
  legacyStore.memoryDiagnostics.writeErrors = 0;

  const spec = legacyStore.readSpecimen('CURATED') as KodexReturnSpecimen;
  legacyStore.record({ type: 'view', work: '/kodex' });

  assert.equal(spec.curated, true, 'the scene still renders');
  assert.ok(legacyStore.memoryDiagnostics.readErrors > 0, 'the read failure is counted');
  assert.ok(legacyStore.memoryDiagnostics.writeErrors > 0, 'the write failure is counted');
  assert.ok(legacyStore.memoryDiagnostics.lastError instanceof Error);
});

/* ------------------------------------------------------------------ *
 * AC5 · the temporary duplication cannot drift
 * ------------------------------------------------------------------ */

test('AC5 · memory.js and return-specimen.ts agree on every payload in the corpus', () => {
  for (const [label, payload] of Object.entries(LEGACY_CORPUS)) {
    for (const fallback of ['CURATED', 'SEED-A', 12345] as const) {
      installStorage(payload);
      const fromStore = legacyStore.readSpecimen(fallback) as KodexReturnSpecimen;
      const fromKernel = deriveReturnSpecimen(parseLegacyJourneyPayload(payload), { fallbackSeed: fallback });

      assert.deepEqual(
        { ...fromStore },
        { ...fromKernel },
        `${label} · fallback ${String(fallback)}`,
      );
    }
  }
});

test('AC5 · readLegacyJourneyPayload reads the same key memory.js writes', () => {
  const cells = installStorage();
  legacyStore.record({ type: 'view', work: '/kodex' });
  legacyStore.record({ type: 'effect', effect: 'grain' });

  const payload = readLegacyJourneyPayload({
    getItem: (key: string) => (cells.has(key) ? cells.get(key)! : null),
  });

  assert.deepEqual(payload, { views: ['/kodex'], effects: ['grain'], cycle: 0 });
});
