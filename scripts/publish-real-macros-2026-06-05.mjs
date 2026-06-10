#!/usr/bin/env node
/**
 * publish-real-macros-2026-06-05.mjs
 * ───────────────────────────────────────────────────────────────────────────
 * Publica a WooCommerce SOLO los SKUs que tienen una MACRO REAL del propio SKU
 * (regla [[feedback_publish_requires_real_macro]]): descarga el adjunto Foto_macro
 * de NocoDB (copia local desde el contenedor docker), lo convierte a WebP con
 * metadata SEO ([[feedback_image_web_seo]]), sube a WP media, y crea/actualiza el
 * producto WC con título/precio/categoría/descripción de NocoDB (source of truth).
 *
 * EXCLUYE explícitamente: fotos *_ref / *_ref-regla, títulos con [INDICE/ARCHIVO/
 * DUPLICADO], SKUs sin precio. Esos quedan fuera (no se publican).
 *
 * DRY-RUN por default. --apply para escribir. Backup + log reversibles.
 *
 *   node scripts/publish-real-macros-2026-06-05.mjs            # dry-run
 *   node scripts/publish-real-macros-2026-06-05.mjs --apply    # escribe
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const TMP = '/tmp/wm-publish';
fs.mkdirSync(TMP, { recursive: true });

// ── env ──
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) { let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1); process.env[m[1]] = v; }
}
const WC_URL = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WP_BASE = WC_URL.replace(/\/wp-json\/wc\/v3$/, '');
const wcAuth = `consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;
const wpAuth = 'Basic ' + Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PWD}`).toString('base64');

const ts = () => new Date().toISOString();
const logf = path.join(ROOT, 'scripts', '.publish-real-macros-2026-06-05.log');
const log = m => { const l = `[${ts()}] ${m}`; console.log(l); fs.appendFileSync(logf, l + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// container path = /usr/app/data/nc/uploads/<relPath>  (NocoDB "download/" → "nc/uploads/")
// id: existing WC product id (update) or null (create)
const ITEMS = [
  // ── INSTOCK ──
  { sku: 'WM-PLG-016', cat: 68,  stock: 'instock',    rel: 'piezas/WM-PLG-016_macro_telegram_0zRVj.jpg' },
  { sku: 'WM-PLG-019', cat: 68,  stock: 'instock',    rel: 'piezas/WM-PLG-019_macro_telegram_A5dZN.jpg' },
  { sku: 'WM-PLG-021', cat: 68,  stock: 'instock',    rel: 'piezas/WM-PLG-021_macro_telegram_2H1MS.jpg' },
  { sku: 'WM-PLG-025', cat: 68,  stock: 'instock',    rel: 'piezas/WM-PLG-025_macro_telegram_hWATM.jpg' },
  { sku: 'WM-PLG-026', cat: 68,  stock: 'instock',    rel: 'piezas/WM-PLG-026_macro_telegram_U0eJw.jpg' },
  { sku: 'WM-PLG-027', cat: 68,  stock: 'instock',    rel: 'piezas/WM-PLG-027_macro_telegram_uz82C.jpg' },
  { sku: 'WM-PRC-008', cat: 174, stock: 'instock',    rel: 'piezas/WM-PRC-008_macro_display_rd7SJ.jpg', id: 2402 },
  // ── OUTOFSTOCK (sold out / reserved — macro real, se publica para mostrar la pieza) ──
  { sku: 'WM-EAR-020', cat: 49,  stock: 'outofstock', rel: '2026/05/30/3ed3174636ffd6274f8447af744b7db75a707c65/WM-EAR-020_macro_g8IWp.jpg' },
  { sku: 'WM-OTH-006', cat: 345, stock: 'outofstock', rel: '2026/05/30/3ed3174636ffd6274f8447af744b7db75a707c65/WM-OTH-006_macro_dr-aJ.jpg' },
  { sku: 'WM-PLG-022', cat: 68,  stock: 'outofstock', rel: 'piezas/WM-PLG-022_macro_bascula_6joek.jpg' },
  { sku: 'WM-PLG-023', cat: 68,  stock: 'outofstock', rel: 'piezas/WM-PLG-023_macro_telegram_tLs83.jpg' },
  { sku: 'WM-PRC-018', cat: 174, stock: 'outofstock', rel: 'piezas/WM-PRC-018_macro_filtrum_39Ygl.jpg' },
];

const slugify = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);

// pull NocoDB copy (title, ritual, desc, price, material) from snapshot
function nocoData(sku) {
  const out = execSync(`sqlite3 -json /tmp/noco.db "SELECT title,Nombre_ritual,Descripcion_ritual,Precio_venta_USD,Material FROM nc_9aor___Piezas WHERE SKU='${sku}'"`, { encoding: 'utf8' });
  return JSON.parse(out)[0];
}

async function uploadMedia(imgPath, filename, alt, caption, desc, title) {
  const buf = fs.readFileSync(imgPath);
  const up = await fetch(`${WP_BASE}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: { Authorization: wpAuth, 'Content-Type': 'image/jpeg', 'Content-Disposition': `attachment; filename="${filename}"` },
    body: buf,
  });
  if (!up.ok) throw new Error(`media POST ${up.status}: ${(await up.text()).slice(0, 200)}`);
  const media = await up.json();
  // set SEO metadata
  const patch = await fetch(`${WP_BASE}/wp-json/wp/v2/media/${media.id}`, {
    method: 'POST', headers: { Authorization: wpAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ alt_text: alt, caption, description: desc, title }),
  });
  if (!patch.ok) log(`  WARN media meta ${media.id} ${patch.status}`);
  return media.id;
}

async function findWC(sku) {
  const r = await fetch(`${WC_URL}/products?sku=${encodeURIComponent(sku)}&${wcAuth}&_fields=id,status`);
  const j = await r.json();
  return Array.isArray(j) && j.length ? j[0] : null;
}

async function main() {
  log(`── ${APPLY ? 'APPLY' : 'DRY-RUN'} · publish ${ITEMS.length} real-macro SKUs ──`);
  const backup = []; let done = 0, err = 0;

  for (const it of ITEMS) {
    try {
      const n = nocoData(it.sku);
      if (!n) throw new Error('no NocoDB row');
      const price = n.Precio_venta_USD;
      if (price == null || price === '') throw new Error('no price — skip');
      const name = (n.title || n.Nombre_ritual || it.sku).replace(/^\[[^\]]+\]\s*/, '').trim();
      const slug = slugify(name) || it.sku.toLowerCase();
      const ritual = (n.Nombre_ritual || '').trim();
      const desc = (n.Descripcion_ritual || '').trim();
      const mat = (n.Material || '').trim();
      const fname = `${slug}-${it.sku.toLowerCase()}-macro.jpg`;
      const alt = `${ritual ? ritual + ' — ' : ''}${name} — Wenu Mapu tribal jewelry`;
      const caption = ritual || name;
      const mediaDesc = desc || name;
      const mediaTitle = `${name}${mat ? ' — ' + mat : ''}`;

      const existing = it.id ? { id: it.id } : await findWC(it.sku);
      const action = existing ? `UPDATE #${existing.id}` : 'CREATE';
      log(`${APPLY ? 'PUB ' : 'PLAN'} ${it.sku.padEnd(11)} ${action.padEnd(11)} $${String(price).padEnd(7)} ${it.stock.padEnd(10)} cat=${it.cat} ← ${fname}`);

      if (!APPLY) continue;

      // 1) copy macro out of container
      const localJpg = path.join(TMP, `${it.sku}.jpg`);
      execSync(`docker cp nocodb:/usr/app/data/nc/uploads/${it.rel} ${localJpg}`);
      // 2) → optimized JPEG SEO (server WAF rejects webp; site standard is jpg)
      const localOut = path.join(TMP, fname);
      await sharp(localJpg).rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85, mozjpeg: true }).toFile(localOut);
      // 3) upload media
      const mediaId = await uploadMedia(localOut, fname, alt, caption, mediaDesc, mediaTitle);
      log(`  media #${mediaId} ${fname}`);

      // 4) create/update product
      const body = {
        name, slug, sku: it.sku, type: 'simple', status: 'publish',
        regular_price: String(price),
        description: desc ? `<p>${desc}</p>` : '',
        short_description: ritual ? `<p>${ritual}</p>` : '',
        categories: [{ id: it.cat }],
        stock_status: it.stock,
        images: [{ id: mediaId }],
      };
      let res;
      if (existing) {
        res = await fetch(`${WC_URL}/products/${existing.id}?${wcAuth}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      } else {
        res = await fetch(`${WC_URL}/products?${wcAuth}`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
      }
      if (!res.ok) throw new Error(`WC ${existing ? 'PUT' : 'POST'} ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const prod = await res.json();
      backup.push({ sku: it.sku, wc_id: prod.id, media_id: mediaId, created: !existing, prev_status: existing?.status ?? null });
      log(`  ✅ #${prod.id} ${prod.status} ${prod.permalink || ''}`);
      done++;
      await sleep(900);
    } catch (e) { log(`  ❌ ${it.sku}: ${e.message}`); err++; }
  }

  if (APPLY) {
    const bf = path.join(ROOT, 'data', 'backups', `publish-real-macros-2026-06-05-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(bf), { recursive: true });
    fs.writeFileSync(bf, JSON.stringify(backup, null, 1));
    log(`backup: ${bf}`);
  }
  log(`── fin · publicados=${done} errores=${err} ──`);
}
main().catch(e => { log(`crash: ${e.stack}`); process.exit(1); });
