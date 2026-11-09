// KODEX−∞ tangible V0 readiness manifest.
// Mirrors the accepted implementation target without silently promoting
// creator-review material, visual QA, or deployment status.

export const KODEX_V0_CHECKPOINTS = Object.freeze([
  Object.freeze({
    id: 'KDX-V0-01',
    label: 'ENTER THRESHOLD',
    scene: 'threshold',
    href: '/kodex/',
    status: 'IMPLEMENTED_CANDIDATE',
    required: ['intentional entry', 'touch/keyboard path', 'reduced-motion', 'fallback'],
    blockers: ['browser evidence on integration head'],
  }),
  Object.freeze({
    id: 'KDX-V0-02',
    label: 'INSPECT REAL OCÍN ARTIFACT',
    scene: 'archive',
    href: '/kodex/lab/ocin-authorial/',
    status: 'BLOCKED_CREATOR_REVIEW',
    required: ['real authorial record', 'approved public derivative or source-safe runtime asset', 'provenance'],
    blockers: ['authorial records remain CREATOR_REVIEW_PENDING with artworkSrc:null'],
  }),
  Object.freeze({
    id: 'KDX-V0-03',
    label: 'FOLLOW SOURCE-BACKED RELATION',
    scene: 'archive',
    href: '/kodex/lab/archive-evidence/',
    status: 'IMPLEMENTED_INTERNAL',
    required: ['source', 'claim', 'knowledge class', 'limitation', 'KODEX boundary'],
    blockers: ['browser evidence on integration head'],
  }),
  Object.freeze({
    id: 'KDX-V0-04',
    label: 'ENTER HEART',
    scene: 'heart',
    href: '/kodex/lab/heart-chamber/',
    status: 'TESTED_CANDIDATE',
    required: ['orientation not scoring', 'SIM labels', 'not biometric', 'reduced-motion'],
    blockers: ['browser/mobile visual evidence on integration head'],
  }),
  Object.freeze({
    id: 'KDX-V0-05',
    label: 'RECEIVE RETURN ARTIFACT',
    scene: 'return',
    href: '/kodex/folio/vi/',
    status: 'BUILD_VALIDATED_CANDIDATE',
    required: ['route-derived deterministic specimen', 'no engagement score', 're-entry path'],
    blockers: ['browser evidence that two distinct traces yield distinct visible Return artifacts'],
  }),
]);

export const KODEX_V0_RELEASE_GATES = Object.freeze([
  Object.freeze({ id: 'GATE-CODE', label: 'Core tests + integrity audit + Astro build', status: 'AUTOMATED' }),
  Object.freeze({ id: 'GATE-DESKTOP', label: 'Desktop browser evidence', status: 'PENDING' }),
  Object.freeze({ id: 'GATE-MOBILE-390', label: '390×844 evidence', status: 'PENDING' }),
  Object.freeze({ id: 'GATE-MOBILE-412', label: '412×915 evidence', status: 'PENDING' }),
  Object.freeze({ id: 'GATE-REDUCED', label: 'Reduced-motion evidence', status: 'PENDING' }),
  Object.freeze({ id: 'GATE-HISTORY', label: 'Back/forward journey semantics', status: 'PENDING' }),
  Object.freeze({ id: 'GATE-CREATOR', label: 'Ocín authorial derivative approval', status: 'PENDING' }),
  Object.freeze({ id: 'GATE-DEPLOY', label: 'Exact APROBAR DEPLOY authorization', status: 'LOCKED' }),
]);

export function v0Readiness() {
  const blocked = KODEX_V0_CHECKPOINTS.filter((item) => item.status.startsWith('BLOCKED'));
  const pendingGates = KODEX_V0_RELEASE_GATES.filter((gate) => !['AUTOMATED'].includes(gate.status));
  return {
    codeReady: blocked.length === 0,
    productionReady: blocked.length === 0 && pendingGates.length === 0,
    checkpointCount: KODEX_V0_CHECKPOINTS.length,
    blocked: blocked.map((item) => item.id),
    pendingGates: pendingGates.map((gate) => gate.id),
  };
}

export function validateV0Manifest() {
  const errors = [];
  const ids = new Set();
  for (const item of KODEX_V0_CHECKPOINTS) {
    if (ids.has(item.id)) errors.push(`duplicate checkpoint ${item.id}`);
    ids.add(item.id);
    if (!item.href?.startsWith('/kodex/')) errors.push(`${item.id}: invalid KODEX href`);
    if (!item.required?.length) errors.push(`${item.id}: no acceptance requirements`);
    if (item.status === 'PUBLIC_APPROVED') errors.push(`${item.id}: V0 manifest may not self-approve public content`);
  }
  const deploy = KODEX_V0_RELEASE_GATES.find((gate) => gate.id === 'GATE-DEPLOY');
  if (!deploy || deploy.status !== 'LOCKED') errors.push('deployment gate must remain LOCKED until explicit authorization');
  return { valid: errors.length === 0, errors };
}
