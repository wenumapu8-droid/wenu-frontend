import test from 'node:test';
import assert from 'node:assert/strict';
import {
  HOLOCORE_DEFAULT_SPECIMEN_ID,
  HOLOCORE_SPECIMEN_IDS,
  getHoloCoreSpecimens,
  resolveHoloCoreSpecimen,
} from '../src/kodex/holocore/registry.js';

const pointer = Object.freeze({ x: 0.5, y: 0.5, active: false });
const seed = 17.25;

test('HoloCore registry exposes three unique query-addressable specimens', () => {
  assert.deepEqual(HOLOCORE_SPECIMEN_IDS, [
    'orbital-city',
    'signal-core',
    'interference-portal',
  ]);

  const specimens = getHoloCoreSpecimens();
  assert.equal(specimens.length, 3);
  assert.equal(new Set(specimens.map(specimen => specimen.id)).size, 3);
  assert.equal(new Set(specimens.map(specimen => specimen.scene.id)).size, 3);
  assert.equal(new Set(specimens.map(specimen => specimen.accent)).size, 3);
});

test('unknown HoloCore specimen IDs fall back deterministically', () => {
  assert.equal(HOLOCORE_DEFAULT_SPECIMEN_ID, 'orbital-city');
  assert.equal(resolveHoloCoreSpecimen('unknown').id, HOLOCORE_DEFAULT_SPECIMEN_ID);
});

test('every HoloCore registry field is finite, normalized and closes at 24 seconds', () => {
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
  const activePointer = Object.freeze({ x: 0.93, y: 0.08, active: true });
  for (const specimen of getHoloCoreSpecimens()) {
    const value = specimen.scene.field(0.21, -0.33, 13.5, activePointer, seed);
    assert.ok(value >= 0 && value <= 1, specimen.id);
  }
});
