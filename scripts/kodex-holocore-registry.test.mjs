import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOLOCORE_DEFAULT_SPECIMEN_ID,
  HOLOCORE_NODE_MAP,
  HOLOCORE_SPECIMEN_IDS,
  getHoloCoreSpecimens,
  resolveHoloCoreForNode,
  resolveHoloCoreSpecimen,
} from '../src/kodex/holocore/registry.js';

const pointer = Object.freeze({ x: 0.5, y: 0.5, active: false });
const seed = 17.25;

const EXPECTED_IDS = [
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
  'toroidal-field',
];

test('HoloCore registry exposes fifteen unique query-addressable core archetypes', () => {
  assert.deepEqual(HOLOCORE_SPECIMEN_IDS, EXPECTED_IDS);

  const specimens = getHoloCoreSpecimens();
  assert.equal(specimens.length, EXPECTED_IDS.length);
  assert.equal(new Set(specimens.map(specimen => specimen.id)).size, EXPECTED_IDS.length);
  assert.equal(new Set(specimens.map(specimen => specimen.scene.id)).size, EXPECTED_IDS.length);
  assert.equal(new Set(specimens.map(specimen => specimen.archetype)).size, EXPECTED_IDS.length);

  for (const specimen of specimens) {
    assert.equal(specimen.sourceRefs.length > 0, true, `${specimen.id}: missing Atlas/source reference`);
    assert.equal(typeof specimen.topology, 'string', `${specimen.id}: missing topology`);
    assert.equal(typeof specimen.epistemic, 'string', `${specimen.id}: missing epistemic layer`);
  }
});

test('toroidal perceptual benchmark is admitted without inventing a canonical node mapping', () => {
  const torus = resolveHoloCoreSpecimen('toroidal-field');
  assert.equal(torus.id, 'toroidal-field');
  assert.equal(torus.sourceStatus, 'INTERNAL_BENCHMARK');
  assert.equal(torus.provenance, 'KODEX_SYNTHETIC_PERCEPTUAL_BENCHMARK');
  assert.equal(Object.values(HOLOCORE_NODE_MAP).includes('toroidal-field'), false);
});

test('unknown HoloCore specimen IDs fall back deterministically', () => {
  assert.equal(HOLOCORE_DEFAULT_SPECIMEN_ID, 'orbital-city');
  assert.equal(resolveHoloCoreSpecimen('unknown').id, HOLOCORE_DEFAULT_SPECIMEN_ID);
});

test('node-to-HoloCore mapping resolves representative canonical concepts without inventing a second routing system', () => {
  assert.equal(resolveHoloCoreForNode('KDX-NODE-DNA-ASCENT').id, 'dna-ascent');
  assert.equal(resolveHoloCoreForNode('KDX-NODE-HEART-M').id, 'heart-chamber');
  assert.equal(resolveHoloCoreForNode('KDX-NODE-FIELD-OF-EYES').id, 'field-of-eyes');
  assert.equal(resolveHoloCoreForNode('KDX-NODE-RETURN').id, 'return-gate');
  assert.equal(resolveHoloCoreForNode('KDX-NODE-SIGNAL-SEED').id, 'signal-seed');
  assert.equal(resolveHoloCoreForNode('KDX-NODE-NOT-REGISTERED').id, HOLOCORE_DEFAULT_SPECIMEN_ID);
  assert.equal(Object.keys(HOLOCORE_NODE_MAP).length >= 20, true);
});

test('every HoloCore registry field is finite, normalized and closes exactly at 24 seconds', () => {
  const probes = [
    [-0.71, -0.62],
    [-0.35, 0.15],
    [0, 0],
    [0.27, -0.31],
    [0.64, 0.53],
  ];

  for (const specimen of getHoloCoreSpecimens()) {
    assert.equal(specimen.scene.loopSeconds, 24, specimen.id);
    assert.equal(specimen.palette.length >= 2, true, specimen.id);
    assert.match(specimen.provenance, /^KODEX_/);

    for (const [x, y] of probes) {
      const mid = specimen.scene.field(x, y, 7.3, pointer, seed);
      const start = specimen.scene.field(x, y, 0, pointer, seed);
      const end = specimen.scene.field(x, y, 24, pointer, seed);

      assert.equal(Number.isFinite(mid), true, `${specimen.id}: non-finite at ${x},${y}`);
      assert.ok(mid >= 0 && mid <= 1, `${specimen.id}: escaped [0,1] at ${x},${y}: ${mid}`);
      assert.ok(
        Math.abs(start - end) < 1e-10,
        `${specimen.id}: loop seam at ${x},${y}: ${start} vs ${end}`,
      );
    }
  }
});

test('pointer perturbation stays bounded for all registered HoloCore fields', () => {
  const activePointers = [
    Object.freeze({ x: 0.93, y: 0.08, active: true }),
    Object.freeze({ x: 0.08, y: 0.91, active: true }),
  ];

  for (const specimen of getHoloCoreSpecimens()) {
    for (const activePointer of activePointers) {
      const value = specimen.scene.field(0.21, -0.33, 13.5, activePointer, seed);
      assert.ok(value >= 0 && value <= 1, specimen.id);
    }
  }
});
