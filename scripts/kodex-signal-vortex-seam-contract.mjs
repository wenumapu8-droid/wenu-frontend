import assert from 'node:assert/strict';

const TAU = Math.PI * 2;
const seed = Number(process.env.KDX_SIGNAL_SEED || 1808);
const count = Number(process.env.KDX_SIGNAL_PARTICLES || 260);

const mulberry32 = (initialSeed) => {
  let a = initialSeed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const rng = mulberry32(seed);
const particles = Array.from({ length: count }, (_, index) => ({
  angle0: rng() * TAU,
  radius0: 0.12 + Math.pow(rng(), 0.72) * 0.88,
  turns: 1 + (index % 3),
  radialHarmonic: 1 + (index % 4),
  wobbleHarmonic: 2 + (index % 5),
  phaseOffset: rng() * TAU,
  size: 0.65 + rng() * 1.7,
  alpha: 0.22 + rng() * 0.72,
}));

const stateAt = (particle, phase) => {
  const radialWave = Math.sin(TAU * particle.radialHarmonic * phase + particle.phaseOffset);
  const waveform = Math.sin(TAU * 2 * phase + particle.angle0 * 3 + particle.phaseOffset);
  const convergence = 0.58 + 0.34 * (0.5 + 0.5 * radialWave);
  const radius = particle.radius0 * convergence;
  const wobble = 0.045 * Math.sin(TAU * particle.wobbleHarmonic * phase + particle.phaseOffset);
  const theta = particle.angle0 + TAU * particle.turns * phase + wobble;
  const elliptic = 0.82 + 0.18 * Math.cos(theta * 2 + particle.phaseOffset);

  return {
    x: Math.cos(theta) * radius,
    y: Math.sin(theta) * radius * elliptic,
    waveform,
    convergence,
    size: particle.size * (0.72 + 0.42 * ((waveform + 1) * 0.5)),
    alpha: particle.alpha * (0.72 + 0.28 * ((waveform + 1) * 0.5)),
  };
};

let maxDelta = 0;
for (const particle of particles) {
  const start = stateAt(particle, 0);
  const end = stateAt(particle, 1);
  for (const key of Object.keys(start)) {
    const delta = Math.abs(start[key] - end[key]);
    maxDelta = Math.max(maxDelta, delta);
  }
}

const globalStart = Math.sin(TAU * 0 * 2);
const globalEnd = Math.sin(TAU * 1 * 2);
maxDelta = Math.max(maxDelta, Math.abs(globalStart - globalEnd));

assert.ok(
  maxDelta < 1e-12,
  `SIGNAL vortex seam contract failed: max normalized state delta ${maxDelta}`,
);

console.log(JSON.stringify({
  contract: 'KDX-VISUAL-SIGNAL-LOOP-001-SEAM',
  seed,
  particles: count,
  phase_start: 0,
  phase_end: 1,
  max_normalized_state_delta: maxDelta,
  result: 'PASS',
}, null, 2));
