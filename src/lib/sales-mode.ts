// ─── SALES MODE ─────────────────────────────────────────────────────────────
// (Ocin 2026-07-13) One rule decides HOW a piece is sold on its PDP. It replaces
// the old `RESERVE_MIN_PRICE` price gate in `src/pages/p/[slug].astro`, which
// showed a Reserve/Claim button on anything over $200 — a price is not a reason
// to talk to a human.
//
// Three modes, and nothing else:
//
//   'cart'            → DEFAULT for all jewelry. Cart only. No second CTA.
//   'cart_concierge'  → premium pieces (solid 10k/14k gold, Atacama meteorite,
//                       hand-forged by Wenu Mapu) that ARE buyable. The cart is
//                       ALWAYS the primary CTA; underneath it, one small line of
//                       secondary text (a link, never a button of equal weight)
//                       opens the Inquire form for sizing / provenance / a
//                       private consultation.
//   'inquire'         → Art & Objects (WM-ART / WM-OTH), coming-soon, unpriced,
//                       sold-out, and hand-forged pieces with no cart. There is
//                       NO cart here: the Inquire form is the single, primary CTA.
//
// Guarantee: every page keeps exactly one primary CTA. A piece is never left
// without a way to act.

import type { WooProduct } from './woo';
import type { ResolvedSpecs } from './specs';

export type SalesMode = 'cart' | 'cart_concierge' | 'inquire';

// ─── OVERRIDES ──────────────────────────────────────────────────────────────
// Force the mode of a single piece, by SKU, in one line. Ocin edits ONLY this
// map — no other code needs touching.
//
//   const OVERRIDES = {
//     'WM-MET-004': 'cart_concierge',  // meteorite ring: keep the cart + concierge line
//     'WM-SIL-012': 'inquire',         // this one is sold in person only
//   };
//
// Safety rail: an override to 'inquire' is ALWAYS honoured (removing a cart is
// never dangerous). An override to 'cart' / 'cart_concierge' is honoured only if
// the piece can actually be bought (in stock, photographed, priced) — we never
// render a cart button for a piece that cannot be sold.
export const OVERRIDES: Record<string, SalesMode> = {};

// ─── SIGNALS ────────────────────────────────────────────────────────────────

/** Art & Objects: `WM-ART-*` / `WM-OTH-*` (the `WM-` prefix is optional). */
const ART_SKU_RE = /^(?:WM-)?(?:ART|OTH)-/i;

/** Karat marks that denote a real gold alloy. */
const KARAT_RE = /\b(?:9|10|14|18|22|24)\s?k\b/i;
/** Explicit "solid gold" phrasing, with or without a colour word. */
const SOLID_GOLD_RE = /\bsolid\s+(?:white\s+|yellow\s+|rose\s+)?gold\b/i;
/**
 * Gold that is NOT gold: plating, PVD, tone, vermeil, gold-filled. These pieces
 * are ordinary catalogue jewelry — they must stay on the plain cart. This guard
 * runs BEFORE the karat test, so "14k gold plated" can never claim solid gold.
 * (Canonical honesty rule — see handmade-vs-sourced / provenance notes.)
 */
const FAUX_GOLD_RE = /gold[\s-]?tone|gold[\s-]?plat|\bpvd\b|gold[\s-]?fill|vermeil|\bplated\b|\bplating\b/i;

/** Atacama / Vaca Muerta meteorite pieces (collab Jimmy). */
const METEORITE_RE = /vacamuerta|vaca\s?muerta|mesosiderite|meteorite|meteorito|atacama/i;

/** Fallback forge detection when the caller doesn't pass `origin`. Deliberately
 *  narrow — mirrors the conservative rule in the PDP: only wire-wrap documents
 *  Ocin's own hands. Everything else must come from the explicit `origin`. */
const FORGED_FALLBACK_RE = /wire[\s-]?wrap|wirewrap/i;

/** Solid gold = a karat mark or "solid gold", and no plating/tone/PVD language. */
function isSolidGold(text: string): boolean {
  if (!/gold|oro/i.test(text)) return false;
  if (FAUX_GOLD_RE.test(text)) return false;
  return KARAT_RE.test(text) || SOLID_GOLD_RE.test(text);
}

export interface SalesModeOpts {
  /** Provenance already resolved by the PDP (`hand-forged` / `handmade` = forged
   *  by Wenu Mapu). Passing it keeps this helper in sync with the page instead of
   *  re-inferring provenance a second, divergent way. */
  origin?: string;
}

/** The single copy line rendered under the cart in `cart_concierge`. */
export const CONCIERGE_LINE =
  'Prefer white-glove service? Sizing, provenance or a private consultation — write to us →';

/**
 * Decide how a piece is sold. Pure function of the Woo product + resolved specs.
 */
export function salesMode(
  product: WooProduct,
  specs: ResolvedSpecs,
  opts: SalesModeOpts = {},
): SalesMode {
  const sku = (product.sku || '').trim();

  // Forged by Wenu Mapu (hand-forged / handmade). `collab-jimmy` is Jimmy's work,
  // not the studio's — it earns concierge through the meteorite signal instead.
  const origin = opts.origin || '';
  const isForged = origin
    ? origin === 'hand-forged' || origin === 'handmade'
    : FORGED_FALLBACK_RE.test(`${product.name} ${product.slug}`);

  // ── Buyability. Mirrors the PDP's stock gate exactly: a piece is addable to
  // the cart only when it is in stock, photographed (no photo → "coming soon"),
  // priced, and not made-to-order.
  const hasImage = (product.images?.length ?? 0) > 0;
  const priceNum = parseFloat(product.price || '0') || 0;
  const purchasable =
    product.stock_status === 'instock' && hasImage && priceNum > 0 && !isForged;

  // ── Override (see OVERRIDES above). 'inquire' always wins; a cart mode is only
  // granted to a piece that can actually be sold.
  const forced = sku ? OVERRIDES[sku] : undefined;
  if (forced === 'inquire') return 'inquire';
  if (forced && product.stock_status === 'instock' && hasImage && priceNum > 0) {
    return forced;
  }

  // ── Art & Objects are never a cart. They are a conversation.
  if (ART_SKU_RE.test(sku)) return 'inquire';

  // ── Anything that cannot be bought: the form is the only CTA.
  if (!purchasable) return 'inquire';

  // ── Premium, buyable → cart first, concierge line second.
  const signals = [
    product.name,
    product.slug,
    sku,
    specs.material || '',
    specs.materialShort || '',
    specs.technique || '',
    ...product.categories.map(c => `${c.slug} ${c.name}`),
  ].join(' ');

  if (isSolidGold(signals)) return 'cart_concierge';
  if (METEORITE_RE.test(signals)) return 'cart_concierge';
  // NOTE on hand-forged: a forged piece is made to order, so it is never
  // `purchasable` above and lands in 'inquire' — which is the correct default
  // ("hand-forged without a cart"). The day a forged piece DOES get a cart, give
  // it `'cart_concierge'` in OVERRIDES and it renders cart-first + concierge line.

  // ── Default: the cart, and nothing else.
  return 'cart';
}
