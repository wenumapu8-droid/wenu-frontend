// Inactive in static build (Astro 6 output: 'static' ignores API routes without prerender=false).
// Activate by switching to hybrid/server output + SSR adapter once MailerLite env vars
// are configured per mailerlite-setup-owner-checklist.md.
import type { APIRoute } from 'astro';
import { subscribeCustomOrder, type CustomOrderPayload } from '../../lib/subscribe';

const required = ['name', 'email', 'pieceType', 'material', 'budget', 'timing', 'story'] as const;

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: true, configured: false }), {
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  let payload: CustomOrderPayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, message: 'Invalid JSON payload.' }, { status: 400 });
  }

  const missing = required.filter(key => !String(payload[key] ?? '').trim());
  if (missing.length > 0 || !payload.consent) {
    return Response.json({ ok: false, message: 'Required fields are missing.' }, { status: 400 });
  }

  if (!isEmail(payload.email)) {
    return Response.json({ ok: false, message: 'Email is invalid.' }, { status: 400 });
  }

  try {
    const result = await subscribeCustomOrder(payload);
    return Response.json(result, { status: result.ok ? 200 : 202 });
  } catch {
    return Response.json({ ok: false, configured: true, message: 'Submission failed.' }, { status: 502 });
  }
};
