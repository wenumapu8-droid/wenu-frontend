import type { WooProduct } from './woo';
import { deriveForm, deriveDiameterMm } from './piercingForm';
import { FORM_PLACEMENTS, ringDiameterPlacements, PLACEMENTS } from '../data/placement-matrix';
import type { Placement } from '../data/placement-matrix';

export { PLACEMENTS };
export type { Placement };

/**
 * Layer 3: derive the full set of placements a product serves (many-to-many).
 * = form-based placements ∪ diameter-based placements (for rings/clickers)
 *   ∪ direct name signals (safety net).
 * Empty array → not piercing jewelry.
 */
export function classifyPlacements(p: WooProduct): Placement[] {
  const form = deriveForm(p);
  const h = `${p.slug} ${p.name}`.toLowerCase();
  const out = new Set<Placement>();

  if (form === 'ring' || form === 'clicker') {
    ringDiameterPlacements(deriveDiameterMm(p.name)).forEach(x => out.add(x));
  }
  (FORM_PLACEMENTS[form] ?? []).forEach(x => out.add(x));

  // Direct name signals — never miss the obvious ones.
  if (/septum/.test(h)) out.add('septum');
  if (/nostril/.test(h)) out.add('nostril');
  if (/navel|belly/.test(h)) out.add('navel');

  return [...out];
}

/** Categories that are NOT piercing jewelry (finger rings, earrings, decor…). */
const NON_PIERCING_CATS = /^(ring|earrings|necklace|art|accessories)$/i;

export interface TaggedProduct {
  product: WooProduct;
  placements: Placement[];
}

/**
 * Build the piercing-jewelry product list: every in-stock, imaged product that
 * maps to ≥1 placement and isn't a finger ring / earring / decor item.
 */
export function buildPiercingJewelry(all: WooProduct[]): TaggedProduct[] {
  return all
    .filter(p => p.images.length > 0 && p.images[0]?.src && p.status === 'publish')
    .filter(p => !p.categories.every(c => NON_PIERCING_CATS.test(c.slug)))
    .map(p => ({ product: p, placements: classifyPlacements(p) }))
    .filter(t => t.placements.length > 0);
}

/** Count products per placement (for chips), keeping only placements with ≥1. */
export function placementCounts(tagged: TaggedProduct[]): { key: Placement; label: string; count: number }[] {
  return PLACEMENTS
    .map(pl => ({
      ...pl,
      count: tagged.filter(t => t.placements.includes(pl.key)).length,
    }))
    .filter(pl => pl.count > 0);
}
