/**
 * Tests de `effectFoundry.js`.
 *
 * El foundry declara los efectos KDX-FX que las escenas pueden usar,
 * con sus familias, status, escenas candidatas y parametros. Es la
 * fuente de KODEX_EFFECT_REGISTRY (via kitRegistry.js). Si un efecto
 * declara un parametro con min > max o value fuera de rango, el UI de
 * ajuste se rompe silenciosamente en el navegador -- estos tests lo
 * atrapan en el build.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  EFFECT_FOUNDRY_VERSION,
  EFFECT_STATUSES,
  EFFECT_FAMILIES,
  RUNTIME_PARAMETER_MAP,
  KODEX_EFFECTS,
  effectById,
} from './effectFoundry.js';

describe('effectFoundry · declaracion de efectos KDX-FX', () => {
  it('EFFECT_FOUNDRY_VERSION es una string semver-like', () => {
    assert.match(EFFECT_FOUNDRY_VERSION, /^\d+\.\d+\.\d+$/);
  });

  it('KODEX_EFFECTS tiene al menos 1 efecto', () => {
    assert.ok(KODEX_EFFECTS.length >= 1);
  });

  it('KODEX_EFFECTS esta congelado (immutable)', () => {
    assert.ok(Object.isFrozen(KODEX_EFFECTS));
  });

  it('ids son unicos y siguen KDX-FX-NNN', () => {
    const ids = KODEX_EFFECTS.map((e) => e.id);
    assert.equal(new Set(ids).size, ids.length, 'id duplicado');
    for (const id of ids) {
      assert.match(id, /^KDX-FX-\d{3}$/, `id "${id}" rompe patron`);
    }
  });

  it('slugs son unicos y kebab-case', () => {
    const slugs = KODEX_EFFECTS.map((e) => e.slug);
    assert.equal(new Set(slugs).size, slugs.length, 'slug duplicado');
    for (const s of slugs) {
      assert.match(s, /^[a-z0-9]+(-[a-z0-9]+)*$/, `slug "${s}" no es kebab-case`);
    }
  });

  it('cada efecto declara family y esta en EFFECT_FAMILIES', () => {
    for (const e of KODEX_EFFECTS) {
      assert.ok(EFFECT_FAMILIES.includes(e.family), `${e.id}: family "${e.family}" fuera del enum`);
    }
  });

  it('cada efecto declara status y esta en EFFECT_STATUSES', () => {
    for (const e of KODEX_EFFECTS) {
      assert.ok(EFFECT_STATUSES.includes(e.status), `${e.id}: status "${e.status}" fuera del enum`);
    }
  });

  it('cada efecto declara scenes como array de strings', () => {
    for (const e of KODEX_EFFECTS) {
      assert.ok(Array.isArray(e.scenes), `${e.id}: scenes no es array`);
      for (const s of e.scenes) {
        assert.equal(typeof s, 'string', `${e.id}: scene no es string`);
      }
    }
  });

  it('parametros: min < max, step > 0, value en [min,max]', () => {
    for (const e of KODEX_EFFECTS) {
      for (const p of e.parameters) {
        assert.ok(p.min < p.max, `${e.id}/${p.key}: min ${p.min} no < max ${p.max}`);
        assert.ok(p.step > 0, `${e.id}/${p.key}: step ${p.step} debe ser > 0`);
        assert.ok(
          p.value >= p.min && p.value <= p.max,
          `${e.id}/${p.key}: value ${p.value} fuera de [${p.min}, ${p.max}]`,
        );
      }
    }
  });

  it('parametros: keys son unicas dentro de cada efecto', () => {
    for (const e of KODEX_EFFECTS) {
      const keys = e.parameters.map((p) => p.key);
      assert.equal(new Set(keys).size, keys.length, `${e.id}: parameter key duplicado`);
    }
  });

  it('effectById devuelve el efecto para ids reales', () => {
    for (const e of KODEX_EFFECTS) {
      assert.equal(effectById(e.id), e);
    }
  });

  it('effectById devuelve null para id inexistente', () => {
    assert.equal(effectById('KDX-FX-999'), null);
    assert.equal(effectById('bogus'), null);
  });

  it('RUNTIME_PARAMETER_MAP esta congelado', () => {
    assert.ok(Object.isFrozen(RUNTIME_PARAMETER_MAP));
  });

  it('RUNTIME_PARAMETER_MAP tiene mappings canonicos', () => {
    // Basic sanity: pointer y focus estan mapeados.
    assert.ok('pointer.x' in RUNTIME_PARAMETER_MAP);
    assert.ok('pointer.y' in RUNTIME_PARAMETER_MAP);
    assert.ok('focus' in RUNTIME_PARAMETER_MAP);
  });

  it('EFFECT_FAMILIES tiene las 6 familias declaradas', () => {
    assert.equal(EFFECT_FAMILIES.length, 6);
    for (const f of ['SIGNAL', 'MEMORY', 'MATTER', 'SPACE', 'MUTATION', 'RETURN']) {
      assert.ok(EFFECT_FAMILIES.includes(f), `familia canonica ${f} ausente`);
    }
  });

  it('EFFECT_STATUSES incluye IMPLEMENTED y DEPRECATED', () => {
    assert.ok(EFFECT_STATUSES.includes('IMPLEMENTED'));
    assert.ok(EFFECT_STATUSES.includes('DEPRECATED'));
  });
});
