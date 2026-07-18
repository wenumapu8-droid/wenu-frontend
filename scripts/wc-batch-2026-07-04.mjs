#!/usr/bin/env node
/**
 * wc-batch-2026-07-04.mjs — cambios de catálogo aprobados por el owner (2026-07-04)
 * ───────────────────────────────────────────────────────────────────────────
 *  1. WM-PLG-003: reemplazar imagen (screenshot de competidor "KuBooz") por foto
 *     real recortada de la ref-regla de NocoDB (/tmp/plg003/PLG-003-clean.jpg).
 *  2. WM-PRC-002: marcar out-of-stock (NocoDB dice SOLD OUT, WC decía instock).
 *  3. Publicar 7 drafts verificados con foto macro real:
 *       2801 PRC-019-MERGED, 2433 PRC-036, 2427 PRC-030 (in stock)
 *       2786 RNG-010, 2784 RNG-009, 2415 RNG-008, 2414 RNG-007 (sold out → quedan outofstock)
 *
 * DRY-RUN por default. --apply para escribir. Backup reversible del estado previo.
 *   node scripts/wc-batch-2026-07-04.mjs            # dry-run
 *   node scripts/wc-batch-2026-07-04.mjs --apply
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) { let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1); process.env[m[1]] = v; }
}
const WC_URL = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WP_BASE = WC_URL.replace(/\/wp-json\/wc\/v3$/, '');
const wcAuth = `consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;
const wpAuth = 'Basic ' + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PWD}`).toString('base64');
const sleep = ms => new Promise(r => setTimeout(r, ms));

const PUBLISH_IDS = [2801, 2433, 2427, 2786, 2784, 2415, 2414];
const PLG003_IMG = '/tmp/plg003/PLG-003-clean.jpg';

async function wcGet(pth) {
  const r = await fetch(`${WC_URL}${pth}${pth.includes('?') ? '&' : '?'}${wcAuth}`);
  if (!r.ok) throw new Error(`GET ${pth} → ${r.status}`);
  return r.json();
}
async function wcPut(pth, body) {
  const r = await fetch(`${WC_URL}${pth}?${wcAuth}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`PUT ${pth} → ${r.status}: ${JSON.stringify(j).slice(0, 160)}`);
  return j;
}
async function findBySku(sku) {
  const j = await wcGet(`/products?sku=${encodeURIComponent(sku)}&_fields=id,name,sku,status,stock_status,images`);
  return Array.isArray(j) && j.length ? j[0] : null;
}
async function uploadMedia(file, filename, alt) {
  const buf = fs.readFileSync(file);
  const up = await fetch(`${WP_BASE}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: { Authorization: wpAuth, 'Content-Type': 'image/jpeg', 'Content-Disposition': `attachment; filename="${filename}"` },
    body: buf,
  });
  if (!up.ok) throw new Error(`media POST ${up.status}: ${(await up.text()).slice(0, 160)}`);
  const media = await up.json();
  await fetch(`${WP_BASE}/wp-json/wp/v2/media/${media.id}`, {
    method: 'POST', headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: alt, title: alt, caption: alt }),
  });
  return media.id;
}

async function main() {
  console.log(`\n=== wc-batch 2026-07-04 · ${APPLY ? 'APPLY' : 'DRY-RUN'} ===\n`);
  const backup = { ts: new Date().toISOString(), apply: APPLY, items: [] };

  // snapshot affected products
  const plg003 = await findBySku('WM-PLG-003');
  const prc002 = await findBySku('WM-PRC-002');
  const drafts = [];
  for (const id of PUBLISH_IDS) {
    const p = await wcGet(`/products/${id}?_fields=id,name,sku,status,stock_status`);
    drafts.push(p);
  }
  for (const p of [plg003, prc002, ...drafts]) {
    if (p) backup.items.push({ id: p.id, sku: p.sku, status: p.status, stock_status: p.stock_status, images: (p.images || []).map(i => ({ id: i.id, src: i.src })) });
  }
  const bdir = path.join(ROOT, 'data', 'backups');
  fs.mkdirSync(bdir, { recursive: true });
  const bpath = path.join(bdir, `wc-batch-2026-07-04-${Date.now()}.json`);
  fs.writeFileSync(bpath, JSON.stringify(backup, null, 2));
  console.log(`backup → ${bpath}\n`);

  // 1. PLG-003 image replace
  console.log('1) WM-PLG-003 image replace (screenshot KuBooz → foto real ammonite)');
  if (!plg003) console.log('   ⚠ PLG-003 not found, skip');
  else {
    console.log(`   current images: ${(plg003.images || []).map(i => i.id + ':' + i.src.split('/').pop()).join(', ') || 'none'}`);
    if (APPLY) {
      const mid = await uploadMedia(PLG003_IMG, 'wm-plg-003-ammonite-real.jpg', 'Ammonite Spiral Stainless Steel Plugs — Wenu Mapu');
      const r = await wcPut(`/products/${plg003.id}`, { images: [{ id: mid }] });
      console.log(`   ✓ uploaded media ${mid}, set as only image. now: ${(r.images || []).map(i => i.id).join(',')}`);
    } else console.log(`   → would upload ${PLG003_IMG} and REPLACE gallery with it`);
  }

  // 2. PRC-002 out of stock
  console.log('\n2) WM-PRC-002 → outofstock');
  if (!prc002) console.log('   ⚠ PRC-002 not found, skip');
  else {
    console.log(`   current stock_status=${prc002.stock_status}`);
    if (APPLY) { const r = await wcPut(`/products/${prc002.id}`, { stock_status: 'outofstock' }); console.log(`   ✓ now stock_status=${r.stock_status}`); }
    else console.log('   → would set stock_status=outofstock');
  }

  // 3. publish drafts
  console.log('\n3) publish 7 drafts');
  for (const p of drafts) {
    console.log(`   ${p.id} ${p.sku} (${p.status}, stock=${p.stock_status})`);
    if (APPLY) { const r = await wcPut(`/products/${p.id}`, { status: 'publish' }); console.log(`      ✓ → ${r.status}`); await sleep(300); }
    else console.log('      → would set status=publish');
  }

  console.log(`\n=== done (${APPLY ? 'APPLIED' : 'dry-run'}). revert: restaurar desde ${path.basename(bpath)} ===\n`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
