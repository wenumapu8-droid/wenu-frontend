export const KDX_OBSERVE_V2_STATES = ['idle', 'aware', 'locked', 'observing'] as const;
export type KdxObserveV2State = (typeof KDX_OBSERVE_V2_STATES)[number];

export const KDX_OBSERVE_V2_PROFILES = ['full', 'balanced', 'low-power'] as const;
export type KdxObserveV2Profile = (typeof KDX_OBSERVE_V2_PROFILES)[number];

export type ObserveChecksum = 'latent' | 'pending' | 'verified';

export type ObserveSceneState = {
  mode: KdxObserveV2State;
  signalStrength: number;
  focusLevel: number;
  anomalyLevel: number;
  nodeCount: number;
  latency: number;
  checksum: ObserveChecksum;
  pointer: { x: number; y: number; vx: number; vy: number; active: boolean };
  reducedMotion: boolean;
  performanceProfile: KdxObserveV2Profile;
};

export const OBSERVE_V2_COPY: Record<KdxObserveV2State, {
  chip: string;
  message: string;
  hidden: string;
  cta: string;
  protocol: string;
  dossier: string;
}> = {
  idle: {
    chip: 'STATUS · IDLE',
    message: 'ARCHIVO LATENTE. NÚCLEO EN REPOSO.',
    hidden: 'MEMORY DOES NOT REMAIN STILL · SIGNAL BEFORE NOISE',
    cta: 'INITIATE OBSERVATION',
    protocol: 'Dormant relay. Minimal grid. Low particle field.',
    dossier: 'No target lock. Archive waiting for relational input.',
  },
  aware: {
    chip: 'STATUS · AWARE',
    message: 'PRESENCIA DETECTADA. CAMPO EN APERTURA.',
    hidden: 'YOU ARE INSIDE THE SIGNAL · RADAR SWEEP ONLINE',
    cta: 'PRESENCE DETECTED',
    protocol: 'Peripheral nodes appear. Ocular field starts revealing.',
    dossier: 'Signal gate open. Peripheral radar and waveform warming up.',
  },
  locked: {
    chip: 'STATUS · LOCKED',
    message: 'VECTOR FIJADO. CHECKSUM EN VERIFICACIÓN.',
    hidden: 'LOCK VECTOR CLOSED · CROSSHAIR CONVERGENCE ACTIVE',
    cta: 'FIELD LOCKED',
    protocol: 'Crosshair converges. Orbits align. Verification surge.',
    dossier: 'Target frame engaged. Latency collapses toward stable lock.',
  },
  observing: {
    chip: 'STATUS · OBSERVING',
    message: 'OBSERVATION CHANGES THE PATTERN.',
    hidden: 'THE ARCHIVE WATCHES · FEEDBACK MEMORY ACTIVE',
    cta: 'CARRY THE SIGNAL',
    protocol: 'Full ocular field active. Unified radar, bars, waveform, nodes.',
    dossier: 'Archive is now relational: the observed field modifies the record.',
  },
};

export const OBSERVE_V2_PROFILE_SCALE: Record<KdxObserveV2Profile, { dpr: number; particles: number; multipass: number; quality: number }> = {
  full: { dpr: 1.5, particles: 1.0, multipass: 1.0, quality: 1.0 },
  balanced: { dpr: 1.25, particles: 0.76, multipass: 0.88, quality: 0.82 },
  'low-power': { dpr: 1.0, particles: 0.44, multipass: 0.58, quality: 0.58 },
};

export const OBSERVE_MODE_INDEX: Record<KdxObserveV2State, number> = {
  idle: 0,
  aware: 1,
  locked: 2,
  observing: 3,
};
