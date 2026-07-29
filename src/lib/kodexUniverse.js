export const ENTITY_REGISTRY = {
  SUBJECT: {
    prefix: 'K',
    pattern: 'K-##',
    meaning: 'Observed intelligence or active subject inside the archive.',
    allowedStates: ['ACTIVE', 'LATENT', 'TRACE', 'LOCKED'],
    accent: 'var(--kdx-red)',
    icon: '◉',
    use: ['hero identity', 'scene rail', 'archive panels'],
  },
  SPECIMEN: {
    prefix: 'SP',
    pattern: 'SP-##',
    meaning: 'Discrete fragment, object, artifact, or preserved manifestation.',
    allowedStates: ['PRESERVED', 'UNVERIFIED', 'SEALED', 'ACTIVE'],
    accent: 'var(--kdx-acid)',
    icon: '◈',
    use: ['cards', 'artifact drawers', 'manifest rows'],
  },
  ARCHIVE: {
    prefix: 'AR',
    pattern: 'AR-###',
    meaning: 'Canonical record stored by the KODEX archive.',
    allowedStates: ['RECORDED', 'PARTIAL', 'RESTORED', 'LOCKED'],
    accent: 'var(--kdx-dust-white)',
    icon: '▣',
    use: ['record ids', 'drawer titles', 'scene captions'],
  },
  SIGNAL: {
    prefix: 'SG',
    pattern: '137.59 MHz / VX-BAND ##',
    meaning: 'Frequency, carrier, or readable transmission state.',
    allowedStates: ['LOCKED', 'LATENT', 'NOISY', 'CLEAR'],
    accent: 'var(--kdx-cyan)',
    icon: '≈',
    use: ['live readouts', 'progress rail', 'scene metadata'],
  },
  NODE: {
    prefix: 'ND',
    pattern: 'ND-##',
    meaning: 'Topological point inside the KODEX journey.',
    allowedStates: ['OPEN', 'MAPPED', 'LOCKED', 'ACTIVE'],
    accent: 'var(--kdx-violet)',
    icon: '◎',
    use: ['scene navigation', 'cosmology map', 'index'],
  },
  LOCATION: {
    prefix: 'L',
    pattern: 'L-###',
    meaning: 'Spatial or contextual placement of a record.',
    allowedStates: ['BOUND', 'REMOTE', 'INTERNAL'],
    accent: 'var(--kdx-magenta)',
    icon: '⌖',
    use: ['drawer metadata', 'map readouts'],
  },
  PROTOCOL: {
    prefix: 'PR',
    pattern: 'PR-##',
    meaning: 'Executable behavior, route, or machine procedure.',
    allowedStates: ['READY', 'RUNNING', 'REDUCED', 'COMPLETE'],
    accent: 'var(--kdx-orange)',
    icon: '⟐',
    use: ['buttons', 'cta labels', 'machine states'],
  },
};

export const CLEARANCE_LEVELS = {
  'CL-1': { label: 'PUBLIC', accent: 'var(--kdx-muted)', icon: '·', use: 'open surface information' },
  'CL-3': { label: 'LIMITED', accent: 'var(--kdx-cyan)', icon: '◌', use: 'guided observation' },
  'CL-5': { label: 'ARCHIVAL', accent: 'var(--kdx-red)', icon: '◍', use: 'threshold + artifact records' },
  'CL-7': { label: 'INTERNAL', accent: 'var(--kdx-violet)', icon: '◈', use: 'system manifests' },
  'CL-9': { label: 'RITUAL', accent: 'var(--kdx-acid)', icon: '✦', use: 'return / protected systems' },
};

export const STATUS_REGISTRY = {
  ACTIVE: { accent: 'var(--kdx-cyan)', tone: 'live and observable', icon: '●' },
  LATENT: { accent: 'var(--kdx-dust-white)', tone: 'present but inactive', icon: '◌' },
  RECORDED: { accent: 'var(--kdx-violet)', tone: 'preserved by system memory', icon: '▣' },
  PARTIAL: { accent: 'var(--kdx-orange)', tone: 'incomplete but legible', icon: '◐' },
  PRESERVED: { accent: 'var(--kdx-acid)', tone: 'stable and reusable', icon: '◈' },
  TRACE: { accent: 'var(--kdx-magenta)', tone: 'residual memory signature', icon: '≈' },
  LOCKED: { accent: 'var(--kdx-red)', tone: 'restricted or unresolved', icon: '✕' },
};

export const THREAT_REGISTRY = {
  'T-1': { label: 'LOW SIGNAL', accent: 'var(--kdx-dust-white)', icon: '·' },
  'T-2': { label: 'OBSERVABLE DRIFT', accent: 'var(--kdx-violet)', icon: '◌' },
  'T-3': { label: 'UNSTABLE MEMORY', accent: 'var(--kdx-orange)', icon: '△' },
  'T-X': { label: 'UNKNOWN CLASS', accent: 'var(--kdx-red)', icon: '✕' },
};

export const OPERATOR_REGISTRY = {
  'OP-A13': { label: 'ARCHIVE CUSTODIAN', accent: 'var(--kdx-dust-white)' },
  'OP-EYE': { label: 'OBSERVATION LAYER', accent: 'var(--kdx-violet)' },
  'OP-ROOT': { label: 'THRESHOLD ENGINE', accent: 'var(--kdx-red)' },
};

export const TIMESTAMP_FORMAT = 'YYYY-MM-DD // HH:MM UTC';
export const CHECKSUM_FORMAT = '8F21-A90C / hex-cluster';

export const SCENE_UNIVERSE = {
  threshold: {
    index: '00',
    code: 'THRESHOLD',
    node: 'ND-00',
    location: 'L-117',
    protocol: 'PR-00',
    subject: 'K-07',
    signal: '137.59 MHz',
    status: 'ACTIVE',
    clearance: 'CL-5',
    threat: 'T-1',
    operator: 'OP-ROOT',
    accent: 'var(--kdx-red)',
    href: '/kodex/',
    hash: 'threshold',
    kicker: 'DESCENT · THRESHOLD SOURCE',
    cta: 'ENTER THE SYSTEM',
  },
  prologue: {
    index: '01',
    code: 'PROLOGUE',
    node: 'ND-01',
    location: 'L-118',
    protocol: 'PR-01',
    subject: 'K-07',
    signal: 'VX-BAND 03',
    status: 'RECORDED',
    clearance: 'CL-7',
    threat: 'T-2',
    operator: 'OP-EYE',
    accent: 'var(--kdx-violet)',
    href: '/kodex/#prologue',
    hash: 'prologue',
    kicker: 'PROLOGUE · OBSERVATION PROTOCOL',
    cta: 'BEGIN OBSERVATION',
  },
};

export function semanticAccent(type, value) {
  if (type === 'STATUS') return STATUS_REGISTRY[value]?.accent || 'var(--kdx-dust-white)';
  if (type === 'CLEARANCE') return CLEARANCE_LEVELS[value]?.accent || 'var(--kdx-dust-white)';
  if (type === 'THREAT') return THREAT_REGISTRY[value]?.accent || 'var(--kdx-dust-white)';
  return ENTITY_REGISTRY[type]?.accent || 'var(--kdx-dust-white)';
}
