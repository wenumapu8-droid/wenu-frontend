#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const mode = args.includes('--prepare') ? 'prepare' : 'check';
const positional = args.filter((arg) => !arg.startsWith('--'));
const configPath = positional[0] ?? 'config/kodex-autopilot/episode.example.json';

const root = process.cwd();
const absoluteConfigPath = path.resolve(root, configPath);

function fail(message) {
  console.error(`[KDX AUTOPILOT] ERROR: ${message}`);
  process.exitCode = 1;
}

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function validateEpisode(config) {
  const errors = [];

  assert(config && typeof config === 'object' && !Array.isArray(config), 'config must be a JSON object', errors);
  if (errors.length) return errors;

  assert(typeof config.episode_id === 'string' && /^KDX-[A-Z0-9_-]+$/.test(config.episode_id), 'episode_id must match KDX-[A-Z0-9_-]+', errors);
  assert(typeof config.title === 'string' && config.title.trim().length > 0, 'title is required', errors);
  assert(typeof config.duration_sec === 'number' && config.duration_sec > 0, 'duration_sec must be > 0', errors);
  assert(['16:9', '9:16', '1:1', '4:5'].includes(config.aspect_ratio), 'unsupported aspect_ratio', errors);

  assert(config.render?.allow_generative_video === false, 'render.allow_generative_video must be false in v0.1', errors);
  assert(['code_first', 'hybrid'].includes(config.render?.mode), 'render.mode must be code_first or hybrid', errors);
  assert(Array.isArray(config.render?.renderers) && config.render.renderers.length > 0, 'render.renderers must contain at least one renderer', errors);

  assert(config.gates?.human_approval_required === true, 'human approval must remain required', errors);
  assert(config.gates?.publish_automatically === false, 'automatic publishing must remain disabled', errors);
  assert(Number.isInteger(config.gates?.max_revision_cycles) && config.gates.max_revision_cycles >= 1 && config.gates.max_revision_cycles <= 10, 'max_revision_cycles must be an integer from 1 to 10', errors);

  assert(Array.isArray(config.outputs) && config.outputs.length > 0, 'outputs must contain at least one deliverable', errors);

  return errors;
}

async function readConfig() {
  const raw = await fs.readFile(absoluteConfigPath, 'utf8');
  return JSON.parse(raw);
}

async function prepareRun(config) {
  const runRoot = path.resolve(root, process.env.KDX_AUTOPILOT_OUTPUT_DIR ?? '.runtime/kdx-autopilot', config.episode_id);
  const dirs = [
    'research',
    'script',
    'beats',
    'assets',
    'animation',
    'render',
    'audio',
    'subtitles',
    'qa',
    'master'
  ];

  await fs.mkdir(runRoot, { recursive: true });
  await Promise.all(dirs.map((dir) => fs.mkdir(path.join(runRoot, dir), { recursive: true })));

  const manifest = {
    ...config,
    status: 'PREPARED',
    prepared_at: new Date().toISOString(),
    source_config: path.relative(root, absoluteConfigPath),
    runtime_root: path.relative(root, runRoot)
  };

  await fs.writeFile(
    path.join(runRoot, 'run-manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n',
    'utf8'
  );

  const status = `# KDX AUTOPILOT RUN

Episode: ${config.episode_id}
Title: ${config.title}
State: PREPARED

This run directory is runtime material, not canonical source.

Next required gate:
- approved script
- source asset provenance
- beat graph
- renderer assignment

Automatic publishing: DISABLED
Generative video: DISABLED
Human approval: REQUIRED
`;

  await fs.writeFile(path.join(runRoot, 'RUN_STATUS.md'), status, 'utf8');

  return runRoot;
}

try {
  const config = await readConfig();
  const errors = validateEpisode(config);

  if (errors.length) {
    errors.forEach((error) => console.error(`- ${error}`));
    fail(`${errors.length} validation error(s)`);
  } else if (mode === 'prepare') {
    const runRoot = await prepareRun(config);
    console.log(JSON.stringify({
      ok: true,
      mode,
      episode_id: config.episode_id,
      run_root: path.relative(root, runRoot),
      automatic_publishing: false,
      generative_video: false,
      human_approval_required: true
    }, null, 2));
  } else {
    console.log(JSON.stringify({
      ok: true,
      mode,
      episode_id: config.episode_id,
      title: config.title,
      duration_sec: config.duration_sec,
      renderers: config.render.renderers,
      automatic_publishing: false,
      generative_video: false,
      human_approval_required: true
    }, null, 2));
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
