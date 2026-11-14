import { roundMoney, shippingFor } from "./shipping";

export type LineItem = {
  sku: string;
  name: string;
  price: number;
  qty: number;
};

export type CheckoutOrder = {
  email: string;
  name: string;
  items: LineItem[];
  shipping: number;
  total: number;
};

const MAX_ITEMS = 30;
const MAX_QTY = 99;
const MAX_PRICE = 100_000;

export function parseCheckout(body: unknown): { ok: true; order: CheckoutOrder } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "The request could not be read." };
  const record = body as Record<string, unknown>;
  const email = normalizeEmail(record.email);
  if (!email) return { ok: false, error: "Add your email first." };
  const name = typeof record.name === "string" ? record.name.trim().slice(0, 120) : "";

  if (Array.isArray(record.items)) {
    return parseCart(record, email, name);
  }
  if ("sku" in record || "piece" in record || "price" in record) {
    return parseReservePiece(record, email, name);
  }
  return { ok: false, error: "Your cart is empty." };
}

function parseCart(
  record: Record<string, unknown>,
  email: string,
  name: string,
): { ok: true; order: CheckoutOrder } | { ok: false; error: string } {
  const items = parseItems(record.items);
  if (!items) return { ok: false, error: "A cart item is incomplete." };
  if (items.length === 0) return { ok: false, error: "Your cart is empty." };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping = parseMoney(record.shipping);
  const total = parseMoney(record.total);
  if (shipping === null || total === null) return { ok: false, error: "The total does not match this cart." };

  const expectedShipping = shippingFor(subtotal);
  const expectedTotal = roundMoney(subtotal + expectedShipping);
  if (Math.abs(shipping - expectedShipping) > 0.01) {
    return { ok: false, error: "Shipping does not match the published rate." };
  }
  if (Math.abs(total - expectedTotal) > 0.01) {
    return { ok: false, error: "The total does not match this cart." };
  }
  if (total <= 0) return { ok: false, error: "The total must be greater than zero." };

  return {
    ok: true,
    order: { email, name, items, shipping: expectedShipping, total: expectedTotal },
  };
}

/** ReserveModal sends one piece (`$48 USD`) and does not send shipping or total. */
function parseReservePiece(
  record: Record<string, unknown>,
  email: string,
  name: string,
): { ok: true; order: CheckoutOrder } | { ok: false; error: string } {
  const sku = typeof record.sku === "string" ? record.sku.trim() : "";
  const piece = typeof record.piece === "string" ? record.piece.trim() : "";
  const price = parseMoney(record.price);
  if (!sku || sku.length > 80 || !piece || piece.length > 200 || price === null || price < 0 || price > MAX_PRICE) {
    return { ok: false, error: "A cart item is incomplete." };
  }
  const items = [{ sku, name: piece, price, qty: 1 }];
  const shipping = shippingFor(price);
  const total = roundMoney(price + shipping);
  if (total <= 0) return { ok: false, error: "The total must be greater than zero." };
  return { ok: true, order: { email, name, items, shipping, total } };
}

function parseItems(value: unknown): LineItem[] | null {
  if (!Array.isArray(value) || value.length > MAX_ITEMS) return null;
  const items: LineItem[] = [];
  for (const raw of value) {
    if (!raw || typeof raw !== "object") return null;
    const item = raw as Record<string, unknown>;
    const sku = typeof item.sku === "string" ? item.sku.trim() : "";
    const name = typeof item.name === "string" ? item.name.trim() : "";
    const price = parseMoney(item.price);
    const qty = item.qty;
    if (!sku || sku.length > 80 || !name || name.length > 200) return null;
    if (price === null || price < 0 || price > MAX_PRICE) return null;
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return null;
    items.push({ sku, name, price, qty });
  }
  return items;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length < 3 || email.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function parseMoney(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const cleaned = value.trim().replace(/usd/gi, "").replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d+)?$/.test(cleaned)) return null;
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
}
