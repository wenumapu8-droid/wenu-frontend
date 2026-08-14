import { performance } from 'node:perf_hooks';

import { assemblePlateSpec, tryAssemblePlateSpec } from './deterministic-assembler.js';
import { auditUnrenderedPlateSpec } from './assembly-qa.js';
import { KDX_GOLDEN_PLATE_CASES } from './golden-plate-benchmark.v0.1.js';
import { assembleMacroChapter } from './macro-chapter-factory.js';

export const KDX_FACTORY_BENCHMARK_PROFILE = Object.freeze({
  version: 'factory-benchmark-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  thresholdsStatus: 'HYPOTHESIS',
  humanAcceptanceIsMechanicalMetric: false,
  defaultSeedCount: 24,
});

const visualSignature = (spec) => JSON.stringify({
  plate_type: spec.plate_type,
  payload_type: spec.primary_payload?.payload_type,
  composition: spec.slots?.[0]?.element_id || null,
  motion: spec.motion_profile?.element_ids || [],
});

const chapterRouteSignature = (chapter) => JSON.stringify(chapter.plates.map((plate) => ({
  node: plate.node_id,
  routes: plate.route_options.map((route) => `${route.role}:${route.target_node}`),
})));

const percentile = (values, p) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
  return sorted[index];
};

function runSeed(seed) {
  const started = performance.now();
  const records = [];
  const invalid = [];
  const signatures = [];
  const signaturesByNode = new Map();

  for (const entry of KDX_GOLDEN_PLATE_CASES) {
    const plateSeed = `${seed}|${entry.case_id}`;
    const result = tryAssemblePlateSpec(entry.node, entry.plate_type, plateSeed);
    if (!result.ok) {
      invalid.push({ case_id: entry.case_id, node_id: entry.node_id, error: result.error });
      continue;
    }
    const spec = result.spec;
    const qa = auditUnrenderedPlateSpec(spec, `benchmark:${entry.case_id}:${seed}`);
    if (qa.contract_status !== 'PASS') {
      invalid.push({ case_id: entry.case_id, node_id: entry.node_id, error: { code: 'CONTRACT_QA_FAIL', details: qa.blockers } });
      continue;
    }
    records.push({ spec, qa });
    const signature = visualSignature(spec);
    signatures.push(signature);
    if (!signaturesByNode.has(entry.node_id)) signaturesByNode.set(entry.node_id, []);
    signaturesByNode.get(entry.node_id).push(signature);
  }

  let chapter = null;
  let routeSignature = null;
  if (records.length === KDX_GOLDEN_PLATE_CASES.length) {
    chapter = assembleMacroChapter({
      chapter_id: 'FACTORY-BENCHMARK',
      seed,
      plates: records,
    });
    routeSignature = chapterRouteSignature(chapter);
  }

  return {
    seed,
    attempted: KDX_GOLDEN_PLATE_CASES.length,
    valid: records.length,
    invalid,
    signatures,
    signaturesByNode,
    routeSignature,
    elapsedMs: performance.now() - started,
  };
}

export function runFactoryBenchmark(options = {}) {
  const seedCount = Math.max(1, Number.isFinite(options.seedCount) ? Math.floor(options.seedCount) : KDX_FACTORY_BENCHMARK_PROFILE.defaultSeedCount);
  const seedPrefix = String(options.seedPrefix || 'kdx-factory');
  const runs = [];
  const allVisualSignatures = [];
  const perNodeSignatures = new Map();
  const routeSignatures = new Set();
  const elapsed = [];
  let attemptedPlates = 0;
  let invalidPlates = 0;

  for (let index = 0; index < seedCount; index += 1) {
    const run = runSeed(`${seedPrefix}-${index}`);
    runs.push(run);
    attemptedPlates += run.attempted;
    invalidPlates += run.invalid.length;
    allVisualSignatures.push(...run.signatures);
    elapsed.push(run.elapsedMs);
    if (run.routeSignature) routeSignatures.add(run.routeSignature);
    for (const [nodeId, signatures] of run.signaturesByNode.entries()) {
      if (!perNodeSignatures.has(nodeId)) perNodeSignatures.set(nodeId, new Set());
      for (const signature of signatures) perNodeSignatures.get(nodeId).add(signature);
    }
  }

  const uniqueVisualSignatures = new Set(allVisualSignatures);
  const perNodeUniqueCounts = [...perNodeSignatures.values()].map((set) => set.size);
  const perNodeVariationMean = perNodeUniqueCounts.length
    ? perNodeUniqueCounts.reduce((sum, value) => sum + value, 0) / perNodeUniqueCounts.length
    : 0;
  const invalidRate = attemptedPlates ? invalidPlates / attemptedPlates : 1;
  const repetitionRate = attemptedPlates
    ? 1 - ([...perNodeSignatures.values()].reduce((sum, set) => sum + set.size, 0) / attemptedPlates)
    : 1;
  const routeDiversityRate = seedCount ? routeSignatures.size / seedCount : 0;

  return Object.freeze({
    benchmark_profile: KDX_FACTORY_BENCHMARK_PROFILE.version,
    thresholds_status: KDX_FACTORY_BENCHMARK_PROFILE.thresholdsStatus,
    seed_count: seedCount,
    attempted_plates: attemptedPlates,
    valid_plates: attemptedPlates - invalidPlates,
    invalid_plates: invalidPlates,
    invalid_rate: Number(invalidRate.toFixed(6)),
    repetition_rate: Number(repetitionRate.toFixed(6)),
    unique_visual_signatures: uniqueVisualSignatures.size,
    per_node_visual_variation_mean: Number(perNodeVariationMean.toFixed(3)),
    unique_route_signatures: routeSignatures.size,
    route_diversity_rate: Number(routeDiversityRate.toFixed(6)),
    runtime_cost: Object.freeze({
      total_ms: Number(elapsed.reduce((sum, value) => sum + value, 0).toFixed(3)),
      mean_seed_ms: Number((elapsed.reduce((sum, value) => sum + value, 0) / elapsed.length).toFixed(3)),
      p95_seed_ms: Number(percentile(elapsed, 0.95).toFixed(3)),
      samples: elapsed.length,
    }),
    human_curator_acceptance: Object.freeze({
      status: 'NOT_RUN',
      accepted: null,
      reviewed: 0,
      rate: null,
      meaning: 'Human aesthetic/curatorial acceptance must be recorded from actual review; it is never inferred from machine validity.',
    }),
    hypothesis_checks: Object.freeze({
      zero_invalid_contracts: invalidRate === 0,
      multiple_visual_signatures: uniqueVisualSignatures.size >= 4,
      seed_changes_visuals_per_node: perNodeVariationMean > 1,
      route_diversity_observed: routeSignatures.size > 1,
    }),
    failures: Object.freeze(runs.flatMap((run) => run.invalid.map((item) => ({ seed: run.seed, ...item })))),
  });
}

export function factoryBenchmarkDeterministicMetrics(report) {
  return Object.freeze({
    benchmark_profile: report.benchmark_profile,
    seed_count: report.seed_count,
    attempted_plates: report.attempted_plates,
    valid_plates: report.valid_plates,
    invalid_plates: report.invalid_plates,
    invalid_rate: report.invalid_rate,
    repetition_rate: report.repetition_rate,
    unique_visual_signatures: report.unique_visual_signatures,
    per_node_visual_variation_mean: report.per_node_visual_variation_mean,
    unique_route_signatures: report.unique_route_signatures,
    route_diversity_rate: report.route_diversity_rate,
    human_curator_acceptance: report.human_curator_acceptance,
    hypothesis_checks: report.hypothesis_checks,
    failures: report.failures,
  });
}
