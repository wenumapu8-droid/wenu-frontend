/**
 * Tests del MOTOR DE RUTA (`ruta.ts`).
 *
 * Motor puro sin DOM, sin fetch, sin reloj. Es el que hace que dos
 * personas vean KODEX distinto ("segun las decisiones, los clicks"),
 * asi que la determinacion y la reproducibilidad son parte del contrato.
 *
 * Reglas:
 *
 *   R1 · firmar es determinista y produce uint32.
 *   R2 · firmar distingue textos distintos (colisiones raras).
 *   R3 · firmaDeRuta cambia con el orden de visitados.
 *   R4 · enElCorazon es true iff profundidad >= 7.
 *   R5 · bifurcar devuelve como maximo PUERTAS (3) puertas.
 *   R6 · bifurcar no devuelve el mismo nodo dos veces.
 *   R7 · bifurcar reparte papeles (HILO/PUENTE/HALLAZGO) cuando existen candidatos.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  firmar,
  firmaDeRuta,
  enElCorazon,
  bifurcar,
  PROFUNDIDAD_CORAZON,
  PUERTAS,
  type Corpus,
  type NodoRama,
  type Viaje,
} from './ruta.ts';

function mkNodo(id: string, opts: Partial<NodoRama> = {}): NodoRama {
  return {
    id,
    titulo: opts.titulo ?? `Nodo ${id}`,
    estrato: opts.estrato ?? null,
    estatus: opts.estatus ?? 'CANONICAL',
    grado: opts.grado ?? 0,
    href: opts.href ?? `/kodex/${id}`,
    sinNombre: opts.sinNombre,
  };
}

function mkCorpus(nodos: NodoRama[], vecinos: Record<string, string[]> = {}): Corpus {
  const indice: Record<string, number> = {};
  nodos.forEach((n, i) => { indice[n.id] = i; });
  return { nodos, vecinos, indice };
}

function mkViaje(over: Partial<Viaje> = {}): Viaje {
  return {
    escena: 'i',
    profundidad: 0,
    aqui: null,
    visitados: [],
    firma: 0,
    memoria: { archiveDepth: 0, routeDiversity: 0, returnCount: 0 },
    ...over,
  };
}

describe('ruta · motor puro de descenso', () => {
  it('R1 · firmar es determinista', () => {
    assert.equal(firmar('hola'), firmar('hola'));
    assert.equal(firmar(''), firmar(''));
  });

  it('R1 · firmar produce uint32 (no negativo)', () => {
    for (const s of ['a', 'hola', '', 'KODEX-∞', 'x'.repeat(1000)]) {
      const h = firmar(s);
      assert.ok(h >= 0, `firmar("${s}") = ${h} negativo`);
      assert.ok(h <= 0xffffffff, `firmar("${s}") = ${h} excede uint32`);
      assert.ok(Number.isInteger(h), `firmar("${s}") = ${h} no entero`);
    }
  });

  it('R2 · firmar distingue textos distintos', () => {
    // No garantia formal (es un hash) pero con textos cortos distintos
    // la probabilidad de colision es ~0. Si esta cae, sospechar la funcion.
    const textos = ['a', 'b', 'aa', 'ab', 'ba', 'hola', 'chau'];
    const firmas = new Set(textos.map(firmar));
    assert.equal(firmas.size, textos.length, 'colision inesperada en firmar');
  });

  it('R3 · firmaDeRuta cambia con el orden de visitados', () => {
    const f1 = firmaDeRuta('i', ['a', 'b', 'c'], 0);
    const f2 = firmaDeRuta('i', ['c', 'b', 'a'], 0);
    assert.notEqual(f1, f2, 'firmaDeRuta deberia depender del orden');
  });

  it('R3 · firmaDeRuta cambia con retornos', () => {
    const f0 = firmaDeRuta('i', ['a', 'b'], 0);
    const f1 = firmaDeRuta('i', ['a', 'b'], 1);
    assert.notEqual(f0, f1, 'firmaDeRuta deberia depender de retornos');
  });

  it('R3 · firmaDeRuta cambia con escena', () => {
    const fi = firmaDeRuta('i', ['a'], 0);
    const fii = firmaDeRuta('ii', ['a'], 0);
    assert.notEqual(fi, fii);
  });

  it('R4 · enElCorazon es true iff profundidad >= PROFUNDIDAD_CORAZON', () => {
    assert.equal(PROFUNDIDAD_CORAZON, 7);
    assert.equal(enElCorazon(mkViaje({ profundidad: 0 })), false);
    assert.equal(enElCorazon(mkViaje({ profundidad: 6 })), false);
    assert.equal(enElCorazon(mkViaje({ profundidad: 7 })), true);
    assert.equal(enElCorazon(mkViaje({ profundidad: 100 })), true);
  });

  it('R5 · bifurcar devuelve como maximo PUERTAS puertas', () => {
    // Corpus grande, viaje limpio.
    const nodos = Array.from({ length: 20 }, (_, i) =>
      mkNodo(`n${i}`, { grado: i, estrato: i % 2 ? 'A' : 'B' }));
    const corpus = mkCorpus(nodos);
    const viaje = mkViaje();
    const puertas = bifurcar(viaje, corpus);
    assert.ok(puertas.length <= PUERTAS, `${puertas.length} > ${PUERTAS}`);
  });

  it('R6 · bifurcar no devuelve el mismo nodo dos veces', () => {
    const nodos = Array.from({ length: 10 }, (_, i) =>
      mkNodo(`n${i}`, { grado: i, estrato: 'A' }));
    const corpus = mkCorpus(nodos);
    const puertas = bifurcar(mkViaje(), corpus);
    const ids = puertas.map((p) => p.nodo.id);
    assert.equal(new Set(ids).size, ids.length, 'nodo duplicado en puertas');
  });

  it('bifurcar excluye el nodo actual del set de candidatos (via ya visitado)', () => {
    const nodos = [mkNodo('a', { grado: 5 }), mkNodo('b'), mkNodo('c')];
    const corpus = mkCorpus(nodos, { a: ['b', 'c'] });
    const viaje = mkViaje({ aqui: 'a', visitados: ['a'] });
    const puertas = bifurcar(viaje, corpus);
    for (const p of puertas) {
      assert.notEqual(p.nodo.id, 'a', 'bifurcar propuso el nodo actual como puerta');
    }
  });

  it('bifurcar es determinista con el mismo estado', () => {
    const nodos = Array.from({ length: 15 }, (_, i) =>
      mkNodo(`n${i}`, { grado: i, estrato: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : null }));
    const corpus = mkCorpus(nodos, { n0: ['n1', 'n2', 'n3'] });
    const viaje = mkViaje({ aqui: 'n0', profundidad: 2 });
    const primera = bifurcar(viaje, corpus).map((p) => p.nodo.id);
    const segunda = bifurcar(viaje, corpus).map((p) => p.nodo.id);
    assert.deepEqual(primera, segunda, 'bifurcar deberia ser determinista');
  });

  it('R7 · bifurcar reparte papeles cuando hay candidatos para cada uno', () => {
    // Un HILO (vecino declarado), un PUENTE (otro estrato), un HALLAZGO (sin estrato, grado 0).
    const nodos = [
      mkNodo('actual', { estrato: 'A', grado: 3 }),
      mkNodo('hilo', { estrato: 'A', grado: 2 }),         // vecino declarado
      mkNodo('puente', { estrato: 'B', grado: 3 }),       // otro estrato
      mkNodo('hallazgo', { estrato: null, grado: 0 }),    // crudo
    ];
    const corpus = mkCorpus(nodos, { actual: ['hilo'] });
    const viaje = mkViaje({ aqui: 'actual', profundidad: 1 });
    const puertas = bifurcar(viaje, corpus);
    const papeles = new Set(puertas.map((p) => p.papel));
    // Con 3 candidatos distinguibles, los 3 papeles deberian aparecer.
    assert.ok(papeles.has('HILO'), 'sin HILO');
    assert.ok(papeles.has('PUENTE'), 'sin PUENTE');
    assert.ok(papeles.has('HALLAZGO'), 'sin HALLAZGO');
  });

  it('bifurcar devuelve puertas con razon no vacia', () => {
    const nodos = Array.from({ length: 8 }, (_, i) => mkNodo(`n${i}`, { grado: i }));
    const corpus = mkCorpus(nodos);
    const puertas = bifurcar(mkViaje(), corpus);
    for (const p of puertas) {
      assert.ok(p.razon && p.razon.length > 0, 'puerta sin razon');
    }
  });
});
