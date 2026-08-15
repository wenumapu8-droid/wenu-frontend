import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveManifestationVisual } from '../src/lib/kodex/manifestation-visual-resolver.js';

test('REALIZED uses an explicitly registered node HoloCore when available', () => {
  const resolved = resolveManifestationVisual({
    phase: 'REALIZED',
    nodeId: 'KDX-NODE-SIGNAL-SEED',
    visualSpecimenId: 'living-organism',
  });

  assert.deepEqual(resolved, {
    specimenId: 'signal-seed',
    source: 'NODE_MAP',
    nodeId: 'KDX-NODE-SIGNAL-SEED',
  });
});

test('non-REALIZED phases retain their phase visual even for a mapped node', () => {
  const resolved = resolveManifestationVisual({
    phase: 'INTERFERENCE',
    nodeId: 'KDX-NODE-SIGNAL-SEED',
    visualSpecimenId: 'interference-portal',
  });

  assert.equal(resolved.specimenId, 'interference-portal');
  assert.equal(resolved.source, 'PHASE_MAP');
});

test('unknown REALIZED nodes retain the explicit phase fallback rather than claiming a node mapping', () => {
  const resolved = resolveManifestationVisual({
    phase: 'REALIZED',
    nodeId: 'KDX-NODE-UNKNOWN',
    visualSpecimenId: 'living-organism',
  });

  assert.deepEqual(resolved, {
    specimenId: 'living-organism',
    source: 'PHASE_MAP',
    nodeId: 'KDX-NODE-UNKNOWN',
  });
});
