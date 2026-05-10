# Codex Next Tasks — Wenu Mapu

Date: 2026-05-09→10 · refreshed CEO night 2026-05-10
Scope: precise, copy-pasteable implementation prompts for the next pass of work, in priority order.

**Status snapshot (CEO night refresh):**
- ✅ Task 1 (Footer + Contact cleanup, Astro side) — **partially executed** (Footer.astro now uses marimari@ + (408) + no Northbound credit + appointment line). Verify on owner side; if `contact.astro` still needs the WhatsApp removal + new channel block, finish that piece.
- ⏳ Task 2 (6 material landings + hub) — **ready to run**
- ⏳ Task 3 (subscription + custom-order + appointment forms) — **gated on owner MailerLite signup** (see `subscription-implementation-brief.md` §2)
- 📝 Task 4a (Visual handoff Asset 07 + 08) — **blocked** on owner providing source SVG
- ⏳ Task 4b — **NEW** — Custom Orders form + qualification logic (split from Task 3)
- ⏳ Task 4c — **NEW** — Appointment Request form (split from Task 3)
- ⏳ Task 5 (Internal link audit) — ready
- ⏳ Task 7 (Journal template + 6 founding entries) — ready (after Task 2)
- 📌 Task 8 — **NEW** — `/jewelry-styling` page

These prompts can run in **Codex** OR **Claude Code** (this CLI). Pick one runner per task; do not have both run the same task.

**Binding rules (apply to every task):**
- Read `~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md` and `DO_NOT_TOUCH.md` BEFORE the first tool call.
- Per-edit + per-commit human approval — do not commit without an explicit "yes."
- Do NOT push, merge, deploy, change DNS, touch Cloudflare, modify WC products, modify Aftercare files, modify `.env*`.
- Do NOT print secrets.
- Run `npm run build` after every batch; build must pass (postbuild asserts ≥ 64 product pages).
- Report back per `AGENT_HANDOFF_PROTOCOL.md` (≤ 200 words).

---

## Task 1 — Contact + Footer trust cleanup (Astro side only)

**Priority:** P0
**Risk:** low (additive copy + 1-line footer href)
**Scope:** Update the Astro footer + Contact page copy to the canonical block in `wenu-contact-and-operations-plan.md` §1–§3. NO CHANGE to legacy WP — that's owner's manual work.

**Prompt (paste verbatim):**

```
TASK: Update Wenu Mapu Astro footer + Contact page to the canonical contact block (per wenu-contact-and-operations-plan.md §1, §2, §3).

FILES ALLOWED:
  src/components/Footer.astro
  src/pages/contact.astro
  src/i18n/en.json   (only to add new keys; do not rewrite existing)
  src/components/Newsletter.astro  (only to update mailto subject if needed)

FORBIDDEN:
  Any other file. No nav change. No homepage change. No new components.
  Do NOT log into anything. Do NOT make WC API calls. Do NOT touch DNS or Cloudflare.

EXACT CHANGES:
1. Footer.astro:
   - Brand line stays "Forged with newen · Truckee, California"
   - Replace any street address with: "Truckee, California — private appointments + free local delivery in the Truckee / North Lake Tahoe area."
   - Set canonical email reference to marimari@wenumapuonline.com
   - Set canonical phone reference to +1 (408) 500-6211
   - Remove "Web design by Northbound" credit line
   - Keep social links + legal links unchanged

2. contact.astro:
   - Replace channel block per wenu-contact-and-operations-plan.md §3:
     Email     marimari@wenumapuonline.com
     Phone     +1 (408) 500-6211
     Instagram @wenu__mapu
     Online store wenumapuonline.com
   - Remove WhatsApp block UNLESS a WhatsApp Business number is confirmed (it is not as of 2026-05-09; remove it)
   - Add the 3 prescribed wordings at page foot:
     "Private appointments available in the Truckee / North Lake Tahoe area."
     "Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas."
     "Selected pieces may be viewed by appointment."

3. Update i18n/en.json contact.email/phone/instagram values; add `contact.appointments_line`, `contact.local_delivery_line`, `contact.view_by_appointment_line` keys.

4. Newsletter.astro: change mailto recipient from `contact@wenumapuonline.com` to `marimari@wenumapuonline.com` (if still mailto fallback per Phase 1).

ACCEPTANCE:
- nvm use && npm run build → 88 pages, postbuild OK
- grep -rn "contact@wenumapuonline.com" src/ → 0 matches
- grep -rn "Petrolia\|Rizoma\|Northbound\|+145" src/ → 0 matches
- grep -rn "Showroom at home\|vitrine\|walk-in" src/ → 0 matches
- /contact renders the new channel block; footer renders the new short address line
- Build green, postbuild OK, no TS / Astro errors

REPORT: per AGENT_HANDOFF_PROTOCOL.md — RESULT / WHAT CHANGED / WHAT WAS VERIFIED / WHAT'S NEXT.

DO NOT COMMIT until human approval. After approval, single commit:
"chore(contact): canonicalize footer + Contact page to marimari@/+1(408)/appointments-only model"
```

---

## Task 2 — Material landing pages (×6 + hub) — Phase 2

**Priority:** P1
**Risk:** low (additive — same pattern as `/piercing.astro`, no existing files modified except `en.json` append)
**Scope:** ship the 6 material-axis landings + 1 material hub.

**Prompt:**

```
TASK: Create 6 material landing pages + 1 material hub for Wenu Mapu, following the proven pattern from src/pages/piercing.astro.

FILES NEW:
  src/pages/material/index.astro                 (hub: lists the 6 materials)
  src/pages/material/sterling-silver.astro
  src/pages/material/14k-gold.astro
  src/pages/material/titanium.astro
  src/pages/material/vacamuerta.astro
  src/pages/material/walnut-wood.astro
  src/pages/material/brass-bronze.astro

FILES EDIT:
  src/i18n/en.json                                (append landing.material_<key> blocks)

FORBIDDEN:
  Any other file. No nav change. No homepage change. No new components.
  No WC writes. No deploy. No push. No DNS.

PATTERN:
  Mirror src/pages/piercing.astro 1:1:
  - imports: Base, ProductCard, PatternBand, getProducts, en
  - const L = en.landing.material_<key>
  - const KEYWORDS = [...material-slug variants]
  - const all = await getProducts(50)
  - filter on p.images[0].src && p.categories.some(c => KEYWORDS.some(k => c.slug.toLowerCase().includes(k)))
  - featured = matched.slice(0, 6)
  - CollectionPage + BreadcrumbList JSON-LD
  - Base props: title, description, ogImage (use /img/categories/<closest>.webp until per-material macro shoots land), jsonLd
  - section.section--mega > container > eyebrow / page-title / lede / page-divider / landing__copy / landing__cta / landing__rail

KEYWORDS PER MATERIAL:
  sterling-silver:  ['silver','plata','sterling','925','950']
  14k-gold:         ['gold','oro','14k','14-kilatess','14kilates','golden']
  titanium:         ['titanium','titanio']
  vacamuerta:       ['vacamuerta','meteorite','meteorito','atacama']
  walnut-wood:      ['wood','madera','walnut','nogal','wooden','tropical']
  brass-bronze:     ['brass','bronze','bronce','laton']

SECONDARY CTA PER MATERIAL:
  sterling-silver:  /care-guide
  14k-gold:         /custom-orders
  titanium:         /piercing
  vacamuerta:       /collection/ritual-ring-vacamuerta  (link will resolve when collection page lands; currently 404 — that's OK, link exists for forward-compat)
  walnut-wood:      /artistry
  brass-bronze:     /artistry

i18n SHAPE (per material):
  "landing": {
    "material_sterling_silver": {
      "eyebrow": "STERLING SILVER 950",
      "title": "Sterling Silver 950 — pure, durable, alive with light.",
      "intro": "...",   // canonical phrase from BRAND-DNA-2026-05-03.md §4
      "p1": "...",      // 2-3 sentence material story
      "p2": "...",      // 2-3 sentence use-case story
      "cta_primary": "Browse pieces in sterling silver",
      "cta_secondary": "Aftercare guide",
      "shop_target": "/shop?material=sterling-silver"
    },
    ...
  }
  Use canonical material phrases from ~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md §4 for the intro line. Voice rules in voz-de-marca-real-2026-05-03.md.

HUB (material/index.astro):
  - eyebrow: "MATERIALS"
  - h1: "Six materials, six origins."
  - lede: "We work in six material families. Each carries its own provenance and its own behavior on the body."
  - 6 cards, one per material, each linking to the deep-dive page
  - Use existing .archive-card or .product-card style — do not invent a new card class

ACCEPTANCE:
  nvm use && npm run build → expected 95 pages (88 existing + 6 material + 1 hub), 64 products, postbuild OK
  ls dist/material/{sterling-silver,14k-gold,titanium,vacamuerta,walnut-wood,brass-bronze}/index.html → all present
  ls dist/material/index.html → present
  Each new page: 1 H1, CollectionPage JSON-LD, BreadcrumbList JSON-LD, valid OG image
  No TS errors, no Astro warnings

REPORT: per protocol. Then await per-commit approval before single commit:
"feat(material): add 6 material landing pages + hub (sterling-silver, 14k-gold, titanium, vacamuerta, walnut-wood, brass-bronze)"
```

---

## Task 3 — Subscription / journal capture components (frontend only)

**Priority:** P2
**Risk:** medium (new components; provider integration deferred behind owner decision)
**Scope:** build the Astro form components for the 4 capture surfaces. Wire to a stub endpoint OR to MailerLite directly IF owner has signed up + provided API key via .env (not done tonight).

**Prompt:**

```
TASK: Build 4 form components for Wenu Mapu subscription / inquiry capture, frontend-only. Provider integration is gated on owner signing up for MailerLite (see wenu-subscription-and-journal-system.md §3).

FILES NEW:
  src/components/forms/JoinTheCircleForm.astro     (footer + home + journal hub)
  src/components/forms/AftercareSignupForm.astro   (rendered on a NEW /aftercare-follow-up page, NOT inside /care-guide)
  src/components/forms/CustomOrderForm.astro       (replaces mailto fallback in /custom-orders)
  src/components/forms/AppointmentRequestForm.astro (rendered on /stockists)
  src/pages/aftercare-follow-up.astro              (host page for AftercareSignupForm)

FILES EDIT:
  src/components/Newsletter.astro                  (use JoinTheCircleForm; preserve mailto link as fallback)
  src/pages/custom-orders.astro                    (use CustomOrderForm; preserve mailto link as fallback)
  src/pages/stockists.astro                        (use AppointmentRequestForm; preserve mailto link as fallback)
  src/pages/journal.astro                          (add JoinTheCircleForm to hub)
  src/i18n/en.json                                 (append form labels + consent strings)

FORBIDDEN:
  Edit /care-guide (off-limits). Edit homepage structure. Push. Deploy. DNS. Cloudflare. WC writes.
  Do NOT add MailerLite API key to .env or to any file. Owner provides it later.

PROVIDER WIRING (two paths — pick based on .env availability):
  Path A: PROVIDER_API_KEY env var present (e.g., MAILERLITE_API_KEY) — POST to MailerLite v2 API at /api/subscribers per their docs. Use Astro server endpoint (src/pages/api/subscribe.ts).
  Path B: env var absent — submit to a placeholder POST that no-ops + shows a "we'll be in touch" message + the existing mailto link as fallback.

  The component MUST work in both paths so we don't ship a broken page when env var is missing.

CONSENT + COMPLIANCE (every form):
  - Explicit checkbox, NOT pre-checked
  - Privacy policy link
  - Tag: source=<form-id>; tier=circle (or commission-queue / appointment-request)

ACCEPTANCE:
  npm run build → 96+ pages, postbuild OK
  Each form renders without JS errors
  Each form gracefully degrades when MAILERLITE_API_KEY is absent (Path B)
  /aftercare-follow-up resolves; /care-guide is UNTOUCHED
  No new images. No new tokens. No nav change.

REPORT: per protocol. Then await per-commit approval, single commit:
"feat(forms): add subscription + custom-order + appointment forms (frontend, gated provider)"
```

---

## Task 4 — Visual handoff Asset 07 + Asset 08 integration (only when source SVG exists)

**Priority:** P3 (blocked on owner providing source SVG via Claude Design or alternative)
**Risk:** medium (touches `Footer.astro` + section dividers across home + landings)
**Scope:** integrate the approved SVG assets into Astro per `wenu-visual-agent-plan.md` §10 and `claude-design-integration-plan.md` §6.

**Prompt:**

```
TASK: Integrate approved Asset 07 (Footer Pattern Band) + Asset 08 (Ritual Divider) + AssetSlot.astro into Wenu Mapu Astro per docs/handoffs/2026-05-09-asset-07-08/spec.md.

PRECONDITION: docs/handoffs/2026-05-09-asset-07-08/manifest.json shows status: approved for both assets, AND the SVG source files exist in that folder. If precondition not met, REPORT "blocked: source assets not provided" and STOP.

FILES NEW:
  public/assets/patterns/footer-band-mapuche-textile.svg  (move from drafts)
  public/assets/dividers/ritual-divider-cardinal.svg      (move from drafts)
  src/components/visual/AssetSlot.astro                   (per claude-design-integration-plan.md §3)
  src/components/visual/RitualDivider.astro               (consumes AssetSlot)

FILES EDIT:
  src/components/PatternBand.astro                        (extend: when variant="band", inline-load the new SVG)
  src/components/Footer.astro                             (no change unless PatternBand variant API changed)
  src/styles/tokens.css                                   (append only — no replacement)
  src/styles/global.css                                   (append .divider-ornament if needed)
  src/pages/index.astro                                   (REQUIRES EXPLICIT homepage edit approval — replace .section-divider PatternBand instances with RitualDivider)

FORBIDDEN:
  Any other file. No new dependencies in package.json. No homepage structural change beyond swapping divider components. No nav change. No deploy / push / DNS.

ACCEPTANCE:
  Filesize: SVGs ≤ 6 KB each (SVGO-optimized)
  npm run build → all pages green, postbuild OK
  Footer band visible across all pages, mobile + desktop
  Ritual divider replaces the 3 section dividers on /, /piercing, /hangers, /amulets, /ear-weights, /ritual-objects
  No PatternBand placeholder geometry remains

REPORT: per protocol. Then await per-commit approval, single commit:
"feat(visual): integrate footer-band + ritual-divider (handoff 2026-05-09-asset-07-08)"
```

---

## Task 1.5 — Finish canonical email replacement (small cleanup) *(NEW)*

**Priority:** P0 (cosmetic/trust; visible)
**Risk:** very low (string replacement only, no structural change)
**Scope:** finish what Task 1 started — replace lingering `contact@wenumapuonline.com` references in 6 pages + `public/humans.txt` with `marimari@wenumapuonline.com`. Verified by CEO-night build smoke check.

**Files containing the residual reference (verified by grep on 2026-05-10):**

```
src/pages/accessibility.astro
src/pages/custom-orders.astro     (mailto fallback link or signoff)
src/pages/index.astro             (likely a hidden/inline reference)
src/pages/privacy.astro
src/pages/stockists.astro
src/pages/terms.astro
public/humans.txt                 (contact line)
```

**Prompt:**

```
TASK: Replace every remaining occurrence of contact@wenumapuonline.com with marimari@wenumapuonline.com across the listed files. NO other changes.

FILES ALLOWED:
  src/pages/accessibility.astro
  src/pages/custom-orders.astro
  src/pages/index.astro
  src/pages/privacy.astro
  src/pages/stockists.astro
  src/pages/terms.astro
  public/humans.txt

FORBIDDEN:
  Any other file. Push. Deploy. DNS. WC writes. Print secrets.

EXACT CHANGE:
  In each file, find every occurrence of `contact@wenumapuonline.com` and replace with `marimari@wenumapuonline.com`.
  If a `mailto:contact@wenumapuonline.com` href exists with a `subject=` parameter, preserve the subject parameter unchanged.

ACCEPTANCE:
  cd ~/wenu-frontend && nvm use && npm run build → 88 pages, postbuild OK
  grep -rn "contact@wenu" src/ public/ → 0 matches
  grep -rn "marimari@wenumapuonline.com" src/ public/ | wc -l → ≥ 7

REPORT: per AGENT_HANDOFF_PROTOCOL.md.
WAIT for explicit human approval before commit.
COMMIT (when approved):
  chore(contact): replace residual contact@ references with marimari@ across 6 pages + humans.txt
```

---

## Task 4b — Custom Orders form + qualification logic *(NEW)*

**Priority:** P2
**Risk:** medium (new component + new API endpoint; provider-gated)
**Scope:** replace the mailto fallback on `/custom-orders` with the qualification form per `custom-orders-system-wenu-mapu.md` §10. Frontend + Astro server endpoint.

**Prompt:**

```
TASK: Build the CustomOrderForm component + replace the mailto fallback on /custom-orders.
Frontend + Astro server endpoint (/api/custom-order). Provider integration is gated on owner MailerLite API key in .env.

FILES NEW:
  src/components/forms/CustomOrderForm.astro
  src/pages/api/custom-order.ts                  (Astro server endpoint)
  src/lib/subscribe.ts                           (helper if not already created by Task 3)

FILES EDIT:
  src/pages/custom-orders.astro                  (replace .custom-form__fallback-panel with <CustomOrderForm />)
  src/i18n/en.json                               (append custom.form.* keys; do not rewrite existing)

FORBIDDEN:
  Edit homepage. Edit Nav. Edit /care-guide. Push. Deploy. DNS. WC writes. Add new dependencies.
  Print or commit any secret. Hardcode MAILERLITE_API_KEY anywhere.

BEHAVIOR:
  Form fields per custom-orders-system-wenu-mapu.md §3 (name, email, type, placement, material, stone, budget, timing, specific date, story, inspiration URL, consent).
  Qualification soft-validation per §3:
    - if budget < $400 → on submit, show inline panel with link to /jewelry-styling
    - if specific date < 6 months from today → show inline note about lead time
  Hard validation: required fields + email format only.
  Submission:
    - if process.env.MAILERLITE_API_KEY set → POST /api/custom-order → MailerLite subscribe with tags ['source:custom-orders-form', 'tier:commission-queue', 'interest:material:<material>'] + send structured email summary to custom@wenumapuonline.com (forward target until alias split)
    - if absent → render fallback panel with copyable summary + mailto:marimari@wenumapuonline.com link with subject "Commission inquiry"
  ZERO secrets in HTML or JS bundle. Server-side only.
  Auto-reply email handled by MailerLite automation (template per custom-orders-system-wenu-mapu.md §5; not built into this component).
  Fallback NEVER fakes success.

ACCEPTANCE:
  npm run build → green, postbuild OK
  Form renders all fields with validation
  /custom-orders no longer shows the old mailto-only fallback panel
  Mailto link still present below the form as fallback
  No MAILERLITE_API_KEY anywhere except via process.env / import.meta.env
  Page-source check: 0 occurrences of MAILERLITE in HTML

REPORT: per AGENT_HANDOFF_PROTOCOL.md.
WAIT for explicit human approval before commit.
COMMIT (when approved):
  feat(custom-orders): replace mailto fallback with CustomOrderForm + qualification logic
```

---

## Task 4c — Appointment Request form *(NEW)*

**Priority:** P2
**Risk:** medium (new component + new endpoint + page rewrite)
**Scope:** rewrite `/stockists` page surface to "Visit / Appointments" + add the AppointmentRequestForm per `local-appointments-delivery-system.md` §2–§3. Frontend + Astro server endpoint.

**Prompt:**

```
TASK: Rewrite /stockists to the appointments + free local delivery hub per local-appointments-delivery-system.md §2.
Add AppointmentRequestForm. Add LocalBusiness JSON-LD to /stockists and /contact per §9.
Frontend + Astro server endpoint.

FILES NEW:
  src/components/forms/AppointmentRequestForm.astro
  src/pages/api/appointment-request.ts

FILES EDIT:
  src/pages/stockists.astro                      (rewrite per local-appointments-delivery-system.md §2 structure)
  src/pages/contact.astro                        (only to add LocalBusiness JSON-LD via Base.astro jsonLd prop — DO NOT rewrite contact channels; that's Task 1's territory)
  src/i18n/en.json                               (append stockists.* + form.* keys; do not rewrite existing)

FORBIDDEN:
  Edit homepage. Edit Nav. Edit /care-guide. Push. Deploy. DNS. WC writes.
  Print any secret. Add new dependencies.
  Add a map embed (appointment locations are private — DO NOT publish coordinates).
  Reference former partner studios.
  Use the words: "showroom at home," "vitrine," "walk-ins," "studio location."

CONTENT (page body):
  Hero per local-appointments-delivery-system.md §2.
  4-step "How an appointment works" block.
  Local delivery zones callout: Truckee, Kings Beach, Tahoe Vista, nearby Truckee airport area.
  "What to expect" block (5 short bullets per §2).
  AppointmentRequestForm (with mailto fallback link below).
  "Current stockists" block: "We are not currently in any partner studio. Selected pieces may be viewed only by private appointment in the Truckee / North Lake Tahoe area."
  Footer CTA: "Outside the local zone? See our shipping policy →"

FORM FIELDS per local-appointments-delivery-system.md §3:
  Name, Email, Phone (optional), Mode (radio: appointment / delivery / both), City/area, Pieces (textarea), Preferred dates (textarea), Notes (optional), Consent (required, not pre-checked).

SUBMISSION:
  - if MAILERLITE_API_KEY set → POST /api/appointment-request → MailerLite subscribe with tags ['source:appointment-request', 'tier:circle', 'interest:appointment' or 'interest:local-delivery'] + email summary to marimari@
  - else → fallback panel + mailto:marimari@ subject "Appointment request" or "Local delivery request"

LOCALBUSINESS JSON-LD (add to /stockists AND /contact via Base.astro jsonLd prop):
  Per local-appointments-delivery-system.md §9 — areaServed lists Truckee, Kings Beach, Tahoe Vista; address only Truckee city (no street, no postal); telephone +1-408-500-6211; email marimari@.

ACCEPTANCE:
  npm run build → green, postbuild OK
  /stockists renders the new structure with no forbidden wording
  Form renders all fields with validation
  LocalBusiness JSON-LD validates in Google Rich Results Test
  No private street address anywhere in the rendered HTML
  No map embed
  Mailto fallback present

REPORT: per AGENT_HANDOFF_PROTOCOL.md.
WAIT for explicit human approval before commit.
COMMIT (when approved):
  feat(appointments): rewrite /stockists as Visit/Appointments hub + AppointmentRequestForm + LocalBusiness JSON-LD
```

---

## Task 8 — `/jewelry-styling` page *(NEW)*

**Priority:** P3
**Risk:** low (single new page; no nav change)
**Scope:** ship a new service-surface page for curation/styling per `wenu-english-copy-pack-v1.md` §8 + `million-dollar-positioning-wenu-mapu.md` §7.

**Prompt:**

```
TASK: Create /jewelry-styling page — a third service surface (peer of /custom-orders and /stockists).

FILES NEW:
  src/pages/jewelry-styling.astro

FILES EDIT:
  src/i18n/en.json                               (append jewelry_styling.* block)
  src/components/Footer.astro                    (add a single link "Jewelry Curation" to the About column)

FORBIDDEN:
  Edit homepage. Edit Nav. Edit /care-guide. Push. Deploy. DNS. WC writes. Add new dependencies.

CONTENT per wenu-english-copy-pack-v1.md §8:
  HERO
    eyebrow:  CURATION · BY APPOINTMENT
    H1:       Jewelry curation, by appointment.
    sub:      Selected pieces curated to your story, your placement, your stretch. Free, by request.
    CTA pair: Request a curation · Or browse the catalogue
  BODY (3 short blocks):
    1) "What we curate for" — list: gift, first stretched-lobe weight, ritual milestone, custom build precursor, materials education
    2) "How it works" — 3 steps: write to us → reply within 48h with a curated set → choose / refine / order or request appointment
    3) "What it costs" — Free. Curation is part of how we work.
  PRIMARY CTA at end: "Request a curation" → mailto:marimari@wenumapuonline.com?subject=Jewelry%20curation%20request
  Secondary: "Or browse the catalogue" → /shop

SEO:
  title: "Jewelry Curation by Appointment — Wenu Mapu"
  meta:  "Selected body jewelry curated to your story and placement. Free curation by request. Truckee / North Lake Tahoe area."

VISUAL:
  No new images required. Use PatternBand divider + the existing .archive-card / .product-card pattern for any visual element.

ACCEPTANCE:
  npm run build → +1 page, postbuild OK
  /jewelry-styling resolves
  Footer contains a "Jewelry Curation" link in About column
  No new components, no new tokens, no new CSS classes

REPORT: per AGENT_HANDOFF_PROTOCOL.md.
WAIT for explicit human approval before commit.
COMMIT (when approved):
  feat(jewelry-styling): add /jewelry-styling service surface
```

---

## Task 5 — Audit internal links

**Priority:** P3
**Risk:** zero (read-only audit, generates a report only)
**Scope:** find every internal link in `src/`, verify each target exists or is an intentional 301/alias.

**Prompt:**

```
TASK: Audit internal links across the Wenu Mapu Astro repo. Read-only.

INPUT: `~/wenu-frontend/src/`
OUTPUT: a single report `~/wenu-frontend/internal-link-audit.md` with:
  - per-file list of internal hrefs
  - which targets resolve to a real page
  - which targets 404 (forward-compat OK only if documented in full-site-completion-plan.md)
  - duplicate alias targets (e.g., /shipping vs /shipping-returns)
  - any href containing the legacy "contact@wenumapuonline.com" or other forbidden strings (per wenu-contact-and-operations-plan.md §1 forbidden list)

FILES ALLOWED:
  Read src/**/*.{astro,ts,tsx,md,mdx,json}
  Write internal-link-audit.md

FORBIDDEN:
  Editing any source file. No new pages. No commit.

ACCEPTANCE:
  Report exists, lists at least every page in src/pages/.

REPORT: per protocol; just confirm report path + file size.
```

---

## Task 6 — Build + smoke check after every batch

**Priority:** runs as Acceptance step in every other task, not on its own.
**Scope:** confirm `npm run build` is green, postbuild assertion holds, key pages return non-empty HTML, JSON-LD blocks present.

**Reference smoke list:**
```bash
cd ~/wenu-frontend && nvm use && npm run build && \
  for p in / /shop/ /piercing/ /hangers/ /amulets/ /ear-weights/ /ritual-objects/ \
           /material/ /material/sterling-silver/ /material/vacamuerta/ \
           /custom-orders/ /materials/ /artistry/ /stockists/ /sizing-guide/ \
           /faq/ /shipping/ /contact/ /care-guide/ /about/ /journal/; do
    test -f "dist${p}index.html" && echo "OK $p" || echo "MISS $p"
  done
```

---

## Task 7 — Optional: Journal template + 6 founding entries

**Priority:** P2 (after Task 2 lands)
**Risk:** low (additive content + 1 new template)
**Scope:** ship the journal entry template and the 6 founding entries listed in `full-site-completion-plan.md` §journal.

**Prompt:**

```
TASK: Build the Astro Journal as an editorial publication. Add a per-entry route + 6 founding entries.

FILES NEW:
  src/content/config.ts                       (Astro Content Collections config for "journal")
  src/content/journal/what-is-vacamuerta.md
  src/content/journal/four-cardinal-forces.md
  src/content/journal/why-truckee.md
  src/content/journal/forging-the-meteorite.md
  src/content/journal/aftercare-first-90-days.md
  src/content/journal/reading-the-body.md
  src/pages/journal/[slug].astro              (entry page template)

FILES EDIT:
  src/pages/journal.astro                     (replace "First entries forthcoming" with index of entries)
  src/i18n/en.json                            (append journal-related strings; do NOT duplicate per-entry copy — that lives in markdown frontmatter)

FORBIDDEN:
  Edit /care-guide. Touch homepage structure. Push. Deploy. DNS.
  Do NOT add new components beyond the entry template.

PER-ENTRY FRONTMATTER:
  ---
  title: "..."
  eyebrow: "JOURNAL · MATERIAL STORY"   (or appropriate category)
  date: 2026-MM-DD
  ogImage: /img/editorial/<entry-slug>.webp  (placeholder OK; flag in report which images are placeholders)
  excerpt: "..."  (1 sentence)
  related: ["/material/vacamuerta", "/about"]   (cross-links rendered in tail)
  ---

LENGTH: 600-1,200 words per entry, voice per voz-de-marca-real-2026-05-03.md.

ACCEPTANCE:
  npm run build → +6 journal entries + journal hub redesigned, no errors
  /journal renders the index, /journal/<slug> renders each entry, both with valid Article JSON-LD

REPORT: per protocol. Per-commit approval, single commit:
"feat(journal): add Content Collections + 6 founding entries"
```

---

## Sequencing recommendation (CEO night refresh — 2026-05-10)

```
Day 1 (today):
  ✅ Task 1 footer portion done (verified Footer.astro + en.json updated)
  ⏳ Verify /contact.astro reflects the new channels block + WhatsApp removed (finish Task 1)
  Owner action in parallel: WP admin per wordpress-live-cleanup-checklist.md §1–3 (footer + test products + Spanish strings)

Day 2:
  Task 2 (Material landings × 6 + hub) — biggest single SEO + UX uplift.
  Owner action in parallel: MailerLite signup + DNS DKIM/SPF (per subscription-implementation-brief.md §2)

Day 3:
  Task 4b (Custom Orders form + qualification) — gated on owner MailerLite key in .env
  Task 4c (Appointment Request form + /stockists rewrite + LocalBusiness JSON-LD) — same gate
  Task 8 (/jewelry-styling page) — independent, low risk

Day 4-5:
  Task 7 (Journal template + 6 entries) — content load. Can be split into 2 commits (template + 3 entries / 3 more entries).

Day 6+:
  Task 4a (Visual handoff Asset 07 + 08) when source SVG arrives.
  Task 5 (Internal link audit) when convenient.

Out of scope this week:
  Cloudflare Pages preview deploy (P3 in TASK_QUEUE.md, separate gate).
  Native cart / checkout.
  Apex DNS cutover (Option A 301 in WP cleanup is acceptable interim).
  Tunnel rotation.
  Ear-cuffs / chaway pages (later; chaway needs founder cultural review).
  3-axis Shop filter UI (after material/* lands).
  Drops landing template (after first drop is named).
```

---

## Hard rules every task obeys

1. Read AGENT_CONTROL_CENTER.md + DO_NOT_TOUCH.md first.
2. Per-edit + per-commit human approval. No autonomous commits.
3. No push, no remote-add, no deploy.
4. No DNS, no Cloudflare Tunnel changes.
5. No WC product writes.
6. No `.env*` reads-into-output, no secret printing.
7. No Aftercare modifications.
8. `npm run build` after every batch. Postbuild assertion must hold.
9. Report ≤ 200 words per AGENT_HANDOFF_PROTOCOL.md.
10. If blocked or rule conflict: STOP and ask, do not improvise.
