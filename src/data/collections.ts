// ─── THEMED COLLECTIONS ───────────────────────────────────────────────
// Single source of truth for the dynamic /collection/[slug] route.
//
// Each entry renders an editorial collection cover: a baked-title banner
// masthead + a short intro + an auto-populated product rail. The rail
// matches live WooCommerce products whose name/slug/sku/category/attribute
// text contains any `keywords` token. When nothing matches, the page shows
// a graceful "pieces coming to this collection" state + a CTA to /shop.
//
// HOW TO GROW A COLLECTION:
//   1. Add product-side signal in WooCommerce (a tag, attribute or the theme
//      word in the product name) so it gets picked up by `keywords`, OR
//   2. Add/adjust tokens in `keywords` below to capture existing products.
//
// COPY: `intro` strings are editorial drafts — refine freely. They are the
// only prose on the page besides the product names.
//
// NOTE (owner review): `india` and `maya` are externally-rooted theme names
// for a Mapuche-rooted brand. Kept because the banners exist, but confirm the
// intent/naming before public launch.

export interface ThemedCollection {
  /** URL slug → /collection/<slug> and banner filename in /img/banners/collection/ */
  slug: string;
  /** Big display name (the banner already carries a baked title; this drives <h1>, SEO, breadcrumbs) */
  title: string;
  /** Small eyebrow above the masthead-adjacent copy */
  eyebrow: string;
  /** One-sentence editorial intro (draft — editable) */
  intro: string;
  /** SEO meta description */
  description: string;
  /** Lowercase tokens matched against product name/slug/sku/categories/attributes */
  keywords: string[];
}

export const collections: ThemedCollection[] = [
  {
    slug: 'origin',
    title: 'Origin',
    eyebrow: 'COLLECTION · ORIGIN',
    intro: 'The core line — the forms the studio returns to. Where the language of Wenu Mapu begins.',
    description: 'Origin — the core line of Wenu Mapu. Hand-forged ritual body jewelry in titanium, silver and bronze.',
    keywords: ['origin', 'origen'],
  },
  {
    slug: 'atacama',
    title: 'Atacama',
    eyebrow: 'COLLECTION · ATACAMA',
    intro: 'Pieces carrying meteorite from the Atacama — fragments of sky pressed into the body.',
    description: 'Atacama — ritual rings and amulets set with Atacama meteorite. One-of-a-kind, numbered.',
    keywords: ['atacama', 'meteor', 'vacamuerta', 'meteorite'],
  },
  {
    slug: 'araucania',
    title: 'Araucanía',
    eyebrow: 'COLLECTION · ARAUCANÍA',
    intro: 'Rooted in the southern forest — the pewen, the volcanic line, the land that names the brand.',
    description: 'Araucanía — Mapuche-rooted ritual jewelry drawn from the southern forest and volcanic line.',
    keywords: ['araucania', 'araucan', 'pewen', 'wallmapu', 'mapu'],
  },
  {
    slug: 'solar',
    title: 'Solar',
    eyebrow: 'COLLECTION · SOLAR',
    intro: 'Antü — the sun. Pieces that hold light, warmth and the daytime sky.',
    description: 'Solar — sun-inspired hangers, pendants and ear pieces. Warm metals and radiant geometry.',
    keywords: ['solar', 'sun', 'antu', 'antü'],
  },
  {
    slug: 'neo',
    title: 'Neo',
    eyebrow: 'COLLECTION · NEO',
    intro: 'The newest silhouettes — sharper, more graphic. A campaign lane for the pieces pushing forward.',
    description: 'Neo — the newest, most graphic silhouettes from Wenu Mapu. Contemporary ritual body jewelry.',
    keywords: ['neo'],
  },
  {
    slug: 'ornamental',
    title: 'Ornamental',
    eyebrow: 'COLLECTION · ORNAMENTAL',
    intro: 'Filigree, greca and worked surface — adornment where the detail is the ritual.',
    description: 'Ornamental — filigree and greca-worked ritual jewelry. Detail-dense pieces in silver and bronze.',
    keywords: ['ornament', 'greca', 'filig', 'wood'],
  },
  {
    slug: 'organic',
    title: 'Organic',
    eyebrow: 'COLLECTION · ORGANIC',
    intro: 'Wood, bone, horn and seed — pieces grown from living material.',
    description: 'Organic — ritual body jewelry in wood, bone, horn and seed. Natural-material plugs, tunnels and weights.',
    keywords: ['organic', 'organ', 'wood', 'bone', 'horn', 'seed'],
  },
  {
    slug: 'fossil',
    title: 'Fossil',
    eyebrow: 'COLLECTION · FOSSIL',
    intro: 'Amber, ammonite and stone that remembers — deep time worn close.',
    description: 'Fossil — ritual jewelry set with amber, ammonite and fossil stone. Deep-time materials worn on the body.',
    keywords: ['fossil', 'fosil', 'amber', 'ammon', 'stone'],
  },
  {
    slug: 'india',
    title: 'India',
    eyebrow: 'COLLECTION · INDIA',
    intro: 'Dense, ceremonial ornamentation — heavy adornment for the ritual body.',
    description: 'India — densely ornamented ceremonial ritual jewelry. Heavy, detail-rich adornment.',
    keywords: ['india'],
  },
  {
    slug: 'maya',
    title: 'Maya',
    eyebrow: 'COLLECTION · MAYA',
    intro: 'Cosmic geometry and glyph-like form — symbol carried as adornment.',
    description: 'Maya — glyph-like, cosmic-geometry ritual jewelry. Symbolic adornment for the body.',
    keywords: ['maya'],
  },
];
