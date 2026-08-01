// Build-time search index. Emitted as static /search-index.json.
// Fetched once by SearchModal on first open.

import { getProducts, formatPrice, localizeCategory, decodeEntities } from '../lib/woo';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const products = await getProducts();

  const index = products.map(p => {
    // Searchable haystack: name + slug words + category names + attributes
    // (material!) + a description snippet — so "meteorite" finds the Vacamuerta
    // rings even when their Woo name is in Spanish / says "Vacamuerta".
    const kw = [
      decodeEntities(p.name),
      (p.slug || '').replace(/-/g, ' '),
      ...p.categories.map(c => c.name),
      ...(p.attributes || []).flatMap(a => [a.name, ...(a.options || [])]),
      (p.short_description || p.description || '').replace(/<[^>]+>/g, ' ').slice(0, 200),
    ].join(' ').toLowerCase();
    return {
      id: p.id,
      slug: p.slug,
      name: decodeEntities(p.name),
      price: formatPrice(p.price),
      image: p.images[0]?.src || null,
      cat: p.categories[0] ? localizeCategory(p.categories[0]) : 'Jewelry',
      cats: p.categories.map(c => c.slug.toLowerCase()),
      kw,
    };
  });

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
