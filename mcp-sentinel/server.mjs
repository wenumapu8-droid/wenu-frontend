#!/usr/bin/env node
/**
 * KODEX SENTINEL · MCP Server
 *
 * Puerta única al Integration OS. Cualquier agente MCP-compatible que se
 * conecte a este server puede consultar TODO el conocimiento consolidado
 * de KODEX sin tener que reconstruirlo:
 *
 *   · Los 8 archivos de autoridad en `kodex-system/`
 *   · El ledger de 47 decisiones autorales + 7 conflictos abiertos
 *   · El registry de 112 componentes clasificados
 *   · El vault (~/kodex-relevo/, ~/Obsidian/WenuAgent/, docs/kodex/)
 *   · El atlas de 40 conceptos KDX-IMG con Drive URLs
 *   · Las memorias de proyecto (~/.claude/projects/... /memory/)
 *   · El estado del Mac Mini (via SSH)
 *
 * Regla constitucional: SEARCH BEFORE CREATE. Este server implementa el
 * bloque `search_before_create` como TOOL — no se puede crear código sin
 * consultarlo primero.
 *
 * Uso:
 *   node server.mjs                        # stdio server, para Claude Code / Cursor
 *
 * Config para Claude Code (~/.claude/settings.json):
 *   {
 *     "mcpServers": {
 *       "kodex-sentinel": {
 *         "command": "node",
 *         "args": ["/Users/user1/kodex-imac-b/mcp-sentinel/server.mjs"]
 *       }
 *     }
 *   }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, basename } from 'node:path';
import yaml from 'js-yaml';

const exec = promisify(execFile);

// ── PATHS ──────────────────────────────────────────────────────────────

const REPO_ROOT = '/Users/user1/kodex-imac-b';
const KODEX_SYSTEM = join(REPO_ROOT, 'kodex-system');
const RELEVO = '/Users/user1/kodex-relevo';
const OBSIDIAN = '/Users/user1/Obsidian/WenuAgent';
const MEMORY_DIR = '/Users/user1/.claude/projects/-Users-user1/memory';
const DOCS_KODEX = join(REPO_ROOT, 'docs', 'kodex');

const AUTHORITY_FILES = [
  'README.md',
  'SENTINEL.md',
  '00_VAULT_INVENTORY.yaml',
  '01_CURRENT_STATE.yaml',
  '02_SCENE_REGISTRY.yaml',
  '03_COMPONENT_REGISTRY.yaml',
  // 04_ASSET_ROUTING.yaml pending
  '05_DECISION_LEDGER.md',
  '06_INTEGRATION_BACKLOG.yaml',
];

// ── HELPERS ────────────────────────────────────────────────────────────

async function readAuthorityFile(name) {
  const path = join(KODEX_SYSTEM, name);
  if (!existsSync(path)) return null;
  return readFile(path, 'utf8');
}

async function loadYaml(path) {
  const raw = await readFile(path, 'utf8');
  return yaml.load(raw);
}

async function grepRepo(pattern, paths = ['src/']) {
  try {
    const args = ['-rIln', '--exclude-dir=node_modules', '--exclude-dir=dist', pattern, ...paths];
    const { stdout } = await exec('grep', args, { cwd: REPO_ROOT, maxBuffer: 4 * 1024 * 1024 });
    return stdout.split('\n').filter(Boolean).slice(0, 100);
  } catch {
    return [];
  }
}

async function grepDirs(pattern, dirs, maxResults = 30) {
  const results = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    try {
      const args = ['-rIln', '--exclude-dir=node_modules', '--exclude-dir=.git', pattern, dir];
      const { stdout } = await exec('grep', args, { maxBuffer: 4 * 1024 * 1024 });
      results.push(...stdout.split('\n').filter(Boolean));
      if (results.length >= maxResults) break;
    } catch { /* grep -r returns 1 when no matches */ }
  }
  return results.slice(0, maxResults);
}

async function safeSSH(cmd, timeoutSec = 15) {
  try {
    const { stdout } = await exec('ssh', [
      '-o', `ConnectTimeout=${timeoutSec}`,
      'mini',
      cmd,
    ], { maxBuffer: 2 * 1024 * 1024, timeout: (timeoutSec + 5) * 1000 });
    return { ok: true, output: stdout };
  } catch (err) {
    return { ok: false, error: err.message?.slice(0, 500) };
  }
}

// ── TOOL IMPLEMENTATIONS ───────────────────────────────────────────────

const TOOLS = [
  {
    name: 'get_authority_files',
    description: 'Lista los archivos del Integration OS en kodex-system/ con su tamaño y última modificación. Punto de entrada obligatorio para cualquier agente KODEX.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const out = [];
      for (const name of AUTHORITY_FILES) {
        const p = join(KODEX_SYSTEM, name);
        if (!existsSync(p)) { out.push({ name, exists: false }); continue; }
        const s = await stat(p);
        out.push({
          name,
          path: p,
          size: s.size,
          modified: s.mtime.toISOString(),
          exists: true,
        });
      }
      const missing = AUTHORITY_FILES.filter(f => !existsSync(join(KODEX_SYSTEM, f)));
      return { files: out, missing, root: KODEX_SYSTEM };
    },
  },

  {
    name: 'read_authority',
    description: 'Devuelve el contenido completo de un archivo de autoridad (README, SENTINEL, o cualquiera de los 6 archivos NN_*.yaml/md).',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'ej. "05_DECISION_LEDGER.md" o "SENTINEL.md"' } },
      required: ['name'],
    },
    handler: async ({ name }) => {
      const content = await readAuthorityFile(name);
      if (content === null) return { error: `authority file not found: ${name}`, available: AUTHORITY_FILES };
      return { name, content, length: content.length };
    },
  },

  {
    name: 'search_before_create',
    description: 'REGLA CONSTITUCIONAL. Antes de crear cualquier componente KODEX, invocar esta tool con el nombre propuesto. Devuelve el bloque EXISTING IMPLEMENTATION SEARCH pre-poblado con evidencia grep de canonical/orphan/prototype existentes, decisiones relacionadas, y assets vinculados. Si REUSE POSSIBLE es YES, no se debe crear código nuevo.',
    inputSchema: {
      type: 'object',
      properties: {
        component_name: { type: 'string', description: 'ej. "KodexObserveScene" o "ObservationEye"' },
      },
      required: ['component_name'],
    },
    handler: async ({ component_name }) => {
      const pattern = `\\b${component_name}\\b`;
      const inRepo = await grepRepo(pattern, ['src/', 'ops/']);
      const inDocs = await grepDirs(pattern, [DOCS_KODEX, KODEX_SYSTEM, RELEVO], 20);

      // Try to lookup in component registry
      let registryEntry = null;
      try {
        const reg = await loadYaml(join(KODEX_SYSTEM, '03_COMPONENT_REGISTRY.yaml'));
        registryEntry = reg.components?.find(c =>
          c.id === component_name || c.file?.includes(component_name),
        );
      } catch { /* registry unreadable */ }

      const canonical = inRepo.filter(l =>
        l.includes(component_name) && !l.includes('.test.') && !l.includes('/lab/'),
      );
      const prototypes = inRepo.filter(l =>
        l.includes('/lab/') || /v[0-9]|prototype|draft/i.test(l),
      );

      const reuse_possible = canonical.length > 0 || registryEntry !== null;

      return {
        component_name,
        existing_search: {
          canonical_found: canonical.slice(0, 10),
          orphan_found: registryEntry?.status === 'CANONICAL_ORPHANED' ? [registryEntry.file] : [],
          prototype_found: prototypes.slice(0, 10),
          registry_entry: registryEntry,
          docs_references: inDocs.slice(0, 10),
          reuse_possible,
          verdict: reuse_possible
            ? 'REUSE existing implementation. Do NOT create a new component.'
            : 'No existing implementation found. New component CAN be created, but justify why reuse was not possible.',
        },
      };
    },
  },

  {
    name: 'get_open_conflicts',
    description: 'Devuelve los 7 conflictos abiertos del ledger que requieren decisión autoral de Ocín. Ningún agente debe resolverlos por su cuenta.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const ledger = await readAuthorityFile('05_DECISION_LEDGER.md');
      if (!ledger) return { error: 'ledger not found' };
      const idx = ledger.indexOf('## Conflictos abiertos');
      if (idx < 0) return { conflicts: [], note: 'no conflicts section' };
      const section = ledger.slice(idx, ledger.indexOf('\n## ', idx + 1));
      return {
        section,
        count: 7,
        rule: 'Ningún agente resuelve estos en silencio. Si el trabajo cae en uno, marcar BLOCKED y seguir con otra unidad.',
      };
    },
  },

  {
    name: 'get_decision',
    description: 'Busca una decisión específica del ledger por ID (ej. "DEC-018") o por keyword (ej. "IDLE", "palette", "gate"). Devuelve el bloque completo con cita textual y procedencia.',
    inputSchema: {
      type: 'object',
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
    handler: async ({ query }) => {
      const ledger = await readAuthorityFile('05_DECISION_LEDGER.md');
      if (!ledger) return { error: 'ledger not found' };
      const isId = /^DEC-\d{3}$/i.test(query);
      const lines = ledger.split('\n');
      const matches = [];
      for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (isId && l.match(new RegExp(`### ${query}`, 'i'))) {
          const block = lines.slice(i, i + 15).join('\n');
          matches.push({ line: i, block });
        } else if (!isId && l.toLowerCase().includes(query.toLowerCase()) && l.startsWith('### DEC-')) {
          const block = lines.slice(i, i + 12).join('\n');
          matches.push({ line: i, block });
        }
      }
      return { query, matches: matches.slice(0, 10), total: matches.length };
    },
  },

  {
    name: 'get_backlog',
    description: 'Devuelve las tareas INT-XXX del backlog. Filtrable por status (OPEN, BLOCKED, DONE, IN_PROGRESS).',
    inputSchema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['OPEN', 'BLOCKED', 'DONE', 'IN_PROGRESS', 'ALL'] },
      },
      required: [],
    },
    handler: async ({ status = 'ALL' }) => {
      const bl = await loadYaml(join(KODEX_SYSTEM, '06_INTEGRATION_BACKLOG.yaml'));
      const tasks = status === 'ALL' ? bl.tasks : bl.tasks.filter(t => t.status === status);
      return { status_filter: status, totals: bl.totals, tasks };
    },
  },

  {
    name: 'get_component',
    description: 'Lookup en el component registry. Devuelve la entrada completa de un componente KODEX: file path, status (CANONICAL_MOUNTED/ORPHANED/COUPLED/PROTOTYPE), mounted_in, coupled_via.',
    inputSchema: {
      type: 'object',
      properties: { id_or_path: { type: 'string' } },
      required: ['id_or_path'],
    },
    handler: async ({ id_or_path }) => {
      const reg = await loadYaml(join(KODEX_SYSTEM, '03_COMPONENT_REGISTRY.yaml'));
      const entry = reg.components.find(c =>
        c.id === id_or_path || c.file === id_or_path || c.file?.includes(id_or_path),
      );
      return entry ? { entry } : { error: 'not found', totals: reg.totals };
    },
  },

  {
    name: 'list_orphans',
    description: 'Devuelve los CANONICAL_ORPHANED reales — componentes canónicos sin importadores. Prioridad de integración según el backlog.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const reg = await loadYaml(join(KODEX_SYSTEM, '03_COMPONENT_REGISTRY.yaml'));
      const orphans = reg.components.filter(c => c.status === 'CANONICAL_ORPHANED');
      return {
        count: orphans.length,
        orphans: orphans.map(({ id, file, kind, notes }) => ({ id, file, kind, notes })),
      };
    },
  },

  {
    name: 'get_scene',
    description: 'Lookup en el scene registry. Devuelve corredor scenes (THRESHOLD/PROLOGUE/DESCENT/ARCHIVE/MACHINE/COSMOLOGY/RETURN) o chambers (HEART/OBSERVER/ALTAR/TEMPLE) con contract, definition, atlas coverage y palette drift.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string', description: 'nombre de escena o chamber' } },
      required: ['name'],
    },
    handler: async ({ name }) => {
      const reg = await loadYaml(join(KODEX_SYSTEM, '02_SCENE_REGISTRY.yaml'));
      const upper = name.toUpperCase();
      const corridor = reg.corridor?.find(s => s.scene === upper);
      const chamber = reg.chambers?.find(c => c.scene === upper || c.chamber_id?.includes(upper));
      return { corridor, chamber, palette_drift: reg.palette_drift?.criticos?.[upper] };
    },
  },

  {
    name: 'get_current_state',
    description: 'Devuelve el estado VIVO de una ruta KODEX. "/kodex/" o "/kodex/folio/i/" — muestra componentes montados, chasis, contract, visual status, deployed.',
    inputSchema: {
      type: 'object',
      properties: { route: { type: 'string', description: 'ej. "/kodex/" o "/kodex/chamber/heart/"' } },
      required: ['route'],
    },
    handler: async ({ route }) => {
      const state = await loadYaml(join(KODEX_SYSTEM, '01_CURRENT_STATE.yaml'));
      const buckets = ['corridor', 'chambers', 'screens', 'other'];
      for (const b of buckets) {
        const match = (state[b] || []).find(r => r.route === route);
        if (match) return { bucket: b, ...match };
      }
      return { error: 'route not in current state', totals: state.totals };
    },
  },

  {
    name: 'list_atlas_nodes',
    description: 'Devuelve los nodos KDX-IMG-* del atlas. Filtrable por escena.',
    inputSchema: {
      type: 'object',
      properties: {
        scene: { type: 'string', description: 'THRESHOLD, PROLOGUE, DESCENT, ARCHIVE, MACHINE, COSMOLOGY, RETURN, HEART, OBSERVE' },
      },
      required: [],
    },
    handler: async ({ scene }) => {
      const atlas = JSON.parse(await readFile(join(REPO_ROOT, 'src/data/kodex-atlas.json'), 'utf8'));
      const nodos = atlas.nodos || [];
      const filtered = scene
        ? nodos.filter(n => n.escenas?.some(e => e.toUpperCase() === scene.toUpperCase()))
        : nodos;
      return {
        total: nodos.length,
        scene_filter: scene || 'all',
        count: filtered.length,
        nodes: filtered.map(n => ({
          id: n.id,
          titulo: n.titulo,
          escenas: n.escenas,
          zonas: n.zonas,
          fuente_url: n.fuente_url,
        })),
      };
    },
  },

  {
    name: 'vault_search',
    description: 'Grep across the entire KODEX vault: ~/kodex-relevo/, docs/kodex/, kodex-system/, ~/Obsidian/WenuAgent/, and memory files. Para encontrar decisiones dispersas, referencias, o precedentes.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string' },
        kind: { type: 'string', enum: ['all', 'relevo', 'docs', 'obsidian', 'memory'] },
      },
      required: ['query'],
    },
    handler: async ({ query, kind = 'all' }) => {
      const dirs = [];
      if (kind === 'all' || kind === 'relevo') dirs.push(RELEVO);
      if (kind === 'all' || kind === 'docs') dirs.push(DOCS_KODEX, KODEX_SYSTEM);
      if (kind === 'all' || kind === 'obsidian') dirs.push(OBSIDIAN);
      if (kind === 'all' || kind === 'memory') dirs.push(MEMORY_DIR);
      const results = await grepDirs(query, dirs, 50);
      return { query, kind, matches: results };
    },
  },

  {
    name: 'read_memory',
    description: 'Lee una entrada del sistema de memoria persistente (~/.claude/projects/*/memory/). Las memorias son la voz de sesiones anteriores.',
    inputSchema: {
      type: 'object',
      properties: { name: { type: 'string' } },
      required: ['name'],
    },
    handler: async ({ name }) => {
      const files = await readdir(MEMORY_DIR);
      const match = files.find(f => f === name || f === name + '.md' || f.includes(name));
      if (!match) return { error: 'memory not found', available_pattern: files.filter(f => f.toLowerCase().includes(name.toLowerCase())).slice(0, 10) };
      const content = await readFile(join(MEMORY_DIR, match), 'utf8');
      return { name: match, content };
    },
  },

  {
    name: 'list_memories',
    description: 'Lista todas las memorias KODEX-relevantes con su fecha y una línea de resumen (primera después del frontmatter).',
    inputSchema: {
      type: 'object',
      properties: { pattern: { type: 'string', description: 'ej. "kodex" o "canon" (default: kodex)' } },
      required: [],
    },
    handler: async ({ pattern = 'kodex' } = {}) => {
      const files = await readdir(MEMORY_DIR);
      const filtered = files.filter(f => f.toLowerCase().includes(pattern.toLowerCase()) && f.endsWith('.md'));
      const out = [];
      for (const f of filtered.slice(0, 40)) {
        try {
          const c = await readFile(join(MEMORY_DIR, f), 'utf8');
          const bodyStart = c.indexOf('---\n', 4) + 4;
          const firstLine = c.slice(bodyStart).split('\n').find(l => l.trim() && !l.startsWith('#'))?.slice(0, 160);
          const s = await stat(join(MEMORY_DIR, f));
          out.push({ name: f, modified: s.mtime.toISOString().slice(0, 10), summary: firstLine });
        } catch { /* skip */ }
      }
      return { pattern, count: out.length, memories: out };
    },
  },

  {
    name: 'mini_status',
    description: 'SSH al Mac Mini y devuelve estado: current branch, últimos commits, working tree status, y si el Assembly OS pipeline (ops/factory/) está sincronizado. Usar para coordinar antes de tocar archivos compartidos.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const result = await safeSSH(
        'cd ~/wenu-frontend && echo BRANCH: && git branch --show-current && echo COMMITS: && git log --oneline -5 && echo STATUS: && git status --short | head -20',
        20,
      );
      return result;
    },
  },

  {
    name: 'search_drive_urls',
    description: 'Devuelve URLs de Google Drive extraídas del ATLAS (KDX-IMG-*). Filtrable por ID de nodo.',
    inputSchema: {
      type: 'object',
      properties: { kdx_img: { type: 'string', description: 'ej. "KDX-IMG-001" o vacío para todos' } },
      required: [],
    },
    handler: async ({ kdx_img } = {}) => {
      const files = [
        join(RELEVO, 'ATLAS-07A-inventario-nodos-conexiones.md'),
        join(RELEVO, 'ATLAS-07B-lotes-09-11-12.md'),
      ];
      const results = [];
      for (const f of files) {
        if (!existsSync(f)) continue;
        const c = await readFile(f, 'utf8');
        const lines = c.split('\n');
        let lastKdx = '';
        for (const line of lines) {
          const idMatch = line.match(/KDX-IMG-\d{3}/);
          if (idMatch) lastKdx = idMatch[0];
          const urlMatch = line.match(/https:\/\/drive\.google\.com\/[^\s|"']+/);
          if (urlMatch) {
            const entry = { kdx_img: lastKdx, url: urlMatch[0], source: basename(f) };
            if (!kdx_img || entry.kdx_img === kdx_img) results.push(entry);
          }
        }
      }
      return { count: results.length, filter: kdx_img || 'all', urls: results.slice(0, 60) };
    },
  },

  {
    name: 'kodex_directories',
    description: 'Lista los 18 directorios ~/kodex-* en el disco local con tipo, tamaño y modificación. Ayuda a orientar entre worktrees, backups, mirrors.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      try {
        const inv = await loadYaml(join(KODEX_SYSTEM, '00_VAULT_INVENTORY.yaml'));
        return { source: '00_VAULT_INVENTORY.yaml', directories: inv.kodex_directories || [] };
      } catch (e) {
        return { error: e.message };
      }
    },
  },

  {
    name: 'get_visual_gate',
    description: 'Devuelve el estado del gate de fidelidad visual (7/7 escenas). Si alguna escena no pasa, dice cuál y por qué.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      try {
        const { stdout } = await exec('node', ['scripts/kodex-visual-fidelity-gate.mjs'], {
          cwd: REPO_ROOT,
          maxBuffer: 4 * 1024 * 1024,
          timeout: 30000,
        });
        return { ok: true, output: stdout };
      } catch (err) {
        return { ok: false, error: err.message?.slice(0, 800), stdout: err.stdout?.slice(0, 2000) };
      }
    },
  },

  {
    name: 'sentinel_greeting',
    description: 'Devuelve el saludo del SENTINEL — cortesía que hace explícita la existencia del guardián a cualquier agente nuevo. Invocar primero al conectarse.',
    inputSchema: { type: 'object', properties: {}, required: [] },
    handler: async () => {
      const sentinel = await readAuthorityFile('SENTINEL.md');
      const first500 = sentinel?.slice(0, 500) ?? '';
      return {
        greeting: 'Soy el SENTINEL del Integration OS de KODEX. Antes de escribir código, invocá `get_authority_files` + `search_before_create`. Nada se borra, todo se recicla.',
        sentinel_head: first500,
        constitutional_rules: [
          'SEARCH BEFORE CREATE — no escribir componentes nuevos sin verificar el registry',
          'NADA SE BORRA — si dos versiones divergen, síntesis, no elección',
          'DONE nueva — mounted + reachable + interactive + correct asset + correct copy + responsive + tested + screenshot verified + deployed + visually accepted',
          '7 CONFLICTOS solo Ocín — no resolver por cuenta propia',
        ],
      };
    },
  },
];

// ── SERVER SETUP ───────────────────────────────────────────────────────

const server = new Server(
  { name: 'kodex-sentinel', version: '0.1.0' },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const tool = TOOLS.find(t => t.name === name);
  if (!tool) throw new Error(`Unknown tool: ${name}`);
  try {
    const result = await tool.handler(args ?? {});
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
  } catch (err) {
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: err.message, tool: name }, null, 2) }],
      isError: true,
    };
  }
});

// ── STARTUP ────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);

// Log to stderr so it doesn't pollute the MCP stdio channel
process.stderr.write(`[kodex-sentinel] ${TOOLS.length} tools listos · leyendo ${AUTHORITY_FILES.length} authority files\n`);
