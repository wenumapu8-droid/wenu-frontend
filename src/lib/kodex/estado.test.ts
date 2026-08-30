/**
 * Tests de la MAQUINA DE ESTADOS DE ESCENA (`estado.ts`).
 *
 * La clase `MaquinaEscena` es DOM-acoplada (querySelector, addEventListener,
 * dataset), asi que aca se prueba la parte PURA que gobierna las
 * transiciones: el ORDEN canonico, la tabla INTENSIDAD y la regla
 * `esAvanceLegal`. Esos tres son la promesa que la clase le hace a las
 * 40+ importaciones de este modulo.
 *
 * Reglas invariantes:
 *
 *   E1 · ORDEN tiene exactamente 5 estados en secuencia canonica.
 *   E2 · Solo hacia adelante -- nunca es legal ir a un estado igual o previo.
 *   E3 · Avanzar de idle a cualquier posterior es legal.
 *   E4 · Cada estado tiene un valor de intensidad 0..1, monotonicamente creciente
 *        HASTA `active`, y `transitionOut` baja al medio (es SALIDA, no cierre).
 *   E5 · COMPAS (fases temporales) es monotonicamente creciente en tiempo.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ORDEN, INTENSIDAD, esAvanceLegal, type Estado } from './estado.ts';

describe('MaquinaEscena · contrato de avance', () => {
  it('E1 · ORDEN es exactamente [idle, aware, locked, active, transitionOut]', () => {
    assert.deepEqual([...ORDEN], ['idle', 'aware', 'locked', 'active', 'transitionOut']);
  });

  it('E2 · avanzar hacia el mismo estado es ILEGAL', () => {
    for (const e of ORDEN) {
      assert.equal(esAvanceLegal(e, e), false, `${e} -> ${e} no debe ser legal`);
    }
  });

  it('E2 · retroceder es ILEGAL', () => {
    for (let i = 0; i < ORDEN.length; i++) {
      for (let j = 0; j < i; j++) {
        assert.equal(
          esAvanceLegal(ORDEN[i], ORDEN[j]),
          false,
          `${ORDEN[i]} -> ${ORDEN[j]} no debe ser legal (retrocede)`,
        );
      }
    }
  });

  it('E3 · avanzar hacia adelante es legal', () => {
    for (let i = 0; i < ORDEN.length; i++) {
      for (let j = i + 1; j < ORDEN.length; j++) {
        assert.equal(
          esAvanceLegal(ORDEN[i], ORDEN[j]),
          true,
          `${ORDEN[i]} -> ${ORDEN[j]} deberia ser legal`,
        );
      }
    }
  });

  it('estados invalidos son rechazados por esAvanceLegal', () => {
    assert.equal(esAvanceLegal('idle', 'inexistente' as Estado), false);
    assert.equal(esAvanceLegal('inexistente' as Estado, 'active'), false);
  });

  it('E4 · INTENSIDAD cubre exactamente los 5 estados', () => {
    assert.deepEqual(Object.keys(INTENSIDAD).sort(), [...ORDEN].sort());
  });

  it('E4 · idle=0 y active=1 (limites canonicos)', () => {
    assert.equal(INTENSIDAD.idle, 0);
    assert.equal(INTENSIDAD.active, 1);
  });

  it('E4 · intensidad crece monotonicamente hasta active', () => {
    const subida: Estado[] = ['idle', 'aware', 'locked', 'active'];
    for (let i = 1; i < subida.length; i++) {
      assert.ok(
        INTENSIDAD[subida[i]] > INTENSIDAD[subida[i - 1]],
        `intensidad de ${subida[i]} debe ser mayor que la de ${subida[i - 1]}`,
      );
    }
  });

  it('E4 · transitionOut baja de active (es salida, no cierre)', () => {
    assert.ok(
      INTENSIDAD.transitionOut < INTENSIDAD.active,
      'transitionOut deberia estar debajo de active',
    );
    assert.ok(
      INTENSIDAD.transitionOut > INTENSIDAD.idle,
      'transitionOut no deberia caer a idle (la escena sigue existiendo mientras sale)',
    );
  });

  it('todos los valores de intensidad estan en [0,1]', () => {
    for (const [estado, valor] of Object.entries(INTENSIDAD)) {
      assert.ok(valor >= 0 && valor <= 1, `intensidad ${estado} = ${valor} fuera de [0,1]`);
    }
  });
});
