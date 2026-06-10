#!/usr/bin/env node
// Manda a la PAPELERA (no borrado permanente) 4 drafts basura de WC:
// fotos de detalle/frente subidas como producto, que duplican un producto ya publicado.
// Backup reversible del estado previo en data/backups/. Dry-run por defecto; --apply para escribir.
// Revertir: WC trash es recuperable desde wp-admin, o re-crear desde el backup JSON.
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

// IDs verificados como basura (SKU *_front / *_detail, duplican producto publicado)
const IDS = [1829, 1810, 1800, 1785];

const ts = () => new Date().toISOString();
const logf = path.join(ROOT, 'scripts', '.trash-junk-drafts-2026-06-05.log');
const log = (m) => { const l = `[${ts()}] ${m}`; console.log(l); fs.appendFileSync(logf, l + '\n'); };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getProduct(id) {
  const r = await fetch(`${WC}/products/${id}?${A}`);
  if (!r.ok) throw new Error(`GET ${id} ${r.status}`);
  return r.json();
}
// force=false => va a la papelera (recuperable). force=true seria permanente (NO usamos).
async function trash(id) {
  const r = await fetch(`${WC}/products/${id}?force=false&${A}`, { method: 'DELETE' });
  if (!r.ok) throw new Error(`DELETE ${id} ${r.status}: ${(await r.text()).slice(0, 160)}`);
  return r.json();
}

(async () => {
  log(`── ${APPLY ? 'APPLY' : 'DRY-RUN'} · ${IDS.length} drafts basura → papelera ──`);
  const backup = [];
  let ok = 0, skip = 0, err = 0;
  for (const id of IDS) {
    try {
      const p = await getProduct(id);
      backup.push(p); // backup completo para poder re-crear si hiciera falta
      const tag = `wc#${id} ${p.sku || '(sin SKU)'} "${(p.name || '').slice(0, 40)}"`;
      if (p.status !== 'draft') { log(`SKIP ${tag}: status=${p.status} (no es draft, no toco)`); skip++; continue; }
      const isJunk = /_(front|detail|back|angle)$/.test(p.sku || '');
      if (!isJunk) { log(`SKIP ${tag}: SKU no parece basura, no toco por seguridad`); skip++; continue; }
      if (!APPLY) { log(`WOULD TRASH ${tag}`); ok++; continue; }
      await trash(id);
      log(`TRASHED ${tag}`);
      ok++; await sleep(400);
    } catch (e) { log(`ERROR wc#${id}: ${e.message}`); err++; }
  }
  const bdir = path.join(ROOT, 'data', 'backups'); fs.mkdirSync(bdir, { recursive: true });
  const bf = path.join(bdir, `trash-junk-drafts-${APPLY ? 'applied' : 'dryrun'}-2026-06-05.json`);
  fs.writeFileSync(bf, JSON.stringify(backup, null, 2));
  log(`backup estado previo: ${bf}`);
  log(`── fin · ${APPLY ? 'a papelera' : 'a mandar'}=${ok} skip=${skip} errores=${err} ──`);
})();
