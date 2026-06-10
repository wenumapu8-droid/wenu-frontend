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

export interface WooProduct {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  status: string;
  description: string;
  short_description: string;
  images: WooImage[];
  categories: WooCategory[];
  attributes: { id: number; name: string; options: string[] }[];
  stock_status: string;
  manage_stock: boolean;
  stock_quantity: number | null;
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

let productsCache: Promise<WooProduct[]> | null = null;

async function fetchAllProducts(): Promise<WooProduct[]> {
  const perPage = 100; // WooCommerce REST maximum.
  const products: WooProduct[] = [];
  let page = 1;

  while (true) {
    const res = await fetch(
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

  // Reorder each product's images so the hero shot leads.
  // Editorial / macro photos go first; ruler / sizing references move to the end.
  // Fixes catalogs where the sizing photo was uploaded first by mistake.
  for (const p of products) {
    if (p.images?.length > 1) {
      p.images = reorderImagesForHero(p.images);
    }
  }

  console.log(`[woo] fetched ${products.length} products`);
  return products;
}

/** Reorder images so the editorial/macro shot is first, references last. */
function reorderImagesForHero(imgs: WooImage[]): WooImage[] {
  const norm = (s: string) => (s || '').toLowerCase();
  const PREFER = /\b(principal|macro|hero|editorial|cover)\b/;
  const AVOID  = /\b(ruler|westcott|sizing|size-?guide|reference|referencia|measure|escala|regla|placeholder|wireframe|sketch|mock(up)?)\b/;
  const score = (img: WooImage): number => {
    const txt = norm(img.alt) + ' ' + norm(img.src);
    if (PREFER.test(txt)) return -2;     // very high priority
    if (AVOID.test(txt)) return 2;       // push to the end
    return 0;                            // neutral
  };
  // Stable sort: keep original order between equal-score items.
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

export async function getProduct(slug: string): Promise<WooProduct | null> {
  try {
    const res = await fetch(
      `${WC_URL}/products?slug=${slug}&${authParams()}`
    );
    if (!res.ok) {
      throw new Error(`WC product fetch failed: HTTP ${res.status} for slug=${slug}`);
    }
    const data: WooProduct[] = await res.json();
    const p = data[0] || null;
    if (p?.images?.length > 1) {
      p.images = reorderImagesForHero(p.images);
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
    const res = await fetch(
      `${WC_URL}/products/categories?per_page=50&hide_empty=true&${authParams()}`
    );
    if (!res.ok) {
      throw new Error(`WC categories fetch failed: HTTP ${res.status}`);
    }
    return await res.json();
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
    const res = await fetch(
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
 *  1. Image whose alt or src signals it's a "principal" / "macro" / editorial.
 *  2. First image NOT flagged as reference / ruler / sizing / placeholder.
 *  3. Fall back to `images[0]` to never break rendering.
 *
 * Why: WooCommerce serves images in the order set in wp-admin. If a product was
 * uploaded with the sizing photo first (ruler on white paper), the catalog
 * shows that instead of the editorial macro on obsidian. This helper rescues
 * the right hero without requiring every product to be reordered manually.
 */
export function getHeroImage(p: WooProduct): WooImage | null {
  if (!p?.images?.length) return null;

  const norm = (s: string) => (s || '').toLowerCase();
  const PREFER = /\b(principal|macro|hero|editorial|cover)\b/;
  const AVOID  = /\b(ruler|westcott|sizing|size-?guide|reference|referencia|measure|escala|regla|placeholder|wireframe|sketch|mock(up)?)\b/;

  // Prefer images explicitly tagged as macro/principal in alt or filename.
  const preferred = p.images.find(img => PREFER.test(norm(img.alt)) || PREFER.test(norm(img.src)));
  if (preferred) return preferred;

  // Otherwise, return the first image that doesn't look like a reference shot.
  const clean = p.images.find(img => !AVOID.test(norm(img.alt)) && !AVOID.test(norm(img.src)));
  if (clean) return clean;

  // Fallback so we never render a broken card.
  return p.images[0];
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
