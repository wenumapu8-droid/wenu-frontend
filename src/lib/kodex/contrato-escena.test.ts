/**
 * Tests de `contrato-escena.ts` (sistema anterior, JSON-based).
 *
 * Este modulo trae los contratos canonicos (`scripts/kodex/contratos-escena.json`
 * con verbo/organismo/decision/dialecto/acento) al render y los expone como
 * data-* attributes para que `gate-experiencia.mjs` los verifique.
 *
 * Distinto del sistema nuevo YAML-based (`content/scenes/scene.*.yaml`):
 * convive con el, no lo reemplaza. Este cablea runtime; el yaml define
 * autoridad autoral rica.
 *
 * Reglas:
 *
 *   K1 · canon(slug) resuelve i..vi al id de escena canonico.
 *   K2 · canon acepta tambien el id canonico directo (PROLOGUE, etc.).
 *   K3 · canon devuelve null cuando el input no matches nada.
 *   K4 · contratoDe requiere `organismo`.
 *   K5 · contratoDe devuelve TODOS los data-kdx-* esperados.
 *   K6 · contratoDe pone estado default = 'dormant'.
 *   K7 · contratoDe respeta un estado override.
 *   K8 · contratoDe throw para slug/id sin match.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { canon, contratoDe } from './contrato-escena.ts';

const FOLIOS_ESPERADOS = [
  ['i', 'PROLOGUE'],
  ['ii', 'DESCENT'],
  ['iii', 'ARCHIVE'],
  ['iv', 'MACHINE'],
  ['v', 'COSMOLOGY'],
  ['vi', 'RETURN'],
] as const;

describe('contrato-escena · sistema anterior', () => {
  it('K1 · canon resuelve i..vi al id canonico', () => {
    for (const [folio, esperado] of FOLIOS_ESPERADOS) {
      const c = canon(folio);
      assert.ok(c, `canon(${folio}) devolvio null`);
      assert.equal(c!.id, esperado, `canon(${folio}).id = ${c!.id}, esperaba ${esperado}`);
    }
  });

  it('K2 · canon acepta el id canonico directamente', () => {
    for (const [, esperado] of FOLIOS_ESPERADOS) {
      const c = canon(esperado);
      assert.ok(c, `canon(${esperado}) devolvio null`);
      assert.equal(c!.id, esperado);
    }
  });

  it('K2 · canon es case-insensitive para ids', () => {
    const upper = canon('PROLOGUE');
    const lower = canon('prologue');
    assert.deepEqual(upper, lower);
  });

  it('K3 · canon devuelve null para input sin match', () => {
    assert.equal(canon('bogus'), null);
    assert.equal(canon(''), null);
  });

  it('canon poblado tiene verbo, organismo, decision, dialecto, acento', () => {
    const c = canon('i');
    assert.ok(c);
    assert.ok(c!.verbo && c!.verbo.length > 0);
    assert.ok(c!.organismo && c!.organismo.length > 0);
    assert.ok(c!.decision && c!.decision.length > 0);
    assert.ok(c!.dialecto && c!.dialecto.length > 0);
    assert.ok(c!.acento && c!.acento.length > 0);
  });

  it('K4 · contratoDe throw sin `organismo`', () => {
    assert.throws(
      () => contratoDe('i', { organismo: '' }),
      /organismo/,
    );
  });

  it('K5 · contratoDe devuelve TODOS los data-kdx-* esperados', () => {
    const attrs = contratoDe('i', { organismo: '.kdx-ojo' });
    const requeridos = [
      'data-kdx-contrato', 'data-kdx-verbo', 'data-kdx-organismo',
      'data-kdx-dialecto', 'data-kdx-acento', 'data-kdx-estado',
    ];
    for (const k of requeridos) {
      assert.ok(k in attrs, `contratoDe falta ${k}`);
    }
  });

  it('K5 · organismo pasado se refleja en data-kdx-organismo', () => {
    const attrs = contratoDe('i', { organismo: '.mi-organismo' });
    assert.equal(attrs['data-kdx-organismo'], '.mi-organismo');
  });

  it('K6 · estado default es "dormant"', () => {
    const attrs = contratoDe('i', { organismo: '.x' });
    assert.equal(attrs['data-kdx-estado'], 'dormant');
  });

  it('K7 · contratoDe respeta un estado override', () => {
    const attrs = contratoDe('i', { organismo: '.x', estado: 'aware' });
    assert.equal(attrs['data-kdx-estado'], 'aware');
  });

  it('titulo opcional se agrega solo si viene', () => {
    const sinTitulo = contratoDe('i', { organismo: '.x' });
    assert.ok(!('data-kdx-titulo' in sinTitulo));
    const conTitulo = contratoDe('i', { organismo: '.x', titulo: '.mi-titulo' });
    assert.equal(conTitulo['data-kdx-titulo'], '.mi-titulo');
  });

  it('K8 · contratoDe throw para slug/id sin match', () => {
    assert.throws(
      () => contratoDe('bogus', { organismo: '.x' }),
      /bogus/,
    );
  });
});
