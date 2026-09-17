import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desiredPath = path.join(ROOT, 'command-center/kdx-rae-desired-state.v0.1.json');
const runnerPath = path.join(ROOT, 'command-center/kdx-rae.mjs');
const promptPath = path.join(ROOT, 'command-center/kdx-rae-prompt.md');
const workOrderToolPath = path.join(ROOT, 'command-center/kdx-rae-work-order.mjs');

const expectedScenes = ['THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN'];
const expectedAgents = [
  'kdx-archive-librarian.md',
  'kdx-canon-keeper.md',
  'kdx-vision-curator.md',
  'kdx-runtime-architect.md',
  'kdx-qa-gate.md',
];

test('KDX.RAE JavaScript entrypoints parse', () => {
  for (const file of [runnerPath, workOrderToolPath]) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${path.basename(file)} syntax failure:\n${result.stderr || result.stdout}`);
  }
});

test('KDX.RAE desired state preserves the canonical seven-scene spine', () => {
  const desired = JSON.parse(fs.readFileSync(desiredPath, 'utf8'));
  assert.equal(desired.version, '0.1.0');
  assert.equal(desired.epistemic_status, 'CANONICAL');
  assert.deepEqual(desired.canonical_scene_spine, expectedScenes);
  assert.ok(desired.experience_primitives.length >= 8);
  assert.ok(desired.anti_patterns.includes('GENERIC_DASHBOARD_HUD_DOMINANCE'));
  assert.ok(desired.anti_patterns.includes('DOCUMENTATION_GROWTH_WITHOUT_PRODUCT_DELTA'));
  assert.match(desired.creator_gate, /Ocín/i);
});

test('KDX.RAE specialist roster is installed and prompt names it', () => {
  const prompt = fs.readFileSync(promptPath, 'utf8');
  for (const filename of expectedAgents) {
    const full = path.join(ROOT, '.claude/agents', filename);
    assert.equal(fs.existsSync(full), true, `missing ${filename}`);
    assert.ok(fs.readFileSync(full, 'utf8').includes('model: inherit'), `${filename} must inherit the conductor model`);
    assert.ok(prompt.includes(filename.replace(/\.md$/, '')), `prompt does not name ${filename}`);
  }
});

test('KDX.RAE runner contains hard release/destructive denies and bounded execution controls', () => {
  const runner = fs.readFileSync(runnerPath, 'utf8');
  for (const required of [
    "Bash(git add *)",
    "Bash(git commit *)",
    "Bash(git push *)",
    "Bash(git merge *)",
    "Bash(git reset *)",
    "Bash(git clean *)",
    "Bash(wrangler *)",
    "--permission-prompts",
    "--max-turns",
    "--max-budget-usd",
    "--strict-mcp-config",
    "kdx-rae-work-order.mjs",
  ]) assert.ok(runner.includes(required), `runner missing safety/bound control: ${required}`);
});
