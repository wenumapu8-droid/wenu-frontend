// Canonical LocalBusiness (JewelryStore) structured data — single source of
// truth for NAP (Name/Address/Phone) consistency across every page that emits
// local-business JSON-LD: /contact, /stockists, and local-SEO landing pages
// (e.g. /piercing-truckee). Centralized so Ocin never has three pages quietly
// drifting out of sync on phone/email/service area — that drift is exactly
// what confuses Google's Local Pack.
//
// Service-area business: NO public street address. Wenu Mapu has no shop/
// studio — private appointments + free local delivery, coordinated after
// booking (see CLAUDE.md / project_wenu_business_facts). Per Google's own
// guidance for service-area businesses, "address" is omitted entirely and
// "areaServed" carries the geography instead — do NOT add a PostalAddress
// with a locality here "just to have something"; that's the fake-address
// pattern Google explicitly penalizes.
//
// Canonical facts (do not invent/alter without checking the source):
//   name:      Wenu Mapu
//   phone:     +1 (408) 500-6211
//   email:     marimari@wenumapuonline.com
//   instagram: @wenu__mapu
//   model:     no storefront/studio — private appointments, free local
//              delivery, piercing by appointment in the Truckee / North Lake
//              Tahoe / Reno area (see /local, /piercing, /stockists copy).

export const WENU_NAME = 'Wenu Mapu';
export const WENU_URL = 'https://wenumapuonline.com';
export const WENU_EMAIL = 'marimari@wenumapuonline.com';
export const WENU_PHONE = '+1-408-500-6211';

// $$: reflects real pricing — piercing services run ~$25–$110 per session
// (see src/pages/piercing.astro `services`), jewelry pieces from ~$25 daily
// wear up to bespoke commissions. Not luxury-tier, not bargain-tier.
export const WENU_PRICE_RANGE = '$$';

/** Service-area cities/regions actually served today (see /local, /stockists,
 *  en.json `pickup.locations`, piercing.astro copy — Truckee / North Lake
 *  Tahoe / Reno is the recurring, verified area across the site). */
export const WENU_AREA_SERVED = [
  { '@type': 'City', name: 'Truckee', addressRegion: 'CA', addressCountry: 'US' },
  { '@type': 'Place', name: 'Lake Tahoe', addressRegion: 'CA', addressCountry: 'US' },
  { '@type': 'City', name: 'Tahoe City', addressRegion: 'CA', addressCountry: 'US' },
  { '@type': 'City', name: 'Kings Beach', addressRegion: 'CA', addressCountry: 'US' },
  { '@type': 'City', name: 'Reno', addressRegion: 'NV', addressCountry: 'US' },
];

/** Verified, live-linked profiles only. Instagram + Facebook are linked from
 *  the site footer (Footer.astro `socials`); the rest were already present in
 *  prior JSON-LD (not newly invented here) but are NOT linked anywhere in the
 *  site nav/footer — flagged for Ocin to confirm before relying on them. */
export const WENU_SAME_AS = [
  'https://instagram.com/wenu__mapu',
  'https://www.facebook.com/wenumapu8',
  'https://tiktok.com/@wenumapu',
  'https://pinterest.com/wenumapu',
  'https://www.behance.net/wenumapu',
];

export interface LocalBusinessLdOptions {
  /** Page-specific description (each page should have its own, matching its <meta name="description">). */
  description: string;
  /** Absolute image URL. Defaults to the site hero portrait. */
  image?: string;
  /** Override name, e.g. "Wenu Mapu — Piercing" for a service-specific sub-entity. */
  name?: string;
}

/** Builds the canonical JewelryStore JSON-LD object. Pass a page-specific
 *  description; everything else (NAP, area served, sameAs) stays identical
 *  across pages by design. */
export function buildLocalBusinessLd(opts: LocalBusinessLdOptions) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JewelryStore',
    name: opts.name || WENU_NAME,
    url: WENU_URL,
    email: WENU_EMAIL,
    telephone: WENU_PHONE,
    priceRange: WENU_PRICE_RANGE,
    image: opts.image || `${WENU_URL}/img/hero/hero-portrait-1200w.webp`,
    description: opts.description,
    areaServed: WENU_AREA_SERVED,
    sameAs: WENU_SAME_AS,
  };
}
