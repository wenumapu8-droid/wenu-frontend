#!/usr/bin/env node
/**
 * push-macros-imageonly-2026-06-19.mjs
 * ───────────────────────────────────────────────────────────────────────────
 * Reemplaza SOLO la imagen principal de productos WC ya publicados, subiendo la
 * macro real de NocoDB. NO toca nombre/precio/descripción/status (a diferencia de
 * publish-real-macros, que hace un PUT completo). Image-only update.
 *
 * Los 4 SKUs fueron verificados VISUALMENTE como macros reales (no screenshots).
 * HAN-014 y TUN-013 se EXCLUYEN: su "macro" en NocoDB es un screenshot de IG.
 *
 * DRY-RUN por default. --apply para escribir. Backup reversible (guarda imágenes previas).
 *   node scripts/push-macros-imageonly-2026-06-19.mjs           # dry-run
 *   node scripts/push-macros-imageonly-2026-06-19.mjs --apply
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import sharp from 'sharp';

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SRC = '/private/tmp/claude-501/-Users-user1/8236a16d-5858-4c62-abb5-4f0a2cb2f3d6/scratchpad/balde1'; // macros verificadas del Balde 1

for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) { let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1); process.env[m[1]] = v; }
}
const WC_URL = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WP_BASE = WC_URL.replace(/\/wp-json\/wc\/v3$/, '');
const wcAuth = `consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;
const wpAuth = 'Basic ' + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PWD}`).toString('base64');

const SKUS = ['WM-HAN-004','WM-HAN-011','WM-HAN-012','WM-HAN-015','WM-HAN-016','WM-HAN-019','WM-HAN-027','WM-NCK-003','WM-PLG-008','WM-PLG-015','WM-RNG-002'];
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = m => console.log(m);

async function findWC(sku) {
  const r = await fetch(`${WC_URL}/products?sku=${encodeURIComponent(sku)}&${wcAuth}&_fields=id,name,status,images`);
  const j = await r.json();
  return Array.isArray(j) && j.length ? j[0] : null;
}
async function uploadMedia(buf, filename, alt, title) {
  const up = await fetch(`${WP_BASE}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: { Authorization: wpAuth, 'Content-Type': 'image/jpeg', 'Content-Disposition': `attachment; filename="${filename}"` },
    body: buf,
  });
  if (!up.ok) throw new Error(`media POST ${up.status}: ${(await up.text()).slice(0, 160)}`);
  const media = await up.json();
  await fetch(`${WP_BASE}/wp-json/wp/v2/media/${media.id}`, {
    method: 'POST', headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: alt, title, caption: alt }),
  });
  return media.id;
}

async function main() {
  log(`── ${APPLY ? 'APPLY' : 'DRY-RUN'} · image-only push · ${SKUS.length} SKUs ──`);
  const backup = []; let done = 0, err = 0;
  for (const sku of SKUS) {
    try {
      const prod = await findWC(sku);
      if (!prod) throw new Error('no existe en WC');
      const cur = (prod.images || []).map(i => i.src.split('/').pop()).join(', ') || '(ninguna)';
      const slug = slugify(prod.name) || sku.toLowerCase();
      const fname = `${slug}-${sku.toLowerCase()}-macro.jpg`;
      const alt = `${prod.name} — Wenu Mapu tribal jewelry`;
      log(`${APPLY ? 'PUSH' : 'PLAN'} ${sku.padEnd(11)} #${prod.id} ${prod.status}  actual=[${cur}] ← ${fname}`);
      if (!APPLY) continue;

      const buf = await sharp(path.join(SRC, `${sku}.jpg`)).rotate()
        .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true }).toBuffer();
      const mediaId = await uploadMedia(buf, fname, alt, prod.name);
      log(`  media #${mediaId}`);
      const res = await fetch(`${WC_URL}/products/${prod.id}?${wcAuth}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images: [{ id: mediaId }] }),
      });
      if (!res.ok) throw new Error(`WC PUT ${res.status}: ${(await res.text()).slice(0, 160)}`);
      const out = await res.json();
      backup.push({ sku, wc_id: prod.id, new_media_id: mediaId, prev_images: prod.images });
      log(`  ✅ #${out.id} → ${(out.images || [])[0]?.src?.split('/').pop()}`);
      done++; await sleep(800);
    } catch (e) { log(`  ❌ ${sku}: ${e.message}`); err++; }
  }
  if (APPLY) {
    const bf = path.join(ROOT, 'data', 'backups', `push-macros-imageonly-2026-06-19-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(bf), { recursive: true });
    fs.writeFileSync(bf, JSON.stringify(backup, null, 1));
    log(`backup: ${bf}`);
  }
  log(`── fin · ok=${done} err=${err} ──`);
}
main().catch(e => { console.error('crash', e); process.exit(1); });
