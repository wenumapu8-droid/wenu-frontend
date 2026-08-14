import assert from 'node:assert/strict';
import test from 'node:test';

import { assemblePlateSpec } from '../src/lib/kodex/grammar/deterministic-assembler.js';
import { KDX_GOLDEN_PLATE_CASES } from '../src/lib/kodex/grammar/golden-plate-benchmark.v0.1.js';
import {
  KDX_ASSEMBLY_QA_PROFILE,
  auditUnrenderedPlateSpec,
  promoteQaWithBrowserEvidence,
} from '../src/lib/kodex/grammar/assembly-qa.js';

test('Assembly QA profile forbids implicit human/aesthetic acceptance', () => {
  assert.equal(KDX_ASSEMBLY_QA_PROFILE.contractBeforeRender, true);
  assert.equal(KDX_ASSEMBLY_QA_PROFILE.humanAcceptanceInferred, false);
});

test('all 12 Golden Plate specs pass contract lane but remain PARTIAL until actually rendered', () => {
  for (const entry of KDX_GOLDEN_PLATE_CASES) {
    const spec = assemblePlateSpec(entry.node, entry.plate_type, entry.seed);
    const qa = auditUnrenderedPlateSpec(spec, `benchmark:${entry.case_id}`);
    assert.equal(qa.contract_status, 'PASS', `${entry.case_id}: ${qa.blockers.join(', ')}`);
    assert.equal(qa.validation_scope, 'CONTRACT_ONLY');
    assert.equal(qa.render_status, 'NOT_RUN');
    assert.equal(qa.overall_status, 'PARTIAL');
    assert.equal(qa.browser_validated, false);
    assert.ok(qa.blockers.includes('RENDER_BROWSER_EVIDENCE_NOT_RUN'));
    assert.ok(qa.render_checks.every((check) => check.status === 'NOT_RUN'));
  }
});

test('protected artwork contract failures cannot be hidden behind unrun browser QA', () => {
  const entry = KDX_GOLDEN_PLATE_CASES.find((item) => item.domain === 'art' && item.plate_type === 'ACTIVATOR_PLATE');
  const spec = structuredClone(assemblePlateSpec(entry.node, entry.plate_type, entry.seed));
  spec.artwork_contract.crop_allowed = true;
  const qa = auditUnrenderedPlateSpec(spec, 'test:broken-art');
  assert.equal(qa.contract_status, 'FAIL');
  assert.equal(qa.overall_status, 'FAIL');
  assert.equal(qa.browser_validated, false);
  assert.ok(qa.blockers.includes('ARTWORK_INTEGRITY'));
});

test('living-field activator does not receive fabricated NO_CROP semantics', () => {
  const entry = KDX_GOLDEN_PLATE_CASES.find((item) => item.node_id === 'CON-RITUAL');
  const spec = assemblePlateSpec(entry.node, entry.plate_type, entry.seed);
  const qa = auditUnrenderedPlateSpec(spec, 'test:living-field');
  const artCheck = qa.contract_checks.find((check) => check.check_id === 'ARTWORK_INTEGRITY');
  assert.equal(spec.primary_payload.payload_type, 'FIELD');
  assert.equal(spec.artwork_contract, null);
  assert.equal(artCheck.status, 'NOT_APPLICABLE');
  assert.equal(qa.contract_status, 'PASS');
});

test('browser promotion requires explicit evidence and all required browser gates', () => {
  const entry = KDX_GOLDEN_PLATE_CASES[0];
  const spec = assemblePlateSpec(entry.node, entry.plate_type, entry.seed);
  const contractQa = auditUnrenderedPlateSpec(spec, 'test:browser-promote');

  assert.throws(() => promoteQaWithBrowserEvidence(contractQa, {}), /evidence_ref/);

  const failed = promoteQaWithBrowserEvidence(contractQa, {
    evidence_ref: 'artifact:browser-run-x',
    '100dvh': true,
    no_page_scroll: true,
    mobile: true,
    keyboard_focus: false,
    reduced_motion: true,
    performance: true,
  });
  assert.equal(failed.browser_validated, false);
  assert.equal(failed.render_status, 'FAIL');
  assert.ok(failed.blockers.includes('BROWSER_KEYBOARD_FOCUS'));

  const passed = promoteQaWithBrowserEvidence(contractQa, {
    evidence_ref: 'artifact:browser-run-y',
    '100dvh': true,
    no_page_scroll: true,
    mobile: true,
    keyboard_focus: true,
    reduced_motion: true,
    performance: true,
  });
  assert.equal(passed.validation_scope, 'CONTRACT_AND_RENDER');
  assert.equal(passed.contract_status, 'PASS');
  assert.equal(passed.render_status, 'PASS');
  assert.equal(passed.overall_status, 'PASS');
  assert.equal(passed.browser_validated, true);
  assert.equal(passed.blockers.length, 0);
});

test('browser evidence cannot promote a failing contract', () => {
  const entry = KDX_GOLDEN_PLATE_CASES[0];
  const spec = structuredClone(assemblePlateSpec(entry.node, entry.plate_type, entry.seed));
  spec.provenance_refs = [];
  const contractQa = auditUnrenderedPlateSpec(spec, 'test:no-provenance');
  assert.equal(contractQa.contract_status, 'FAIL');
  assert.throws(() => promoteQaWithBrowserEvidence(contractQa, { evidence_ref: 'artifact:any' }), /contract validation is not PASS/);
});
