/**
 * KODEX is Ocin's archive, not a jewelry filter. Those products stay out of
 * /shop and /p/[slug] except CRT System 001, which is sold in the jewelry shop
 * even when WooCommerce files it under a Kodex category. It may not exist yet.
 */

const KODEX_CATEGORY = /^kodex(?:$|[-_])/i;

export function isKodexCategorySlug(slug) {
  return KODEX_CATEGORY.test(String(slug || ''));
}

export function isCrtSystem001(product) {
  const name = String(product?.name || '').trim();
  const slug = String(product?.slug || '').trim();
  return /^crt system 001$/i.test(name) || slug === 'crt-system-001';
}

/** True when the piece belongs in the jewelry catalogue and its PDP. */
export function includeInJewelryShop(product) {
  if (!product) return false;
  if (isCrtSystem001(product)) return true;
  const categories = Array.isArray(product.categories) ? product.categories : [];
  return !categories.some((category) => isKodexCategorySlug(category?.slug));
}
