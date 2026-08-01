# Wenu Mapu — Subscription & Journal System

Date: 2026-05-09→10 (overnight)
Scope: platform comparison and design for **The Wenu Mapu List** (newsletter), the **Journal** content funnel, and adjacent capture surfaces (custom orders, restock alerts, aftercare follow-ups). Strategy + spec; no integration done. Implementation belongs to Codex Task 3.

Companion docs:
- `wenu-contact-and-operations-plan.md` — email aliases (`journal@`, `orders@`, `custom@`)
- `full-site-completion-plan.md` — Journal page spec
- `market-reference-study-wenu-mapu.md` §9, §10 — editorial Journal as email moat (Aesop / Buddha / Iris / Kin)

---

## 1. The Wenu Mapu List — what it is

**Brand register:** "The Wenu Mapu List" or "The circle." Use either consistently — recommended: **"Join the circle"** as button copy, **"The Wenu Mapu List"** as the formal name in legal/compliance.

**Promise to subscribers:**
> First access to limited drops, new Journal entries, and quiet announcements about new pieces — written by the maker, sent rarely.

**Cadence target:** 1-2 sends per month. Never daily, never weekly. Premium niche brands earn email by scarcity + signal, not volume.

**No discount bait.** Convergent pattern across Aesop, Maria Tash, BVLA, Buddha Jewelry, Kin Euphorics: none lead capture with "10% off." Wenu Mapu must not break this.

---

## 2. Subscriber tags / segments

Designed for clean lifecycle automation. Each subscriber has one or more tags applied at capture time.

| Tag | Source | Used for |
|---|---|---|
| `source:home-footer` | Footer signup on any page | baseline list |
| `source:journal` | Capture from Journal hub or per-entry | "wants editorial" — gets new-entry pings |
| `source:product-page` | "Notify me when restocked" on PDP | restock alerts only |
| `source:custom-orders-form` | Custom-order inquiry | commission queue, separate cadence |
| `source:aftercare` | "Get the aftercare guide" download | aftercare follow-up sequence (3 emails) |
| `source:appointment-request` | `/stockists` form | appointment-confirmation flow |
| `interest:material-vacamuerta` (etc.) | Quiz / preference center | material-specific drops |
| `interest:placement-stretched` (etc.) | Same | placement-specific drops |
| `tier:circle` | Default | base list |
| `tier:inner-circle` | Future loyalty (Rage Nation pattern) | early access to drops |
| `consent:marketing` | Required at capture | CAN-SPAM / CASL compliance |
| `consent:transactional-only` | Order or appointment without marketing | order/aftercare emails only |

---

## 3. Platform comparison

Constraints:
- US-based (Wenu Mapu operates from CA)
- Must support multi-form embed (footer, hero, journal, PDP, custom-orders form recipient)
- Tagging + automation
- Reasonable free / starter tier (small list initially)
- Clean editorial templates (no garish "10% off" defaults)
- WooCommerce integration possible later (optional now)
- Privacy-respecting (GDPR + CCPA toggle)

| Platform | Free tier | Tagging | Automation | WC integration | Editorial templates | Notes |
|---|---|---|---|---|---|---|
| **Brevo** (formerly Sendinblue) | 300/day on 100k contacts free | ✅ | ✅ | ✅ official | ⚠ generic | Strongest free tier; SMS optional; EU-based but US-compliant |
| **MailerLite** | 1k contacts / 12k emails / mo | ✅ | ✅ | ✅ official | ✅ clean | Best editorial templates; clean automations; light branding on free |
| **Mailchimp** | 500 contacts / 1k emails / mo | ⚠ tags as "audiences" — annoying multi-list quirk | ✅ | ✅ official | ⚠ generic | Most popular but worst free terms; we recommend not |
| **Klaviyo** | 250 contacts free | ✅ | ✅ best-in-class | ✅ official, deep | ✅ clean | Best for e-commerce automation; most expensive at scale; overkill at <500 list |
| **FluentCRM** | self-hosted, one-time license | ✅ | ✅ | ✅ best (it lives in WP) | ⚠ depends on theme | WordPress plugin — keeps everything in the legacy WP install; no SaaS cost |
| **Buttondown** | 100 subs free | ⚠ light | ⚠ light | ❌ | ✅ minimal/markdown | Editorial-first; good for journal-only register; missing e-comm features |

### Recommendation: **MailerLite** to start

Reasons:
1. Free tier covers the first 1,000 subscribers with 12,000 sends/month — enough for 6-12 months of growth.
2. Editorial templates are clean enough to match the brand (other tools default to garish promo styles).
3. Tagging + simple automations are exactly what's needed; no Klaviyo-tier complexity required.
4. Official WooCommerce integration available when needed (no rebuild later).
5. The editor is friendly enough that the founder can write a Journal entry without Claude/Codex involvement.

Switch to **Klaviyo** later only if list passes ~5,000 subscribers and product feed automation becomes important.

Switch to **FluentCRM** only if the entire stack consolidates back to WordPress — unlikely given the Astro direction.

**Owner action required:** sign up for MailerLite at mailerlite.com under marimari@wenumapuonline.com. Confirm sender domain `wenumapuonline.com` (DKIM + SPF). DNS changes for DKIM are owner-only; do NOT auto-execute.

---

## 4. Capture surfaces

### 4.1 Homepage signup (footer Newsletter component)

**Position:** in current Newsletter section (replaces Phase 1 mailto fallback once provider is wired).
**Eyebrow:** JOIN THE CIRCLE
**Headline:** Join the circle.
**Body:** First access to limited drops and new Journal entries. Written by the maker. Sent rarely.
**Field:** Email
**Consent line (required):** "I want to receive emails from Wenu Mapu about new pieces, drops, and Journal entries." (CAN-SPAM compliant)
**Submit:** Subscribe
**Tag applied:** `source:home-footer`, `tier:circle`, `consent:marketing`

### 4.2 Journal hub signup (`/journal`)

**Eyebrow:** THE WENU MAPU LIST
**Headline:** Let the next entry find you.
**Body:** Each new Journal entry — material stories, process notes, drop announcements — sent to your inbox. No more, no less.
**Tag applied:** `source:journal`, `interest:editorial`

### 4.3 Per-Journal-entry CTA (end of every entry)

Inline block at the foot of each entry:
> **Want the next entry?**
> Each new Journal entry is sent to The Wenu Mapu List once a month. Join the circle.
> [Email field] [Subscribe]
**Tag applied:** `source:journal`, `interest:<entry-topic-tag>` (e.g., `interest:material-vacamuerta` for the meteorite entry)

### 4.4 Aftercare signup

**Position:** on `/care-guide` (as a side-card, NOT modifying core aftercare content per DO_NOT_TOUCH.md).
**Note on positioning:** care-guide files are off-limits for edits. Place this signup OUTSIDE the aftercare deliverable, on a NEW page `/care-guide/follow-up/` OR on a small panel rendered above/below the embed if implemented as an iframe. Best approach: a small Astro page `/aftercare-follow-up.astro` that links FROM /care-guide.
**Eyebrow:** AFTERCARE FOLLOW-UP
**Headline:** Aftercare reminders, sent on schedule.
**Body:** Three short emails on days 3, 14, and 90 with what to expect, what to avoid, and when to come back for a check-in. Free.
**Tag applied:** `source:aftercare`, `interest:aftercare`

### 4.5 Custom orders form

**Position:** `/custom-orders` page (replaces Phase 1 mailto fallback).
**Fields:** Name · Email · Type of piece · Material preference · Indicative budget (USD) · Date you'd want it (optional) · Your idea, story, or reference (textarea)
**Consent line:** "I understand the 6-month lead time and the 50% deposit on confirmation." (already in i18n)
**Tag applied:** `source:custom-orders-form`, `tier:commission-queue`
**Recipient:** `custom@wenumapuonline.com` (forwards to marimari@ until split)

### 4.6 Appointment / local delivery request

**Position:** `/stockists` page.
**Fields:** Name · Email · Phone (optional) · Pieces you'd like to see (textarea) · Preferred dates · Local delivery vs in-person view (radio)
**Tag applied:** `source:appointment-request`, `interest:appointment` or `interest:local-delivery`
**Recipient:** `marimari@wenumapuonline.com` (until styling@ alias is created)

### 4.7 PDP "Notify me when back in stock" (deferred)

Out of scope for first build. Add when WC stock data is wired to MailerLite via the official integration.

---

## 5. First 3-email welcome flow

For `tier:circle` subscribers (anyone joining via home/journal). Sent on a 7-day cadence.

### Email 1 — Day 0 (immediate)

**Subject:** Welcome to the circle.
**From:** Wenu Mapu <journal@wenumapuonline.com>
**Reply-to:** marimari@wenumapuonline.com

```
Mari mari,

Thank you for joining The Wenu Mapu List.

This is what you can expect from this circle:

— Quiet announcements when a new piece leaves the workshop.
— First access to limited drops, before they go to the catalogue.
— Journal entries on the materials, the process, the cosmology behind the pieces.
— No discount bait. No daily emails. We send rarely, and only when there is something to say.

If you'd like to know what we're about, the place to start is the manifesto:
→ https://wenumapuonline.com/about

If you're ready to look:
→ https://wenumapuonline.com/shop

If you'd prefer to be guided to a piece by the maker:
→ Reply to this email with what you're drawn to.

— Wenu Mapu
Truckee, California
```

### Email 2 — Day 7

**Subject:** What we forge, and why.
**From:** Wenu Mapu <journal@wenumapuonline.com>

A short version of the brand origin: 4 short paragraphs (Truckee studio, hand-forging, materials canon, the body as sacred territory). Ends with one CTA: read the first Journal entry, "What is Vacamuerta meteorite?"

### Email 3 — Day 14

**Subject:** A piece, before anyone else sees it.
**From:** Wenu Mapu <journal@wenumapuonline.com>

A single hand-picked piece from the catalogue, framed as a soft "first look." 3 paragraphs: piece name + material, why it was chosen for this email, how to inquire. Single CTA: view the piece.

After day 14: subscriber rolls into the regular monthly Journal cadence (`source:journal` and base list).

---

## 6. Footer / homepage / journal signup copy reference

Compact copy variants for direct paste:

### Footer (compact)

```
Join the circle.
First access to limited drops and new Journal entries.
[email field] [Subscribe]
```

### Home (current Newsletter section)

```
JOIN THE CIRCLE
Join the circle.
First access to limited drops and new Journal entries. Written by the maker. Sent rarely.
[email field] I want to receive emails from Wenu Mapu about new pieces, drops, and Journal entries.
[Subscribe]
```

### Journal hub

```
THE WENU MAPU LIST
Let the next entry find you.
Each new Journal entry — material stories, process notes, drop announcements — sent to your inbox. No more, no less.
[email field] [Subscribe]
```

### Aftercare follow-up

```
AFTERCARE FOLLOW-UP
Aftercare reminders, sent on schedule.
Three short emails on days 3, 14, and 90 with what to expect, what to avoid, and when to come back for a check-in. Free.
[email field] [Sign me up]
```

### Custom orders confirmation (post-form auto-reply)

```
Mari mari,

Your commission inquiry reached the workshop. We respond to all inquiries within 5 business days with a yes, a no, or a question.

In the meantime: a commission moves at its own pace. The full process and timeline are here:
https://wenumapuonline.com/custom-orders

— Wenu Mapu
```

---

## 7. Privacy / CAN-SPAM / GDPR / CCPA basics

Required for any list-based email program. None of this is hard; all of it is non-negotiable.

### CAN-SPAM (US, federal)

1. Every marketing email must include a physical postal address. **Do NOT use the appointment location.** Use either the registered business address (Wenu Mapu SpA registration) or a USPS PO Box rented in Truckee specifically for this. **Owner action: rent a PO Box if no business address is publishable.**
2. Every email must include an unsubscribe link that works in 1 click and 10 days max. MailerLite handles this automatically.
3. Subject lines must not be deceptive.
4. Consent must be opt-in (the checkbox above is opt-in language, not pre-checked).

### GDPR (EU)

1. Affirmative opt-in (check box, not pre-checked). Already in §4.1.
2. Right to erasure: respond to deletion requests within 30 days. Document the procedure in `~/wenu-business/03-policies/privacy-policy.md`.
3. Data processor list: name MailerLite as a sub-processor in the privacy policy.
4. Privacy policy must be linked in the footer of every email and on the signup form.

### CCPA (California — Wenu Mapu IS based here)

1. "Do Not Sell My Personal Information" link required if the brand sells data. Wenu Mapu does not sell data — privacy policy can state that explicitly and avoid the link.
2. Right to access + delete. Same handling as GDPR.

### Privacy policy update

Currently `/privacy` is a placeholder. Real text is required before list capture goes live. Recommended approach: have a lawyer review a template (e.g., from Termly or a Cal-bar attorney) once. Owner-only action.

---

## 8. Future WooCommerce / Noco integration

Out of scope for first build. Designed but deferred:

- **WooCommerce + MailerLite official integration**: tags subscribers `customer:has-purchased`, `customer:repeat`, syncs purchase history. Enables abandoned-cart recovery + post-purchase aftercare automation.
- **Noco + MailerLite via Zapier or Make**: when a piece is added to Noco with status `available`, can auto-trigger a "back in stock" pulse to subscribers tagged for that material/placement.
- **Astro + MailerLite via API**: the form components on the Astro side POST to MailerLite's API directly (no WP intermediary). This is the cleanest architecture and keeps WP out of the new funnel entirely.

Implementation plan: ship MailerLite + 4 forms (home, journal, custom-orders, aftercare) on the Astro side first. WC + Noco integrations come later, when the catalog reconciliation (P4 in TASK_QUEUE.md) is settled.

---

## 9. What needs explicit human approval before any of this goes live

1. **Owner signs up for MailerLite** under marimari@wenumapuonline.com — owner-only.
2. **Owner verifies sender domain** (DNS DKIM + SPF records — owner-only DNS change).
3. **Owner provides physical postal address** for CAN-SPAM (or rents a Truckee PO Box).
4. **Lawyer reviews privacy policy + custom-order contract** — owner + counsel.
5. **Codex Task 3** (see `codex-next-tasks.md`) implements the Astro form components against the MailerLite API. Per-commit approval.
6. **No DNS changes, no Cloudflare token use, no production deploy** as part of this plan.

---

## 10. Out of scope

- SMS / WhatsApp marketing channels (not yet justified by volume)
- Loyalty program (Rage Nation gem-tier pattern — designed in market study §10, deferred)
- Affiliate / influencer program
- Press / PR outreach automation
- Customer-service ticketing (use marimari@ inbox until volume requires Help Scout / Front)
