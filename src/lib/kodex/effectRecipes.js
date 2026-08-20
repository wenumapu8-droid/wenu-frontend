import { effectById } from './effectFoundry.js';

export const EFFECT_RECIPE_SCHEMA = 'kdx.effect-recipe.v1';

export function makeEffectRecipe({ effectId, params = {}, source = null, scene = null, note = '' } = {}) {
  const effect = effectById(effectId);
  if (!effect) throw new Error(`Unknown KODEX effect: ${effectId}`);
  const defaults = Object.fromEntries(effect.parameters.map((p) => [p.key, p.value]));
  const allowed = new Set(effect.parameters.map((p) => p.key));
  const cleaned = {};
  for (const [key, value] of Object.entries({ ...defaults, ...params })) {
    if (allowed.has(key) && Number.isFinite(Number(value))) cleaned[key] = Number(value);
  }
  return {
    schema: EFFECT_RECIPE_SCHEMA,
    effectId: effect.id,
    effectName: effect.name,
    family: effect.family,
    status: 'SELECTED',
    scene,
    params: cleaned,
    source,
    note,
    generatedAt: new Date().toISOString(),
  };
}

export function validateEffectRecipe(recipe) {
  if (!recipe || recipe.schema !== EFFECT_RECIPE_SCHEMA) return { ok: false, reason: 'schema' };
  const effect = effectById(recipe.effectId);
  if (!effect) return { ok: false, reason: 'effectId' };
  if (!recipe.params || typeof recipe.params !== 'object') return { ok: false, reason: 'params' };
  const allowed = new Set(effect.parameters.map((p) => p.key));
  for (const [key, value] of Object.entries(recipe.params)) {
    if (!allowed.has(key) || !Number.isFinite(Number(value))) return { ok: false, reason: `param:${key}` };
  }
  return { ok: true, effect };
}

// PROPOSED assignments only. They are production candidates, not canonical scene decisions.
export const EFFECT_SCENE_CANDIDATES = Object.freeze({
  THRESHOLD: [
    { effectId: 'KDX-FX-002', role: 'portal signal lattice', status: 'PROPOSED' },
    { effectId: 'KDX-FX-006', role: 'pre-form edge dissolution', status: 'PROPOSED' },
  ],
  PROLOGUE: [
    { effectId: 'KDX-FX-001', role: 'first decoded transmission', status: 'PROPOSED' },
  ],
  DESCENT: [
    { effectId: 'KDX-FX-003', role: 'matter losing print stability', status: 'PROPOSED' },
    { effectId: 'KDX-FX-006', role: 'descent toward pre-form', status: 'PROPOSED' },
  ],
  ARCHIVE: [
    { effectId: 'KDX-FX-005', role: 'memory retention / loss field', status: 'PROPOSED' },
    { effectId: 'KDX-FX-001', role: 'machine-readable archive fragments', status: 'PROPOSED' },
  ],
  MACHINE: [
    { effectId: 'KDX-FX-004', role: 'living reflective machine matter', status: 'PROPOSED' },
    { effectId: 'KDX-FX-003', role: 'procedural raster mutation', status: 'PROPOSED' },
  ],
  COSMOLOGY: [
    { effectId: 'KDX-FX-004', role: 'mineral / stellar reflective body', status: 'PROPOSED' },
    { effectId: 'KDX-FX-001', role: 'distributed luminous signal', status: 'PROPOSED' },
  ],
  RETURN: [
    { effectId: 'KDX-FX-006', role: 'dissolution and reconstruction', status: 'PROPOSED' },
    { effectId: 'KDX-FX-005', role: 'memory residue carried forward', status: 'PROPOSED' },
  ],
});
