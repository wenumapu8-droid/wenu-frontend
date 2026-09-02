/**
 * Tests de `effectRecipes.js`.
 *
 * Fabrica y valida recetas de efectos. `makeEffectRecipe` toma un
 * effectId + params + contexto (scene, source, note) y produce una
 * receta canonica con timestamp. `validateEffectRecipe` verifica que
 * una receta guardada siga siendo procesable (schema, effect, params).
 *
 * Reglas:
 *
 *   F1 · schema es "kdx.effect-recipe.v1".
 *   F2 · makeEffectRecipe throw para effectId desconocido.
 *   F3 · makeEffectRecipe rellena defaults desde el efecto.
 *   F4 · makeEffectRecipe descarta params fuera del schema del efecto.
 *   F5 · makeEffectRecipe respeta scene/source/note.
 *   F6 · validateEffectRecipe rechaza schema equivocado.
 *   F7 · validateEffectRecipe rechaza effectId inexistente.
 *   F8 · validateEffectRecipe rechaza params invalidos.
 *   F9 · roundtrip make->validate es idempotente.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EFFECT_RECIPE_SCHEMA,
  makeEffectRecipe,
  validateEffectRecipe,
  EFFECT_SCENE_CANDIDATES,
} from './effectRecipes.js';
import { KODEX_EFFECTS } from './effectFoundry.js';

const PRIMER_EFECTO = KODEX_EFFECTS[0];

describe('effectRecipes · fabrica y validador de recetas', () => {
  it('F1 · schema es kdx.effect-recipe.v1', () => {
    assert.equal(EFFECT_RECIPE_SCHEMA, 'kdx.effect-recipe.v1');
  });

  it('F2 · makeEffectRecipe throw para effectId desconocido', () => {
    assert.throws(
      () => makeEffectRecipe({ effectId: 'KDX-FX-999' }),
      /Unknown KODEX effect/,
    );
  });

  it('makeEffectRecipe funciona con effectId real', () => {
    const r = makeEffectRecipe({ effectId: PRIMER_EFECTO.id });
    assert.equal(r.schema, EFFECT_RECIPE_SCHEMA);
    assert.equal(r.effectId, PRIMER_EFECTO.id);
    assert.equal(r.effectName, PRIMER_EFECTO.name);
    assert.equal(r.family, PRIMER_EFECTO.family);
    assert.equal(r.status, 'SELECTED');
  });

  it('F3 · makeEffectRecipe rellena defaults del efecto', () => {
    const r = makeEffectRecipe({ effectId: PRIMER_EFECTO.id });
    // Cada parametro del efecto deberia aparecer con SU valor default.
    for (const p of PRIMER_EFECTO.parameters) {
      assert.equal(
        r.params[p.key],
        Number(p.value),
        `${p.key}: default ${p.value} no aparece`,
      );
    }
  });

  it('F4 · makeEffectRecipe descarta params fuera del schema', () => {
    const r = makeEffectRecipe({
      effectId: PRIMER_EFECTO.id,
      params: { xxxNoExiste: 0.5, ...(PRIMER_EFECTO.parameters[0] ? { [PRIMER_EFECTO.parameters[0].key]: 0.9 } : {}) },
    });
    assert.ok(!('xxxNoExiste' in r.params), 'param invalido persistio');
    if (PRIMER_EFECTO.parameters[0]) {
      assert.equal(r.params[PRIMER_EFECTO.parameters[0].key], 0.9);
    }
  });

  it('makeEffectRecipe descarta valores no finitos (key sale del set)', () => {
    if (!PRIMER_EFECTO.parameters[0]) return;
    const key = PRIMER_EFECTO.parameters[0].key;
    const r = makeEffectRecipe({ effectId: PRIMER_EFECTO.id, params: { [key]: 'nope' } });
    // Override no-finito: se descarta el params E ignora el default (lo pisó).
    // La key queda fuera del set en vez de persistir 'nope' o volver al default.
    assert.equal(r.params[key], undefined);
  });

  it('F5 · makeEffectRecipe respeta scene/source/note', () => {
    const r = makeEffectRecipe({
      effectId: PRIMER_EFECTO.id,
      scene: 'ARCHIVE',
      source: '/foto.jpg',
      note: 'test note',
    });
    assert.equal(r.scene, 'ARCHIVE');
    assert.equal(r.source, '/foto.jpg');
    assert.equal(r.note, 'test note');
  });

  it('makeEffectRecipe agrega generatedAt como ISO string', () => {
    const r = makeEffectRecipe({ effectId: PRIMER_EFECTO.id });
    assert.match(r.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
  });

  it('F6 · validateEffectRecipe rechaza schema equivocado', () => {
    assert.deepEqual(
      validateEffectRecipe({ schema: 'otro' }),
      { ok: false, reason: 'schema' },
    );
    assert.deepEqual(validateEffectRecipe(null), { ok: false, reason: 'schema' });
    assert.deepEqual(validateEffectRecipe(undefined), { ok: false, reason: 'schema' });
  });

  it('F7 · validateEffectRecipe rechaza effectId inexistente', () => {
    const r = validateEffectRecipe({
      schema: EFFECT_RECIPE_SCHEMA,
      effectId: 'KDX-FX-999',
      params: {},
    });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'effectId');
  });

  it('F8 · validateEffectRecipe rechaza params invalidos', () => {
    const r = validateEffectRecipe({
      schema: EFFECT_RECIPE_SCHEMA,
      effectId: PRIMER_EFECTO.id,
      params: null,
    });
    assert.equal(r.ok, false);
    assert.equal(r.reason, 'params');
  });

  it('F9 · roundtrip make->validate es idempotente', () => {
    const recipe = makeEffectRecipe({
      effectId: PRIMER_EFECTO.id,
      scene: 'PROLOGUE',
    });
    const v = validateEffectRecipe(recipe);
    assert.equal(v.ok, true, `roundtrip fallo: ${JSON.stringify(v)}`);
    assert.equal(v.effect.id, PRIMER_EFECTO.id);
  });

  it('EFFECT_SCENE_CANDIDATES cubre las 7 escenas del corredor', () => {
    const esperadas = ['THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN'];
    for (const e of esperadas) {
      assert.ok(e in EFFECT_SCENE_CANDIDATES, `${e} sin candidatos`);
      assert.ok(
        Array.isArray(EFFECT_SCENE_CANDIDATES[e]) && EFFECT_SCENE_CANDIDATES[e].length >= 1,
        `${e}: candidatos vacio`,
      );
    }
  });

  it('cada candidato en EFFECT_SCENE_CANDIDATES declara effectId, role, status', () => {
    for (const [escena, candidatos] of Object.entries(EFFECT_SCENE_CANDIDATES)) {
      for (const c of candidatos) {
        assert.ok(c.effectId, `${escena}: candidato sin effectId`);
        assert.ok(c.role, `${escena}: ${c.effectId} sin role`);
        assert.equal(c.status, 'PROPOSED', `${escena}: ${c.effectId} status debe ser PROPOSED`);
      }
    }
  });
});
