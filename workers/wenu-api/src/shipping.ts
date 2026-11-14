/** US flat rate from Cart.astro (PR #196): $8 under $150, free from $150. */
export const SHIP_FLAT = 8;
export const SHIP_FREE_FROM = 150;

export function shippingFor(subtotal: number): number {
  if (subtotal > 0 && subtotal < SHIP_FREE_FROM) return SHIP_FLAT;
  return 0;
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
