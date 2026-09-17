#!/usr/bin/env node
/**
 * KDX.RAE v0.1 — guarded recursive convergence loop for Claude Code / Opus.
 *
 * RAE is the intelligence/reconciliation layer above the existing KODEX
 * WorkOrder, audits, Night Factory and trinquete. One invocation executes at
 * most one bounded convergence cycle. It never commits, pushes, merges or
 * deploys.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(DIR, '..');
const HOME = os.homedir();
const RUNTIME = path.join(ROOT, '.kdx-rae');
const RUNS = path.join(RUNTIME, 'runs');
const STATE_PATH = path.join(RUNTIME, 'state.json');
const EVENTS_PATH = path.join(RUNTIME, 'events.ndjson');
const LOCK_PATH = path.join(RUNTIME, 'lock.json');
const PROMPT_PATH = path.join(ROOT, 'command-center/kdx-rae-prompt.md');

const MODE = process.env.KDX_RAE_MODE || 'monitor'; // monitor | dispatch
const ONCE = process.argv.includes('--once') || process.env.KDX_RAE_ONCE === '1';
const INTERVAL_SEC = Math.max(900, Number(process.env.KDX_RAE_INTERVAL_SEC || 3600));
const MODEL = process.env.KDX_RAE_MODEL || 'claude-opus-5';
const EFFORT = process.env.KDX_RAE_EFFORT || 'high';
const MAX_TURNS = Math.max(4, Number(process.env.KDX_RAE_MAX_TURNS || 20));
const MAX_BUDGET_USD = Math.max(0.5, Number(process.env.KDX_RAE_MAX_BUDGET_USD || 5));
const EXPECTED_BRANCH = process.env.KDX_RAE_BRANCH || 'feat/kdx-rae-v0-1-live';
const DRIVE_DIR = path.resolve(process.env.KDX_RAE_DRIVE_DIR || path.join(HOME, 'Trabajos-Aparte/KODEX/drive-pull'));
const MCP_CONFIG = process.env.KDX_RAE_MCP_CONFIG ? path.resolve(process.env.KDX_RAE_MCP_CONFIG) : '';
const MCP_ALLOW = String(process.env.KDX_RAE_MCP_TOOLS || '').split(',').map((x) => x.trim()).filter(Boolean);

if (!['monitor', 'dispatch'].includes(MODE)) {
  console.error(`[KDX.RAE] invalid KDX_RAE_MODE=${MODE}; use monitor or dispatch.`);
  process.exit(2);
}

const RESULT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['cycle_status', 'selected_work', 'work_id', 'visible_delta', 'files_changed', 'validators', 'blockers', 'needs_ocin', 'next_action'],
  properties: {
    cycle_status: { enum: ['PASS', 'FAIL', 'BLOCKED', 'NEEDS_REVIEW', 'NOOP'] },
    selected_work: { type: 'string' },
    work_id: { type: ['string', 'null'] },
    visible_delta: { type: 'string' },
    files_changed: { type: 'array', items: { type: 'string' } },
    validators: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false,
        required: ['name', 'status', 'evidence'],
        properties: {
          name: { type: 'string' },
          status: { enum: ['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN', 'NOT_VERIFIED'] },
          evidence: { type: 'string' },
        },
      },
    },
    blockers: { type: 'array', items: { type: 'string' } },
    needs_ocin: { type: 'array', items: { type: 'string' } },
    next_action: { type: 'string' },
  },
};

function ensureRuntime() { fs.mkdirSync(RUNS, { recursive: true }); }

function commandPath(name) {
  try {
    return execFileSync('/usr/bin/env', ['sh', '-lc', `command -v ${name}`], { encoding: 'utf8' }).trim();
  } catch { return ''; }
}

function git(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch { return ''; }
}

function gitPath(name) {
  const rel = git(['rev-parse', '--git-path', name]);
  return rel ? path.resolve(ROOT, rel) : '';
}

function gitState() {
  const branch = git(['branch', '--show-current']);
  const head = git(['rev-parse', 'HEAD']);
  const status = git(['status', '--porcelain=v1']);
  const dirtyFiles = status ? status.split('\n').filter(Boolean) : [];
  const operations = ['MERGE_HEAD', 'rebase-apply', 'rebase-merge', 'CHERRY_PICK_HEAD', 'REVERT_HEAD']
    .filter((name) => { const p = gitPath(name); return p && fs.existsSync(p); });
  return { branch, head, dirtyFiles, operations };
}

function appendEvent(event) {
  fs.appendFileSync(EVENTS_PATH, JSON.stringify({ ts: new Date().toISOString(), ...event }) + '\n');
}

function writeState(state) { fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n'); }

function processAlive(pid) {
  if (!pid) return false;
  try { process.kill(pid, 0); return true; } catch { return false; }
}

function acquireLock() {
  try {
    const old = JSON.parse(fs.readFileSync(LOCK_PATH, 'utf8'));
    if (processAlive(old.pid)) return { ok: false, reason: `cycle already running pid=${old.pid}` };
  } catch { /* no valid lock */ }
  fs.writeFileSync(LOCK_PATH, JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }, null, 2) + '\n');
  return { ok: true };
}

function releaseLock() { try { fs.unlinkSync(LOCK_PATH); } catch { /* noop */ } }

function preflight() {
  const claude = commandPath('claude');
  const gs = gitState();
  const errors = [];

  if (!claude) errors.push('Claude Code binary not found in PATH.');
  if (!fs.existsSync(PROMPT_PATH)) errors.push('Missing command-center/kdx-rae-prompt.md.');
  if (!fs.existsSync(path.join(ROOT, 'src/lib/kodex/grammar/work-order-contract.js'))) errors.push('Missing existing WorkOrder contract.');
  if (!fs.existsSync(path.join(ROOT, 'scripts/kodex-trinquete.mjs'))) errors.push('Missing KODEX trinquete.');
  if (!fs.existsSync(path.join(ROOT, 'scripts/kodex-auditoria-total.mjs'))) errors.push('Missing KODEX total audit.');
  if (gs.branch !== EXPECTED_BRANCH) errors.push(`Refusing autonomous writes on branch '${gs.branch}'. Expected '${EXPECTED_BRANCH}'.`);
  if (gs.operations.length) errors.push(`Repository operation in progress: ${gs.operations.join(', ')}.`);
  if (MCP_CONFIG && !fs.existsSync(MCP_CONFIG)) errors.push(`KDX_RAE_MCP_CONFIG does not exist: ${MCP_CONFIG}`);

  return { ok: errors.length === 0, errors, claude, git: gs, driveDirExists: fs.existsSync(DRIVE_DIR) };
}

function toAbsoluteDeny(absPath) {
  const normalized = absPath.replaceAll('\\', '/');
  return `//${normalized.replace(/^\/+/, '')}/**`;
}

function dynamicPrompt(pre) {
  const base = fs.readFileSync(PROMPT_PATH, 'utf8');
  const dirty = pre.git.dirtyFiles.length ? pre.git.dirtyFiles.join('\n') : '(clean worktree)';
  const drive = pre.driveDirExists
    ? `${DRIVE_DIR} (READ-ONLY evidence mirror; verify freshness before relying on it)`
    : 'UNAVAILABLE — do not infer Drive freshness; report Drive coverage as blocked if required';
  const mcp = MCP_CONFIG
    ? `${MCP_CONFIG} (strict MCP config; tools approved: ${MCP_ALLOW.join(', ') || 'none'})`
    : 'not configured';

  return `${base}\n\n---\n\n## MACHINE OBSERVATION FOR THIS CYCLE\n\n<cycle_context>\nTimestamp: ${new Date().toISOString()}\nHost: ${os.hostname()}\nRepository: ${ROOT}\nBranch: ${pre.git.branch}\nHEAD: ${pre.git.head}\nMode: ${MODE}\nDrive mirror: ${drive}\nDirect MCP bridge: ${mcp}\nCurrent git status:\n${dirty}\n</cycle_context>\n\nRe-read disk state before trusting this snapshot. If dirty files represent coherent unfinished work, inspect and validate/continue them before opening another frontier. If the Drive mirror is present, treat it as read-only and use file timestamps/provenance to distinguish stale exports from current evidence. Return only the structured result requested by the runner after doing the work.`;
}

function runClaudeCycle(pre) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const stdoutPath = path.join(RUNS, `${stamp}.stdout.json`);
  const stderrPath = path.join(RUNS, `${stamp}.stderr.log`);

  const allowedTools = [
    'Read', 'Glob', 'Grep', 'Edit', 'Write', 'Agent',
    'Bash(git status *)', 'Bash(git diff *)', 'Bash(git log *)', 'Bash(git show *)', 'Bash(git rev-parse *)',
    'Bash(npm run kodex:que-tenemos *)', 'Bash(npm run kodex:auditoria *)', 'Bash(npm run kodex:inventario *)',
    'Bash(npm run gate:kodex:visual *)', 'Bash(npm run test:kodex *)', 'Bash(npm run audit:kodex:integrity *)',
    'Bash(npm run kodex:trinquete *)', 'Bash(npm run validate:kodex:core *)',
    'Bash(KDX_AGENTE=rae ALLOW_EMPTY_PRODUCTS=true npm run build *)',
    'Bash(node scripts/kodex-*)', 'Bash(npx playwright *)',
    ...MCP_ALLOW,
  ];

  const deniedTools = [
    'Bash(git add *)', 'Bash(git commit *)', 'Bash(git push *)', 'Bash(git merge *)', 'Bash(git rebase *)',
    'Bash(git reset *)', 'Bash(git clean *)', 'Bash(git checkout *)', 'Bash(git switch *)', 'Bash(git tag *)',
    'Bash(rm *)', 'Bash(sudo *)', 'Bash(wrangler *)', 'Bash(npx wrangler *)',
    'Read(//**/.env)', 'Read(//**/.env.*)', 'Read(//**/*.pem)', 'Read(//**/*.key)',
  ];

  if (pre.driveDirExists) deniedTools.push(`Edit(${toAbsoluteDeny(DRIVE_DIR)})`);
  if (!MCP_CONFIG) deniedTools.push('mcp__*');

  const args = [
    '-p',
    '--model', MODEL,
    '--effort', EFFORT,
    '--max-turns', String(MAX_TURNS),
    '--max-budget-usd', String(MAX_BUDGET_USD),
    '--permission-mode', 'acceptEdits',
    '--permission-prompts', 'none',
    '--no-session-persistence',
    '--output-format', 'json',
    '--json-schema', JSON.stringify(RESULT_SCHEMA),
    '--tools', 'Read,Glob,Grep,Edit,Write,Bash,Agent',
    '--allowedTools', ...allowedTools,
    '--disallowedTools', ...deniedTools,
  ];

  if (pre.driveDirExists) args.push('--add-dir', DRIVE_DIR);
  if (MCP_CONFIG) args.push('--strict-mcp-config', '--mcp-config', MCP_CONFIG);
  args.push(dynamicPrompt(pre));

  appendEvent({ type: 'CYCLE_STARTED', branch: pre.git.branch, head: pre.git.head, model: MODEL, maxTurns: MAX_TURNS, maxBudgetUsd: MAX_BUDGET_USD, driveMirror: pre.driveDirExists, mcp: Boolean(MCP_CONFIG) });

  const result = spawnSync(pre.claude, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, CLAUDE_CODE_SUBAGENT_MODEL: MODEL },
  });

  fs.writeFileSync(stdoutPath, result.stdout || '');
  fs.writeFileSync(stderrPath, result.stderr || '');

  const after = gitState();
  const event = {
    type: result.status === 0 ? 'CYCLE_FINISHED' : 'CYCLE_FAILED',
    exitCode: result.status,
    signal: result.signal || null,
    beforeHead: pre.git.head,
    afterHead: after.head,
    beforeDirty: pre.git.dirtyFiles,
    afterDirty: after.dirtyFiles,
    stdout: path.relative(ROOT, stdoutPath),
    stderr: path.relative(ROOT, stderrPath),
  };
  appendEvent(event);
  return { result, after, event };
}

function snapshot(pre, cycle = null) {
  const state = {
    generatedAt: new Date().toISOString(), mode: MODE, once: ONCE, intervalSec: INTERVAL_SEC,
    model: MODEL, effort: EFFORT, maxTurns: MAX_TURNS, maxBudgetUsd: MAX_BUDGET_USD,
    expectedBranch: EXPECTED_BRANCH, driveDir: pre.driveDirExists ? DRIVE_DIR : null,
    mcpConfig: MCP_CONFIG || null, preflight: { ok: pre.ok, errors: pre.errors }, git: pre.git, cycle,
  };
  writeState(state);
  return state;
}

async function tick() {
  ensureRuntime();
  const lock = acquireLock();
  if (!lock.ok) {
    const state = { generatedAt: new Date().toISOString(), mode: MODE, blocked: lock.reason };
    writeState(state);
    console.log(`[KDX.RAE] blocked: ${lock.reason}`);
    return state;
  }

  try {
    const pre = preflight();
    if (!pre.ok) {
      appendEvent({ type: 'PREFLIGHT_BLOCKED', errors: pre.errors, git: pre.git });
      const state = snapshot(pre);
      console.error(`[KDX.RAE] preflight blocked:\n- ${pre.errors.join('\n- ')}`);
      return state;
    }

    if (MODE !== 'dispatch') {
      const state = snapshot(pre);
      console.log(`[KDX.RAE] monitor OK · branch=${pre.git.branch} · head=${pre.git.head.slice(0, 8)} · dirty=${pre.git.dirtyFiles.length} · drive=${pre.driveDirExists ? 'read-only mirror' : 'unavailable'}`);
      return state;
    }

    const cycle = runClaudeCycle(pre);
    const post = preflight();
    const state = snapshot(post, cycle.event);
    console.log(`[KDX.RAE] cycle exit=${cycle.result.status} · dirty=${cycle.after.dirtyFiles.length} · log=${cycle.event.stdout}`);
    return state;
  } finally { releaseLock(); }
}

await tick();
if (!ONCE) {
  setInterval(() => tick().catch((error) => {
    ensureRuntime(); appendEvent({ type: 'RUNNER_ERROR', error: String(error?.stack || error) }); console.error(error);
  }), INTERVAL_SEC * 1000);
}
