/**
 * Tests de la constante FASES de `archivo.ts`.
 *
 * Los 4 estados del archivo (E00 → T01 → M11 → R10) son el eje de la
 * PERILLA -- decision del visitante, se ve. El eje del PULSO
 * (idle/aware/locked/active) lo lleva `estado.ts` y avanza solo con la
 * presencia. Confundirlos era la tentacion facil que el docstring
 * declara evitada.
 *
 * El valor de cada fase alimenta `u_state` del shader y el preset del
 * audio: imagen y sonido cambian con el MISMO numero -- definicion de
 * instrumento del proyecto. Un valor mal calibrado se propaga en dos
 * capas a la vez y es dificil de rastrear despues.
 *
 * Reglas:
 *
 *   A1 · FASES tiene exactamente 4 elementos en orden canonico.
 *   A2 · claves son E00, T01, M11, R10.
 *   A3 · nombres son EXCAVATION, TRANSMUTATION, MANIFESTATION, RETURN.
 *   A4 · valor de cada fase en [0,1].
 *   A5 · E00 es la mas baja (excavation empieza).
 *   A6 · M11 es la mas alta (manifestation es el pico).
 *   A7 · R10 baja de M11 pero queda por encima de E00
 *        (el archivo se asienta, no retrocede a excavar).
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FASES, type ClaveArchivo } from './archivo.ts';

const CLAVES_ESPERADAS: ClaveArchivo[] = ['E00', 'T01', 'M11', 'R10'];
const NOMBRES_ESPERADOS = ['EXCAVATION', 'TRANSMUTATION', 'MANIFESTATION', 'RETURN'];

describe('archivo · las 4 fases del recorrido', () => {
  it('A1 · FASES tiene 4 elementos', () => {
    assert.equal(FASES.length, 4);
  });

  it('A2 · claves son E00 → T01 → M11 → R10', () => {
    assert.deepEqual(FASES.map((f) => f.clave), CLAVES_ESPERADAS);
  });

  it('A3 · nombres canonicos', () => {
    assert.deepEqual(FASES.map((f) => f.nombre), NOMBRES_ESPERADOS);
  });

  it('A4 · valor de cada fase en [0,1]', () => {
    for (const f of FASES) {
      assert.ok(f.valor >= 0 && f.valor <= 1, `${f.clave}: valor ${f.valor} fuera de [0,1]`);
    }
  });

  it('A5 · E00 es la mas baja (excavation empieza)', () => {
    const e00 = FASES.find((f) => f.clave === 'E00')!;
    for (const otra of FASES.filter((f) => f.clave !== 'E00')) {
      assert.ok(
        e00.valor < otra.valor,
        `E00 (${e00.valor}) debe ser menor que ${otra.clave} (${otra.valor})`,
      );
    }
  });

  it('A6 · M11 es la mas alta (manifestation es el pico)', () => {
    const m11 = FASES.find((f) => f.clave === 'M11')!;
    for (const otra of FASES.filter((f) => f.clave !== 'M11')) {
      assert.ok(
        m11.valor > otra.valor,
        `M11 (${m11.valor}) debe ser mayor que ${otra.clave} (${otra.valor})`,
      );
    }
  });

  it('A7 · R10 baja de M11 pero queda por encima de E00', () => {
    const r10 = FASES.find((f) => f.clave === 'R10')!;
    const m11 = FASES.find((f) => f.clave === 'M11')!;
    const e00 = FASES.find((f) => f.clave === 'E00')!;
    assert.ok(r10.valor < m11.valor, 'R10 debe estar por debajo de M11 (asentar, no repetir el pico)');
    assert.ok(r10.valor > e00.valor, 'R10 debe estar por encima de E00 (no retrocede a excavar)');
  });

  it('valores tienen 2 decimales significativos (redondos)', () => {
    for (const f of FASES) {
      // Multiplicado por 100 debe ser entero (aprox).
      const cent = Math.round(f.valor * 100);
      assert.ok(
        Math.abs(f.valor * 100 - cent) < 1e-6,
        `${f.clave}: valor ${f.valor} no tiene 2 decimales redondos`,
      );
    }
  });

  it('claves y nombres son UPPERCASE', () => {
    for (const f of FASES) {
      assert.equal(f.clave, f.clave.toUpperCase());
      assert.equal(f.nombre, f.nombre.toUpperCase());
    }
  });
});
