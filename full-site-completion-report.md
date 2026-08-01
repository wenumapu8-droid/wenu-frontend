# Wenu Mapu — Full-Site Completion Report

Date: 2026-05-09
Branch: `redesign-v2` (no commit performed; awaiting per-commit approval)
Build: green, Node 24.14.1
Plan source: `~/.claude/plans/you-are-working-on-linear-mango.md`

## Pages created

| Route | File | i18n keys added |
|---|---|---|
| `/amulets` | `src/pages/amulets.astro` | `landing.amulets` |
| `/ear-weights` | `src/pages/ear-weights.astro` | `landing.ear_weights` |
| `/ritual-objects` | `src/pages/ritual-objects.astro` | `landing.ritual_objects` |

Each new page mirrors the Phase 1 `piercing.astro` / `hangers.astro` pattern: hero (eyebrow + h1 + lede + PatternBand) → 2-paragraph copy block → primary + secondary CTAs → featured rail (up to 6 ProductCards) → CollectionPage + BreadcrumbList JSON-LD via `Base.astro`. No new components introduced. No new CSS classes. No new fonts. No new dependencies.

Filtering uses the same keyword-heuristic-on-category-slug approach Phase 1 used (per-page KEYWORDS array on `getProducts(50)` results, image-required). Deterministic slug-translation map is still tracked as Phase 1 blocker #5 — out of scope here.

OG images reused from existing assets: `public/img/categories/amulets.webp`, `ear-weights.webp`, `ritual-pieces.png`.

## Pages improved

| Route | File | Change |
|---|---|---|
| `/` (home) | `src/pages/index.astro` | One new `<p class="sacred__p sacred__links">` line at the end of the Sacred Territory copy block, with inline `text-accent` anchors to `/materials`, `/artistry`, `/care-guide`, `/stockists`. No structural change, no new section. |
| `/sizing-guide` | `src/pages/sizing-guide.astro` | Added two new data-driven tables (inner-diameter by zone, post/barbell length by zone) using existing `.sizing__table-wrap` / `.sizing__table` styles. Appended a four-CTA block (`/shop`, `/custom-orders`, `/care-guide`, `/contact`) using existing `.landing__cta` + `.btn` styles. |
| `/faq` | `src/pages/faq.astro` | Appended a closing "Still unanswered?" CTA block with three buttons (`/contact`, `/custom-orders`, `/shop`). Existing `FAQPage` JSON-LD untouched. |
| Footer | `src/components/Footer.astro` | One href change: support column shipping link points to canonical `/shipping` (was `/shipping-returns`). Both URLs continue to resolve. |

## Copy translated / written

All new copy is English-first, ritual / direct / refined / commercial register. No fake spiritual language, no boho language, no overpromising healing claims. Voice anchored to brand docs: `~/Obsidian/WenuAgent/brand/copy-frontend-2026-05-01.md`, `voz-de-marca-real-2026-05-03.md`, `BRAND-DNA-2026-05-03.md`.

New i18n keys (`src/i18n/en.json`):

- `landing.amulets` — eyebrow, title, intro, p1, p2, cta_primary, cta_secondary, shop_target
- `landing.ear_weights` — same shape
- `landing.ritual_objects` — same shape
- `sizing.diameter_table` — 8-row table data
- `sizing.post_table` — 8-row table data
- `sizing.cta_heading`, `sizing.cta_intro`, `sizing.cta_shop`, `sizing.cta_commission`, `sizing.cta_care`, `sizing.cta_contact`
- `faq.cta_heading`, `faq.cta_intro`, `faq.cta_contact`, `faq.cta_commission`, `faq.cta_shop`

## Components added

None. All new pages reuse `Base.astro`, `ProductCard.astro`, `PatternBand.astro`. All extended pages reuse existing classes from `global.css` (`.btn`, `.btn--solid`, `.btn--ghost`, `.landing__cta`, `.sizing__table-wrap`, `.sizing__table`, `.page-divider`, `.text-accent`, `.eyebrow`, `.page-title`, `.lede`, `.section--mega`, `.container`).

## Visual system changes

None. No tokens added, no new utility classes added, no design system changes. Purely additive HTML wired against existing styles.

## SEO changes

- 3 new pages with unique `<title>` (≤ 80 chars) and `meta description` per `Base.astro` props.
- 3 new `CollectionPage` JSON-LD blocks + 3 new `BreadcrumbList` JSON-LD blocks, one pair per new landing.
- 3 new sitemap entries: `https://wenumapuonline.com/amulets/`, `/ear-weights/`, `/ritual-objects/` (all with trailing slash, present in `dist/sitemap-0.xml`).
- One H1 per new page (verified).
- `og:image` set per page from existing `public/img/categories/` assets.
- `/sizing-guide` and `/faq` unchanged at SEO layer (no title/meta/JSON-LD edits).

## Build status

```
$ nvm use && npm run build
Now using node v24.14.1 (npm v11.11.0)
[woo] fetched 64 products
[build] 88 page(s) built in 37.19s
[build] Complete!
[verify-build] OK: 64 product pages built.
EXIT=0
```

3 pages added on top of Phase 1's 85 = 88 total. Product page count unchanged at 64. Postbuild assertion green.

## Verification snapshot

| Check | Result |
|---|---|
| `dist/{amulets,ear-weights,ritual-objects}/index.html` exist | OK |
| All 16 pre-existing critical routes still in `dist/` | OK |
| `dist/aftercare/index.html` + `public/aftercare/index.html` + `public/downloads/wenu-mapu-aftercare-guide.pdf` | OK, untouched |
| `ls dist/p \| wc -l` | 64 |
| `dist/search-index.json` entry count | 64 (unchanged) |
| `grep -rn "formspree.io/f/placeholder" src/ public/` | 0 matches |
| H1 count on each new landing | 1 each |
| `CollectionPage` JSON-LD on each new landing | present on each |
| Sitemap contains 3 new URLs | OK |
| Footer: 1 occurrence of `/shipping`, 0 of `/shipping-returns` | OK (canonical) |
| Home page: 1 occurrence each of `/materials`, `/artistry`, `/care-guide`, `/stockists` href | OK |
| Sizing-guide: diameter table + post table + "Still unsure?" CTA block rendered | OK |
| FAQ: "Still unanswered?" CTA block rendered | OK |

## Files touched

```
NEW    src/pages/amulets.astro
NEW    src/pages/ear-weights.astro
NEW    src/pages/ritual-objects.astro
EDIT   src/i18n/en.json                # +5 i18n blocks (3 landings + sizing extras + faq cta)
EDIT   src/components/Footer.astro     # 1 href fix
EDIT   src/pages/index.astro           # +1 inline link line in Sacred Territory
EDIT   src/pages/sizing-guide.astro    # +2 tables, +1 CTA block
EDIT   src/pages/faq.astro             # +1 CTA block
NEW    full-site-completion-report.md  # this report
```

Files explicitly NOT touched: `src/lib/woo.ts`, `src/components/Nav.astro`, `src/layouts/Base.astro`, `src/styles/{tokens,global}.css`, `astro.config.mjs`, `package.json`, any `.env*`, `public/aftercare/*`, `public/downloads/*`. No new components, no new layouts, no new style files.

## Remaining blockers (carried forward — none introduced by this work)

These are all pre-existing items already tracked in `full-site-phase1-report.md` §9 and `agent-control/TASK_QUEUE.md`. None are caused or worsened by this commit.

1. Real form provider not wired — newsletter + commissions still mailto. (P5 in TASK_QUEUE.md)
2. Cardinal SVGs and pattern band are placeholder geometry — real Mapuche textile assets still owed. (Phase 1 blocker #2)
3. Color tokens drift from approved spec. (Phase 1 blocker #3)
4. Buy CTA still routes to WC `/cart/` — no native cart on Astro side. (Phase 1 blocker #4)
5. Category landings (now including the 3 new ones) use keyword heuristic; deterministic slug-translation map still owed. (Phase 1 blocker #5)
6. WooCommerce slug hygiene (`producto-prueba`, etc.). (Phase 1 blocker #6)
7. Footer credit "Web design by Northbound" still placeholder. (Phase 1 blocker #9)
8. WC catalog count reconciliation. (P4.2, owned by `wenu-producto`)

## Required visual assets

None to ship this work. Placeholder banner image for `/ritual-objects` is `public/img/categories/ritual-pieces.png`; if the brand session produces a dedicated `ritual-objects.webp`, swap the `ogImage` prop in `src/pages/ritual-objects.astro` and add the file to `public/img/categories/`. No code change needed beyond that one prop.

## What still needs human approval

1. **Per-commit approval** to commit these changes to `redesign-v2` (per `agent-control/AGENT_CONTROL_CENTER.md`). No commit was performed.
2. No push, no remote add, no Pages deploy were performed and none are requested by this task.
3. No nav structural change was made — confirmed in plan as "leave as-is".
4. No `.env*` access, no Cloudflare/DNS/Tunnel actions, no WooCommerce writes, no Aftercare modifications.

## Suggested commit (single commit)

```
feat(site): add /amulets, /ear-weights, /ritual-objects landings; complete sizing-guide + faq; canonicalize footer shipping link

- Add 3 category landing pages (amulets, ear-weights, ritual-objects) following the Phase 1 piercing/hangers pattern, with CollectionPage + BreadcrumbList JSON-LD and shared landing layout.
- Add corresponding `landing.*` i18n blocks in en.json.
- Extend sizing-guide with inner-diameter and post-length tables plus a 4-CTA block.
- Add a closing "Still unanswered?" CTA block to /faq.
- Weave inline links to /materials, /artistry, /care-guide, /stockists into the home Sacred Territory section.
- Update footer support column to point to canonical /shipping (alias /shipping-returns still resolves).

Build: 88 pages, 64 products, postbuild OK. Aftercare untouched.
```
