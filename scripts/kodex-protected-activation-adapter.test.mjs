import assert from 'node:assert/strict';
import test from 'node:test';

import {
  KDX_PROTECTED_ACTIVATION_ADAPTER_PROFILE,
  KdxProtectedActivationError,
  buildProtectedOcinActivationInput,
  tryBuildProtectedOcinActivationInput,
} from '../src/lib/kodex/grammar/protected-activation-adapter.js';
import { OCIN_PROTECTED_ACTIVATOR_IDS } from '../src/lib/kodex/ocin/protected-activators-v0.js';

const EXPECTED_ACTIVATIONS = new Map([
  ['OCN-TOR-001', 'INWARD_SCALE'],
  ['OCN-SQR-001', 'PERIMETER_TRACE'],
  ['OCN-MND-GRY-002', 'APERTURE_BREATH'],
]);

test('adapter is explicitly non-mutating and source-byte-free', () => {
  assert.equal(KDX_PROTECTED_ACTIVATION_ADAPTER_PROFILE.mutatesOriginal, false);
  assert.equal(KDX_PROTECTED_ACTIVATION_ADAPTER_PROFILE.embedsSourceBytes, false);
});

test('all registered protected Ocín activators compile to strict artwork + environment contracts', () => {
  assert.equal(OCIN_PROTECTED_ACTIVATOR_IDS.length, 3);
  for (const artworkId of OCIN_PROTECTED_ACTIVATOR_IDS) {
    const contract = buildProtectedOcinActivationInput(artworkId);
    assert.equal(contract.primary_payload.payload_type, 'ARTWORK');
    assert.equal(contract.primary_payload.payload_ref, artworkId);
    assert.equal(contract.artwork_contract.artwork_id, artworkId);
    assert.equal(contract.artwork_contract.full_view_required, true);
    assert.equal(contract.artwork_contract.preserve_aspect, true);
    assert.equal(contract.artwork_contract.crop_allowed, false);
    assert.equal(contract.artwork_contract.recolor_source_allowed, false);
    assert.equal(contract.artwork_contract.distort_source_allowed, false);
    assert.equal(contract.artwork_contract.source_bytes_renderable, false);
    assert.equal(contract.activation_profile.activation_id, EXPECTED_ACTIVATIONS.get(artworkId));
    assert.equal(contract.activation_profile.explicit_action_required, true);
    assert.equal(contract.activation_profile.environment_only, true);
    assert.equal(contract.release_state.source_bytes_renderable, false);
    assert.ok(contract.provenance_refs.every((ref) => ref.includes(artworkId)));
    assert.notEqual(contract.release_state.publication_status, 'APPROVED_FOR_PUBLIC_EXPORT');
  }
});

test('adapter never treats registry identity as public-export approval', () => {
  const contract = buildProtectedOcinActivationInput('OCN-TOR-001');
  assert.equal(contract.release_state.publication_status, 'NOT_APPROVED_FOR_PUBLIC_EXPORT');
  assert.equal(contract.release_state.rights_status, 'CREATOR_OWNED_REVIEW_REQUIRED');
});

test('unknown artwork fails structurally instead of synthesizing an activation', () => {
  assert.throws(
    () => buildProtectedOcinActivationInput('OCN-NOT-REGISTERED'),
    (error) => error instanceof KdxProtectedActivationError && error.code === 'UNKNOWN_OCIN_ARTWORK',
  );
  const result = tryBuildProtectedOcinActivationInput('OCN-NOT-REGISTERED');
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'UNKNOWN_OCIN_ARTWORK');
});

test('explicit-action setting can only alter activation agency, not artwork integrity', () => {
  const contract = buildProtectedOcinActivationInput('OCN-SQR-001', { explicitActionRequired: false });
  assert.equal(contract.activation_profile.explicit_action_required, false);
  assert.equal(contract.artwork_contract.full_view_required, true);
  assert.equal(contract.artwork_contract.crop_allowed, false);
  assert.equal(contract.artwork_contract.source_bytes_renderable, false);
});
