// Configuration constants for store URLs. Centralized so the Fase C cutover
// (moving WooCommerce from www.wenumapuonline.com to shop.wenumapuonline.com)
// is a single env var change with zero code edits.
//
// To switch the store to a new host (e.g. shop. subdomain), set STORE_BASE_URL
// in .env locally and in Cloudflare Pages production env vars, then redeploy.

const DEFAULT_STORE_BASE = 'https://www.wenumapuonline.com';

/** Origin of the live WooCommerce store (where checkout/cart/account live).
 *  Falls back to the legacy www. host until Fase C cutover. */
export const STORE_BASE_URL: string =
  import.meta.env.STORE_BASE_URL || DEFAULT_STORE_BASE;

/** Public-facing cart URL. Used by Nav and fallback CTAs. */
export const STORE_CART_URL = `${STORE_BASE_URL}/cart`;

/** Build an "Add to cart" URL for a specific WooCommerce product id.
 *  Mirrors WC's `?add-to-cart=ID` query-param flow. */
export function addToCartUrl(productId: number): string {
  return `${STORE_BASE_URL}/cart/?add-to-cart=${productId}`;
}

/** Bare origin of the store, useful for <link rel="preconnect"> etc. */
export const STORE_ORIGIN = STORE_BASE_URL;
