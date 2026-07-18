// Deprecated newsletter endpoint kept only to fail explicitly.
// Real newsletter signup now lives in the Klaviyo embed rendered on the home page.
// In this static Astro build, /api/subscribe should not be used.
import type { APIRoute } from 'astro';

const payload = {
  ok: false,
  configured: false,
  deprecated: true,
  message: 'Newsletter signup moved to the Klaviyo embed on the home page.',
};

export const GET: APIRoute = () =>
  Response.json(payload, {
    status: 410,
    headers: { 'cache-control': 'no-store' },
  });

export const POST: APIRoute = () =>
  Response.json(payload, {
    status: 410,
    headers: { 'cache-control': 'no-store' },
  });
