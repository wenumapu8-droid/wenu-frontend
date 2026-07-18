/**
 * Curated UTILITY lists — New Arrivals · Limited Objects · Stones & One of One.
 *
 * NOTE: these are utility curations, NOT brand collections. The real brand
 * collections (Origin, Atacama, Araucanía, Solar, Neo, Ornamental, Organic,
 * Fossil, India, Maya) live in `src/data/collections.ts` and render via
 * `/collection/[slug]` with their own banners — do not reinvent those here.
 *
 * CURATED-SLUG model: each list is hand-picked product SLUGS. A pick with
 * `pending:true` reserves a slot for a piece not yet published in WooCommerce.
 */

export interface Pick {
  slug?: string;
  name: string;
  pending?: boolean;
  note?: string;
}

export interface EditorialCollection {
  key: string;
  eyebrow: string;
  title: string;
  intro: string;
  ctaLabel: string;
  ctaHref: string;
  avif: string;
  webp: string;
  picks: Pick[];
}

export const NEW_ARRIVALS: EditorialCollection = {
  key: 'new-arrivals',
  eyebrow: 'Just landed',
  title: 'New Arrivals',
  intro: "The newest pieces to enter the archive — handmade hangers, stone for the journey, and the first work of the current cycle. Forged one at a time, often gone in days.",
  ctaLabel: 'Shop all pieces',
  ctaHref: '/shop',
  avif: '/img/banners/atmospheric/mountain-starfield.avif',
  webp: '/img/banners/atmospheric/mountain-starfield.webp',
  picks: [
    { slug: 'alai-wakan-articulated-triangle-hanger-bronze-alpaca-jump-link', name: 'Alai Wakan — Articulated Triangle Hanger' },
    { slug: 'alai-wakan-triangle-dart-hanger-with-labradorite-bronze-alpaca', name: 'Alai Wakan — Dart Hanger with Labradorite' },
    { slug: 'alai-wakan-triangle-dart-hanger-bronze-alpaca', name: 'Alai Wakan — Triangle Dart Hanger' },
    { slug: 'handmade-hanger-surgical-steel-10mm', name: 'Witral Vilu Hanger' },
    { slug: 'ammonite-wood-teardrop-plug-20mm-pair-brass-inlay', name: 'Ammonite Wood Teardrop Plug 20mm' },
    { slug: 'gold-triangle-hoop-with-raw-amethyst-wire-wrap', name: 'Gold Triangle Hoop with Raw Amethyst' },
    { slug: 'fluorite-stone-plug-16mm-pair', name: 'Fluorite Stone Plug 16mm Pair' },
    { slug: 'septum-anillos-6mm-2', name: '6mm Gold Titanium Septum Ring' },
    { slug: 'titanium-snake-labret-16g-silver-tone-large-textured', name: 'Titanium Snake Labret 16G (large)' },
  ],
};

export const LIMITED_OBJECTS: EditorialCollection = {
  key: 'limited-objects',
  eyebrow: 'One-of-one · Carried, then gone',
  title: 'Limited Objects',
  intro: "The rarest of the archive — cast, wrapped and fallen from the sky. Meteorite rings, hand-cast bronze, stone wrapped by Nico. Most are a single piece: once it's carried, it's gone. Some are still coming to the catalogue.",
  ctaLabel: 'Commission something rare',
  ctaHref: '/custom-orders',
  avif: '/img/banners/cosmic/cosmos-field-1200w.avif',
  webp: '/img/banners/cosmic/cosmos-field-900w.webp',
  picks: [
    { slug: 'jimmy-atacama-meteorite-ring-19mm-casting', name: 'Jimmy — Atacama Meteorite Ring 19mm' },
    { slug: 'jimmy-atacama-meteorite-ring-17-5mm-casting', name: 'Jimmy — Atacama Meteorite Ring 17.5mm' },
    { slug: 'ritual-ring-vacamuerta-n-3-sterling-silver-atacama-meteorite', name: 'Ritual Ring Vacamuerta Nº3 — Meteorite' },
    { slug: 'ritual-ring-no-19-sterling-silver-atacama-meteorite-vacamuerta', name: 'Ritual Ring No. 19 — Meteorite' },
    { slug: 'galo-escultor-bronze-ant-miniature-sculpture-1-casting-mexico', name: 'Galo Escultor — Bronze Ant Sculpture #1' },
    { slug: 'alai-wakan-articulated-triangle-hanger-bronze-alpaca-jump-link', name: 'Alai Wakan — Articulated Triangle Hanger' },
    { slug: 'alai-wakan-triangle-dart-hanger-with-labradorite-bronze-alpaca', name: 'Alai Wakan — Dart Hanger with Labradorite' },
    { slug: 'ammonite-wood-teardrop-plug-20mm-pair-brass-inlay', name: 'Ammonite Wood Teardrop Plug 20mm' },
    { slug: 'jimmy-atacama-meteorite-ring-18-5mm-casting', name: 'Jimmy — Atacama Meteorite Ring 18.5mm' },
    { slug: 'jimmy-atacama-meteorite-ring-16mm-casting', name: 'Jimmy — Atacama Meteorite Ring 16mm' },
    { slug: 'labradorite-wire-wrapped-pendant-gold-silver-mont-shasta', name: 'Labradorite Wire-Wrapped Pendant (Mont Shasta)' },
    { slug: 'ammonite-fossil-hanger-silver', name: 'Ammonite Fossil Hanger (silver)' },
    { slug: 'ancient-picoyo-pendant-with-silver-inlays', name: 'Ancient Picoyo Pendant with Silver Inlays' },
    { name: 'Moonstone Teardrop Wire-Wrapped Pendant', pending: true, note: 'Wire-wrapped by Nico — coming to the catalogue' },
    { name: 'Galo Escultor — Ornamental Gold Bronze Skull', pending: true, note: 'Casting · one-of-one — coming to the catalogue' },
  ],
};

export const STONES_ONE_OF_ONE: EditorialCollection = {
  key: 'stones-one-of-one',
  eyebrow: 'Stone · One-of-one',
  title: 'Stones & One of One',
  intro: "Stone remembers. Obsidian, labradorite, jade and fluorite worked for the stretched body, alongside the singular pieces — meteorite cast into a ring, fossil held in silver. Earth and sky, worn close.",
  ctaLabel: 'See the full catalogue',
  ctaHref: '/shop',
  avif: '/img/banners/atmospheric/misty-ridge.avif',
  webp: '/img/banners/atmospheric/misty-ridge.webp',
  picks: [
    { slug: 'black-obsidian-stone-plugs-12mm-25mm', name: 'Black Obsidian Stone Plugs' },
    { slug: 'silver-sheen-obsidian-stone-plugs-16mm', name: 'Silver Sheen Obsidian Plugs 16mm' },
    { slug: 'fluorite-stone-plug-16mm-pair', name: 'Fluorite Stone Plug 16mm Pair' },
    { slug: 'jade-stone-plug-16mm-pair', name: 'Jade Stone Plug 16mm Pair' },
    { slug: 'white-stone-plug-14mm-pair-moonstone-or-white-agate', name: 'White Stone Plug 14mm (Moonstone / Agate)' },
    { slug: 'amethyst-stone-ear-stretchers-22mm', name: 'Amethyst Stone Ear Stretchers 22mm' },
    { slug: 'stone-plug-10mm-wm-plg-015', name: 'Labradorite Stone Plug Collection' },
    { slug: 'jimmy-atacama-meteorite-ring-19mm-casting', name: 'Jimmy — Atacama Meteorite Ring 19mm' },
    { slug: 'ritual-ring-vacamuerta-n-3-sterling-silver-atacama-meteorite', name: 'Ritual Ring Vacamuerta Nº3 — Meteorite' },
    { slug: 'ammonite-wood-teardrop-plug-20mm-pair-brass-inlay', name: 'Ammonite Wood Teardrop Plug 20mm' },
  ],
};
