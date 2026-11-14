import { preflight, withCors } from "./cors";
import { json, routeNotFound } from "./http";
import { checkoutLink } from "./order";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
    const origin = request.headers.get("origin");
    if (request.method === "OPTIONS") return preflight(origin);

    let response: Response;
    try {
      response = await route(request, env, path);
    } catch (error) {
      console.error(
        JSON.stringify({
          message: "unhandled",
          path,
          error: error instanceof Error ? error.message : "error",
        }),
      );
      response = json({ ok: false, error: "Something went wrong." }, 500);
    }
    return withCors(response, origin);
  },
} satisfies ExportedHandler<Env>;

async function route(request: Request, env: Env, path: string): Promise<Response> {
  if (request.method === "GET" && path === "/health") {
    return json({
      ok: true,
      productCount: null,
      ts: new Date().toISOString(),
      runtime: "workers",
    });
  }
  if (path === "/audit/woo/latest") {
    return json({ message: "Unauthorized", error: "Unauthorized", statusCode: 401 }, 401);
  }
  if (request.method === "POST" && path === "/shop/checkout-link") {
    return checkoutLink(request, env);
  }
  return routeNotFound(request.method, path);
}
