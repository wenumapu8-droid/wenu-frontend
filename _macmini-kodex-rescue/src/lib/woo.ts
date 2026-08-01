// Cliente WooCommerce REST API — solo lectura, sin exponer claves en el cliente
// Las claves quedan en el servidor (SSR/SSG en build time)
//
// Build safety:
//   - Fetch errors throw by default. A silent zero-products build is unsafe
//     for an ecommerce site.
//   - To intentionally bypass (offline dev, migration), set ALLOW_EMPTY_PRODUCTS=true.
//   - The postbuild script (scripts/verify-build.mjs) asserts a non-trivial
//     catalog ships in dist/p/ unless the same flag is set.

const WC_URL = import.meta.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WC_KEY = import.meta.env.WC_CONSUMER_KEY;
const WC_SECRET = import.meta.env.WC_CONSUMER_SECRET;
const ALLOW_EMPTY = import.meta.env.ALLOW_EMPTY_PRODUCTS === 'true';

if (!WC_KEY || !WC_SECRET) {
  if (ALLOW_EMPTY) {
    console.warn(
      '[woo] WARNING: WC_CONSUMER_KEY / WC_CONSUMER_SECRET missing — ' +
      'continuing because ALLOW_EMPTY_PRODUCTS=true. Catalog will be empty.'
    );
  } else {
    throw new Error(
      '[woo] Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET in environment. ' +
      'Set them in .env (already in .gitignore) — never commit. ' +
      'For an intentional empty build, set ALLOW_EMPTY_PRODUCTS=true.'
    );
  }
}

export interface WooImage {
  id: number;
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface WooCategory {
  id: number;
  name: string;
  slug: string;
}

/** A single variation of a VARIABLE product (e.g. one size of a multi-size hanger). */
export interface WooVariant {
  id: number;
  size: string;          // primary size / gauge option label (e.g. "12mm", "16g")
  /** Full per-variation attribute map, e.g. { Color: 'Silver', Size: '16mm' }. */
  attributes?: Record<string, string>;
  /** Variation featured image src (for image swap on selection). */
  image?: string;
  price: string;
  stock_status: string;  // 'instock' | 'outofstock' | 'onbackorder'
  sku: string;
}

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  // WooCommerce product type. VARIABLE products leave `price`/`regular_price`
  // empty on the parent — the real price lives on the variations. We derive it.
  type?: string;
  variations?: number[];
  // Derived at fetch time from variations (min/max across variations, in store currency).
  price_min?: number;
  price_max?: number;
  status: string;
  description: string;
  short_description: string;
  images: WooImage[];
  categories: WooCategory[];
  attributes: { id: number; name: string; options: string[] }[];
  // WooCommerce ships these on the raw product JSON even though the catalog
  // doesn't populate structured attributes. weight is in KILOGRAMS (WC store
  // unit) — e.g. "0.0200" = 20 g. dimensions are in cm and almost always blank.
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
  stock_status: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  // WooCommerce ships ISO timestamps on the raw product JSON by default. Used to
  // surface the newest published pieces (home "Just landed" + Nav "New arrivals").
  date_created?: string;
  date_created_gmt?: string;
  // Populated at fetch time for VARIABLE products: one entry per size variation.
  variants?: WooVariant[];
}

/** Minimal order shape from WooCommerce Orders API. */
export interface WooOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  total: string;
  total_tax: string;
  shipping_total: string;
  discount_total: string;
  currency: string;
  payment_method_title: string;
  line_items: {
    product_id: number;
    name: string;
    quantity: number;
    price: number;
    total: string;
  }[];
  billing: { email: string; first_name: string; last_name: string };
  shipping: { city: string; state: string; country: string } | null;
}

function authParams() {
  return `consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
}

// Browser-like UA: Cloudflare's bot-fight can hard-block default runtime UAs
// (returns HTTP 403 "error code: 1010"). Sending a real UA avoids that class of
// failure on the build's server-side fetches.
const BUILD_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.0 Safari/605.1.15';

/**
 * fetch with a hard per-attempt timeout + bounded retries.
 *
 * Why this exists: the WC API sits behind Cloudflare. Under rate-limiting or a
 * transient hold, a plain `fetch()` (no default timeout) can hang FOREVER on a
 * held socket — which silently freezes the whole SSG build at 0% CPU with no
 * error. An AbortController timeout turns that hang into a retryable failure.
 */
/** Minimal Response-like wrapper: body already consumed under the timeout. */
interface WcResponse {
  ok: boolean;
  status: number;
  json: () => any;
}

async function wcFetch(url: string, timeoutMs = 8000, tries = 3): Promise<WcResponse> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= tries; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': BUILD_UA } });
      // CRITICAL: read the body while the abort timer is still armed. A plain
      // fetch resolves once headers arrive; if Cloudflare then HOLDS the body,
      // `res.json()` (or .text()) hangs forever with no timeout — which is what
      // silently froze the SSG build. Consuming it here keeps it under the abort.
      const text = await res.text();
      clearTimeout(timer);
      // 429 / 5xx are transient (rate limit / gateway) — back off and retry.
      if ((res.status === 429 || res.status >= 500) && attempt < tries) {
        await new Promise(r => setTimeout(r, 800 * attempt));
        continue;
      }
      return { ok: res.ok, status: res.status, json: () => (text ? JSON.parse(text) : null) };
    } catch (e) {
      clearTimeout(timer);
      lastErr = e;
      if (attempt < tries) {
        await new Promise(r => setTimeout(r, 800 * attempt)); // linear backoff
        continue;
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error(`wcFetch failed: ${url}`);
}

let productsCache: Promise<WooProduct[]> | null = null;
let kodexCategoryIdCache: Promise<number | null> | null = null;

async function getKodexCategoryId(): Promise<number | null> {
  kodexCategoryIdCache ||= (async () => {
    const res = await wcFetch(
      `${WC_URL}/products/categories?slug=kodex&per_page=1&${authParams()}`
    );
    if (!res.ok) {
      throw new Error(`WC kodex category lookup failed: HTTP ${res.status}`);
    }
    const data: WooCategory[] = await res.json();
    return data[0]?.id ?? null;
  })();
  return kodexCategoryIdCache;
}

async function fetchAllProducts(): Promise<WooProduct[]> {
  const perPage = 100; // WooCommerce REST maximum.
  let products: WooProduct[] = [];
  let page = 1;

  while (true) {
    const res = await wcFetch(
      `${WC_URL}/products?per_page=${perPage}&page=${page}&status=publish&${authParams()}`
    );
    if (!res.ok) {
      throw new Error(`WC products fetch failed: HTTP ${res.status} from ${WC_URL}/products?page=${page}`);
    }
    const data: WooProduct[] = await res.json();
    products.push(...data);
    if (data.length < perPage) break;
    page += 1;
  }

  // Exclude KODEX products from the jewelry shop. KODEX (Ocin's digital archive)
  // lives at /kodex/store with its own commerce chrome — its WC products must not
  // leak into /shop, /search-index.json, PDPs, categories, sitemaps, or JSON-LD.
  // Filter by category slug so the exclusion survives category-ID re-creation.
  products = products.filter(p => !p.categories?.some(c => c.slug === 'kodex'));

  // Reorder each product's images so the hero shot leads.
  // Editorial / macro photos go first; ruler / sizing references move to the end.
  // Fixes catalogs where the sizing photo was uploaded first by mistake.
  for (const p of products) {
    if (p.images?.length > 1) {
      p.images = reorderImagesForHero(p.images);
    }
  }

  // ── PRICE DERIVATION FOR VARIABLE PRODUCTS ──────────────────────────────
  // WooCommerce leaves `price`/`regular_price` empty on a VARIABLE parent — the
  // real price lives on each variation. Without this, PDP/shop/search-index show
  // no price and JSON-LD emits price 0.00 ("free" to Google). For every product
  // missing a usable price, fetch its variations and set price = min variation
  // price (+ price_min/price_max for ranges). Concurrency-limited to be gentle.
  // VARIABLE products: fetch full variation detail (size + price + stock per
  // variant) so the PDP can render a size selector, and derive the price range.
  // Any VARIABLE product needs its variations (for swatches/size + price range),
  // even if WC already reports a parent price range — otherwise a colour selector
  // silently fails to render. Belt-and-suspenders: type OR variations[] OR no price.
  const needVariants = products.filter(p =>
    p.type === 'variable' || (p.variations?.length ?? 0) > 0 || !(parseFloat(p.price) > 0));
  await mapLimit(needVariants, 1, async (p) => {  // sequential: Cloudflare burst-protection holds parallel sockets; one-at-a-time is slower but reliable
    try {
      const variants = await fetchVariations(p.id);
      if (!variants.length) return;
      p.variants = variants;
      const prices = variants.map(v => parseFloat(v.price)).filter(n => n > 0);
      if (prices.length) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        if (!(parseFloat(p.price) > 0)) {
          p.price = String(min);
          p.regular_price = p.regular_price || String(min);
        }
        p.price_min = min;
        p.price_max = max;
      }
    } catch (e) {
      console.warn(`[woo] variation fetch failed for #${p.id} (${p.slug}):`, e instanceof Error ? e.message : e);
    }
  });

  const withPrice = products.filter(p => parseFloat(p.price) > 0).length;
  console.log(`[woo] fetched ${products.length} products · ${withPrice} with price (${needVariants.length} variation lookups)`);
  return products;
}

/** Fetch a variable product's variation prices (numeric, >0) from the WC REST API. */
async function fetchVariationPrices(productId: number): Promise<number[]> {
  const out: number[] = [];
  let page = 1;
  while (true) {
    const res = await wcFetch(
      `${WC_URL}/products/${productId}/variations?per_page=100&page=${page}&${authParams()}`
    );
    if (!res.ok) {
      if (res.status === 404) break; // simple product with no variations
      throw new Error(`variations HTTP ${res.status}`);
    }
    const data: { price?: string; regular_price?: string; sale_price?: string }[] = await res.json();
    for (const v of data) {
      const n = parseFloat(v.price || v.sale_price || v.regular_price || '');
      if (!isNaN(n) && n > 0) out.push(n);
    }
    if (data.length < 100) break;
    page += 1;
  }
  return out;
}

/** Fetch a variable product's full variation detail (size + price + stock + sku). */
async function fetchVariations(productId: number): Promise<WooVariant[]> {
  const out: WooVariant[] = [];
  let page = 1;
  while (true) {
    const res = await wcFetch(
      `${WC_URL}/products/${productId}/variations?per_page=100&page=${page}&${authParams()}`
    );
    if (!res.ok) {
      if (res.status === 404) break; // simple product with no variations
      throw new Error(`variations HTTP ${res.status}`);
    }
    const data: any[] = await res.json();
    for (const v of data) {
      const attrs: { name?: string; option?: string }[] = Array.isArray(v.attributes) ? v.attributes : [];
      const sizeAttr = attrs.find(a => /size|talla|gauge|medida|tama|largo|length|di[aá]met/i.test(a.name || '')) || attrs[0];
      const attrMap: Record<string, string> = {};
      for (const a of attrs) { if (a.name && a.option) attrMap[a.name.trim()] = a.option.trim(); }
      out.push({
        id: v.id,
        size: (sizeAttr?.option || '').trim(),
        attributes: attrMap,
        image: v.image?.src || undefined,
        price: String(v.price || v.sale_price || v.regular_price || ''),
        stock_status: v.stock_status || 'instock',
        sku: v.sku || '',
      });
    }
    if (data.length < 100) break;
    page += 1;
  }
  // Keep every priced variation (colour-only variants have no size label but must
  // survive for the swatch selector). Sort the sized ones by numeric size asc.
  const priced = out.filter(v => v.price || (v.attributes && Object.keys(v.attributes).length));
  const numOf = (s: string) => { const m = s.match(/[\d.]+/); return m ? parseFloat(m[0]) : 0; };
  priced.sort((a, b) => numOf(a.size) - numOf(b.size));
  return priced.length ? priced : out;
}

/** Run an async mapper over items with bounded concurrency. */
async function mapLimit<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      await fn(items[idx]);
    }
  });
  await Promise.all(workers);
}

/**
 * Reorder images so a real hero shot leads and reference/ruler shots trail.
 *
 * IMPORTANT: WooCommerce image order (position 0 = cover) is authoritative.
 * The owner sets the intended cover by ordering images in wp-admin, so we
 * DO NOT override a good hand-set order. We only:
 *   1. Promote images explicitly flagged as hero/principal/studio/editorial.
 *   2. Demote clear reference shots (ruler / sizing / spec / placeholder).
 * "macro" is intentionally NOT a promote signal: the owner names ruler/scale
 * shots "…-macro.jpg", so treating "macro" as hero forced the sizing photo to
 * the cover no matter what he uploaded first. Everything else keeps its WC
 * order (a stable sort preserves position 0 as the default cover).
 */
function reorderImagesForHero(imgs: WooImage[]): WooImage[] {
  const norm = (s: string) => (s || '').toLowerCase();
  const PREFER = /\b(principal|hero|studio|editorial|cover)\b/;
  const AVOID  = /\b(ruler|westcott|sizing|size-?guide|spec|reference|referencia|measure|escala|regla|placeholder|wireframe|sketch|mock(up)?)\b/;
  const score = (img: WooImage): number => {
    const txt = norm(img.alt) + ' ' + norm(img.src);
    if (AVOID.test(txt)) return 2;       // push reference/ruler shots to the end
    if (PREFER.test(txt)) return -1;     // gently promote explicit hero shots
    return 0;                            // neutral → keep WC order (position 0 = cover)
  };
  // Stable sort: keep original WooCommerce order between equal-score items,
  // so an un-flagged position-0 image stays the cover.
  return imgs
    .map((img, i) => ({ img, i, s: score(img) }))
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map(x => x.img);
}

export async function getProducts(limit?: number): Promise<WooProduct[]> {
  try {
    productsCache ||= fetchAllProducts();
    const products = await productsCache;
    return typeof limit === 'number' ? products.slice(0, limit) : products;
  } catch (e) {
    if (ALLOW_EMPTY) {
      console.warn('[woo] WARNING: getProducts failed but ALLOW_EMPTY_PRODUCTS=true — returning [].', e);
      return [];
    }
    console.error('[woo] FATAL: getProducts failed and ALLOW_EMPTY_PRODUCTS is not true. Aborting build.', e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}

/**
 * Fetch KODEX products (category slug 'kodex') — the digital-archive commerce
 * lane. Includes drafts so /kodex/store can render "COMING SOON" placeholders
 * before Ocin publishes prices/downloads. Never mixes with getProducts().
 */
export async function getKodexProducts(): Promise<WooProduct[]> {
  try {
    const categoryId = await getKodexCategoryId();
    if (!categoryId) return [];
    const out: WooProduct[] = [];
    let page = 1;
    while (true) {
      const res = await wcFetch(
        `${WC_URL}/products?per_page=100&page=${page}&status=any&category=${categoryId}&${authParams()}`
      );
      if (!res.ok) throw new Error(`WC kodex products fetch failed: HTTP ${res.status}`);
      const data: WooProduct[] = await res.json();
      out.push(...data);
      if (data.length < 100) break;
      page += 1;
    }
    // Defensive: only return items truly tagged kodex (current category id or slug).
    return out.filter(p => p.categories?.some(c => c.slug === 'kodex' || c.id === categoryId));
  } catch (e) {
    if (ALLOW_EMPTY) {
      console.warn('[woo] WARNING: getKodexProducts failed but ALLOW_EMPTY_PRODUCTS=true — returning [].', e);
      return [];
    }
    console.error('[woo] FATAL: getKodexProducts failed.', e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}

export async function getProduct(slug: string): Promise<WooProduct | null> {
  try {
    const res = await wcFetch(
      `${WC_URL}/products?slug=${slug}&${authParams()}`
    );
    if (!res.ok) {
      throw new Error(`WC product fetch failed: HTTP ${res.status} for slug=${slug}`);
    }
    const data: WooProduct[] = await res.json();
    const p = data[0] || null;
    // KODEX products must not resolve at /p/[slug] — their PDP lives in /kodex/store.
    if (p?.categories?.some(c => c.slug === 'kodex')) return null;
    if (p?.images?.length > 1) {
      p.images = reorderImagesForHero(p.images);
    }
    // Variable products have an empty parent price — derive from variations so
    // the PDP, its JSON-LD and "add to cart" all show the real price.
    if (p && !(parseFloat(p.price) > 0)) {
      try {
        const prices = await fetchVariationPrices(p.id);
        if (prices.length) {
          const min = Math.min(...prices);
          p.price = String(min);
          p.regular_price = p.regular_price || String(min);
          p.price_min = min;
          p.price_max = Math.max(...prices);
        }
      } catch (e) {
        console.warn(`[woo] variation price fetch failed for ${slug}:`, e instanceof Error ? e.message : e);
      }
    }
    return p;
  } catch (e) {
    if (ALLOW_EMPTY) {
      console.warn(`[woo] WARNING: getProduct(${slug}) failed but ALLOW_EMPTY_PRODUCTS=true — returning null.`, e);
      return null;
    }
    console.error(`[woo] FATAL: getProduct(${slug}) failed and ALLOW_EMPTY_PRODUCTS is not true.`, e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}

export async function getCategories(): Promise<WooCategory[]> {
  try {
    const res = await wcFetch(
      `${WC_URL}/products/categories?per_page=50&hide_empty=true&${authParams()}`
    );
    if (!res.ok) {
      throw new Error(`WC categories fetch failed: HTTP ${res.status}`);
    }
    const cats: WooCategory[] = await res.json();
    // Hide KODEX category from jewelry-store surfaces (nav, filters, sitemap).
    return cats.filter(c => c.slug !== 'kodex');
  } catch (e) {
    if (ALLOW_EMPTY) {
      console.warn('[woo] WARNING: getCategories failed but ALLOW_EMPTY_PRODUCTS=true — returning [].', e);
      return [];
    }
    console.error('[woo] FATAL: getCategories failed and ALLOW_EMPTY_PRODUCTS is not true.', e);
    throw e instanceof Error ? e : new Error(String(e));
  }
}

let ordersCache: Promise<WooOrder[]> | null = null;

async function fetchAllOrders(status?: string): Promise<WooOrder[]> {
  const perPage = 100;
  const orders: WooOrder[] = [];
  let page = 1;
  const statusParam = status ? `&status=${status}` : '';

  while (true) {
    const res = await wcFetch(
      `${WC_URL}/orders?per_page=${perPage}&page=${page}${statusParam}&${authParams()}`
    );
    if (!res.ok) {
      if (res.status === 401) {
        console.warn(
          '[woo] Orders API returned 401 — the WC consumer key likely lacks read_orders scope. ' +
          'Create a new key with read_orders permission in WP Admin → WooCommerce → Settings → Advanced → REST API.'
        );
        return [];
      }
      throw new Error(`WC orders fetch failed: HTTP ${res.status}`);
    }
    const data: WooOrder[] = await res.json();
    orders.push(...data);
    if (data.length < perPage) break;
    page += 1;
  }

  console.log(`[woo] fetched ${orders.length} orders${status ? ` (status=${status})` : ''}`);
  return orders;
}

export async function getOrders(status?: string): Promise<WooOrder[]> {
  try {
    ordersCache ||= fetchAllOrders(status);
    return await ordersCache;
  } catch (e) {
    console.warn('[woo] WARNING: getOrders failed — returning [].', e);
    return [];
  }
}

/** Aggregate order data into a metrics snapshot. */
export function aggregateMetrics(orders: WooOrder[]): {
  totalRevenue: number;
  orderCount: number;
  avgOrderValue: number;
  topProducts: { name: string; revenue: number; quantity: number }[];
} {
  const revenueMap = new Map<string, { revenue: number; quantity: number }>();
  let total = 0;

  for (const order of orders) {
    if (order.status === 'cancelled' || order.status === 'refunded') continue;
    total += parseFloat(order.total) || 0;
    for (const item of order.line_items) {
      const r = parseFloat(item.total) || 0;
      const existing = revenueMap.get(item.name) || { revenue: 0, quantity: 0 };
      existing.revenue += r;
      existing.quantity += item.quantity;
      revenueMap.set(item.name, existing);
    }
  }

  const topProducts = [...revenueMap.entries()]
    .map(([name, data]) => ({ name, revenue: data.revenue, quantity: data.quantity }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    totalRevenue: total,
    orderCount: orders.filter(o => o.status !== 'cancelled' && o.status !== 'refunded').length,
    avgOrderValue: orders.length > 0 ? total / orders.length : 0,
    topProducts,
  };
}

/** Decode common HTML entities returned by WooCommerce in product names
 *  and short descriptions. WP often double-encodes (& → &amp;). */
export function decodeEntities(s: string): string {
  if (!s) return s;
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '…')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"');
}

export function cleanDescription(html: string): string {
  return decodeEntities(
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  );
}

export function formatPrice(price: string): string {
  const n = parseFloat(price);
  if (isNaN(n)) return '';
  // US format: $1,000.00 — drop trailing ".00" when whole dollars to keep
  // the wordmark clean. Localized to en-US so thousands separator is comma
  // and decimal is dot (not the European "." for thousands).
  const formatted = n.toLocaleString('en-US', {
    minimumFractionDigits: n % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `$${formatted} USD`;
}

/**
 * Pick the best hero image for a product card.
 *
 * Priority:
 *  1. Image explicitly flagged as principal / hero / studio / editorial.
 *  2. First image NOT flagged as reference / ruler / sizing / spec / placeholder
 *     (this respects the WooCommerce order — position 0 wins by default).
 *  3. Fall back to `images[0]` to never break rendering.
 *
 * Why: WooCommerce serves images in the order set in wp-admin, and that order is
 * authoritative (position 0 = intended cover). We only rescue the case where a
 * ruler/sizing shot leads. "macro" is NOT a promote signal — the owner names
 * ruler/scale shots "…-macro.jpg", so promoting "macro" forced the sizing photo
 * to the cover. Kept in sync with reorderImagesForHero().
 */
export function getHeroImage(p: WooProduct): WooImage | null {
  if (!p?.images?.length) return null;

  const norm = (s: string) => (s || '').toLowerCase();
  const PREFER = /\b(principal|hero|studio|editorial|cover)\b/;
  const AVOID  = /\b(ruler|westcott|sizing|size-?guide|spec|reference|referencia|measure|escala|regla|placeholder|wireframe|sketch|mock(up)?)\b/;

  // Prefer images explicitly tagged as hero/principal/studio in alt or filename.
  const preferred = p.images.find(img => PREFER.test(norm(img.alt)) || PREFER.test(norm(img.src)));
  if (preferred) return preferred;

  // Otherwise, return the first image (WC order) that isn't a reference shot.
  const clean = p.images.find(img => !AVOID.test(norm(img.alt)) && !AVOID.test(norm(img.src)));
  if (clean) return clean;

  // Fallback so we never render a broken card.
  return p.images[0];
}

/**
 * Pick a SECOND, distinct gallery image for the catalogue hover-swap
 * (task A3, 2026-07-18). Returns null when the product only has one usable
 * photo — callers must not render a swap effect in that case.
 *
 * Reuses getHeroImage()'s AVOID list so we never swap into a ruler/reference/
 * sizing shot on hover — that would look broken, not editorial.
 */
export function getSecondaryImage(p: WooProduct, hero: WooImage | null): WooImage | null {
  if (!p?.images?.length || p.images.length < 2 || !hero) return null;

  const norm = (s: string) => (s || '').toLowerCase();
  const AVOID = /\b(ruler|westcott|sizing|size-?guide|spec|reference|referencia|measure|escala|regla|placeholder|wireframe|sketch|mock(up)?)\b/;

  const others = p.images.filter(img => img.src !== hero.src);
  if (!others.length) return null;

  const clean = others.find(img => !AVOID.test(norm(img.alt)) && !AVOID.test(norm(img.src)));
  return clean || null;
}

/** Truncate a string for a meta description / OG description without slicing
 *  mid-word. Returns text up to `maxLen` chars, ending at the last word
 *  boundary, with an ellipsis if truncation happened. Trims trailing
 *  punctuation that would read awkwardly before the ellipsis. */
export function truncateForMeta(text: string, maxLen = 160): string {
  if (!text) return '';
  const clean = text.trim();
  if (clean.length <= maxLen) return clean;
  const slice = clean.slice(0, maxLen - 1);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > maxLen * 0.5 ? slice.slice(0, lastSpace) : slice;
  return cut.replace(/[\s.,;:!?\-—–]+$/, '') + '…';
}

// ─── CATEGORY LOCALIZATION (Spanish DB → English UI) ────────────────────────
// The Postgres / Woo backend stores category names in Spanish (Amuletos,
// Anillos, Aros, etc). The site is in English. This map normalizes the
// display label without touching the database.
//
// Keys are matched against (a) slug lowercased and (b) name lowercased —
// in that order — so it works whether WooCommerce returns "Amuletos" or
// "amuletos".

const CATEGORY_EN: Record<string, string> = {
  // Postgres categories (Wenu platform)
  'amuletos':       'Amulets',
  'piezas-autor':   'Limited Pieces',
  'piezas-de-autor': 'Limited Pieces',
  'clasicos':       'Classics',
  'collares':       'Necklaces',
  'aros':           'Earrings',
  'hangers':        'Hangers',
  'labrets':        'Labrets',
  'metal':          'Metal',
  'organicos':      'Organic',
  'plugs':          'Plugs',
  'anillos':        'Rings',
  'rings':          'Rings',
  'septums':        'Septums',
  'tunnels':        'Tunnels',
  'sin-categorizar': 'Uncategorized',
  // Common WooCommerce variants in Spanish
  'amuleto':        'Amulet',
  'anillo':         'Ring',
  'collar':         'Necklace',
  'piercing':       'Piercing',
  'piercings':      'Piercing',
  'expansion':      'Plug',
  'expansiones':    'Plugs',
  'tapon':          'Plug',
  'tapones':        'Plugs',
  'tunel':          'Tunnel',
  'tuneles':        'Tunnels',
  'pendiente':      'Hanger',
  'pendientes':     'Hangers',
  'aro':            'Earring',
  'septum':         'Septum',
  'labret':         'Labret',
  'pieza-de-autor': 'Limited Piece',
  'organico':       'Organic',
  'ritual':         'Ritual Pieces',
  'rituales':       'Ritual Pieces',
  // Piercing zone subtypes (English already, kept for completeness)
  'flat':           'Flat',
  'eyebrow':        'Eyebrow',
  'nipple':         'Nipple',
  'lip':            'Lip',
  'tongue':         'Tongue',
  'helix':          'Helix',
  'tragus':         'Tragus',
  'conch':          'Conch',
  'daith':          'Daith',
  'industrial':     'Industrial',
  'nostril':        'Nostril',
};

function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

/** Translate a WooCommerce category to its English display name. */
export function localizeCategory(cat: { name: string; slug: string }): string {
  const slug = normalizeKey(cat.slug || '');
  const name = normalizeKey(cat.name || '');
  return CATEGORY_EN[slug] || CATEGORY_EN[name] || cat.name;
}
