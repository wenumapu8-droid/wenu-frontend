import test from 'node:test';
import assert from 'node:assert/strict';

import {
  beatAtTime,
  beatProgress,
  validateMotionRecipe,
} from '../src/lib/kodex/motion-lab/schema.js';
import { SIGNAL_THRESHOLD_RECIPE } from '../src/lib/kodex/motion-lab/recipes.js';

test('SIGNAL_THRESHOLD recipe validates', () => {
  const result = validateMotionRecipe(SIGNAL_THRESHOLD_RECIPE);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test('validator rejects duplicate beat ids', () => {
  const recipe = structuredClone(SIGNAL_THRESHOLD_RECIPE);
  recipe.beats[1].id = recipe.beats[0].id;
  const result = validateMotionRecipe(recipe);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /Duplicate beat id/);
});

test('validator rejects beats outside recipe duration', () => {
  const recipe = structuredClone(SIGNAL_THRESHOLD_RECIPE);
  recipe.beats.at(-1).end = recipe.duration + 1;
  const result = validateMotionRecipe(recipe);
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /exceeds recipe duration/);
});

test('beatAtTime resolves deterministic semantic boundaries', () => {
  assert.equal(beatAtTime(SIGNAL_THRESHOLD_RECIPE, 0)?.type, 'VOID');
  assert.equal(beatAtTime(SIGNAL_THRESHOLD_RECIPE, 2)?.type, 'SIGNAL');
  assert.equal(beatAtTime(SIGNAL_THRESHOLD_RECIPE, 6.2)?.type, 'LOCK');
  assert.equal(beatAtTime(SIGNAL_THRESHOLD_RECIPE, 12)?.type, 'RETURN');
});

test('beatProgress clamps to the active beat span', () => {
  const beat = SIGNAL_THRESHOLD_RECIPE.beats[1];
  assert.equal(beatProgress(beat, beat.start - 1), 0);
  assert.equal(beatProgress(beat, beat.end + 1), 1);
  assert.ok(Math.abs(beatProgress(beat, (beat.start + beat.end) / 2) - 0.5) < 1e-9);
});
