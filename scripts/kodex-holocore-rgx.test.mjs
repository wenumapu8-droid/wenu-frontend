import test from 'node:test';
import assert from 'node:assert/strict';
import { GLYPH_SETS } from '../src/kodex/ascii/config/glyph-sets.js';
import { holocoreOrbitalRGXScene } from '../src/kodex/ascii/scenes/holocore-orbital-rgx.js';
import { orbitalCityRGXProfile, profileToField } from '../src/kodex/holocore/reference-profiles/orbital-city-rgx.js';

const pointer = Object.freeze({ x: 0.5, y: 0.5, active: false });
const seed = 21.25;

test('RGX profile encodes reference hierarchy without source pixels', () => {
  assert.equal(orbitalCityRGXProfile.id, 'orbital-city-rgx-v1');
  assert.equal(orbitalCityRGXProfile.sourceStatus, 'VISUAL_REFERENCE + MACHINE_REFERENCE');
  assert.equal(orbitalCityRGXProfile.sourceRefs.length, 2);
  assert.match(orbitalCityRGXProfile.sourceRefs[1], /KDX-ROOT-RAW-009/);
  assert.equal(orbitalCityRGXProfile.epistemicStatus, 'SPECULATIVE');

  const ids = orbitalCityRGXProfile.layers.map(layer => layer.id);
  assert.deepEqual(ids, [
    'atmosphere',
    'crown',
    'upper-platforms',
    'mid-platforms',
    'habitat-ring',
    'service-orbit',
    'lower-interface',
    'planetary-interface',
  ]);

  const ys = orbitalCityRGXProfile.layers.map(layer => layer.y);
  assert.deepEqual([...ys].sort((a, b) => a - b), ys, 'reference strata must remain top-to-bottom ordered');
  assert.ok(orbitalCityRGXProfile.layers.every(layer => layer.y > 0 && layer.y < 1));
  assert.ok(orbitalCityRGXProfile.layers.every(layer => layer.rx > 0 && layer.ry > 0));

  const habitat = orbitalCityRGXProfile.layers.find(layer => layer.id === 'habitat-ring');
  const structural = orbitalCityRGXProfile.layers.filter(layer => layer.type === 'ring' || layer.type === 'habitat');
  assert.equal(Math.max(...structural.map(layer => layer.rx)), habitat.rx, 'habitat ring must remain the widest orbital stratum');
});

test('RGX microglyph density materially exceeds legacy full raster density', () => {
  assert.ok(GLYPH_SETS.micro.length >= 12);
  assert.equal(orbitalCityRGXProfile.density.glyphSet, 'micro');
  assert.equal(orbitalCityRGXProfile.density.desktopCellPx, 6);
  assert.equal(orbitalCityRGXProfile.density.mobileCellPx, 7);
  assert.ok(orbitalCityRGXProfile.density.targetDesktopColumnsAt1440 >= 200);
  const legacyFullColumnsAt1440 = Math.ceil(1440 / 10);
  assert.ok(
    orbitalCityRGXProfile.density.targetDesktopColumnsAt1440 >= legacyFullColumnsAt1440 * 1.6,
    'RGX must be substantially denser than legacy full mode',
  );
});

test('RGX procedural field is finite, normalized and mathematically closes at 24 seconds', () => {
  const probes = [
    [-0.72, -0.72],
    [-0.4, -0.2],
    [0, 0],
    [0.22, 0.19],
    [0.65, 0.58],
  ];

  assert.equal(holocoreOrbitalRGXScene.loopSeconds, 24);
  for (const [x, y] of probes) {
    const middle = holocoreOrbitalRGXScene.field(x, y, 7.7, pointer, seed);
    const start = holocoreOrbitalRGXScene.field(x, y, 0, pointer, seed);
    const end = holocoreOrbitalRGXScene.field(x, y, 24, pointer, seed);
    assert.equal(Number.isFinite(middle), true, `${x},${y}: non-finite`);
    assert.ok(middle >= 0 && middle <= 1, `${x},${y}: escaped [0,1]`);
    assert.ok(Math.abs(start - end) < 1e-10, `${x},${y}: loop seam ${start} vs ${end}`);
  }
});

test('RGX field resolves the reference landmarks encoded by the shared profile', () => {
  const byId = id => profileToField(orbitalCityRGXProfile.layers.find(layer => layer.id === id));
  const habitat = byId('habitat-ring');
  const crown = byId('crown');
  const atmosphere = byId('atmosphere');
  const planet = byId('planetary-interface');

  const samples = {
    habitatRim: holocoreOrbitalRGXScene.field(habitat.cx + habitat.rx, habitat.cy, 5, pointer, seed),
    crownRim: holocoreOrbitalRGXScene.field(crown.cx + crown.rx, crown.cy, 5, pointer, seed),
    axis: holocoreOrbitalRGXScene.field(0, 0.2, 5, pointer, seed),
    atmosphere: holocoreOrbitalRGXScene.field(atmosphere.cx, atmosphere.cy, 5, pointer, seed),
    planetRim: holocoreOrbitalRGXScene.field(planet.cx + planet.rx, planet.cy, 5, pointer, seed),
  };

  assert.ok(samples.habitatRim > 0.25, `habitat ring too weak: ${samples.habitatRim}`);
  assert.ok(samples.crownRim > 0.16, `crown ring too weak: ${samples.crownRim}`);
  assert.ok(samples.axis > 0.3, `axis too weak: ${samples.axis}`);
  assert.ok(samples.atmosphere > 0.02, `atmosphere unresolved: ${samples.atmosphere}`);
  assert.ok(samples.planetRim > 0.18, `planetary interface too weak: ${samples.planetRim}`);
});

test('RGX pointer perturbation remains bounded', () => {
  const active = Object.freeze({ x: 0.94, y: 0.07, active: true });
  for (const [x, y] of [[0, 0], [0.35, -0.22], [-0.55, 0.61]]) {
    const value = holocoreOrbitalRGXScene.field(x, y, 13.2, active, seed);
    assert.ok(value >= 0 && value <= 1);
  }
});
