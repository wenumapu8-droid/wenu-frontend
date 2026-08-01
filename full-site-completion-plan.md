# Wenu Mapu — Full-Site Completion Plan

Date: 2026-05-09→10 (overnight)
Scope: target-state plan for every Wenu Mapu page. Strategic + page-level spec. NOT implementation. Implementation happens via the Codex task queue (`codex-next-tasks.md`) under per-commit human approval.

This plan supersedes any earlier completion document for new development priority. The earlier `full-site-completion-report.md` is the close-out report of what already shipped (Batches A-D, Phase 2). This plan picks up from there.

Companion docs:
- `market-reference-study-wenu-mapu.md` — strategic patterns from 16 reference brands
- `live-site-audit-wenumapuonline.md` — legacy WP/WC site issues + fix list
- `wenu-contact-and-operations-plan.md` — contact + footer + email alias spec
- `wenu-subscription-and-journal-system.md` — Wenu Mapu List + journal funnel
- `wenu-visual-agent-plan.md` — image pipeline
- `codex-next-tasks.md` — implementation prompts

---

## Canonical business facts (binding for all copy)

- **Operating model:** private appointments + free local delivery. No studio. No "showroom at home." No walk-ins.
- **Service area:** Truckee, Kings Beach, Tahoe Vista and nearby North Lake Tahoe / Truckee airport area.
- **Inventory:** private, managed in Noco. Selected pieces shown by appointment.
- **Public contact:**
  - Email: marimari@wenumapuonline.com
  - Phone: +1 (408) 500-6211
  - Instagram: @wenu__mapu
- **Public wording (use exactly):**
  - "Private appointments available in the Truckee / North Lake Tahoe area."
  - "Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas."
  - "Selected pieces may be viewed by appointment."
- **Forbidden wording:** "Showroom at home" / "vitrine" / "walk-ins" / "studio location" / "Truth Tattoo" / "Troll Studio" / "Lucky7" / "Thrue Tattoo".

---

## Final site map (target state)

```
CORE
/                               Home
/shop                           Catalogue, 3-axis filter
/piercing                       Placement landing  ✅
/hangers                        Placement landing  ✅
/ear-weights                    Placement landing  ✅
/amulets                        Placement landing  ✅
/ritual-objects                 Placement landing  ✅
/ear-cuffs                      Placement landing  📌 NEW (low priority)
/p/[slug]                       Product detail    ✅

MATERIALS  (📌 NEW — Phase 2)
/material                       Hub
/material/sterling-silver       Material landing
/material/14k-gold              Material landing
/material/titanium              Material landing
/material/vacamuerta            Material landing — meteorite signature
/material/walnut-wood           Material landing
/material/brass-bronze          Material landing
/material/stone-fossil          Material landing  (optional)

COLLECTIONS  (📌 NEW — Phase 3)
/collection                     Hub
/collection/ritual-ring-vacamuerta
/collection/mystic-series
/collection/author-jewelry
/collection/chaway              ⚠ cultural review with founder before publishing

SERVICES & STORY
/about                          Story / brand                ✅
/artistry                       Process / craft              ✅
/materials                      Brand-wide materials primer  ✅ (cross-link to /material/*)
/custom-orders                  Commissions                  ✅ (mailto fallback)
/jewelry-styling                Curation / styling service   📌 NEW
/appointments                   Appointments + local delivery 📌 NEW (alias of /stockists for now)
/stockists                      Currently the appointments hub ✅ (rename surface, keep URL)
/care-guide                     Aftercare                    ✅ (OFF-LIMITS for edits)

SUPPORT
/sizing-guide                   Sizing reference             ✅
/shipping                       Shipping & returns canonical ✅
/shipping-returns               Alias                        ✅
/faq                            FAQ                          ✅
/contact                        Contact                      ✅

JOURNAL  (📌 NEW — Phase 4)
/journal                        Hub                          ✅ (currently empty)
/journal/[slug]                 Per-entry pages              📌 NEW

LEGAL / META
/privacy /terms /accessibility  ✅
/local                          Local pickup steps           ✅
/cart /checkout                 (deferred — currently route to WC)
/404                            ✅
```

**Net new in this plan**: ~16 routes (6 material + 1 hub, 3 collection + 1 hub, 1 jewelry-styling, 1 appointments alias, 6 founding journal entries). All additive. No existing page deleted, no Nav structural change required.

---

## Per-page specifications

Format per page: **purpose · target customer · H1 · subheadline · primary CTA · SEO title · meta description · sections · internal links · visual assets · English copy status · priority**.

### / (Home) ✅ exists

- Purpose: anchor the brand voice; route visitors to Shop, Appointments, or Journal.
- Target: first-time visitors arriving from Instagram, organic search, or word of mouth.
- H1: "Adornment for the sacred body."
- Sub: "Ancestral-cosmic body jewelry forged by hand. Limited stock, chosen materials."
- Primary CTA: "Shop the collection →" / Secondary "Book a private appointment →"
- SEO title: "Wenu Mapu — Adornment for the sacred body" (current — keep)
- Meta: "Ancestral-cosmic body jewelry forged by hand in Truckee, California. Implant-grade titanium, sterling silver, 14k gold. Custom commissions accepted." (current — keep)
- Sections: Hero / CategoryStrip / PatternBand / Featured rail / Sacred Territory + CardinalGrid / Truckee + Commissions teasers / USPs / Newsletter
- Internal links: /shop, /custom-orders, /local, /materials, /artistry, /care-guide, /stockists (Phase 1 done)
- Visual assets: hero-portrait already responsive AVIF/WebP; future replacement when brand shoot lands
- Copy status: ✅ EN
- Priority: KEEP. No structural change without explicit approval.

### /shop ✅

- Purpose: full filterable catalogue.
- Target: returning + intent shoppers.
- H1: "Each piece is an object with presence."
- Primary CTA: per-card "View piece →"
- SEO title: "Shop — Wenu Mapu Body Jewelry"
- Meta: existing keeps; expand with material list when Phase 2 ships.
- Sections: hero, filter UI (3-axis target), grid, contact-us escape hatch
- Internal links: all /piercing, /hangers, etc.; /material/*, /collection/*
- Visual: cards already in place
- Copy: ✅ EN
- Priority: P3 (3-axis filter UI is a Phase 3 task — not blocking)

### /piercing /hangers /ear-weights /amulets /ritual-objects ✅

- Purpose: anatomy-axis landings with curated featured rail + intro copy.
- Target: visitors searching by body placement.
- All have one H1, CollectionPage + BreadcrumbList JSON-LD, primary + secondary CTAs.
- Priority: KEEP. Add cross-links to relevant /material/* once those ship.

### /ear-cuffs 📌 NEW (low priority)

- Purpose: anatomy landing for a small but distinct category.
- H1: "Ear cuffs — adornment without piercing."
- Sub: "Sculpted brass, silver and titanium cuffs designed for the helix and conch. No piercing required."
- Primary CTA: "Browse the ear cuffs →"
- Secondary: "Sizing guide" (cuff fit is finicky)
- SEO title: "Ear Cuffs — Hand-forged silver, brass, titanium | Wenu Mapu"
- Meta: "Sculpted ear cuffs for helix, conch and outer ear. Hand-forged in Truckee, California. No piercing required."
- Sections: hero / 2-paragraph intro / CTA pair / featured rail
- Template: copy `src/pages/piercing.astro`
- KEYWORDS array: `['ear-cuff', 'ear-cuffs', 'cuff', 'pinza', 'pinza-de-oreja']`
- Priority: P4 — only build if WC has at least 3 ear-cuff products.

### /material (hub) + /material/<key> 📌 NEW × 6 + 1 hub

- Purpose: material-axis landings, premium positioning anchor.
- Target: visitors who shop by material (gold-only, meteorite-only, wood-only).
- H1 per page: "<Material> — <one-line essence>"
  - Sterling Silver 950: "Sterling Silver 950 — pure, durable, alive with light."
  - 14k Gold: "14k Gold — heirloom-grade, warm, made to outlast the wearer."
  - Titanium: "Implant-grade Titanium — ASTM F-136. Bio-compatible, lifetime safe in the body."
  - Vacamuerta Meteorite: "Atacama Meteorite — cosmic fragments, 4.5 billion years old."
  - Walnut & Tropical Wood: "Walnut & Tropical Wood — sustainably sourced, warm, grounded."
  - Brass & Bronze: "Brass & Bronze — bold ancestral metals with deep tribal roots."
- Sub per page: 1 sentence on use-case (which placements / which collections).
- Primary CTA: "Browse pieces in <material> →" → `/shop?material=<key>` (or until filter ships, link to relevant placement landings)
- Secondary CTA: "Read about our materials" → `/materials` brand-wide primer
- SEO title: "<Material> — <descriptive line> | Wenu Mapu"
- Meta: 1-sentence material framing + provenance + use case
- Sections: hero / canonical-phrase block from BRAND-DNA §4 / origin story / 1-paragraph craft note / featured rail of pieces in that material / cross-link to relevant Journal entry
- Template: clone `src/pages/piercing.astro`; KEYWORDS arrays per material slug
- i18n: append `landing.material_<key>` blocks to `src/i18n/en.json`
- Visual: per-material macro photo at hero; until photo session, use `public/img/categories/<closest>.webp`
- Copy: ✅ canonical phrasing exists in BRAND-DNA-2026-05-03.md §4
- Priority: P1 — first job for Codex (see codex-next-tasks.md Task 4).

### /collection (hub) + /collection/<key> 📌 NEW × 3-4

- Purpose: collection-axis landings; tells the maker-series story.
- Recommended first three:
  - `/collection/ritual-ring-vacamuerta` — flagship author series
  - `/collection/mystic-series` — themed evocative pieces
  - `/collection/author-jewelry` — one-of-a-kind premium tier
- `/collection/chaway` — ⚠ requires founder cultural-respect review before publishing.
- Template: same as /material/* (clone /piercing.astro, swap KEYWORDS)
- Priority: P2 (after /material/*)

### /materials ✅ (brand-wide primer)

- Purpose: explains all 6 material families in one place; entry from About.
- Action: cross-link each material section to its `/material/<key>` deep-dive.
- Priority: P2 update (after /material/* land).

### /artistry ✅

- Purpose: hand-forging process story.
- Action: extend with 1-2 process photos when available; link to Journal entry "Forging the meteorite" once published.
- Priority: KEEP for now. Improvement when visual assets + journal entry land.

### /custom-orders ✅

- Purpose: commissions service.
- Current state: full process content; mailto fallback (Phase 1).
- Action: when subscription/forms platform decision lands (see `wenu-subscription-and-journal-system.md`), wire form to real provider. Keep mailto as fallback link.
- Priority: P3 (depends on platform decision).

### /jewelry-styling 📌 NEW

- Purpose: announce the curation / styling service as a standalone surface (So Gold pattern). Even if execution is an email exchange, naming it as a service raises perceived value.
- Target: customers who want help selecting a piece (gift, first stretched-lobe weight, ritual milestone).
- H1: "Jewelry curation, by appointment."
- Sub: "Selected pieces curated to your story, your placement, your stretch. Free, by request."
- Primary CTA: "Request a curation →" (mailto: `marimari@wenumapuonline.com?subject=Jewelry curation request`)
- Secondary: "Or browse the catalogue →" → /shop
- SEO title: "Jewelry Curation by Appointment — Wenu Mapu"
- Meta: "Selected body jewelry curated to your story and placement. Free curation by request. Truckee / North Lake Tahoe area."
- Sections: hero / what we curate (lists: gift, first stretch, milestone, custom build) / how it works (3 steps) / what it costs (free) / CTA pair
- Visual: 1 editorial portrait or curated-tray flatlay; placeholder until shoot
- Copy status: 📌 to write
- Priority: P3.

### /stockists ✅ (rename surface to "Visit / Appointments")

- Purpose: appointments + free local delivery hub.
- Action: keep URL `/stockists` for SEO; relabel surface to "Visit / Appointments." Update copy:
  - H1: "Visit Wenu Mapu — Appointments + free local delivery."
  - Lead: "Private appointments available in the Truckee / North Lake Tahoe area. Free local delivery in Truckee, Kings Beach, Tahoe Vista and nearby. Selected pieces may be viewed by appointment."
  - Sections: How an appointment works (3 steps) / Local delivery zones (named) / Curation/styling cross-link / Future stockists ("we are not currently in any partner studio")
- DO NOT add a map embed. Appointment location is private and shared only after booking.
- Priority: P1 (hand-in-hand with contact/footer cleanup).

### /appointments 📌 NEW (URL alias)

- Optional: add `/appointments` as a route that renders the same content as `/stockists` (or 301s to it). Most users searching for "Wenu Mapu appointment" won't think to type `/stockists`.
- Implementation: simplest is a 1-line Astro page that imports the stockists content, or use `_redirects` if Cloudflare Pages.
- Priority: P3.

### /care-guide ✅ (OFF-LIMITS)

- Per `agent-control/DO_NOT_TOUCH.md`. Treated as separate deploy track per `aftercare-readiness-report.md`.
- Action: only cross-link FROM other pages. NEVER edit the file itself.

### /sizing-guide ✅

- Recently extended (Phase 2): gauge table + diameter table + post-length table + closing CTA block.
- Action: add per-zone diagram (SVG placeholder OK) when visual assets land.
- Priority: KEEP.

### /shipping + /shipping-returns ✅

- Action: ensure /shipping is canonical (Phase 2 done).
- Priority: KEEP.

### /faq ✅

- Recently extended (Phase 2): closing CTA block.
- Action: add 5 more questions sourced from real customer email patterns once available.
- Priority: KEEP.

### /contact ✅

- Action: replace ALL contact strings with canonical block:
  - Email: marimari@wenumapuonline.com
  - Phone: +1 (408) 500-6211
  - Instagram: @wenu__mapu
  - Add the 3 prescribed wordings (appointments / local delivery / view by appointment)
- Priority: P0 — ship with footer/operations cleanup (see `wenu-contact-and-operations-plan.md`).

### /journal ✅ (currently empty) + /journal/[slug] 📌 NEW × 6

- Purpose: editorial publication; email moat (Aesop pattern).
- Target: returning visitors and email subscribers.
- Sections (hub): hero / list of entries by date / Wenu Mapu List signup
- Per-entry sections: hero (title + eyebrow + meta) / long-form prose / 1-2 inline visuals / 2 product cards in tail / cross-link to related material/collection landing
- First 6 entries (each maps to a brand pillar):
  1. **What is Vacamuerta meteorite?** — material story · cross to /material/vacamuerta
  2. **The four cardinal forces** — cosmology primer · cross to /about
  3. **Why we forge in Truckee** — origin story · cross to /artistry
  4. **Forging the meteorite** — process · cross to /artistry, /material/vacamuerta
  5. **Aftercare — the first 90 days** — care primer · cross to /care-guide (DO NOT duplicate)
  6. **Reading the body for adornment** — styling/curation in Wenu Mapu's voice · cross to /jewelry-styling
- Template: Astro Content Collections (md/mdx in `src/content/journal/`); page at `src/pages/journal/[slug].astro`
- Length: 600-1,200 words per entry (per BRAND-DNA §10 discipline scaled up for editorial)
- Priority: P2 (after /material/* land — gives the journal entries a target to cross-link to).

### /local ✅

- Purpose: local pickup steps (existing).
- Action: cross-link to /stockists (Visit/Appointments).
- Priority: KEEP.

### /cart /checkout (deferred)

- Current: ATC routes to WC `/cart/?add-to-cart=ID` (Phase 1).
- Native Astro cart + a real checkout (Stripe / Snipcart / Shopify Lite) is a separate architecture decision; out of scope for this plan.
- Priority: deferred until apex cutover decision is made.

### /privacy /terms /accessibility ✅

- KEEP. Update only if legal counsel asks.

### /404 ✅

- KEEP.

---

## Service architecture summary

Six service surfaces, each with a clear next-action:

| Service | Page | Primary CTA | Email alias |
|---|---|---|---|
| Custom orders | `/custom-orders` | Send commission inquiry | custom@wenumapuonline.com |
| Jewelry curation / styling | `/jewelry-styling` | Request a curation | marimari@wenumapuonline.com (until styling@ created) |
| Local appointment viewing | `/stockists` | Request an appointment | marimari@wenumapuonline.com |
| Free local delivery | `/stockists` (same page, called out) | Confirm at checkout / contact us | orders@wenumapuonline.com |
| Aftercare guidance | `/care-guide` | Read aftercare guide | aftercare@wenumapuonline.com |
| Materials education | `/materials` and `/material/*` | Browse pieces in <material> | (n/a) |
| Future wholesale / professional | (deferred page) | n/a | wholesale@wenumapuonline.com (when ready) |

(Email alias plan in `wenu-contact-and-operations-plan.md`.)

---

## Implementation priority

| P | Group | Routes | Depends on |
|---|---|---|---|
| **P0** | Footer + Contact correction (Astro side) | `/contact` content, Footer.astro | Plan only — execution via Codex Task 1 |
| **P1** | Material landings | `/material/*` × 6 + hub | nothing |
| **P2** | Stockists/Appointments rewrite + jewelry-styling page | `/stockists`, `/jewelry-styling` | P0 done |
| **P2** | Journal template + 6 entries | `/journal/[slug]` × 6 | nothing structural; copy can be drafted in parallel |
| **P3** | Collection landings | `/collection/*` × 3 | P1 done |
| **P3** | 3-axis Shop filter UI | `/shop` | P1 done (filters need material data) |
| **P4** | /ear-cuffs (if catalog supports) | `/ear-cuffs` | WC has ≥3 cuff products |
| **P4** | /collection/chaway | route | cultural respect review with founder |
| **Deferred** | Native cart / checkout | `/cart`, `/checkout` | apex cutover decision |

---

## Visual assets needed (priority order)

| Asset | Used by | Status |
|---|---|---|
| Per-material macro shots × 6 | `/material/*` PDPs hero | NEEDED |
| Vacamuerta meteorite raw + finished pair | `/material/vacamuerta`, journal entry | NEEDED |
| Truckee studio / workshop interior (1 wide, 1 detail) | `/about`, `/journal/why-truckee` | NEEDED |
| Founder portrait | `/about`, optional `/contact` | NEEDED |
| Process photos (filing / hammering / polishing / setting) | `/artistry`, journal entry | NEEDED |
| Per-zone sizing diagram (SVG) | `/sizing-guide` | NEEDED (placeholder OK) |
| Editorial portrait or curated-tray flatlay | `/jewelry-styling` | NEEDED |
| Real Mapuche-textile pattern band SVG | Footer + dividers | NEEDED (Phase 1 blocker #2) |
| Real cardinal-cross SVGs | Home Sacred Territory | NEEDED (Phase 1 blocker #2) |
| Drop hero per ritual moment | Future `/drops/*` | NEEDED on demand |

(See `wenu-visual-agent-plan.md` for the production pipeline.)

---

## English copy status

- Home, Shop, /piercing, /hangers, /amulets, /ear-weights, /ritual-objects, /custom-orders, /materials, /artistry, /about, /care-guide, /sizing-guide, /shipping, /faq, /contact, /local, /stockists — **all in EN, on-voice** (Phase 1 + Phase 2 done).
- /material/*, /collection/*, /journal entries, /jewelry-styling, /ear-cuffs — **TO WRITE**, source from BRAND-DNA §4 (materials) + voice rules in `voz-de-marca-real-2026-05-03.md`.
- Mapudungun phrases (Mari Mari, Pewmangen, Newen, Wenumapu) stay as accents in eyebrows / ritual marks; page body stays English.

---

## What requires explicit approval

1. **Per-Codex-task approval** before any coding starts (per `agent-control/AGENT_CONTROL_CENTER.md`).
2. **Per-commit approval** locally on `redesign-v2`.
3. **Cultural respect review for /collection/chaway** — founder must approve before any Mapuche-inspired collection page goes live.
4. **Form provider decision** before wiring real signup forms (see `wenu-subscription-and-journal-system.md`).
5. **Visual asset generation cap** if any image generation tool is used (see `wenu-visual-agent-plan.md`).
6. **No** GitHub remote, push, deploy, DNS, Cloudflare Tunnel, WC writes — separate gates.

---

## What is explicitly out of scope here

- Aftercare changes (separate deploy track; OFF-LIMITS per DO_NOT_TOUCH.md)
- Cloudflare Pages preview deploy (P3 in TASK_QUEUE.md, not part of this plan)
- Tunnel rotation (P0-C in TASK_QUEUE.md, separate track)
- WC catalog reconciliation (P4 in TASK_QUEUE.md, owned by `wenu-producto`)
- Apex DNS / cutover (P8 in TASK_QUEUE.md, owner-only)
- Real form provider integration (decision in subscription plan, build in Codex Task 3)
