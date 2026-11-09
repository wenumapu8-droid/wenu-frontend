import { ROUTE_ALGORITHM_PROFILE, createObserverState } from '../deep-navigation-engine.js';
import {
  MICRO_UNIVERSE_ENTRY,
  MICRO_UNIVERSE_NODES,
  buildMicroUniverseFrame,
} from '../micro-universe.js';

export const KDX_MACRO_CHAPTER_PROFILE = Object.freeze({
  version: 'macro-chapter-factory-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  routeEngineProfile: ROUTE_ALGORITHM_PROFILE.version,
  routeEngineStatus: ROUTE_ALGORITHM_PROFILE.status,
  autoNavigate: false,
  inventsNodeIds: false,
  inventsPlateIds: false,
});

export class KdxMacroChapterError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxMacroChapterError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

const PACING_ROLE = Object.freeze({
  KNOWLEDGE_PLATE: 'INFORMATION',
  JUNCTION_PLATE: 'CHOICE',
  ACTIVATOR_PLATE: 'PAUSE_THRESHOLD',
});

const cleanId = (value) => String(value || '')
  .toUpperCase()
  .replace(/[^A-Z0-9_-]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 72);

function normalizeValidatedPlates(records) {
  if (!Array.isArray(records) || records.length === 0) {
    throw new KdxMacroChapterError('MISSING_PLATES', 'Macro chapter compilation requires validated plate records.');
  }
  const byNode = new Map();
  for (const record of records) {
    const spec = record?.spec;
    const qa = record?.qa;
    if (!spec?.semantic_node || !spec?.plate_id) {
      throw new KdxMacroChapterError('INVALID_PLATE_RECORD', 'Each macro plate record requires spec.semantic_node and spec.plate_id.', { record });
    }
    if (!MICRO_UNIVERSE_NODES[spec.semantic_node]) {
      throw new KdxMacroChapterError('UNKNOWN_NODE_ID', 'Macro factory may only consume registered micro-universe node IDs in this vertical slice.', { nodeId: spec.semantic_node });
    }
    if (qa?.target_id !== spec.plate_id || qa?.contract_status !== 'PASS') {
      throw new KdxMacroChapterError('PLATE_CONTRACT_NOT_VALIDATED', 'Every macro plate must have matching contract QA PASS before chapter compilation.', {
        nodeId: spec.semantic_node,
        plateId: spec.plate_id,
        qaTarget: qa?.target_id,
        contractStatus: qa?.contract_status,
      });
    }
    if (byNode.has(spec.semantic_node)) {
      throw new KdxMacroChapterError('DUPLICATE_NODE_PLATE', 'Macro chapter accepts exactly one selected plate per semantic node.', { nodeId: spec.semantic_node });
    }
    byNode.set(spec.semantic_node, Object.freeze({ spec, qa }));
  }
  return byNode;
}

function observerAtNode(observer, nodeId) {
  const node = MICRO_UNIVERSE_NODES[nodeId];
  return createObserverState({
    ...observer,
    currentNodeId: nodeId,
    currentFields: node.fields,
  });
}

function routeOptionsFor(nodeId, observer, byNode, seed) {
  const frame = buildMicroUniverseFrame(observerAtNode(observer, nodeId), {
    seed: `macro:${seed}:${nodeId}`,
    publicMode: true,
    maxChoices: 4,
  });
  return frame.selected
    .filter((route) => byNode.has(route.id))
    .map((route) => Object.freeze({
      target_node: route.id,
      target_plate_id: byNode.get(route.id).spec.plate_id,
      role: route.role,
    }));
}

export function assembleMacroChapter(input = {}) {
  const seed = input.seed;
  if (seed === undefined || seed === null || seed === '') {
    throw new KdxMacroChapterError('MISSING_SEED', 'Macro chapter compilation requires an explicit deterministic seed.');
  }
  const chapterId = cleanId(input.chapter_id || input.chapterId || 'MICRO-UNIVERSE');
  if (!chapterId) throw new KdxMacroChapterError('MISSING_CHAPTER_ID', 'Macro chapter requires chapter_id.');
  const byNode = normalizeValidatedPlates(input.plates);
  const entryNode = input.entry_node || input.entryNode || MICRO_UNIVERSE_ENTRY;
  if (!byNode.has(entryNode)) {
    throw new KdxMacroChapterError('MISSING_ENTRY_PLATE', 'Entry node must resolve to a contract-validated plate in the chapter.', { entryNode });
  }

  const observer = createObserverState(input.observer || {});
  const plates = [...byNode.keys()]
    .sort()
    .map((nodeId) => {
      const { spec, qa } = byNode.get(nodeId);
      const pacingRole = PACING_ROLE[spec.plate_type];
      if (!pacingRole) {
        throw new KdxMacroChapterError('UNSUPPORTED_PLATE_TYPE', 'Macro pacing annotation requires a primary PlateSpec type.', { plateType: spec.plate_type });
      }
      return Object.freeze({
        node_id: nodeId,
        plate_id: spec.plate_id,
        plate_type: spec.plate_type,
        pacing_role: pacingRole,
        route_options: Object.freeze(routeOptionsFor(nodeId, observer, byNode, seed)),
        contract_qa_ref: qa.qa_result_id,
      });
    });

  return Object.freeze({
    chapter_id: `KDX-CHAPTER-${chapterId}`,
    version: '0.1.0',
    status: 'IMPLEMENTED_CANDIDATE',
    seed,
    entry_node: entryNode,
    route_engine_profile: ROUTE_ALGORITHM_PROFILE.version,
    runtime_auto_navigation: false,
    observer_context: Object.freeze({
      lens: observer.lens,
      mode: observer.mode,
      memory_signals: Object.freeze([...observer.memorySignals]),
      activated_artworks: Object.freeze([...observer.activatedArtworks]),
    }),
    plates: Object.freeze(plates),
    pacing_profile: Object.freeze({
      status: 'HYPOTHESIS',
      roles_are_annotations_not_runtime_forcing: true,
    }),
    memory_contract: Object.freeze({
      gates_resolved_by_route_engine: true,
      compile_does_not_mutate_visitor_memory: true,
    }),
    validation_state: Object.freeze({
      all_plate_contracts_pass: true,
      rendered_end_to_end: false,
      browser_validated: false,
    }),
    provenance_refs: Object.freeze([
      'repo:src/lib/kodex/deep-navigation-engine.js',
      'repo:src/lib/kodex/micro-universe.js',
      ...[...byNode.values()].flatMap(({ spec }) => spec.provenance_refs || []),
    ].filter((value, index, values) => values.indexOf(value) === index)),
  });
}

export function getMacroChapterPlate(chapter, nodeId) {
  return chapter?.plates?.find((plate) => plate.node_id === nodeId) || null;
}
