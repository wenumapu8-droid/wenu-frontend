import fs from 'node:fs';
import path from 'node:path';

const envText = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
const vars = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((line) => !line.trim().startsWith('#') && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx), line.slice(idx + 1)];
    })
);

const base = vars.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const key = vars.WC_CONSUMER_KEY;
const secret = vars.WC_CONSUMER_SECRET;

if (!key || !secret) {
  throw new Error('Missing WC credentials in .env');
}

const withAuth = (qs) => `${base}/products?${qs}&consumer_key=${key}&consumer_secret=${secret}`;

const publishRes = await fetch(withAuth('status=publish&per_page=1'));
const draftRes = await fetch(withAuth('status=draft&per_page=1'));
const draftFullRes = await fetch(withAuth('status=draft&per_page=100'));
const draftItems = await draftFullRes.json();

const payload = {
  publish_total: Number(publishRes.headers.get('x-wp-total') || 0),
  draft_total: Number(draftRes.headers.get('x-wp-total') || 0),
  draft_items: draftItems.map((p) => ({
    id: p.id,
    sku: p.sku || '',
    price: p.price || '',
    stock_status: p.stock_status || '',
    imageCount: Array.isArray(p.images) ? p.images.length : 0,
    categoryNames: Array.isArray(p.categories) ? p.categories.map((c) => c.name) : [],
    descriptionLen: (p.description || '').length,
    shortDescriptionLen: (p.short_description || '').length,
    name: p.name || ''
  }))
};

console.log(JSON.stringify(payload, null, 2));
