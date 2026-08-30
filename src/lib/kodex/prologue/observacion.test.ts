/**
 * PROLOGUE · Contrato causal de estados (KODEX-∞).
 *
 * Estos tests fijan las reglas que la maquina de observacion promete y que
 * las escenas siguientes van a heredar. Cambiar la tabla ALCANZABLE_CAUSAL
 * debe romper este suite a proposito: la razon de cada arista esta escrita
 * en el docstring de observacion.ts y en el propio contrato exportado.
 *
 * Reglas invariantes:
 *
 *   R1 · DORMANT solo puede pasar a AWARE. La primera senal es reconocimiento.
 *   R2 · DESCEND es terminal. Ninguna arista sale de el.
 *   R3 · INSPECT solo se alcanza desde estados donde ya hubo reconocimiento
 *        (AWARE, LOCK, TRACK). Nunca desde DORMANT ni desde DESCEND.
 *   R4 · Soltar (fijar('AWARE')) desde LOCK, TRACK o INSPECT es legal.
 *        Es la decision "presencia sobre gesto" congelada 2026-08-29.
 *   R5 · Todo estado no-terminal puede caer a DORMANT (salir del campo).
 *   R6 · Ningun estado tiene una auto-transicion en la tabla (fijar temprano
 *        corta si ya estas ahi, y ademas seria una senal semantica falsa).
 *   R7 · La tabla cubre EXACTAMENTE los seis estados del enum Estado.
 *        Ni mas ni menos: cualquier drift entre enum y tabla es un bug.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { ALCANZABLE_CAUSAL, type Estado } from './observacion.ts';

const TODOS_LOS_ESTADOS: Estado[] = [
  'DORMANT', 'AWARE', 'LOCK', 'TRACK', 'INSPECT', 'DESCEND',
];

describe('PROLOGUE · ALCANZABLE_CAUSAL', () => {
  it('R1 · DORMANT solo alcanza AWARE', () => {
    assert.deepEqual([...ALCANZABLE_CAUSAL.DORMANT], ['AWARE']);
  });

  it('R2 · DESCEND es terminal (ninguna arista de salida)', () => {
    assert.deepEqual([...ALCANZABLE_CAUSAL.DESCEND], []);
  });

  it('R3 · INSPECT solo se alcanza desde AWARE, LOCK, TRACK', () => {
    const desdeQuienEs = TODOS_LOS_ESTADOS.filter(
      (e) => ALCANZABLE_CAUSAL[e].includes('INSPECT'),
    );
    assert.deepEqual(desdeQuienEs.sort(), ['AWARE', 'LOCK', 'TRACK']);
  });

  it('R4 · soltar a AWARE es legal desde LOCK, TRACK e INSPECT', () => {
    assert.ok(ALCANZABLE_CAUSAL.LOCK.includes('AWARE'), 'LOCK -> AWARE debe ser legal');
    assert.ok(ALCANZABLE_CAUSAL.TRACK.includes('AWARE'), 'TRACK -> AWARE debe ser legal');
    assert.ok(ALCANZABLE_CAUSAL.INSPECT.includes('AWARE'), 'INSPECT -> AWARE debe ser legal');
  });

  it('R5 · todo estado no-terminal puede caer a DORMANT', () => {
    for (const e of TODOS_LOS_ESTADOS) {
      if (e === 'DORMANT' || e === 'DESCEND') continue;
      assert.ok(
        ALCANZABLE_CAUSAL[e].includes('DORMANT'),
        `${e} debe poder caer a DORMANT (salir del campo)`,
      );
    }
  });

  it('R6 · ningun estado tiene auto-transicion', () => {
    for (const e of TODOS_LOS_ESTADOS) {
      assert.ok(
        !ALCANZABLE_CAUSAL[e].includes(e),
        `${e} no debe listarse como destino de si mismo`,
      );
    }
  });

  it('R7 · la tabla cubre exactamente los seis estados del enum', () => {
    const clavesTabla = Object.keys(ALCANZABLE_CAUSAL).sort();
    const clavesEsperadas = [...TODOS_LOS_ESTADOS].sort();
    assert.deepEqual(clavesTabla, clavesEsperadas);
  });

  it('todos los destinos declarados son estados validos', () => {
    for (const [origen, destinos] of Object.entries(ALCANZABLE_CAUSAL)) {
      for (const d of destinos) {
        assert.ok(
          (TODOS_LOS_ESTADOS as string[]).includes(d),
          `${origen} declara destino "${d}" fuera del enum`,
        );
      }
    }
  });

  it('DESCEND es alcanzable desde todos los estados no-terminales', () => {
    for (const e of TODOS_LOS_ESTADOS) {
      if (e === 'DORMANT' || e === 'DESCEND') continue;
      assert.ok(
        ALCANZABLE_CAUSAL[e].includes('DESCEND'),
        `${e} deberia poder cruzar la pupila (${e} -> DESCEND)`,
      );
    }
    // DORMANT no puede porque primero debe reconocer (R1).
    assert.ok(
      !ALCANZABLE_CAUSAL.DORMANT.includes('DESCEND'),
      'DORMANT no puede saltar directo a DESCEND: primero AWARE',
    );
  });

  it('AWARE es la puerta: destino comun desde DORMANT y desde todos los sostenidos', () => {
    // DORMANT -> AWARE (R1).
    assert.ok(ALCANZABLE_CAUSAL.DORMANT.includes('AWARE'));
    // Todos los sostenidos vuelven a AWARE al soltar (R4).
    for (const e of ['LOCK', 'TRACK', 'INSPECT'] as Estado[]) {
      assert.ok(ALCANZABLE_CAUSAL[e].includes('AWARE'));
    }
    // AWARE no vuelve a AWARE (R6, coherencia).
    assert.ok(!ALCANZABLE_CAUSAL.AWARE.includes('AWARE'));
  });
});
