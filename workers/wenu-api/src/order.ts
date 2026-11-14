import { parseCheckout, type CheckoutOrder } from "./checkout";
import { json, readJson } from "./http";
import { createPreference } from "./mercadopago";

const LINK_ERROR = "Could not create the link — try Venmo or Zelle.";

export async function checkoutLink(request: Request, env: Env): Promise<Response> {
  const body = await readJson(request);
  if (!body.ok) return json({ ok: false, error: "The request could not be read." }, body.status);
  const parsed = parseCheckout(body.value);
  if (!parsed.ok) return json({ ok: false, error: parsed.error }, 400);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const saved = await insertOrder(env, id, parsed.order, createdAt);
  if (!saved) return json({ ok: false, error: LINK_ERROR }, 502);

  const preference = await createPreference(env, { ...parsed.order, id });
  if (!preference) {
    await markFailed(env, id);
    return json({ ok: false, error: LINK_ERROR }, 502);
  }
  await savePreference(env, id, preference.id, preference.url);
  console.log(JSON.stringify({ message: "checkout_link_created", orderId: id }));
  return json({ ok: true, url: preference.url });
}

async function insertOrder(env: Env, id: string, order: CheckoutOrder, createdAt: string): Promise<boolean> {
  try {
    await env.DB.prepare(
      `INSERT INTO orders (id, email, name, method, items_json, shipping, total, status, created_at)
       VALUES (?, ?, ?, 'mercadopago', ?, ?, ?, 'pending_payment', ?)`,
    )
      .bind(id, order.email, order.name || null, JSON.stringify(order.items), order.shipping, order.total, createdAt)
      .run();
    return true;
  } catch (error) {
    console.error(JSON.stringify({ message: "order_insert_failed", orderId: id, error: errorText(error) }));
    return false;
  }
}

async function savePreference(env: Env, id: string, preferenceId: string, url: string): Promise<void> {
  try {
    await env.DB.prepare(`UPDATE orders SET mp_preference_id = ?, mp_init_point = ? WHERE id = ?`)
      .bind(preferenceId, url, id)
      .run();
  } catch (error) {
    console.error(JSON.stringify({ message: "order_preference_update_failed", orderId: id, error: errorText(error) }));
  }
}

async function markFailed(env: Env, id: string): Promise<void> {
  try {
    await env.DB.prepare(`UPDATE orders SET status = 'payment_link_failed' WHERE id = ?`).bind(id).run();
  } catch (error) {
    console.error(JSON.stringify({ message: "order_fail_update_failed", orderId: id, error: errorText(error) }));
  }
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "error";
}
