# Wenu Mapu — Pages Audit

Date: 2026-05-15
Scope: read-only audit of `src/pages/` vs target sitemap in `full-site-completion-plan.md`.

## Summary

- **41 routes exist** (28 top-level + 4 collection + 7 material + 1 journal hub + journal `[slug]` + product `[slug]`).
- **0 pages from the target sitemap are missing as files.** Every route the plan flagged 📌 NEW (material hub + 6 materials, collection hub + 3 collections, journal hub + 6 entries, jewelry-styling, ear-cuffs) has shipped.
- The real gaps are: **navigation does not link 90% of the site**, several pages are **thin skeletons** needing content depth, and a few **bonus pages exist that the plan never specified** (sets, wholesale, materials/material overlap).

---

## (a) Pages that EXIST

### Core
`/` · `/shop` · `/p/[slug]` · `/piercing` · `/hangers` · `/ear-weights` · `/amulets` · `/ritual-objects` · `/ear-cuffs` · `/sets`

### Materials
`/material` (hub) · `/material/sterling-silver` · `/material/14k-gold` · `/material/titanium` · `/material/vacamuerta` · `/material/walnut-wood` · `/material/brass-bronze`
(Note: `/material/stone-fossil` was optional in the plan — not built. OK.)

### Collections
`/collection` (hub) · `/collection/ritual-ring-vacamuerta` · `/collection/mystic-series` · `/collection/author-jewelry`
(`/collection/chaway` correctly NOT built — pending cultural review.)

### Services & Story
`/about` · `/artistry` · `/materials` · `/custom-orders` · `/jewelry-styling` · `/stockists` · `/care-guide` · `/wholesale`

### Support
`/sizing-guide` · `/shipping` · `/shipping-returns` · `/faq` · `/contact` · `/local`

### Journal
`/journal` (hub) · `/journal/[slug]` — 6 entries exist in `src/content/journal/`: what-is-vacamuerta, four-cardinal-forces, why-truckee, forging-the-meteorite, aftercare-first-90-days, reading-the-body.

### Legal / Meta
`/privacy` · `/terms` · `/accessibility` · `/404`

### Endpoints
`/search-index.json` · `/api/custom-order`

---

## (b) Pages that are MISSING

No sitemap route is missing as a file. Optional/deferred items not built (acceptable per plan):

| Route | Status | Note |
|---|---|---|
| `/appointments` | not built | Plan P3 — URL alias of `/stockists`. 1-line page or `_redirects` entry. Low effort, worth doing for SEO. |
| `/material/stone-fossil` | not built | Plan marked optional. Skip until catalog supports it. |
| `/collection/chaway` | not built | Correctly gated on founder cultural review. |
| `/cart` `/checkout` | not built | Deferred — routes to WooCommerce. Correct. |

Standard premium-jewelry pages checklist — all present: size guide ✅, shipping/returns ✅, care ✅, about ✅, contact ✅, FAQ ✅, journal ✅, gift cards ❌ (not in plan, not built), search ✅ (modal + endpoint, no dedicated `/search` results page), 404 ✅, wholesale ✅, lookbook ❌ (a B2B lookbook PDF exists in `reports/` but no web page).

**Genuinely worth adding (not in plan):**
- **Gift cards / e-gift page** — standard for premium jewelry; currently absent.
- **Lookbook page** — a B2B lookbook PDF already exists (`reports/lookbook-b2b-wenu-mapu-v1.pdf`); a `/lookbook` web surface would reuse existing assets.

---

## (c) Pages that EXIST but are INCOMPLETE / thin

Judged by file size, content depth, and reliance on minimal i18n blocks. Note: most page bodies are thin because copy lives in `src/i18n/en.json` — file size alone understates content. Flagged below are the ones with genuinely shallow content or known placeholders.

| Page | Size | Issue |
|---|---|---|
| `jewelry-styling.astro` | 1.9 KB | Functional but the leanest service page. Content depends entirely on `en.styling` i18n block — verify it has real copy, not stubs. No featured rail, no visual. P3 page; acceptable but minimal. |
| `faq.astro` | 1.8 KB | Plan says add 5 more questions from real customer email patterns. Currently driven by `en.faq.items` — depth unknown but flagged as expansion target. |
| `shipping.astro` / `shipping-returns.astro` | 1.7–1.9 KB | Both render from `en.shipping`. Fine structurally; verify the i18n lists are not 1-liners. |
| `accessibility.astro` | 2.4 KB | Standard legal stub. Acceptable. |
| `local.astro` | 2.0 KB | Plan asks for cross-link to `/stockists`. Thin. |
| `index.astro`, `sets.astro`, `care-guide.astro` | — | Contain the literal string "placeholder" — `index`/`care-guide` reference placeholder VISUAL assets (PatternBand/cardinal SVGs), not placeholder copy. `sets.astro` flagged — review whether it is a real curated page or a stub; it is NOT in the target sitemap. |
| Material & collection landings | ~2.8 KB each | Structurally complete (hero, copy, CTA, featured rail, JSON-LD). Content depends on `landing.material_*` / collection i18n blocks. Verify those blocks are written, not stubbed. Visual: all reuse `categories/*.webp` placeholders — per-material macro shots still NEEDED. |

**Biggest structural defect — Navigation:**
- `Nav.astro` desktop menu links only: Commissions, Piercing, Hangers, About, Journal, Care, plus Shop dropdown. It does **NOT** link `/material*`, `/collection*`, `/stockists`, `/sizing-guide`, `/shipping`, `/faq`, `/jewelry-styling`, `/ear-weights`, `/amulets`, `/ritual-objects`, `/ear-cuffs`, `/sets`, `/contact` (contact only in mobile drawer).
- `Footer.astro` links only: home, accessibility, privacy, terms, email, phone. **No links to shop, materials, collections, support pages, journal, appointments.** A premium e-commerce footer should be a full sitemap. This is the single highest-impact gap.

---

## (d) Priority

| P | Item | Why |
|---|---|---|
| **P0** | Rebuild `Footer.astro` as a full sitemap (Shop, Materials, Collections, Services, Support, Legal columns) | ~30 pages exist but are unreachable; kills SEO crawl + UX. |
| **P0** | Expand `Nav.astro` — add Materials & Collections dropdowns or links; surface Appointments/Stockists | Same reachability problem in primary nav. |
| **P1** | Verify & fill i18n blocks for material/collection/styling/faq landings | Pages may render with stub copy; confirm `en.json` blocks are real. |
| **P1** | Expand `/faq` with 5+ real-customer questions | Explicit plan action; thin today. |
| **P2** | Add `/appointments` alias route + cross-link `/local` ↔ `/stockists` | Cheap SEO win; plan P3 but low effort. |

### Top 5 to complete first
1. **Footer rebuild** — full sitemap footer (P0).
2. **Nav expansion** — Materials + Collections + Appointments in header (P0).
3. **i18n content verification** — confirm material/collection/styling/faq i18n blocks contain real copy, fill any stubs (P1).
4. **FAQ expansion** — +5 questions (P1).
5. **`/appointments` alias + `/local`↔`/stockists` cross-links** (P2).

### Optional / new (not in plan)
- `/gift-cards` page — standard premium-jewelry surface, currently absent.
- `/lookbook` web page — reuse existing `lookbook-b2b-wenu-mapu-v1.pdf` assets.
- Review `/sets.astro` — not in target sitemap; confirm it is intentional and complete or retire it.

Per-material macro photography remains the top blocking visual asset for all 6 material landings.
