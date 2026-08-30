/**
 * Tests para funciones puras de modulos pequenos:
 *   sonido · estadoDe(superficie) -> Estado
 *   respiracion · toca(profundidad) -> boolean
 *   quietFrames · estructura de los 3 presets
 *
 * Cada uno es pequeno para justificar un archivo propio, pero criticos:
 * el mapeo de superficie a estado sonoro afecta que voces suenen; toca
 * decide cuando aparece una obra de Ocin a pantalla completa; quietFrames
 * son las paradas entre concepto y concepto.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { estadoDe, type Estado } from './sonido.ts';
import { toca, CADA } from './respiracion.ts';
import { quietFrames, type QuietFramePreset } from './quietFrames.ts';

describe('sonido · estadoDe(superficie)', () => {
  it('threshold y prologue caen a E00', () => {
    assert.equal(estadoDe('threshold'), 'E00');
    assert.equal(estadoDe('prologue'), 'E00');
    assert.equal(estadoDe('umbral'), 'E00');
    assert.equal(estadoDe('folio/i'), 'E00');
    assert.equal(estadoDe('i'), 'E00');
  });

  it('return cae a R10', () => {
    assert.equal(estadoDe('return'), 'R10');
    assert.equal(estadoDe('retorno'), 'R10');
    assert.equal(estadoDe('folio/vi'), 'R10');
    assert.equal(estadoDe('vi'), 'R10');
  });

  it('machine y cosmology caen a M11', () => {
    assert.equal(estadoDe('machine'), 'M11');
    assert.equal(estadoDe('cosmology'), 'M11');
    assert.equal(estadoDe('folio/iv'), 'M11');
    assert.equal(estadoDe('iv'), 'M11');
    assert.equal(estadoDe('v'), 'M11');
  });

  it('cualquier otra superficie cae a T01 (fallback)', () => {
    assert.equal(estadoDe('descent'), 'T01');
    assert.equal(estadoDe('archive'), 'T01');
    assert.equal(estadoDe('random-page'), 'T01');
    assert.equal(estadoDe(''), 'T01');
  });

  it('estadoDe es case-insensitive', () => {
    assert.equal(estadoDe('THRESHOLD'), 'E00');
    assert.equal(estadoDe('Return'), 'R10');
    assert.equal(estadoDe('MACHINE'), 'M11');
  });

  it('los 4 estados canonicos existen', () => {
    const estados: Estado[] = ['E00', 'T01', 'M11', 'R10'];
    for (const e of estados) {
      assert.ok(e, `${e} deberia ser Estado valido`);
    }
  });
});

describe('respiracion · toca(profundidad)', () => {
  it('CADA es 2', () => {
    assert.equal(CADA, 2);
  });

  it('toca(0) es false (no se respira antes de empezar)', () => {
    assert.equal(toca(0), false);
  });

  it('toca(profundidad par > 0) es true', () => {
    assert.equal(toca(2), true);
    assert.equal(toca(4), true);
    assert.equal(toca(6), true);
    assert.equal(toca(100), true);
  });

  it('toca(profundidad impar) es false', () => {
    assert.equal(toca(1), false);
    assert.equal(toca(3), false);
    assert.equal(toca(5), false);
    assert.equal(toca(99), false);
  });
});

describe('quietFrames · los 3 presets entre escenas', () => {
  const IDS_ESPERADOS = ['threshold-prologue', 'archive-machine', 'cosmology-return'];

  it('los 3 ids esperados existen', () => {
    for (const id of IDS_ESPERADOS) {
      assert.ok(id in quietFrames, `quietFrames.${id} ausente`);
    }
  });

  it('no hay presets extras fuera del set esperado', () => {
    assert.deepEqual(Object.keys(quietFrames).sort(), [...IDS_ESPERADOS].sort());
  });

  it('cada preset declara los campos requeridos', () => {
    const requeridos: Array<keyof QuietFramePreset> = [
      'id', 'variant', 'archiveId', 'label', 'status', 'node', 'origin',
      'caption', 'accent', 'geometry', 'align', 'ratio', 'href', 'command',
    ];
    for (const id of IDS_ESPERADOS) {
      const p = quietFrames[id as keyof typeof quietFrames];
      for (const k of requeridos) {
        assert.ok(k in p, `preset ${id} falta ${String(k)}`);
      }
      // archiveId sigue patron KDX://QF-NNN.
      assert.match(p.archiveId, /^KDX:\/\/QF-\d{3}$/, `preset ${id}: archiveId patron`);
    }
  });

  it('cada id de preset coincide con la key en el mapa', () => {
    for (const [key, preset] of Object.entries(quietFrames)) {
      assert.equal(preset.id, key, `preset ${key} tiene id "${preset.id}" distinto`);
    }
  });

  it('accents son parte del enum declarado', () => {
    const accents = ['none', 'cyan', 'violet', 'bronze'];
    for (const p of Object.values(quietFrames)) {
      assert.ok(accents.includes(p.accent), `${p.id}: accent "${p.accent}" invalido`);
    }
  });
});
