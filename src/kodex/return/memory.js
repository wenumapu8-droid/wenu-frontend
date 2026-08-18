// KODEX −∞ · MemoryStore v2.
// Backward-compatible with the original kx-journey schema while adding a
// semantic memory graph: concepts, salience, recurrence, traces and edges.
// No personal data, pointer coordinates or inferred identity are stored.

import {
  KDX_CONCEPTS,
  canonicalConceptKey,
  clamp01,
  conceptStatus,
  conceptsForEvent,
  edgeKey,
} from '../memory/concepts.js';

export const KDX_MEMORY_KEY = 'kx-journey';
export const KDX_MEMORY_VERSION = 2;

const MAX_VIEWS = 64;
const MAX_EFFECTS = 128;
const MAX_EVENTS = 96;
const MAX_RECENT_CONCEPTS = 8;
const ASSOCIATION_WINDOW_MS = 15_000;
const ACTIVATION_TAU_MS = 90_000;
const SALIENCE_TAU_MS = 21 * 24 * 60 * 60 * 1000;

const nowMs = () => Date.now();
const numberOr = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const boundedArray = (value, max) => Array.isArray(value) ? value.slice(-max) : [];

const emptyConcepts = () => Object.fromEntries(
  Object.entries(KDX_CONCEPTS).map(([key, meta]) => [key, {
    id: meta.id,
    label: meta.label,
    activation: 0,
    salience: 0,
    recurrence: 0,
    dwell: 0,
    last: 0,
    status: 'LATENT',
  }]),
);

const createState = (started = nowMs()) => ({
  version: KDX_MEMORY_VERSION,
  started,
  last: started,
  views: [],
  effects: [],
  signal: 0,
  cycle: 0,
  events: [],
  concepts: emptyConcepts(),
  edges: {},
  recentConcepts: [],
  semanticLastDecay: started,
  metrics: { recalls: 0, latentRecovered: 0 },
});

const readRaw = () => {
  try { return JSON.parse(localStorage.getItem(KDX_MEMORY_KEY) || 'null') || null; }
  catch (_) { return null; }
};

const writeRaw = (state) => {
  try { localStorage.setItem(KDX_MEMORY_KEY, JSON.stringify(state)); }
  catch (_) {}
};

const hydrateConcept = (key, source = {}) => {
  const meta = KDX_CONCEPTS[key];
  const activation = clamp01(source.activation);
  const salience = clamp01(source.salience);
  return {
    id: meta.id,
    label: meta.label,
    activation,
    salience,
    recurrence: Math.max(0, Math.floor(numberOr(source.recurrence))),
    dwell: Math.max(0, numberOr(source.dwell)),
    last: Math.max(0, numberOr(source.last)),
    status: conceptStatus({ activation, salience }),
  };
};

const decaySemanticState = (state, at = nowMs()) => {
  const from = Math.min(at, Math.max(0, numberOr(state.semanticLastDecay, state.started || at)));
  const dt = Math.max(0, at - from);
  if (!dt) return false;

  const activationFactor = Math.exp(-dt / ACTIVATION_TAU_MS);
  const salienceFactor = Math.exp(-dt / SALIENCE_TAU_MS);
  let changed = false;

  for (const concept of Object.values(state.concepts || {})) {
    const nextActivation = clamp01(concept.activation * activationFactor);
    const nextSalience = clamp01(concept.salience * salienceFactor);
    const nextStatus = conceptStatus({ activation: nextActivation, salience: nextSalience });
    if (Math.abs(nextActivation - concept.activation) > 1e-8 || Math.abs(nextSalience - concept.salience) > 1e-8 || nextStatus !== concept.status) changed = true;
    concept.activation = nextActivation;
    concept.salience = nextSalience;
    concept.status = nextStatus;
  }

  state.semanticLastDecay = at;
  return changed;
};

const strengthenEdge = (state, a, b, strength, at) => {
  const key = edgeKey(a, b);
  if (!key) return;
  const [from, to] = key.split('::');
  const current = state.edges[key] || { from, to, weight: 0, count: 0, last: 0 };
  current.weight = clamp01(current.weight + 0.04 + clamp01(strength) * 0.12);
  current.count += 1;
  current.last = at;
  state.edges[key] = current;
};

const applySemanticEvent = (state, event, { trackEvent = true } = {}) => {
  const at = Math.max(0, numberOr(event.at, nowMs()));
  decaySemanticState(state, at);
  const activations = conceptsForEvent(event);
  if (!activations.length) return;

  const priorRecent = boundedArray(state.recentConcepts, MAX_RECENT_CONCEPTS)
    .filter((entry) => entry && canonicalConceptKey(entry.key) && at - numberOr(entry.at) <= ASSOCIATION_WINDOW_MS);

  const current = [];
  for (const { key, weight } of activations) {
    const concept = state.concepts[key] || hydrateConcept(key);
    const priorStatus = concept.status;
    const seenBefore = concept.last > 0;
    const recurrenceBoost = 1 + Math.min(5, concept.recurrence) * 0.08;
    const delta = clamp01(weight * recurrenceBoost);

    concept.activation = clamp01(concept.activation + delta);
    concept.salience = clamp01(concept.salience + delta * (1 - concept.salience) * 0.45);
    if (seenBefore) concept.recurrence += 1;
    concept.dwell += Math.max(0, numberOr(event.seconds));
    concept.last = at;
    concept.status = conceptStatus(concept);
    state.concepts[key] = concept;

    if ((priorStatus === 'TRACE' || priorStatus === 'LATENT') && (concept.status === 'RECORDED' || concept.status === 'ACTIVE') && seenBefore) {
      state.metrics.recalls += 1;
      if (priorStatus === 'LATENT') state.metrics.latentRecovered += 1;
    }
    current.push({ key, weight: delta, at });
  }

  const linked = new Set();
  for (let i = 0; i < current.length; i += 1) {
    for (let j = i + 1; j < current.length; j += 1) {
      const pair = edgeKey(current[i].key, current[j].key);
      if (!pair || linked.has(pair)) continue;
      linked.add(pair);
      strengthenEdge(state, current[i].key, current[j].key, (current[i].weight + current[j].weight) / 2, at);
    }
  }

  for (const recent of priorRecent) {
    for (const item of current) {
      const pair = edgeKey(recent.key, item.key);
      if (!pair || linked.has(pair)) continue;
      linked.add(pair);
      strengthenEdge(state, recent.key, item.key, item.weight * 0.75, at);
    }
  }

  const recentMap = new Map();
  [...priorRecent, ...current].forEach((entry) => recentMap.set(entry.key, { key: entry.key, at: entry.at }));
  state.recentConcepts = [...recentMap.values()].slice(-MAX_RECENT_CONCEPTS);

  if (trackEvent) {
    state.events.push({
      type: String(event.type || 'unknown'),
      at,
      concepts: current.map((item) => item.key),
    });
    if (state.events.length > MAX_EVENTS) state.events.splice(0, state.events.length - MAX_EVENTS);
  }
};

const migrate = (raw, at = nowMs()) => {
  if (!raw) return createState(at);

  const started = Math.max(0, numberOr(raw.started, at));
  const state = createState(started);
  state.last = Math.max(started, numberOr(raw.last, started));
  state.views = boundedArray(raw.views, MAX_VIEWS);
  state.effects = boundedArray(raw.effects, MAX_EFFECTS);
  state.signal = Math.max(0, numberOr(raw.signal));
  state.cycle = Math.max(0, Math.floor(numberOr(raw.cycle)));

  if (raw.version === KDX_MEMORY_VERSION) {
    for (const key of Object.keys(KDX_CONCEPTS)) state.concepts[key] = hydrateConcept(key, raw.concepts?.[key]);
    state.events = boundedArray(raw.events, MAX_EVENTS).map((event) => ({
      type: String(event?.type || 'unknown'),
      at: Math.max(0, numberOr(event?.at)),
      concepts: boundedArray(event?.concepts, 8).map(canonicalConceptKey).filter(Boolean),
    }));
    state.edges = {};
    for (const edge of Object.values(raw.edges || {})) {
      const key = edgeKey(edge?.from, edge?.to);
      if (!key) continue;
      const [from, to] = key.split('::');
      state.edges[key] = {
        from,
        to,
        weight: clamp01(edge.weight),
        count: Math.max(0, Math.floor(numberOr(edge.count))),
        last: Math.max(0, numberOr(edge.last)),
      };
    }
    state.recentConcepts = boundedArray(raw.recentConcepts, MAX_RECENT_CONCEPTS)
      .map((entry) => ({ key: canonicalConceptKey(entry?.key), at: Math.max(0, numberOr(entry?.at)) }))
      .filter((entry) => entry.key);
    state.semanticLastDecay = Math.max(started, numberOr(raw.semanticLastDecay, state.last));
    state.metrics = {
      recalls: Math.max(0, Math.floor(numberOr(raw.metrics?.recalls))),
      latentRecovered: Math.max(0, Math.floor(numberOr(raw.metrics?.latentRecovered))),
    };
    decaySemanticState(state, at);
    return state;
  }

  // v1 → v2 migration: replay only the already-stored public interaction types.
  // Timestamps are synthetic and ordered; they are not used for identity.
  let replayAt = started;
  for (const work of state.views) applySemanticEvent(state, { type: 'view', work, at: replayAt += 1000 }, { trackEvent: true });
  for (const effect of state.effects) applySemanticEvent(state, { type: 'effect', effect, at: replayAt += 1000 }, { trackEvent: true });
  for (let i = 0; i < Math.min(12, state.signal); i += 1) applySemanticEvent(state, { type: 'signal', at: replayAt += 1000 }, { trackEvent: true });
  for (let i = 0; i < Math.min(16, state.cycle); i += 1) applySemanticEvent(state, { type: 'cycle', at: replayAt += 1000 }, { trackEvent: true });
  state.last = Math.max(state.last, replayAt);
  state.semanticLastDecay = replayAt;
  decaySemanticState(state, at);
  return state;
};

const readState = () => {
  const raw = readRaw();
  const state = migrate(raw);
  if (!raw || raw.version !== KDX_MEMORY_VERSION) writeRaw(state);
  return state;
};

const hash32 = (input) => {
  let h = 2166136261;
  const text = String(input || '');
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
};

const eventSignature = (state, fallbackSeed) => {
  const events = (state.events || []).map((event) => `${event.type}:${(event.concepts || []).join('+')}`).join('|');
  return [
    events,
    (state.views || []).join('|'),
    (state.effects || []).join('|'),
    `signal:${state.signal || 0}`,
    `cycle:${state.cycle || 0}`,
    String(fallbackSeed || 'CURATED'),
  ].join('||');
};

const traceFromState = (state, fallbackSeed) => {
  const ranked = Object.entries(state.concepts)
    .map(([key, concept]) => ({
      key,
      id: concept.id,
      status: concept.status,
      activation: concept.activation,
      salience: concept.salience,
      recurrence: concept.recurrence,
      score: clamp01(concept.salience * 0.72 + concept.activation * 0.28),
    }))
    .sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));

  const edges = Object.values(state.edges || {}).sort((a, b) => b.weight - a.weight || b.count - a.count);
  const path = [];
  for (const event of state.events || []) {
    for (const key of event.concepts || []) {
      if (path[path.length - 1] !== key) path.push(key);
    }
  }

  const C = state.concepts;
  const recurrenceTotal = Object.values(C).reduce((sum, concept) => sum + concept.recurrence, 0);
  const seed = hash32(eventSignature(state, fallbackSeed));
  const semanticEvidence = ranked.some((concept) => concept.salience > 0.01 || concept.activation > 0.01);
  const legacyEvidence = state.views.length > 0 || state.effects.length > 0 || state.signal > 0 || state.cycle > 0;

  return {
    version: KDX_MEMORY_VERSION,
    curated: !(semanticEvidence || legacyEvidence),
    seed,
    seedHex: '0x' + ((seed >>> 8) & 0xffffff).toString(16).toUpperCase().padStart(6, '0'),
    dominantConcept: ranked[0]?.key || null,
    concepts: ranked,
    dominantPath: path.slice(-8),
    strongestAssociation: edges[0] ? {
      from: edges[0].from,
      to: edges[0].to,
      weight: edges[0].weight,
      count: edges[0].count,
    } : null,
    recurrences: recurrenceTotal,
    recalls: state.metrics.recalls,
    latentRecovered: state.metrics.latentRecovered,
    visualVector: {
      density: clamp01((C.MEMORY.salience + C.MATTER.salience) * 0.5),
      symmetry: clamp01(C.OBSERVER.salience * 0.7 + C.RETURN.salience * 0.3),
      persistence: clamp01(C.MEMORY.salience),
      instability: clamp01(C.MATTER.activation * 0.7 + (1 - C.SIGNAL.salience) * 0.3),
      signal: clamp01(C.SIGNAL.salience),
      recurrence: clamp01(recurrenceTotal / 10),
      depth: clamp01(C.RETURN.salience * 0.6 + C.MEMORY.salience * 0.4),
    },
  };
};

// Backward-compatible event recorder. Existing KODEX callers keep working.
export function record(event = {}) {
  const state = readState();
  const at = nowMs();
  const ev = { ...event, at };

  if (ev.type === 'view' && ev.work) {
    if (state.views[state.views.length - 1] !== ev.work) state.views.push(ev.work);
    if (state.views.length > MAX_VIEWS) state.views.shift();
  } else if (ev.type === 'effect' && ev.effect) {
    state.effects.push(ev.effect);
    if (state.effects.length > MAX_EFFECTS) state.effects.shift();
  } else if (ev.type === 'signal') {
    state.signal += 1;
  } else if (ev.type === 'cycle') {
    state.cycle += 1;
  }

  applySemanticEvent(state, ev);
  state.last = at;
  writeRaw(state);
  return state;
}

export function observeConcept(concept, options = {}) {
  const key = canonicalConceptKey(concept);
  if (!key) return null;
  return record({
    type: options.type === 'dwell' ? 'dwell' : 'concept',
    concept: key,
    strength: options.strength,
    seconds: options.seconds,
  });
}

export function readMemoryTrace(fallbackSeed) {
  const state = readState();
  const changed = decaySemanticState(state, nowMs());
  if (changed) writeRaw(state);
  return traceFromState(state, fallbackSeed);
}

// Existing RETURN contract, enriched with semantic memory without breaking fields.
export function readSpecimen(fallbackSeed) {
  const state = readState();
  const changed = decaySemanticState(state, nowMs());
  if (changed) writeRaw(state);
  const trace = traceFromState(state, fallbackSeed);
  const seed = trace.seed;
  const seedHex = trace.seedHex;
  const uniqEff = [...new Set(state.effects)];
  const memory = state.views.length + state.effects.length + state.signal;
  const cycle = Math.max(1, state.cycle + 1);
  const chirality = (seed & 1) ? 1 : -1;
  const legacySignal = Math.min(1, (state.signal * 0.34) + (state.effects.length * 0.04));
  const signal = clamp01(Math.max(legacySignal, trace.visualVector.signal));
  const lastWork = state.views.length ? state.views[state.views.length - 1] : '';
  const fam = /disco|D0/i.test(lastWork) ? 'DIS' : /013|tribe/i.test(lastWork) ? 'TRB' : 'ACH';
  const chir = chirality > 0 ? 'R' : 'L';
  const status = 'R10';
  const code = `KDX-${fam}-C${String(cycle).padStart(2, '0')}-${status}-${chir}-${seedHex.slice(2)}`;

  return {
    curated: trace.curated,
    seed,
    seedHex,
    code,
    cycle,
    chirality,
    memory,
    signal,
    visualChain: uniqEff,
    works: state.views,
    lastWork: lastWork || '/img/kodex/works/bw-06.jpg',
    memoryTrace: trace,
  };
}

export function clearMemory() {
  try { localStorage.removeItem(KDX_MEMORY_KEY); }
  catch (_) {}
}
