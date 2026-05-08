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

export function cleanDescription(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatPrice(price: string): string {
  const n = parseFloat(price);
  if (isNaN(n)) return '';
  return `$${n.toFixed(0)} USD`;
}
