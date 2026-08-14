import fs from 'node:fs';
import path from 'node:path';
import {
  CORE_SCENE_ORDER,
  KODEX_SCENES,
  KODEX_ORBITALS,
  validateSceneRegistry,
} from '../src/lib/kodex/scene-registry.js';
import { EXPERIENCE_POLICY } from '../src/lib/kodex/experience-engine.js';

const root = process.cwd();
const errors = [];
const notes = [];

const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const report = validateSceneRegistry();
if (!report.valid) errors.push(...report.errors.map((e) => `registry: ${e}`));

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

const output = {
  valid: errors.length === 0,
  coreScenes: report.coreCount,
  orbitals: report.orbitalCount,
  implementedOrbitalRoutes: Object.values(KODEX_ORBITALS).filter((o) => o.href).length,
  errors,
  notes,
};

console.log(JSON.stringify(output, null, 2));
if (errors.length) process.exitCode = 1;
