# Wenu Mapu — Email System Overview

Date: 2026-05-10 (overnight build)
Owner: marimari@wenumapuonline.com

This is the map of how email works for Wenu Mapu. Three layers, each with its own purpose.

---

## The 3 layers

```
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 1 — Branded transactional emails (Node + Titan SMTP)     │
│  Location: ~/wenu-agent-hub/email/                              │
│  Sends:    one-off confirmations, manual sends, scripted batches│
│  Use when: you need a beautiful one-off send NOW                │
│             (welcome, commission ack, appointment, curation)    │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 2 — WordPress transactional (WP Mail SMTP → Titan)       │
│  Plugin:   WP Mail SMTP                                         │
│  Sends:    Contact form notifications, WC order confirmations,  │
│            password resets, registrations                       │
│  Use when: automatic — triggered by WP/WC events                │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│  LAYER 3 — Marketing / lifecycle (MailerLite)                   │
│  Sends:    The Wenu Mapu List newsletter (Day 0/7/14 welcome,   │
│            monthly Journal entries, drops, restock alerts)      │
│  Use when: scheduled / segmented sends to a list                │
└─────────────────────────────────────────────────────────────────┘
```

All three use **Titan** as the underlying SMTP provider (and share the same DKIM/SPF DNS records), so deliverability is consistent across layers.

---

## Quick decision guide

| I want to... | Use |
|---|---|
| Send a one-off welcome email to a new subscriber | Layer 1: `node email/scripts/send.mjs welcome-circle --to <email>` |
| Reply to a commission inquiry with the standard template | Layer 1: `commission-ack` |
| Confirm an appointment booking | Layer 1: `appointment-confirm` |
| Send a curation request first-reply | Layer 1: `curation-reply` |
| Day 3 / 14 / 90 aftercare check-in | Layer 1: `aftercare-day-3/14/90` (manually triggered or cron'd) |
| Have the WC checkout email customers automatically | Layer 2: WP Mail SMTP routes WC's default templates through Titan |
| Have the contact form notify marimari@ when filled | Layer 2: WP Mail SMTP routes Jetpack/CF7/WPForms emails through Titan |
| Send a monthly Journal entry to all subscribers | Layer 3: MailerLite campaign |
| Send a drop announcement to subscribers | Layer 3: MailerLite |
| Day-of-signup welcome email + 7-day + 14-day | Layer 3: MailerLite Automation (replicate Layer 1 `welcome-circle` content in MailerLite's editor) |

---

## What's built (2026-05-10)

### Layer 1 ✅ READY (this build)

- 9 branded HTML templates with plain-text alternatives
- SMTP send via Titan (verified working)
- Preview CLI: `node email/scripts/preview.mjs` opens all templates in your browser
- Send CLI: `node email/scripts/send.mjs <template> --to <addr> --vars '<json>'`
- Multipart/alternative MIME headers (HTML renders + plain text falls back)
- List-Unsubscribe header injection when `unsubscribeUrl` provided
- Detects + warns about legacy `contact@` addresses in `.env`

See `~/wenu-agent-hub/email/README.md` for the full reference.

### Layer 2 📋 CHECKLIST READY

- Setup guide: `wp-mail-smtp-setup.md` (owner-driven, ~30 min)
- Routes WC + contact form + password reset emails through Titan
- DKIM/SPF DNS setup shared with Layer 3

### Layer 3 📋 CHECKLIST READY

- Setup guide: `mailerlite-setup-owner-checklist.md` (owner-driven, ~45 min)
- 3-email welcome flow drafted (Day 0/7/14)
- Group/tag scheme defined matching capture surfaces

---

## End-to-end test plan (verify everything works)

After all 3 layers are configured:

```bash
# Layer 1 — direct branded send
cd ~/wenu-agent-hub
node email/scripts/send.mjs welcome-circle --to wenu.mapu8@gmail.com --vars '{"firstName":"Test"}'
# Check inbox: arrives within 60s, HTML renders, Gmail shows SPF + DKIM pass
```

```bash
# Layer 2 — WP contact form
# Browser: incognito → wenumapuonline.com/contact-2/ → submit form with test@yourdomain.com
# Check marimari@ inbox: notification arrives, From = Wenu Mapu, body renders
```

```bash
# Layer 3 — MailerLite
# In MailerLite dashboard: subscribe a test email via API or form, verify Day 0 email arrives
```

---

## Brand consistency

All 3 layers use the same:

- **Sender domain:** wenumapuonline.com
- **From: identity:** `Wenu Mapu <marimari@wenumapuonline.com>` (or alias like `journal@`, `orders@`, `custom@`)
- **Color palette:** Obsidian #080706 · Bone #F2EDE4 · Bronze #8A6A43 · Ember #C4935A · Sand #D6C1A3 · Silver #A8A39A
- **Typography:** DM Serif Display (headings) / Source Serif Pro (body) / Inter (UI) — with email-safe fallbacks to Georgia / Helvetica
- **Voice:** ritual, ancestral, direct. Voice rules in `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md`
- **Footer block:** Truckee CA · email + phone + IG · postal address · privacy link

If you find a branded email that doesn't match, it's a bug — flag it.

---

## Forbidden in ALL email layers

Same forbidden lexicon as the website. Audit before sending any non-templated mail:

- Petrolia, Sherman Rd, Rizoma Digital, Northbound (legacy)
- +1 (458) 226-6027, +145 8226 6027 (legacy phones)
- contact@wenumapuonline.com, contacto@…, wenu.mapu8@gmail.com (do not surface to customers)
- Showroom at home, vitrine, walk-ins, studio location
- Truth Tattoo, Troll Studio, Lucky7
- beautiful, magical, enchanted, perfect, positive energy
- Mapuche Root, Earthly, Earthborn
- "10% off your first order" / discount-bait

---

## Sending rates (avoid spam classification)

| Period | Layer 1 (manual) | Layer 2 (WC/forms) | Layer 3 (MailerLite) |
|---|---|---|---|
| Per minute | ≤ 10 | (auto, low volume) | (MailerLite handles throttling) |
| Per day | ≤ 100 | depends on store traffic | ≤ 500 (free tier) |
| Per month | ≤ 1,000 | depends on store traffic | ≤ 12,000 (free tier) |

If you cross 100 sends/day on Layer 1, consider moving the lifecycle stuff to MailerLite for proper queueing.

---

## DNS requirements (one-time, owner does in Cloudflare)

For deliverability all 3 layers need:

| Record | Where | Value |
|---|---|---|
| SPF (TXT @) | Cloudflare DNS | `v=spf1 include:spf.titan.email include:_spf.mlsend.com ~all` (when MailerLite added) |
| DKIM | Cloudflare DNS | Titan provides; MailerLite provides (separate selectors) |
| DMARC | Cloudflare DNS | `v=DMARC1; p=none; rua=mailto:marimari@wenumapuonline.com` (start, then tighten to `p=quarantine`) |

Owner-only. See `mailerlite-setup-owner-checklist.md` §2 for Cloudflare DNS click path.

---

## What broke before (and is now fixed)

| Problem | Cause | Fix |
|---|---|---|
| Test from Titan composer arrived as raw HTML | Titan webmail treats pasted HTML as text | Use Layer 1 CLI (`send.mjs`) — sets Content-Type correctly |
| WP contact form emails go to spam | No DKIM/SPF on WP-sent emails | Layer 2: WP Mail SMTP routes through Titan with proper signing |
| Contact emails from `wordpress@…` look unprofessional | WP default sender | Layer 2: Force From `Wenu Mapu <marimari@…>` |
| Newsletter sign-up has no welcome email | No provider wired | Layer 1 manual send via `welcome-circle` template OR Layer 3 MailerLite automation |
| Footer widget escaped HTML when saved in Visual mode | WP widget editor escaped tags | Workaround: paste plain text (auto-converts to `<br>`); long-term: use Custom HTML widget |

---

## Reference

- `~/wenu-agent-hub/email/README.md` — Layer 1 detailed
- `~/wenu-frontend/wp-mail-smtp-setup.md` — Layer 2 detailed
- `~/wenu-frontend/mailerlite-setup-owner-checklist.md` — Layer 3 detailed
- `~/wenu-frontend/wenu-subscription-and-journal-system.md` — strategy (Wenu Mapu List)
- `~/wenu-frontend/wenu-contact-and-operations-plan.md` — alias plan + canonical contact block
- `~/wenu-frontend/inquiry-response-templates.md` — manual Gmail-paste templates
