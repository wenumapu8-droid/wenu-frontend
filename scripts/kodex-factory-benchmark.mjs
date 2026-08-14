import fs from 'node:fs/promises';
import path from 'node:path';

import { runFactoryBenchmark } from '../src/lib/kodex/grammar/factory-benchmark.js';

const seedCount = Number.parseInt(process.env.KODEX_FACTORY_BENCHMARK_SEEDS || '32', 10);
const report = runFactoryBenchmark({
  seedCount: Number.isFinite(seedCount) && seedCount > 0 ? seedCount : 32,
  seedPrefix: process.env.KODEX_FACTORY_BENCHMARK_PREFIX || 'ci-factory-report',
});

const outputDir = path.resolve('artifacts/kodex-factory-benchmark');
await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(path.join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

if (report.invalid_rate !== 0) process.exitCode = 1;
