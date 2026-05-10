# Live Site Audit — wenumapuonline.com

Date: 2026-05-09 (updated overnight 2026-05-09→10 with corrected business facts)
Scope: read-only audit of the LIVE public WordPress / WooCommerce store at `https://wenumapuonline.com` (apex) and `https://www.wenumapuonline.com` (www). Audit only — no logins performed, no WC writes, no edits, no DNS or Cloudflare changes. The Astro redesign in `~/wenu-frontend/` is a SEPARATE project and is NOT what's currently public.

**Canonical business facts (apply to all "fix" recommendations below; OVERRIDE anything in legacy brand docs):**
- Wenu Mapu is **not currently inside any tattoo or piercing studio.** No "Showroom at home." No "Truth Tattoo / Troll Studio / Lucky7" mentions. No "vitrine."
- Operating model: **private appointments + free local delivery** in Truckee, Kings Beach, Tahoe Vista and nearby North Lake Tahoe / Truckee airport area. Selected pieces may be viewed by appointment.
- Inventory is private and managed in **Noco**.
- Public canonical contact:
  - Email: **marimari@wenumapuonline.com**
  - Phone: **+1 (408) 500-6211**
  - Instagram: **@wenu__mapu**
- Public wording to use exactly:
  - "Private appointments available in the Truckee / North Lake Tahoe area."
  - "Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas."
  - "Selected pieces may be viewed by appointment."

The audit findings below remain accurate as of the live curl on 2026-05-09; the **fix recommendations** in §6 and §10 use the canonical facts above. Any earlier reference to "Showroom at home, Truckee" in the legacy WP Contact page body is itself a fix target — that wording must be replaced.

Context: per `~/wenu-frontend/agent-control/CURRENT_STATE.md`, the apex domain has been returning HTTP 502 since the Cloudflare Tunnel routes apex → `localhost:4321` (Astro dev), which isn't always running. The live store is the legacy WP/WC installation served from `www.wenumapuonline.com`.

Method: live `curl` with browser User-Agent against both apex and www, then per-page fetches across nav and slug-probes for expected routes. Server-rendered HTML inspected; JS-rendered content (Elementor canvas, lazy-loaded prices) noted as such where invisible to crawlers.

---

## 1. Executive verdict

The live site has the right BRAND COPY trapped inside the WRONG WRAPPER.

The voice ("Sacred Adornments. Ritual Jewelry Rooted in Spirit," "portal between modern minimalism and ancestral mysticism," Atacama meteorite as signature material) is on-brand. But the **footer is broken**, the **UI is bilingual on an English-target store**, **placeholder products are public**, **SEO is effectively zero**, the **apex returns 502**, and the **theme** (Bridge + Slider Revolution + Elementor) reads as 2018-vintage WooCommerce default — not premium dark ritual luxury.

A serious customer landing on this site sees an identity crisis: serious copy in a default-shop frame, an outdated Petrolia address in the footer that contradicts the Truckee positioning above it, and "producto prueba" sitting next to "Ritual Ring Vacamuerta No. 19." This is conversion-hostile.

**The good news**: every issue here is fixable from WP admin without touching the Astro redesign. The Astro side is on a separate, healthier track.

```
🟡  LEGACY WP STORE — multiple high-priority hygiene issues; brand-undermining
🟡  APEX DOMAIN — 502, depends on Cloudflare Tunnel target
🟢  ASTRO REDESIGN — green build, 88 pages, separate track (Phase 1 + Phase 2 done)
```

---

## 2. Reachability state

| URL | Status | Notes |
|---|---|---|
| `https://wenumapuonline.com` (apex) | **HTTP 502** (Cloudflare) | Tunnel routes apex → `localhost:4321` (Astro dev). Confirms `CURRENT_STATE.md`. |
| `https://www.wenumapuonline.com` (www) | **HTTP 200** | Legacy WP/Woo store served. THIS is the live store. |
| WebFetch on www | 403 (UA-blocked) | Audit done via `curl` with browser UA. |

Stack detected (from leaked generators in HTML):
- WordPress 6.9.4
- WooCommerce 10.7.0
- Elementor 3.33.4
- Slider Revolution 6.7.18
- Bridge theme
- YITH Cookie / YITH Catalog plugins
- Cloudflare email obfuscation enabled

---

## 3. What currently works

- **Brand copy is on-voice.** "Sacred Adornments. Ritual Jewelry Rooted in Spirit." manifesto and the "portal between modern minimalism and ancestral mysticism" body land the brand correctly.
- **Top notice bar carries the new positioning.** "Now 100% online — USPS Priority shipping across the US. Local pickup Truckee & North Lake Tahoe by appointment." This matches the post-pivot direction.
- **Real product names exist** ("Ritual Ring Vacamuerta No. 19 — Sterling Silver + Atacama Meteorite," "Mystic Bee Titanium Piercing," "Diamond Walnut Wood Hangers"). These are author-series quality names.
- **Cart is reachable.** `/cart/` returns 200; checkout chain works (302 → /cart/ when empty, expected behavior).
- **Categorization in the megamenu reflects the canonical taxonomy** from `BRAND-DNA-2026-05-03.md` §5 (Septum, Stretching, Earrings, Lip Jewelry, Classic, Organic, Metals, Clothes, Author Jewelry, Decoration, Art).
- **Truckee Showcase has a notice in the hero** — not buried.

---

## 4. What is outdated

- **Footer address: "89 Sherman Rd, Petrolia, CA 95558"** — pre-pivot, contradicts the Truckee positioning.
- **Footer phone: `+145 8226 6027` / `+14582266027`** — looks malformed (`+1-45...` is not a valid US area code prefix). The current correct phone `(408) 500-6211` only appears on the Contact page body, not in the footer.
- **Footer credit: "Diseñado por Rizoma Digital"** — pre-pivot, mixed-language, and per `BRAND-DNA` no longer the design owner.
- **Slugs from old WP migrations**: `/contact-2/`, `/about-3/` (Yoast/WP appended `-2/-3` after old pages were deleted; never cleaned up). `/contact` → 301 → `/contact-2/`. `/aftercare` → 301 → `/aftercare-guide-cuidado-posterior/` (mixed Spanish/English slug).
- **`/ear-weights` resolves to a single product page**, not a category landing — should be a category.
- **Test products live**: `producto prueba` (Spanish "test product") visible as a live product on the homepage product loop. `Pronto` (Spanish "Soon") visible as a product title on the homepage.
- **Email displayed as literal `[email protected]`** in some non-JS contexts (Cloudflare obfuscation rendering breaks for crawlers / non-JS scrapers).
- **WP / Woo / Elementor / Slider Revolution version strings leaked** in meta generators — minor security signal and aging-tech tell.

---

## 5. What hurts trust / conversion

In priority order:

1. **Footer Petrolia address + broken phone + Rizoma credit** appear on EVERY page. Every visitor sees them. They contradict the brand's own hero notice that says "Truckee."
2. **`producto prueba` and `Pronto` as visible products on the homepage** — instantly read as a hobby store, not premium.
3. **Mixed-language UI on an English store**: "Cesta," "Añadir," "Leer más" (×10 on home tiles), "Descartar," "Diseñado por," "Fono," "No hay productos en la cesta." The site declares `<html lang="es">` but most content is English. Every Spanish word on an English page is a friction.
4. **Generic `<title>` on every product page** ("Wenu Mapu | Products"). No meta description, no Open Graph, no Schema.org product markup anywhere. SEO is effectively zero.
5. **Theme + Slider Revolution carousel** read as default WooCommerce ca. 2018 — undermines the premium register the copy is reaching for.
6. **Apex 502** means anyone typing `wenumapuonline.com` (without www) sees a Cloudflare error page. Most users do not type `www`.
7. **No homepage `<h1>` in the HTML source** (Elementor builds the DOM in JS). Hurts SEO and screen-reader accessibility.
8. **Ugly, migration-cruft slugs** (`/contact-2/`, `/about-3/`) expose internal history.
9. **Missing pages**: many premium-store-expected routes are 404s — `/custom-orders`, `/materials`, `/artistry`, `/sizing-guide`, `/stockists`, `/faq`, `/shipping`, `/care-guide`, `/journal`, `/piercing`, `/hangers`, `/amulets`, `/ritual-objects`. A buyer asking the obvious next question hits a wall.
10. **No customer reviews surfaced.** Premium body jewelry depends on third-party trust; the store has none on PDPs.

---

## 6. What must be fixed before serious launch

Listed for owner action — Claude/Codex cannot do these (they're WP admin / Cloudflare changes that require the user's hands and credentials).

| # | Task | Where | Risk |
|---|---|---|---|
| FIX-1 | Replace footer address line. **Do NOT** print a street address. Use: "Truckee, California — private appointments available in the Truckee / North Lake Tahoe area." | WP → Appearance → Customize → Footer widget OR Elementor footer template | Low |
| FIX-2 | Replace footer phone with the canonical number: **+1 (408) 500-6211**. (The `+145…` and `+1 (458) 226-6027` numbers are stale — do not use either.) | Same widget | Low |
| FIX-3 | Remove "Diseñado por Rizoma Digital" credit from footer | Same | Low |
| FIX-4 | Unpublish products: `producto prueba`, `Pronto` (and any other `Aonik` / draft-leak titles visible on the homepage product loop) | WP → Products → set status to Draft (do NOT delete; preserve data) | Low — additive (status change only) |
| FIX-5 | Switch the WC locale strings from Spanish to English: `Cesta` → `Cart`, `Añadir` → `Add to cart`, `Leer más` → `Read more`, `Descartar` → `Dismiss` | WP → Settings → General (Site Language = English-US) AND WC strings; or Loco Translate plugin | Low–Medium (test cart flow after) |
| FIX-6 | Install Yoast SEO or RankMath. Add per-product `<title>` + meta description + OG. Add homepage `<title>` + meta. | WP → plugin install + per-page configuration | Medium (per-product effort) |
| FIX-7 | Apex 502: route `wenumapuonline.com` → `www.wenumapuonline.com` (301), or change Cloudflare Tunnel ingress for apex to point to the WP origin (NOT `localhost:4321`). **Coordinate with `cloudflared-local-managed-migration-plan.md`**; do NOT do this casually. | Cloudflare dashboard | High blast radius — owner-only |
| FIX-8 | Clean migration slugs: redirect `/contact-2/` → `/contact/`, `/about-3/` → `/about/`. Then point internal nav/footer links to canonical slugs. | Yoast Redirections or `wp-config.php` redirects | Low |
| FIX-9 | Disable WP version generator meta tags (security hygiene) | Yoast / RankMath setting OR `remove_action('wp_head','wp_generator')` in functions.php | Low |
| FIX-10 | Email obfuscation: confirm Cloudflare email obfuscation works for human visitors. The literal `[email protected]` only renders for non-JS scrapers, so this is mostly fine — but verify with a real browser pass. | Cloudflare dashboard | Low |

---

## 7. What can be improved later (deferred)

- Replace the Bridge theme + Slider Revolution + Elementor stack with a premium minimal theme (Blocksy, GeneratePress + custom Astra child, or Kadence) tuned to dark luxury. Or — preferred — accelerate the Astro Pages cutover and retire the legacy theme entirely.
- Wire customer reviews (Judge.me, Stamped) and surface them on PDPs.
- Add JSON-LD `Product` markup on every PDP (Yoast / RankMath does this once configured).
- Replace the auto-rotating Slider Revolution hero with a static editorial hero with manual navigation.
- Adopt a 3-axis nav structure that mirrors the Astro plan (Placement / Material / Collection mega-menu) — but only after the redesign goals are settled, since this changes WC category structure.
- Customer-facing wishlist tied to a real account (or remove the heart icon if it's not wired).
- Cookie banner audit — YITH cookie plugin is in stack; verify GDPR/CCPA compliance language matches the new operations base (US/Truckee).

---

## 8. Page-by-page findings

### Homepage (`https://www.wenumapuonline.com/`)

| Aspect | Finding |
|---|---|
| `<title>` | "Wenu Mapu \| Ornaments tribe jewelry" — generic; doesn't carry premium signal |
| Meta description | NONE |
| OG | NONE |
| JSON-LD | NONE |
| `<html lang>` | `es` (incorrect; site is mostly English-targeted) |
| Hero | Slider Revolution carousel — rings, hangers, plugs |
| H1 | NOT in HTML source (Elementor JS-renders) — **accessibility + SEO issue** |
| Top notice | "Now 100% online — USPS Priority shipping across the US. Local pickup Truckee & North Lake Tahoe by appointment. **Descartar**" (Spanish "Dismiss") |
| Manifesto block | "Sacred Adornments. Ritual Jewelry Rooted in Spirit." + portal/cosmos/sacred-territory paragraph — **on-brand** |
| Visible product tiles | Includes `producto prueba`, `Pronto`, `Aonik` (drafts/test surfacing publicly) — **must unpublish** |
| Tile CTA repetition | "Leer más" Spanish appears ×10 on tiles — **localization gap** |

### Product page (sample: `/producto/septum-anillos-8mm-2/`)

| Aspect | Finding |
|---|---|
| URL slug | Spanish (`/producto/`) on an English-targeted page |
| `<title>` | "Wenu Mapu \| Products" — **generic, identical for every product** — major SEO loss |
| Product H1 (`.product_title`) | "6mm Silver Titanium Septum Rings" — fine in body, but not in `<title>` |
| Price | JS-injected (not in HTML source) |
| Currency | USD ($) |
| Short description | "1.2x8mm" — single line, no narrative |
| Material info | Not surfaced in HTML source |
| Sizing info | Only "1.2x8mm" — no link to sizing guide |
| Care info | No tab, no link |
| Shipping info | No PDP-level shipping; site-wide aftercare/returns at hybrid-language slugs |
| Returns | Reachable in nav as "Returns & Refunds" |
| ATC button | "**Añadir**" (Spanish "Add" — should be "Add to cart") |
| In-stock indicator | `instock` class present; some products show `out-of-stock` |
| Photo count | 1 gallery container (multiple photos likely lazy-loaded — not verified) |
| Meta description | NONE |
| JSON-LD | NONE |
| OG | NONE |

### Categories / megamenu

Top-level: Septum / Stretching / Earrings / Lip Jewelry / Classic / Organic / Metals / Clothes / Author Jewelry / Decoration / Art / Contact / About Wenu Mapu.

This **matches the canonical brand taxonomy** in `BRAND-DNA-2026-05-03.md` §5. The structure is correct; the labels are correct in EN. The PROBLEM is not the categories — it's that they're presented inside a default theme without filtering UI, and category URL slugs mix Spanish + English (e.g., `/categoria-producto/piercing-en/septum-en/`).

### Cart / Checkout

- `/cart/` → 200 OK, title "Wenu Mapu | Cart page" (English, good).
- `/checkout/` → 302 → `/cart/` (correct behavior when cart is empty).
- Payment methods surfaced in cart HTML: PayPal only. No Stripe / Apple Pay / Google Pay / card-brand logos visible (note: may be JS-rendered later in checkout flow).

### Footer (every page, identical)

| Element | Content | Verdict |
|---|---|---|
| Sections | Navigation / Information / Contact | OK structure |
| Address | "89 Sherman Rd, Petrolia, CA 95558" | **OUTDATED — must change** |
| Phone | "Fono: +145 8226 6027" | **MALFORMED — must change** |
| Email | "[email protected]" (Cloudflare obfuscation) | OK in browsers; verify |
| Credit | "© 2026 WenuMapu . Diseñado por Rizoma Digital" | **OUTDATED + Spanish** |
| Social | Not in footer (only in Contact page body) | Add to footer |

### Contact page body (`/contact-2/`)

Currently surfaces (verbatim from live HTML):
- Address: "Showroom at home, Truckee, California / Lake Tahoe, CA / Ships from Truckee, California → Worldwide"
- Phone: "(408) 500-6211 — Direct line — Truckee, CA"
- Email: Cloudflare-obfuscated
- Instagram: @wenumapu

**Two issues:**
1. The "Showroom at home" wording is **not the current model** and must be removed. The brand is now appointment + free local delivery; no studio, no home showroom, no walk-ins. Replace with the canonical wording in §1 above.
2. The phone (408) is correct. The legacy footer phone (+145…) and the legacy BRAND-DNA `+1 (458) 226-6027` are both stale — do not use either anywhere.

Canonical Contact-page block to publish (legacy + Astro):
> **Email** marimari@wenumapuonline.com
> **Phone** +1 (408) 500-6211
> **Instagram** @wenu__mapu
> Private appointments available in the Truckee / North Lake Tahoe area.
> Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas.
> Selected pieces may be viewed by appointment.

### Aftercare

- Lives at `/aftercare-guide-cuidado-posterior/` — **hybrid-language slug, unprofessional**.
- `/aftercare` → 301 → that slug.
- Per `~/wenu-frontend/aftercare-readiness-report.md`, the Astro side has a clean `/aftercare/index.html` ready to go on its own deploy track.

### Language consistency table

| Element | Lang | Should be |
|---|---|---|
| `<html lang>` | `es` | `en` |
| Page titles | EN | EN ✅ |
| Hero copy | EN | EN ✅ |
| Top notice "Descartar" | ES | EN ("Dismiss") |
| Tile CTA "Leer más" (×10) | ES | EN ("Read more") |
| Cart label "Cesta" | ES | EN ("Cart") |
| Cart total "Cesta Total" | ES | EN ("Cart total") |
| Empty-cart "No hay productos en la cesta" | ES | EN |
| Footer "Diseñado por" | ES | EN ("Designed by") — or remove |
| Footer "Fono" | ES (Chilean) | EN ("Phone") |
| ATC button "Añadir" | ES | EN ("Add to cart") |
| Aftercare slug | hybrid | EN-only `/aftercare/` |
| Returns slug `/politicas-reembolso-devoluciones-en/` | hybrid | EN-only `/shipping/` or `/returns/` |
| Product slugs `/producto/...` | ES | EN `/product/...` (with redirects to preserve SEO) |

### Missing-page slug probe

| Slug | Result |
|---|---|
| `/products/` | 200 |
| `/cart/` | 200 |
| `/checkout/` | 302 → `/cart/` |
| `/contact-2/` | 200 (current contact — ugly slug) |
| `/about-3/` | 200 (current about — ugly slug) |
| `/contact` | 301 → `/contact-2/` |
| `/aftercare` | 301 → `/aftercare-guide-cuidado-posterior/` |
| `/ear-weights` | 301 → single product page, NOT a category |
| `/custom-orders` | **404** |
| `/materials` | **404** |
| `/artistry` | **404** |
| `/sizing-guide` | **404** |
| `/stockists` | **404** |
| `/faq` | **404** |
| `/shipping` | **404** |
| `/shipping-returns` | **404** |
| `/care-guide` | **404** |
| `/journal` | **404** |
| `/piercing` | **404** |
| `/hangers` | **404** |
| `/amulets` | **404** |
| `/ritual-objects` | **404** |

The legacy WP store has none of the support pages a premium body jewelry buyer expects to find. The Astro redesign already has them — but the Astro redesign is not yet deployed publicly.

---

## 9. Priority list

### P0 — Visible to every customer; fix this week

- FIX-1, FIX-2, FIX-3 (footer)
- FIX-4 (test-product unpublish)
- FIX-5 (Spanish UI strings)

### P1 — Conversion / SEO blockers; fix in next 2 weeks

- FIX-6 (SEO plugin + per-product titles + meta + OG)
- FIX-7 (apex 502 routing) — owner decides whether to fix on legacy or accelerate Pages cutover
- FIX-8 (slug cleanup)

### P2 — Hygiene; defer or roll into Pages cutover

- FIX-9 (generator strip)
- FIX-10 (email obfuscation verification)
- Review/remove Slider Revolution + Bridge theme as part of redesign cutover
- Add reviews capture (Judge.me / Stamped)
- JSON-LD product markup (handled by SEO plugin once configured)

---

## 10. Recommended Astro redesign-v2 implications

The audit of the live site confirms the strategic direction the Astro redesign is already taking. Specifically:

1. **English-first canonical copy** in `src/i18n/en.json` is already correct. Continue that discipline.
2. **Standalone landings for the body-placement axis** are already shipped (`/piercing`, `/hangers`, `/amulets`, `/ear-weights`, `/ritual-objects`). The legacy store has NONE of these — the Astro side is the path to category clarity.
3. **PDP trust block** is the highest-leverage Astro change next. The legacy PDP has zero trust signals; the Astro side can ship a compact spec block (material / gauge / made-in / sizing-link / aftercare-link / returns / commission) on `src/pages/p/[slug].astro` in a single small commit.
4. **JSON-LD product schema** can ship on Astro PDPs with one helper update — much cheaper than retrofitting via Yoast on the legacy WC store.
5. **Material-axis landings** (`/material/sterling-silver`, etc., 6 pages) are a natural Phase 2/3 — see `market-reference-study-wenu-mapu.md` §16.
6. **Truckee Showcase** as a peer service surface is already represented by `/stockists`. Keep refining.
7. **Aftercare** stays on its own deploy track per `aftercare-readiness-report.md` — DO NOT touch.
8. **Cart / checkout**: the Astro Buy CTA correctly routes to WC `/cart/?add-to-cart=ID` for now. The medium-term play is a native Astro cart + Stripe / Shopify Lite — but ONLY after the legacy footer/SEO/test-product fixes ship, otherwise the brand is fighting on two fronts.

The strategic conclusion is: **get the legacy site to a respectable baseline in one sitting (FIX-1..FIX-5), then concentrate all new development effort on the Astro redesign and prepare the Pages preview deploy**. Do not rebuild the legacy site beyond hygiene.

---

## 11. What must NOT be touched

Per `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md`:

- WooCommerce product DATA (no writes via WC REST API; status changes via WP admin only by the human owner)
- WordPress admin (no automation; Claude does not log in)
- DNS for `wenumapuonline.com` or `www.wenumapuonline.com`
- Cloudflare Tunnel (changing apex routing has 3-hostname blast radius — see plan)
- Aftercare files
- `.env*` files
- Any production deploy

---

## 12. Final response

```
Live site audit done: yes
Snapshot used: live curl on www.wenumapuonline.com (apex 502 confirmed)
```

### Top 10 issues

1. Footer Petrolia address + malformed `+145…` phone + "Rizoma Digital" credit on every page — directly contradicts Truckee positioning.
2. `producto prueba` and `Pronto` test products visible on the homepage product loop.
3. Mixed-language UI on an English store: "Cesta," "Añadir," "Leer más" (×10), "Descartar," "Diseñado por," "Fono," "Pronto."
4. Generic `<title>` "Wenu Mapu | Products" on every PDP; no meta description, no OG, no JSON-LD anywhere.
5. Apex `wenumapuonline.com` returns HTTP 502 (only `www.` works).
6. No homepage `<h1>` in HTML source (Elementor JS-renders) — SEO + accessibility hit.
7. Migration-cruft slugs `/contact-2/`, `/about-3/`.
8. Aftercare hybrid slug `/aftercare-guide-cuidado-posterior/`; returns slug `/politicas-reembolso-devoluciones-en/`.
9. Missing pages: 13 expected routes (custom-orders, materials, artistry, sizing-guide, stockists, faq, shipping, care-guide, journal, piercing, hangers, amulets, ritual-objects) all 404.
10. Theme stack (Bridge + Slider Revolution + Elementor) reads as 2018 default WooCommerce — not premium dark ritual.

### Top 5 quick wins

1. Footer: replace Petrolia address with appointment-only Truckee wording, set phone to canonical `+1 (408) 500-6211`, set email to `marimari@wenumapuonline.com`, remove Rizoma Digital credit. WP → Customize / Elementor footer.
2. Unpublish (set status to Draft, do NOT delete) `producto prueba` and `Pronto` in WC products.
3. Install Yoast or RankMath; set homepage `<title>` + meta description; backfill product titles + meta over a week.
4. Localization: switch WC strings to English (`Cesta` → `Cart`, `Añadir` → `Add to cart`, `Leer más` → `Read more`, `Descartar` → `Dismiss`).
5. Apex 502: simplest fix is a 301 from `wenumapuonline.com` → `www.wenumapuonline.com` at the Cloudflare DNS layer (or update Tunnel ingress for apex). Coordinate per `cloudflared-local-managed-migration-plan.md`.

### What should NOT be touched

- WooCommerce products (no writes via API)
- WP admin logins (Claude does not log in)
- DNS or Cloudflare Tunnel without an explicit human-approved plan
- Aftercare files (separate deploy track)
- The Astro redesign branch from inside this audit
- Production deploys (none in scope)

---

## Sources

- Live `curl` fetches against `wenumapuonline.com` and `www.wenumapuonline.com` on 2026-05-09 ~21:13 PT
- `~/wenu-frontend/agent-control/CURRENT_STATE.md` — apex 502 + tunnel routing context
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` — what must remain untouched
- `~/wenu-frontend/cloudflared-local-managed-migration-plan.md` — apex routing change framework
- `~/wenu-frontend/aftercare-readiness-report.md` — separate deploy track for aftercare
- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` — canonical brand source (address, phone, taxonomy)
- `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md` — voice rules
- Companion strategic report: [`market-reference-study-wenu-mapu.md`](market-reference-study-wenu-mapu.md)
