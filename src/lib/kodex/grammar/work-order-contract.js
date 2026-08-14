export const KDX_WORK_ORDER_CONTRACT_PROFILE = Object.freeze({
  version: 'work-order-contract-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  workerKindsInterchangeable: true,
  workerIdentityChangesAuthority: false,
});

const WORK_STATUSES = new Set(['QUEUED', 'RUNNING', 'BLOCKED', 'VALIDATING', 'COMPLETE', 'FAILED', 'CANCELLED']);
const RESULT_STATUSES = new Set(['PASS', 'FAIL', 'BLOCKED', 'NEEDS_REVIEW']);
const WORKER_KINDS = new Set(['SCRIPT', 'AGENT', 'HUMAN']);

export class KdxWorkContractError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxWorkContractError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const unique = (values) => [...new Set(values || [])];

export function validateWorkOrder(order) {
  const errors = [];
  if (!order?.work_id?.startsWith('KDX-WORK-')) errors.push('WORK_ID');
  if (order?.version !== '0.1.0') errors.push('VERSION');
  if (!order?.station_id) errors.push('STATION');
  if (!order?.target_id) errors.push('TARGET');
  if (!order?.desired_state_ref) errors.push('DESIRED_STATE');
  if (!Array.isArray(order?.input_refs) || order.input_refs.length < 1) errors.push('INPUT_REFS');
  if (!Array.isArray(order?.validator_set) || order.validator_set.length < 1) errors.push('VALIDATORS');
  if (!Array.isArray(order?.provenance_refs) || order.provenance_refs.length < 1) errors.push('PROVENANCE');
  if (!order?.idempotency_key || String(order.idempotency_key).length < 8) errors.push('IDEMPOTENCY');
  if (!WORK_STATUSES.has(order?.status)) errors.push('STATUS');
  if (order?.worker_policy?.generative_required !== false) errors.push('GENERATIVE_DEPENDENCY');
  const kinds = order?.worker_policy?.allowed_worker_kinds || [];
  if (!kinds.length || kinds.some((kind) => !WORKER_KINDS.has(kind))) errors.push('WORKER_POLICY');
  const allowed = unique(order?.allowed_writes);
  const prohibited = unique(order?.prohibited_writes);
  const overlap = allowed.filter((path) => prohibited.includes(path));
  if (overlap.length) errors.push(`WRITE_POLICY_CONFLICT:${overlap.join(',')}`);
  if (order?.station_id === 'A12_PUBLISHER' && order?.release_gate !== 'EXPLICIT_APPROVAL_REQUIRED') errors.push('PUBLISH_RELEASE_GATE');
  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function validateStationResultAgainstWorkOrder(order, result) {
  const orderValidation = validateWorkOrder(order);
  const errors = [...orderValidation.errors];
  if (result?.version !== '0.1.0') errors.push('RESULT_VERSION');
  if (result?.work_id !== order?.work_id) errors.push('WORK_ID_MISMATCH');
  if (result?.station_id !== order?.station_id) errors.push('STATION_MISMATCH');
  if (result?.idempotency_key !== order?.idempotency_key) errors.push('IDEMPOTENCY_MISMATCH');
  if (!RESULT_STATUSES.has(result?.status)) errors.push('RESULT_STATUS');
  if (!WORKER_KINDS.has(result?.worker_kind)) errors.push('WORKER_KIND');
  if (!(order?.worker_policy?.allowed_worker_kinds || []).includes(result?.worker_kind)) errors.push('WORKER_NOT_ALLOWED');

  const allowed = new Set(order?.allowed_writes || []);
  const prohibited = new Set(order?.prohibited_writes || []);
  for (const write of result?.write_manifest || []) {
    if (!write?.path || prohibited.has(write.path)) errors.push(`PROHIBITED_WRITE:${write?.path || 'MISSING'}`);
    else if (!allowed.has(write.path)) errors.push(`UNDECLARED_WRITE:${write.path}`);
  }

  const validatorMap = new Map((result?.validator_results || []).map((item) => [item.validator_id, item.status]));
  const missingValidators = (order?.validator_set || []).filter((validatorId) => !validatorMap.has(validatorId));
  if (missingValidators.length) errors.push(`MISSING_VALIDATORS:${missingValidators.join(',')}`);
  if (result?.status === 'PASS') {
    const notPassed = (order?.validator_set || []).filter((validatorId) => validatorMap.get(validatorId) !== 'PASS');
    if (notPassed.length) errors.push(`UNPASSED_VALIDATORS:${notPassed.join(',')}`);
  }

  if (result?.release_authorized === true) {
    const authorizedShape = result.worker_kind === 'HUMAN'
      && order.station_id === 'A12_PUBLISHER'
      && order.release_gate === 'EXPLICIT_APPROVAL_REQUIRED'
      && order.event_type === 'RELEASE_APPROVED';
    if (!authorizedShape) errors.push('UNAUTHORIZED_RELEASE');
  }

  return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
}

export function assertStationResultAgainstWorkOrder(order, result) {
  const validation = validateStationResultAgainstWorkOrder(order, result);
  if (!validation.valid) {
    throw new KdxWorkContractError('STATION_RESULT_REJECTED', 'StationResult violates WorkOrder boundaries.', { errors: validation.errors });
  }
  return true;
}
