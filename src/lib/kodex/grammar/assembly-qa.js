import elementRegistry from './kdx_element_registry.v0.1.json' with { type: 'json' };

export const KDX_ASSEMBLY_QA_PROFILE = Object.freeze({
  version: 'assembly-qa-v0.1.1',
  status: 'IMPLEMENTED_CANDIDATE',
  contractBeforeRender: true,
  humanAcceptanceInferred: false,
});

const registered = new Map(elementRegistry.elements.map((element) => [element.element_id, element]));
const REQUIRED_QA_DECLARATIONS = Object.freeze([
  'SCHEMA', 'PROVENANCE', 'RIGHTS', '100DVH', 'MOBILE', 'KEYBOARD', 'FOCUS',
  'REDUCED_MOTION', 'NO_WEBGL_FALLBACK', 'PERFORMANCE', 'DETERMINISM',
]);
const BLOCKED_ELEMENT_STATUSES = new Set(['HOLD', 'DEPRECATED', 'REJECT_FOR_NOW']);

const check = (check_id, status, message, evidence_ref = null, lane = 'CONTRACT') => Object.freeze({
  check_id, lane, status, message, evidence_ref,
});

const cleanId = (value) => String(value || '')
  .toUpperCase()
  .replace(/[^A-Z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 96);

function selectedElementIds(spec) {
  return [...new Set([
    ...(spec?.slots || []).map((slot) => slot?.element_id).filter(Boolean),
    ...(spec?.motion_profile?.element_ids || []).filter(Boolean),
  ])];
}

function livingFieldActivationCheck(spec) {
  if (spec?.plate_type !== 'ACTIVATOR_PLATE' || spec?.primary_payload?.payload_type !== 'FIELD') {
    return check('ACTIVATION_COMPATIBILITY', 'NOT_APPLICABLE', 'Registered living-field activation compatibility applies only to FIELD activators.');
  }

  const activationId = spec?.activation_profile?.activation_id;
  const element = registered.get(activationId);
  if (!element) {
    return check('ACTIVATION_COMPATIBILITY', 'FAIL', `Living-field activation_id does not resolve to the normalized registry: ${activationId || 'MISSING'}.`, 'registry:kdx_element_registry.v0.1.json');
  }

  const statusOk = !BLOCKED_ELEMENT_STATUSES.has(element.status);
  const provenanceOk = element.provenance?.status === 'VERIFIED' && element.rights === 'PROJECT_SOURCE';
  const plateOk = element.allowed_plate_types?.includes(spec.plate_type) === true;
  const sceneOk = element.allowed_scene_roles?.includes(spec.scene_state) === true;
  const fallbackOk = element.accessibility?.meaning_preserved_without_motion === true && Boolean(element.fallback);
  const compatible = statusOk && provenanceOk && plateOk && sceneOk && fallbackOk;

  const detail = compatible
    ? `${activationId} is registered and compatible with ${spec.plate_type} / ${spec.scene_state}, with verified provenance, project rights and motion-independent fallback.`
    : `${activationId} fails living-field activation gates: status=${statusOk}, provenance_rights=${provenanceOk}, plate=${plateOk}, scene=${sceneOk}, fallback_accessibility=${fallbackOk}.`;

  return check('ACTIVATION_COMPATIBILITY', compatible ? 'PASS' : 'FAIL', detail, `registry:${activationId}`);
}

function contractChecks(spec) {
  const checks = [];
  const requiredFields = [
    'plate_id', 'plate_type', 'version', 'seed', 'scene_state', 'semantic_node', 'observer_lens',
    'communication_mode', 'primary_payload', 'macro_signal', 'slots', 'allowed_element_families',
    'copy_slots', 'motion_profile', 'activation_profile', 'route_slate', 'provenance_refs',
    'responsive_profile', 'fallback_profile', 'qa_requirements',
  ];
  const missing = requiredFields.filter((field) => !Object.hasOwn(spec || {}, field));
  checks.push(check('SCHEMA_SHAPE', missing.length ? 'FAIL' : 'PASS', missing.length ? `Missing fields: ${missing.join(', ')}` : 'Required PlateSpec fields are present.', 'schema:kdx_plate_spec.schema.json'));

  const provenanceOk = Array.isArray(spec?.provenance_refs) && spec.provenance_refs.length > 0;
  checks.push(check('PROVENANCE', provenanceOk ? 'PASS' : 'FAIL', provenanceOk ? 'PlateSpec retains provenance references.' : 'PlateSpec has no provenance references.', provenanceOk ? spec.provenance_refs[0] : null));

  const ids = selectedElementIds(spec);
  const unknown = ids.filter((id) => !registered.has(id));
  checks.push(check('REGISTERED_IDS', unknown.length ? 'FAIL' : 'PASS', unknown.length ? `Unknown element IDs: ${unknown.join(', ')}` : 'All selected element IDs resolve to the normalized registry.', 'registry:kdx_element_registry.v0.1.json'));

  const rightsProblems = ids.filter((id) => {
    const element = registered.get(id);
    return element && (element.rights !== 'PROJECT_SOURCE' || element.provenance?.status !== 'VERIFIED' || BLOCKED_ELEMENT_STATUSES.has(element.status));
  });
  checks.push(check('RIGHTS_STATUS', rightsProblems.length ? 'FAIL' : 'PASS', rightsProblems.length ? `Blocked rights/status/provenance: ${rightsProblems.join(', ')}` : 'Selected elements satisfy project-source / verified / eligible status gates.', 'registry:kdx_element_registry.v0.1.json'));

  checks.push(livingFieldActivationCheck(spec));

  const shellOk = spec?.responsive_profile?.primary_shell === '100dvh';
  checks.push(check('100DVH_DECLARATION', shellOk ? 'PASS' : 'FAIL', shellOk ? 'Primary shell declares 100dvh.' : 'Primary shell does not declare 100dvh.'));

  const mobileOk = Boolean(spec?.responsive_profile?.mobile);
  checks.push(check('MOBILE_DECLARATION', mobileOk ? 'PASS' : 'FAIL', mobileOk ? 'Mobile recomposition contract is present.' : 'Mobile recomposition contract is missing.'));

  const fallbackOk = Boolean(spec?.fallback_profile?.reduced_motion && spec?.fallback_profile?.no_webgl);
  checks.push(check('FALLBACK_DECLARATION', fallbackOk ? 'PASS' : 'FAIL', fallbackOk ? 'Reduced-motion and no-WebGL fallbacks are declared.' : 'Required fallbacks are missing.'));

  const qa = new Set(spec?.qa_requirements || []);
  const missingQa = REQUIRED_QA_DECLARATIONS.filter((id) => !qa.has(id));
  checks.push(check('QA_OBLIGATIONS', missingQa.length ? 'FAIL' : 'PASS', missingQa.length ? `Missing QA obligations: ${missingQa.join(', ')}` : 'Required accessibility/performance/determinism QA obligations are declared.'));

  const motionCount = spec?.motion_profile?.high_priority_count;
  const motionOk = Number.isInteger(motionCount) && motionCount >= 0 && motionCount <= 2;
  checks.push(check('MOTION_BUDGET', motionOk ? 'PASS' : 'FAIL', motionOk ? `High-priority motion budget=${motionCount}.` : 'High-priority motion budget is invalid.'));

  if (spec?.plate_type === 'JUNCTION_PLATE') {
    const count = Array.isArray(spec.route_slate) ? spec.route_slate.length : -1;
    const routeOk = count >= 2 && count <= 5 && qa.has('ROUTE_BOUNDS');
    checks.push(check('ROUTE_BOUNDS', routeOk ? 'PASS' : 'FAIL', routeOk ? `Junction exposes ${count} bounded doors.` : `Invalid Junction route count/QA declaration: ${count}.`));
  } else {
    checks.push(check('ROUTE_BOUNDS', 'NOT_APPLICABLE', 'Route bounds are a Junction-only invariant.'));
  }

  if (spec?.plate_type === 'ACTIVATOR_PLATE' && spec?.primary_payload?.payload_type === 'ARTWORK') {
    const art = spec.artwork_contract;
    const artOk = Boolean(art)
      && art.full_view_required === true
      && art.preserve_aspect === true
      && art.crop_allowed === false
      && art.recolor_source_allowed === false
      && art.distort_source_allowed === false
      && qa.has('NO_CROP');
    checks.push(check('ARTWORK_INTEGRITY', artOk ? 'PASS' : 'FAIL', artOk ? 'Protected artwork remains full-view/aspect-preserved/no-crop/no-recolor/no-distort.' : 'Protected artwork integrity contract failed.'));
  } else if (spec?.plate_type === 'ACTIVATOR_PLATE' && spec?.primary_payload?.payload_type === 'FIELD') {
    const fieldOk = spec.artwork_contract === null && !qa.has('NO_CROP');
    checks.push(check('ARTWORK_INTEGRITY', fieldOk ? 'NOT_APPLICABLE' : 'FAIL', fieldOk ? 'Living-field activator correctly carries no artwork-specific integrity claim.' : 'Living-field activator fabricates/conflicts with artwork semantics.'));
  } else {
    checks.push(check('ARTWORK_INTEGRITY', 'NOT_APPLICABLE', 'No protected artwork payload on this plate.'));
  }

  return Object.freeze(checks);
}

function renderChecksNotRun() {
  return Object.freeze([
    check('RENDER_GEOMETRY', 'NOT_RUN', 'No universal PlateSpec renderer evidence supplied.', null, 'RENDER_BROWSER'),
    check('NO_PAGE_SCROLL_BROWSER', 'NOT_RUN', 'Actual page overflow requires rendered browser evidence.', null, 'RENDER_BROWSER'),
    check('MOBILE_BROWSER', 'NOT_RUN', 'Actual mobile layout requires rendered browser evidence.', null, 'RENDER_BROWSER'),
    check('KEYBOARD_FOCUS_BROWSER', 'NOT_RUN', 'Actual keyboard/focus behavior requires rendered browser evidence.', null, 'RENDER_BROWSER'),
    check('REDUCED_MOTION_BROWSER', 'NOT_RUN', 'Actual reduced-motion behavior requires rendered browser evidence.', null, 'RENDER_BROWSER'),
    check('PERFORMANCE_BROWSER', 'NOT_RUN', 'Actual runtime performance requires rendered browser evidence.', null, 'RENDER_BROWSER'),
  ]);
}

export function auditUnrenderedPlateSpec(spec, provenanceRef = 'runtime:assembly-qa-v0.1.1') {
  const contract_checks = contractChecks(spec);
  const contractFailed = contract_checks.some((item) => item.status === 'FAIL');
  const render_checks = renderChecksNotRun();
  const blockers = contractFailed
    ? contract_checks.filter((item) => item.status === 'FAIL').map((item) => item.check_id)
    : ['RENDER_BROWSER_EVIDENCE_NOT_RUN'];
  return Object.freeze({
    qa_result_id: `KDX-QA-${cleanId(spec?.plate_id || spec?.semantic_node || 'UNKNOWN')}`,
    version: '0.1.1',
    target_id: spec?.plate_id || spec?.semantic_node || 'UNKNOWN',
    target_kind: 'PLATE_SPEC',
    validation_scope: 'CONTRACT_ONLY',
    contract_status: contractFailed ? 'FAIL' : 'PASS',
    render_status: 'NOT_RUN',
    overall_status: contractFailed ? 'FAIL' : 'PARTIAL',
    browser_validated: false,
    contract_checks,
    render_checks,
    evidence_refs: Object.freeze(contract_checks.map((item) => item.evidence_ref).filter(Boolean)),
    provenance_refs: Object.freeze([provenanceRef, ...(spec?.provenance_refs || [])].filter(Boolean)),
    blockers: Object.freeze([...new Set(blockers)]),
  });
}

export function promoteQaWithBrowserEvidence(contractResult, browserEvidence) {
  if (contractResult?.contract_status !== 'PASS') throw new Error('Cannot promote browser QA when contract validation is not PASS.');
  if (!browserEvidence?.evidence_ref) throw new Error('Browser promotion requires an evidence_ref.');
  const required = ['100dvh', 'no_page_scroll', 'mobile', 'keyboard_focus', 'reduced_motion', 'performance'];
  const failed = required.filter((key) => browserEvidence[key] !== true);
  const render_checks = required.map((key) => check(
    `BROWSER_${key.toUpperCase()}`,
    browserEvidence[key] === true ? 'PASS' : 'FAIL',
    browserEvidence[key] === true ? `${key} passed in browser evidence.` : `${key} failed or missing in browser evidence.`,
    browserEvidence.evidence_ref,
    'RENDER_BROWSER',
  ));
  return Object.freeze({
    ...contractResult,
    validation_scope: 'CONTRACT_AND_RENDER',
    render_status: failed.length ? 'FAIL' : 'PASS',
    overall_status: failed.length ? 'FAIL' : 'PASS',
    browser_validated: failed.length === 0,
    render_checks: Object.freeze(render_checks),
    evidence_refs: Object.freeze([...new Set([...(contractResult.evidence_refs || []), browserEvidence.evidence_ref])]),
    blockers: Object.freeze(failed.map((key) => `BROWSER_${key.toUpperCase()}`)),
  });
}
