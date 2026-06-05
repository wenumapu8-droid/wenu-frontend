export type CustomOrderPayload = {
  name: string;
  email: string;
  pieceType: string;
  placement?: string;
  material: string;
  stone?: string;
  budget: string;
  timing: string;
  specificDate?: string;
  story: string;
  inspirationUrl?: string;
  consent: boolean;
};

type SubscribeResult = {
  ok: boolean;
  configured: boolean;
  message: string;
};

const MAILERLITE_API_URL = 'https://connect.mailerlite.com/api/subscribers';

const cleanTagValue = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'open';

export const hasMailerLiteConfig = () => Boolean(process.env.MAILERLITE_API_KEY);

export async function subscribeCustomOrder(payload: CustomOrderPayload): Promise<SubscribeResult> {
  const token = process.env.MAILERLITE_API_KEY;

  if (!token) {
    return {
      ok: false,
      configured: false,
      message: 'MailerLite is not configured. Use the mailto fallback.',
    };
  }

  const response = await fetch(MAILERLITE_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: payload.email,
      fields: {
        name: payload.name,
        piece_type: payload.pieceType,
        placement: payload.placement,
        material: payload.material,
        stone: payload.stone,
        budget: payload.budget,
        timing: payload.timing,
        specific_date: payload.specificDate,
        story: payload.story,
        inspiration_url: payload.inspirationUrl,
      },
      groups: [],
      tags: [
        'source:custom-orders-form',
        'tier:commission-queue',
        `interest:material:${cleanTagValue(payload.material)}`,
      ],
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      configured: true,
      message: 'MailerLite rejected the subscription request.',
    };
  }

  return {
    ok: true,
    configured: true,
    message: 'Inquiry received.',
  };
}

export type NewsletterPayload = {
  email: string;
  name?: string;
  source?: string;
};

export async function subscribeNewsletter(payload: NewsletterPayload): Promise<SubscribeResult> {
  const token = process.env.MAILERLITE_API_KEY;

  if (!token) {
    return {
      ok: false,
      configured: false,
      message: 'MailerLite is not configured. Use the mailto fallback.',
    };
  }

  const response = await fetch(MAILERLITE_API_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: payload.email,
      fields: payload.name ? { name: payload.name } : {},
      groups: [],
      tags: [
        'source:newsletter',
        `entry:${cleanTagValue(payload.source || 'site-popup')}`,
      ],
    }),
  });

  if (!response.ok) {
    return {
      ok: false,
      configured: true,
      message: 'MailerLite rejected the subscription request.',
    };
  }

  return {
    ok: true,
    configured: true,
    message: 'Subscribed.',
  };
}
