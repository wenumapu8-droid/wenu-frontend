// ─── DERIVED PRODUCT SPECS ──────────────────────────────────────────────────
// The WooCommerce catalog ships NO structured attributes (the `attributes`
// array is empty on every product). All the per-piece data Ocin loaded lives
// inside the product NAME, the SKU, the categories, the weight field and the
// description. This helper parses that into a differentiated spec sheet so each
// PDP shows real, piece-specific info instead of a generic template.
//
// Detectors are keyword/regex based and intentionally conservative: each field
// returns null when nothing is found, so the PDP only renders rows that carry
// real data. Honest-by-default — never invents a value.

import { decodeEntities } from './woo';
import type { WooProduct } from './woo';

export interface DerivedSpecs {
  material: string | null;
  materialShort: string | null;
  size: string | null;
  weight: string | null;
  dimensions: string | null;
  stone: string | null;
  finish: string | null;
  color: string | null;
  technique: string | null;
  soldAs: string;
  isPair: boolean;
}

// Material families — each carries a long editorial line (Spec table) and a
// short label (hero caption + ritual-context grid). Order = display priority;
// capped to the top 2 matches so a "Silver Titanium" piece reads cleanly.
//
// Honesty rules baked into the regexes:
//   - "silver" / "gold" are matched on their own (most names just say "Silver
//     Ring" / "Gold Hoop"), BUT a negative lookahead drops "silver-tone" /
//     "gold-tone" — those describe the FINISH of another metal (e.g. a
//     PVD-coated titanium septum), not a precious-metal body.
//   - The "14k gold — heirloom-grade" claim is reserved for names that actually
//     say 14k. A plain "gold" piece is labeled the honest "Gold-tone" instead,
//     so a fashion gold-plated chain never claims solid-gold provenance.
const MATERIALS: { re: RegExp; long: string; short: string }[] = [
  { re: /\bsterling\b|\b925\b|\b950\b|\bplata\b|\bsilver\b(?!-?tone)/, long: 'Sterling silver — pure, durable, alive with light.', short: 'Sterling silver' },
  { re: /\b14k\b|14\s?k\b|\boro\b/,                                    long: '14k gold — heirloom-grade, warm, made to outlast the wearer.', short: '14k gold' },
  { re: /\bgold\b(?!-?tone)/,                                          long: 'Gold-tone — warm, luminous metal.', short: 'Gold-tone' },
  { re: /titanium|titanio/,                                           long: 'ASTM F-136 implant-grade titanium — hypoallergenic, lightweight.', short: 'Titanium' },
  { re: /vacamuerta|meteorite|meteorito|atacama/,                     long: 'Vaca Muerta mesosiderite — rare stony-iron meteorite from Chile’s Atacama Desert.', short: 'Atacama meteorite' },
  { re: /surgical steel|stainless|\bsteel\b/,                         long: 'Surgical-grade steel — strong, body-tolerant, easy to wear.', short: 'Surgical steel' },
  { re: /alpaca|nickel silver/,                                       long: 'Alpaca (nickel silver) — bright ancestral alloy, worked by hand.', short: 'Alpaca' },
  { re: /\bbrass\b|\bbronze\b|laton|latón|bronce/,                    long: 'Brass & bronze — bold ancestral metals with deep tribal roots.', short: 'Brass & bronze' },
  { re: /walnut|\bwood\b|madera|padauk/,                              long: 'Walnut & tropical wood — sustainably sourced, warm, grounded.', short: 'Wood' },
  { re: /\bresin\b/,                                                  long: 'Resin — hand-poured, lightweight, vivid in the light.', short: 'Resin' },
];

/** Resolve up to 2 material families. The 14k and plain-gold rules are mutually
 *  exclusive in practice (a "14k Gold" name matches the 14k row first, and the
 *  plain-gold row is skipped once gold is already represented). */
function deriveMaterial(text: string): { long: string | null; short: string | null } {
  const hits: { long: string; short: string }[] = [];
  let hasGold = false;
  for (const m of MATERIALS) {
    if (!m.re.test(text)) continue;
    const isGold = m.short === '14k gold' || m.short === 'Gold-tone';
    if (isGold && hasGold) continue; // never show both "14k gold" and "Gold-tone"
    if (isGold) hasGold = true;
    hits.push({ long: m.long, short: m.short });
    if (hits.length >= 2) break;
  }
  if (!hits.length) return { long: null, short: null };
  return {
    long: hits.map(h => h.long).join(' · '),
    short: hits.map(h => h.short).join(' · '),
  };
}

const STONES: { re: RegExp; name: string }[] = [
  { re: /labradorite/, name: 'Labradorite' },
  { re: /turquoise/, name: 'Turquoise' },
  { re: /\bopal/, name: 'Opal' },
  { re: /tiger'?s?\s?eye/, name: 'Tiger eye' },
  { re: /fluorite/, name: 'Fluorite' },
  { re: /\bjade\b/, name: 'Jade' },
  { re: /moonstone/, name: 'Moonstone' },
  { re: /\bagate\b/, name: 'Agate' },
  { re: /amethyst/, name: 'Amethyst' },
  { re: /obsidian/, name: 'Obsidian' },
  { re: /ammonite/, name: 'Ammonite' },
  { re: /\bquartz\b/, name: 'Quartz' },
  { re: /\bonyx\b/, name: 'Onyx' },
  { re: /jasper/, name: 'Jasper' },
  { re: /malachite/, name: 'Malachite' },
  { re: /lapis/, name: 'Lapis lazuli' },
  { re: /\bamber\b/, name: 'Amber' },
];

const FINISHES: { re: RegExp; name: string }[] = [
  { re: /oxidi[sz]ed/, name: 'Oxidized' },
  { re: /\bpolished\b/, name: 'Polished' },
  { re: /\bpvd\b/, name: 'PVD coated' },
  { re: /anodi[sz]ed/, name: 'Anodized' },
  { re: /brushed/, name: 'Brushed' },
  { re: /\bmatte\b/, name: 'Matte' },
  { re: /hammered/, name: 'Hammered' },
  { re: /iridescent/, name: 'Iridescent' },
  { re: /gold-?tone/, name: 'Gold-tone' },
  { re: /silver-?tone/, name: 'Silver-tone' },
];

// Construction techniques — genuinely differentiating, and distinct from the
// Origin row (which carries hand-forged / curated provenance). "forged" is left
// out on purpose to avoid duplicating Origin.
const TECHNIQUES: { re: RegExp; name: string }[] = [
  { re: /wire[- ]?wrap/, name: 'Wire-wrapped' },
  { re: /\bcasting\b|lost-?wax/, name: 'Lost-wax casting' },
  { re: /internally threaded|internal thread/, name: 'Internally threaded' },
  { re: /threadless/, name: 'Threadless' },
  { re: /clicker|hinged/, name: 'Hinged clicker' },
  { re: /\binlay\b|inlaid/, name: 'Inlay' },
  { re: /articulat/, name: 'Articulated' },
  // NOTE: only English "woven" — the Mapudungun "witral" appears in ritual
  // names (short_description) and would mislabel cast/assembled pieces.
  { re: /\bwoven\b/, name: 'Hand-woven' },
];

// Color palette — only words that read as a finish/color descriptor on a piece.
// Metals (silver/gold) are deliberately excluded; they belong to Material.
const COLORS: { re: RegExp; name: string }[] = [
  { re: /\bblack\b/, name: 'Black' },
  { re: /\bblue\b/, name: 'Blue' },
  { re: /\bwhite\b/, name: 'White' },
  { re: /\bpurple\b/, name: 'Purple' },
  { re: /\bred\b/, name: 'Red' },
  { re: /\bgreen\b/, name: 'Green' },
  { re: /\bpink\b/, name: 'Pink' },
  { re: /rainbow/, name: 'Rainbow' },
];

function joinMatches<T extends { re: RegExp; name: string }>(list: T[], text: string, cap = 3): string | null {
  const out: string[] = [];
  for (const item of list) {
    if (item.re.test(text) && !out.includes(item.name)) out.push(item.name);
    if (out.length >= cap) break;
  }
  return out.length ? out.join(' · ') : null;
}

/** Parse size / gauge tokens out of the product name. Consumes matched spans so
 *  "1.2x8mm" doesn't also surface a stray "8 mm". Order: gauge×length, gauge,
 *  plain mm. Caps at 3 tokens to keep the row scannable. */
function deriveSize(name: string): string | null {
  let s = ` ${name} `;
  const out: string[] = [];
  s = s.replace(/\b(\d+(?:\.\d+)?)\s?[x×]\s?(\d+(?:\.\d+)?)\s?mm\b/gi, (_m, a, b) => {
    out.push(`${a}×${b} mm`);
    return ' ';
  });
  s = s.replace(/\b(00g|\d{1,2}g)\b/gi, (_m, g) => {
    out.push(g.toUpperCase());
    return ' ';
  });
  s = s.replace(/\b(\d+(?:\.\d+)?)\s?mm\b/gi, (_m, n) => {
    out.push(`${n} mm`);
    return ' ';
  });
  const uniq = [...new Set(out)].slice(0, 3);
  return uniq.length ? uniq.join(' · ') : null;
}

/** Weight field is in kilograms. Render in grams, with a "(pair)" note when the
 *  piece is sold as a pair so the number reads honestly. */
function deriveWeight(product: WooProduct, isPair: boolean): string | null {
  const kg = parseFloat(product.weight || '');
  if (!Number.isFinite(kg) || kg <= 0) return null;
  const grams = kg * 1000;
  const num = grams.toLocaleString('en-US', { maximumFractionDigits: grams < 1 ? 1 : 0 });
  return `${num} g${isPair ? ' (pair)' : ''}`;
}

function deriveDimensions(product: WooProduct): string | null {
  const d = product.dimensions;
  if (!d) return null;
  const parts = [d.length, d.width, d.height].map(v => (v || '').trim()).filter(Boolean);
  return parts.length ? `${parts.join(' × ')} cm` : null;
}

export function deriveSpecs(product: WooProduct): DerivedSpecs {
  const name = decodeEntities(product.name || '');
  const isPair = /\bpair\b|\bpar\b/i.test(name);

  // All detectors read the structured English NAME (+ slug, sku, categories) —
  // never the descriptions. The short_description is a Mapudungun ritual name
  // and the description is Spanish poetry; both mention materials/techniques
  // metaphorically ("plata", "telar", "witral") and would produce dishonest
  // spec rows. The product name is the authoritative, structured source.
  const nameText = [
    name,
    product.slug,
    product.sku,
    ...product.categories.flatMap(c => [c.slug, c.name]),
  ].join(' ').toLowerCase();
  const fullText = nameText;

  const material = deriveMaterial(fullText);

  const soldAs =
    product.manage_stock && product.stock_quantity === 1 ? 'One of one' :
    isPair ? 'Pair' :
    'Single piece';

  return {
    material: material.long,
    materialShort: material.short,
    size: deriveSize(name),
    weight: deriveWeight(product, isPair),
    dimensions: deriveDimensions(product),
    stone: joinMatches(STONES, fullText),
    finish: joinMatches(FINISHES, fullText),
    color: joinMatches(COLORS, nameText),
    technique: joinMatches(TECHNIQUES, fullText),
    soldAs,
    isPair,
  };
}
