import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOLOCORE_RGX_PROFILE_IDS,
  resolveHoloCoreRGXProfile,
} from '../src/kodex/holocore/reference-profiles/rgx-family.js';
import { resolveHoloCoreRGXScene } from '../src/kodex/ascii/scenes/holocore-rgx-family.js';
import { buildHoloCoreRGXScaffold, scaffoldStats } from '../src/kodex/holocore/reference-profiles/rgx-scaffold.js';

const EXPECTED = [
  'orbital-city',
  'signal-core',
  'interference-portal',
  'signal-vortex',
  'dna-ascent',
  'memory-tree',
  'skull-archive',
  'cosmology-orbit',
  'field-of-eyes',
  'heart-chamber',
  'source-chamber',
  'return-gate',
  'living-organism',
  'signal-seed',
];

const LANDMARKS = Object.freeze({
  'orbital-city': primitives => {
    assert.equal(primitives.filter(p => p.id?.startsWith('habitat-spoke-')).length, 16);
    assert.ok(primitives.some(p => p.id === 'planet'));
  },
  'signal-core': primitives => {
    assert.ok(primitives.some(p => p.id === 'core'));
    assert.equal(primitives.filter(p => p.id?.startsWith('cage-')).length, 4);
    assert.equal(primitives.filter(p => p.id?.startsWith('node-')).length, 18);
  },
  'interference-portal': primitives => {
    assert.ok(primitives.some(p => p.id === 'aperture'));
    assert.equal(primitives.filter(p => p.id?.startsWith('stabilizer-') && !p.id.includes('node')).length, 6);
  },
  'signal-vortex': primitives => {
    assert.equal(primitives.filter(p => p.id?.startsWith('spiral-')).length, 5);
    assert.ok(primitives.some(p => p.id === 'vortex-core'));
  },
  'dna-ascent': primitives => {
    assert.ok(primitives.some(p => p.id === 'strand-a'));
    assert.ok(primitives.some(p => p.id === 'strand-b'));
    assert.equal(primitives.filter(p => p.id?.startsWith('rung-')).length, 20);
  },
  'memory-tree': primitives => {
    assert.ok(primitives.some(p => p.id === 'trunk'));
    assert.ok(primitives.some(p => p.id === 'root-l0'));
    assert.ok(primitives.some(p => p.id === 'root-r0'));
  },
  'skull-archive': primitives => {
    assert.ok(primitives.some(p => p.id === 'cranium'));
    assert.ok(primitives.some(p => p.id === 'left-eye'));
    assert.ok(primitives.some(p => p.id === 'right-eye'));
  },
  'cosmology-orbit': primitives => {
    assert.equal(primitives.filter(p => p.id?.startsWith('orbit-') && !p.id.includes('node')).length, 5);
    assert.ok(primitives.some(p => p.id === 'axis-v'));
  },
  'field-of-eyes': primitives => {
    assert.equal(primitives.filter(p => p.id?.startsWith('eye-')).length, 43);
    assert.equal(primitives.filter(p => p.id?.startsWith('pupil-')).length, 43);
  },
  'heart-chamber': primitives => {
    assert.ok(primitives.some(p => p.id === 'heart-contour'));
    assert.equal(primitives.filter(p => p.id?.startsWith('heart-ring-')).length, 3);
  },
  'source-chamber': primitives => {
    assert.ok(primitives.some(p => p.id === 'source-sphere'));
    assert.equal(primitives.filter(p => p.id?.startsWith('petal-')).length, 12);
  },
  'return-gate': primitives => {
    assert.equal(primitives.filter(p => p.id?.startsWith('gate-')).length, 5);
    assert.ok(primitives.some(p => p.id === 'horizon'));
  },
  'living-organism': primitives => {
    assert.ok(primitives.some(p => p.id === 'membrane'));
    assert.equal(primitives.filter(p => p.id?.startsWith('chamber-')).length, 6);
  },
  'signal-seed': primitives => {
    assert.ok(primitives.some(p => p.id === 'seed-shell'));
    assert.equal(primitives.filter(p => p.id?.startsWith('chamber-')).length, 5);
  },
});

const pointerIdle = Object.freeze({ x: 0.5, y: 0.5, active: false });
const pointerActive = Object.freeze({ x: 0.91, y: 0.08, active: true });

function sampleScene(scene, t, pointer = pointerIdle) {
  const values = [];
  for (let yi = 0; yi <= 10; yi += 1) {
    const y = -1 + (yi / 10) * 2;
    for (let xi = 0; xi <= 12; xi += 1) {
      const x = -1 + (xi / 12) * 2;
      values.push(scene.field(x, y, t, pointer, 17.25));
    }
  }
  return values;
}

test('RGX family contains exactly the 14 semantic HoloCore cores', () => {
  assert.deepEqual([...HOLOCORE_RGX_PROFILE_IDS], EXPECTED);
  assert.equal(HOLOCORE_RGX_PROFILE_IDS.includes('toroidal-field'), false, 'benchmark must remain outside semantic family');
});

for (const id of EXPECTED) {
  test(`RGX profile contract: ${id}`, () => {
    const profile = resolveHoloCoreRGXProfile(id);
    assert.equal(profile.conceptId, id);
    assert.equal(profile.id, `${id}-rgx-v1`);
    assert.equal(profile.loopSeconds, 24);
    assert.ok(profile.motif);
    assert.ok(profile.topology);
    assert.ok(profile.sourceStatus);
    assert.ok(profile.epistemicStatus);
    assert.ok(Array.isArray(profile.sourceRefs) && profile.sourceRefs.length > 0);
    assert.equal(profile.density.desktopCellPx, 6);
    assert.equal(profile.density.mobileCellPx, 7);
    assert.equal(profile.density.glyphSet, 'micro');
    assert.equal('imageSrc' in profile, false);
    assert.equal('src' in profile, false);
  });

  test(`RGX procedural field is finite, normalized and loop-closed: ${id}`, () => {
    const scene = resolveHoloCoreRGXScene(id);
    const zero = sampleScene(scene, 0);
    const seam = sampleScene(scene, 24);
    const interactive = sampleScene(scene, 7.3, pointerActive);
    assert.equal(zero.length, seam.length);
    zero.forEach((value, index) => {
      assert.ok(Number.isFinite(value), `${id}: non-finite field value`);
      assert.ok(value >= 0 && value <= 1, `${id}: value out of [0,1] (${value})`);
      assert.ok(Math.abs(value - seam[index]) <= 1e-8, `${id}: loop seam drift at sample ${index}: ${value} vs ${seam[index]}`);
    });
    interactive.forEach(value => {
      assert.ok(Number.isFinite(value));
      assert.ok(value >= 0 && value <= 1);
    });
  });

  test(`RGX vector scaffold preserves reference landmarks: ${id}`, () => {
    const primitives = buildHoloCoreRGXScaffold(id);
    const stats = scaffoldStats(primitives);
    assert.ok(primitives.length >= 8, `${id}: scaffold too sparse (${primitives.length})`);
    assert.ok(stats.primary >= 1, `${id}: missing primary structural primitive`);
    assert.equal(primitives.some(p => 'src' in p || 'href' in p), false, `${id}: source/raster reference leaked into scaffold`);
    LANDMARKS[id](primitives);
  });
}
