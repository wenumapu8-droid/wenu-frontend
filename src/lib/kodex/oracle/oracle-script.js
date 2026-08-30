// KODEX−∞ · KDX.ORACLE V0 authored cue table.
// PRESENTATION/NARRATIVE ONLY: lines may acknowledge observable journey events;
// they may not infer identity, emotion, destiny, spirituality or personal meaning.

export const ORACLE_VOICE_ID = 'KDX_F01_DEV_TEMP';

export const ORACLE_CUES = Object.freeze({
  'threshold:EXPLICIT_ENTER': Object.freeze({
    id: 'KDX_ORACLE_THRESHOLD_001',
    scene: 'threshold',
    event: 'EXPLICIT_ENTER',
    state: 'ADDRESS',
    epistemicStatus: 'OBSERVED_EVENT',
    text: 'You crossed the threshold. The archive has registered that decision.',
    audio: '/audio/kodex/oracle/threshold-address.ogg',
    durationMs: 5373,
    intensity: 0.52,
  }),
  'prologue:SCENE_DWELL': Object.freeze({
    id: 'KDX_ORACLE_PROLOGUE_001',
    scene: 'prologue',
    event: 'SCENE_DWELL',
    state: 'REVEAL',
    epistemicStatus: 'OBSERVED_EVENT',
    text: 'Do not watch the eye. Watch what changes when you approach it.',
    audio: '/audio/kodex/oracle/prologue-reveal.ogg',
    durationMs: 5250,
    intensity: 0.66,
  }),
});

export function oracleCue(scene, event) {
  return ORACLE_CUES[`${scene}:${event}`] || null;
}
