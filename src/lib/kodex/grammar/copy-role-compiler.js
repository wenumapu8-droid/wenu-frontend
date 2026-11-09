export const KDX_COPY_COMPILER_PROFILE = Object.freeze({
  version: 'copy-role-compiler-v0.1.1',
  status: 'IMPLEMENTED_CANDIDATE',
  generatesCopy: false,
  requiresSourceRef: true,
  deterministicOrdering: true,
  fabricatedTelemetryAllowed: false,
});

const ROLE_BY_SOURCE_KIND = Object.freeze({
  NODE_TITLE: 'TITLE',
  NODE_SUMMARY: 'DECK',
  MACRO_SIGNAL: 'MACRO_SIGNAL',
  BODY: 'BODY',
  LABEL: 'LABEL',
  EVIDENCE: 'EVIDENCE',
  CAPTION: 'CAPTION',
  CTA: 'CTA',
  TELEMETRY: 'TELEMETRY',
  SOURCE_NOTE: 'SOURCE_NOTE',
});

const ROLE_ORDER = Object.freeze(['MACRO_SIGNAL', 'TITLE', 'DECK', 'BODY', 'LABEL', 'EVIDENCE', 'CAPTION', 'CTA', 'TELEMETRY', 'SOURCE_NOTE']);
const ROLES = new Set(ROLE_ORDER);
const STATUSES = new Set(['VERIFIED', 'CANONICAL', 'CANON_CANDIDATE', 'PROPOSED', 'NEEDS_CONFIRMATION']);
const STATUS_PRIORITY = Object.freeze({ VERIFIED: 0, CANONICAL: 1, CANON_CANDIDATE: 2, NEEDS_CONFIRMATION: 3, PROPOSED: 4 });
const EVIDENCE_SOURCE_TYPES = new Set(['PAPER', 'VERIFIED_DATA', 'REGISTRY_RECORD', 'AUTHORITATIVE_SOURCE']);
const REQUIRED_ROLE_BY_PLATE = Object.freeze({
  KNOWLEDGE_PLATE: 'TITLE',
  JUNCTION_PLATE: 'TITLE',
  ACTIVATOR_PLATE: 'TITLE',
});

export class KdxCopyCompileError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxCopyCompileError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function validateTruthSensitiveRole(source, role) {
  if (role === 'TELEMETRY') {
    if (source.status !== 'VERIFIED' || source.source_type !== 'RUNTIME_MEASUREMENT') {
      throw new KdxCopyCompileError(
        'UNVERIFIED_TELEMETRY',
        'TELEMETRY requires VERIFIED runtime measurement provenance; symbolic or proposed numbers must use another role.',
        { source_ref: source.source_ref, status: source.status, source_type: source.source_type },
      );
    }
  }
  if (role === 'EVIDENCE') {
    if (source.status !== 'VERIFIED' || !EVIDENCE_SOURCE_TYPES.has(source.source_type)) {
      throw new KdxCopyCompileError(
        'UNVERIFIED_EVIDENCE',
        'EVIDENCE requires VERIFIED source material with an evidence-capable source_type.',
        { source_ref: source.source_ref, status: source.status, source_type: source.source_type },
      );
    }
  }
}

export function compileSourceLinkedCopy(copySources, plateType, options = {}) {
  if (!Array.isArray(copySources)) throw new KdxCopyCompileError('INVALID_COPY_SOURCES', 'copySources must be an array.');
  const strict = options.strict !== false;
  const normalized = [];

  for (const source of copySources) {
    if (!source || !source.source_ref) {
      throw new KdxCopyCompileError('MISSING_SOURCE_REF', 'Every copy role must retain a source_ref.', { source });
    }
    if (!STATUSES.has(source.status)) {
      throw new KdxCopyCompileError('INVALID_COPY_STATUS', 'Copy source status is not allowed by PlateSpec.', { source_ref: source.source_ref, status: source.status });
    }
    const role = source.role_hint || ROLE_BY_SOURCE_KIND[source.source_kind];
    if (!ROLES.has(role)) {
      throw new KdxCopyCompileError('UNRESOLVED_COPY_ROLE', 'Source kind cannot be compiled without an explicit valid role_hint.', { source_ref: source.source_ref, source_kind: source.source_kind });
    }
    validateTruthSensitiveRole(source, role);
    normalized.push({ role, source_ref: source.source_ref, status: source.status });
  }

  normalized.sort((a, b) => {
    const roleDelta = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
    if (roleDelta !== 0) return roleDelta;
    const sourceDelta = a.source_ref.localeCompare(b.source_ref);
    if (sourceDelta !== 0) return sourceDelta;
    return STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
  });

  const compiled = [];
  const seen = new Set();
  for (const slot of normalized) {
    const key = `${slot.role}|${slot.source_ref}`;
    if (seen.has(key)) continue;
    seen.add(key);
    compiled.push(Object.freeze(slot));
  }

  if (compiled.length > 12) throw new KdxCopyCompileError('COPY_SLOT_LIMIT', 'PlateSpec allows at most 12 copy slots.', { count: compiled.length });
  const requiredRole = REQUIRED_ROLE_BY_PLATE[plateType];
  if (strict && requiredRole && !compiled.some((slot) => slot.role === requiredRole)) {
    throw new KdxCopyCompileError('MISSING_REQUIRED_COPY_ROLE', `${plateType} requires a source-linked ${requiredRole} role.`, { plateType, requiredRole });
  }
  return Object.freeze(compiled);
}

export function tryCompileSourceLinkedCopy(copySources, plateType, options = {}) {
  try {
    return { ok: true, copy_slots: compileSourceLinkedCopy(copySources, plateType, options), error: null };
  } catch (error) {
    if (!(error instanceof KdxCopyCompileError)) throw error;
    return { ok: false, copy_slots: [], error: { code: error.code, message: error.message, details: error.details } };
  }
}
