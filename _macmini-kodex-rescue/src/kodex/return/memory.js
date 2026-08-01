// KODEX −∞ · MemoryStore — the visitor's journey, recorded across the session.
// Lightweight (localStorage). Any KODEX page can record; the RETURN sequence
// reads it to build the visitor's unique specimen. Honest: if empty → curated.

const KEY = 'kx-journey';

const readRaw = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || 'null') || null; } catch (e) { return null; }
};
const writeRaw = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };

// record an event: { type:'view'|'effect'|'signal', work?, effect?, on? }
export function record(ev) {
  const j = readRaw() || { started: Date.now(), views: [], effects: [], signal: 0, cycle: 0 };
  if (ev.type === 'view' && ev.work) { if (j.views[j.views.length - 1] !== ev.work) j.views.push(ev.work); if (j.views.length > 64) j.views.shift(); }
  else if (ev.type === 'effect' && ev.effect) { j.effects.push(ev.effect); if (j.effects.length > 128) j.effects.shift(); }
  else if (ev.type === 'signal') { j.signal += 1; }
  else if (ev.type === 'cycle') { j.cycle += 1; }
  j.last = Date.now();
  writeRaw(j);
}

// derive the specimen from the journey (or a curated fallback)
export function readSpecimen(fallbackSeed) {
  const j = readRaw();
  const curated = !j || (j.views.length === 0 && j.effects.length === 0);
  const seedStr = (j && j.views.join('') + j.effects.join('')) || String(fallbackSeed || 'CURATED');
  let s = 0; for (let i = 0; i < seedStr.length; i++) s = (s * 31 + seedStr.charCodeAt(i)) >>> 0;
  const seedHex = '0x' + ((s >>> 8) & 0xffffff).toString(16).toUpperCase().padStart(6, '0');
  const uniqEff = j ? [...new Set(j.effects)] : [];
  const memory = j ? (j.views.length + j.effects.length + j.signal) : 0;
  const cycle = j ? Math.max(1, j.cycle + 1) : 1;
  const chirality = (s & 1) ? 1 : -1;
  const signal = j ? Math.min(1, (j.signal * 0.34) + (j.effects.length * 0.04)) : 0.25;
  // family from the most-visited theme (disco/tribe/achroma) or curated
  const lastWork = j && j.views.length ? j.views[j.views.length - 1] : '';
  const fam = /disco|D0/i.test(lastWork) ? 'DIS' : /013|tribe/i.test(lastWork) ? 'TRB' : 'ACH';
  const chir = chirality > 0 ? 'R' : 'L';
  const state = 'R10';
  const code = `KDX-${fam}-C${String(cycle).padStart(2, '0')}-${state}-${chir}-${seedHex.slice(2)}`;
  return {
    curated, seed: s, seedHex, code, cycle, chirality, memory, signal,
    visualChain: uniqEff, works: j ? j.views : [],
    lastWork: lastWork || '/img/kodex/works/bw-06.jpg',
  };
}
