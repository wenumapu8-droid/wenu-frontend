import test from 'node:test';
import assert from 'node:assert/strict';
import { SIGNAL_THRESHOLD, validateRecipe, clampTime, stageIndexAt, frameAt } from '../../src/lib/kodex/motion-lab/signal-threshold.mjs';

test('canonical film recipe is contiguous, unique and exactly 14s', () => {
  assert.equal(validateRecipe(SIGNAL_THRESHOLD), true);
  assert.deepEqual(SIGNAL_THRESHOLD.stages.map(s => [s.id, s.start, s.end]), [
    ['VOID',0,2],['SIGNAL',2,5],['FOCUS',5,8],['LOCK',8,10],['OPEN / CROSSING',10,14]
  ]);
});
test('time clamps and boundary transitions belong to next state', () => {
  assert.equal(clampTime(-10),0);
  assert.equal(clampTime(Infinity),0);
  assert.equal(clampTime(999),14);
  for(const [time,index] of [[0,0],[1.999,0],[2,1],[4.999,1],[5,2],[8,3],[10,4],[14,4]]) {
    assert.equal(stageIndexAt(time),index, 'time='+time);
  }
});
test('end frame is deterministic and fully crossed', () => {
  const last=frameAt(14);
  assert.equal(last.stage.id,'OPEN / CROSSING');
  assert.equal(last.phase,1);
  assert.equal(last.open,1);
  assert.equal(last.progress,1.4);
});
test('reduced motion selects stable stills, not intermediate animation', () => {
  assert.equal(frameAt(2.5,SIGNAL_THRESHOLD,true).progress,.25);
  assert.equal(frameAt(12,SIGNAL_THRESHOLD,true).open,1);
  assert.equal(frameAt(0,SIGNAL_THRESHOLD,true).energy,0);
});
test('malformed recipes are rejected', () => {
  assert.equal(validateRecipe({...SIGNAL_THRESHOLD,total:13}),false);
  assert.equal(validateRecipe({...SIGNAL_THRESHOLD,stages:[{id:'VOID',start:1,end:14}]}),false);
  assert.equal(validateRecipe({...SIGNAL_THRESHOLD,stages:[{id:'A',start:0,end:7},{id:'A',start:7,end:14}]}),false);
});
