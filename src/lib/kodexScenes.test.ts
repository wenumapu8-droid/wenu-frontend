/**
 * Tests de `src/lib/kodexScenes.js` -- las 7 escenas del corredor.
 *
 * Esta lista se usa directamente para renderizar el mapa de escenas y
 * cablear los folios. Si una escena pierde el accent, el motif, o el
 * href, el corredor se rompe visualmente sin que nada grite.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { scenes, findSceneByPath, tagline } from './kodexScenes.js';

const CODES_ESPERADOS = ['THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN'];

describe('kodexScenes · las 7 escenas del corredor', () => {
  it('scenes tiene exactamente 7 elementos', () => {
    assert.equal(scenes.length, 7);
  });

  it('codes en orden canonico THRESHOLD..RETURN', () => {
    assert.deepEqual(scenes.map((s) => s.code), CODES_ESPERADOS);
  });

  it('cada escena declara i, index, code, accent, accentHex, href, hash', () => {
    for (const s of scenes) {
      assert.ok(typeof s.i === 'number', `${s.code}: sin i numerico`);
      assert.ok(s.index && s.code && s.accent && s.accentHex && s.href, `${s.code}: campo faltante`);
      assert.ok(s.hash, `${s.code}: sin hash`);
    }
  });

  it('accentHex es hex color valido', () => {
    for (const s of scenes) {
      assert.match(s.accentHex, /^#[0-9A-F]{6}$/i, `${s.code}: accentHex "${s.accentHex}" invalido`);
    }
  });

  it('index es "00".."06"', () => {
    const esperados = ['00', '01', '02', '03', '04', '05', '06'];
    assert.deepEqual(scenes.map((s) => s.index), esperados);
  });

  it('accents siguen decision canonica: 6 colores para 7 escenas (ARCHIVE/MACHINE comparten cyan)', () => {
    // Documentado en memoria del creador (2026-08-28, paleta ambar):
    //   THRESHOLD rojo #FF3B33 · PROLOGUE violeta #B770FF ·
    //   DESCENT naranja #FF8A33 · ARCHIVE/MACHINE cyan #00F0FF ·
    //   COSMOLOGY magenta #FF00C8 · RETURN verde acido #B7FF00
    // ARCHIVE tiene accent="multi" y hex cyan; comparte con MACHINE.
    const accents = scenes.map((s) => s.accentHex);
    // 7 escenas, pero 2 comparten (ARCHIVE+MACHINE) -> 6 unicas.
    assert.equal(new Set(accents).size, 6, 'debe haber exactamente 6 colores unicos entre 7 escenas');
    // Verificacion especifica del sharing intencional.
    const archive = scenes.find((s) => s.code === 'ARCHIVE');
    const machine = scenes.find((s) => s.code === 'MACHINE');
    assert.ok(archive && machine);
    assert.equal(archive!.accentHex, machine!.accentHex, 'ARCHIVE y MACHINE deben compartir cyan por decision canonica');
    assert.equal(archive!.accentHex, '#00F0FF', 'accent compartido debe ser cyan #00F0FF');
  });

  it('THRESHOLD apunta a /kodex/ (portada)', () => {
    const t = scenes.find((s) => s.code === 'THRESHOLD');
    assert.ok(t);
    assert.equal(t!.href, '/kodex/');
  });

  it('folios 01-06 apuntan a /kodex/folio/<roman>/', () => {
    const romanos = ['i', 'ii', 'iii', 'iv', 'v', 'vi'];
    for (let i = 1; i <= 6; i++) {
      const s = scenes[i];
      assert.ok(
        s.href.includes(`/kodex/folio/${romanos[i - 1]}`),
        `${s.code}: href "${s.href}" no coincide con folio/${romanos[i - 1]}`,
      );
    }
  });

  it('cta y lede no vacios', () => {
    for (const s of scenes) {
      assert.ok(s.cta && s.cta.length > 0, `${s.code}: cta vacio`);
      assert.ok(s.lede && s.lede.length > 0, `${s.code}: lede vacio`);
    }
  });

  it('findSceneByPath resuelve rutas del corredor', () => {
    assert.equal(findSceneByPath('/kodex/')?.code, 'THRESHOLD');
    assert.equal(findSceneByPath('/kodex/folio/i/')?.code, 'PROLOGUE');
    assert.equal(findSceneByPath('/kodex/folio/vi/')?.code, 'RETURN');
  });

  it('findSceneByPath cae a THRESHOLD para rutas fuera del corredor (fallback)', () => {
    // Comportamiento actual: si no matchea exacta ni interludio, devuelve
    // scenes[0] (THRESHOLD). Documentado como fallback intencional en el
    // codigo. Cambiarlo requiere revisar `INTERLUDIOS · 2026-08-28 · P0`.
    assert.equal(findSceneByPath('/')?.code, 'THRESHOLD');
    assert.equal(findSceneByPath('/shop')?.code, 'THRESHOLD');
  });

  it('findSceneByPath resuelve interludios al scene de origen', () => {
    // Comportamiento post-P0 (2026-08-28): /kodex/interlude/<origen>-<dest>/
    // devuelve la scene del origen mientras se cruza. Antes caia siempre en
    // THRESHOLD, mentia sobre la posicion.
    assert.equal(
      findSceneByPath('/kodex/interlude/archive-machine/')?.code,
      'ARCHIVE',
    );
    assert.equal(
      findSceneByPath('/kodex/interlude/cosmology-return/')?.code,
      'COSMOLOGY',
    );
  });

  it('tagline es una string no vacia', () => {
    assert.equal(typeof tagline, 'string');
    assert.ok(tagline.length > 0);
  });
});
