// KODEX −∞ · RETURN specimen store — the RETURN scene's own visual seed.
//
// SCOPE (MP-10). This store is NOT the journey memory. The journey memory is
// `src/lib/kodex/runtime/journey-state.ts`, the canonical kernel. This file
// records only what the RETURN sequence needs to seed its artwork: which routes
// were opened and which visual treatments were applied.
//
// It is not migrated into the canonical kernel, and that is structural rather
// than a preference: the kernel's state is a walk over the coordinates A–Y, and
// nothing here is a coordinate. There is no pathname → letter mapping anywhere
// in the repository, and inventing one would assign A–Y coordinates, which the
// standing prohibitions forbid. Until the creator assigns them, this payload is
// not convertible. See `src/lib/kodex/runtime/return-specimen.ts`.
//
// The derivation below is duplicated, deliberately and temporarily, from
// `return-specimen.ts`. This module sits in the import graph of every KODEX
// page via `KodexShell.astro`, so the cross-module import is a follow-up step
// that a build must verify. `return-specimen.test.ts` pins the two
// implementations to identical output on a corpus of real payload shapes.
//
// Honest: if nothing was recorded → curated.

const KEY = 'kx-journey';

// Storage access can throw outright (Safari private mode, site data blocked).
// Failure still degrades to the curated RETURN — that is the right visitor
// experience — but it is no longer discarded in silence. Before MP-10 a store
// that had never once succeeded looked exactly like a first-time visitor.
export const memoryDiagnostics = { reads: 0, writes: 0, readErrors: 0, writeErrors: 0, lastError: null };

const readRaw = () => {
  try {
    memoryDiagnostics.reads += 1;
    return JSON.parse(localStorage.getItem(KEY) || 'null') || null;
  } catch (e) {
    memoryDiagnostics.readErrors += 1;
    memoryDiagnostics.lastError = e;
    return null;
  }
};

const writeRaw = (o) => {
  try {
    memoryDiagnostics.writes += 1;
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch (e) {
    memoryDiagnostics.writeErrors += 1;
    memoryDiagnostics.lastError = e;
  }
};

// Record an event: { type:'view'|'effect'|'cycle', work?, effect? }.
//
// No clock is written. The pre-MP-10 store stamped `Date.now()` into `started`
// and `last` on every call, which made the payload non-deterministic for no
// reader — nothing has ever read either field. Existing payloads keep whatever
// `started`/`last` they already hold; those keys are simply never updated
// again, so an old payload is never invalidated.
//
// 'signal' is retired. It only ever fed a counter that scored the visitor, and
// no call site in the repository has ever emitted it.
export function record(ev) {
  const j = readRaw() || { views: [], effects: [], cycle: 0 };
  if (!Array.isArray(j.views)) j.views = [];
  if (!Array.isArray(j.effects)) j.effects = [];
  if (!Number.isSafeInteger(j.cycle) || j.cycle < 0) j.cycle = 0;

  let changed = false;
  if (ev && ev.type === 'view' && ev.work) {
    if (j.views[j.views.length - 1] !== ev.work) { j.views.push(ev.work); changed = true; }
    if (j.views.length > 64) j.views.shift();
  } else if (ev && ev.type === 'effect' && ev.effect) {
    j.effects.push(ev.effect); changed = true;
    if (j.effects.length > 128) j.effects.shift();
  } else if (ev && ev.type === 'cycle') {
    j.cycle += 1; changed = true;
  }

  // Re-recording the route you are already on writes nothing.
  if (changed) writeRaw(j);
}

// Derive the specimen from what was recorded, or a curated fallback.
//
// Nothing returned here ranks, scores or classifies the visitor. Two values
// were removed rather than renamed:
//
//   `memory` — the count `views + effects + signal`. A pure engagement score.
//              Nothing read it.
//   the family segment of `code` — chosen by regex-matching the visitor's last
//              route (/disco|D0/ → DIS, /013|tribe/ → TRB, else ACH) and then
//              displayed back to them as part of their identity code.
//
// and one was kept by name but severed from effort: `signal` was
// min(1, signals*0.34 + effects*0.04), so a visitor who did more spun faster.
// It is now one byte of the seed. Same range, same role in the scene, but flat
// in everything the visitor does.
//
// The displayed code changes as a result. That breaks no promise: the seed
// hashes the accumulated route list, so the code already changed on every
// visit and was never presented as stable.
export function readSpecimen(fallbackSeed) {
  const j = readRaw();
  const views = j && Array.isArray(j.views) ? j.views.filter((v) => typeof v === 'string' && v.length > 0) : [];
  const effects = j && Array.isArray(j.effects) ? j.effects.filter((v) => typeof v === 'string' && v.length > 0) : [];
  const cycleCount = j && Number.isSafeInteger(j.cycle) && j.cycle >= 0 ? j.cycle : 0;

  const curated = !j || (views.length === 0 && effects.length === 0);
  const seedStr = (views.join('') + effects.join('')) || String(fallbackSeed || 'CURATED');
  let s = 0; for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) >>> 0;

  const seedHex = '0x' + ((s >>> 8) & 0xffffff).toString(16).toUpperCase().padStart(6, '0');
  const cycle = j ? Math.max(1, cycleCount + 1) : 1;
  const chirality = (s & 1) ? 1 : -1;
  const signal = ((s >>> 16) & 0xff) / 256;

  const chir = chirality > 0 ? 'R' : 'L';
  const state = 'R10'; // fixed constant of the fiction; identical for everyone
  const code = `KDX-C${String(cycle).padStart(2, '0')}-${state}-${chir}-${seedHex.slice(2)}`;

  return {
    curated, seed: s, seedHex, code, cycle, chirality, signal,
    visualChain: [...new Set(effects)], works: views,
    lastWork: (views.length ? views[views.length - 1] : '') || '/img/kodex/works/bw-06.jpg',
  };
}
