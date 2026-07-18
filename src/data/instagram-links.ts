/**
 * instagram-links.ts — optional per-product Instagram post URL, keyed by slug.
 *
 * Purpose: power the discreet "See it on Instagram" link on the PDP
 * (src/pages/p/[slug].astro). A product only shows the link when its slug
 * has an entry here — never invented, never guessed at render time.
 *
 * Source: seeded 2026-07-18 from `instagram-product-map.json` (repo root),
 * built by reading the real, logged-in @wenu__mapu profile. Each entry below
 * is a REAL post URL. `confidence` carries over from that source so a human
 * can prioritize review — MEDIUM entries have a matching product/post NAME
 * but an unconfirmed detail (color/variant); HIGH/MEDIUM-HIGH are solid.
 *
 * To add more: paste a confirmed slug + post URL below. To remove a shaky
 * match: delete the entry (the PDP link simply stops rendering for it).
 */
export interface InstagramLink {
  igUrl: string;
  /** carried over for humans reviewing this file — not read by the UI */
  confidence: 'HIGH' | 'MEDIUM-HIGH' | 'MEDIUM';
  reviewNote?: string;
}

export const instagramLinks: Record<string, InstagramLink> = {
  'solar-light-weight-tunnel-flower-of-life-14mm': {
    igUrl: 'https://www.instagram.com/wenu__mapu/p/DXo9Lh6FCfx/',
    confidence: 'HIGH',
  },
  'titanium-starburst-north-star-labret-16g-gold-tone-central-cz': {
    igUrl: 'https://www.instagram.com/wenu__mapu/p/DXo9u86lAJZ/',
    confidence: 'MEDIUM-HIGH',
  },
  'crown-spine-hangers-10mm': {
    igUrl: 'https://www.instagram.com/wenu__mapu/p/DXjy_gYlB9K/',
    confidence: 'MEDIUM',
    reviewNote:
      "Confirm: 'Teal Resin Hexagon Hangers' (this slug) vs 'Polished Hexagonal Magnetic Hanger' — the post shows a teal hexagonal hanger.",
  },
  'trinity-cluster-blue-cz-labret-top-titanium-16g': {
    igUrl: 'https://www.instagram.com/wenu__mapu/p/DXYUyLBlJvx/',
    confidence: 'MEDIUM',
    reviewNote:
      "Name 'Trinity Cluster' matches; the post caption says EMERALD (green) but this SKU is blue CZ — confirm variant with the owner.",
  },
};
