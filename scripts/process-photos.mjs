#!/usr/bin/env node
/**
 * process-photos.mjs
 *
 * Takes a folder of raw photos (named <SKU>-<view>.jpg) and produces the
 * canonical structure in brand/04-photography/product-macro/final/<SKU>/
 * with responsive variants (thumb 400px / medium 800px / full 1600px) in
 * both WebP and AVIF, plus a METADATA.md per SKU.
 *
 * EXIF is stripped (no GPS, no camera info). IPTC title/description/copyright
 * is preserved/applied based on NocoDB record.
 *
 * Required env:
 *   NOCODB_TOKEN — used to fetch product metadata for naming and alt text
 *
 * Usage:
 *   node scripts/process-photos.mjs --batch ~/Downloads/wenu-photos-batch-YYYY-MM-DD
 *   node scripts/process-photos.mjs --batch <dir> --dry-run
 *   node scripts/process-photos.mjs --sku WM-HAN-001 --file path/to/foto.jpg
 *   node scripts/process-photos.mjs --help
 *
 * Naming convention expected in batch dir:
 *   WM-HAN-001-front.jpg     → <sku>-front-*.webp/.avif
 *   WM-HAN-001-detail.jpg    → <sku>-detail-*.webp/.avif
 *   WM-HAN-001-back.jpg      → <sku>-back-*.webp/.avif
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(fs.readFileSync(import.meta.url.replace('file://',''), 'utf8').split('\n').slice(1, 26).join('\n'));
  process.exit(0);
}

const flag = (k, def) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i+1] : def;
};
const has = k => args.includes(k);

const BATCH = flag('--batch');
const SKU_FLAG = flag('--sku');
const FILE_FLAG = flag('--file');
const DRY = has('--dry-run');
const TOKEN = process.env.NOCODB_TOKEN;
const NOCODB_URL = process.env.NOCODB_URL || 'http://localhost:8080';
const TABLE = process.env.NOCODB_TABLE || 'm5s3jnm72tzhk9g';

if (!TOKEN && !has('--no-metadata')) {
  console.error('WARN: NOCODB_TOKEN not set — proceeding without product metadata enrichment.');
  console.error('Pass --no-metadata to silence this warning.');
}

const FINAL = path.join(os.homedir(), 'Obsidian/WenuAgent/brand/04-photography/product-macro/final');
fs.mkdirSync(FINAL, {recursive: true});

const SIZES = [
  { name: 'thumb',  w: 400 },
  { name: 'medium', w: 800 },
  { name: 'full',   w: 1600 },
];

const slugify = s => (s||'').toLowerCase()
  .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
  .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70);

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('ERROR: sharp not installed. Run `npm install sharp` in wenu-frontend.');
  process.exit(2);
}

const records = {};
if (TOKEN) {
  console.log('[process-photos] fetching NocoDB metadata…');
  try {
    const r = await fetch(`${NOCODB_URL}/api/v2/tables/${TABLE}/records?limit=200`, {
      headers: {'xc-token': TOKEN}
    });
    if (r.ok) {
      const d = await r.json();
      for (const rec of (d.list||[])) if (rec.SKU) records[rec.SKU] = rec;
      console.log(`  loaded ${Object.keys(records).length} products`);
    }
  } catch(e) {
    console.error('  warn: could not fetch NocoDB:', e.message);
  }
}

async function processOne(src, sku, view='front') {
  const rec = records[sku];
  const name = rec?.Title || rec?.['Nombre interno'] || sku;
  const slug = slugify(name);
  const skuDir = path.join(FINAL, sku);
  const baseName = `${sku.toLowerCase()}-${slug}-${view}`;

  if (DRY) {
    console.log(`  DRY ${sku} ${view} → ${path.relative(os.homedir(), skuDir)}/${baseName}-{thumb,medium,full}.{webp,avif}`);
    return;
  }

  fs.mkdirSync(skuDir, {recursive: true});

  const meta = await sharp(src).metadata();

  for (const sz of SIZES) {
    if (meta.width && meta.width < sz.w * 0.9) continue;
    const pipeline = sharp(src)
      .resize({ width: sz.w, height: sz.w, fit: 'inside', withoutEnlargement: true })
      .withMetadata({}); // strip EXIF

    await pipeline.clone().webp({ quality: 85, effort: 4 })
      .toFile(path.join(skuDir, `${baseName}-${sz.name}.webp`));
    await pipeline.clone().avif({ quality: 55, effort: 4 })
      .toFile(path.join(skuDir, `${baseName}-${sz.name}.avif`));
  }

  // METADATA.md (only if doesn't exist or this is the front)
  const mdPath = path.join(skuDir, 'METADATA.md');
  if (view === 'front' || !fs.existsSync(mdPath)) {
    const mats = Array.isArray(rec?.['Material']) ? rec['Material'].join(' & ') : (rec?.['Material'] || '');
    const altText = `Wenu Mapu ${name} — ${rec?.['Categoría']||'body jewelry'} ${mats?'in '+mats.toLowerCase():''}. Hand-curated ancestral piece.`;
    const md = [
      '---',
      `sku: ${sku}`,
      `title: ${rec?.Title||name}`,
      `slug: ${slug}`,
      `fuente: NocoDB id=${rec?.Id||'?'}`,
      `fecha_proceso: ${new Date().toISOString().slice(0,10)}`,
      '---',
      '',
      `# Foto · ${sku}`,
      '',
      '## Naming canónico',
      '',
      '```',
      `${baseName}-thumb.webp   (400px)`,
      `${baseName}-medium.webp  (800px)`,
      `${baseName}-full.webp    (1600px)`,
      `${baseName}-thumb.avif`,
      `${baseName}-medium.avif`,
      `${baseName}-full.avif`,
      '```',
      '',
      '## Alt text',
      '',
      `> ${altText}`,
      '',
      '## Fuente',
      '',
      `- NocoDB Id: ${rec?.Id||'?'}`,
      `- Original: ${meta.width}x${meta.height} ${meta.format} (${(fs.statSync(src).size/1024).toFixed(0)}KB)`,
      `- EXIF stripped: sí (privacidad — GPS removido)`,
    ].join('\n');
    fs.writeFileSync(mdPath, md);
  }

  console.log(`  ✓ ${sku} ${view}`);
}

// Process single SKU+file
if (SKU_FLAG && FILE_FLAG) {
  await processOne(FILE_FLAG, SKU_FLAG.toUpperCase(), 'front');
  process.exit(0);
}

// Process batch dir
if (BATCH) {
  if (!fs.existsSync(BATCH)) {
    console.error(`ERROR: batch dir not found: ${BATCH}`);
    process.exit(3);
  }
  const files = fs.readdirSync(BATCH).filter(f => /\.(jpg|jpeg|png|heic|tiff?)$/i.test(f));
  console.log(`[process-photos] batch ${BATCH} (${files.length} files)`);

  for (const f of files) {
    // Match WM-XXX-NNN-view.ext
    const m = f.match(/^(WM-[A-Z]+-\d+)-(front|back|detail|angle|lifestyle|macro)\./i);
    if (!m) {
      // Try simpler WM-XXX-NNN.ext (assume front)
      const m2 = f.match(/^(WM-[A-Z]+-\d+)\./i);
      if (!m2) { console.log(`  SKIP unmatched: ${f}`); continue; }
      await processOne(path.join(BATCH, f), m2[1].toUpperCase(), 'front');
    } else {
      await processOne(path.join(BATCH, f), m[1].toUpperCase(), m[2].toLowerCase());
    }
  }
  console.log('[process-photos] done');
  process.exit(0);
}

console.error('Usage: process-photos.mjs --batch <dir>  OR  --sku <SKU> --file <path>');
console.error('       --help for full usage');
process.exit(1);
