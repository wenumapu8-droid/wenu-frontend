import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { manifestationTraceToJourneyAction } from './manifestation-journey-bridge';
import { organismActionToJourneyEvents } from './runtime/journey-memory-bridge';
import { createInitialJourneyState } from './runtime/journey-state';

describe('Manifestation → JourneyState bridge', () => {
  it('does not write memory before TRACE', () => {
    assert.equal(manifestationTraceToJourneyAction({
      intentId: 'KDX-INTENT-1',
      nodeId: 'KDX-NODE-PORTAL-RING',
      phase: 'REALIZED',
      traced: false,
      traceLength: 5,
    }), null);
  });

  it('translates TRACE into the existing organism-action memory contract', () => {
    const action = manifestationTraceToJourneyAction({
      intentId: 'KDX-INTENT-1',
      nodeId: 'KDX-NODE-PORTAL-RING',
      phase: 'TRACE',
      traced: true,
      traceLength: 6,
    });

    assert.ok(action);
    assert.equal(action.family, 'MANIFESTATION');
    assert.equal(action.action, 'WRITE_TRACE');
    assert.deepEqual(action.memoryWrites, [
      'manifestation:KDX-INTENT-1:realized',
      'manifestation-node:KDX-NODE-PORTAL-RING',
    ]);

    const events = organismActionToJourneyEvents(action, createInitialJourneyState());
    assert.deepEqual(events.map(event => event.kind), ['commit', 'commit']);
    assert.deepEqual(events.map(event => event.detail), action.memoryWrites);
    assert.deepEqual(events.map(event => event.at), [0, 1]);
  });

  it('uses semantic sequence length only for stable action identity', () => {
    const action = manifestationTraceToJourneyAction({
      intentId: 'KDX-INTENT-2',
      nodeId: null,
      phase: 'TRACE',
      traced: true,
      traceLength: 9,
    });

    assert.ok(action);
    assert.equal(action.createdAt, 0);
    assert.equal(action.id, 'manifestation:KDX-INTENT-2:trace:9');
    assert.deepEqual(action.memoryWrites, ['manifestation:KDX-INTENT-2:realized']);
  });
});
