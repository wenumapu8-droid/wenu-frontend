import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CORE_SCENE_ORDER,
  KODEX_SCENES,
  KODEX_ORBITALS,
  resolveSceneId,
  getSceneCandidates,
  validateSceneRegistry,
} from '../src/lib/kodex/scene-registry.js';
import {
  recommendNextScene,
  rankSceneCandidates,
  EXPERIENCE_POLICY,
} from '../src/lib/kodex/experience-engine.js';

test('registry covers the seven canonical core scenes', () => {
  const report = validateSceneRegistry();
  assert.equal(report.valid, true, report.errors.join('\n'));
  assert.equal(CORE_SCENE_ORDER.length, 7);
  assert.equal(Object.keys(KODEX_SCENES).length, 7);
  assert.deepEqual(
    CORE_SCENE_ORDER.map((key) => KODEX_SCENES[key].index),
    [0, 1, 2, 3, 4, 5, 6],
  );
});

test('routes resolve to canonical scenes', () => {
  assert.equal(resolveSceneId({ pathname: '/kodex/' }), 'threshold');
  assert.equal(resolveSceneId({ pathname: '/kodex/folio/i/' }), 'prologue');
  assert.equal(resolveSceneId({ pathname: '/kodex/folio/iii/' }), 'archive');
  assert.equal(resolveSceneId({ pathname: '/kodex/folio/vi/' }), 'return');
});

test('orbitals never become automatic routes by default', () => {
  assert.deepEqual(getSceneCandidates('archive').map((item) => item.key), ['machine']);
  const withOrbitals = getSceneCandidates('archive', { includeOrbitals: true });
  assert.ok(withOrbitals.some((item) => item.key === 'heart'));
  assert.equal(KODEX_ORBITALS.heart.routingStatus, 'SCENE_DEPENDENT');
});

test('recommendation is deterministic and does not optimize engagement', () => {
  const input = {
    currentScene: 'archive',
    history: ['threshold', 'prologue', 'descent', 'archive'],
    seed: 'fixture',
    allowOrbitals: true,
  };
  assert.deepEqual(recommendNextScene(input), recommendNextScene(input));
  assert.equal(EXPERIENCE_POLICY.autoNavigate, false);
  assert.ok(EXPERIENCE_POLICY.prohibitedObjectives.includes('time-on-site'));
  assert.ok(EXPERIENCE_POLICY.prohibitedObjectives.includes('activity-score'));
});

test('repeat history is penalized without becoming a hidden person score', () => {
  const ranked = rankSceneCandidates({
    currentScene: 'archive',
    history: ['machine', 'machine'],
    seed: 'x',
    allowOrbitals: true,
  });
  const machine = ranked.find((item) => item.key === 'machine');
  const heart = ranked.find((item) => item.key === 'heart');
  assert.ok(machine && heart);
  assert.ok(machine.visited > heart.visited);
});
