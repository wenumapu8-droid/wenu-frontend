export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/** Same JSON shape the live Fastify API returns for a missing route. */
export function routeNotFound(method: string, path: string): Response {
  return json(
    {
      message: `Route ${method}:${path} not found`,
      error: "Not Found",
      statusCode: 404,
    },
    404,
  );
}

const MAX_BODY_BYTES = 16_384;

export async function readJson(request: Request): Promise<{ ok: true; value: unknown } | { ok: false; status: number }> {
  const type = request.headers.get("content-type");
  if (type && !type.toLowerCase().includes("application/json")) {
    return { ok: false, status: 415 };
  }
  const reader = request.body?.getReader();
  if (!reader) return { ok: false, status: 400 };
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel();
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) };
  } catch {
    return { ok: false, status: 400 };
  }
}
