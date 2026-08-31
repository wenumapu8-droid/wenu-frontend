/**
 * El corredor no son siete puertas: son siete TERRITORIOS.
 * Corrección del creador (2026-08-30): "entre THRESHOLD hay muchas escenas
 * que corresponden a ese umbral antes de pasar al PROLOGUE, y así sucesivamente".
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { atractorDeRuta, esPuertaCanonica } from '../../kodex/persistent-field/PersistentField.ts';

test('las siete puertas canonicas resuelven a su atractor', () => {
  assert.equal(atractorDeRuta('/kodex/'), 'THRESHOLD');
  assert.equal(atractorDeRuta('/kodex/folio/i/'), 'PROLOGUE');
  assert.equal(atractorDeRuta('/kodex/folio/vi/'), 'RETURN');
});

test('ninguna ruta de KODEX queda fuera del campo', () => {
  const rutas = [
    '/kodex/vol/algo/', '/kodex/lamina/heart-chamber/', '/kodex/lab/observe-v2/',
    '/kodex/concepto/kdx-img-001/', '/kodex/movement/disco/', '/kodex/work/x/',
    '/kodex/archive/', '/kodex/chamber/heart/', '/kodex/screen/origin-field/',
    '/kodex/interlude/archive-machine/', '/kodex/m/descent/', '/kodex/algo-nuevo/',
  ];
  for (const r of rutas) {
    assert.ok(atractorDeRuta(r), `${r} quedo sin atractor: fuera del campo`);
  }
});

test('cada territorio cae bajo el atractor que lo gobierna', () => {
  assert.equal(atractorDeRuta('/kodex/vol/x/'), 'ARCHIVE');
  assert.equal(atractorDeRuta('/kodex/inward/x/'), 'DESCENT');
  assert.equal(atractorDeRuta('/kodex/movement/disco/'), 'MACHINE');
  assert.equal(atractorDeRuta('/kodex/concepto/x/'), 'COSMOLOGY');
  assert.equal(atractorDeRuta('/kodex/lamina/x/'), 'PROLOGUE');
  assert.equal(atractorDeRuta('/kodex/chamber/heart/'), 'RETURN');
});

test('lo no reclamado cae al UMBRAL, no al vacio', () => {
  assert.equal(atractorDeRuta('/kodex/ruta-que-no-existe-todavia/'), 'THRESHOLD');
});

test('fuera de KODEX el campo no opina', () => {
  assert.equal(atractorDeRuta('/shop'), null);
  assert.equal(atractorDeRuta('/'), null);
});

test('puerta canonica se distingue de escena interior', () => {
  assert.ok(esPuertaCanonica('/kodex/'));
  assert.ok(esPuertaCanonica('/kodex/folio/iv/'));
  assert.ok(!esPuertaCanonica('/kodex/vol/x/'));
  assert.ok(!esPuertaCanonica('/kodex/lamina/x/'));
});
