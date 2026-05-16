// Wenu Mapu — Centro de Mando (interactivo)
// Servidor local sin dependencias. Lee el estado real y ejecuta acciones:
// despachar agentes (codex/opencode), registrar eventos, ejecutar el RED-LANE.
// Solo escucha en 127.0.0.1 — interfaz privada del dueno.
//   node command-center/server.mjs   ->  http://localhost:7878

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync, execFileSync, spawn } from 'node:child_process';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(DIR, '..');
const PORT = Number(process.env.CC_PORT || 7878);
const LIVE = 'https://redesign-v2.wenu-frontend.pages.dev';
const BRANCH = 'redesign-v2';
const REDLANE_CONFIRM = `PUBLICAR ${BRANCH}`;
const REDLANE_ENABLED = process.env.WENU_COMMAND_CENTER_ALLOW_REDLANE === '1';

const read = (p) => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch { return ''; } };
const resolveBin = (n) => { try { return execSync(`command -v ${n}`, { encoding: 'utf8' }).trim(); } catch { return ''; } };
const RUNNERS = { codex: resolveBin('codex'), opencode: resolveBin('opencode') };

function parseQueue() {
  const lines = read('agent-control/TASK_QUEUE.md').split('\n');
  const map = { x: 'done', '~': 'wip', '!': 'blocked', '?': 'decide', ' ': 'todo' };
  const sections = []; let cur = null;
  for (const line of lines) {
    const sec = line.match(/^##\s+(P\d)\s*[—-]?\s*(.*)$/);
    if (sec) { cur = { id: sec[1], name: sec[2].replace(/\s*\(.*?\)\s*/g, '').trim(), items: [] }; sections.push(cur); continue; }
    const it = line.match(/^- \[([ x~!?])\]\s+\*\*([^*]+)\*\*\s*(.*)$/);
    if (it && cur) cur.items.push({
      status: map[it[1]], code: it[2].replace(/\.\s*$/, '').trim(),
      text: it[3].replace(/[`*]/g, '').replace(/\*\(plan:.*?\)\*/g, '').trim().slice(0, 180),
    });
  }
  return sections;
}
function parseRounds() {
  const txt = read('agent-control/CURRENT_STATE.md');
  const end = txt.indexOf('\n## WordPress');
  const region = end > 0 ? txt.slice(0, end) : txt;
  return [...region.matchAll(/^###\s+(.+)$/gm)].map((m) => m[1].replace(/[`*]/g, '').trim());
}
function parseActivity() {
  return read('command-center/activity.ndjson').split('\n').filter(Boolean)
    .map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean).reverse();
}
function git() {
  const run = (c) => { try { return execSync(c, { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { return ''; } };
  const branch = run('git branch --show-current');
  const commits = run('git log -6 --format=%h%x1f%s%x1f%cr').split('\n').filter(Boolean)
    .map((l) => { const [h, s, t] = l.split('\x1f'); return { h, s, t }; });
  const dirty = run('git status --porcelain').split('\n').filter(Boolean).length;
  let ahead = 0;
  const ab = run(`git rev-list --left-right --count origin/${branch}...${branch} 2>/dev/null`);
  if (ab) ahead = Number(ab.split(/\s+/)[1] || 0);
  return { branch, commits, dirty, ahead };
}
let siteCache = { ts: 0, data: null };
async function siteHealth() {
  if (siteCache.data && Date.now() - siteCache.ts < 90000) return siteCache.data;
  const routes = ['/', '/shop', '/piercing', '/aftercare/']; const data = [];
  for (const r of routes) {
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 8000);
      const res = await fetch(LIVE + r, { signal: ctrl.signal, redirect: 'follow' });
      clearTimeout(timer);
      data.push({ route: r, code: res.status, ok: res.ok });
    } catch { data.push({ route: r, code: 0, ok: false }); }
  }
  siteCache = { ts: Date.now(), data };
  return data;
}

function loadZones() { try { return JSON.parse(read('command-center/zones.json')).zones; } catch { return []; } }

function buildPrompt(z) {
  const t = z.task; if (!t) return '';
  return [
    `Actua como el departamento ${z.name} de Wenu Mapu (agente: ${(z.agents || []).join(' / ')}).`,
    `Workspace: ${ROOT}   ·   branch: ${BRANCH}`,
    `Lee primero: agent-control/AGENT_HANDOFF_PROTOCOL.md, agent-control/CURRENT_STATE.md y docs/handoffs/2026-05-15-vscode-codex-agent-handoff.md si existe.`,
    `Antes de editar declara exactamente: TASK / FILES ALLOWED / FORBIDDEN.`,
    ``,
    `TAREA: ${t.title}`,
    `FILES ALLOWED: ${t.files}`,
    `FORBIDDEN: ${t.forbidden}`,
    `LIMITE DEL DEPARTAMENTO: ${z.limit}`,
    ``,
    `Trabaja SOLO en los archivos permitidos. No otro archivo. No commitees ni pushees.`,
    `Si hay archivos sucios fuera de tu alcance, para y reporta handoff en vez de editar.`,
    `Al terminar devolve: RESULT (success/blocked/partial) / WHAT CHANGED / WHAT VERIFIED / WHAT NEXT.`,
  ].join('\n');
}

function buildZones(queue, activity) {
  return loadZones().map((z) => {
    const items = queue.filter((q) => z.owns.includes(q.id)).flatMap((q) => q.items.map((i) => ({ ...i, p: q.id })));
    const done = items.filter((i) => i.status === 'done').length;
    const wip = items.filter((i) => i.status === 'wip');
    const blocked = items.filter((i) => i.status === 'blocked');
    const decide = items.filter((i) => i.status === 'decide');
    const todo = items.filter((i) => i.status === 'todo');
    const next = wip[0] || todo[0] || decide[0] || null;
    const evs = activity.filter((a) => z.agents.includes(a.agent));
    const last = evs[0] || null;
    const lastTs = last ? last.ts : null;
    const idleMin = lastTs ? Math.max(0, Math.round((Date.now() - new Date(lastTs).getTime()) / 60000)) : null;
    const pendingRed = evs.some((a) => a.status === 'pending' && a.lane === 'red');
    let status = 'LIBRE';
    if (blocked.length) status = 'BLOQUEADO';
    else if (pendingRed || decide.length) status = 'ESPERA OK';
    else if (wip.length) status = 'EN CURSO';
    else if (todo.length) status = 'PENDIENTE';
    else if (items.length) status = 'AL DIA';
    else if (last) status = last.status === 'pending' ? 'ESPERA OK' : 'AL DIA';
    return {
      id: z.id, tag: z.tag, name: z.name, role: z.role || '', color: z.color || '#C4935A',
      agents: z.agents, specialty: z.specialty, feeds: z.feeds || [],
      domain: z.domain || '', limit: z.limit || '', task: z.task || null,
      runner: z.runner || null, runnerReady: !!(z.runner && RUNNERS[z.runner]),
      prompt: buildPrompt(z),
      total: items.length, done, status,
      pct: items.length ? Math.round((done / items.length) * 100) : (last && last.status !== 'pending' ? 100 : 0),
      ahora: last ? last.action : 'sin actividad registrada',
      ahoraTs: lastTs, lastSignal: lastTs, idleMin,
      stalled: (status === 'EN CURSO' || status === 'PENDIENTE') && (idleMin === null || idleMin > 360),
      siguiente: next ? (next.code + ' — ' + next.text) : (items.length ? 'todas las tareas cerradas' : 'trabajo por demanda'),
    };
  });
}

function buildStages(queue) {
  let cfg = [];
  try { cfg = JSON.parse(read('command-center/stages.json')).stages; } catch { cfg = []; }
  const allItems = queue.flatMap((q) => q.items);
  const isDone = (o) => {
    if (o.queue) { const it = allItems.find((i) => i.code === o.queue); return it ? it.status === 'done' : false; }
    return !!o.done;
  };
  const stages = cfg.map((s) => {
    const objectives = s.objectives.map((o) => ({ label: o.label, done: isDone(o) }));
    const done = objectives.filter((o) => o.done).length;
    return { n: s.n, name: s.name, goal: s.goal, objectives, done, total: objectives.length, complete: objectives.length > 0 && done === objectives.length };
  });
  const current = stages.find((s) => !s.complete) || stages[stages.length - 1] || null;
  return { stages, level: current ? current.n : stages.length, currentName: current ? current.name : '', current };
}

let invCache = { ts: 0, data: null };
async function inventory() {
  if (invCache.data && Date.now() - invCache.ts < 120000) return invCache.data;
  const live = { count: null, cats: {} };
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(LIVE + '/search-index.json', { signal: ctrl.signal });
    clearTimeout(timer);
    const arr = await res.json();
    live.count = arr.length;
    for (const p of arr) { const c = p.cat || 'sin categoria'; live.cats[c] = (live.cats[c] || 0) + 1; }
  } catch { /* offline */ }
  let cfg = {};
  try { cfg = JSON.parse(read('command-center/inventory.json')); } catch { /* none */ }
  const data = { live, cfg };
  invCache = { ts: Date.now(), data };
  return data;
}

function buildAgents(activity) {
  let cfg = [];
  try { cfg = JSON.parse(read('command-center/agents.json')).agents; } catch { /* none */ }
  return cfg.map((a) => {
    const evs = activity.filter((e) => e.agent === a.id);
    const last = evs[0] || null;
    const working = last && (last.status === 'wip' || last.status === 'pending');
    return {
      ...a,
      status: working ? 'TRABAJANDO' : (last ? 'EN ESPERA' : 'INACTIVO'),
      last: last ? last.action : 'sin actividad registrada',
      lastTs: last ? last.ts : null,
      idleMin: last ? Math.max(0, Math.round((Date.now() - new Date(last.ts).getTime()) / 60000)) : null,
    };
  });
}

async function buildState() {
  const queue = parseQueue();
  let done = 0, total = 0;
  for (const s of queue) { s.done = s.items.filter((i) => i.status === 'done').length; s.total = s.items.length; done += s.done; total += s.total; }
  const activity = parseActivity();
  return {
    now: new Date().toISOString(),
    mission: { done, total, pct: total ? Math.round((done / total) * 100) : 0 },
    stages: buildStages(queue),
    zones: buildZones(queue, activity),
    queue, rounds: parseRounds(), activity,
    git: git(), site: await siteHealth(), liveUrl: LIVE, runners: RUNNERS,
    inventory: await inventory(), agents: buildAgents(activity),
    safety: {
      redlaneEnabled: REDLANE_ENABLED,
      redlaneConfirm: REDLANE_CONFIRM,
      forbidden: ['secrets', 'DNS', 'production deploys', 'WooCommerce writes', 'sudo', 'aftercare'],
    },
  };
}

// ---- acciones ----
function appendActivity(ev) {
  const line = JSON.stringify({ ts: new Date().toISOString().slice(0, 19), round: 4, ...ev }) + '\n';
  fs.appendFileSync(path.join(ROOT, 'command-center/activity.ndjson'), line);
}

function dispatch(zoneId) {
  const z = loadZones().find((x) => x.id === zoneId);
  if (!z) return { ok: false, error: 'departamento desconocido' };
  if (!z.runner || !RUNNERS[z.runner]) return { ok: false, error: 'este departamento lo despacha el Captain — copia el prompt' };
  const active = parseActivity().find((a) => a.status === 'wip' && (z.agents || []).includes(a.agent));
  if (active) {
    return { ok: false, error: `ese departamento ya tiene trabajo en curso: ${active.action}` };
  }
  const prompt = buildPrompt(z);
  const logPath = path.join(ROOT, `command-center/dispatch-${zoneId}.log`);
  fs.writeFileSync(logPath, `# despacho ${z.name} · ${new Date().toISOString()}\n# ${z.task.title}\n\n`);
  const fd = fs.openSync(logPath, 'a');
  const args = z.runner === 'codex'
    ? ['exec', '-c', 'sandbox_mode=workspace-write', '-c', 'approval_policy=never', prompt]
    : ['run', prompt];
  const child = spawn(RUNNERS[z.runner], args, { cwd: ROOT, detached: true, stdio: ['ignore', fd, fd] });
  child.unref();
  appendActivity({ agent: z.agents[0], lane: 'green', action: `despachado desde el panel — ${z.task.title}`, status: 'wip' });
  return { ok: true, runner: z.runner, pid: child.pid };
}

function redlane(payload = {}) {
  const log = [];
  if (!REDLANE_ENABLED) {
    return {
      ok: false,
      log: [
        'RED-LANE bloqueado por seguridad.',
        'Para habilitarlo, reinicia el centro con WENU_COMMAND_CENTER_ALLOW_REDLANE=1.',
        `Aun habilitado, exige confirmacion exacta: ${REDLANE_CONFIRM}`,
      ],
    };
  }

  if (payload.confirm !== REDLANE_CONFIRM) {
    return {
      ok: false,
      log: [
        'Confirmacion incorrecta.',
        `Escribe exactamente: ${REDLANE_CONFIRM}`,
      ],
    };
  }

  try {
    const dirty = execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    if (dirty.length > 30) {
      return {
        ok: false,
        log: [
          `RED-LANE bloqueado: hay ${dirty.length} archivos dirty.`,
          'Revisa y reduce el lote antes de publicar.',
        ],
      };
    }

    execFileSync('git', ['add', '-A'], { cwd: ROOT });
    log.push('git add -A — ok');
    try {
      execFileSync('git', ['commit', '-m', 'feat(round-4): centro de mando, contenido journal+IG, fixes XSS y auditorias',
        '-m', 'Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>'], { cwd: ROOT });
      log.push('git commit — ok');
    } catch (e) { log.push('git commit — ' + String((e.stdout || e.message || '')).slice(0, 200)); }
    const out = execFileSync('git', ['push', 'origin', BRANCH], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    log.push('git push — ok ' + String(out).trim());
    appendActivity({ agent: 'orquestador', lane: 'red', action: 'RED-LANE ejecutado desde el panel — commit + push a ' + BRANCH, status: 'done' });
    return { ok: true, log };
  } catch (e) {
    log.push('ERROR: ' + String(e.stderr || e.message || e).slice(0, 400));
    return { ok: false, log };
  }
}

// ---- voz: responde preguntas en lenguaje natural sobre el estado ----
function answer(qRaw, s) {
  const q = (qRaw || '').toLowerCase().trim();
  const has = (...ws) => ws.some((w) => q.includes(w));
  if (!q) return 'No te escuche bien. Preguntame de nuevo: por ejemplo, que hay que hacer, o como va todo.';

  if (has('hola', 'buenas', 'buenos dias', 'buen dia', 'que tal', 'como estas')) {
    return 'Hola. Soy el centro de mando de Wenu Mapu. Preguntame que hay que hacer, como va todo, que hacen los agentes, o como va el inventario.';
  }
  if (has('que hay que hacer', 'que falta', 'que tengo que hacer', 'que hago', 'pendiente', 'que sigue')) {
    const pend = [];
    if (s.git.dirty > 0 || s.git.ahead > 0) pend.push('hay trabajo terminado todavia sin publicar');
    const esperan = s.zones.filter((z) => z.status === 'ESPERA OK');
    if (esperan.length) pend.push(`${esperan.length} departamento${esperan.length > 1 ? 's esperan' : ' espera'} tu permiso`);
    if (!pend.length) return 'No tenes nada urgente esperandote. Todo al dia. Los agentes siguen trabajando solos.';
    return 'Esto te espera: ' + pend.join('. Y ademas, ') + '. Cuando quieras, lo aprobamos.';
  }
  if (has('como va', 'como esta', 'como vamos', 'como anda', 'estado', 'todo bien')) {
    const ok = s.site.every((r) => r.ok);
    return `El sitio web esta ${ok ? 'funcionando bien' : 'con algo para revisar'}. Vas por el nivel ${s.stages.level} de ${s.stages.stages.length}, ${s.stages.currentName}. La mision total va en ${s.mission.pct} por ciento.`;
  }
  if (has('agente', 'equipo', 'quien trabaja', 'quien esta')) {
    const work = s.agents.filter((a) => a.status === 'TRABAJANDO');
    if (!work.length) return `Tu equipo tiene ${s.agents.length} agentes. Ahora ninguno esta trabajando, estan todos disponibles esperando ordenes.`;
    return `Ahora estan trabajando: ${work.map((a) => a.name).join(', ')}. El resto del equipo esta disponible.`;
  }
  if (has('inventario', 'producto', 'tienda', 'catalogo', 'cuantos')) {
    const n = s.inventory.live.count;
    return n != null ? `La tienda tiene ${n} productos publicados ahora mismo.` : 'No pude leer el inventario en este momento.';
  }
  if (has('nivel', 'etapa', 'progreso')) {
    const cur = s.stages.current;
    if (!cur) return `Vas por el nivel ${s.stages.level}.`;
    return `Estas en el nivel ${cur.n}, ${cur.name}. Llevas ${cur.done} de ${cur.total} objetivos. Faltan ${cur.total - cur.done} para subir de nivel.`;
  }
  if (has('que paso', 'novedad', 'ultimo', 'reciente', 'historial')) {
    const a = s.activity[0];
    return a ? `Lo ultimo que paso: ${a.action}.` : 'Todavia no hay actividad registrada.';
  }
  if (has('publica', 'publicar', 'subir')) {
    return (s.git.dirty > 0 || s.git.ahead > 0)
      ? 'Hay trabajo listo para publicar. Si me decis que si, lo dejamos online.'
      : 'No hay nada pendiente de publicar. Todo esta al dia.';
  }
  if (has('gracias', 'genial', 'perfecto', 'buenisimo', 'excelente')) {
    return 'De nada. Aca estoy para lo que necesites.';
  }
  return 'Puedo contarte: que hay que hacer, como va todo, que hacen los agentes, como va el inventario, o en que nivel estas. Preguntame una de esas.';
}

const server = http.createServer(async (req, res) => {
  const json = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json', 'cache-control': 'no-store' }); res.end(JSON.stringify(obj)); };

  if (req.method === 'POST' && req.url === '/api/action') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      let out;
      try {
        const p = JSON.parse(body || '{}');
        if (p.type === 'dispatch') out = dispatch(p.dept);
        else if (p.type === 'redlane') out = redlane(p);
        else if (p.type === 'log') { appendActivity(p.event || {}); out = { ok: true }; }
        else out = { ok: false, error: 'accion desconocida' };
      } catch (e) { out = { ok: false, error: String(e) }; }
      json(200, out);
    });
    return;
  }
  if (req.method === 'POST' && req.url === '/api/ask') {
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 1e5) req.destroy(); });
    req.on('end', async () => {
      try {
        const p = JSON.parse(body || '{}');
        const s = await buildState();
        json(200, { answer: answer(p.question, s) });
      } catch (e) { json(200, { answer: 'Tuve un problema para responder. Proba de nuevo.' }); }
    });
    return;
  }
  if (req.url.startsWith('/api/displog')) {
    const dept = (new URL(req.url, 'http://x').searchParams.get('dept') || '').replace(/[^a-z]/g, '');
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' });
    res.end(read(`command-center/dispatch-${dept}.log`).slice(-7000) || 'sin salida todavia');
    return;
  }
  if (req.url === '/api/state') {
    try { json(200, await buildState()); } catch (e) { json(500, { error: String(e) }); }
    return;
  }
  const html = read('command-center/index.html');
  res.writeHead(html ? 200 : 500, { 'content-type': 'text/html; charset=utf-8' });
  res.end(html || '<h1>Falta command-center/index.html</h1>');
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  ◈ WENU MAPU — CENTRO DE MANDO (interactivo)`);
  console.log(`  http://localhost:${PORT}`);
  console.log(`  runners: codex=${RUNNERS.codex ? 'ok' : 'no'}  opencode=${RUNNERS.opencode ? 'ok' : 'no'}\n`);
});
