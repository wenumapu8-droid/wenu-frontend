export const KODEX_MOTION = {
  threshold: {
    accent: '#FF2733',
    outerOrbitDuration: 72,
    innerOrbitDuration: 108,
    pulseDuration: 5,
    scanDuration: 3.8,
    particleCount: 80,
    particleSpeed: 0.04,
    waveformAmplitude: 12,
    waveformSecondaryAmplitude: 8,
    waveformPrimaryRate: 0.0016,
    waveformSecondaryRate: 0.001,
    messageInterval: 4200,
    spriteFrameDuration: 1.2,
  },
  prologue: {
    accent: '#8E70FF',
    outerOrbitDuration: 84,
    innerOrbitDuration: 126,
    pulseDuration: 4.5,
    scanDuration: 4.2,
    particleCount: 50,
    particleSpeed: 0.025,
    eyeTravel: 14,
    fieldTravel: 8,
    messageInterval: 4200,
    spriteFrameDuration: 1.1,
  },
};

export const KODEX_RUNTIME = {
  desktopMaxParticles: 80,
  mobileMaxParticles: 32,
  lowPowerMaxParticles: 22,
  maxDevicePixelRatio: 2,
  lowPowerBreakpoint: 768,
};

export const KODEX_MESSAGES = {
  threshold: [
    'SIGNAL LATENT',
    'MEMORY HOST DETECTED',
    'SEÑAL RELACIONAL',
    'OBSERVER LOOP ACTIVE',
    'ORIGIN UNKNOWN',
  ],
  prologue: [
    'OBSERVATION FIELD ARMED',
    'EYE CONTACT REGISTERED',
    'PATTERN WANTS A WITNESS',
    'THE ARCHIVE REMEMBERS',
    'ACCESS THROUGH ATTENTION',
  ],
};

export function getSceneMotion(scene) {
  return KODEX_MOTION[scene] || KODEX_MOTION.threshold;
}

export function getParticleBudget({ scene, lowPower = false, mobile = false } = {}) {
  const base = getSceneMotion(scene).particleCount;
  if (lowPower) return Math.min(base, KODEX_RUNTIME.lowPowerMaxParticles);
  if (mobile) return Math.min(base, KODEX_RUNTIME.mobileMaxParticles);
  return Math.min(base, KODEX_RUNTIME.desktopMaxParticles);
}
