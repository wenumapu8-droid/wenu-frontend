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

  console.log(`[woo] fetched ${products.length} products`);
  return products;
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
    return data[0] || null;
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
  return `$${n.toFixed(0)} USD`;
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
