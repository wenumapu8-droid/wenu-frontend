import assert from 'node:assert/strict';
import test from 'node:test';

import {
  KDX_FACTORY_BENCHMARK_PROFILE,
  analyzeGoldenFixtureSet,
  factoryBenchmarkDeterministicMetrics,
  runFactoryBenchmark,
} from '../src/lib/kodex/grammar/factory-benchmark.js';

test('factory benchmark measures the requested mechanical metrics without fabricating human acceptance', () => {
  const report = runFactoryBenchmark({ seedCount: 16, seedPrefix: 'ci-factory' });
  assert.equal(report.benchmark_profile, 'factory-benchmark-v0.1.1');
  assert.equal(report.thresholds_status, 'HYPOTHESIS');
  assert.equal(report.seed_count, 16);
  assert.equal(report.attempted_plates, 16 * 12);
  assert.equal(report.valid_plates + report.invalid_plates, report.attempted_plates);
  assert.ok(Number.isFinite(report.invalid_rate));
  assert.ok(Number.isFinite(report.repetition_rate));
  assert.ok(Number.isFinite(report.route_diversity_rate));
  assert.ok(Number.isFinite(report.runtime_cost.p95_seed_ms));
  assert.equal(report.runtime_cost.samples, 16);
  assert.equal(report.human_curator_acceptance.status, 'NOT_RUN');
  assert.equal(report.human_curator_acceptance.rate, null);
  assert.equal(KDX_FACTORY_BENCHMARK_PROFILE.humanAcceptanceIsMechanicalMetric, false);
});

test('current Golden factory benchmark has zero contract-invalid plates across seeded runs', () => {
  const report = runFactoryBenchmark({ seedCount: 24, seedPrefix: 'validity' });
  assert.equal(report.invalid_plates, 0, JSON.stringify(report.failures, null, 2));
  assert.equal(report.invalid_rate, 0);
  assert.equal(report.hypothesis_checks.zero_invalid_contracts, true);
  assert.ok(report.unique_visual_signatures >= 4);
});

test('same seed universe yields deterministic non-timing benchmark metrics', () => {
  const a = runFactoryBenchmark({ seedCount: 12, seedPrefix: 'repro' });
  const b = runFactoryBenchmark({ seedCount: 12, seedPrefix: 'repro' });
  assert.deepEqual(factoryBenchmarkDeterministicMetrics(b), factoryBenchmarkDeterministicMetrics(a));
});

test('benchmark reports diversity and repetition as observations, not hard aesthetic truth', () => {
  const report = runFactoryBenchmark({ seedCount: 24, seedPrefix: 'diversity' });
  assert.ok(report.unique_visual_signatures > 0);
  assert.ok(report.per_node_visual_variation_mean >= 1);
  assert.ok(report.repetition_rate >= 0 && report.repetition_rate <= 1);
  assert.ok(report.unique_route_signatures >= 1);
  assert.ok(report.route_diversity_rate > 0 && report.route_diversity_rate <= 1);
  // Route diversity may legitimately be low in a four-neighbor micro-universe;
  // the benchmark records collapse instead of disguising it as a failure or success.
  assert.equal(typeof report.hypothesis_checks.route_diversity_observed, 'boolean');
});

test('Golden fixture diagnostics expose concentration and repeated structural signatures without creating an aesthetic gate', () => {
  const diagnostic = analyzeGoldenFixtureSet();

  assert.equal(diagnostic.status, 'OBSERVED_DIAGNOSTIC');
  assert.equal(diagnostic.aesthetic_threshold_status, 'NONE');
  assert.equal(diagnostic.total_cases, 12);
  assert.ok(diagnostic.unique_primary_element_ids > 0);
  assert.ok(diagnostic.unique_primary_element_ids <= diagnostic.total_cases);
  assert.ok(diagnostic.max_primary_element_share > 0 && diagnostic.max_primary_element_share <= 1);
  assert.equal(
    diagnostic.primary_element_concentration.reduce((sum, group) => sum + group.count, 0),
    diagnostic.total_cases,
  );
  assert.ok(diagnostic.same_silhouette_groups.every((group) => group.count > 1));
  assert.match(diagnostic.meaning, /does not score aesthetics/i);
});
