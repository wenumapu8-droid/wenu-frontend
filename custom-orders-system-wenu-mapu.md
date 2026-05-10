# Wenu Mapu — Custom Orders System

Date: 2026-05-10 (CEO night)
Scope: end-to-end design for the custom-orders / commission funnel — page structure, qualification form, pricing language, founder-side handling, Notion/Noco tracking, Codex-ready frontend prompt, and fallback when no form endpoint exists.

Companion: `wenu-english-copy-pack-v1.md` §7, `wenu-subscription-and-journal-system.md` §4.5, `million-dollar-positioning-wenu-mapu.md` §11.

---

## 1. What a custom order is at Wenu Mapu

- A **co-designed, hand-forged piece** in sterling silver 950 or 14k gold (yellow / rose / white). Stones, wood, meteorite or other ritual inclusions can be added.
- Lead time: **6 months** from accepted inquiry to delivery.
- Deposit: **50% non-refundable** on commission confirmation.
- Output: ring (signet, ritual, ancestral), amulet, hanger, ear weight, custom piercing tops, or a piece outside the catalogue if scope is approved.
- Cadence: **6–10 commissions per year** maximum (quality + founder bandwidth).

What's NOT a custom order:
- Repairs (separate workshop service)
- Resizing existing pieces (separate; some pieces only)
- Pieces that conflict with material safety standards
- Pieces that copy other artists' work
- Pieces in materials Wenu Mapu does not work in (no platinum, no plated, no costume)

---

## 2. Page structure (`/custom-orders`)

The page already exists with substantive copy (Phase 1). This is the target final structure:

```
HERO
  eyebrow:    COMMISSIONS · MADE FOR YOU
  H1:         A piece designed only for you.
  sub:        Six-month lead time. 50% deposit. Sterling silver 950 or 14k gold.
  CTA pair:   Start a commission · Read the process

PATTERN BAND

WHAT WE FORGE ON COMMISSION (5 cards)
  - Rings
  - Amulets
  - Piercing tops
  - Hangers
  - Ear weights

MATERIALS (2 cards)
  - Sterling Silver 950 — From inquiry
  - 14k Gold — From inquiry
  + note about stones/wood/meteorite added on request

PROCESS (6 numbered steps with duration)
  01 Inquiry           Day 0
  02 Concept call      Weeks 1–2
  03 Sketch & quote    Weeks 3–5
  04 50% deposit       Week 6
  05 Forging           Months 2–5
  06 Delivery          Month 6

WORKED-EXAMPLE COMMISSIONS (3 cards) ← NEW (currently missing)
  3 anonymized past commissions, each:
    - 1 photo (or placeholder until brand session)
    - 2-line story
    - Material + scale + delivery date

TERMS (7 short clauses)
  Lead time / Deposit / Revisions / Cancellation / Materials / Shipping / Warranty

PATTERN BAND

INQUIRY FORM (CustomOrderForm.astro)
  Replaces current mailto fallback
  Fallback link to mailto remains for users with disabled JS

PATTERN BAND

FOOTER CTA: write directly to marimari@ if form unavailable
```

---

## 3. Inquiry form — fields & qualification logic

**Goal**: filter unserious inquiries; capture enough for the founder to reply meaningfully.

| Field | Type | Required | Notes / qualification logic |
|---|---|---|---|
| Name | text | required | first name minimum |
| Email | email | required | validated |
| Type of piece | select | required | options: Ring · Amulet / pendant · Hanger · Ear weight · Piercing top · Other |
| Body placement (if applicable) | text | optional | "left helix," "septum," "right ring finger" |
| Preferred material | select | required | Sterling Silver 950 · 14k Gold · Open / let's discuss |
| Stone / inclusion (optional) | text | optional | "Atacama meteorite," "obsidian," "labradorite," etc. |
| Indicative budget (USD) | select | required | < $400 (we'll suggest catalogue pieces instead) · $400–$800 · $800–$1500 · $1500–$2500 · $2500+ · Open |
| Timing | select | required | "Within 6 months — standard" · "Specific date (please describe)" · "No rush" |
| Specific date (if any) | date | optional | shows only if "Specific date" selected above |
| Your idea, story or reference (textarea) | textarea | required | 50–1000 chars; placeholder: "What is this piece for? Who is it for? Any symbols, references or images you want to share?" |
| Optional: link to inspiration | URL | optional | "Pinterest, IG, photo URL" |
| Consent: I understand the 6-month lead time and the 50% deposit | checkbox | required | not pre-checked |

**Qualification logic** (Codex):

- If budget < $400 → on submit, show a polite redirect: *"For pieces under $400, our catalogue has hand-forged options that may fit. Would you like a curation instead?"* — link to `/jewelry-styling`.
- If timing = "Specific date" AND date < 6 months from today → show: *"Six-month lead time is standard. If you need this sooner, let us know in the message and we'll see what's possible."*
- Hard validation only: required fields + email format. Soft validation (above) shown inline, never blocking.

---

## 4. Submission handling

### Provider path (when MailerLite + custom@ alias are wired)

```
Form submit → POST /api/custom-order   (Astro endpoint)
  → validate fields
  → POST to MailerLite API: subscribe email + tags (source:custom-orders-form, tier:commission-queue, interest:material:<value>)
  → POST to a webhook OR forward to custom@wenumapuonline.com with structured body (so the founder gets a clean email)
  → trigger MailerLite auto-reply email to subscriber (template in §5 below)
  → respond 200 → frontend shows "Inquiry received." panel
```

### Fallback path (no provider yet)

```
Form submit → no API → frontend shows fallback panel:
  "Inquiry received locally — please write to marimari@wenumapuonline.com with the details below, OR we will reach out within 5 business days."
  + a copyable summary of the entered fields for the user
  + a mailto: link with subject "Commission inquiry" and body pre-filled with the form contents
```

The fallback path keeps the form useful even when the MailerLite signup hasn't happened yet.

---

## 5. Auto-reply email (sent within seconds)

```
Subject: Your Wenu Mapu commission inquiry — received.
From:    Wenu Mapu Custom <custom@wenumapuonline.com>
Reply-to: marimari@wenumapuonline.com

Mari mari,

Thank you for your commission inquiry.

Each commission is reviewed personally. We respond to all inquiries within 5 business days with a yes, a no, or a question.

In the meantime, the full process is documented here:
https://wenumapuonline.com/custom-orders

A reminder of what to expect:
— 6-month lead time from accepted inquiry to delivery
— 50% non-refundable deposit confirms the commission
— Two rounds of sketch revisions included in the quote

If you'd like to add anything to your inquiry, simply reply to this email.

— Wenu Mapu
Truckee, California
marimari@wenumapuonline.com
```

---

## 6. Founder reply templates (private, internal)

Three templates — Yes / Conditional / No. Personalize, never paste verbatim.

### Template A — Yes (most common for serious inquiries)

```
Subject: Your Wenu Mapu commission — let's begin.

[Name],

Thank you for your inquiry. Your idea fits well with what we do, and I'd be glad to take it on.

Next step: a 30-minute call (video or audio, your choice) to align on:
— scale, weight, and placement
— material details and finish
— symbolism or references
— timeline within the 6-month standard

Three windows that work on my side this week:
— [option 1]
— [option 2]
— [option 3]

If none work, send me 2–3 windows that do.

After the call I'll send a sketch and a written quote within two weeks.

— [Maker name]
Wenu Mapu
```

### Template B — Conditional / clarifying

```
Subject: Your Wenu Mapu commission — a few questions.

[Name],

Thank you for your inquiry. Before I confirm, I want to make sure we're aligned. Two questions:

1. [specific question — e.g., "Are you open to a smaller scale than the reference image? The proportions you describe would not be safe for a 16g septum at 14g gauge — would 12g work?"]
2. [specific question — e.g., "Atacama meteorite is limited and adds ~$300–$500 to the material cost. Is that within your budget range?"]

If those fit, I'll send next-step scheduling for a concept call.

— [Maker name]
Wenu Mapu
```

### Template C — No / redirect

```
Subject: Your Wenu Mapu commission — not the right fit.

[Name],

Thank you for thinking of Wenu Mapu for this piece. After reviewing, I won't be able to take this commission on, for [one specific reason — material conflict / similarity to another artist's work / scope outside our craft / queue full].

If you'd like, I can suggest [alternative path — a piece from the catalogue that's close, another maker who does this kind of work, a different material approach].

— [Maker name]
Wenu Mapu
```

---

## 7. Notion / Noco tracking (operational backbone)

A simple table — one row per inquiry. Owner can use Noco (existing inventory tool) or Notion. Recommended fields:

| Field | Type | Purpose |
|---|---|---|
| Inquiry ID | auto / formula | sequential e.g. WM-CO-2026-001 |
| Submitted | date | from form timestamp |
| Status | select | New · Replied · Concept call scheduled · Sketch sent · Quote sent · Deposit pending · Deposit paid · In production · Final balance pending · Shipped · Delivered · Cancelled |
| Name | text | from form |
| Email | email | from form |
| Type of piece | select | from form |
| Material | select | from form |
| Indicative budget | select | from form |
| Timing | select | from form |
| Story (excerpt) | text | first 200 chars from form |
| Reference URL | URL | from form |
| Founder notes | text | private |
| Concept call date | date | scheduled |
| Sketch sent | date | log |
| Quote total (USD) | number | log |
| Deposit (USD) | number | 50% of quote |
| Deposit paid | date | log |
| Production start | date | usually after deposit clears |
| Estimated delivery | date | production start + ~4 months |
| Final balance (USD) | number | quote − deposit |
| Final balance paid | date | log |
| Shipped tracking | text | tracking number + carrier |
| Delivered | date | confirmed by customer |
| Photos (final piece) | files | for portfolio + Journal |
| Lessons / notes | text | retrospectively, for future commissions |

The table lives in Noco (already used for inventory). Single source of truth for the commission queue. Founder works from this table daily.

**Automation later**: webhook from Astro form → Noco row insert. Today: manual entry from email is fine for 6–10 commissions/year.

---

## 8. Pricing & deposit language (PDP-style block to surface on /custom-orders)

```
LEAD TIME       Six months from accepted inquiry to delivery.
DEPOSIT         50% non-refundable on commission confirmation.
                Reserves your slot in the queue and confirms the commission.
                Production starts after deposit clears.
REVISIONS       Two rounds of sketch revision included in the quote.
                Further revisions billed hourly.
CANCELLATION    After deposit, you may cancel; deposit is forfeit and
                covers materials and design time. Before deposit, no cost.
MATERIALS       Sterling Silver 950 or 14k gold for the metalwork.
                Stones, wood, meteorite or specialty inclusions are quoted separately.
SHIPPING        Insured shipping at quoted cost. International duties are buyer's responsibility.
WARRANTY        Lifetime workshop repair on manufacturing defects.
                Wear-and-tear is not covered.
```

This block already exists in the en.json `custom.terms` block — the Codex task needs to render it as a clean spec table on the page.

---

## 9. Worked-example commissions (NEW section to add)

Three anonymized past commissions, each:

| Field | Example |
|---|---|
| Title | "Septum signet — sterling silver, family symbol" |
| Material | Sterling Silver 950 |
| Scale | 16G (1.2 mm), 8 mm inner diameter |
| Delivery date | March 2026 |
| 2-line story | "A signet for a parent, designed around a family symbol carried for three generations. Engraved by hand." |
| Photo | 1 image (or placeholder until brand session) |

Three rotating examples on the page. Replace with newer examples as commissions complete.

**Owner action**: pick 3 past commissions, get customer permission to feature anonymously, gather photos, write 2-line stories.

---

## 10. Codex prompt for frontend implementation

(Add this as Codex Task 4b in `codex-next-tasks.md`. Independent of Task 3 forms work but shares the form provider pattern.)

```
TASK: Build the CustomOrderForm component + replace the mailto fallback on /custom-orders with the form. Frontend only. Provider integration is gated on owner MailerLite API key in .env.

FILES NEW:
  src/components/forms/CustomOrderForm.astro
  src/pages/api/custom-order.ts                  (Astro server endpoint; no-op when MAILERLITE_API_KEY absent)

FILES EDIT:
  src/pages/custom-orders.astro                  (replace .custom-form__fallback-panel with <CustomOrderForm />)
  src/i18n/en.json                               (append form.* keys; do not rewrite existing)

FORBIDDEN:
  Edit homepage. Edit Nav. Edit /care-guide. Push. Deploy. DNS. WC writes.
  Print or commit any secret. Add new dependencies.

BEHAVIOR:
  Form fields per custom-orders-system-wenu-mapu.md §3.
  Qualification soft-validation per §3 (budget < $400 → friendly redirect to /jewelry-styling).
  Submission:
    - if process.env.MAILERLITE_API_KEY is set → POST to /api/custom-order which forwards to MailerLite + emails custom@
    - if absent → render fallback panel with copyable summary + mailto:marimari@ link
  Auto-reply email handled by MailerLite automation (template per §5; not built into the component).
  Fallback NEVER fakes success — always tells the user what's actually happening.

ACCEPTANCE:
  npm run build → pages green, postbuild OK
  Form renders with all fields, validation works
  No server-side secret ever printed to stdout
  No MAILERLITE_API_KEY hardcoded anywhere
  /custom-orders no longer has the old mailto-only fallback panel; form is primary, mailto link is below as fallback

REPORT: per AGENT_HANDOFF_PROTOCOL.md.
WAIT for explicit human approval before commit.
COMMIT (when approved):
  feat(custom-orders): replace mailto fallback with CustomOrderForm + qualification logic
```

---

## 11. Out of scope

- Stripe integration for the deposit (deposits handled manually via invoice link initially; automate later)
- Document signature / contract e-signing (start with a manual emailed PDF)
- 3D rendering / preview of sketches (out of scope; stay sketch+photo)
- Customer portal for commission status (deferred; email updates suffice)
- Public commission gallery beyond 3 worked examples (reveal more in Journal entries)
