#!/usr/bin/env node
// Pasa a "publish" un set curado de drafts WC (SKU válido + foto + precio, sin duplicados).
// Lee IDs de /tmp/wc_publish_ids.json. Dry-run por defecto; --apply para escribir.
// Backup reversible del estado previo en data/backups/. Reversible: re-PATCH status=draft.
// Auditoría 2026-06-05.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
const WC = (process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3').replace(/\/$/, '');
const KEY = process.env.WC_CONSUMER_KEY, SEC = process.env.WC_CONSUMER_SECRET;
const A = `consumer_key=${encodeURIComponent(KEY)}&consumer_secret=${encodeURIComponent(SEC)}`;

const ids = JSON.parse(fs.readFileSync('/tmp/wc_publish_ids.json', 'utf8'));
const ts = () => new Date().toISOString();
const logf = path.join(ROOT, 'scripts', '.publish-clean-drafts-2026-06-05.log');
const log = (m) => { const l = `[${ts()}] ${m}`; console.log(l); fs.appendFileSync(logf, l + '\n'); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function withRetry(fn, label, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { last = e; const w = 2000 * (i + 1); log(`  retry ${label} (${i + 1}/${tries}): ${String(e.message).slice(0, 80)} — ${w}ms`); await sleep(w); }
  }
  throw last;
}

async function getProduct(id) {
  const r = await fetch(`${WC}/products/${id}?${A}`);
  if (!r.ok) throw new Error(`GET ${id} ${r.status}`);
  return r.json();
}
async function setStatus(id, status) {
  const r = await fetch(`${WC}/products/${id}?${A}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error(`PUT ${id} ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

(async () => {
  log(`── ${APPLY ? 'APPLY' : 'DRY-RUN'} · ${ids.length} drafts → publish ──`);
  const backup = [];
  let ok = 0, skip = 0, err = 0;
  for (const id of ids) {
    try {
      const p = await withRetry(() => getProduct(id), `get ${id}`);
      backup.push({ id, sku: p.sku, status: p.status, name: p.name });
      if (p.status !== 'draft') { log(`SKIP wc#${id} ${p.sku}: status=${p.status} (no es draft)`); skip++; continue; }
      if (!p.images || !p.images.length) { log(`SKIP wc#${id} ${p.sku}: sin imagen`); skip++; continue; }
      if (!p.price || p.price === '0') { log(`SKIP wc#${id} ${p.sku}: precio $0`); skip++; continue; }
      if (!APPLY) { log(`WOULD PUBLISH wc#${id} ${p.sku} "${(p.name || '').slice(0, 35)}" $${p.price}`); ok++; continue; }
      await withRetry(() => setStatus(id, 'publish'), `pub ${id}`);
      log(`PUBLISHED wc#${id} ${p.sku} "${(p.name || '').slice(0, 35)}" $${p.price}`);
      ok++; await sleep(500);
    } catch (e) { log(`ERROR wc#${id}: ${e.message}`); err++; }
  }
  if (APPLY) {
    const bdir = path.join(ROOT, 'data', 'backups'); fs.mkdirSync(bdir, { recursive: true });
    const bf = path.join(bdir, `publish-clean-drafts-${Date.now()}.json`);
    fs.writeFileSync(bf, JSON.stringify(backup, null, 2));
    log(`backup estado previo: ${bf}`);
  }
  log(`── fin · ${APPLY ? 'publicados' : 'a publicar'}=${ok} skip=${skip} errores=${err} ──`);
})();
