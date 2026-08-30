/**
 * Tests de `kitRegistry.js` (JS puro, indice de kits reusables).
 *
 * "Un KIT = MODULO + CONTRATO + EJEMPLO + FALLBACK/ACCEPTANCE, y se indexa
 * aca. REGLA DURA (COWORK): REUSAR, NUNCA REINVENTAR."
 *
 * El registry es la fuente para saber que componentes viven donde. Si el
 * schema cambia sin actualizar el consumidor, o si una entrada pierde
 * una pieza obligatoria, el sistema de reuso queda mudo.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  KIT_REGISTRY_SCHEMA,
  KODEX_EFFECT_REGISTRY,
  KODEX_SCENE_KIT_CANDIDATES,
  kitIndex,
  kitIsUsable,
} from './kitRegistry.js';

describe('kitRegistry · indice de componentes reusables', () => {
  it('el schema es kdx.kit-registry.v1', () => {
    assert.equal(KIT_REGISTRY_SCHEMA, 'kdx.kit-registry.v1');
  });

  it('KODEX_EFFECT_REGISTRY tiene al menos 1 efecto', () => {
    assert.ok(
      KODEX_EFFECT_REGISTRY.length >= 1,
      'ningun efecto declarado en el foundry',
    );
  });

  it('cada efecto declara id, slug, name, family, status, scenes, purpose', () => {
    for (const e of KODEX_EFFECT_REGISTRY) {
      for (const k of ['id', 'slug', 'name', 'family', 'status', 'scenes', 'purpose']) {
        assert.ok(e[k], `efecto sin ${k}: ${JSON.stringify(e).slice(0, 100)}`);
      }
    }
  });

  it('ids siguen KDX-FX-NNN', () => {
    for (const e of KODEX_EFFECT_REGISTRY) {
      assert.match(e.id, /^KDX-FX-\d{3}$/, `id "${e.id}" rompe patron`);
    }
  });

  it('ids son unicos entre efectos', () => {
    const ids = KODEX_EFFECT_REGISTRY.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, 'id duplicado en efectos');
  });

  it('scenes de cada efecto es un array', () => {
    for (const e of KODEX_EFFECT_REGISTRY) {
      assert.ok(Array.isArray(e.scenes), `${e.id}: scenes no es array`);
    }
  });

  it('kitIndex() devuelve schema, components, effects, sceneCandidates', () => {
    const idx = kitIndex();
    assert.equal(idx.schema, KIT_REGISTRY_SCHEMA);
    assert.ok(idx.components, 'kitIndex sin components');
    assert.ok(idx.effects, 'kitIndex sin effects');
    assert.ok(idx.sceneCandidates, 'kitIndex sin sceneCandidates');
  });

  it('kitIsUsable reporta ok:true para ids reales IMPLEMENTED', () => {
    for (const e of KODEX_EFFECT_REGISTRY) {
      if (e.status === 'IMPLEMENTED') {
        const r = kitIsUsable(e.id);
        assert.equal(r.ok, true, `${e.id} IMPLEMENTED no reporta ok:true (${JSON.stringify(r)})`);
      }
    }
  });

  it('kitIsUsable reporta ok:false con razon para id inexistente', () => {
    const r = kitIsUsable('KDX-FX-999');
    assert.equal(r.ok, false);
    assert.ok(r.reason, 'ok:false deberia venir con reason');
    assert.equal(r.effectId, 'KDX-FX-999');
  });

  it('KODEX_SCENE_KIT_CANDIDATES esta congelado', () => {
    assert.ok(Object.isFrozen(KODEX_SCENE_KIT_CANDIDATES));
  });

  it('KODEX_EFFECT_REGISTRY esta congelado', () => {
    assert.ok(Object.isFrozen(KODEX_EFFECT_REGISTRY));
  });
});
