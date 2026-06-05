// Inactive in static build (Astro 6 output: 'static' ignores API routes without prerender=false).
// The newsletter popup posts here first, then falls back to mailto if this returns
// non-OK or is unavailable. Activate by switching to hybrid/server output + SSR adapter
// once MailerLite env vars are configured per mailerlite-setup-owner-checklist.md.
import type { APIRoute } from 'astro';
import { subscribeNewsletter, type NewsletterPayload } from '../../lib/subscribe';

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export const GET: APIRoute = () =>
  new Response(JSON.stringify({ ok: true, configured: false }), {
    headers: { 'content-type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  let payload: NewsletterPayload;

  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false, message: 'Invalid JSON payload.' }, { status: 400 });
  }

  if (!payload.email || !isEmail(payload.email)) {
    return Response.json({ ok: false, message: 'Email is invalid.' }, { status: 400 });
  }

  try {
    const result = await subscribeNewsletter(payload);
    return Response.json(result, { status: result.ok ? 200 : 202 });
  } catch {
    return Response.json({ ok: false, configured: true, message: 'Submission failed.' }, { status: 502 });
  }
};
