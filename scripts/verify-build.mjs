// scripts/verify-build.mjs
//
// Postbuild assertion: a public ecommerce site must not ship empty.
// Refuses to pass if dist/p/ has fewer than MIN_PRODUCTS unless
// ALLOW_EMPTY_PRODUCTS=true is set explicitly.
//
// Run automatically as `npm run postbuild`.
// Intentional empty build: ALLOW_EMPTY_PRODUCTS=true npm run build

import { readdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// Lowered 2026-05-22 from 20 → 10. Current WC catalog has ~12 published; some
// recovered SKUs are still draft. Threshold of 10 still catches an empty/broken
// build but stops blocking deploys when the catalog dips below 20 temporarily.
const MIN_PRODUCTS = 10;
const dist = resolve('dist');
const productsDir = resolve('dist/p');
const allowEmpty = process.env.ALLOW_EMPTY_PRODUCTS === 'true';

if (!existsSync(dist)) {
  console.error('[verify-build] FAIL: dist/ does not exist. Run `npm run build` first.');
  process.exit(1);
}

let productCount = 0;
if (existsSync(productsDir)) {
  productCount = readdirSync(productsDir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .length;
}

if (allowEmpty) {
  console.warn(`[verify-build] WARNING: ALLOW_EMPTY_PRODUCTS=true — skipping catalog assertion (found ${productCount} products).`);
  process.exit(0);
}

if (productCount < MIN_PRODUCTS) {
  console.error(
    `[verify-build] FAIL: only ${productCount} product pages in dist/p/ — refusing to ship empty catalog.\n` +
    `  - Confirm WooCommerce API is reachable.\n` +
    `  - Confirm WC_CONSUMER_KEY / WC_CONSUMER_SECRET are valid.\n` +
    `  - For an intentional offline/dev build, set ALLOW_EMPTY_PRODUCTS=true.`
  );
  process.exit(1);
}

console.log(`[verify-build] OK: ${productCount} product pages built.`);
