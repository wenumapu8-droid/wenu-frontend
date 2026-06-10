#!/usr/bin/env node
// apply-photos-to-wc.mjs
// Sube fotos a WP Media + asigna como imagen featured a 6 drafts WC.
// Dry-run por default. Aplica solo con --apply explícito.
//
// Uso:
//   node scripts/apply-photos-to-wc.mjs            # dry-run
//   node scripts/apply-photos-to-wc.mjs --apply    # ejecuta de verdad
//
// Log estructurado: ~/wenu-frontend/logs/apply-photos-YYYYMMDD-HHMMSS.json

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';

// --- Config ---
const ENV_PATH = '/Users/user1/wenu-frontend/.env';
const LOG_DIR  = '/Users/user1/wenu-frontend/logs';
const TMP_DIR  = '/tmp/wenu-photo-pipeline';
const WC_BASE  = 'https://www.wenumapuonline.com';
const MAX_LONG_SIDE = 2000;
const JPG_QUALITY   = 85;

const APPLY = process.argv.includes('--apply');
const MODE  = APPLY ? 'APPLY' : 'DRY-RUN';

// --- Loadenv ---
function loadEnv(p) {
  const out = {};
  const txt = fs.readFileSync(p, 'utf8');
  for (const line of txt.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1,-1);
    out[m[1]] = v;
  }
  return out;
}
const env = loadEnv(ENV_PATH);
const WC_KEY = env.WC_CONSUMER_KEY;
const WC_SEC = env.WC_CONSUMER_SECRET;
const WP_USR = env.WP_USER;
const WP_PWD = env.WP_APP_PWD;
if (!WC_KEY || !WC_SEC || !WP_USR || !WP_PWD) {
  console.error('Faltan WC_CONSUMER_KEY / WC_CONSUMER_SECRET / WP_USER / WP_APP_PWD en', ENV_PATH);
  process.exit(2);
}
const WC_AUTH = 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SEC}`).toString('base64');
const WP_AUTH = 'Basic ' + Buffer.from(`${WP_USR}:${WP_PWD}`).toString('base64');

// --- Las 6 piezas ---
const JOBS = [
  // Bucket A: foto descargada desde NocoDB
  { wc_id: 2086, sku: 'WM-RNG-001', source_kind: 'nocodb',
    source_path: '/tmp/wenu-noco-macros/WM-RNG-001_macro.jpg',
    alt: 'Ritual Ring Vacamuerta Nº3 — Sterling Silver & Atacama Meteorite — macro shot',
    target_slug: 'WM-RNG-001-hero' },
  { wc_id: 2085, sku: 'WM-RNG-002', source_kind: 'nocodb',
    source_path: '/tmp/wenu-noco-macros/WM-RNG-002_macro.jpg',
    alt: 'Ritual Ring No. 19 — Sterling Silver + Atacama Meteorite — macro shot',
    target_slug: 'WM-RNG-002-hero' },
  { wc_id: 2077, sku: 'WM-PRC-002', source_kind: 'nocodb',
    source_path: '/tmp/wenu-noco-macros/WM-PRC-002_macro.jpg',
    alt: 'Mystic Bee Titanium Piercing 1.2x8mm Gold — macro shot',
    target_slug: 'WM-PRC-002-hero' },
  // Bucket B: foto desde LaCie
  { wc_id: 2049, sku: 'WM-HAN-001', source_kind: 'lacie',
    source_path: '/Volumes/LaCie/Wenu mapu/WenuMapu/📸 _INVENTARIO_FOTOS/HAN/WM-HAN-001_back.jpg',
    alt: 'Handmade Hanger 10mm — Witral Vilu — bronze snake form, back view',
    target_slug: 'WM-HAN-001-hero' },
  { wc_id: 2046, sku: 'WM-LAB-002', source_kind: 'lacie',
    source_path: '/Volumes/LaCie/Wenu mapu/WenuMapu/📸 _INVENTARIO_FOTOS/LAB/WM-LAB-002_angle.jpg',
    alt: 'Handmade Labret 10mm — steel — angle view',
    target_slug: 'WM-LAB-002-hero' },
  { wc_id: 2036, sku: 'WM-PLG-001', source_kind: 'lacie',
    source_path: '/Volumes/LaCie/Wenu mapu/WenuMapu/📸 _INVENTARIO_FOTOS/PLG/WM-PLG-001_back.jpg',
    alt: 'Handmade Plug 10mm — natural stone — back view',
    target_slug: 'WM-PLG-001-hero' },
];

// --- Helpers ---
function ts() {
  const d = new Date();
  const p = (n) => String(n).padStart(2,'0');
  return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}
function ensureDir(d){ fs.mkdirSync(d,{recursive:true}); }

function optimizeImage(src, destSlug) {
  // sips: resize a max 2000 lado largo + setProperty formatOptions 85 + recompress JPG.
  // Strip EXIF: sips no lo hace 100%, pero re-encode + setProperty profile sRGB reduce. Buen baseline.
  ensureDir(TMP_DIR);
  const dest = path.join(TMP_DIR, `${destSlug}.jpg`);
  // Copia el source primero (sips edita in-place o con --out)
  execFileSync('sips', [
    '-Z', String(MAX_LONG_SIDE),
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', String(JPG_QUALITY),
    src, '--out', dest,
  ], { stdio: ['ignore','ignore','pipe'] });
  return dest;
}

function getDims(p){
  const out = execFileSync('sips', ['-g','pixelWidth','-g','pixelHeight', p]).toString();
  const w = +(out.match(/pixelWidth:\s*(\d+)/)?.[1] || 0);
  const h = +(out.match(/pixelHeight:\s*(\d+)/)?.[1] || 0);
  return { w, h };
}

async function wcGet(productId) {
  const r = await fetch(`${WC_BASE}/wp-json/wc/v3/products/${productId}`, {
    headers: { Authorization: WC_AUTH },
  });
  if (!r.ok) throw new Error(`WC GET ${productId} ${r.status}`);
  return r.json();
}

async function wpUploadMedia(filePath, slug, alt) {
  const buf = fs.readFileSync(filePath);
  const fname = `${slug}.jpg`;
  const r = await fetch(`${WC_BASE}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: WP_AUTH,
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `attachment; filename="${fname}"`,
    },
    body: buf,
  });
  if (!r.ok) throw new Error(`WP media upload ${r.status} ${await r.text()}`);
  const m = await r.json();
  // setear alt_text con PATCH
  await fetch(`${WC_BASE}/wp-json/wp/v2/media/${m.id}`, {
    method: 'POST',
    headers: { Authorization: WP_AUTH, 'Content-Type':'application/json' },
    body: JSON.stringify({ alt_text: alt, title: alt }),
  });
  return m;
}

async function wcAssignImage(productId, mediaId) {
  const r = await fetch(`${WC_BASE}/wp-json/wc/v3/products/${productId}`, {
    method: 'PUT',
    headers: { Authorization: WC_AUTH, 'Content-Type': 'application/json' },
    body: JSON.stringify({ images: [{ id: mediaId }] }),
  });
  if (!r.ok) throw new Error(`WC PUT ${productId} ${r.status} ${await r.text()}`);
  return r.json();
}

// --- Run ---
(async () => {
  ensureDir(LOG_DIR);
  ensureDir(TMP_DIR);
  const stamp = ts();
  const log = { started_at: new Date().toISOString(), mode: MODE, jobs: [] };
  console.log(`\n=== apply-photos-to-wc [${MODE}] ===\n`);

  for (const job of JOBS) {
    const entry = { ...job, steps: [], status: 'pending', errors: [] };
    try {
      // 1. verificar source
      if (!fs.existsSync(job.source_path)) throw new Error(`source missing: ${job.source_path}`);
      const srcSize = fs.statSync(job.source_path).size;
      const srcDims = getDims(job.source_path);
      entry.original_size  = srcSize;
      entry.original_dims  = srcDims;

      // 2. GET producto WC actual (snapshot rollback)
      const before = await wcGet(job.wc_id);
      entry.before_images = (before.images || []).map(i => ({ id: i.id, src: i.src }));
      entry.before_sku    = before.sku;
      entry.before_status = before.status;
      entry.before_name   = before.name;
      if (before.images && before.images.length > 0) {
        entry.errors.push(`WARN: producto ya tiene ${before.images.length} imagen(es). Sería sobrescrito.`);
      }
      if (!before.sku) {
        entry.errors.push(`WARN: producto WC ${job.wc_id} tiene SKU vacío (esperado ${job.sku}).`);
      } else if (before.sku !== job.sku) {
        entry.errors.push(`WARN: SKU mismatch WC=${before.sku} esperado=${job.sku}.`);
      }

      // 3. optimizar imagen
      const optimized = optimizeImage(job.source_path, job.target_slug);
      const optSize   = fs.statSync(optimized).size;
      const optDims   = getDims(optimized);
      entry.optimized_path = optimized;
      entry.optimized_size = optSize;
      entry.optimized_dims = optDims;
      entry.steps.push(`optimized: ${srcDims.w}x${srcDims.h} ${(srcSize/1024).toFixed(0)}KB -> ${optDims.w}x${optDims.h} ${(optSize/1024).toFixed(0)}KB`);

      // 4. upload + assign
      if (APPLY) {
        const media = await wpUploadMedia(optimized, job.target_slug, job.alt);
        entry.media_id  = media.id;
        entry.media_url = media.source_url;
        entry.steps.push(`uploaded media id=${media.id} url=${media.source_url}`);
        const after = await wcAssignImage(job.wc_id, media.id);
        entry.after_images = (after.images||[]).map(i=>({id:i.id,src:i.src}));
        entry.steps.push(`assigned to WC ${job.wc_id}`);
        entry.status = 'applied';
      } else {
        entry.steps.push(`[dry-run] POST ${WC_BASE}/wp-json/wp/v2/media (filename=${job.target_slug}.jpg, ${(optSize/1024).toFixed(0)}KB JPG)`);
        entry.steps.push(`[dry-run] POST ${WC_BASE}/wp-json/wp/v2/media/<new_id> (alt_text="${job.alt}")`);
        entry.steps.push(`[dry-run] PUT  ${WC_BASE}/wp-json/wc/v3/products/${job.wc_id} {images:[{id:<new_id>}]}`);
        entry.status = 'planned';
      }
      console.log(`  [${entry.status.toUpperCase()}] WC ${job.wc_id} ${job.sku}`);
      entry.steps.forEach(s => console.log(`     - ${s}`));
      entry.errors.forEach(e => console.log(`     ! ${e}`));
    } catch (e) {
      entry.status = 'error';
      entry.errors.push(String(e.message || e));
      console.log(`  [ERROR] WC ${job.wc_id} ${job.sku}: ${e.message}`);
    }
    log.jobs.push(entry);
  }

  log.finished_at = new Date().toISOString();
  const logPath = path.join(LOG_DIR, `apply-photos-${stamp}.json`);
  fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
  console.log(`\nLog: ${logPath}`);
  console.log(`Mode: ${MODE}. ${APPLY ? '' : 'Usa --apply para ejecutar.'}\n`);
})().catch(e => { console.error('FATAL', e); process.exit(1); });
