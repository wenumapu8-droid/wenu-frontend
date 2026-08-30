/**
 * Tests de INTEGRIDAD de los SceneDefinition de la biblia.
 *
 * `src/lib/kodex/escenas/*.ts` declara las 6 escenas de la P0 Scene Bible:
 * 01_THRESHOLD, 02_OBSERVER, 03_HEART, 04_ALTAR, 05_TEMPLE, 06_RETURN.
 * Cada una es una `SceneDefinition` (definido en contratos.ts) y expone
 * el nodo canonico, los estados propios, su mapeo a SceneState canonico,
 * emits, renderer, reducedMotion y fallback.
 *
 * OJO: estas 6 no son las 7 escenas del CORREDOR (que son THRESHOLD,
 * PROLOGUE, DESCENT, ARCHIVE, MACHINE, COSMOLOGY, RETURN). Son las 6 de
 * la biblia -- algunas son corredor (THRESHOLD, RETURN) y otras son
 * chambers especiales (HEART, OBSERVER = KDX-CH-*).
 *
 * Reglas:
 *
 *   E1 · scene_id sigue el patron NN_NAME (ej. "01_THRESHOLD").
 *   E2 · node_id sigue KDX-SCN-NAME-NNN.
 *   E3 · states tiene al menos 1 elemento.
 *   E4 · canonical cubre TODOS los states declarados.
 *   E5 · canonical mapea solo a SceneState validos.
 *   E6 · renderer es uno de webgl/canvas/svg/dom.
 *   E7 · reducedMotion no vacio.
 *   E8 · fallback no vacio.
 *   E9 · emits no vacio.
 *   E10 · scene_ids son unicos entre las 6.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { SceneDefinition, SceneState } from '../contratos.ts';

import { THRESHOLD } from './threshold.ts';
import { OBSERVER } from './observer.ts';
import { HEART } from './heart.ts';
import { ALTAR } from './altar.ts';
import { TEMPLE } from './temple.ts';
import { RETURN } from './return.ts';

const ESCENAS: Array<{ nombre: string; def: SceneDefinition }> = [
  { nombre: 'THRESHOLD', def: THRESHOLD },
  { nombre: 'OBSERVER', def: OBSERVER },
  { nombre: 'HEART', def: HEART },
  { nombre: 'ALTAR', def: ALTAR },
  { nombre: 'TEMPLE', def: TEMPLE },
  { nombre: 'RETURN', def: RETURN },
];

const SCENE_STATES_VALIDOS: SceneState[] = [
  'dormant', 'aware', 'resonant', 'mutated', 'remembered',
];

describe('escenas · integridad de SceneDefinition', () => {
  it('E1 · scene_id sigue NN_NAME', () => {
    for (const { nombre, def } of ESCENAS) {
      assert.match(
        def.scene_id,
        /^0[1-6]_[A-Z]+$/,
        `${nombre}: scene_id "${def.scene_id}" rompe patron NN_NAME`,
      );
    }
  });

  it('E2 · node_id sigue KDX-SCN-NAME-NNN', () => {
    for (const { nombre, def } of ESCENAS) {
      assert.match(
        def.node_id,
        /^KDX-SCN-[A-Z]+-\d{3}$/,
        `${nombre}: node_id "${def.node_id}" rompe patron KDX-SCN-NAME-NNN`,
      );
    }
  });

  it('E3 · states tiene al menos 1 elemento', () => {
    for (const { nombre, def } of ESCENAS) {
      assert.ok(def.states.length >= 1, `${nombre}: states vacio`);
    }
  });

  it('E4 · canonical cubre TODOS los states declarados', () => {
    for (const { nombre, def } of ESCENAS) {
      for (const s of def.states) {
        assert.ok(
          s in def.canonical,
          `${nombre}: state "${s}" no tiene traduccion en canonical`,
        );
      }
    }
  });

  it('E5 · canonical mapea solo a SceneState validos', () => {
    for (const { nombre, def } of ESCENAS) {
      for (const [local, canon] of Object.entries(def.canonical)) {
        assert.ok(
          (SCENE_STATES_VALIDOS as string[]).includes(canon),
          `${nombre}: canonical["${local}"] = "${canon}" no es SceneState valido`,
        );
      }
    }
  });

  it('E6 · renderer es webgl/canvas/svg/dom', () => {
    for (const { nombre, def } of ESCENAS) {
      assert.ok(
        ['webgl', 'canvas', 'svg', 'dom'].includes(def.renderer),
        `${nombre}: renderer "${def.renderer}" no es valido`,
      );
    }
  });

  it('E7 · reducedMotion no vacio (regla dura "nunca nada")', () => {
    for (const { nombre, def } of ESCENAS) {
      assert.ok(
        def.reducedMotion.trim().length > 0,
        `${nombre}: reducedMotion vacio. Nunca "nada".`,
      );
    }
  });

  it('E8 · fallback no vacio (regla dura "nunca nada")', () => {
    for (const { nombre, def } of ESCENAS) {
      assert.ok(
        def.fallback.trim().length > 0,
        `${nombre}: fallback vacio. Nunca "nada".`,
      );
    }
  });

  it('E9 · emits no vacio', () => {
    for (const { nombre, def } of ESCENAS) {
      assert.ok(def.emits.length >= 1, `${nombre}: emits vacio`);
    }
  });

  it('E10 · scene_ids son unicos entre las 6', () => {
    const ids = ESCENAS.map((e) => e.def.scene_id);
    assert.equal(new Set(ids).size, ids.length, 'scene_id duplicado');
  });

  it('node_ids son unicos entre las 6', () => {
    const ids = ESCENAS.map((e) => e.def.node_id);
    assert.equal(new Set(ids).size, ids.length, 'node_id duplicado');
  });

  it('cada emit sigue snake_case (canon del blueprint)', () => {
    for (const { nombre, def } of ESCENAS) {
      for (const emit of def.emits) {
        assert.match(
          emit,
          /^[a-z_]+$/,
          `${nombre}: emit "${emit}" no es snake_case`,
        );
      }
    }
  });
});
