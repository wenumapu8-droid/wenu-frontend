import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const routePath = new URL('../src/pages/kodex/lab/visual-activators-collage-v0.astro', import.meta.url);
const source = await readFile(routePath, 'utf8');

test('visual activator lab is explicitly noindex and isolated', () => {
  assert.match(source, /noindex, nofollow/);
  assert.match(source, /AUTHORIAL ACTIVATOR LAB \/ NOINDEX \/ V0/);
});

test('authorial artwork remains unfiltered and contained', () => {
  assert.match(source, /object-fit:contain/);
  assert.match(source, /filter:none/);
  assert.match(source, /mix-blend-mode:normal/);
  assert.match(source, /clip-path:none/);
  assert.match(source, /ORIGINAL AUTHORIAL SOURCE/);
});

test('activator lifecycle contains the canonical six states', () => {
  for (const phase of ['dormant', 'aware', 'focus', 'open', 'crossed', 'remembered']) {
    assert.ok(source.includes(`'${phase}'`), `missing phase ${phase}`);
  }
});

test('seven core scenes are present with RETURN white', () => {
  for (const scene of ['THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN']) {
    assert.ok(source.includes(`scene: '${scene}'`), `missing scene ${scene}`);
  }
  assert.match(source, /scene: 'RETURN'.*accent: '#ffffff'/s);
  assert.match(source, /\[data-scene="RETURN"\].*background: #f4f2ed/s);
});

test('mobile remains a fixed temporal scene and reduced motion is respected', () => {
  assert.match(source, /height: 100dvh/);
  assert.match(source, /@media \(max-width:760px\)/);
  assert.match(source, /prefers-reduced-motion: reduce/);
});
