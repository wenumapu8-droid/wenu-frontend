// Generate a metrics snapshot from WooCommerce Orders API.
// Run: node scripts/metrics-report.mjs
//
// Output: prints a summary table to stdout. Pipe to reports/ if needed.
// Requires WC_CONSUMER_KEY / WC_CONSUMER_SECRET in .env and a key with
// read_orders scope in WooCommerce REST API settings.
//
// Idempotent, read-only. Never writes to WooCommerce.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Load .env manually — no dotenv dependency needed
const envPath = resolve(process.cwd(), '.env');
try {
  const env = readFileSync(envPath, 'utf-8');
  for (const line of env.split('\n')) {
    const m = line.match(/^\s*([\w_]+)\s*=\s*(.*?)\s*$/);
    if (m) process.env[m[1]] = process.env[m[1]] || m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  // .env not found, rely on existing env vars
}

const WC_URL = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_KEY || !WC_SECRET) {
  console.error('Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET in .env');
  process.exit(1);
}

function auth() {
  return `consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
}

async function fetchOrders(status = 'completed') {
  const all = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const res = await fetch(
      `${WC_URL}/orders?per_page=${perPage}&page=${page}&status=${status}&${auth()}`
    );
    if (!res.ok) {
      if (res.status === 401) {
        console.error('Orders API returned 401. Does your WC key have read_orders scope?');
        console.error('Fix: WP Admin → WooCommerce → Settings → Advanced → REST API → edit key → check "Orders".');
        return null;
      }
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    all.push(...data);
    if (data.length < perPage) break;
    page++;
  }

  return all;
}

function formatUSD(n) {
  return `$${(n).toFixed(2)}`;
}

async function main() {
  // Try fetching orders — typically needs a separate read_orders key
  console.log('Fetching ALL orders (any status)...');
  const orders = await fetchOrders();
  if (!orders) process.exit(1);

  if (orders.length === 0) {
    console.log('(No orders found. The WC consumer key likely lacks read_orders scope.)\n');
    console.log('To enable orders metrics:');
    console.log('  1. WP Admin → WooCommerce → Settings → Advanced → REST API');
    console.log('  2. Create a new key with read_orders permission (and read_products if standalone)');
    console.log('  3. Add WC_ORDERS_CONSUMER_KEY / WC_ORDERS_CONSUMER_SECRET to .env\n');
  }

  // Fallback: show catalog metrics from products (uses existing read_products key)
  console.log('Fetching catalog metrics (products)...');
  let catalogProducts = [];
  const productRes = await fetch(
    `${WC_URL}/products?per_page=100&status=publish&${auth()}`
  );
  if (productRes.ok) {
    catalogProducts = await productRes.json();
    const prices = catalogProducts.map(p => parseFloat(p.price)).filter(n => !isNaN(n));
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const totalVal = prices.reduce((a, b) => a + b, 0);
    const byCategory = {};
    for (const p of catalogProducts) {
      const cat = p.categories?.[0]?.name || 'Uncategorized';
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    }

    console.log('\n── CATALOG METRICS ──');
    console.log(`Published products:  ${catalogProducts.length}`);
    console.log(`Avg price:           $${avgPrice.toFixed(2)}`);
    console.log(`Total catalog value: $${totalVal.toFixed(2)}`);
    console.log('By category:');
    for (const [cat, n] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${cat.padEnd(20)} ${n}`);
    }
    console.log();
  }

  // Save JSON report to reports/ (idempotent, overwrites per day)
  const { writeFileSync, mkdirSync } = await import('node:fs');
  const reportDir = resolve(process.cwd(), 'reports');
  mkdirSync(reportDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);
  const report = {
    date,
    catalog: {
      products: catalogProducts.length,
      productCount: catalogProducts.length,
    },
    orders: { total: orders.length, note: 'Requires WC key with read_orders scope' },
  };
  const reportPath = resolve(reportDir, `metrics-${date}.json`);
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved: ${reportPath}`);
}

main().catch(e => {
  console.error('Metrics report failed:', e.message);
  process.exit(1);
});
