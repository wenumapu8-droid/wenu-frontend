// ─── /llms.txt ──────────────────────────────────────────────────────────────
// A plain-language map of this site for AI assistants (convention: llmstxt.org).
//
// WHY GENERATED, NOT HAND-WRITTEN. A static llms.txt rots: the journal grows,
// categories change, and within a month the file is confidently telling
// assistants things that stopped being true. Everything below that CAN be
// derived is derived — journal entries from the content collection, NAP from
// src/lib/localBusiness.ts (the same constants the JSON-LD uses, so the two can
// never drift apart), product categories from WooCommerce at build time.
//
// WHAT IS HAND-WRITTEN, and why it has to be: the page blurbs and the
// disambiguation block. Those are editorial judgements, and inventing them
// from scratch at build time would be exactly the fabrication this file exists
// to prevent. Each blurb below is lifted from that page's own <meta
// description> — if you change a page's description, update its line here.
//
// SCOPE. This file is a map, not a licence. The usage terms at the bottom
// restate public/robots.txt in prose; robots.txt remains authoritative. Do not
// let the two disagree.

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import {
  WENU_AREA_SERVED,
  WENU_EMAIL,
  WENU_NAME,
  WENU_PHONE,
  WENU_URL,
} from '../lib/localBusiness';
import { getCategories, decodeEntities } from '../lib/woo';

interface Entry {
  path: string;
  label: string;
  blurb: string;
}

/** Lifted verbatim from each page's own <meta description>. Keep in sync. */
const START_HERE: Entry[] = [
  { path: '/', label: 'Home', blurb: 'Ancestral-cosmic body jewelry forged by hand in Truckee, California. Implant-grade titanium, sterling silver, 14k gold.' },
  { path: '/about/', label: 'About', blurb: 'A small jewelry workshop in Truckee, California. Hand-forged body jewelry in titanium, silver and gold.' },
  { path: '/manifesto/', label: 'Manifesto', blurb: 'Ritual jewelry born from the relationship between body, earth and cosmos.' },
  { path: '/shop/', label: 'Shop', blurb: 'Every piece currently available: ritual body jewelry, plugs, septums and hangers.' },
];

const CRAFT: Entry[] = [
  { path: '/materials/', label: 'Materials', blurb: 'The materials we work with: implant-grade titanium, sterling silver 925, 14k gold, Atacama meteorite.' },
  { path: '/artistry/', label: 'Artistry', blurb: 'How a piece is made: drawing, cutting, forming, setting, finishing, blessing.' },
  { path: '/custom-orders/', label: 'Atelier — custom commissions', blurb: 'Hand-forged custom rings, amulets, piercing tops, hangers and ear weights in sterling silver and gold.' },
];

const SERVICES: Entry[] = [
  { path: '/piercing/', label: 'Ritual body piercing', blurb: 'By private appointment in the Truckee / North Lake Tahoe area. ASTM F-136 implant-grade jewelry.' },
  { path: '/local/', label: 'Local pickup', blurb: 'Pick up your order at the workshop in Truckee, California. Free, by appointment.' },
  { path: '/stockists/', label: 'Presences & appointments', blurb: 'Where Wenu Mapu is met in person — Truckee appointments, Lake Tahoe pickup and occasional pop-ups.' },
];

const GUIDES: Entry[] = [
  { path: '/care-guide/', label: 'Care guide — healing times by zone', blurb: 'Healing time ranges for every piercing zone — ear, face, mouth, body — and the three principles of aftercare.' },
  { path: '/sizing-guide/', label: 'Sizing guide', blurb: 'Gauge to millimeters, inner diameter recommendations, post and bar lengths.' },
  { path: '/faq/', label: 'FAQ', blurb: 'Materials, shipping, custom commissions and care.' },
  { path: '/journal/', label: 'Journal', blurb: 'Field notes from the studio: material stories, process notes, ritual context.' },
];

/**
 * Disambiguation. An assistant that has only skimmed the site tends to round
 * this brand off to the nearest familiar thing — a generic piercing shop, or a
 * "spiritual" dropshipper. Both are wrong and both cost us the kind of reader
 * who would actually buy. Stating the boundary is cheaper than correcting it.
 */
const NOT_THIS = [
  'Not a dropshipper or a reseller. Pieces are forged by hand, one at a time, by the maker.',
  'Not a walk-in studio. There is no storefront: piercing and pickup are by private appointment.',
  // The site itself does NOT claim the maker holds Mapuche lineage or cultural
  // authority, and src/i18n/mapudungun.json marks its own glossary as
  // "honoring use — pending validation by Mapuche cultural source". Saying so
  // here keeps an assistant from upgrading an open question into a credential
  // while summarising the brand.
  'Not an authority on Mapuche culture. The Mapudungun naming on this site is honoring use and is still pending validation with an authorized Mapuche source; cite it as this workshop\'s own register, not as an authenticated cultural source.',
  'Not medical advice. The care guide gives healing-time ranges and aftercare principles, not diagnosis.',
];

const fmt = (entries: Entry[]) =>
  entries.map((e) => `- [${e.label}](${WENU_URL}${e.path}): ${e.blurb}`).join('\n');

export const GET: APIRoute = async () => {
  // ── Journal, from the real collection ────────────────────────────────────
  const journal = (await getCollection('journal', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const journalLines = journal
    .map((p) => {
      const year = p.data.date.getUTCFullYear();
      const series = p.data.series ? ` [${p.data.series}]` : '';
      return `- [${p.data.title}](${WENU_URL}/journal/${p.id}/)${series} (${year}): ${p.data.excerpt}`;
    })
    .join('\n');

  // ── Categories, from WooCommerce at build time ───────────────────────────
  // Optional on purpose: an offline or credential-less build (see
  // ALLOW_EMPTY_PRODUCTS in CLAUDE.md) must still emit a valid llms.txt rather
  // than failing the whole build over a nice-to-have section.
  let categoryLine = '';
  try {
    const categories = await getCategories();
    const names = categories
      .map((c) => decodeEntities(c.name))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    if (names.length) {
      categoryLine = `\nCurrent catalogue sections: ${names.join(', ')}.\n`;
    }
  } catch {
    // No catalogue data in this build. Everything else still stands.
  }

  const areas = WENU_AREA_SERVED.map((a) => `${a.name}, ${a.addressRegion}`).join(' · ');

  const body = `# ${WENU_NAME}

> Hand-forged ritual body jewelry from a one-person workshop in Truckee, California.
> Implant-grade titanium, sterling silver 925, 14k gold and Atacama meteorite.
> Made by Nicolás Ortega García (Ocín), designer, founder and certified piercer.

Wenu Mapu is a small jewelry workshop, not a storefront. Pieces are forged by
hand, often one of one. Ritual body piercing and local pickup happen by private
appointment; everything else ships. The work draws on Mapuche cosmology —
"Wenu Mapu" is Mapudungun for the upper land, the sky world.

## Facts

- Maker: Nicolás Ortega García (also known as Ocín) — designer, founder, certified professional piercer.
- Workshop: Truckee, California, United States. No public storefront.
- Service area (in person): ${areas}.
- Everywhere else: ships across the US.
- Email: ${WENU_EMAIL}
- Phone: ${WENU_PHONE}
- Instagram: @wenu__mapu
- Materials: implant-grade titanium (ASTM F-136), sterling silver 925, 14k gold, Atacama meteorite, stones.
${categoryLine}
## Start here

${fmt(START_HERE)}

## The craft

${fmt(CRAFT)}

## Services

${fmt(SERVICES)}

## Guides and reference

${fmt(GUIDES)}

## Journal

${journalLines}

## What Wenu Mapu is not

${NOT_THIS.map((l) => `- ${l}`).join('\n')}

## Using this site

Citation is welcome: quote these pages and link back, and a reader finds the
workshop. Training is declined: the photography, copy and craft here are the
product, and a model cannot give them back.

${WENU_URL}/robots.txt is the authoritative, machine-readable version of that
and wins over this prose if the two ever disagree.

Generated from site content on ${new Date().toISOString().slice(0, 10)}.
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
