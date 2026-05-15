#!/usr/bin/env node
/**
 * Read-only audit for products that the Astro site will publish.
 * Writes a compact report to .runtime/visible-catalog-audit-<timestamp>.json.
 */

import fs from 'node:fs';
import path from 'node:path';

const scriptPath = new URL(import.meta.url).pathname;
const repoRoot = path.resolve(path.dirname(scriptPath), '../..');
const envPath = path.join(repoRoot, '.env');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] ||= m[2].trim();
  }
}

const WC_URL = (process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3').replace(/\/+$/, '');
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_KEY || !WC_SECRET) {
  console.error('Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET in .env');
  process.exit(1);
}

function authQS() {
  return `consumer_key=${encodeURIComponent(WC_KEY)}&consumer_secret=${encodeURIComponent(WC_SECRET)}`;
}

function clean(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchProducts() {
  const products = [];
  for (let page = 1; page <= 10; page += 1) {
    const res = await fetch(`${WC_URL}/products?per_page=100&page=${page}&status=publish&${authQS()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    products.push(...batch);
    if (batch.length < 100) break;
  }
  return products;
}

const products = await fetchProducts();

const genericNamePatterns = [
  /^handmade (plug|hanger|labret)/i,
  /^ear weights$/i,
  /^anillo/i,
  /^bronce/i,
  /^peso/i,
  /^tunel/i,
  /^expansion/i,
  /^producto/i,
];

const report = {
  createdAt: new Date().toISOString(),
  totalPublished: products.length,
  noPrice: [],
  noImage: [],
  noDescription: [],
  genericName: [],
  lowPrice: [],
};

for (const product of products) {
  const item = {
    id: product.id,
    sku: product.sku || '',
    name: clean(product.name),
    slug: product.slug,
    price: product.price || product.regular_price || '',
    imageCount: Array.isArray(product.images) ? product.images.length : 0,
    categorySlugs: (product.categories || []).map(c => c.slug),
  };

  const priceNum = Number(item.price);
  if (!item.price || Number.isNaN(priceNum) || priceNum <= 0) report.noPrice.push(item);
  if (item.imageCount === 0) report.noImage.push(item);
  if (!clean(product.description) && !clean(product.short_description)) report.noDescription.push(item);
  if (genericNamePatterns.some(pattern => pattern.test(item.name))) report.genericName.push(item);
  if (priceNum > 0 && priceNum < 20) report.lowPrice.push(item);
}

const runtimeDir = path.join(repoRoot, '.runtime');
fs.mkdirSync(runtimeDir, { recursive: true });
const outPath = path.join(runtimeDir, `visible-catalog-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log(`Published: ${report.totalPublished}`);
console.log(`No price: ${report.noPrice.length}`);
console.log(`No image: ${report.noImage.length}`);
console.log(`No description: ${report.noDescription.length}`);
console.log(`Generic name: ${report.genericName.length}`);
console.log(`Low price < $20: ${report.lowPrice.length}`);
console.log(`Report: ${outPath}`);

for (const [label, items] of [
  ['noDescription', report.noDescription],
  ['genericName', report.genericName],
  ['lowPrice', report.lowPrice],
]) {
  if (!items.length) continue;
  console.log(`\n${label}`);
  for (const item of items.slice(0, 25)) {
    console.log(`  ${item.id} · ${item.price || '-'} · ${item.name}`);
  }
}
