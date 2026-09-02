/**
 * Tests del BUS DE SEÑALES.
 *
 * El bus es una capa compartida entre visual, audio y UI. Su contrato
 * concreto lo cumple la clase `Bus`; `senales()` solo gestiona el
 * singleton y publica `memory` al arrancar. Lo delicado son las
 * invariantes de la clase, que si fallan afectan a todas las escenas
 * silenciosamente.
 *
 * Reglas:
 *
 *   S1 · get devuelve 0 cuando no hay valor publicado.
 *   S2 · set recorta a [0,1] al publicar (no al leer).
 *   S3 · valores no finitos (NaN, Infinity) publican 0.
 *   S4 · set con el mismo valor NO notifica -- "no despertar a nadie por nada".
 *   S5 · subscribe entrega el valor actual de inmediato.
 *   S6 · un suscriptor que revienta no rompe a los demas.
 *   S7 · unsubscribe deja de recibir.
 *   S8 · varios suscriptores reciben el mismo valor.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Bus } from './senales.ts';

describe('SignalBus · contrato', () => {
  it('S1 · get devuelve 0 sin valor previo', () => {
    const b = new Bus();
    assert.equal(b.get('memory'), 0);
    assert.equal(b.get('proximity'), 0);
  });

  it('S2 · set recorta a [0,1]', () => {
    const b = new Bus();
    b.set('memory', 1.4);
    assert.equal(b.get('memory'), 1);
    b.set('memory', -0.3);
    assert.equal(b.get('memory'), 0);
    b.set('memory', 0.5);
    assert.equal(b.get('memory'), 0.5);
  });

  it('S3 · valores no finitos publican 0', () => {
    const b = new Bus();
    b.set('memory', 0.5);
    b.set('memory', NaN);
    assert.equal(b.get('memory'), 0);
    b.set('memory', Infinity);
    assert.equal(b.get('memory'), 0);
    b.set('memory', -Infinity);
    assert.equal(b.get('memory'), 0);
  });

  it('S4 · set idempotente no notifica ("no despertar por nada")', () => {
    const b = new Bus();
    let n = 0;
    b.subscribe('memory', () => { n += 1; });
    // subscribe ya notifico una vez con el valor inicial (0).
    assert.equal(n, 1);
    b.set('memory', 0.5);
    assert.equal(n, 2);
    b.set('memory', 0.5);  // mismo valor
    assert.equal(n, 2, 'no deberia notificar de nuevo con el mismo valor');
  });

  it('S5 · subscribe entrega el valor actual de inmediato', () => {
    const b = new Bus();
    b.set('memory', 0.7);
    let recibido = -1;
    b.subscribe('memory', (v) => { recibido = v; });
    assert.equal(recibido, 0.7, 'suscribirse tarde no debe quedar en cero');
  });

  it('S6 · un suscriptor que revienta no lleva a los demas', () => {
    const b = new Bus();
    let ok = 0;
    b.subscribe('memory', () => { throw new Error('boom'); });
    b.subscribe('memory', () => { ok += 1; });
    // subscribe inicial: ok+=1
    assert.equal(ok, 1);
    b.set('memory', 0.5);
    // el que revienta se traga la excepcion; el segundo sigue recibiendo
    assert.equal(ok, 2);
  });

  it('S7 · unsubscribe deja de recibir', () => {
    const b = new Bus();
    let n = 0;
    const stop = b.subscribe('memory', () => { n += 1; });
    // subscribe: n=1
    stop();
    b.set('memory', 0.5);
    assert.equal(n, 1, 'no debe recibir despues de desuscribirse');
  });

  it('S8 · varios suscriptores reciben el mismo valor', () => {
    const b = new Bus();
    const recibidos: number[] = [];
    b.subscribe('memory', (v) => recibidos.push(v));
    b.subscribe('memory', (v) => recibidos.push(v));
    b.subscribe('memory', (v) => recibidos.push(v));
    // 3 suscripciones inmediatas con 0
    assert.deepEqual(recibidos, [0, 0, 0]);
    b.set('memory', 0.4);
    assert.deepEqual(recibidos, [0, 0, 0, 0.4, 0.4, 0.4]);
  });

  it('subscribe/get son independientes por senal', () => {
    const b = new Bus();
    let m = -1;
    let p = -1;
    b.subscribe('memory', (v) => { m = v; });
    b.subscribe('proximity', (v) => { p = v; });
    b.set('memory', 0.3);
    assert.equal(m, 0.3);
    assert.equal(p, 0, 'proximity no deberia haber cambiado');
  });
});
