const SITE_HOSTS = new Set(["wenumapuonline.com", "www.wenumapuonline.com"]);

/** Origins the browser store is allowed to call. */
export function allowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  const host = url.hostname;
  if (url.protocol === "https:" && SITE_HOSTS.has(host)) return origin;
  if (url.protocol === "https:" && host.endsWith(".pages.dev") && host !== "pages.dev") return origin;
  if (url.protocol === "http:" && (host === "localhost" || host === "127.0.0.1") && url.port === "4321") {
    return origin;
  }
  return null;
}

export function preflight(origin: string | null): Response {
  const headers = new Headers();
  headers.set("vary", "Origin");
  const allowed = allowedOrigin(origin);
  if (allowed) {
    headers.set("access-control-allow-origin", allowed);
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
    headers.set("access-control-allow-headers", "content-type");
    headers.set("access-control-max-age", "86400");
  }
  return new Response(null, { status: 204, headers });
}

export function withCors(response: Response, origin: string | null): Response {
  const headers = new Headers(response.headers);
  headers.set("vary", "Origin");
  const allowed = allowedOrigin(origin);
  if (allowed) headers.set("access-control-allow-origin", allowed);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
