import fs from 'node:fs';
import path from 'node:path';
import {
  CORE_SCENE_ORDER,
  KODEX_SCENES,
  KODEX_ORBITALS,
  validateSceneRegistry,
} from '../src/lib/kodex/scene-registry.js';
import { EXPERIENCE_POLICY } from '../src/lib/kodex/experience-engine.js';
import { validateEvidenceRegistry } from '../src/lib/kodex/evidence-registry.js';
import { KODEX_V0_CHECKPOINTS, validateV0Manifest } from '../src/lib/kodex/v0-vertical-slice.js';

const root = process.cwd();
const errors = [];
const notes = [];

const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const report = validateSceneRegistry();
if (!report.valid) errors.push(...report.errors.map((e) => `registry: ${e}`));

const evidenceReport = validateEvidenceRegistry();
if (!evidenceReport.valid) errors.push(...evidenceReport.errors.map((e) => `evidence: ${e}`));

const v0Report = validateV0Manifest();
if (!v0Report.valid) errors.push(...v0Report.errors.map((e) => `v0: ${e}`));

const routeFileForHref = (href) => {
  if (href === '/kodex/') return 'src/pages/kodex/index.astro';
  const folio = href.match(/^\/kodex\/folio\/(i{1,3}|iv|v|vi)\/$/i)?.[1];
  if (folio) return 'src/pages/kodex/folio/[folio].astro';
  if (href.startsWith('/kodex/lab/') && href.endsWith('/')) {
    const slug = href.slice('/kodex/lab/'.length, -1);
    const directoryIndex = `src/pages/kodex/lab/${slug}/index.astro`;
    const flat = `src/pages/kodex/lab/${slug}.astro`;
    if (exists(directoryIndex)) return directoryIndex;
    if (exists(flat)) return flat;
    return directoryIndex;
  }
  return null;
};

for (const key of CORE_SCENE_ORDER) {
  const scene = KODEX_SCENES[key];
  const routeFile = routeFileForHref(scene.href);
  if (!routeFile || !exists(routeFile)) errors.push(`${scene.id}: route missing for ${scene.href}`);
  if (!scene.renderer?.reduced) errors.push(`${scene.id}: reduced-motion contract missing`);
  if (!scene.renderer?.fallback) errors.push(`${scene.id}: fallback contract missing`);
  if (!Array.isArray(scene.memoryEvents) || scene.memoryEvents.length === 0) {
    errors.push(`${scene.id}: memory event contract missing`);
  }
}

for (const node of Object.values(KODEX_ORBITALS)) {
  if (!node.href) continue;
  const routeFile = routeFileForHref(node.href);
  if (!routeFile || !exists(routeFile)) errors.push(`${node.id}: declared href missing (${node.href})`);
  else notes.push(`${node.id}: ${node.href} -> ${routeFile}`);
}

for (const checkpoint of KODEX_V0_CHECKPOINTS) {
  const routeFile = routeFileForHref(checkpoint.href);
  if (!routeFile || !exists(routeFile)) errors.push(`${checkpoint.id}: V0 route missing for ${checkpoint.href}`);
}

if (!exists('src/pages/kodex/lab/v0-readiness.astro')) errors.push('V0: readiness control room missing');

if (EXPERIENCE_POLICY.autoNavigate !== false) errors.push('experience policy must never auto-navigate');
for (const forbidden of ['time-on-site', 'compulsion', 'activity-score', 'spiritual-score']) {
  if (!EXPERIENCE_POLICY.prohibitedObjectives.includes(forbidden)) {
    errors.push(`experience policy missing prohibited objective: ${forbidden}`);
  }
}

const memoryPath = 'src/kodex/return/memory.js';
if (!exists(memoryPath)) errors.push(`${memoryPath}: missing`);
else {
  const source = read(memoryPath);
  const forbiddenPatterns = [
    [/Date\.now\s*\(/, 'clock write'],
    [/\bmemory\s*:/, 'engagement-derived memory field'],
    [/j\.signal\s*\+=/, 'activity signal counter'],
    [/views\.length\s*\+\s*effects\.length/, 'activity aggregation'],
  ];
  for (const [pattern, label] of forbiddenPatterns) {
    if (pattern.test(source)) errors.push(`${memoryPath}: forbidden ${label}`);
  }
}

const dwellPath = 'src/components/kodex/KodexRecuerda.astro';
if (!exists(dwellPath)) errors.push(`${dwellPath}: missing`);
else {
  const source = read(dwellPath);
  if (!source.includes('kdx:scene-dwell')) errors.push(`${dwellPath}: semantic dwell event missing`);
  if (/record\(\{\s*type:\s*["']signal["']/.test(source)) {
    errors.push(`${dwellPath}: dwell must not persist an activity signal`);
  }
}

const heart = KODEX_ORBITALS.heart;
if (heart?.href) {
  const heartRoute = routeFileForHref(heart.href);
  const heartAsset = 'public/kodex/assets/heart/heart-chamber-rich-target.webp';
  if (!heartRoute || !exists(heartRoute)) errors.push('HEART: lab route missing');
  if (!exists(heartAsset)) errors.push('HEART: canonical plate missing');
  if (heartRoute && exists(heartRoute)) {
    const source = read(heartRoute);
    if (!source.includes('NOT BIOMETRIC')) errors.push('HEART: biometric disclaimer missing');
    if (!source.includes('prefers-reduced-motion')) errors.push('HEART: reduced-motion handling missing');
  }
}

const evidenceLab = 'src/pages/kodex/lab/archive-evidence.astro';
if (!exists(evidenceLab)) errors.push('ARCHIVE: evidence lab missing');
else {
  const source = read(evidenceLab);
  if (!source.includes('ARTWORK WITHHELD')) errors.push('ARCHIVE: creator-review gate must remain visible');
  if (!source.includes('LIMITATIONS + SOURCES')) errors.push('ARCHIVE: source limitation UI missing');
}

const authorialFiles = [
  'src/lib/kodex/ocin/authorial-corpus-v0.ts',
  'src/lib/kodex/ocin/authorial-projects-v0.ts',
  'src/pages/kodex/lab/ocin-authorial/index.astro',
  'src/pages/kodex/lab/ocin-authorial/projects/mushroom-elixir/index.astro',
];
for (const rel of authorialFiles) {
  if (!exists(rel)) errors.push(`OCIN: missing reconciled file ${rel}`);
  else if (/drive\.google\.com|docs\.google\.com/.test(read(rel))) {
    errors.push(`OCIN: private/raw Drive URL must not render from ${rel}`);
  }
}

const output = {
  valid: errors.length === 0,
  coreScenes: report.coreCount,
  orbitals: report.orbitalCount,
  implementedOrbitalRoutes: Object.values(KODEX_ORBITALS).filter((o) => o.href).length,
  evidenceSources: evidenceReport.sources,
  evidenceRelations: evidenceReport.relations,
  v0Checkpoints: KODEX_V0_CHECKPOINTS.length,
  errors,
  notes,
};

console.log(JSON.stringify(output, null, 2));
if (errors.length) process.exitCode = 1;
