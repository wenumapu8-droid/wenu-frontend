const freezeDeep = (value) => {
  if (Array.isArray(value)) return Object.freeze(value.map(freezeDeep));
  if (value && typeof value === 'object') {
    return Object.freeze(Object.fromEntries(Object.entries(value).map(([key, child]) => [key, freezeDeep(child)])));
  }
  return value;
};

const experience = (value) => freezeDeep(value);

export const KDX_EXPERIENCE_PRESETS = Object.freeze({
  THRESHOLD: experience({
    id: 'THRESHOLD',
    version: 'kdx-experience-v0.1.0',
    role: 'VOLUNTARY_ENTRY_PROOF',
    rendererPlan: {
      plan_id: 'KDX-DEMO-THRESHOLD-001',
      runtime: {
        initialPhase: 'E00', sourceMode: 'blacksun', renderTier: 'HIGH', seed: 0.17,
        tint: [0.82, 0.72, 0.43], decay: 0.93,
        effects: [
          { name: 'mirror', on: false, params: { u_seg: 6, u_angle: 0, u_mix: 1 } },
          { name: 'distort', on: false, params: { u_amt: 0.08, u_mode: 0 } },
          { name: 'color', on: true, params: { u_mode: 0, u_amt: 0.35 } },
        ],
      },
    },
  }),
  SIGNAL_FIELD: experience({
    id: 'SIGNAL_FIELD',
    version: 'kdx-experience-v0.1.0',
    role: 'POINTER_SIGNAL_PROOF',
    rendererPlan: {
      plan_id: 'KDX-DEMO-SIGNAL-FIELD-001',
      runtime: {
        initialPhase: 'T01', sourceMode: 'flow', renderTier: 'HIGH', seed: 0.53,
        tint: [0.58, 0.73, 0.68], decay: 0.90,
        effects: [
          { name: 'mirror', on: false, params: { u_seg: 8, u_angle: 0, u_mix: 0.75 } },
          { name: 'distort', on: true, params: { u_amt: 0.16, u_mode: 1 } },
          { name: 'color', on: true, params: { u_mode: 0, u_amt: 0.58 } },
        ],
      },
    },
  }),
  AUDIO_ORGANISM: experience({
    id: 'AUDIO_ORGANISM',
    version: 'kdx-experience-v0.1.0',
    role: 'AUDIO_REACTIVE_PROOF',
    rendererPlan: {
      plan_id: 'KDX-DEMO-AUDIO-ORGANISM-001',
      runtime: {
        initialPhase: 'M11', sourceMode: 'spiral', renderTier: 'MID', seed: 0.82,
        tint: [0.72, 0.54, 0.78], decay: 0.885,
        effects: [
          { name: 'mirror', on: true, params: { u_seg: 7, u_angle: 0.18, u_mix: 0.72 } },
          { name: 'distort', on: true, params: { u_amt: 0.12, u_mode: 0 } },
          { name: 'color', on: true, params: { u_mode: 1, u_amt: 0.72 } },
        ],
      },
    },
  }),
});

export function getKdxExperiencePreset(id) {
  return KDX_EXPERIENCE_PRESETS[String(id || '').trim().toUpperCase()] || null;
}

export function validateKdxExperiencePreset(spec) {
  if (!spec || typeof spec !== 'object') throw new TypeError('KDX experience spec is required.');
  if (!spec.id || !spec.rendererPlan?.plan_id || !spec.rendererPlan?.runtime) {
    throw new TypeError('KDX experience spec requires id and rendererPlan.');
  }
  return true;
}
