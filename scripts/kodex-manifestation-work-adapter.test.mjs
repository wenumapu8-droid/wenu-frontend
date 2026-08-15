import test from 'node:test';
import assert from 'node:assert/strict';

import { buildWorkManifestation } from '../src/lib/kodex/grammar/manifestation-work-adapter.js';

const baseOrder = {
  work_id: 'KDX-WORK-ASSEMBLE-SCI-BIOLOGY-001',
  version: '0.1.0',
  event_type: 'PLATE_REQUESTED',
  station_id: 'A5_ELEMENT_ASSEMBLER',
  target_id: 'SCI-BIOLOGY',
  desired_state_ref: 'schema:kdx_plate_spec.schema.json',
  input_refs: ['node:SCI-BIOLOGY', 'registry:kdx_element_registry.v0.1.json'],
  allowed_writes: ['/plate_spec'],
  prohibited_writes: ['/canon', '/provenance', '/rights', '/release'],
  validator_set: ['SCHEMA', 'PROVENANCE', 'RIGHTS', 'DETERMINISM'],
  retry_policy: { mode: 'MECHANICAL_ONLY', max_attempts: 2 },
  idempotency_key: 'assemble|SCI-BIOLOGY|KNOWLEDGE|seed-01',
  seed: 'seed-01',
  priority: 80,
  parent_work_id: null,
  provenance_refs: ['drive:28_KODEX_ASSEMBLY_OS'],
  status: 'QUEUED',
  worker_policy: { allowed_worker_kinds: ['SCRIPT', 'AGENT', 'HUMAN'], generative_required: false },
  release_gate: 'NONE',
};

function passingResult(order = baseOrder) {
  return {
    result_id: 'KDX-RESULT-SCRIPT-001',
    version: '0.1.0',
    work_id: order.work_id,
    station_id: order.station_id,
    worker_kind: 'SCRIPT',
    status: 'PASS',
    output_refs: ['artifact:plate-spec'],
    write_manifest: [{ path: '/plate_spec', value_ref: 'artifact:plate-spec', operation: 'CREATE' }],
    validator_results: order.validator_set.map(validator_id => ({ validator_id, status: 'PASS', evidence_ref: `test:${validator_id}` })),
    provenance_refs: ['test:station-result'],
    blockers: [],
    next_event_type: 'PLATE_ASSEMBLED',
    idempotency_key: order.idempotency_key,
    human_review_required: false,
    release_authorized: false,
  };
}

const passingQa = {
  qa_result_id: 'KDX-QA-SCI-BIOLOGY',
  overall_status: 'PASS',
  blockers: [],
};

test('QUEUED work remains POTENTIAL without inventing blockers', () => {
  const result = buildWorkManifestation({ order: baseOrder });
  assert.equal(result.view.phase, 'POTENTIAL');
  assert.equal(result.blockers.length, 0);
  assert.equal(result.view.causalLoad, 0);
});

test('RUNNING valid work becomes TRANSFORMING', () => {
  const result = buildWorkManifestation({ order: { ...baseOrder, status: 'RUNNING' } });
  assert.equal(result.view.phase, 'TRANSFORMING');
  assert.equal(result.view.blocked, false);
});

test('explicit BLOCKED work becomes INTERFERENCE through a dependency blocker', () => {
  const result = buildWorkManifestation({ order: { ...baseOrder, status: 'BLOCKED' } });
  assert.equal(result.view.phase, 'INTERFERENCE');
  assert.equal(result.blockers.some(blocker => blocker.type === 'DEPENDENCY'), true);
});

test('COMPLETE work cannot become REALIZED without StationResult and QA evidence', () => {
  const result = buildWorkManifestation({ order: { ...baseOrder, status: 'COMPLETE' } });
  assert.equal(result.view.phase, 'INTERFERENCE');
  assert.equal(result.blockers.some(blocker => blocker.id.includes('STATION_RESULT_MISSING')), true);
  assert.equal(result.blockers.some(blocker => blocker.id.includes('QA_RESULT_MISSING')), true);
});

test('COMPLETE work becomes REALIZED only when station and QA both pass', () => {
  const order = { ...baseOrder, status: 'COMPLETE' };
  const result = buildWorkManifestation({ order, stationResult: passingResult(order), qaResult: passingQa });
  assert.equal(result.view.phase, 'REALIZED');
  assert.equal(result.view.realized, true);
  assert.equal(result.blockers.length, 0);
});

test('QA rights blockers translate to RIGHTS_GATE without changing QA authority', () => {
  const order = { ...baseOrder, status: 'VALIDATING' };
  const qaResult = {
    qa_result_id: 'KDX-QA-RIGHTS',
    overall_status: 'FAIL',
    blockers: ['RIGHTS_STATUS'],
  };
  const result = buildWorkManifestation({ order, qaResult });
  assert.equal(result.view.phase, 'INTERFERENCE');
  assert.equal(result.blockers.some(blocker => blocker.type === 'RIGHTS_GATE'), true);
});

test('invalid StationResult becomes a CONTRADICTION rather than a realized state', () => {
  const order = { ...baseOrder, status: 'COMPLETE' };
  const stationResult = passingResult(order);
  stationResult.station_id = 'A7_COPY_STATION';
  const result = buildWorkManifestation({ order, stationResult, qaResult: passingQa });
  assert.equal(result.view.phase, 'INTERFERENCE');
  assert.equal(result.blockers.some(blocker => blocker.type === 'CONTRADICTION'), true);
});
