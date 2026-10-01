# KDX.REVENUE.001 — Booking Engine P0

Status: IMPLEMENTING  
Owner: Ocín / Wënü Mäpü  
Branch: `feat/kdx-revenue-booking-p0`  
Started: 2026-10-01

## Goal

Turn the existing Wënü Mäpü piercing configurator into a measurable booking funnel that can hand off to real scheduling and payment without pretending a booking is confirmed before the external provider confirms it.

## What is already real

`src/components/BookingBuilder.astro` already provides:

- placement selection;
- jewelry selection;
- pricing total;
- preferred date;
- preferred time window;
- email handoff;
- WhatsApp handoff;
- ear-constellation handoff.

This P0 does **not** replace that system. It makes it commercially instrumentable and ready for live scheduling.

## P0 implementation

### 1. Live scheduling feature flag

Environment variable:

```text
PUBLIC_PIERCING_BOOKING_URL=https://cal.com/YOUR_USER/YOUR_EVENT
```

When absent:

```text
builder → email / WhatsApp → human confirmation
```

When present:

```text
builder → live scheduling URL → provider confirms slot
                     ↘ email / WhatsApp fallback
```

No API secret is needed in the static Astro frontend.

### 2. Funnel instrumentation

The builder emits non-PII funnel events through `window.dataLayer` when available and a browser `wenu:booking` CustomEvent:

- `booking_started`
- `booking_builder_ready`
- `booking_handoff_live`
- `booking_request_email`
- `booking_request_whatsapp`

Event metadata is limited to placement ID, jewelry ID, price/value, currency and source.

Free-text notes are deliberately excluded because they may contain health or other sensitive information.

### 3. Session handoff

Before leaving for live scheduling, the builder stores a non-sensitive summary in:

```text
sessionStorage: wenu-booking-intent-v1
```

This creates a future path for a return/success screen, conversion attribution, or a more tightly integrated booking experience without storing medical/free-text information.

### 4. Attribution

The live booking URL receives standard UTM parameters:

- `utm_source=wenumapuonline.com`
- `utm_medium=owned_web`
- `utm_campaign=piercing_booking`
- `utm_content=<placement>-<jewelry>`

Cal.com documents standard UTM tracking for booking links and allows custom/hidden booking fields when deeper attribution is needed.

## Provider setup — Cal.com path

Recommended P0:

1. Create one piercing appointment event type.
2. Connect the calendar that represents real availability.
3. Configure duration, buffers, minimum notice, cancellation/reschedule policy.
4. Add booking fields required for client identity and studio logistics.
5. Connect Stripe in the event type payments settings.
6. Set the paid-event amount to the intended **deposit**, not the full service price, if Wënü wants the rest collected in person.
7. Generate the public event URL.
8. Set that URL in Cloudflare Pages as `PUBLIC_PIERCING_BOOKING_URL`.
9. Deploy a preview branch.
10. Test one end-to-end booking using a test/low-risk configuration before production.

Important: service prices shown in Wënü remain the appointment estimate. The external paid-event amount must be described explicitly as a deposit if it is not the final total.

Official references:
- https://cal.com/embed
- https://cal.com/help/bookings/utm-tracking
- https://cal.com/docs/platform/atoms/stripe-connect
- https://cal.com/docs/atoms/guides/booking-fields

## Acceptance criteria

P0 is not DONE until all of these are true:

- [x] Live booking handoff is feature-flagged.
- [x] Existing manual fallback is preserved.
- [x] No secret keys are committed.
- [x] Funnel events exist.
- [x] Notes/health free text are excluded from analytics/session metadata.
- [x] UTM attribution is appended to live booking handoff.
- [ ] Real scheduling URL is configured.
- [ ] Calendar availability is connected.
- [ ] Stripe/deposit is configured.
- [ ] Preview build passes.
- [ ] Mobile booking flow tested.
- [ ] One end-to-end booking completed.
- [ ] One real client booking or internal controlled test is logged.
- [ ] Conversion events verified in analytics.

## Commercial product extraction

Once Wënü passes the end-to-end test, extract the reusable parts into:

```text
KDX BOOKING ENGINE
├── ServiceConfig
├── PricingConfig
├── BookingBuilder
├── SchedulingHandoff
├── FunnelEvents
├── ProviderConfig
└── CaseStudyInstrumentation
```

Then Wënü Mäpü becomes **Case Study 001**, not a one-off implementation.

## Revenue gate

The experiment changes status only with evidence:

```text
BUILDING → DEPLOYED → VALIDATED → SOLD → RECURRING
```

A deployed page without a completed paid booking is not yet a commercial result.
