import { buildRouteFrame, createObserverState, reduceObserverState } from './deep-navigation-engine.js';

export const MICRO_UNIVERSE_ENTRY = 'SCI-BIOLOGY';
export const MICRO_UNIVERSE_HISTORY_KIND = 'KDX_MICRO_HISTORY_V1';
export const MICRO_UNIVERSE_LAB_PATH = '/kodex/lab/deep-navigation/';

export const MICRO_UNIVERSE_NODES = Object.freeze({
  'SCI-BIOLOGY': { id:'SCI-BIOLOGY', title:'Living Systems', field:'science', fields:['science','biology'], plate:'KNOWLEDGE', summary:'Life as nested organization: membrane, organism, ecology.', lensAffinity:['MICROSCOPE','NAKED_EYE','SYSTEM'] },
  'SCI-PATTERN': { id:'SCI-PATTERN', title:'Pattern Formation', field:'science', fields:['science','mathematics'], plate:'KNOWLEDGE', summary:'How local rules can produce visible order.', lensAffinity:['MAGNIFIER','SYSTEM','META'] },
  'SCI-COSMOS': { id:'SCI-COSMOS', title:'Cosmic Scale', field:'science', fields:['science','cosmos'], plate:'JUNCTION', summary:'Scale changes what relationships become legible.', lensAffinity:['SATELLITE','TELESCOPE','META'] },
  'TECH-NETWORK': { id:'TECH-NETWORK', title:'Network', field:'technology', fields:['technology','network'], plate:'KNOWLEDGE', summary:'Nodes, edges and propagation as operational structure.', lensAffinity:['SYSTEM','TELEPHOTO','META'] },
  'TECH-MACHINE': { id:'TECH-MACHINE', title:'Machine', field:'technology', fields:['technology','machine'], plate:'KNOWLEDGE', summary:'A finite mechanism capable of many observable states.', lensAffinity:['MAGNIFIER','NAKED_EYE','SYSTEM'] },
  'TECH-CITY': { id:'TECH-CITY', title:'Future City', field:'technology', fields:['technology','future-city'], plate:'JUNCTION', summary:'Infrastructure becomes habitat when viewed at system scale.', lensAffinity:['SYSTEM','TELEPHOTO','SATELLITE'] },
  'ART-FORM': { id:'ART-FORM', title:'Form', field:'art', fields:['art','design'], plate:'ACTIVATOR', summary:'A visual pause where form precedes explanation.', lensAffinity:['MAGNIFIER','NAKED_EYE','SYSTEM'] },
  'ART-IMAGE': { id:'ART-IMAGE', title:'Image / Signal', field:'art', fields:['art','photography'], plate:'ACTIVATOR', summary:'Image as a protected signal surface. Synthetic lab placeholder only.', lensAffinity:['MAGNIFIER','NAKED_EYE','META'] },
  'ART-POETRY': { id:'ART-POETRY', title:'Poetic Compression', field:'art', fields:['art','poetry'], plate:'ACTIVATOR', summary:'Meaning can be compressed without becoming a factual claim.', lensAffinity:['NAKED_EYE','SYSTEM','META'] },
  'CON-MIND': { id:'CON-MIND', title:'Mind', field:'consciousness', fields:['consciousness','philosophy'], plate:'KNOWLEDGE', summary:'A philosophical inquiry into experience, not a scientific conclusion.', lensAffinity:['NAKED_EYE','SYSTEM','META'] },
  'CON-OBSERVER': { id:'CON-OBSERVER', title:'Observer', field:'consciousness', fields:['consciousness','observer'], plate:'JUNCTION', summary:'The runtime changes after interaction; this is computational state, not quantum proof.', lensAffinity:['MAGNIFIER','SYSTEM','META'] },
  'CON-RITUAL': { id:'CON-RITUAL', title:'Ritual / Return', field:'consciousness', fields:['consciousness','ritual'], plate:'ACTIVATOR', summary:'A memory-conditioned route used only as a lab mechanic.', lensAffinity:['NAKED_EYE','TELEPHOTO','META'], requiredMemory:['art:OCN-LAB-KEY'] },
});

export const MICRO_UNIVERSE_GRAPH = Object.freeze({
  'SCI-BIOLOGY':['SCI-PATTERN','TECH-NETWORK','ART-FORM','CON-MIND'],
  'SCI-PATTERN':['SCI-COSMOS','TECH-MACHINE','ART-IMAGE','CON-OBSERVER'],
  'SCI-COSMOS':['SCI-BIOLOGY','TECH-CITY','ART-POETRY','CON-OBSERVER'],
  'TECH-NETWORK':['TECH-MACHINE','SCI-PATTERN','ART-FORM','CON-MIND'],
  'TECH-MACHINE':['TECH-CITY','SCI-BIOLOGY','ART-IMAGE','CON-OBSERVER'],
  'TECH-CITY':['TECH-NETWORK','SCI-COSMOS','ART-POETRY','CON-RITUAL'],
  'ART-FORM':['ART-IMAGE','SCI-PATTERN','TECH-MACHINE','CON-MIND'],
  'ART-IMAGE':['ART-POETRY','SCI-BIOLOGY','TECH-CITY','CON-OBSERVER'],
  'ART-POETRY':['ART-FORM','SCI-COSMOS','TECH-NETWORK','CON-RITUAL'],
  'CON-MIND':['CON-OBSERVER','SCI-BIOLOGY','TECH-NETWORK','ART-FORM'],
  'CON-OBSERVER':['CON-RITUAL','SCI-PATTERN','TECH-MACHINE','ART-IMAGE'],
  'CON-RITUAL':['CON-MIND','SCI-COSMOS','TECH-CITY','ART-POETRY'],
});

function candidate(fromId, id) {
  const node = MICRO_UNIVERSE_NODES[id];
  const sameField = MICRO_UNIVERSE_NODES[fromId]?.field === node.field;
  return {
    ...node,
    semanticAffinity: sameField ? 0.88 : 0.67,
    narrativeCompatibility: 0.76,
    curatorWeight: 0.68,
    cognitiveLoad: node.plate === 'KNOWLEDGE' ? 0.52 : 0.34,
    epistemicStatus:'VERIFIED', rightsStatus:'CLEAR', culturalStatus:'STANDARD', runtimeNavigable:true,
  };
}

export function createMicroUniverseState(input = {}) {
  let state = createObserverState({ routeSignature:'KDX-MICRO-UNIVERSE', ...input });
  if (!state.currentNodeId) state = reduceObserverState(state,{ type:'VISIT_NODE', nodeId:MICRO_UNIVERSE_ENTRY, fields:MICRO_UNIVERSE_NODES[MICRO_UNIVERSE_ENTRY].fields });
  return state;
}

export function buildMicroUniverseFrame(stateInput, options = {}) {
  const state = createMicroUniverseState(stateInput);
  const ids = MICRO_UNIVERSE_GRAPH[state.currentNodeId] || [];
  return buildRouteFrame({
    candidates: ids.map((id) => candidate(state.currentNodeId,id)),
    observer: state,
    options: { seed:`micro:${state.routeSignature}:${state.currentNodeId}`, publicMode:true, maxChoices:4, ...options },
  });
}

export function enterMicroUniverseNode(stateInput, nodeId, role = null) {
  const node = MICRO_UNIVERSE_NODES[nodeId];
  if (!node) return createMicroUniverseState(stateInput);
  let state = reduceObserverState(stateInput,{ type:'CHOOSE_ROUTE', nodeId, role });
  state = reduceObserverState(state,{ type:'VISIT_NODE', nodeId, fields:node.fields });
  // Synthetic lab key: proves memory-conditioned routing without binding a real Ocín artwork yet.
  if (nodeId === 'ART-IMAGE' && !state.activatedArtworks.includes('OCN-LAB-KEY')) {
    state = reduceObserverState(state,{ type:'ACTIVATE_ART', artworkId:'OCN-LAB-KEY' });
  }
  return state;
}

function deepLinkEligibleNode(nodeId) {
  const node = MICRO_UNIVERSE_NODES[nodeId];
  // A clean external/deep-link entry must never manufacture memory required by a gated node.
  return Boolean(node && !(node.requiredMemory || []).length);
}

export function createMicroUniverseDeepLinkState(input = {}) {
  const nodeId = deepLinkEligibleNode(input.nodeId) ? input.nodeId : MICRO_UNIVERSE_ENTRY;
  let state = createObserverState({ lens: input.lens, routeSignature:'KDX-MICRO-DEEP-LINK' });
  state = reduceObserverState(state,{ type:'VISIT_NODE', nodeId, fields:MICRO_UNIVERSE_NODES[nodeId].fields });
  return state;
}

export function createMicroUniverseHistorySnapshot(stateInput = {}) {
  const observer = createObserverState(stateInput);
  return Object.freeze({
    kind: MICRO_UNIVERSE_HISTORY_KIND,
    // Session history may carry route memory; URLs deliberately do not.
    observer,
  });
}

export function restoreMicroUniverseHistoryState(snapshot, fallback = {}) {
  if (snapshot?.kind === MICRO_UNIVERSE_HISTORY_KIND && MICRO_UNIVERSE_NODES[snapshot?.observer?.currentNodeId]) {
    return createMicroUniverseState(snapshot.observer);
  }
  return createMicroUniverseDeepLinkState(fallback);
}

export function buildMicroUniverseUrl(stateInput = {}, path = MICRO_UNIVERSE_LAB_PATH) {
  const state = createMicroUniverseState(stateInput);
  const params = new URLSearchParams();
  params.set('node', state.currentNodeId || MICRO_UNIVERSE_ENTRY);
  params.set('lens', state.lens);
  return `${path}?${params.toString()}`;
}
