// SNIPPET — DRAFT, NOT WIRED
// Move to src/lib/subscribe.ts when Codex executes Task 3.
//
// Provider-agnostic subscriber helper. Reads MAILERLITE_API_KEY from env.
// Returns { ok: true } on success.
// Returns { ok: false, reason: 'no-provider' } when env key absent — caller renders fallback panel.
// Returns { ok: false, reason: 'provider-<status>' } on API error.

export interface SubscribePayload {
  email: string;
  name?: string;
  fields?: Record<string, string | number | boolean>;
  tags: string[]; // e.g., ["source:home-footer", "tier:circle", "consent:marketing"]
}

export interface SubscribeResult {
  ok: boolean;
  reason?: string;
}

const ML_BASE = 'https://connect.mailerlite.com/api';

function getApiKey(): string | undefined {
  // Astro exposes import.meta.env at build time AND runtime (server endpoints).
  // process.env is the Node fallback.
  // @ts-expect-error - import.meta.env is provided by Astro
  const fromAstro = typeof import.meta !== 'undefined' ? import.meta.env?.MAILERLITE_API_KEY : undefined;
  const fromNode = typeof process !== 'undefined' ? process.env?.MAILERLITE_API_KEY : undefined;
  return fromAstro ?? fromNode;
}

function redact(s: string): string {
  // Redact anything that looks like a JWT or long bearer token.
  return s.replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer <REDACTED>');
}

export async function subscribeToList(p: SubscribePayload): Promise<SubscribeResult> {
  const key = getApiKey();
  if (!key) return { ok: false, reason: 'no-provider' };

  // 1. Subscribe (or upsert).
  const subResp = await fetch(`${ML_BASE}/subscribers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      email: p.email,
      fields: { name: p.name ?? '', ...p.fields },
    }),
  });

  if (!subResp.ok) {
    return { ok: false, reason: `provider-${subResp.status}` };
  }

  // 2. Apply tags. MailerLite v2 expects per-tag POSTs.
  for (const tag of p.tags) {
    try {
      await fetch(
        `${ML_BASE}/subscribers/${encodeURIComponent(p.email)}/tags`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${key}`,
          },
          body: JSON.stringify({ name: tag }),
        }
      );
    } catch (err) {
      // Tag failures should not break the subscription. Log redacted error.
      const msg = err instanceof Error ? redact(err.message) : 'unknown';
      // eslint-disable-next-line no-console
      console.warn(`[subscribe] tag '${tag}' failed: ${msg}`);
    }
  }

  return { ok: true };
}
