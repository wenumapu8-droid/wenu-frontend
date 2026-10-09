# WËNÜ MÄPÜ — RITUAL RECEIPT / CHECKOUT INTEGRATION
**Date:** 2026-10-09  
**Owner:** Wenu Mapu  
**Branch:** `feature/ritual-receipt-lab-20261009`  
**State:** Frontend integration implemented, backend payment verification and physical hardware NOT implemented.

## Architecture found in existing code

- `src/components/Cart.astro`: bespoke client cart stored in `localStorage` (`wmCart`).
- `POST ${PUBLIC_API_URL}/shop/order`: accepts `email`, `name`, `method`, `items` for manual Venmo/Zelle orders and `reserve` enquiries. The response previously was consumed only as `{ok:true}`. This operation confirms **recording an order**, NOT payment.
- `POST ${PUBLIC_API_URL}/shop/checkout-link`: returns a hosted Mercado Pago URL (`{ok:true,url}`), with cards handled by MP off-site.
- `src/lib/woo.ts`: WooCommerce read-only catalog source at build time. Product availability and prices can become stale; the backend must reprice and reserve stock on purchase.
- `wenumapuonline.com`: Astro static frontend via Cloudflare (Direct Upload per `CLAUDE.md`). **A Git commit/PR does not deploy production.**
- No editable/payment-status backend repository is connected to this GitHub account (three repos visible: frontend, tools, KODEX). No verified backend receipt-status endpoint was accessible for inspection.

## What is implemented now in the feature branch

1. `src/components/RitualReceipt.astro`: branded fullscreen/print UI, 80mm print CSS, motion-reduced fallback, real Code39 barcode of support reference, order itemization and subtotal (NOT taxes/shipping). Copy explicitly distinguishes `INQUIRY / NO PAYMENT` and `ORDER RECEIVED / PAYMENT PENDING`. Ticket never counts as a tax invoice.
2. `src/components/Cart.astro`: imports component; **only** on a successful `/shop/order` response, captures an acknowledgement and opens the ticket after the server accepted the order. Failing requests leave the prior error UI and do NOT print a receipt. No paid state is constructed from user clicks or a manual payment claim.
3. Card flow: before redirecting to MP, saves non-sensitive cart item snapshot and optional backend `receipt_token` in sessionStorage. **Does not alter the checkout-link request contract or redirect URL**.
4. `src/pages/payment-return.astro`: safe payment-return page, `noindex`, with pending ticket fallback. Ignores all untrusted Mercado Pago `status` query parameters and only claims paid on a strictly verified API result from the intended receipt-status route. Existing backend **does not yet point back to this route**.
5. Existing separate prototype `/ritual-receipt-lab/` remains as a noindex experience lab.

## Mandatory backend contract (NOT yet implemented)

### Hosted-card creation — existing `POST /shop/checkout-link`

Reprice the actual order server-side from current WooCommerce products/variations, reserve inventory atomically, create a `pending_payment` record, and create an MP preference/order with a unique opaque `external_reference` pointing to **server-side** order state.

Return unchanged `{ok:true,url}`, optionally adding `receipt_token` (>=24 random url-safe characters, high entropy, short TTL, restricted scope). The frontend stores this token in sessionStorage before redirect. Never expose processor secret credentials. Restrict any caller-provided return URL to an explicit allowlist to prevent open redirects.

Configure Mercado Pago `back_urls.success`, `back_urls.pending` and `back_urls.failure` to Wenu Mapu's `https://wenumapuonline.com/payment-return/` (or include an opaque, short-lived receipt token as query ONLY when there is no other way to carry it). `auto_return:'approved'` is optional. These callbacks are **UX only**; NEVER mark paid from their query parameters.

### Webhook processor (server-only)

Validate MP's `x-signature` (HMAC-SHA256 according to current MP documentation), fetch the payment/order from MP's authenticated API, verify merchant account + order reference + amount + currency + exact final payment status, then update payment status transactionally. Deduplicate by event/payment/order ID. Ignore any client-supplied `paid:true`. Handle chargebacks, refunds and partial/cancelled payments. **No network payment calls from client code**.

### Verify route (new: `GET /shop/receipt-status?token=...`)

Only after authenticating token/scope and retrieving backend-verified status:

```json
{
  "ok": true,
  "verified": true,
  "status": "paid",
  "receipt": {
    "reference": "WM-ORDER-XXXX",
    "method": "Card",
    "currency": "USD",
    "subtotal": 124.00,
    "items": [
      { "name": "Ritual hanger", "qty": 1, "price": 124.00 }
    ]
  }
}
```

Non-paid states can respond `{ok:true,verified:false,status:"pending"}`, `"failed"` or `"cancelled"`. The order details must be disclosed only after verifying a buyer-scoped token; return no customer address, billing details, phone, email, bank/card digits, or secrets. Use HTTPS, rate limits, `Cache-Control: private, no-store`, same-origin/allowlisted CORS, and privacy-conscious logs. Frontend does not trust `status=approved` redirects.

**Precision:** Current ticket displays `ITEMS SUBTOTAL`, not amount charged. Include authenticated full total/tax/shipping/payment reference and statutory receipt only after backend and tax integration support them.

## Venmo / Zelle and Reserve

Manual transfer flows remain **pending verification** after a successful `/shop/order` call. Reconcile Venmo/Zelle deposits in the private backend (by unique order reference, date, amount, sender). Advance to `paid` ONLY on confirmed bank/provider settlement, not when buyer says "I've sent payment". A reserve enquiry remains a request with no charge.

If an in-person POS flow is added for Boom / O.Z.O.R.A. in 2027, use a POS transaction ID and the same verified-order backend status machine.

## 58/80mm hardware

Current browser print button opens the native printer dialog. It **does not** physically eject paper automatically. Automatic shop/studio printing requires an authenticated local bridge and compatible ESC/POS printer (USB, Wi-Fi or Bluetooth), with explicit pairing and human-approved authorization. Print once per verified order event, with idempotency key and reprint controls; handle printer disconnected, exhausted paper and retries. Never expose local printer ports to the public website.

## Acceptance checks before production

- [ ] `npm run build` (needs private WooCommerce build keys in trusted local/CI; optional `ALLOW_EMPTY_PRODUCTS=true` for isolated smoke build only)
- [ ] QA mobile/desktop, keyboard/focus, visual ticket, font, barcode scanner reading and actual 80mm output.
- [ ] Confirm returned order ID/reference payload format from the real `POST /shop/order`.
- [ ] Failure to record an order must NEVER open receipt.
- [ ] Venmo/Zelle must NEVER show paid immediately after submitting.
- [ ] Mercado Pago sandbox: approved, declined, pending, duplicate webhooks, cancelled, chargeback/refund, retry, network outage.
- [ ] Verify no PII in public HTML, URLs, logs, barcode or Analytics.
- [ ] Verify backend calculation of taxes, shipping, discounts and current stock.
- [ ] Verify email transactional template, record of fiscal invoice when legally applicable.
- [ ] Deploy ONLY after review and human verification of backend and real checkout.

## Decision

Keep **draft PR #170** unmerged and production unchanged until the backend contract and integration testing are satisfied. Frontend/manual receipt experience is ready for review now.

### Official references

Mercado Pago: configure back URLs https://www.mercadopago.com.br/developers/en/docs/checkout-pro-preferences/configure-back-urls  
Mercado Pago: signature and webhook notification https://www.mercadopago.com.br/developers/en/docs/links-and-debts/additional-content/your-integrations/notifications/webhooks
