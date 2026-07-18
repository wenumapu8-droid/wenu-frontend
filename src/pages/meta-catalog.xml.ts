// Meta/Facebook & Google Shopping product feed — RSS 2.0 + g: (Google Shopping)
// namespace, which Meta Commerce Manager also accepts for a "Data feed URL"
// source. Generated at build time from the same WooCommerce data source the
// rest of the site uses (src/lib/woo.ts) — no separate/duplicate catalog.
//
// Live at: https://wenumapuonline.com/meta-catalog.xml
// Re-ingest cadence in Meta Commerce Manager: set to daily/weekly — this file
// is only as fresh as the last `deploy-now.sh` run (SSG, not live API).
//
// Required-by-Meta fields per <item>: id, title, description, availability,
// condition, price, link, image_link, brand.
import { getProducts, decodeEntities, cleanDescription, truncateForMeta } from '../lib/woo';
import type { APIRoute } from 'astro';

const SITE = 'https://wenumapuonline.com';
const BRAND = 'Wenu Mapu';

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// CDATA is safer than entity-escaping for descriptions that may already carry
// odd punctuation from WC — but titles/URLs still get escaped for max feed
// validator compatibility (some parsers are stricter about CDATA in <title>).
function cdata(s: string): string {
  return `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;
}

function availabilityOf(stockStatus: string): string {
  switch (stockStatus) {
    case 'instock':
      return 'in stock';
    case 'onbackorder':
      return 'backorder';
    case 'outofstock':
    default:
      return 'out of stock';
  }
}

function priceOf(raw: string | undefined): string | null {
  const n = parseFloat(raw || '');
  if (isNaN(n) || n <= 0) return null;
  return `${n.toFixed(2)} USD`;
}

export const GET: APIRoute = async () => {
  const products = await getProducts();

  const items = products
    // Only publish sellable, priced, imaged products to the feed — an
    // unpriced/unimaged row gets rejected by Meta anyway and pollutes the
    // catalog health report.
    .filter(p => p.status === 'publish' && p.images?.[0]?.src && parseFloat(p.price || '0') > 0)
    .map(p => {
      const title = decodeEntities(p.name);
      const description = truncateForMeta(
        cleanDescription(p.description || p.short_description || title),
        5000
      );
      const link = `${SITE}/p/${p.slug}`;
      const imageLink = p.images[0].src;
      const extraImages = p.images.slice(1, 11); // Google/Meta cap: 10 additional images
      const price = priceOf(p.price);
      const salePrice =
        p.sale_price && parseFloat(p.sale_price) > 0 && p.sale_price !== p.regular_price
          ? priceOf(p.sale_price)
          : null;
      const regularPrice = priceOf(p.regular_price) || price;
      const category = p.categories?.[0]?.name;

      return `  <item>
    <g:id>${xmlEscape(p.sku || String(p.id))}</g:id>
    <title>${cdata(title)}</title>
    <description>${cdata(description)}</description>
    <link>${xmlEscape(link)}</link>
    <g:image_link>${xmlEscape(imageLink)}</g:image_link>
${extraImages.map(img => `    <g:additional_image_link>${xmlEscape(img.src)}</g:additional_image_link>`).join('\n')}
    <g:availability>${availabilityOf(p.stock_status)}</g:availability>
    <g:condition>new</g:condition>
    <g:price>${regularPrice}</g:price>
${salePrice ? `    <g:sale_price>${salePrice}</g:sale_price>\n` : ''}    <g:brand>${xmlEscape(BRAND)}</g:brand>
${p.sku ? `    <g:mpn>${xmlEscape(p.sku)}</g:mpn>\n` : ''}${category ? `    <g:product_type>${cdata(category)}</g:product_type>\n` : ''}    <g:identifier_exists>false</g:identifier_exists>
  </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>${cdata(`${BRAND} — Product Catalog`)}</title>
  <link>${xmlEscape(SITE)}</link>
  <description>${cdata(`${BRAND} tribal jewelry catalog — auto-generated for Meta/Facebook & Google Shopping.`)}</description>
${items}
</channel>
</rss>
`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
