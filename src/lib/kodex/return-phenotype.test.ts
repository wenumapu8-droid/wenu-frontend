/**
 * P2 · Las dos propiedades que RETURN tiene que probar.
 * Un RETURN que se ve bien pero da lo mismo con cualquier ruta NO pasa.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { derivarFenotipo, semillaDelProximoUmbral } from '../../kodex/persistent-field/ReturnPhenotype.ts';
import type { EstadoCampo, Atractor } from '../../kodex/persistent-field/PersistentField.ts';

const ATR: Atractor[] = ['THRESHOLD','PROLOGUE','DESCENT','ARCHIVE','MACHINE','COSMOLOGY','RETURN'];
const cero = () => Object.fromEntries(ATR.map(a => [a, 0])) as Record<Atractor, number>;

const estado = (ruta: Atractor[], seed = 42, ciclo = 0): EstadoCampo => ({
  pesos: cero(), seed, ruta, ciclo, residuo: cero(), calidad: 'FULL',
});

test('DETERMINISMO · misma ruta y mismo seed dan el mismo fenotipo', () => {
  const r: Atractor[] = ['THRESHOLD','PROLOGUE','DESCENT','RETURN'];
  const a = derivarFenotipo(estado(r));
  const b = derivarFenotipo(estado([...r]));
  assert.equal(a.firma, b.firma);
  assert.equal(a.semilla, b.semilla);
  assert.deepEqual(a.herencia, b.herencia);
});

test('DIVERGENCIA · otra ruta da otra forma de retorno', () => {
  const a = derivarFenotipo(estado(['THRESHOLD','PROLOGUE','RETURN']));
  const b = derivarFenotipo(estado(['THRESHOLD','MACHINE','COSMOLOGY','RETURN']));
  assert.notEqual(a.firma, b.firma);
  assert.notEqual(a.semilla, b.semilla);
  assert.notEqual(a.amplitud, b.amplitud);
});

test('DIVERGENCIA · el mismo recorrido en otra sesion no es identico', () => {
  const r: Atractor[] = ['THRESHOLD','ARCHIVE','RETURN'];
  assert.notEqual(derivarFenotipo(estado(r, 1)).semilla, derivarFenotipo(estado(r, 2)).semilla);
});

test('la herencia suma 1 y el dominante es el mas visitado', () => {
  const f = derivarFenotipo(estado(['THRESHOLD','ARCHIVE','ARCHIVE','ARCHIVE','RETURN']));
  const suma = ATR.reduce((s, a) => s + f.herencia[a], 0);
  assert.ok(Math.abs(suma - 1) < 1e-9, `herencia suma ${suma}`);
  assert.equal(f.dominante, 'ARCHIVE');
});

test('TORSION · ir derecho da 0, saltar da mas', () => {
  const derecho = derivarFenotipo(estado(['THRESHOLD','PROLOGUE','DESCENT','ARCHIVE']));
  const saltado = derivarFenotipo(estado(['THRESHOLD','RETURN','ARCHIVE','PROLOGUE']));
  assert.equal(derecho.torsion, 0);
  assert.ok(saltado.torsion > 0.5, `torsion ${saltado.torsion}`);
});

test('P3 · THRESHOLD-prima hereda: no reinicia', () => {
  const f = derivarFenotipo(estado(['THRESHOLD','PROLOGUE','RETURN']));
  const s1 = semillaDelProximoUmbral(f);
  assert.notEqual(s1, f.semilla, 'el proximo umbral no repite la semilla del retorno');
  const f2 = derivarFenotipo(estado(['THRESHOLD','PROLOGUE','RETURN'], 42, 1));
  assert.notEqual(semillaDelProximoUmbral(f2), s1, 'otro ciclo, otro umbral');
});
