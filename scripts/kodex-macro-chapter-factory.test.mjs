import assert from 'node:assert/strict';
import test from 'node:test';

import { assemblePlateSpec } from '../src/lib/kodex/grammar/deterministic-assembler.js';
import { auditUnrenderedPlateSpec } from '../src/lib/kodex/grammar/assembly-qa.js';
import { KDX_GOLDEN_PLATE_CASES } from '../src/lib/kodex/grammar/golden-plate-benchmark.v0.1.js';
import {
  KDX_MACRO_CHAPTER_PROFILE,
  KdxMacroChapterError,
  assembleMacroChapter,
  getMacroChapterPlate,
} from '../src/lib/kodex/grammar/macro-chapter-factory.js';

function goldenRecords() {
  return KDX_GOLDEN_PLATE_CASES.map((entry) => {
    const spec = assemblePlateSpec(entry.node, entry.plate_type, entry.seed);
    const qa = auditUnrenderedPlateSpec(spec, `benchmark:${entry.case_id}`);
    assert.equal(qa.contract_status, 'PASS');
    return { spec, qa };
  });
}

test('macro chapter reuses Deep Route Engine and never authorizes auto-navigation', () => {
  assert.equal(KDX_MACRO_CHAPTER_PROFILE.routeEngineProfile, 'route-slate-v1.1.0');
  assert.equal(KDX_MACRO_CHAPTER_PROFILE.autoNavigate, false);
  assert.equal(KDX_MACRO_CHAPTER_PROFILE.inventsNodeIds, false);
  assert.equal(KDX_MACRO_CHAPTER_PROFILE.inventsPlateIds, false);

  const chapter = assembleMacroChapter({
    chapter_id: 'GOLDEN-MICRO-UNIVERSE',
    seed: 'macro-golden-01',
    plates: goldenRecords(),
  });
  assert.equal(chapter.runtime_auto_navigation, false);
  assert.equal(chapter.route_engine_profile, 'route-slate-v1.1.0');
  assert.equal(chapter.validation_state.all_plate_contracts_pass, true);
  assert.equal(chapter.validation_state.rendered_end_to_end, false);
  assert.equal(chapter.validation_state.browser_validated, false);
});

test('macro chapter contains all 12 registered Golden plates and only routes to those plate IDs', () => {
  const records = goldenRecords();
  const chapter = assembleMacroChapter({ chapter_id: 'GOLDEN-12', seed: 42017, plates: records });
  assert.equal(chapter.plates.length, 12);
  const plateIds = new Set(records.map(({ spec }) => spec.plate_id));
  const nodeIds = new Set(records.map(({ spec }) => spec.semantic_node));
  for (const plate of chapter.plates) {
    assert.ok(plateIds.has(plate.plate_id));
    assert.ok(nodeIds.has(plate.node_id));
    assert.ok(['INFORMATION', 'CHOICE', 'PAUSE_THRESHOLD'].includes(plate.pacing_role));
    assert.ok(plate.route_options.length >= 2 && plate.route_options.length <= 4, `${plate.node_id} route count=${plate.route_options.length}`);
    for (const route of plate.route_options) {
      assert.ok(nodeIds.has(route.target_node), `unknown target node ${route.target_node}`);
      assert.ok(plateIds.has(route.target_plate_id), `unknown target plate ${route.target_plate_id}`);
      assert.ok(['CONTINUITY', 'BRIDGE', 'ECHO', 'SERENDIPITY'].includes(route.role));
    }
  }
});

test('same macro inputs + seed produce byte-equivalent chapter data', () => {
  const records = goldenRecords();
  const a = assembleMacroChapter({ chapter_id: 'REPRO', seed: 'same-seed', plates: records });
  const b = assembleMacroChapter({ chapter_id: 'REPRO', seed: 'same-seed', plates: goldenRecords() });
  assert.deepEqual(b, a);
});

test('memory-gated CON-RITUAL route is absent before activation and appears after verified activation context', () => {
  const records = goldenRecords();
  const before = assembleMacroChapter({ chapter_id: 'MEMORY-BEFORE', seed: 'memory', plates: records });
  const beforeObserver = getMacroChapterPlate(before, 'CON-OBSERVER');
  assert.ok(beforeObserver);
  assert.equal(beforeObserver.route_options.some((route) => route.target_node === 'CON-RITUAL'), false);

  const after = assembleMacroChapter({
    chapter_id: 'MEMORY-AFTER',
    seed: 'memory',
    plates: records,
    observer: {
      activatedArtworks: ['OCN-TOR-001'],
      memorySignals: ['art:OCN-TOR-001'],
    },
  });
  const afterObserver = getMacroChapterPlate(after, 'CON-OBSERVER');
  assert.ok(afterObserver.route_options.some((route) => route.target_node === 'CON-RITUAL'));
  assert.deepEqual(after.observer_context.activated_artworks, ['OCN-TOR-001']);
});

test('macro compile does not mutate supplied observer memory or fake visitor history', () => {
  const observer = {
    lens: 'META',
    mode: 'POETIC',
    activatedArtworks: ['OCN-TOR-001'],
    memorySignals: ['art:OCN-TOR-001'],
    routeTrace: [{ kind: 'VISIT_NODE', nodeId: 'SCI-BIOLOGY' }],
  };
  const snapshot = structuredClone(observer);
  const chapter = assembleMacroChapter({ chapter_id: 'NO-MUTATION', seed: 'x', plates: goldenRecords(), observer });
  assert.deepEqual(observer, snapshot);
  assert.equal(chapter.memory_contract.compile_does_not_mutate_visitor_memory, true);
  assert.equal(chapter.runtime_auto_navigation, false);
});

test('macro factory rejects unvalidated or mismatched plate records instead of improvising', () => {
  const records = goldenRecords();
  const broken = structuredClone(records);
  broken[0].qa.contract_status = 'FAIL';
  assert.throws(
    () => assembleMacroChapter({ chapter_id: 'BROKEN', seed: 'x', plates: broken }),
    (error) => error instanceof KdxMacroChapterError && error.code === 'PLATE_CONTRACT_NOT_VALIDATED',
  );

  const missingEntry = records.filter(({ spec }) => spec.semantic_node !== 'SCI-BIOLOGY');
  assert.throws(
    () => assembleMacroChapter({ chapter_id: 'NO-ENTRY', seed: 'x', plates: missingEntry }),
    (error) => error instanceof KdxMacroChapterError && error.code === 'MISSING_ENTRY_PLATE',
  );
});
