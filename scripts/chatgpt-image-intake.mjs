import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const DEFAULT_DIRS = [
  path.join(process.env.HOME || '', 'Downloads'),
  path.join(ROOT, 'tmp/chatgpt-image-intake'),
  '/Users/user1/Obsidian/WenuAgent/brand/07-marketing-collateral/chatgpt-intake',
];

const EXPECTED = [
  'hero-ear-stack-ritual',
  'shop-ritual-flatlay',
  'hero-obsidian-geometry',
  'piercing-editorial',
  'hangers-ear-weights-editorial',
  'septum-obsidian-macro',
  'amulets-volcanic-flatlay',
  'ear-cuffs-serpentine-silver',
  'chaway-ceremonial-pair',
  'obsidian-textile-texture',
  'wenu-portal-eclipse-mark',
  'ancestral-pattern-tile',
  'symbol-divider',
  'about-origin-ritual-hands',
  'ritual-space-cosmos',
  'contact-appointment-altar',
  'newsletter-cosmic-landscape',
  'ritual-space-tierra',
  'ritual-space-cuerpo',
  'ritual-space-luna-ciclos',
  'ritual-space-altar',
  'material-icons-metal-trio',
  'product-titanium-helix-ring',
  'product-silver-septum-clicker',
  'product-silver-ear-weight',
  'product-gold-amulet',
  'product-ear-cuff-obsidian',
  'social-ear-stack-square',
  'social-lunar-nape-story',
  'tapestry-cosmic-serpent',
  'tapestry-four-directions',
  'tapestry-ritual-guardian',
  'tapestry-chaway-portal',
];

const IMAGE_EXT = /\.(png|jpe?g|webp|avif)$/i;

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir, depth = 0) {
  if (!(await exists(dir)) || depth > 2) return;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full, depth + 1);
    else if (IMAGE_EXT.test(entry.name)) yield full;
  }
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokenSet(value) {
  return new Set(normalize(value).split(/\s+/).filter(token => token.length >= 3));
}

function score(expected, file) {
  const expectedTokens = tokenSet(expected);
  const fileTokens = tokenSet(path.basename(file));
  let total = 0;
  for (const token of expectedTokens) {
    if (fileTokens.has(token)) total += token.length > 5 ? 2 : 1;
  }
  return total;
}

const candidates = [];
for (const dir of DEFAULT_DIRS) {
  for await (const file of walk(dir)) {
    const st = await stat(file);
    candidates.push({
      file,
      sizeKb: Math.round(st.size / 1024),
      mtime: st.mtime,
    });
  }
}

console.log('# ChatGPT Image Intake');
console.log('');
console.log(`Scanned image files: ${candidates.length}`);
console.log('');

for (const expected of EXPECTED) {
  const matches = candidates
    .map(candidate => ({ ...candidate, score: score(expected, candidate.file) }))
    .filter(candidate => candidate.score >= 3)
    .sort((a, b) => b.score - a.score || b.mtime - a.mtime)
    .slice(0, 3);

  console.log(`## ${expected}`);
  if (matches.length === 0) {
    console.log('- status: missing or not renamed yet');
  } else {
    for (const match of matches) {
      console.log(`- candidate: ${match.file} (${match.sizeKb} KB, score ${match.score})`);
    }
  }
  console.log('');
}

console.log('Next: rename approved files to the expected kebab-case names, then copy into public/img by the manifest target folder.');
