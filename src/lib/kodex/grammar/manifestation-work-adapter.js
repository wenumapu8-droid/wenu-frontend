import {
  buildManifestationView,
  createManifestationState,
  reduceManifestationState,
} from '../manifestation-engine.js';
import {
  validateStationResultAgainstWorkOrder,
  validateWorkOrder,
} from './work-order-contract.js';

const STATUS_SIGNALLED = new Set(['RUNNING', 'BLOCKED', 'VALIDATING', 'COMPLETE', 'FAILED']);
const STATUS_TRANSFORMING = new Set(['RUNNING', 'VALIDATING']);

const clean = value => String(value || '').trim();

function makeBlocker(id, type, label, severity = 1, sourceRef = null) {
  return Object.freeze({
    id: clean(id),
    type,
    label: clean(label) || clean(id),
    severity,
    sourceRef: clean(sourceRef) || null,
  });
}

function qaBlockerType(id) {
  const value = clean(id).toUpperCase();
  if (value.includes('RIGHTS')) return 'RIGHTS_GATE';
  if (value.includes('CULTURAL')) return 'CULTURAL_GATE';
  if (value.includes('PROVENANCE') || value.includes('SOURCE')) return 'SOURCE_MISSING';
  if (value.includes('RUNTIME') || value.includes('PERFORMANCE')) return 'RUNTIME_GATE';
  return 'MISSING_EVIDENCE';
}

function collectBlockers(order, stationResult, qaResult) {
  const blockers = [];
  const workId = clean(order?.work_id) || 'UNKNOWN';
  const orderValidation = validateWorkOrder(order);

  for (const error of orderValidation.errors) {
    blockers.push(makeBlocker(
      `work-contract:${workId}:${error}`,
      'CONTRADICTION',
      `WorkOrder contract error: ${error}`,
      1,
      `work-order:${workId}`,
    ));
  }

  if (order?.status === 'BLOCKED') {
    blockers.push(makeBlocker(
      `work-status:${workId}:BLOCKED`,
      'DEPENDENCY',
      'WorkOrder is explicitly BLOCKED.',
      1,
      `work-order:${workId}`,
    ));
  }
  if (order?.status === 'FAILED') {
    blockers.push(makeBlocker(
      `work-status:${workId}:FAILED`,
      'RUNTIME_GATE',
      'WorkOrder is explicitly FAILED.',
      1,
      `work-order:${workId}`,
    ));
  }
  if (order?.status === 'CANCELLED') {
    blockers.push(makeBlocker(
      `work-status:${workId}:CANCELLED`,
      'DEPENDENCY',
      'WorkOrder is CANCELLED and cannot advance.',
      1,
      `work-order:${workId}`,
    ));
  }

  if (stationResult) {
    const validation = validateStationResultAgainstWorkOrder(order, stationResult);
    for (const error of validation.errors) {
      blockers.push(makeBlocker(
        `station-contract:${workId}:${error}`,
        'CONTRADICTION',
        `StationResult contract error: ${error}`,
        1,
        clean(stationResult.result_id) || `station-result:${workId}`,
      ));
    }
    if (stationResult.status === 'BLOCKED') {
      blockers.push(makeBlocker(
        `station-result:${workId}:BLOCKED`,
        'DEPENDENCY',
        'StationResult is BLOCKED.',
        1,
        clean(stationResult.result_id) || `station-result:${workId}`,
      ));
    } else if (stationResult.status === 'FAIL') {
      blockers.push(makeBlocker(
        `station-result:${workId}:FAIL`,
        'RUNTIME_GATE',
        'StationResult failed.',
        1,
        clean(stationResult.result_id) || `station-result:${workId}`,
      ));
    } else if (stationResult.status === 'NEEDS_REVIEW') {
      blockers.push(makeBlocker(
        `station-result:${workId}:NEEDS_REVIEW`,
        'MISSING_EVIDENCE',
        'StationResult requires review before realization.',
        0.7,
        clean(stationResult.result_id) || `station-result:${workId}`,
      ));
    }
  }

  if (qaResult) {
    for (const blockerId of qaResult.blockers || []) {
      blockers.push(makeBlocker(
        `qa:${workId}:${blockerId}`,
        qaBlockerType(blockerId),
        `QA blocker: ${blockerId}`,
        0.85,
        clean(qaResult.qa_result_id) || `qa:${workId}`,
      ));
    }
    if (qaResult.overall_status === 'FAIL' && !(qaResult.blockers || []).length) {
      blockers.push(makeBlocker(
        `qa:${workId}:FAIL`,
        'MISSING_EVIDENCE',
        'QA result failed without a declared blocker identifier.',
        1,
        clean(qaResult.qa_result_id) || `qa:${workId}`,
      ));
    }
  }

  if (order?.status === 'COMPLETE') {
    if (!stationResult) {
      blockers.push(makeBlocker(
        `completion:${workId}:STATION_RESULT_MISSING`,
        'MISSING_EVIDENCE',
        'COMPLETE WorkOrder requires StationResult evidence.',
        1,
        `work-order:${workId}`,
      ));
    }
    if (!qaResult) {
      blockers.push(makeBlocker(
        `completion:${workId}:QA_RESULT_MISSING`,
        'MISSING_EVIDENCE',
        'COMPLETE WorkOrder requires QA evidence.',
        1,
        `work-order:${workId}`,
      ));
    } else if (qaResult.overall_status !== 'PASS') {
      blockers.push(makeBlocker(
        `completion:${workId}:QA_NOT_PASS`,
        'MISSING_EVIDENCE',
        `COMPLETE WorkOrder cannot realize while QA is ${qaResult.overall_status || 'UNKNOWN'}.`,
        1,
        clean(qaResult.qa_result_id) || `qa:${workId}`,
      ));
    }
    if (stationResult && stationResult.status !== 'PASS') {
      blockers.push(makeBlocker(
        `completion:${workId}:STATION_NOT_PASS`,
        'RUNTIME_GATE',
        `COMPLETE WorkOrder cannot realize while StationResult is ${stationResult.status || 'UNKNOWN'}.`,
        1,
        clean(stationResult.result_id) || `station-result:${workId}`,
      ));
    }
  }

  const deduped = new Map(blockers.map(blocker => [blocker.id, blocker]));
  return Object.freeze([...deduped.values()]);
}

/**
 * Project-production adapter: Assembly OS remains the source of work truth;
 * Manifestation Engine only visualizes/normalizes its current causal state.
 */
export function buildWorkManifestation({ order, stationResult = null, qaResult = null } = {}) {
  const workId = clean(order?.work_id) || 'UNKNOWN';
  const desiredState = clean(order?.desired_state_ref) || 'WORK_ORDER_VALIDATION_REQUIRED';
  const targetId = clean(order?.target_id) || null;
  const blockers = collectBlockers(order, stationResult, qaResult);

  let state = createManifestationState();
  state = reduceManifestationState(state, {
    type: 'DECLARE_INTENT',
    intentId: `work:${workId}`,
    intent: desiredState,
    nodeId: targetId,
  });

  if (STATUS_SIGNALLED.has(order?.status)) {
    state = reduceManifestationState(state, { type: 'EMIT_SIGNAL' });
  }

  for (const blocker of blockers) {
    state = reduceManifestationState(state, { type: 'ADD_BLOCKER', blocker });
  }

  if (!blockers.length && STATUS_TRANSFORMING.has(order?.status)) {
    state = reduceManifestationState(state, { type: 'BEGIN_TRANSFORMATION' });
  }

  if (!blockers.length && order?.status === 'COMPLETE' && stationResult?.status === 'PASS' && qaResult?.overall_status === 'PASS') {
    state = reduceManifestationState(state, { type: 'BEGIN_TRANSFORMATION' });
    state = reduceManifestationState(state, { type: 'REALIZE' });
  }

  return Object.freeze({
    workId,
    targetId,
    workStatus: clean(order?.status) || null,
    stationStatus: clean(stationResult?.status) || null,
    qaStatus: clean(qaResult?.overall_status) || null,
    blockers,
    state,
    view: buildManifestationView(state),
  });
}
