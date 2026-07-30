import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const payloadPath = path.join(root, 'kodex-source/printful-poc/printful-products-payload.json');

const WC_URL = (process.env.WC_API_URL || process.env.WOOCOMMERCE_API_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3').replace(/\/+$/, '');
const WC_KEY = process.env.WC_CONSUMER_KEY || process.env.WOOCOMMERCE_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET || process.env.WOOCOMMERCE_CONSUMER_SECRET;
const create = process.argv.includes('--create');

if (!WC_KEY || !WC_SECRET) {
  console.error('Missing WooCommerce credentials.');
  process.exit(1);
}

function authParams() {
  return new URLSearchParams({
    consumer_key: WC_KEY,
    consumer_secret: WC_SECRET,
  }).toString();
}

async function wc(pathname, options = {}) {
  const sep = pathname.includes('?') ? '&' : '?';
  const res = await fetch(`${WC_URL}${pathname}${sep}${authParams()}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${options.method || 'GET'} ${pathname}: HTTP ${res.status} ${JSON.stringify(body).slice(0, 800)}`);
  }
  return body;
}

const cats = await wc('/products/categories?slug=kodex&per_page=1');
const kodexCategoryId = cats[0]?.id;
if (!kodexCategoryId) throw new Error('Woo category slug kodex not found.');

const payload = JSON.parse(await fs.readFile(payloadPath, 'utf8'));
const results = [];

for (const item of payload.items) {
  const existing = await wc(`/products?sku=${encodeURIComponent(item.sku)}&status=any&per_page=1`);
  const request = {
    name: item.request.sync_product.name,
    type: 'simple',
    status: 'draft',
    catalog_visibility: 'hidden',
    sku: item.sku,
    regular_price: item.suggested_retail_price,
    description: [
      `<p>${item.title} printed as an enhanced matte poster.</p>`,
      `<p>KODEX archive by Ocin / Wenu Mapu. Prepared for Printful fulfillment; review before publishing.</p>`,
    ].join('\n'),
    short_description: `<p>KODEX print draft. ${item.size} enhanced matte poster.</p>`,
    categories: [{ id: kodexCategoryId }],
    images: [{ src: item.request.sync_product.thumbnail }],
    meta_data: [
      { key: '_wenu_lane', value: 'kodex' },
      { key: '_wenu_printful_variant_id', value: String(item.variant_id) },
      { key: '_wenu_printful_print_file_id', value: String(item.request.sync_variants[0].files[0].id) },
      { key: '_wenu_printful_cost', value: item.printful_cost },
      { key: '_wenu_printful_size', value: item.size },
      { key: '_wenu_printful_status', value: 'draft_pending_printful_sync' },
    ],
  };

  if (!create) {
    console.log(`${item.sku}: dry-run ${existing[0] ? `existing #${existing[0].id}` : 'new draft'} price ${item.suggested_retail_price}`);
    results.push({ sku: item.sku, dryRun: true, existingId: existing[0]?.id || null, request });
    continue;
  }

  const saved = existing[0]
    ? await wc(`/products/${existing[0].id}`, { method: 'PUT', body: JSON.stringify(request) })
    : await wc('/products', { method: 'POST', body: JSON.stringify(request) });
  console.log(`${item.sku}: saved Woo draft #${saved.id} (${saved.status}, ${saved.catalog_visibility})`);
  results.push({ sku: item.sku, dryRun: false, id: saved.id, status: saved.status, catalog_visibility: saved.catalog_visibility, permalink: saved.permalink });
}

const outPath = path.join(root, 'kodex-source/printful-poc/woo-print-drafts-manifest.json');
await fs.writeFile(outPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  create,
  note: 'Woo products are drafts, hidden, and assigned only to category slug kodex. They should not appear in the jewelry shop build.',
  items: results,
}, null, 2)}\n`);

console.log(`wrote ${path.relative(root, outPath)}`);
