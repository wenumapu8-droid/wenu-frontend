import { describe, it, expect } from 'vitest';
import { createInitialState, journeyReducer, JourneyState, JourneyEvent } from './JourneyState';

describe('JourneyState core', () => {
  it('should initialize with a deterministic state', () => {
    const state = createInitialState(42);
    expect(state.currentCoordinate).toBeNull();
    expect(state.serendipitySeed).toBe(42);
    expect(state.heartState.active).toBe(false);
  });

  it('should process a sequence of events deterministically', () => {
    let state = createInitialState();
    
    const event1: JourneyEvent = { id: 'e1', type: 'VISIT_NODE', payload: { nodeId: 'A' }, timestamp: 1000 };
    const event2: JourneyEvent = { id: 'e2', type: 'COMMIT_ACTION', payload: { action: 'action_1' }, timestamp: 1001 };
    
    state = journeyReducer(state, event1);
    state = journeyReducer(state, event2);

    expect(state.currentCoordinate).toBe('A');
    expect(state.visitCounts['A']).toBe(1);
    expect(state.committedActions).toContain('action_1');
    expect(state.eventTrace.length).toBe(2);
  });

  it('should enforce idempotency by event identity', () => {
    let state = createInitialState();
    const event: JourneyEvent = { id: 'e_dup', type: 'VISIT_NODE', payload: { nodeId: 'A' }, timestamp: 1000 };
    
    state = journeyReducer(state, event);
    expect(state.visitCounts['A']).toBe(1);

    // Replay identical event
    const stateAfterDup = journeyReducer(state, event);
    expect(stateAfterDup).toBe(state); // Strict reference equality check since no change
    expect(stateAfterDup.visitCounts['A']).toBe(1);
  });

  it('should increment visit count on revisits without destroying trace', () => {
    let state = createInitialState();
    const event1: JourneyEvent = { id: 'e1', type: 'VISIT_NODE', payload: { nodeId: 'A' }, timestamp: 1000 };
    const event2: JourneyEvent = { id: 'e2', type: 'VISIT_NODE', payload: { nodeId: 'B' }, timestamp: 1001 };
    const event3: JourneyEvent = { id: 'e3', type: 'VISIT_NODE', payload: { nodeId: 'A' }, timestamp: 1002 };
    
    state = journeyReducer(state, event1);
    state = journeyReducer(state, event2);
    state = journeyReducer(state, event3);

    expect(state.currentCoordinate).toBe('A');
    expect(state.visitCounts['A']).toBe(2);
    expect(state.visitCounts['B']).toBe(1);
    // Trace should be preserved in order
    expect(state.eventTrace.map(e => e.payload?.nodeId)).toEqual(['A', 'B', 'A']);
  });

  it('should manage Heart state optionally', () => {
    let state = createInitialState();
    const event: JourneyEvent = { id: 'e_heart', type: 'VISIT_HEART', payload: { portalOpen: true }, timestamp: 1000 };
    
    state = journeyReducer(state, event);
    expect(state.heartState.active).toBe(true);
    expect(state.heartState.visitCount).toBe(1);
    expect(state.heartState.portalOpen).toBe(true);
  });

  it('should handle ignored signals and return anchors', () => {
    let state = createInitialState();
    state = journeyReducer(state, { id: 'e1', type: 'IGNORE_SIGNAL', payload: { signal: 'sig_a' }, timestamp: 1000 });
    state = journeyReducer(state, { id: 'e2', type: 'SET_RETURN_ANCHOR', payload: { anchor: '/kodex' }, timestamp: 1001 });

    expect(state.ignoredSignals).toContain('sig_a');
    expect(state.returnAnchor).toBe('/kodex');
  });
});
