// SNIPPET — DRAFT, NOT WIRED
// Move to src/pages/api/subscribe.ts when Codex executes Task 3.
//
// Generic Astro server endpoint for newsletter / journal capture.
// Accepts: { email, name?, fields?, tags[] }
// Returns: { ok: boolean, reason?: string }

import type { APIRoute } from 'astro';
import { subscribeToList, type SubscribePayload } from '../../lib/subscribe';

export const POST: APIRoute = async ({ request }) => {
  let payload: SubscribePayload;
  try {
    payload = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ ok: false, reason: 'bad-json' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!payload?.email || typeof payload.email !== 'string') {
    return new Response(
      JSON.stringify({ ok: false, reason: 'missing-email' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!Array.isArray(payload.tags) || payload.tags.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, reason: 'missing-tags' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result = await subscribeToList(payload);

  // Always return 200 even on no-provider — frontend uses { ok, reason } to decide what to show.
  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
