#!/usr/bin/env node
/**
 * photo-fill-missing.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Llena la foto que falta en los productos WC que están en draft SIN imagen.
 * En vez de escanear todo NocoDB (que se cuelga en offset 100), fetcha cada
 * SKU INDIVIDUALMENTE — más rápido + más resiliente a NocoDB flaky.
 *
 * Naming SEO + metadata completo:
 *   filename:    <product-slug>-<sku>-macro.<ext>
 *   alt_text:    "Wenu Mapu — <product name>"
 *   title:       "<product name> — <material>"
 *   caption:     "SKU <sku> · <material> · Línea <linea>"
 *   description: Descripción ritual o interna (600 char máx)
 *
 * Modo: --apply para escribir. Sin flag = dry-run.
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const CONFIRM = args.includes('--confirm');
const VERBOSE = args.includes('--verbose');
if (APPLY && !CONFIRM) { console.error('--apply requires --confirm.'); process.exit(1); }

const env = {};
const envTxt = fs.readFileSync(path.join(os.homedir(),'wenu-agent-hub/.env'),'utf8');
for (const line of envTxt.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) env[m[1]] = m[2].trim();
}
const { WOOCOMMERCE_URL, WOOCOMMERCE_KEY, WOOCOMMERCE_SECRET, NOCODB_URL, NOCODB_TABLE, NOCODB_TOKEN, WP_USER, WP_APP_PASSWORD } = env;

const wcAuth = 'Basic ' + Buffer.from(WOOCOMMERCE_KEY + ':' + WOOCOMMERCE_SECRET).toString('base64');
const wpAuth = 'Basic ' + Buffer.from(WP_USER + ':' + WP_APP_PASSWORD).toString('base64');
const WP_URL = WOOCOMMERCE_URL + '/wp-json/wp/v2';

console.log(`Mode: ${APPLY ? '*** APPLY ***' : 'DRY-RUN'}\n`);

// ── 1. Get WC drafts without images ────────────────────────────────────────
console.log('Fetching WC drafts without images…');
let drafts = [];
for (let p = 1; p <= 5; p++) {
  const r = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100&status=draft&page=${p}`,
    { headers: { Authorization: wcAuth } }).then(r => r.json());
  if (!Array.isArray(r) || r.length === 0) break;
  drafts = drafts.concat(r);
  if (r.length < 100) break;
}
const noImageDrafts = drafts.filter(p =>
  (!p.images || p.images.length === 0) &&
  p.sku &&
  !/_(front|back|detail|angle|macro|lifestyle|card|pair|v\d+)$/i.test(p.sku) &&
  !/^WM-WOO-/i.test(p.sku)
);
console.log(`  ${drafts.length} drafts total · ${noImageDrafts.length} sin foto y con SKU canon\n`);

if (noImageDrafts.length === 0) { console.log('Nada para hacer.'); process.exit(0); }

// ── helpers ────────────────────────────────────────────────────────────────
const slugifyForFile = s => (s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 80);

// Use local snapshot first (stable), fallback to live query.
let SNAPSHOT_BY_SKU = null;
function loadSnapshot() {
  if (SNAPSHOT_BY_SKU) return SNAPSHOT_BY_SKU;
  try {
    const snap = JSON.parse(fs.readFileSync('/tmp/wenu-nocodb-snapshot.json', 'utf8'));
    SNAPSHOT_BY_SKU = {};
    for (const r of snap) if (r.SKU) SNAPSHOT_BY_SKU[r.SKU] = r;
    console.log(`  [snapshot] loaded ${snap.length} records from /tmp/wenu-nocodb-snapshot.json`);
  } catch {
    SNAPSHOT_BY_SKU = {};
  }
  return SNAPSHOT_BY_SKU;
}

async function fetchNocoBySku(sku, tries = 3) {
  // 1. Try local snapshot first
  const snap = loadSnapshot();
  if (snap[sku]) return snap[sku];
  // 2. Fallback to live NocoDB query
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${NOCODB_URL}/api/v2/tables/${NOCODB_TABLE}/records?where=(SKU,eq,${encodeURIComponent(sku)})&limit=1`,
        { headers: { 'xc-token': NOCODB_TOKEN } });
      if (r.ok) {
        const j = await r.json();
        return (j.list || [])[0];
      }
    } catch {}
    await new Promise(rr => setTimeout(rr, 500 * (i + 1)));
  }
  return null;
}

async function downloadNocoFile(attachment) {
  const rel = (attachment.path || attachment.signedPath || '').replace(/^\//, '');
  if (!rel) throw new Error(`Noco attachment sin path/signedPath: ${attachment.title || 'unknown'}`);
  const url = `${NOCODB_URL}/${rel}`;
  const r = await fetch(url, { headers: { 'xc-token': NOCODB_TOKEN } });
  if (!r.ok) throw new Error(`Noco download ${attachment.title}: HTTP ${r.status}`);
  return {
    buffer: Buffer.from(await r.arrayBuffer()),
    mimetype: attachment.mimetype || 'image/jpeg',
  };
}

async function retryFetch(url, opts, tries = 5, label = '') {
  let lastErr = '';
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, opts);
      if (r.ok) return r;
      const t = await r.text().catch(() => '');
      lastErr = `HTTP ${r.status}: ${t.slice(0, 100)}`;
      // 503/500 = WP saturated. Back off harder.
      if (r.status === 503 || r.status === 500 || r.status === 429) {
        await new Promise(rr => setTimeout(rr, 3000 * (i + 1)));
        continue;
      }
      throw new Error(lastErr);
    } catch (e) {
      lastErr = e.message;
      await new Promise(rr => setTimeout(rr, 2000 * (i + 1)));
    }
  }
  throw new Error(`${label} failed after ${tries} tries: ${lastErr}`);
}

async function uploadAndAssign(wcProd, nocoRec) {
  const photo = (Array.isArray(nocoRec['Foto macro']) && nocoRec['Foto macro'][0])
    || (Array.isArray(nocoRec['Foto referencia']) && nocoRec['Foto referencia'][0]);
  if (!photo) throw new Error('NocoDB sin Foto macro ni referencia');

  const source = (Array.isArray(nocoRec['Foto macro']) && nocoRec['Foto macro'][0]) ? 'macro' : 'reference';
  const sku = nocoRec.SKU;
  const productName = nocoRec.Title || nocoRec['Nombre interno'] || sku;
  const productSlug = wcProd.slug || slugifyForFile(productName);
  const material = Array.isArray(nocoRec.Material) ? nocoRec.Material.join(', ') : (nocoRec.Material || '');
  const linea = nocoRec['Línea'] || '';
  const desc = (nocoRec['Descripción ritual'] || nocoRec['Descripción interna'] || '').slice(0, 600);

  const dl = await downloadNocoFile(photo);
  const optimized = await sharp(dl.buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  const ext = 'jpg';
  const uploadMime = 'image/jpeg';
  const skuSlug = sku.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const filename = `${productSlug}-${skuSlug}-${source}.${ext}`;

  // 1. Upload binary (retry on 503/500)
  const upRes = await retryFetch(`${WP_URL}/media`, {
    method: 'POST',
    headers: {
      Authorization: wpAuth,
      'Content-Type': uploadMime,
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
    body: optimized,
  }, 5, `WP media POST ${sku}`);
  const media = await upRes.json();

  // 2. Set metadata
  const altText = `Wenu Mapu — ${productName}`.slice(0, 150);
  const title = material ? `${productName} — ${material}` : productName;
  const captionParts = [`SKU ${sku}`];
  if (material) captionParts.push(material);
  if (linea) captionParts.push(`Línea ${linea}`);
  const caption = captionParts.join(' · ');

  await fetch(`${WP_URL}/media/${media.id}`, {
    method: 'POST',
    headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: altText, title, caption, description: desc }),
  });

  // 3. Assign to WC product
  await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products/${wcProd.id}`, {
    method: 'PUT',
    headers: { Authorization: wcAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      images: [{ id: media.id, alt: altText, name: title }],
      meta_data: [{ key: '_wenu_synced_macro', value: photo.signedPath }],
    }),
  });

  return { mediaId: media.id, filename, altText, title, caption };
}

// ── 2. Per-SKU iteration ──────────────────────────────────────────────────
let candidates = 0, done = 0, errored = 0, skipped = 0;
for (const wcProd of noImageDrafts) {
  const sku = wcProd.sku;
  const noco = await fetchNocoBySku(sku);
  if (!noco) {
    console.log(`SKIP    ${sku.padEnd(13)} — no existe en NocoDB`);
    skipped++; continue;
  }
  const hasPhoto = (Array.isArray(noco['Foto macro']) && noco['Foto macro'].length)
    || (Array.isArray(noco['Foto referencia']) && noco['Foto referencia'].length);
  if (!hasPhoto) {
    console.log(`SKIP    ${sku.padEnd(13)} — NocoDB tampoco tiene foto · "${(noco.Title||'').slice(0,40)}"`);
    skipped++; continue;
  }
  candidates++;
  if (!APPLY) {
    console.log(`PLAN    ${sku.padEnd(13)} → subir + asignar a WC ${wcProd.id} (${wcProd.slug})`);
    continue;
  }
  try {
    const r = await uploadAndAssign(wcProd, noco);
    console.log(`✅ DONE  ${sku.padEnd(13)} → media ${r.mediaId} (${r.filename})`);
    done++;
  } catch (e) {
    console.log(`❌ ERROR ${sku.padEnd(13)} → ${e.message}`);
    errored++;
  }
  // throttle WP — slower to avoid 503 cascades
  await new Promise(r => setTimeout(r, 2500));
}

console.log();
console.log(`Summary: candidates=${candidates}, done=${done}, errored=${errored}, skipped=${skipped}`);
