import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GESTURE_TIMELINE_VERSION,
  GESTURE_PHASE_BOUNDS,
  accumulateSceneProgress,
  clampSceneProgress,
  initialSceneProgress,
  resolveGesturePhase,
} from '../src/lib/kodex/gesture-timeline.js';

test('gesture timeline module is versioned', () => {
  assert.equal(GESTURE_TIMELINE_VERSION, 'gesture-timeline-v0.1.0');
});

test('clampSceneProgress bounds to 0..1 and rejects non-numbers', () => {
  assert.equal(clampSceneProgress(-0.4), 0);
  assert.equal(clampSceneProgress(1.7), 1);
  assert.equal(clampSceneProgress(0.42), 0.42);
  assert.equal(clampSceneProgress(Number.NaN), 0);
  assert.equal(clampSceneProgress(undefined), 0);
});

test('resolveGesturePhase maps progress to dormant/aware/open at documented bounds', () => {
  assert.equal(resolveGesturePhase(0), 'dormant');
  assert.equal(resolveGesturePhase(GESTURE_PHASE_BOUNDS.AWARE - 0.01), 'dormant');
  assert.equal(resolveGesturePhase(GESTURE_PHASE_BOUNDS.AWARE), 'aware');
  assert.equal(resolveGesturePhase(GESTURE_PHASE_BOUNDS.OPEN - 0.01), 'aware');
  assert.equal(resolveGesturePhase(GESTURE_PHASE_BOUNDS.OPEN), 'open');
  assert.equal(resolveGesturePhase(1), 'open');
});

test('accumulateSceneProgress integrates raw delta and stays clamped', () => {
  let progress = 0;
  progress = accumulateSceneProgress(progress, 100);
  assert.ok(progress > 0 && progress < 1);
  progress = accumulateSceneProgress(progress, 100000);
  assert.equal(progress, 1);
  progress = accumulateSceneProgress(progress, -100000);
  assert.equal(progress, 0);
});

test('accumulateSceneProgress ignores invalid deltas without throwing', () => {
  assert.equal(accumulateSceneProgress(0.3, Number.NaN), 0.3);
  assert.equal(accumulateSceneProgress(0.3, undefined), 0.3);
});

test('initialSceneProgress starts dormant by default and open when reduced motion is requested', () => {
  assert.equal(initialSceneProgress(), 0);
  assert.equal(resolveGesturePhase(initialSceneProgress()), 'dormant');
  assert.equal(initialSceneProgress({ reducedMotion: true }), 1);
  assert.equal(resolveGesturePhase(initialSceneProgress({ reducedMotion: true })), 'open');
});
