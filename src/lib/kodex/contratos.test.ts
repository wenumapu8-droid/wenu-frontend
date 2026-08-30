/**
 * Tests del vocabulario canonico y la traduccion entre maquinas de estado.
 *
 * `contratos.ts` es el "vocabulario unico" que la biblia declara: tipos
 * SceneState, SignalName, KodexNode, SceneDefinition, MemoryEvent. Lo unico
 * ejecutable es `estadoCanonico`, que traduce del vocabulario de estado.ts
 * (idle/aware/locked/active/transitionOut) al de la biblia
 * (dormant/aware/resonant/mutated/remembered).
 *
 * Reglas:
 *
 *   C1 · estadoCanonico traduce los 5 estados de la Receta.
 *   C2 · locked y active caen los DOS en resonant (documentado como
 *        perdida de granularidad hacia el canon).
 *   C3 · La tabla CANONICO no deja ningun EstadoReceta sin traduccion.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estadoCanonico, type EstadoReceta, type SceneState } from './contratos.ts';

const RECETA_A_CANON: Array<[EstadoReceta, SceneState]> = [
  ['idle', 'dormant'],
  ['aware', 'aware'],
  ['locked', 'resonant'],
  ['active', 'resonant'],
  ['transitionOut', 'remembered'],
];

describe('contratos · vocabulario canonico', () => {
  it('C1 · estadoCanonico traduce los 5 estados de la Receta', () => {
    for (const [receta, canonico] of RECETA_A_CANON) {
      assert.equal(
        estadoCanonico(receta),
        canonico,
        `${receta} deberia traducir a ${canonico}`,
      );
    }
  });

  it('C2 · locked y active caen los dos en resonant', () => {
    // La P0 Scene Bible no distingue "enganchado" de "andando", asi que
    // la traduccion pierde esa granularidad HACIA el canon. Documentado en
    // el docstring de la constante CANONICO.
    assert.equal(estadoCanonico('locked'), 'resonant');
    assert.equal(estadoCanonico('active'), 'resonant');
  });

  it('C3 · idle -> dormant, no aware', () => {
    // Contraprueba: `idle` cae a `dormant`, no directo a `aware`, porque
    // la Receta idle es "sin senal" y dormant es "sin senal". El aware
    // canonico se reserva para cuando el sistema RECONOCE, no para el
    // limbo previo.
    assert.equal(estadoCanonico('idle'), 'dormant');
    assert.notEqual(estadoCanonico('idle'), 'aware');
  });

  it('todos los EstadoReceta tienen destino en el canon', () => {
    const todos: EstadoReceta[] = ['idle', 'aware', 'locked', 'active', 'transitionOut'];
    for (const e of todos) {
      const c = estadoCanonico(e);
      assert.ok(c, `${e} no tiene traduccion canonica`);
      // Ademas debe ser un SceneState valido.
      assert.ok(
        ['dormant', 'aware', 'resonant', 'mutated', 'remembered'].includes(c),
        `${e} traduce a "${c}" que no es un SceneState valido`,
      );
    }
  });

  it('la traduccion no usa `mutated` (concepto de la biblia sin correlato en la Receta)', () => {
    const traducciones = (['idle', 'aware', 'locked', 'active', 'transitionOut'] as EstadoReceta[])
      .map((e) => estadoCanonico(e));
    assert.ok(
      !traducciones.includes('mutated'),
      'ningun estado de la Receta deberia mapear a mutated -- ese concepto es exclusivo de la biblia',
    );
  });
});
