import test from 'node:test';
import assert from 'node:assert/strict';
import { holocoreOrbitalScene } from '../src/kodex/ascii/scenes/holocore-orbital.js';

const pointer = Object.freeze({ x: 0.5, y: 0.5, active: false });
const seed = 17.25;

test('HoloCore orbital field remains normalized and finite', () => {
  for (let row = 0; row <= 12; row += 1) {
    const y = -1 + (row / 12) * 2;
    for (let column = 0; column <= 12; column += 1) {
      const x = -1 + (column / 12) * 2;
      const value = holocoreOrbitalScene.field(x, y, 7.3, pointer, seed);
      assert.equal(Number.isFinite(value), true, `non-finite field at ${x},${y}`);
      assert.ok(value >= 0 && value <= 1, `field escaped [0,1]: ${value}`);
    }
  }
});

test('HoloCore orbital field closes exactly on the declared 24 second loop', () => {
  assert.equal(holocoreOrbitalScene.loopSeconds, 24);

  const probes = [
    [-0.62, -0.51],
    [0, 0],
    [0.41, 0.04],
    [-0.3, 0.68],
    [0.2, 0.9],
  ];

  for (const [x, y] of probes) {
    const start = holocoreOrbitalScene.field(x, y, 0, pointer, seed);
    const end = holocoreOrbitalScene.field(x, y, 24, pointer, seed);
    assert.ok(Math.abs(start - end) < 1e-10, `loop seam at ${x},${y}: ${start} vs ${end}`);
  }
});

test('pointer perturbation does not change specimen contract or escape bounds', () => {
  const activePointer = { x: 0.91, y: 0.13, active: true };
  const value = holocoreOrbitalScene.field(0.2, -0.3, 11, activePointer, seed);
  assert.ok(value >= 0 && value <= 1);
  assert.equal(holocoreOrbitalScene.id, 'holocore-orbital');
  assert.match(holocoreOrbitalScene.message, /CLOSED PHASE LOOP/);
});
