/**
 * Tests de las funciones puras de `volumenes.ts`.
 *
 * `leerManifiesto` toca el filesystem y `resolver` recibe un manifiesto
 * completo; ambos se prueban mejor por integracion. Estos tests cubren
 * las cuatro funciones puras que la mayoria del render pasa por:
 * decir (i18n), razon (aspecto), assetUrl (path derivacion), y GLIFOS.
 *
 * Reglas:
 *
 *   V1 · decir cae al espanol cuando no hay traduccion, y respeta "en" cuando existe.
 *   V2 · razon parsea "N/M" a numero, cae a 1 con entrada mala.
 *   V3 · assetUrl deja urls absolutas y mailto/https intactos.
 *   V4 · assetUrl arma la URL R2 correcta para art/ y free/.
 *   V5 · GLIFOS cubre las 7 escrituras declaradas.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { decir, razon, assetUrl, GLIFOS, type Escritura } from './volumenes.ts';

describe('volumenes · funciones puras', () => {
  it('V1 · decir en espanol devuelve es', () => {
    assert.equal(decir('hola', 'hello', 'es'), 'hola');
  });

  it('V1 · decir en ingles devuelve en si existe, si no cae al es', () => {
    assert.equal(decir('hola', 'hello', 'en'), 'hello');
    assert.equal(decir('hola', undefined, 'en'), 'hola');
  });

  it('V1 · decir con es undefined devuelve string vacia', () => {
    assert.equal(decir(undefined, undefined, 'es'), '');
    assert.equal(decir(undefined, undefined, 'en'), '');
  });

  it('V2 · razon parsea "16/9" a 16/9', () => {
    assert.equal(razon('16/9'), 16 / 9);
  });

  it('V2 · razon default a 1 con entrada vacia', () => {
    assert.equal(razon(), 1);
    assert.equal(razon('1/1'), 1);
  });

  it('V2 · razon cae a 1 con entrada invalida', () => {
    assert.equal(razon('foo'), 1);
    assert.equal(razon('16/0'), 1);
    assert.equal(razon('/'), 1);
  });

  it('V3 · assetUrl con src vacia devuelve ""', () => {
    assert.equal(assetUrl(undefined), '');
    assert.equal(assetUrl(''), '');
  });

  it('V3 · assetUrl respeta absolutas y protocolos', () => {
    assert.equal(assetUrl('/foo/bar.jpg'), '/foo/bar.jpg');
    assert.equal(assetUrl('https://example.com/x.png'), 'https://example.com/x.png');
    assert.equal(assetUrl('http://example.com/x.png'), 'http://example.com/x.png');
    assert.equal(assetUrl('mailto:x@y'), 'mailto:x@y');
  });

  it('V4 · assetUrl arma URL R2 para art/', () => {
    const url = assetUrl('art/abc/cover.webp', 'hero');
    assert.ok(url.includes('/kodex-content/art/abc/'));
    assert.ok(url.endsWith('cover-1400.webp'), `hero esperado -1400: ${url}`);
  });

  it('V4 · assetUrl thumb para art/ devuelve cover-400 por defecto', () => {
    const url = assetUrl('art/xyz/cover.webp', 'thumb');
    assert.ok(url.endsWith('cover-400.webp'), `thumb esperado -400: ${url}`);
  });

  it('V4 · assetUrl source no reescribe cover', () => {
    const url = assetUrl('art/abc/cover.webp', 'source');
    assert.ok(url.endsWith('cover.webp'), `source esperado sin reescribir: ${url}`);
  });

  it('V4 · assetUrl para free/ pasa por R2', () => {
    const url = assetUrl('free/piece.webp');
    assert.ok(url.includes('/kodex-content/free/piece.webp'));
  });

  it('V4 · assetUrl para paths locales (no art/free) sirve desde /kodex-content/', () => {
    const url = assetUrl('books/ocin/pages/001.webp');
    assert.equal(url, '/kodex-content/books/ocin/pages/001.webp');
  });

  it('V5 · GLIFOS cubre las 7 escrituras declaradas', () => {
    const esperadas: Escritura[] = [
      'devanagari', 'arabic', 'kana', 'han', 'hangul', 'cyrillic', 'greek',
    ];
    for (const e of esperadas) {
      assert.ok(GLIFOS[e], `escritura ${e} sin glifo declarado`);
      assert.ok(GLIFOS[e].length > 0, `escritura ${e} con glifo vacio`);
    }
  });

  it('GLIFOS no tiene claves de mas fuera del enum', () => {
    const declaradas = new Set<string>([
      'devanagari', 'arabic', 'kana', 'han', 'hangul', 'cyrillic', 'greek',
    ]);
    for (const k of Object.keys(GLIFOS)) {
      assert.ok(declaradas.has(k), `escritura extra en GLIFOS: ${k}`);
    }
  });
});
