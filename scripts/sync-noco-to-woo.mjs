#!/usr/bin/env node
/**
 * sync-noco-to-woo.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Sube las fotos macro/referencia que están en NocoDB a WordPress (WP Media
 * Library) y las asigna al producto WooCommerce correspondiente.
 *
 * Modo dry-run por defecto. Sin --apply no escribe nada en WP/WC.
 *
 * USO
 * ────────────────────────────────────────────────────────────────────────────
 *   # Listar lo que subiría:
 *   node scripts/sync-noco-to-woo.mjs
 *   node scripts/sync-noco-to-woo.mjs --dry-run
 *
 *   # Ejecutar la subida real:
 *   node scripts/sync-noco-to-woo.mjs --apply
 *
 *   # Solo un SKU específico:
 *   node scripts/sync-noco-to-woo.mjs --sku WM-TUN-014
 *   node scripts/sync-noco-to-woo.mjs --sku WM-TUN-014 --apply
 *
 *   # Forzar (sube aunque el producto WC ya tenga imagen) — usar con cuidado:
 *   node scripts/sync-noco-to-woo.mjs --force --apply
 *
 * VARIABLES DE ENTORNO REQUERIDAS (.env del proyecto)
 * ────────────────────────────────────────────────────────────────────────────
 *   WC_URL                  https://www.wenumapuonline.com/wp-json/wc/v3
 *   WC_CONSUMER_KEY         ck_…
 *   WC_CONSUMER_SECRET      cs_…
 *   WP_USER                 usuario WP con permiso de upload (NO el ck_)
 *   WP_APP_PWD              Application Password (NO la contraseña real)
 *   NOCO_URL                http://localhost:8080  (opcional, default éste)
 *   NOCO_TABLE_ID           m5s3jnm72tzhk9g       (opcional, default éste)
 *   NOCO_TOKEN              xc-token de NocoDB
 *
 * Crear WP Application Password:
 *   wp-admin → Users → tu usuario → "Application Passwords" → New → guardar
 *   en .env como WP_APP_PWD (separar el "Application Name" libre, ej. "wenu-sync").
 *
 * LÓGICA
 * ────────────────────────────────────────────────────────────────────────────
 * 1. GET de todos los productos WC publicados (pagina hasta agotar).
 * 2. GET de todos los registros de la tabla Piezas (pagina por 100).
 * 3. Por cada SKU presente en ambos lados, decide si hay que subir:
 *    - WC.images.length === 0 (o --force) Y NocoDB tiene "Foto macro" o "Foto referencia"
 *    - El meta `_wenu_synced_macro` del producto NO contiene el path de NocoDB
 *      (idempotencia — si ya se subió, no se duplica).
 * 4. Descarga la primera imagen de NocoDB (preferencia: macro > referencia).
 * 5. POST /wp-json/wp/v2/media (multipart) con basic-auth WP_USER:WP_APP_PWD.
 * 6. PATCH /wp-json/wc/v3/products/{id} para asignar la nueva image id.
 * 7. PATCH /wp-json/wc/v3/products/{id} para grabar `_wenu_synced_macro` en meta_data.
 * 8. Log a stdout y a scripts/.sync-noco-to-woo.log (timestamped, append).
 *
 * REGLAS DE SEGURIDAD
 * ────────────────────────────────────────────────────────────────────────────
 * - Nunca borra imágenes existentes (PATCH con array completo solo cuando length===0).
 * - Nunca borra registros.
 * - Si WC tiene 1+ imagen y no es --force, salta el producto.
 * - Si NocoDB no tiene foto, salta (no inventa).
 * - Si el path de NocoDB ya está en meta `_wenu_synced_macro`, salta.
 *
 * AUTHOR: Tigo · 2026-05-29 (turno nocturno)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_PATH = path.join(__dirname, '.sync-noco-to-woo.log');

// ─── Carga .env del proyecto (mismo dir que /scripts) ───────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    log('warn', `[env] No se encontró ${envPath}; usando solo process.env`);
    return;
  }
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (process.env[m[1]] !== undefined) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    process.env[m[1]] = v;
  }
}

// ─── Logging dual: stdout + archivo append ──────────────────────────────────
function log(level, msg) {
  const stamp = new Date().toISOString();
  const line = `[${stamp}] [${level.toUpperCase()}] ${msg}`;
  // eslint-disable-next-line no-console
  console.log(line);
  try {
    fs.appendFileSync(LOG_PATH, line + '\n', 'utf8');
  } catch (e) {
    // no rompemos el run si el log file falla.
  }
}

// ─── Args ───────────────────────────────────────────────────────────────────
const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const FORCE = args.has('--force');
const skuFilterArg = process.argv.find((a, i) => process.argv[i - 1] === '--sku');
const SKU_FILTER = skuFilterArg ? skuFilterArg.toUpperCase() : null;

// ─── Setup ──────────────────────────────────────────────────────────────────
loadEnv();

const WC_URL = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WP_URL = WC_URL.replace(/\/wc\/v3\/?$/, '/wp/v2');
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;
const WP_USER = process.env.WP_USER;
const WP_PWD = process.env.WP_APP_PWD;
const NOCO_URL = process.env.NOCO_URL || 'http://localhost:8080';
const NOCO_TABLE = process.env.NOCO_TABLE_ID || 'm5s3jnm72tzhk9g';
const NOCO_TOKEN = process.env.NOCO_TOKEN;

function assertCreds() {
  const missing = [];
  if (!WC_KEY) missing.push('WC_CONSUMER_KEY');
  if (!WC_SECRET) missing.push('WC_CONSUMER_SECRET');
  if (APPLY) {
    if (!WP_USER) missing.push('WP_USER');
    if (!WP_PWD) missing.push('WP_APP_PWD');
  }
  if (!NOCO_TOKEN) missing.push('NOCO_TOKEN');
  if (missing.length) {
    log('error',
      'Faltan variables de entorno: ' + missing.join(', ') +
      '. Agregalas a .env. Ver cabecera del script para detalles.'
    );
    process.exit(2);
  }
}

const wcAuth = `consumer_key=${encodeURIComponent(WC_KEY || '')}&consumer_secret=${encodeURIComponent(WC_SECRET || '')}`;
const wpAuthHeader = () =>
  'Basic ' + Buffer.from(`${WP_USER}:${WP_PWD}`).toString('base64');

// ─── WooCommerce ────────────────────────────────────────────────────────────
async function fetchAllWcProducts() {
  const all = [];
  let page = 1;
  const perPage = 100;
  while (true) {
    // 2026-06-04: include drafts (newly synced products start as draft until Ocin publishes).
    const url = `${WC_URL}/products?per_page=${perPage}&page=${page}&status=any&${wcAuth}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`WC products page ${page}: HTTP ${res.status}`);
    const arr = await res.json();
    all.push(...arr);
    if (arr.length < perPage) break;
    page += 1;
  }
  log('info', `[wc] ${all.length} productos publicados leídos`);
  return all;
}

async function updateWcProductImages(productId, imageId, syncedPath) {
  const url = `${WC_URL}/products/${productId}?${wcAuth}`;
  const body = {
    images: [{ id: imageId }],
    meta_data: [
      { key: '_wenu_synced_macro', value: syncedPath },
      { key: '_wenu_synced_at', value: new Date().toISOString() },
    ],
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`WC PUT product ${productId}: HTTP ${res.status} ${t.slice(0, 200)}`);
  }
  return res.json();
}

// ─── NocoDB ─────────────────────────────────────────────────────────────────
async function fetchAllNocoRecords() {
  const all = [];
  let offset = 0;
  const limit = 100;
  while (true) {
    const url = `${NOCO_URL}/api/v2/tables/${NOCO_TABLE}/records?limit=${limit}&offset=${offset}`;
    const res = await fetch(url, { headers: { 'xc-token': NOCO_TOKEN } });
    if (!res.ok) {
      // NocoDB con SQLITE_BUSY tira 500/400 esporádicamente. Reintentamos 1 vez.
      await sleep(2000);
      const res2 = await fetch(url, { headers: { 'xc-token': NOCO_TOKEN } });
      if (!res2.ok) throw new Error(`Noco GET offset ${offset}: HTTP ${res2.status}`);
      const j2 = await res2.json();
      all.push(...(j2.list || []));
      if (!j2.pageInfo || j2.pageInfo.isLastPage) break;
      offset += limit;
      continue;
    }
    const j = await res.json();
    all.push(...(j.list || []));
    if (!j.pageInfo || j.pageInfo.isLastPage) break;
    offset += limit;
  }
  log('info', `[noco] ${all.length} records leídos`);
  return all;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Download de la imagen de NocoDB ────────────────────────────────────────
function pickNocoPhoto(rec) {
  // Foto macro tiene preferencia; fallback a Foto referencia.
  const macro = rec['Foto macro'];
  if (Array.isArray(macro) && macro.length && macro[0]?.signedPath) {
    return { source: 'Foto macro', attachment: macro[0] };
  }
  const ref = rec['Foto referencia'];
  if (Array.isArray(ref) && ref.length && ref[0]?.signedPath) {
    return { source: 'Foto referencia', attachment: ref[0] };
  }
  return null;
}

async function downloadNocoFile(attachment) {
  // signedPath es relativo al server NocoDB.
  const url = `${NOCO_URL}/${attachment.signedPath.replace(/^\//, '')}`;
  const res = await fetch(url, { headers: { 'xc-token': NOCO_TOKEN } });
  if (!res.ok) throw new Error(`Noco download ${attachment.title}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return {
    buffer: buf,
    filename: attachment.title || 'photo.jpg',
    mimetype: attachment.mimetype || 'image/jpeg',
  };
}

// ─── Upload a WP Media ──────────────────────────────────────────────────────
// Convención de naming SEO (Ocin 2026-06-04: "bien hechas con nombres bien
// detalles dato y formatos"):
//   filename = <product-slug>-<sku-lower>-<source>-<sequence>.<ext>
//   ej.: tiger-eye-buddha-hanger-wm-han-002-macro.jpg
//
// Metadata seteado por PATCH en /media/{id}:
//   alt_text    = "Wenu Mapu — <Product Name>"
//   title       = "<Product Name> — <Material>"      (lo que ve en bib. WP)
//   caption     = "SKU <SKU> · <Material> · <Línea>"
//   description = Descripción ritual o interna (texto largo)
function slugifyForFile(s) {
  return (s || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

async function uploadToWpMedia({ buffer, mimetype, sku, source, productSlug, productName, material, linea, descripcion }) {
  // 1. Compose SEO filename
  const ext = (mimetype === 'image/png' ? 'png' : (mimetype === 'image/webp' ? 'webp' : 'jpg'));
  const base = productSlug || slugifyForFile(productName) || sku.toLowerCase();
  const skuSlug = sku.toLowerCase().replace(/[^a-z0-9-]/g, '');
  const srcTag = source === 'Foto macro' ? 'macro' : 'reference';
  const seoFilename = `${base}-${skuSlug}-${srcTag}.${ext}`;

  // 2. Upload binary
  const res = await fetch(`${WP_URL}/media`, {
    method: 'POST',
    headers: {
      'Authorization': wpAuthHeader(),
      'Content-Type': mimetype,
      'Content-Disposition': `attachment; filename="${seoFilename}"`,
    },
    body: buffer,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => '');
    throw new Error(`WP media POST: HTTP ${res.status} ${t.slice(0, 300)}`);
  }
  const j = await res.json();

  // 3. PATCH metadata (alt, title, caption, description)
  if (j.id) {
    const matStr = Array.isArray(material) ? material.join(', ') : (material || '');
    const altText = `Wenu Mapu — ${productName}`.slice(0, 150);
    const title = matStr ? `${productName} — ${matStr}` : productName;
    const captionParts = [`SKU ${sku}`];
    if (matStr) captionParts.push(matStr);
    if (linea) captionParts.push(`Línea ${linea}`);
    const caption = captionParts.join(' · ');
    const description = (descripcion || '').slice(0, 600);

    try {
      const r2 = await fetch(`${WP_URL}/media/${j.id}`, {
        method: 'POST',
        headers: { 'Authorization': wpAuthHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ alt_text: altText, title, caption, description }),
      });
      if (!r2.ok) {
        const t = await r2.text().catch(() => '');
        log('warn', `[wp] media ${j.id} metadata patch HTTP ${r2.status}: ${t.slice(0,150)}`);
      }
    } catch (e) {
      log('warn', `[wp] no se pudo setear metadata en media ${j.id}: ${e.message}`);
    }
  }
  return j;
}

// ─── Cruce SKU ──────────────────────────────────────────────────────────────
function buildWcIndex(wcProducts) {
  const bySku = new Map();
  const bySlug = new Map();
  for (const p of wcProducts) {
    if (p.sku) bySku.set(p.sku.trim().toUpperCase(), p);
    if (p.slug) bySlug.set(p.slug.trim().toLowerCase(), p);
  }
  return { bySku, bySlug };
}

function findWcMatch(nocoRec, wcIndex) {
  const sku = (nocoRec.SKU || '').trim().toUpperCase();
  if (sku && wcIndex.bySku.has(sku)) return wcIndex.bySku.get(sku);
  // fallback por URL WooCommerce (si está cargada en NocoDB)
  const url = nocoRec['URL WooCommerce'];
  if (url && typeof url === 'string') {
    const m = url.match(/\/product\/([^/?#]+)/);
    if (m) {
      const slug = m[1].toLowerCase();
      if (wcIndex.bySlug.has(slug)) return wcIndex.bySlug.get(slug);
    }
  }
  return null;
}

// ─── Decisión por producto ──────────────────────────────────────────────────
function shouldSync(wcProd, nocoRec) {
  if (!wcProd) return { sync: false, reason: 'sin match en WC' };
  if (!FORCE && wcProd.images && wcProd.images.length > 0) {
    return { sync: false, reason: `WC ya tiene ${wcProd.images.length} imagen(es)` };
  }
  const photo = pickNocoPhoto(nocoRec);
  if (!photo) return { sync: false, reason: 'NocoDB sin Foto macro ni referencia' };
  // idempotencia
  const synced = (wcProd.meta_data || []).find(m => m.key === '_wenu_synced_macro');
  if (!FORCE && synced && synced.value === photo.attachment.signedPath) {
    return { sync: false, reason: 'ya sincronizado (idempotencia)' };
  }
  return { sync: true, reason: 'OK', photo };
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  log('info', `── inicio · ${APPLY ? 'APPLY' : 'DRY-RUN'} ${FORCE ? '(--force)' : ''} ${SKU_FILTER ? '· sku=' + SKU_FILTER : ''} ──`);
  assertCreds();

  const [wcProducts, nocoRecs] = await Promise.all([
    fetchAllWcProducts(),
    fetchAllNocoRecords(),
  ]);
  const wcIndex = buildWcIndex(wcProducts);

  let candidates = 0;
  let synced = 0;
  let skipped = 0;
  let errored = 0;

  for (const rec of nocoRecs) {
    const sku = (rec.SKU || '').trim().toUpperCase();
    if (!sku) continue;
    if (SKU_FILTER && sku !== SKU_FILTER) continue;
    const wcProd = findWcMatch(rec, wcIndex);
    const decision = shouldSync(wcProd, rec);
    if (!decision.sync) {
      skipped += 1;
      log('skip', `${sku} → ${decision.reason}`);
      continue;
    }
    candidates += 1;
    const { photo } = decision;
    log('plan', `${sku} → WC ${wcProd.id} (${wcProd.slug}) · subir ${photo.source}: ${photo.attachment.title}`);
    if (!APPLY) continue;
    try {
      const dl = await downloadNocoFile(photo.attachment);
      const productName = rec.Title || rec['Nombre interno'] || sku;
      const productSlug = (wcProd.slug || '').toLowerCase();
      const media = await uploadToWpMedia({
        buffer: dl.buffer,
        mimetype: dl.mimetype,
        sku,
        source: photo.source,
        productSlug,
        productName,
        material: rec.Material,
        linea: rec['Línea'],
        descripcion: rec['Descripción ritual'] || rec['Descripción interna'],
      });
      await updateWcProductImages(wcProd.id, media.id, photo.attachment.signedPath);
      synced += 1;
      log('done', `${sku} → media ${media.id} (${media.source_url ? media.source_url.split('/').pop() : '?'}) asignado a WC ${wcProd.id}`);
    } catch (e) {
      errored += 1;
      log('error', `${sku}: ${e.message}`);
    }
    // throttle para no martillar WP
    await sleep(800);
  }

  log('info',
    `── fin · candidatos=${candidates} subidos=${synced} ` +
    `saltados=${skipped} errores=${errored} ──`
  );
}

main().catch(e => {
  log('error', `crash: ${e.stack || e.message}`);
  process.exit(1);
});
