// Configuration constants for store URLs. Centralized so the Fase C cutover
// (moving WooCommerce from www.wenumapuonline.com to shop.wenumapuonline.com)
// is a single env var change with zero code edits.
//
// To switch the store to a new host (e.g. shop. subdomain), set STORE_BASE_URL
// in .env locally and in Cloudflare Pages production env vars, then redeploy.

const DEFAULT_STORE_BASE = 'https://www.wenumapuonline.com';

/** Origin of the live WooCommerce store host (product data source / CDN).
 *  Falls back to the legacy www. host until Fase C cutover. Kept ONLY as the
 *  product-image origin for <link rel="preconnect"> — no checkout/cart/account
 *  affordance links here anymore. The new site is guest-checkout (see Cart.astro,
 *  ReserveModal.astro, /account); nothing routes buyers to the legacy WooCommerce
 *  cart/my-account. STORE_CART_URL + addToCartUrl were removed 2026-07-10. */
export const STORE_BASE_URL: string =
  import.meta.env.STORE_BASE_URL || DEFAULT_STORE_BASE;

/** Bare origin of the store, useful for <link rel="preconnect"> etc. */
export const STORE_ORIGIN = STORE_BASE_URL;
