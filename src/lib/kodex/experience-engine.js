import { getSceneCandidates, getSceneDefinition } from './scene-registry.js';

export const EXPERIENCE_POLICY = Object.freeze({
  objective: ['continuity', 'meaningful-discovery', 'novelty', 'user-agency', 'memory'],
  prohibitedObjectives: ['time-on-site', 'compulsion', 'activity-score', 'spiritual-score'],
  interestFloor: 0.28,
  randomness: 'seeded-controlled',
  autoNavigate: false,
});

export function hashSeed(input = '') {
  let h = 2166136261;
  for (const ch of String(input)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(seed) {
  let x = seed || 0x9e3779b9;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return (x >>> 0) / 0x100000000;
}

export function rankSceneCandidates({ currentScene, history = [], world = null, seed = 'KODEX', allowOrbitals = false } = {}) {
  const current = getSceneDefinition(currentScene);
  if (!current || current.role !== 'core') return [];

  return getSceneCandidates(currentScene, { includeOrbitals: allowOrbitals }).map((candidate) => {
    const visited = history.filter((item) => item === candidate.key).length;
    const continuity = candidate.transitionClass === 'CANONICAL' ? 0.55 : 0.30;
    const novelty = visited === 0 ? 0.25 : Math.max(0, 0.12 - visited * 0.06);
    const affinity = world && candidate.worlds?.includes(world) ? 0.15 : 0;
    const repetitionPenalty = visited * 0.16;
    const jitter = unit(hashSeed(`${seed}:${currentScene}:${candidate.key}`)) * 0.05;
    const score = Math.max(0, Math.min(1, continuity + novelty + affinity + jitter - repetitionPenalty));

    return {
      key: candidate.key,
      id: candidate.id,
      role: candidate.role,
      transitionClass: candidate.transitionClass,
      score: Number(score.toFixed(4)),
      visited,
    };
  }).sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
}

export function recommendNextScene(input = {}) {
  const currentScene = input.currentScene || 'threshold';
  const ranked = rankSceneCandidates({ ...input, currentScene });
  const eligible = ranked.filter((item) => item.score >= EXPERIENCE_POLICY.interestFloor);
  const pool = eligible.slice(0, 3);
  let selected = pool[0] || null;

  if (pool.length > 1) {
    const total = pool.reduce((sum, item) => sum + item.score, 0);
    let roll = unit(hashSeed(`${input.seed || 'KODEX'}:${currentScene}:selection`)) * total;
    selected = pool[pool.length - 1];
    for (const item of pool) {
      roll -= item.score;
      if (roll <= 0) { selected = item; break; }
    }
  }

  if (!selected) {
    const fallbackKey = getSceneDefinition(currentScene)?.next?.[0] || 'threshold';
    const fallback = getSceneDefinition(fallbackKey);
    selected = fallback ? {
      key: fallback.key,
      id: fallback.id,
      role: fallback.role,
      transitionClass: 'ANCHOR_FALLBACK',
      score: 1,
      visited: 0,
    } : null;
  }

  return {
    selected,
    candidates: ranked,
    policy: EXPERIENCE_POLICY,
    reason: selected?.transitionClass === 'ANCHOR_FALLBACK'
      ? 'interest-floor-fallback'
      : 'seeded-ranked-candidate',
  };
}
