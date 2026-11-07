/**
 * Jewelry shop filter tabs.
 *
 * WooCommerce publishes the same type under more than one slug (Spanish and
 * English, singular and the curated "Hangers / Weights" category). The shop
 * shows one tab per type and keeps every slug on `data-cat-aliases` so
 * /shop?cat=hanger still matches the merged tab.
 *
 * KODEX is a separate archive brand. Its categories are not jewelry filters.
 * CRT System 001 is a product exception (see kodexShop.mjs), not a tab.
 */

const HIDDEN = /^(?:uncategorized|sin-categorizar|kodex(?:[-_].*)?)$/i;

/** Alias slug → the slug that should own the tab when both exist. */
const ALIAS_TARGET = {
  hanger: 'hangers-weights',
  hangers: 'hangers-weights',
  pendiente: 'hangers-weights',
  pendientes: 'hangers-weights',
  septum: 'septum-en',
};

const TARGETS = new Set(Object.values(ALIAS_TARGET));

/**
 * @param {{ slug: string, name: string }[]} categories
 * @param {(cat: { slug: string, name: string }) => string} localize
 * @returns {{ slug: string, name: string, aliases: string }[]}
 */
export function shopFilterTabs(categories, localize) {
  /** @type {Map<string, { slug: string, name: string }[]>} */
  const groups = new Map();
  for (const category of categories) {
    const slug = String(category?.slug || '').trim();
    if (!slug) continue;
    if (HIDDEN.test(slug) || /uncategorized/i.test(category.name || '')) continue;
    const low = slug.toLowerCase();
    const target = ALIAS_TARGET[low];
    const key = target || (TARGETS.has(low) ? low : `label:${String(localize(category)).toLowerCase()}`);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(category);
  }

  const tabs = [];
  for (const [key, cats] of groups) {
    const preferred = cats.find((c) => c.slug.toLowerCase() === key) || cats[0];
    const aliases = [...new Set(cats.map((c) => c.slug))];
    tabs.push({
      slug: preferred.slug,
      name: localize(preferred),
      aliases: aliases.join(' '),
    });
  }
  return tabs;
}
