#!/usr/bin/env node
// One-shot: sube foto macro local + publica los 28 drafts READY verificados (2026-06-05).
// Bypassa la API rota de NocoDB (list 500). Lee plan de /tmp/publish_plan.json.
// Dry-run por defecto. --apply para escribir. Backup reversible en data/backups/.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

// cargar .env
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
const WC_URL = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WP_URL = WC_URL.replace(/\/wc\/v3\/?$/, '/wp/v2');
const KEY = process.env.WC_CONSUMER_KEY, SEC = process.env.WC_CONSUMER_SECRET;
const WP_USER = process.env.WP_USER, WP_PWD = process.env.WP_APP_PWD;
const wcAuth = `consumer_key=${encodeURIComponent(KEY)}&consumer_secret=${encodeURIComponent(SEC)}`;
const wpAuth = 'Basic ' + Buffer.from(`${WP_USER}:${WP_PWD}`).toString('base64');

const plan = JSON.parse(fs.readFileSync('/tmp/publish_plan.json', 'utf8'))
  .map(p => ({ ...p, file: p.file.replace('/tmp/drafts/', '/tmp/drafts_web/') }));
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function withRetry(fn, label, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { last = e; const wait = 2000 * (i + 1); log(`  retry ${label} (${i + 1}/${tries}) tras ${e.message.slice(0,80)} — espero ${wait}ms`); await sleep(wait); }
  }
  throw last;
}
const slug = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70);

function ts() { return new Date().toISOString(); }
const logf = path.join(ROOT, 'scripts', '.publish-drafts-2026-06-05.log');
function log(m) { const l = `[${ts()}] ${m}`; console.log(l); fs.appendFileSync(logf, l + '\n'); }

async function uploadMedia(file, sku, title, material) {
  const buf = fs.readFileSync(file);
  const seo = `${slug(title) || sku.toLowerCase()}-${sku.toLowerCase()}-macro.jpg`;
  const res = await fetch(`${WP_URL}/media`, {
    method: 'POST',
    headers: { Authorization: wpAuth, 'Content-Type': 'image/jpeg', 'Content-Disposition': `attachment; filename="${seo}"` },
    body: buf,
  });
  if (!res.ok) throw new Error(`media POST ${res.status}: ${(await res.text()).slice(0,200)}`);
  const j = await res.json();
  const mat = Array.isArray(material) ? material.join(', ') : (material || '');
  await fetch(`${WP_URL}/media/${j.id}`, {
    method: 'POST', headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: `Wenu Mapu — ${title}`.slice(0,150), title: mat ? `${title} — ${mat}` : title, caption: `SKU ${sku}${mat ? ' · ' + mat : ''}` }),
  }).catch(() => {});
  return j;
}

async function publishProduct(id, mediaId) {
  const res = await fetch(`${WC_URL}/products/${id}?${wcAuth}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'publish', images: [{ id: mediaId }], meta_data: [{ key: '_wenu_synced_macro', value: 'local-2026-06-05' }, { key: '_wenu_synced_at', value: ts() }] }),
  });
  if (!res.ok) throw new Error(`WC PUT ${id} ${res.status}: ${(await res.text()).slice(0,200)}`);
  return res.json();
}

async function main() {
  log(`── inicio ${APPLY ? 'APPLY' : 'DRY-RUN'} · ${plan.length} productos ──`);
  const backup = [];
  let done = 0, err = 0;
  for (const p of plan) {
    if (!fs.existsSync(p.file)) { log(`SKIP ${p.sku}: archivo no existe`); err++; continue; }
    log(`${APPLY ? 'PUB' : 'PLAN'} ${p.sku} wc#${p.wc_id} [${p.status}] ${path.basename(p.file)} → publish`);
    if (!APPLY) continue;
    try {
      backup.push({ sku: p.sku, wc_id: p.wc_id, prev_status: p.status });
      const media = await withRetry(() => uploadMedia(p.file, p.sku, p.title, p.material), `media ${p.sku}`);
      await withRetry(() => publishProduct(p.wc_id, media.id), `publish ${p.sku}`);
      log(`  done ${p.sku} → media ${media.id} asignado, status=publish`);
      done++;
    } catch (e) { log(`  ERROR ${p.sku}: ${e.message}`); err++; }
    await sleep(1500);
  }
  if (APPLY) {
    const bf = path.join(ROOT, 'data', 'backups', `publish-drafts-2026-06-05-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(bf), { recursive: true });
    fs.writeFileSync(bf, JSON.stringify(backup, null, 1));
    log(`backup: ${bf}`);
  }
  log(`── fin · publicados=${done} errores=${err} ──`);
}
main().catch(e => { log(`crash: ${e.stack}`); process.exit(1); });
