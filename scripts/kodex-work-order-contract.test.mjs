import assert from 'node:assert/strict';
import test from 'node:test';

import {
  KDX_WORK_ORDER_CONTRACT_PROFILE,
  KdxWorkContractError,
  assertStationResultAgainstWorkOrder,
  validateStationResultAgainstWorkOrder,
  validateWorkOrder,
} from '../src/lib/kodex/grammar/work-order-contract.js';

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

function passingResult(worker_kind) {
  return {
    result_id: `KDX-RESULT-${worker_kind}-001`,
    version: '0.1.0',
    work_id: baseOrder.work_id,
    station_id: baseOrder.station_id,
    worker_kind,
    status: 'PASS',
    output_refs: [`artifact:${worker_kind.toLowerCase()}-plate-spec`],
    write_manifest: [{ path: '/plate_spec', value_ref: `artifact:${worker_kind.toLowerCase()}-plate-spec`, operation: 'CREATE' }],
    validator_results: baseOrder.validator_set.map((validator_id) => ({ validator_id, status: 'PASS', evidence_ref: `test:${validator_id}` })),
    provenance_refs: ['test:station-result'],
    blockers: [],
    next_event_type: 'PLATE_ASSEMBLED',
    idempotency_key: baseOrder.idempotency_key,
    human_review_required: false,
    release_authorized: false,
  };
}

test('worker identity does not change correctness contract', () => {
  assert.equal(KDX_WORK_ORDER_CONTRACT_PROFILE.workerKindsInterchangeable, true);
  assert.equal(KDX_WORK_ORDER_CONTRACT_PROFILE.workerIdentityChangesAuthority, false);
  assert.equal(validateWorkOrder(baseOrder).valid, true);
  for (const kind of ['SCRIPT', 'AGENT', 'HUMAN']) {
    const validation = validateStationResultAgainstWorkOrder(baseOrder, passingResult(kind));
    assert.equal(validation.valid, true, `${kind}: ${validation.errors.join(', ')}`);
  }
});

test('undeclared or prohibited writes are rejected regardless of worker kind', () => {
  for (const kind of ['SCRIPT', 'AGENT', 'HUMAN']) {
    const undeclared = passingResult(kind);
    undeclared.write_manifest = [{ path: '/new_visual_language', value_ref: 'artifact:x', operation: 'CREATE' }];
    const a = validateStationResultAgainstWorkOrder(baseOrder, undeclared);
    assert.ok(a.errors.includes('UNDECLARED_WRITE:/new_visual_language'));

    const prohibited = passingResult(kind);
    prohibited.write_manifest = [{ path: '/canon', value_ref: 'artifact:y', operation: 'UPDATE' }];
    const b = validateStationResultAgainstWorkOrder(baseOrder, prohibited);
    assert.ok(b.errors.includes('PROHIBITED_WRITE:/canon'));
  }
});

test('PASS requires every declared validator to have actually passed', () => {
  const result = passingResult('SCRIPT');
  result.validator_results = result.validator_results.filter((item) => item.validator_id !== 'RIGHTS');
  const missing = validateStationResultAgainstWorkOrder(baseOrder, result);
  assert.ok(missing.errors.some((error) => error.startsWith('MISSING_VALIDATORS:')));
  assert.ok(missing.errors.some((error) => error.startsWith('UNPASSED_VALIDATORS:')));

  const failed = passingResult('AGENT');
  failed.validator_results.find((item) => item.validator_id === 'PROVENANCE').status = 'FAIL';
  const failedValidation = validateStationResultAgainstWorkOrder(baseOrder, failed);
  assert.ok(failedValidation.errors.some((error) => error.startsWith('UNPASSED_VALIDATORS:')));
});

test('idempotency and station identity are hard boundaries', () => {
  const result = passingResult('SCRIPT');
  result.idempotency_key = 'different-key';
  result.station_id = 'A7_COPY_STATION';
  const validation = validateStationResultAgainstWorkOrder(baseOrder, result);
  assert.ok(validation.errors.includes('IDEMPOTENCY_MISMATCH'));
  assert.ok(validation.errors.includes('STATION_MISMATCH'));
  assert.throws(
    () => assertStationResultAgainstWorkOrder(baseOrder, result),
    (error) => error instanceof KdxWorkContractError && error.code === 'STATION_RESULT_REJECTED',
  );
});

test('script or agent cannot authorize release; human release requires publisher + RELEASE_APPROVED shape', () => {
  const script = passingResult('SCRIPT');
  script.release_authorized = true;
  assert.ok(validateStationResultAgainstWorkOrder(baseOrder, script).errors.includes('UNAUTHORIZED_RELEASE'));

  const publisherOrder = {
    ...structuredClone(baseOrder),
    work_id: 'KDX-WORK-PUBLISH-001',
    event_type: 'RELEASE_APPROVED',
    station_id: 'A12_PUBLISHER',
    allowed_writes: ['/release_record'],
    prohibited_writes: ['/canon', '/source_artwork'],
    validator_set: ['RELEASE_GATE'],
    idempotency_key: 'release|approved|001',
    release_gate: 'EXPLICIT_APPROVAL_REQUIRED',
    worker_policy: { allowed_worker_kinds: ['HUMAN'], generative_required: false },
  };
  const human = {
    ...passingResult('HUMAN'),
    result_id: 'KDX-RESULT-HUMAN-RELEASE-001',
    work_id: publisherOrder.work_id,
    station_id: publisherOrder.station_id,
    write_manifest: [{ path: '/release_record', value_ref: 'approval:explicit-001', operation: 'CREATE' }],
    validator_results: [{ validator_id: 'RELEASE_GATE', status: 'PASS', evidence_ref: 'approval:explicit-001' }],
    idempotency_key: publisherOrder.idempotency_key,
    release_authorized: true,
  };
  assert.equal(validateStationResultAgainstWorkOrder(publisherOrder, human).valid, true);
});

test('WorkOrder cannot make generative intelligence mandatory or overlap write permissions', () => {
  const generative = structuredClone(baseOrder);
  generative.worker_policy.generative_required = true;
  assert.ok(validateWorkOrder(generative).errors.includes('GENERATIVE_DEPENDENCY'));

  const conflict = structuredClone(baseOrder);
  conflict.prohibited_writes.push('/plate_spec');
  assert.ok(validateWorkOrder(conflict).errors.some((error) => error.startsWith('WRITE_POLICY_CONFLICT:')));
});
