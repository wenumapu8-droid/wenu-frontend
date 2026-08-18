// KODEX −∞ · semantic memory vocabulary.
// This is a computational/artistic translation, not a biological brain model.

export const KDX_CONCEPTS = Object.freeze({
  SIGNAL: { id: 'CX-001', label: 'SIGNAL' },
  MATTER: { id: 'CX-002', label: 'MATTER' },
  MEMORY: { id: 'CX-003', label: 'MEMORY' },
  OBSERVER: { id: 'CX-004', label: 'OBSERVER' },
  RETURN: { id: 'CX-005', label: 'RETURN' },
});

export const KDX_MEMORY_STATES = Object.freeze(['ACTIVE', 'RECORDED', 'TRACE', 'LATENT']);

export const KDX_EVENT_WEIGHTS = Object.freeze({
  view: 0.08,
  signal: 0.30,
  effect: 0.16,
  cycle: 0.30,
  interaction: 0.25,
  dwell: 0.12,
});

export const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

export function canonicalConceptKey(value) {
  const key = String(value || '').trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(KDX_CONCEPTS, key) ? key : null;
}

export function conceptStatus({ activation = 0, salience = 0 } = {}) {
  if (activation >= 0.35) return 'ACTIVE';
  if (salience >= 0.28) return 'RECORDED';
  if (salience >= 0.08) return 'TRACE';
  return 'LATENT';
}

export function dwellWeight(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  return clamp01(1 - Math.exp(-safeSeconds / 6));
}

const add = (map, key, weight) => {
  const concept = canonicalConceptKey(key);
  if (!concept) return;
  map.set(concept, clamp01((map.get(concept) || 0) + weight));
};

export function conceptsForEvent(event = {}) {
  const out = new Map();
  const type = String(event.type || '').toLowerCase();

  if (type === 'view') {
    add(out, 'OBSERVER', KDX_EVENT_WEIGHTS.view);
    const target = String(event.work || event.route || '').toLowerCase();

    if (/\/kodex\/?(?:#.*)?$/.test(target)) {
      add(out, 'SIGNAL', 0.12);
      add(out, 'MEMORY', 0.10);
    }
    if (target.includes('archive')) {
      add(out, 'MEMORY', 0.18);
      add(out, 'MATTER', 0.08);
    }
    if (target.includes('machine') || target.includes('/lab')) {
      add(out, 'MATTER', 0.15);
      add(out, 'SIGNAL', 0.12);
    }
    if (target.includes('cosmology')) {
      add(out, 'SIGNAL', 0.14);
      add(out, 'MEMORY', 0.10);
    }
    if (target.includes('return')) {
      add(out, 'RETURN', 0.22);
      add(out, 'MEMORY', 0.12);
    }
  }

  if (type === 'signal') add(out, 'SIGNAL', KDX_EVENT_WEIGHTS.signal);

  if (type === 'effect') {
    const effect = String(event.effect || '').toLowerCase();
    if (effect.includes('mirror')) add(out, 'OBSERVER', 0.14);
    if (effect.includes('distort')) add(out, 'MATTER', 0.18);
    if (effect.includes('color')) add(out, 'SIGNAL', 0.16);
    if (effect.includes('feedback')) add(out, 'MEMORY', 0.20);
  }

  if (type === 'cycle') {
    add(out, 'RETURN', KDX_EVENT_WEIGHTS.cycle);
    add(out, 'MEMORY', 0.16);
  }

  if (type === 'dwell') {
    const key = canonicalConceptKey(event.concept) || 'OBSERVER';
    const weight = dwellWeight(event.seconds);
    add(out, key, KDX_EVENT_WEIGHTS.dwell * weight);
    if (key !== 'OBSERVER') add(out, 'OBSERVER', 0.04 * weight);
  }

  if (type === 'concept') {
    const key = canonicalConceptKey(event.concept);
    if (key) {
      const base = event.strength == null ? KDX_EVENT_WEIGHTS.interaction : clamp01(event.strength);
      const dwell = event.seconds == null ? 1 : Math.max(0.25, dwellWeight(event.seconds));
      add(out, key, base * dwell);
    }
  }

  return [...out.entries()].map(([key, weight]) => ({ key, weight }));
}

export function edgeKey(a, b) {
  const ka = canonicalConceptKey(a);
  const kb = canonicalConceptKey(b);
  if (!ka || !kb || ka === kb) return null;
  return [ka, kb].sort().join('::');
}
