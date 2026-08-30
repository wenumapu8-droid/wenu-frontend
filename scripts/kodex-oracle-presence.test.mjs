import test from 'node:test';
import assert from 'node:assert/strict';
import { ORACLE_CUES } from '../src/lib/kodex/oracle/oracle-script.js';
import { ORACLE_STATES, resolveOracleCue, oracleStateForCue, oracleContextSnapshot } from '../src/lib/kodex/oracle/oracle-runtime.js';

test('Oracle state vocabulary remains presentational and excludes listening', () => {
  assert.deepEqual(ORACLE_STATES, ['DORMANT','AWARE','ADDRESS','REVEAL','WITNESS','ANOMALY','RETURN']);
  assert.equal(ORACLE_STATES.includes('LISTENING'), false);
});

test('explicit threshold entry resolves an observed-event ADDRESS cue', () => {
  const cue = resolveOracleCue({ scene: 'threshold', event: 'EXPLICIT_ENTER', visitorEntered: true });
  assert.equal(cue?.id, 'KDX_ORACLE_THRESHOLD_001');
  assert.equal(cue?.epistemicStatus, 'OBSERVED_EVENT');
  assert.equal(oracleStateForCue(cue), 'ADDRESS');
});

test('dwell cannot speak before explicit entry', () => {
  assert.equal(resolveOracleCue({ scene: 'prologue', event: 'SCENE_DWELL', visitorEntered: false }), null);
  const cue = resolveOracleCue({ scene: 'prologue', event: 'SCENE_DWELL', visitorEntered: true });
  assert.equal(cue?.state, 'REVEAL');
});

test('unknown events fail closed', () => {
  assert.equal(resolveOracleCue({ scene: 'prologue', event: 'INFERRED_EMOTION', visitorEntered: true }), null);
});

test('authored V0 interventions stay sparse and bounded', () => {
  for (const cue of Object.values(ORACLE_CUES)) {
    const words = cue.text.trim().split(/\s+/).length;
    assert.ok(words >= 5 && words <= 18, `${cue.id} has ${words} words`);
    assert.ok(cue.durationMs >= 1000 && cue.durationMs <= 10000);
    assert.ok(cue.intensity >= 0 && cue.intensity <= 1);
  }
});

test('context snapshot reads route evidence as a count only', () => {
  const snapshot = oracleContextSnapshot({ scene: 'prologue', visitorEntered: true, routeEvidence: ['/kodex/','/kodex/folio/i/'] });
  assert.deepEqual(snapshot, { scene: 'prologue', visitorEntered: true, recordedRouteCount: 2 });
  assert.equal(Object.isFrozen(snapshot), true);
});
