// Cliente WooCommerce REST API — solo lectura, sin exponer claves en el cliente
// Las claves quedan en el servidor (SSR/SSG en build time)

const WC_URL = import.meta.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WC_KEY = import.meta.env.WC_CONSUMER_KEY;
const WC_SECRET = import.meta.env.WC_CONSUMER_SECRET;

if (!WC_KEY || !WC_SECRET) {
  throw new Error(
    '[woo.ts] Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET in environment. ' +
    'Set them in .env (already in .gitignore) — never commit.'
  );
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

export async function getProducts(perPage = 50): Promise<WooProduct[]> {
  try {
    const res = await fetch(
      `${WC_URL}/products?per_page=${perPage}&status=publish&${authParams()}`
    );
    if (!res.ok) throw new Error(`WC products error: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('WooCommerce fetch error:', e);
    return [];
  }
}

export async function getProduct(slug: string): Promise<WooProduct | null> {
  try {
    const res = await fetch(
      `${WC_URL}/products?slug=${slug}&${authParams()}`
    );
    if (!res.ok) throw new Error(`WC product error: ${res.status}`);
    const data: WooProduct[] = await res.json();
    return data[0] || null;
  } catch (e) {
    console.error('WooCommerce fetch error:', e);
    return null;
  }
}

export async function getCategories(): Promise<WooCategory[]> {
  try {
    const res = await fetch(
      `${WC_URL}/products/categories?per_page=50&hide_empty=true&${authParams()}`
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
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
