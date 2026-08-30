/**
 * Tests de `memoria.ts` en modo sin almacen (SSG/tests).
 *
 * El modulo comparte la clave `kx-journey` con `src/kodex/return/memory.js`
 * a proposito, y toca localStorage. En node --test no hay localStorage, asi
 * que `hayAlmacen()` devuelve false y todas las lecturas devuelven la forma
 * base vacia; las escrituras son no-op. Estos tests validan justamente ese
 * comportamiento SIN-ALMACEN, que es el que corre en el build SSG y
 * garantiza que el build no revienta cuando alguien intenta persistir.
 *
 * Reglas del contrato:
 *
 *   M1 · ciclo() minimo es 1, nunca menor (`Math.max(1, ...)`).
 *   M2 · derivados() devuelve 0/0/0 cuando no hay eventos.
 *   M3 · pesoDeMemoria() en [0,1], y 0 sin memoria.
 *   M4 · eventos() / recorrido() devuelven arrays vacios.
 *   M5 · ocurrio() es false y veces() es 0 sin memoria.
 *   M6 · recordar() devuelve un MemoryEvent bien formado sin excepcion.
 *   M7 · nuevoCiclo() incrementa pero devuelve al menos 1.
 *   M8 · olvidar() no throw sin almacen.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ciclo, recordar, eventos, ocurrio, veces, nuevoCiclo,
  derivados, pesoDeMemoria, recorrido, olvidar,
} from './memoria.ts';

describe('memoria · comportamiento sin almacen (SSG / tests)', () => {
  it('M1 · ciclo() minimo es 1', () => {
    const c = ciclo();
    assert.ok(c >= 1, `ciclo() = ${c} deberia ser >= 1`);
  });

  it('M2 · derivados() devuelve 0/0/0 sin memoria', () => {
    const d = derivados();
    assert.equal(d.archiveDepth, 0);
    assert.equal(d.routeDiversity, 0);
    assert.equal(d.returnCount, 0);
  });

  it('derivados devuelve numeros en [0,1]', () => {
    const d = derivados();
    for (const [k, v] of Object.entries(d)) {
      assert.ok(v >= 0 && v <= 1, `${k} = ${v} fuera de [0,1]`);
    }
  });

  it('M3 · pesoDeMemoria() esta en [0,1]', () => {
    const p = pesoDeMemoria();
    assert.ok(p >= 0 && p <= 1, `pesoDeMemoria() = ${p} fuera de [0,1]`);
  });

  it('M3 · pesoDeMemoria() sin memoria devuelve 0', () => {
    assert.equal(pesoDeMemoria(), 0);
  });

  it('M4 · eventos() devuelve array vacio', () => {
    const es = eventos();
    assert.ok(Array.isArray(es));
    assert.equal(es.length, 0);
  });

  it('M4 · recorrido() devuelve array vacio', () => {
    const r = recorrido();
    assert.ok(Array.isArray(r));
    assert.equal(r.length, 0);
  });

  it('M5 · ocurrio() es false sin memoria', () => {
    assert.equal(ocurrio('threshold_crossed'), false);
    assert.equal(ocurrio('cualquier_cosa'), false);
  });

  it('M5 · veces() es 0 sin memoria', () => {
    assert.equal(veces('threshold_crossed'), 0);
    assert.equal(veces('lo_que_sea'), 0);
  });

  it('M6 · recordar() devuelve MemoryEvent bien formado sin excepcion', () => {
    const ev = recordar('test_event', 'KDX-NODE-TEST');
    assert.equal(ev.type, 'test_event');
    assert.equal(ev.node_id, 'KDX-NODE-TEST');
    assert.ok(typeof ev.at === 'number' && ev.at > 0, 'at deberia ser timestamp');
    assert.ok(ev.cycle >= 1, 'cycle deberia ser >= 1');
  });

  it('recordar con detail devuelve evento con detail acotado', () => {
    const ev = recordar('test_ranged', 'KDX-NODE-X', { intensidad: 0.5, fuera: 1.7, neg: -0.3 });
    assert.ok(ev.detail);
    assert.equal(ev.detail!.intensidad, 0.5);
    assert.equal(ev.detail!.fuera, 1, 'fuera de rango deberia clampear a 1');
    assert.equal(ev.detail!.neg, 0, 'negativo deberia clampear a 0');
  });

  it('recordar descarta valores no finitos del detail', () => {
    const ev = recordar('test_infinite', 'KDX-NODE-X', {
      ok: 0.5,
      nan: NaN,
      inf: Infinity,
      ninf: -Infinity,
    });
    assert.ok(ev.detail);
    assert.equal(ev.detail!.ok, 0.5);
    assert.ok(!('nan' in ev.detail!), 'NaN no deberia persistir');
    assert.ok(!('inf' in ev.detail!), 'Infinity no deberia persistir');
    assert.ok(!('ninf' in ev.detail!), '-Infinity no deberia persistir');
  });

  it('M7 · nuevoCiclo() devuelve al menos 1', () => {
    const n = nuevoCiclo();
    assert.ok(n >= 1, `nuevoCiclo() = ${n} deberia ser >= 1`);
  });

  it('M8 · olvidar() no throw sin almacen', () => {
    assert.doesNotThrow(() => olvidar());
  });
});
