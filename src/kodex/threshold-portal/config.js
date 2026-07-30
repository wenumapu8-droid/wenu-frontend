export const THRESHOLD_PORTAL_STATES = Object.freeze({
  DORMANT: 0,
  AWARE: 1,
  OPEN: 2,
});

export const THRESHOLD_PORTAL_MOTION = Object.freeze({
  LIVE: 'live',
  PAUSED: 'paused',
  REDUCED: 'reduced',
  LOW_POWER: 'low-power',
});

export const THRESHOLD_PORTAL_QUALITY = Object.freeze({
  HIGH: 1,
  MEDIUM: 0.75,
  LOW: 0.5,
});

export const THRESHOLD_PORTAL_CONFIG = Object.freeze({
  id: 'KDX_THRESHOLD_PORTAL_001',
  artworkUrl: '/img/kodex/works/bw-06-alpha.png',
  artworkLabel: 'Arquitecturas Tecno-Tribales · bw-06 alpha mask',
  defaultSeed: 0.382,
  defaultElapsedMs: 0,
  defaultBass: 0,
  defaultState: 'DORMANT',
  defaultMotionMode: THRESHOLD_PORTAL_MOTION.LIVE,
  defaultQualityLevel: 'HIGH',
  palette: {
    background: [0.02, 0.01, 0.01],
    base: [0.31, 0.03, 0.04],
    accent: [0.75, 0.09, 0.11],
    glow: [1.0, 0.31, 0.18],
    line: [0.96, 0.83, 0.75],
  },
  feedback: {
    decay: 0.93,
    mix: 0.34,
  },
  breathing: {
    dormant: 0.025,
    aware: 0.05,
    open: 0.085,
  },
  polar: {
    dormant: 0.08,
    aware: 0.16,
    open: 0.26,
  },
});

export function getThresholdPortalStateValue(stateName) {
  return THRESHOLD_PORTAL_STATES[stateName] ?? THRESHOLD_PORTAL_STATES.DORMANT;
}

export function getThresholdPortalQualityValue(levelName) {
  return THRESHOLD_PORTAL_QUALITY[levelName] ?? THRESHOLD_PORTAL_QUALITY.HIGH;
}
