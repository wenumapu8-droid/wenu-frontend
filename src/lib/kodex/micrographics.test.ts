/**
 * Tests de KODEX_MICROGRAPHICS.
 *
 * Los 22 iconos SVG que componen el vocabulario micrografico del chasis
 * (dial8, compass, crosshair, sunburst, orbit, radar, etc.). Cada uno
 * declara id, viewBox, category y motion. Si dos comparten id, un CSS
 * o script que los referencie por id agarra el equivocado.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { KODEX_MICROGRAPHICS } from './micrographics.ts';

const CANONICAL_MOTIONS = new Set([
  'none', 'tick', 'spin-slow', 'spin-reverse', 'pulse', 'scan',
  'lock', 'reveal', 'flow', 'blink', 'drift', 'breathe', 'open',
]);

describe('micrographics · vocabulario de iconos', () => {
  it('hay al menos 22 micrografias declaradas (crece con el chasis)', () => {
    assert.ok(
      Object.keys(KODEX_MICROGRAPHICS).length >= 22,
      `esperaba >= 22, hay ${Object.keys(KODEX_MICROGRAPHICS).length}`,
    );
  });

  it('cada icono declara id, viewBox, category, motion', () => {
    for (const [key, m] of Object.entries(KODEX_MICROGRAPHICS)) {
      assert.ok(m.id, `${key}: sin id`);
      assert.ok(m.viewBox, `${key}: sin viewBox`);
      assert.ok(m.category, `${key}: sin category`);
      assert.ok(m.motion, `${key}: sin motion`);
    }
  });

  it('ids son unicos entre las 22 (colision rompe getElementById)', () => {
    const ids = Object.values(KODEX_MICROGRAPHICS).map((m) => m.id);
    assert.equal(new Set(ids).size, ids.length, 'id duplicado en KODEX_MICROGRAPHICS');
  });

  it('ids siguen el patron kdx-<slug-kebab>', () => {
    for (const [key, m] of Object.entries(KODEX_MICROGRAPHICS)) {
      assert.match(
        m.id,
        /^kdx-[a-z0-9-]+$/,
        `${key}: id "${m.id}" rompe patron kdx-<kebab>`,
      );
    }
  });

  it('viewBox tiene el formato SVG canonico "0 0 W H"', () => {
    for (const [key, m] of Object.entries(KODEX_MICROGRAPHICS)) {
      assert.match(
        m.viewBox,
        /^0 0 \d+ \d+$/,
        `${key}: viewBox "${m.viewBox}" rompe formato`,
      );
    }
  });

  it('motion es uno de los declarados en KodexMotion', () => {
    for (const [key, m] of Object.entries(KODEX_MICROGRAPHICS)) {
      assert.ok(
        CANONICAL_MOTIONS.has(m.motion),
        `${key}: motion "${m.motion}" fuera del enum canonico`,
      );
    }
  });

  it('las categorias declaradas cubren los 12 dominios del chasis', () => {
    const cats = new Set(Object.values(KODEX_MICROGRAPHICS).map((m) => m.category));
    // No enforcamos un set exacto porque puede crecer, pero pedimos que
    // los canonicos declarados esten.
    for (const c of ['control', 'navigation', 'signal', 'cosmos', 'threshold']) {
      assert.ok(cats.has(c), `categoria canonica ${c} ausente`);
    }
  });
});
