// KDX-FILM-001: single source of truth for narrative timing.
// Pure ESM: usable in Astro, browser runtime and node:test.
export const SIGNAL_THRESHOLD = Object.freeze({
  id: 'KDX-FILM-001',
  title: 'SIGNAL_THRESHOLD',
  version: '0.2.0',
  total: 14,
  stages: Object.freeze([
    Object.freeze({ id: 'VOID', start: 0, end: 2, note: 'Silencio / potencial' }),
    Object.freeze({ id: 'SIGNAL', start: 2, end: 5, note: 'Primera transmisión' }),
    Object.freeze({ id: 'FOCUS', start: 5, end: 8, note: 'Convergencia' }),
    Object.freeze({ id: 'LOCK', start: 8, end: 10, note: 'Reconocimiento' }),
    Object.freeze({ id: 'OPEN / CROSSING', start: 10, end: 14, note: 'Cruzar el umbral' }),
  ]),
});
export function validateRecipe(recipe) {
  if (!recipe || !Number.isFinite(recipe.total) || recipe.total <= 0 || !Array.isArray(recipe.stages) || !recipe.stages.length) return false;
  let end = 0;
  const ids = new Set();
  for (const stage of recipe.stages) {
    if (typeof stage.id !== 'string' || !stage.id || ids.has(stage.id) || stage.start !== end || !(stage.end > stage.start) || !Number.isFinite(stage.end)) return false;
    ids.add(stage.id);
    end = stage.end;
  }
  return end === recipe.total;
}
export function clampTime(time, recipe = SIGNAL_THRESHOLD) {
  return Math.max(0, Math.min(recipe.total, Number.isFinite(time) ? time : 0));
}
export function stageIndexAt(time, recipe = SIGNAL_THRESHOLD) {
  const t = clampTime(time, recipe);
  const index = recipe.stages.findIndex((stage) => t < stage.end);
  return index === -1 ? recipe.stages.length - 1 : index;
}
export function frameAt(time, recipe = SIGNAL_THRESHOLD, reducedMotion = false) {
  const t = clampTime(time, recipe);
  const index = stageIndexAt(t, recipe);
  const stage = recipe.stages[index];
  const phase = Math.max(0, Math.min(1, (t - stage.start) / (stage.end - stage.start)));
  let energy = 0, progress = 0, open = 0;
  if (index === 1) { energy = .2 + .65 * phase; progress = phase * .3; }
  if (index === 2) { energy = .85; progress = .3 + .4 * phase; }
  if (index === 3) { energy = 1; progress = .7 + .2 * phase; }
  if (index === 4) { energy = 1 - phase * .5; progress = .9 + phase * .5; open = phase; }
  if (reducedMotion) { energy = index === 0 ? 0 : 1; progress = index / 4; open = index === 4 ? 1 : 0; }
  return { time: t, index, stage, phase, energy, progress, open };
}
