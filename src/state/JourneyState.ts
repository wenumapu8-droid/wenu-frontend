export interface JourneyEvent {
  id: string; // Used for idempotency
  type: string;
  payload?: any;
  timestamp: number;
}

export interface HeartState {
  active: boolean;
  visitCount: number;
  portalOpen: boolean;
}

export interface JourneyState {
  currentCoordinate: string | null;
  visitCounts: Record<string, number>;
  eventTrace: Array<JourneyEvent>;
  committedActions: Array<string>;
  tracedRelations: Array<string>;
  ignoredSignals: Array<string>;
  spectralTrace: Array<string>;
  heartState: HeartState;
  returnAnchor: string | null;
  serendipitySeed: number;
}

export const createInitialState = (seed: number = 0): JourneyState => ({
  currentCoordinate: null,
  visitCounts: {},
  eventTrace: [],
  committedActions: [],
  tracedRelations: [],
  ignoredSignals: [],
  spectralTrace: [],
  heartState: { active: false, visitCount: 0, portalOpen: false },
  returnAnchor: null,
  serendipitySeed: seed,
});

export const journeyReducer = (state: JourneyState, event: JourneyEvent): JourneyState => {
  // Idempotency check: prevent duplicate replay event from double-writing memory
  if (state.eventTrace.some(e => e.id === event.id)) {
    return state;
  }

  // Pure state copy avoiding direct mutation
  const newState: JourneyState = {
    ...state,
    visitCounts: { ...state.visitCounts },
    eventTrace: [...state.eventTrace, event],
    committedActions: [...state.committedActions],
    tracedRelations: [...state.tracedRelations],
    ignoredSignals: [...state.ignoredSignals],
    spectralTrace: [...state.spectralTrace],
    heartState: { ...state.heartState }
  };

  switch (event.type) {
    case 'VISIT_NODE': {
      const nodeId = event.payload?.nodeId;
      if (nodeId) {
        newState.currentCoordinate = nodeId;
        // Revisits increment count without destroying prior trace
        newState.visitCounts[nodeId] = (newState.visitCounts[nodeId] || 0) + 1;
      }
      break;
    }
    case 'COMMIT_ACTION': {
      const action = event.payload?.action;
      if (action && !newState.committedActions.includes(action)) {
        newState.committedActions.push(action);
      }
      break;
    }
    case 'TRACE_RELATION': {
      const relation = event.payload?.relation;
      if (relation && !newState.tracedRelations.includes(relation)) {
        newState.tracedRelations.push(relation);
      }
      break;
    }
    case 'IGNORE_SIGNAL': {
      const signal = event.payload?.signal;
      if (signal && !newState.ignoredSignals.includes(signal)) {
        newState.ignoredSignals.push(signal);
      }
      break;
    }
    case 'ADD_SPECTRAL_TRACE': {
      const trace = event.payload?.trace;
      if (trace) {
        newState.spectralTrace.push(trace);
      }
      break;
    }
    case 'VISIT_HEART': {
      // Heart state can exist without forcing a Heart visit
      newState.heartState.active = true;
      newState.heartState.visitCount += 1;
      if (event.payload?.portalOpen !== undefined) {
        newState.heartState.portalOpen = event.payload.portalOpen;
      }
      break;
    }
    case 'SET_RETURN_ANCHOR': {
      // Exact return anchor round-trips exactly
      newState.returnAnchor = event.payload?.anchor || null;
      break;
    }
  }

  return newState;
};
