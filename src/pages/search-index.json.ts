// Build-time search index. Emitted as static /search-index.json.
// Fetched once by SearchModal on first open.

import { getProducts, formatPrice, localizeCategory, decodeEntities } from '../lib/woo';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const products = await getProducts(100);

  const index = products.map(p => ({
    id: p.id,
    slug: p.slug,
    name: decodeEntities(p.name),
    price: formatPrice(p.price),
    image: p.images[0]?.src || null,
    cat: p.categories[0] ? localizeCategory(p.categories[0]) : 'Jewelry',
    cats: p.categories.map(c => c.slug.toLowerCase()),
  }));

  return new Response(JSON.stringify(index), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
