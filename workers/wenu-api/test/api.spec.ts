import { env, exports } from "cloudflare:workers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import worker from "../src/index";
import { shippingFor } from "../src/shipping";

const MP_URL = "https://api.mercadopago.com/checkout/preferences";
const SANDBOX_URL = "https://sandbox.mercadopago.com/checkout/v1/redirect?pref_id=pref-test";
const TOKEN = "TEST-sandbox-token";

type MpCall = {
  authorization: string | null;
  idempotency: string | null;
  body: Record<string, unknown>;
};

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(async () => {
  await env.DB.prepare("DELETE FROM orders").run();
});

function mockMercadoPago(status = 201): MpCall[] {
  const calls: MpCall[] = [];
  const original = globalThis.fetch.bind(globalThis);
  vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url !== MP_URL) return original(input, init);
    const request = new Request(input, init);
    calls.push({
      authorization: request.headers.get("authorization"),
      idempotency: request.headers.get("x-idempotency-key"),
      body: (await request.json()) as Record<string, unknown>,
    });
    if (status !== 201) return new Response("nope", { status });
    return Response.json({
      id: "pref-test",
      init_point: "https://www.mercadopago.com/checkout/v1/redirect?pref_id=pref-test",
      sandbox_init_point: SANDBOX_URL,
    });
  });
  return calls;
}

async function post(path: string, body: unknown, origin = "https://wenumapuonline.com"): Promise<Response> {
  return exports.default.fetch(
    new Request(`https://wenu-api.test${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", origin },
      body: JSON.stringify(body),
    }),
  );
}

describe("GET /health", () => {
  it("returns 200 with the workers health shape", async () => {
    const response = await exports.default.fetch("https://wenu-api.test/health", {
      headers: { origin: "https://wenumapuonline.com" },
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; productCount: unknown; ts: string; runtime: string };
    expect(body.ok).toBe(true);
    expect(body.productCount).toBeNull();
    expect(body.runtime).toBe("workers");
    expect(Number.isNaN(Date.parse(body.ts))).toBe(false);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://wenumapuonline.com");
  });
});

describe("CORS preflight", () => {
  it("answers 204 for the store origins and pages.dev previews", async () => {
    for (const origin of [
      "https://wenumapuonline.com",
      "https://www.wenumapuonline.com",
      "https://wenu-frontend.pages.dev",
      "http://localhost:4321",
    ]) {
      const response = await exports.default.fetch("https://wenu-api.test/shop/checkout-link", {
        method: "OPTIONS",
        headers: { origin, "access-control-request-method": "POST" },
      });
      expect(response.status).toBe(204);
      expect(response.headers.get("access-control-allow-origin")).toBe(origin);
      expect(response.headers.get("access-control-allow-methods")).toContain("POST");
      expect(response.headers.get("access-control-allow-headers")?.toLowerCase()).toContain("content-type");
    }
  });

  it("does not allow an unknown origin", async () => {
    const response = await exports.default.fetch("https://wenu-api.test/health", {
      method: "OPTIONS",
      headers: { origin: "https://evil.example" },
    });
    expect(response.status).toBe(204);
    expect(response.headers.get("access-control-allow-origin")).toBeNull();
  });
});

describe("POST /shop/checkout-link", () => {
  it("builds a Mercado Pago preference for a cart under $150", async () => {
    const calls = mockMercadoPago();
    const response = await post("/shop/checkout-link", {
      email: "Ada@Example.com",
      name: "Ada Lovelace",
      items: [{ sku: "RING-1", name: "Silver ring", price: 40, qty: 1 }],
      shipping: 8,
      total: 48,
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; url: string };
    expect(body).toEqual({ ok: true, url: SANDBOX_URL });
    expect(JSON.stringify(body)).not.toContain(TOKEN);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://wenumapuonline.com");

    expect(calls).toHaveLength(1);
    expect(calls[0].authorization).toBe(`Bearer ${TOKEN}`);
    expect(calls[0].idempotency).toEqual(expect.any(String));
    expect(JSON.stringify(calls[0].body)).not.toContain(TOKEN);
    expect(calls[0].body.items).toEqual([
      { id: "RING-1", title: "Silver ring", quantity: 1, unit_price: 40, currency_id: "USD" },
      { id: "shipping", title: "Shipping", quantity: 1, unit_price: 8, currency_id: "USD" },
    ]);
    expect(calls[0].body.external_reference).toBe(calls[0].idempotency);
    expect(calls[0].body.payer).toEqual({ email: "ada@example.com", name: "Ada", surname: "Lovelace" });
    expect(calls[0].body.back_urls).toMatchObject({
      success: `https://wenumapuonline.com/gracias?type=shop&id=${calls[0].idempotency}`,
    });

    const row = await env.DB.prepare(
      "SELECT method, status, shipping, total, mp_preference_id, mp_init_point, items_json FROM orders WHERE email = ?",
    )
      .bind("ada@example.com")
      .first<{
        method: string;
        status: string;
        shipping: number;
        total: number;
        mp_preference_id: string;
        mp_init_point: string;
        items_json: string;
      }>();
    expect(row?.method).toBe("mercadopago");
    expect(row?.status).toBe("pending_payment");
    expect(row?.shipping).toBe(8);
    expect(row?.total).toBe(48);
    expect(row?.mp_preference_id).toBe("pref-test");
    expect(row?.mp_init_point).toBe(SANDBOX_URL);
    expect(JSON.parse(row?.items_json ?? "[]")).toEqual([{ sku: "RING-1", name: "Silver ring", price: 40, qty: 1 }]);
  });

  it("omits the shipping line once the subtotal reaches $150", async () => {
    const calls = mockMercadoPago();
    const subtotal = 150;
    const response = await post("/shop/checkout-link", {
      email: "free@example.com",
      name: "Free Ship",
      items: [{ sku: "EAR-2", name: "Ear weight", price: subtotal, qty: 1 }],
      shipping: shippingFor(subtotal),
      total: subtotal,
    });
    expect(response.status).toBe(200);
    expect(calls[0].body.items).toEqual([
      { id: "EAR-2", title: "Ear weight", quantity: 1, unit_price: 150, currency_id: "USD" },
    ]);
  });

  it("accepts the reserve-modal payload and applies the same shipping rule", async () => {
    const calls = mockMercadoPago();
    const response = await post("/shop/checkout-link", {
      email: "piece@example.com",
      name: "Piece Buyer",
      piece: "Bronze hoop",
      sku: "HOOP-3",
      price: "$48 USD",
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as { ok: boolean; url: string };
    expect(body.url).toBe(SANDBOX_URL);
    expect(calls[0].body.items).toEqual([
      { id: "HOOP-3", title: "Bronze hoop", quantity: 1, unit_price: 48, currency_id: "USD" },
      { id: "shipping", title: "Shipping", quantity: 1, unit_price: 8, currency_id: "USD" },
    ]);
  });

  it("rejects a missing email, an empty cart, and a manipulated total without calling Mercado Pago", async () => {
    const calls = mockMercadoPago();
    const missingEmail = await post("/shop/checkout-link", {
      email: "",
      name: "Ada",
      items: [{ sku: "RING-1", name: "Silver ring", price: 40, qty: 1 }],
      shipping: 8,
      total: 48,
    });
    const empty = await post("/shop/checkout-link", {
      email: "ada@example.com",
      name: "Ada",
      items: [],
      shipping: 0,
      total: 0,
    });
    const badTotal = await post("/shop/checkout-link", {
      email: "ada@example.com",
      name: "Ada",
      items: [{ sku: "RING-1", name: "Silver ring", price: 40, qty: 1 }],
      shipping: 8,
      total: 1,
    });
    const freeShippingTooSoon = await post("/shop/checkout-link", {
      email: "ada@example.com",
      name: "Ada",
      items: [{ sku: "RING-1", name: "Silver ring", price: 40, qty: 1 }],
      shipping: 0,
      total: 40,
    });
    expect(missingEmail.status).toBe(400);
    expect(empty.status).toBe(400);
    expect(badTotal.status).toBe(400);
    expect(freeShippingTooSoon.status).toBe(400);
    expect(((await badTotal.json()) as { ok: boolean }).ok).toBe(false);
    expect(calls).toHaveLength(0);
    const count = await env.DB.prepare("SELECT COUNT(*) AS n FROM orders").first<{ n: number }>();
    expect(count?.n).toBe(0);
  });

  it("returns 502 when Mercado Pago rejects the preference and does not echo the token", async () => {
    mockMercadoPago(500);
    const response = await post("/shop/checkout-link", {
      email: "fail@example.com",
      name: "Fail",
      items: [{ sku: "RING-1", name: "Silver ring", price: 40, qty: 1 }],
      shipping: 8,
      total: 48,
    });
    expect(response.status).toBe(502);
    const body = (await response.json()) as { ok: boolean; error: string; url?: string };
    expect(body.ok).toBe(false);
    expect(body.url).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain(TOKEN);
    const row = await env.DB.prepare("SELECT status, mp_preference_id FROM orders WHERE email = ?")
      .bind("fail@example.com")
      .first<{ status: string; mp_preference_id: string | null }>();
    expect(row?.status).toBe("payment_link_failed");
    expect(row?.mp_preference_id).toBeNull();
  });

  it("does not call Mercado Pago when the access token is missing", async () => {
    const calls = mockMercadoPago();
    const response = await worker.fetch(
      new Request("https://wenu-api.test/shop/checkout-link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "notoken@example.com",
          name: "No Token",
          items: [{ sku: "RING-1", name: "Silver ring", price: 40, qty: 1 }],
          shipping: 8,
          total: 48,
        }),
      }),
      { ...env, MERCADOPAGO_ACCESS_TOKEN: "" },
      { waitUntil() {}, passThroughOnException() {}, props: {} } as ExecutionContext,
    );
    expect(response.status).toBe(502);
    expect(calls).toHaveLength(0);
  });
});

describe("routes that stay on the iMac", () => {
  it("keeps Fastify's 404 shape for GET of a POST route", async () => {
    const response = await exports.default.fetch("https://wenu-api.test/shop/checkout-link");
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({
      message: "Route GET:/shop/checkout-link not found",
      error: "Not Found",
      statusCode: 404,
    });
  });

  it("does not publish the unauthenticated Woo audit", async () => {
    const response = await exports.default.fetch("https://wenu-api.test/audit/woo/latest");
    expect(response.status).toBe(401);
  });
});
