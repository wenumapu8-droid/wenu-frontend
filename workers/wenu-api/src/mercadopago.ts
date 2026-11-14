import type { CheckoutOrder } from "./checkout";
import { roundMoney } from "./shipping";

const PREFERENCES_URL = "https://api.mercadopago.com/checkout/preferences";

export type Preference = {
  id: string;
  url: string;
};

type MpItem = {
  id: string;
  title: string;
  quantity: number;
  unit_price: number;
  currency_id: string;
};

function preferenceBody(env: Env, order: CheckoutOrder & { id: string }) {
  const currency = env.MERCADOPAGO_CURRENCY || "USD";
  const items: MpItem[] = order.items.map((item) => ({
    id: item.sku,
    title: item.name,
    quantity: item.qty,
    unit_price: roundMoney(item.price),
    currency_id: currency,
  }));
  if (order.shipping > 0) {
    items.push({
      id: "shipping",
      title: "Shipping",
      quantity: 1,
      unit_price: roundMoney(order.shipping),
      currency_id: currency,
    });
  }
  const origin = env.SITE_ORIGIN.replace(/\/$/, "");
  const payer: { email: string; name?: string; surname?: string } = { email: order.email };
  if (order.name) {
    const parts = order.name.split(/\s+/);
    payer.name = parts[0];
    if (parts.length > 1) payer.surname = parts.slice(1).join(" ");
  }
  return {
    items,
    payer,
    back_urls: {
      success: `${origin}/gracias?type=shop&id=${order.id}`,
      pending: `${origin}/gracias?type=shop&id=${order.id}&mp=pending`,
      failure: `${origin}/cart?mp=failure&id=${order.id}`,
    },
    auto_return: "approved" as const,
    external_reference: order.id,
  };
}

export async function createPreference(env: Env, order: CheckoutOrder & { id: string }): Promise<Preference | null> {
  const token = env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) {
    console.error(JSON.stringify({ message: "mercadopago_token_missing", orderId: order.id }));
    return null;
  }
  const payload = preferenceBody(env, order);
  let response: Response;
  try {
    response = await fetch(PREFERENCES_URL, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
        "x-idempotency-key": order.id,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });
  } catch {
    console.error(JSON.stringify({ message: "mercadopago_fetch_failed", orderId: order.id }));
    return null;
  }
  if (!response.ok) {
    await response.body?.cancel();
    console.error(JSON.stringify({ message: "mercadopago_rejected", orderId: order.id, status: response.status }));
    return null;
  }
  let parsed: unknown;
  try {
    const text = await response.text();
    if (text.length > 65_536) return null;
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const record = parsed as Record<string, unknown>;
  const id = typeof record.id === "string" ? record.id : "";
  const sandbox = typeof record.sandbox_init_point === "string" ? record.sandbox_init_point : "";
  const live = typeof record.init_point === "string" ? record.init_point : "";
  const url = token.startsWith("TEST-") ? sandbox || live : live || sandbox;
  if (!id || !isMpCheckoutUrl(url)) {
    console.error(JSON.stringify({ message: "mercadopago_bad_url", orderId: order.id }));
    return null;
  }
  return { id, url };
}

export function isMpCheckoutUrl(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  return /^(?:[a-z0-9-]+\.)*mercadopago\.(?:com(?:\.[a-z]{2})?|[a-z]{2})$/.test(url.hostname);
}
