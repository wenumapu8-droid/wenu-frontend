#!/usr/bin/env node
// Lista VIVA de productos sin foto macro (drafts WC con img=0).
// Úsalo para saber QUÉ producto necesita foto AHORA, sin repetir los ya hechos.
// La verdad es WooCommerce live, no la memoria. Correr: node scripts/list-products-sin-macro.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
const WC = (process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3').replace(/\/$/, '');
const A = `consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;

const r = await fetch(`${WC}/products?status=draft&per_page=100&${A}`);
if (!r.ok) { console.error(`WC error ${r.status}`); process.exit(1); }
const ps = await r.json();
const sinMacro = ps.filter(p => !(p.images || []).length).sort((a, b) => a.id - b.id);
console.log(`PRODUCTOS SIN FOTO MACRO (draft, img=0): ${sinMacro.length}\n`);
for (const p of sinMacro) {
  const name = (p.name || '').replace(/&amp;/g, '&').slice(0, 46);
  console.log(`  wc#${String(p.id).padEnd(5)} $${String(p.price || '0').padEnd(4)} ${p.sku || '(sin SKU)'}  ${name}`);
}
console.log(`\n→ Estos esperan foto macro REAL del owner. Nunca uses foto AI para producto.`);
console.log(`→ Cuando el owner suba una macro, ese producto sale de esta lista solo.`);
