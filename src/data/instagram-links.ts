/**
 * instagram-links.ts — typed accessor over `instagram-product-map.json`
 * (repo root), which is the SINGLE SOURCE OF TRUTH for product ↔ Instagram
 * post pairings.
 *
 * Unified 2026-07-18 (task A2): this file used to duplicate a hand-picked
 * subset of the JSON with its own `confidence` field. That duplication meant
 * two places could drift. Now this file only reads and re-shapes the JSON —
 * it adds/removes/edits NOTHING. To change a pairing, edit
 * `instagram-product-map.json` at the repo root; this file picks it up
 * automatically on next build.
 *
 * REGLA DURA (owner, 2026-07-18): only `status: "CONFIRMED"` entries are
 * exposed here. `HELD` entries (e.g. the Guemil septum — a limited/custom
 * piece with no SKU) are intentionally excluded so they never get linked to
 * the wrong PDP.
 *
 * Consumers:
 *  - `src/components/ProductInstagramBlock.astro` (the rich "On Instagram"
 *    card on the PDP — task A2).
 *  - Anything else that wants "does this product have a confirmed IG post"
 *    can just check `instagramLinks[slug]`.
 */
import productMap from '../../instagram-product-map.json';

export interface InstagramLink {
  igUrl: string;
  /** Short caption from the real post — used as the excerpt on the PDP block. */
  caption: string;
  /** Internal post name from the source map (not shown in UI), kept for debugging. */
  igName?: string;
}

interface RawProductEntry {
  slug: string | null;
  igName: string;
  igUrl: string;
  caption: string;
  date?: string;
  status: 'CONFIRMED' | 'HELD' | string;
  verify?: string;
}

interface RawMap {
  profile: string;
  products: RawProductEntry[];
}

const raw = productMap as unknown as RawMap;

export const IG_PROFILE = raw.profile;

export const instagramLinks: Record<string, InstagramLink> = Object.fromEntries(
  raw.products
    .filter((e) => e.status === 'CONFIRMED' && !!e.slug)
    .map((e) => [e.slug as string, { igUrl: e.igUrl, caption: e.caption, igName: e.igName }]),
);
