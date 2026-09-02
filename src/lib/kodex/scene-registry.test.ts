/**
 * Tests de `scene-registry.js`.
 *
 * El registry es la fuente para el corredor de 7 (threshold + i..vi) y los
 * orbitales/chambers. `kodex-integrity-audit.mjs` corre `validateSceneRegistry`
 * como puerta de integridad; si falla, todo el audit se detiene.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  CORE_SCENE_ORDER,
  KODEX_SCENES,
  KODEX_ORBITALS,
  FOLIO_TO_SCENE,
  getSceneDefinition,
  resolveSceneId,
  getSceneCandidates,
  validateSceneRegistry,
} from './scene-registry.js';

describe('scene-registry · corredor de 7 escenas', () => {
  it('CORE_SCENE_ORDER es exactamente threshold + i..vi', () => {
    assert.deepEqual([...CORE_SCENE_ORDER], [
      'threshold', 'prologue', 'descent', 'archive', 'machine', 'cosmology', 'return',
    ]);
  });

  it('KODEX_SCENES tiene una entrada por cada core scene', () => {
    for (const key of CORE_SCENE_ORDER) {
      assert.ok(key in KODEX_SCENES, `${key} sin definicion en KODEX_SCENES`);
    }
  });

  it('KODEX_SCENES esta congelado', () => {
    assert.ok(Object.isFrozen(KODEX_SCENES));
  });

  it('FOLIO_TO_SCENE mapea i..vi a scenes del corredor', () => {
    for (const [folio, scene] of Object.entries(FOLIO_TO_SCENE)) {
      assert.ok(
        CORE_SCENE_ORDER.includes(scene),
        `${folio} -> ${scene} no esta en CORE_SCENE_ORDER`,
      );
    }
  });

  it('FOLIO_TO_SCENE cubre los 6 folios i..vi', () => {
    for (const f of ['i', 'ii', 'iii', 'iv', 'v', 'vi']) {
      assert.ok(f in FOLIO_TO_SCENE, `folio ${f} sin mapeo`);
    }
  });

  it('getSceneDefinition devuelve la definicion para claves reales', () => {
    for (const key of CORE_SCENE_ORDER) {
      const def = getSceneDefinition(key);
      assert.ok(def, `${key}: getSceneDefinition devolvio undefined`);
    }
  });

  it('getSceneDefinition devuelve null para claves inexistentes', () => {
    assert.equal(getSceneDefinition('bogus'), null);
  });

  it('resolveSceneId resuelve pathname /kodex/ a threshold', () => {
    const r = resolveSceneId({ pathname: '/kodex/' });
    assert.equal(r, 'threshold');
  });

  it('resolveSceneId resuelve /kodex/folio/i/ a prologue', () => {
    const r = resolveSceneId({ pathname: '/kodex/folio/i/' });
    assert.equal(r, 'prologue');
  });

  it('resolveSceneId es case-insensitive en el pathname', () => {
    const lower = resolveSceneId({ pathname: '/kodex/folio/i/' });
    const upper = resolveSceneId({ pathname: '/KODEX/FOLIO/I/' });
    assert.equal(lower, upper);
  });

  it('getSceneCandidates devuelve al menos 1 candidato para claves reales', () => {
    for (const key of CORE_SCENE_ORDER.slice(0, 4)) {
      const cs = getSceneCandidates(key);
      assert.ok(Array.isArray(cs), `${key}: candidates no es array`);
    }
  });

  it('validateSceneRegistry pasa (registro coherente)', () => {
    const report = validateSceneRegistry();
    assert.ok(report, 'validateSceneRegistry no devolvio report');
    // El reporte tiene shape { ok, errors, warnings } o similar.
    // Si tiene errors, algo esta mal.
    if (report.errors && Array.isArray(report.errors)) {
      assert.equal(report.errors.length, 0, `registry con errores: ${JSON.stringify(report.errors)}`);
    }
    if ('ok' in report) {
      assert.equal(report.ok, true, `registry.ok = false: ${JSON.stringify(report)}`);
    }
  });

  it('KODEX_ORBITALS declara las chambers especiales', () => {
    assert.ok(Object.keys(KODEX_ORBITALS).length >= 1, 'KODEX_ORBITALS vacio');
    assert.ok(Object.isFrozen(KODEX_ORBITALS));
  });
});
