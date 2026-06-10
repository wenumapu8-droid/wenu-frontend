#!/usr/bin/env node
/**
 * Crea 2 productos nuevos recuperados de _ERROR en NocoDB, Estado=SOLD OUT.
 *  - WM-EAR-020 Silver Claw Talon Drop Earrings (DSC_0547)
 *  - WM-OTH-006 Sanskrit Mantra Silver Cuff Bracelet (DSC_0093)
 * Sube la macro vía storage API, crea el registro, guarda backup reversible con los Ids.
 * Idempotente: si el SKU ya existe (consulta SQLite-independiente vía API list por SKU), aborta ese.
 * Uso: node scripts/create-error-products.mjs --apply   (sin --apply = dry-run)
 */
import fs from 'node:fs';

const BASE = process.env.NOCODB_URL;
const TABLE = process.env.NOCODB_TABLE_PIEZAS;
const TOKEN = process.env.NOCODB_TOKEN;
const APPLY = process.argv.includes('--apply');
if (!BASE || !TABLE || !TOKEN) { console.error('Faltan NOCODB_URL/TABLE_PIEZAS/TOKEN'); process.exit(1); }

const H = { 'xc-token': TOKEN };

const PRODUCTS = [
  {
    img: '/tmp/new-prod/WM-EAR-020-claw.jpg',
    fields: {
      title: 'Silver Claw Talon Drop Earrings',
      SKU: 'WM-EAR-020',
      Nombre_interno: 'Silver Claw Earrings',
      Nombre_ritual: 'Pangui Wili',
      Unidad_de_venta: 'Pair',
      Cantidad_stock: 0,
      Precio_venta_USD: 50,
      Estado: 'SOLD OUT',
      Material: 'Silver',
      Color: 'Silver',
      Tipo_de_pieza: 'Earring',
      Categoria: 'Earring',
      Packaging: 'Cloth bag',
      Linea: 'Neo',
      Descripcion_interna:
        'Pair of drop earrings cast as curved animal talons — a textured, feather/scale-patterned shoulder tapering into a polished silver-tone claw. Suspended from a slim coiled hook. Predator totem aesthetic, lightweight. Recovered macro, real product; currently no stock (available on request).',
      Descripcion_ritual:
        'Garra de plata. El colmillo curvo del depredador que camina en silencio — fuerza y protección colgando del oído.',
      Texto_redes:
        '🪶 SILVER CLAW TALON DROP EARRINGS ✨\n\nCurved animal talons cast in silver-tone metal, textured shoulder into a polished claw. Predator totem. Lightweight drop with coiled hook.\n\nShop: wenumapuonline.com\n\n#WenüMapü #ClawEarrings #TalonJewelry #TribalEarrings #SilverEarrings',
      Notas:
        'Recuperada de _ERROR (DSC_0547, thumb 094). Confirmada por dueño 2026-05-30: producto real, sin stock actual → SOLD OUT, disponible bajo pedido. Fotos del mismo producto: thumbs 084/085/091/093/094/096.',
    },
  },
  {
    img: '/tmp/new-prod/WM-OTH-006-bracelet.jpg',
    fields: {
      title: 'Sanskrit Mantra Silver Cuff Bracelet',
      SKU: 'WM-OTH-006',
      Nombre_interno: 'Sanskrit Beach Cuff',
      Nombre_ritual: 'Wirin Plata',
      Unidad_de_venta: 'Single',
      Cantidad_stock: 0,
      Precio_venta_USD: 45,
      Estado: 'SOLD OUT',
      Material: 'Silver',
      Color: 'Silver',
      Tipo_de_pieza: 'Bracelet',
      Categoria: 'Other',
      Packaging: 'Cloth bag',
      Linea: 'Neo',
      Descripcion_interna:
        'Adjustable open cuff bangle in silver-tone metal, engraved with Sanskrit mantra script around the band and a small triangular emblem inlay near the terminal. Brushed top edge, mirror-polished face. Coastal talisman piece — worn open-ended, fits most wrists. Recovered macro, real product; no current stock.',
      Descripcion_ritual:
        'Brazalete del mar. Mantra grabado en sánscrito sobre el metal, plegaria que rodea la muñeca como horizonte.',
      Texto_redes:
        '〰️ SANSKRIT MANTRA SILVER CUFF BRACELET ✨\n\nOpen cuff engraved with Sanskrit mantra and a triangular emblem. Brushed edge, polished face. Coastal talisman, adjustable.\n\nShop: wenumapuonline.com\n\n#WenüMapü #CuffBracelet #SanskritJewelry #MantraBracelet #SilverCuff',
      Notas:
        'Recuperada de _ERROR (DSC_0093, thumb 010). NUEVO — no estaba en inventario. Confirmada por dueño 2026-05-30: agregar + SOLD OUT (sin stock). Descripción dueño: brazalete "de playa" con escritura sánscrita.',
    },
  },
];

async function skuExists(sku) {
  const url = `${BASE}/api/v2/tables/${TABLE}/records?where=${encodeURIComponent(`(SKU,eq,${sku})`)}&limit=1`;
  try {
    const r = await fetch(url, { headers: H });
    if (!r.ok) return null; // list flaky → null = unknown
    const j = await r.json();
    return (j.list || []).length > 0;
  } catch { return null; }
}

async function uploadImage(path, sku) {
  const buf = fs.readFileSync(path);
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'image/jpeg' }), `${sku}_macro.jpg`);
  const r = await fetch(`${BASE}/api/v2/storage/upload`, { method: 'POST', headers: H, body: fd });
  if (!r.ok) throw new Error(`upload ${sku} HTTP ${r.status}: ${await r.text()}`);
  return await r.json(); // [{path,title,mimetype,size,...}]
}

async function createRecord(fields) {
  const r = await fetch(`${BASE}/api/v2/tables/${TABLE}/records`, {
    method: 'POST', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
  });
  if (!r.ok) throw new Error(`create HTTP ${r.status}: ${await r.text()}`);
  return await r.json();
}

const created = [];
for (const p of PRODUCTS) {
  const sku = p.fields.SKU;
  const exists = await skuExists(sku);
  if (exists === true) { console.log(`SKIP ${sku} (ya existe)`); continue; }
  if (!fs.existsSync(p.img)) { console.error(`FALTA imagen ${p.img}`); continue; }
  if (!APPLY) {
    console.log(`[dry-run] crearía ${sku} — ${p.fields.title} · ${p.fields.Estado} · $${p.fields.Precio_venta_USD} · img ${p.img}`);
    continue;
  }
  const att = await uploadImage(p.img, sku);
  const rec = await createRecord({ ...p.fields, Foto_macro: att });
  const id = rec.Id ?? rec.id ?? (Array.isArray(rec) ? rec[0]?.Id : undefined);
  created.push({ sku, id, title: p.fields.title });
  console.log(`CREADO ${sku} → id ${id}`);
}

if (APPLY && created.length) {
  const bk = `data/backups/error-products-created-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(bk, JSON.stringify(created, null, 2));
  console.log(`\nBackup reversible (Ids para borrar si hace falta): ${bk}`);
}
console.log(APPLY ? '\nLISTO.' : '\n(dry-run — corré con --apply para escribir)');
