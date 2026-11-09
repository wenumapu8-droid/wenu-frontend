import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KODEX_V0_CHECKPOINTS,
  KODEX_V0_RELEASE_GATES,
  v0Readiness,
  validateV0Manifest,
} from '../src/lib/kodex/v0-vertical-slice.js';

test('V0 manifest is valid but not falsely production-ready', () => {
  const validation = validateV0Manifest();
  assert.equal(validation.valid, true, validation.errors.join('\n'));
  const readiness = v0Readiness();
  assert.equal(readiness.productionReady, false);
  assert.ok(readiness.blocked.includes('KDX-V0-02'));
});

test('creator-review artifact checkpoint remains blocked until approval', () => {
  const artifact = KODEX_V0_CHECKPOINTS.find((item) => item.id === 'KDX-V0-02');
  assert.ok(artifact);
  assert.equal(artifact.status, 'BLOCKED_CREATOR_REVIEW');
  assert.match(artifact.blockers.join(' '), /artworkSrc:null/);
});

test('deployment remains an explicit locked gate', () => {
  const deploy = KODEX_V0_RELEASE_GATES.find((gate) => gate.id === 'GATE-DEPLOY');
  assert.ok(deploy);
  assert.equal(deploy.status, 'LOCKED');
  assert.match(deploy.label, /APROBAR DEPLOY/);
});
