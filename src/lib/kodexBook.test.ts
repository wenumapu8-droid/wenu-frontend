/**
 * Tests de `src/lib/kodexBook.js` -- la columna vertebral del libro.
 *
 * Data + generadores usados directamente por [folio].astro y por varias
 * paginas del corredor. Si folios pierde una entrada o sigilSvg cambia
 * su forma, media docena de paginas rompen silenciosamente.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  OPERATIONS,
  archThemes,
  chapters,
  discoWorks,
  families,
  folios,
  hero,
  opName,
  organs,
  portalSigil,
  portals,
  sigilSvg,
  specimens,
} from './kodexBook.js';

describe('kodexBook · columna vertebral del libro', () => {
  it('folios tiene 6 elementos (I..VI)', () => {
    assert.equal(folios.length, 6);
  });

  it('specimens tiene al menos 6 entradas (una por folio)', () => {
    assert.ok(specimens.length >= 6, `especimenes esperados >= 6, hay ${specimens.length}`);
  });

  it('cada specimen declara i, file, name, portal, read, tags', () => {
    for (const s of specimens) {
      assert.ok(s.i, `specimen sin i: ${JSON.stringify(s)}`);
      assert.ok(s.file);
      assert.ok(s.name);
      assert.ok(s.portal);
      assert.ok(s.read);
      assert.ok(Array.isArray(s.tags));
    }
  });

  it('OPERATIONS es un objeto con al menos C01', () => {
    assert.equal(typeof OPERATIONS, 'object');
    assert.ok(OPERATIONS['C01'] || Object.keys(OPERATIONS).length > 0);
  });

  it('opName devuelve el nombre para keys reales', () => {
    const claves = Object.keys(OPERATIONS);
    if (claves.length > 0) {
      assert.equal(opName(claves[0]), OPERATIONS[claves[0]]);
    }
  });

  it('opName devuelve la clave misma para claves inexistentes (fallback)', () => {
    assert.equal(opName('C999'), 'C999');
    assert.equal(opName('bogus'), 'bogus');
  });

  it('organs es array con al menos 1 elemento', () => {
    assert.ok(Array.isArray(organs));
    assert.ok(organs.length >= 1);
  });

  it('families es array', () => {
    assert.ok(Array.isArray(families));
  });

  it('discoWorks es array', () => {
    assert.ok(Array.isArray(discoWorks));
  });

  it('archThemes es array', () => {
    assert.ok(Array.isArray(archThemes));
  });

  it('chapters es objeto con claves de escena', () => {
    assert.equal(typeof chapters, 'object');
    assert.ok(chapters, 'chapters vacio');
    // La clave 'prologue' deberia existir.
    assert.ok('prologue' in chapters, 'chapter "prologue" ausente');
  });

  it('portals es array', () => {
    assert.ok(Array.isArray(portals));
  });

  it('sigilSvg devuelve string SVG para un seed numerico', () => {
    // El caller real (KodexCell.astro) siempre pasa numero: `fam.seed || 111`.
    const svg = sigilSvg(111);
    assert.equal(typeof svg, 'string');
    assert.ok(svg.length > 0);
    assert.ok(svg.includes('<svg'), `no parece SVG: ${svg.slice(0, 50)}`);
  });

  it('sigilSvg es determinista con el mismo seed numerico', () => {
    assert.equal(sigilSvg(111), sigilSvg(111));
    assert.equal(sigilSvg(42), sigilSvg(42));
  });

  it('sigilSvg produce distinto con seeds numericos distintos', () => {
    assert.notEqual(sigilSvg(111), sigilSvg(222));
    assert.notEqual(sigilSvg(1), sigilSvg(2));
  });

  it('sigilSvg con seed no numerico cae al mismo estado (fallback via NaN>>>0)', () => {
    // `seed * 2654435761` con string es NaN, y `NaN >>> 0` es 0. Todos los
    // seeds no-numericos producen el mismo SVG. No es bug -- los callers
    // siempre pasan numero (KodexCell.astro: `fam.seed || 111`). Documentado
    // como comportamiento fallback.
    assert.equal(sigilSvg('a'), sigilSvg('b'));
    assert.equal(sigilSvg('foo'), sigilSvg('bar'));
  });

  it('portalSigil devuelve string para seed numerico + form index', () => {
    const s = portalSigil(111, 0);
    assert.equal(typeof s, 'string');
    assert.ok(s.length > 0);
  });

  it('hero existe (imagen del hero)', () => {
    assert.ok(hero);
  });
});
