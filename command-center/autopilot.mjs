// Wenu Mapu — safe local autopilot
//
// A small n8n-like loop for the Command Center. It can run forever, inspect the
// queue, and optionally dispatch green-lane agents. Red-lane work remains gated.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, execSync, spawn } from 'node:child_process';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '..');
const STATE_PATH = path.join(ROOT, 'command-center/autopilot-state.json');
const NEXT_PATH = path.join(ROOT, 'command-center/autopilot-next-actions.md');
const ACTIVITY_PATH = path.join(ROOT, 'command-center/activity.ndjson');
const AUTOPILOT_QUEUE_PATH = path.join(ROOT, 'command-center/autopilot-queue.json');
const BRANCH = 'redesign-v2';

const MODE = process.env.WENU_AUTOPILOT_MODE || 'monitor';
const ONCE = process.argv.includes('--once') || process.env.WENU_AUTOPILOT_ONCE === '1';
const INTERVAL_MS = Math.max(60, Number(process.env.WENU_AUTOPILOT_INTERVAL_SEC || 900)) * 1000;
const MAX_PARALLEL = Math.max(1, Number(process.env.WENU_AUTOPILOT_MAX_PARALLEL || 1));
const STALE_WIP_HOURS = Math.max(1, Number(process.env.WENU_AUTOPILOT_STALE_WIP_HOURS || 6));
const DISPATCH_UNCODED = process.env.WENU_AUTOPILOT_ALLOW_UNCODED !== '0';
const INCLUDE_ZONE_TASKS = process.env.WENU_AUTOPILOT_INCLUDE_ZONES === '1';

const FORBIDDEN_RE = /\b(secret|\.env|dns|production|deploy|push|commit|sudo|woocommerce write|wc write|aftercare|delete|rm\b|cloudflare tunnel|apex)\b/i;
const GREEN_WORDS_RE = /\b(audit|auditar|reporte|report|read-only|solo lectura|brief|captions|inventory|inventario|visual|performance|optimizar|build|verify|verificar)\b/i;

const read = (rel) => {
  try {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8');
  } catch {
    return '';
  }
};

const writeJson = (file, data) => {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
};

const resolveBin = (name) => {
  try {
    return execSync(`command -v ${name}`, { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
};

const RUNNERS = {
  codex: resolveBin('codex'),
  opencode: resolveBin('opencode'),
};

function appendActivity(ev) {
  const line = JSON.stringify({ ts: new Date().toISOString(), round: 'autopilot', ...ev }) + '\n';
  fs.appendFileSync(ACTIVITY_PATH, line);
}

function parseQueue() {
  const map = { x: 'done', '~': 'wip', '!': 'blocked', '?': 'decide', ' ': 'todo' };
  const sections = [];
  let cur = null;
  for (const line of read('agent-control/TASK_QUEUE.md').split('\n')) {
    const sec = line.match(/^##\s+(P\d+)\s*[—-]?\s*(.*)$/);
    if (sec) {
      cur = { id: sec[1], name: sec[2].trim(), items: [] };
      sections.push(cur);
      continue;
    }
    const it = line.match(/^- \[([ x~!?])\]\s+\*\*([^*]+)\*\*\s*(.*)$/);
    if (it && cur) {
      cur.items.push({
        status: map[it[1]],
        code: it[2].replace(/\.\s*$/, '').trim(),
        text: it[3].replace(/[`*]/g, '').trim(),
        section: cur.id,
      });
    }
  }
  return sections;
}

function queueStatusByCode(queue) {
  const out = new Map();
  for (const section of queue) {
    for (const item of section.items) out.set(item.code, item);
  }
  return out;
}

function loadZones() {
  try {
    return JSON.parse(read('command-center/zones.json')).zones || [];
  } catch {
    return [];
  }
}

function parseActivity() {
  return read('command-center/activity.ndjson')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .reverse();
}

function loadAutopilotQueue() {
  try {
    const data = JSON.parse(fs.readFileSync(AUTOPILOT_QUEUE_PATH, 'utf8'));
    return Array.isArray(data.tasks) ? data : { tasks: [] };
  } catch {
    return { tasks: [] };
  }
}

function saveAutopilotQueue(queue) {
  fs.writeFileSync(AUTOPILOT_QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
}

function processAlive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function reconcileAutopilotQueue(queue) {
  let changed = false;
  for (const task of queue.tasks) {
    if (task.status !== 'wip') continue;
    if (processAlive(task.pid)) continue;

    const outputExists = task.output ? fs.existsSync(path.join(ROOT, task.output)) : false;
    task.finishedAt = task.finishedAt || new Date().toISOString();
    if (outputExists) {
      task.status = 'done';
      appendActivity({
        agent: task.agent || task.runner,
        lane: 'green',
        action: `autopilot queue done — ${task.id}: ${task.title}`,
        status: 'done',
        output: task.output,
      });
    } else {
      task.status = 'blocked';
      task.blockedReason = `process exited before expected output existed: ${task.output || 'no output declared'}`;
      appendActivity({
        agent: task.agent || task.runner,
        lane: 'green',
        action: `autopilot queue blocked — ${task.id}: ${task.blockedReason}`,
        status: 'blocked',
      });
    }
    changed = true;
  }
  if (changed) saveAutopilotQueue(queue);
  return queue;
}

function gitState() {
  const run = (args) => {
    try {
      return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch {
      return '';
    }
  };
  const branch = run(['branch', '--show-current']);
  const dirty = run(['status', '--porcelain']).split('\n').filter(Boolean);
  let ahead = 0;
  const ab = run(['rev-list', '--left-right', '--count', `origin/${branch}...${branch}`]);
  if (ab) ahead = Number(ab.split(/\s+/)[1] || 0);
  return { branch, dirtyCount: dirty.length, ahead };
}

function taskCode(task) {
  const text = `${task?.title || ''} ${task?.files || ''}`;
  const m = text.match(/\b(P\d+(?:\.\d+)?|[A-Z]\d?|[A-Z]\.\d+)\b/);
  return m ? m[1].replace(/\.$/, '') : null;
}

function buildPrompt(zone) {
  const t = zone.task || {};
  return [
    `Actua como el departamento ${zone.name} de Wenu Mapu (agente: ${(zone.agents || []).join(' / ')}).`,
    `Workspace: ${ROOT} · branch: ${BRANCH}`,
    `Lee primero: agent-control/AGENT_CONTROL_CENTER.md, agent-control/DO_NOT_TOUCH.md, agent-control/CURRENT_STATE.md y agent-control/AGENT_HANDOFF_PROTOCOL.md.`,
    `Antes de editar declara exactamente: TASK / FILES ALLOWED / FORBIDDEN.`,
    '',
    `TAREA: ${t.title || 'sin tarea'}`,
    `FILES ALLOWED: ${t.files || 'solo lectura'}`,
    `FORBIDDEN: ${t.forbidden || 'secrets, DNS, production, WooCommerce writes, sudo, aftercare, git commit/push'}`,
    `LIMITE DEL DEPARTAMENTO: ${zone.limit || 'sin limite declarado'}`,
    '',
    'Trabaja solo en carril verde. No commitees, no pushees, no deploys, no sudo, no .env, no WooCommerce writes.',
    'Si la tarea requiere una decision humana o carril rojo, no ejecutes: deja un reporte corto y termina.',
    'Al terminar devuelve: RESULT / WHAT CHANGED / WHAT VERIFIED / WHAT NEXT.',
  ].join('\n');
}

function recentWipFor(zone, activity) {
  const agents = new Set(zone.agents || []);
  const cutoff = Date.now() - STALE_WIP_HOURS * 60 * 60 * 1000;
  const latest = activity.find((ev) => {
    const who = ev.agent || ev.actor;
    return agents.has(who);
  });
  if (!latest || latest.status !== 'wip') return null;
  const ts = Date.parse(latest.ts || '');
  return Number.isFinite(ts) && ts > cutoff ? latest : null;
}

function classifyQueueTask(task, activity) {
  const taskSurface = `${task.title || ''} ${task.files || ''}`;
  const blockedReasons = [];
  if (!task.runner) blockedReasons.push('no runner configured');
  if (task.runner && !RUNNERS[task.runner]) blockedReasons.push(`runner '${task.runner}' not found`);
  if (!task.title) blockedReasons.push('no title');
  if (task.status !== 'todo') blockedReasons.push(`status is ${task.status || 'missing'}`);
  if (FORBIDDEN_RE.test(taskSurface)) blockedReasons.push('task mentions a red-lane or protected surface');
  if (!GREEN_WORDS_RE.test(taskSurface)) blockedReasons.push('task is not clearly green-lane');
  if (task.output && fs.existsSync(path.join(ROOT, task.output))) blockedReasons.push(`output already exists: ${task.output}`);
  const latest = activity.find((ev) => (ev.agent || ev.actor) === (task.agent || task.runner));
  if (latest?.status === 'wip') {
    const ts = Date.parse(latest.ts || '');
    if (Number.isFinite(ts) && ts > Date.now() - STALE_WIP_HOURS * 60 * 60 * 1000) blockedReasons.push('agent has a recent wip entry');
  }
  const queue = loadAutopilotQueue();
  const liveWip = queue.tasks.find((item) => item.id !== task.id && item.status === 'wip' && processAlive(item.pid));
  if (liveWip) blockedReasons.push(`queue already has live wip: ${liveWip.id}`);
  return {
    source: 'autopilot-queue',
    queueId: task.id,
    zone: task.zone || task.runner,
    name: task.name || task.runner,
    runner: task.runner,
    task: task.title,
    files: task.files || 'solo lectura',
    forbidden: task.forbidden || 'secrets, DNS, production, WooCommerce writes, sudo, aftercare, git commit/push',
    safe: blockedReasons.length === 0,
    blockedReasons,
    prompt: buildTaskPrompt(task),
  };
}

function buildTaskPrompt(task) {
  return [
    `Actua como ${task.agent || task.runner} para Wenu Mapu.`,
    `Workspace: ${ROOT} · branch: ${BRANCH}`,
    `Lee primero: agent-control/AGENT_CONTROL_CENTER.md, agent-control/DO_NOT_TOUCH.md, agent-control/CURRENT_STATE.md y agent-control/AGENT_HANDOFF_PROTOCOL.md.`,
    `Antes de editar declara exactamente: TASK / FILES ALLOWED / FORBIDDEN.`,
    '',
    `TAREA: ${task.title}`,
    `FILES ALLOWED: ${task.files || 'solo lectura'}`,
    `FORBIDDEN: ${task.forbidden || 'secrets, DNS, production, WooCommerce writes, sudo, aftercare, git commit/push'}`,
    task.output ? `OUTPUT REQUIRED: ${task.output}` : '',
    '',
    'Trabaja solo en carril verde. No commitees, no pushees, no deploys, no sudo, no .env, no WooCommerce writes.',
    'Si la tarea requiere una decision humana o carril rojo, no ejecutes: deja un reporte corto en el output requerido y termina.',
    'Al terminar devuelve: RESULT / WHAT CHANGED / WHAT VERIFIED / WHAT NEXT.',
  ].filter(Boolean).join('\n');
}

function classifyZone(zone, queueMap, activity, git) {
  const task = zone.task || {};
  const runner = zone.runner;
  const code = taskCode(task);
  const qItem = code ? queueMap.get(code) : null;
  const taskSurface = `${task.title || ''} ${task.files || ''}`;
  const blockedReasons = [];

  if (!runner) blockedReasons.push('no runner configured');
  if (runner && !RUNNERS[runner]) blockedReasons.push(`runner '${runner}' not found`);
  if (!task.title) blockedReasons.push('no task configured');
  if (FORBIDDEN_RE.test(taskSurface)) blockedReasons.push('task mentions a red-lane or protected surface');
  if (!GREEN_WORDS_RE.test(taskSurface)) blockedReasons.push('task is not clearly green-lane');
  if (code && !qItem) blockedReasons.push(`task code ${code} not found in TASK_QUEUE`);
  if (qItem && qItem.status === 'done') blockedReasons.push(`task ${code} is already done`);
  if (qItem && ['blocked', 'decide'].includes(qItem.status)) blockedReasons.push(`task ${code} is ${qItem.status}`);
  if (!code && !DISPATCH_UNCODED) blockedReasons.push('task has no TASK_QUEUE code');
  if (recentWipFor(zone, activity)) blockedReasons.push('agent has a recent wip entry');

  return {
    zone: zone.id,
    name: zone.name,
    runner,
    code,
    task: task.title || null,
    safe: blockedReasons.length === 0,
    blockedReasons,
    prompt: buildPrompt(zone),
  };
}

function dispatch(candidate) {
  const runnerPath = RUNNERS[candidate.runner];
  const logName = candidate.queueId || candidate.zone;
  const logPath = path.join(ROOT, `command-center/autopilot-${logName}.log`);
  fs.writeFileSync(logPath, `# autopilot dispatch ${candidate.name} · ${new Date().toISOString()}\n\n`);
  const fd = fs.openSync(logPath, 'a');
  const args = candidate.runner === 'codex'
    ? ['exec', '-c', 'sandbox_mode=workspace-write', '-c', 'approval_policy=never', candidate.prompt]
    : ['run', candidate.prompt];
  const child = spawn(runnerPath, args, { cwd: ROOT, detached: true, stdio: ['ignore', fd, fd] });
  child.unref();
  appendActivity({
    agent: candidate.runner === 'codex' ? 'codex' : candidate.runner,
    lane: 'green',
    action: `autopilot despacho ${candidate.name} — ${candidate.task}`,
    status: 'wip',
    pid: child.pid,
  });
  return { pid: child.pid, logPath };
}

function renderNextActions(state) {
  const lines = [
    '# Wenu Mapu — Autopilot Next Actions',
    '',
    `Generated: ${state.generatedAt}`,
    `Mode: ${state.mode}`,
    `Runners: codex=${state.runners.codex ? 'ok' : 'missing'}, opencode=${state.runners.opencode ? 'ok' : 'missing'}`,
    `Git: ${state.git.branch}, dirty=${state.git.dirtyCount}, ahead=${state.git.ahead}`,
    '',
    '## Dispatchable',
    '',
  ];
  const safe = state.candidates.filter((c) => c.safe);
  if (!safe.length) lines.push('- None right now.');
  for (const c of safe) lines.push(`- ${c.name}: ${c.task}`);
  lines.push('', '## Blocked / Waiting', '');
  for (const c of state.candidates.filter((x) => !x.safe)) {
    lines.push(`- ${c.name}: ${c.task || 'no task'} — ${c.blockedReasons.join('; ')}`);
  }
  lines.push('', '## Safety', '');
  lines.push('- Autopilot never runs red-lane actions.');
  lines.push('- Human approval is still required for commits, pushes, DNS, production deploys, sudo, secrets, and WooCommerce writes.');
  fs.writeFileSync(NEXT_PATH, lines.join('\n') + '\n');
}

async function tick() {
  const queue = parseQueue();
  const autopilotQueue = reconcileAutopilotQueue(loadAutopilotQueue());
  const queueMap = queueStatusByCode(queue);
  const activity = parseActivity();
  const git = gitState();
  const queueCandidates = autopilotQueue.tasks
    .map((task) => classifyQueueTask(task, activity))
    .filter((candidate) => candidate.safe || candidate.blockedReasons.length);
  const zoneCandidates = INCLUDE_ZONE_TASKS
    ? loadZones()
      .filter((zone) => zone.runner)
      .map((zone) => classifyZone(zone, queueMap, activity, git))
    : [];
  const candidates = [...queueCandidates, ...zoneCandidates];
  const state = {
    generatedAt: new Date().toISOString(),
    mode: MODE,
    intervalSec: Math.round(INTERVAL_MS / 1000),
    maxParallel: MAX_PARALLEL,
    runners: RUNNERS,
    git,
    candidates: candidates.map(({ prompt, ...c }) => c),
    autopilotQueue: autopilotQueue.tasks.map(({ prompt, ...task }) => task),
    dispatched: [],
  };

  if (MODE === 'dispatch') {
    for (const candidate of candidates.filter((c) => c.safe).slice(0, MAX_PARALLEL)) {
      const out = dispatch(candidate);
      state.dispatched.push({ zone: candidate.zone, runner: candidate.runner, ...out });
      if (candidate.source === 'autopilot-queue') {
        const task = autopilotQueue.tasks.find((item) => item.id === candidate.queueId);
        if (task) {
          task.status = 'wip';
          task.pid = out.pid;
          task.logPath = path.relative(ROOT, out.logPath);
          task.startedAt = new Date().toISOString();
          saveAutopilotQueue(autopilotQueue);
        }
      }
    }
  }

  writeJson(STATE_PATH, state);
  renderNextActions(state);
  appendActivity({
    agent: 'orquestador',
    lane: 'green',
    action: `autopilot tick — mode=${MODE}, dispatchable=${candidates.filter((c) => c.safe).length}, dispatched=${state.dispatched.length}`,
    status: 'done',
  });

  console.log(`[autopilot] ${state.generatedAt} mode=${MODE} dispatchable=${candidates.filter((c) => c.safe).length} dispatched=${state.dispatched.length}`);
  return state;
}

await tick();

if (!ONCE) {
  setInterval(() => {
    tick().catch((err) => {
      appendActivity({ agent: 'orquestador', lane: 'green', action: `autopilot error — ${String(err).slice(0, 180)}`, status: 'blocked' });
      console.error(err);
    });
  }, INTERVAL_MS);
}
