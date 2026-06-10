# Codex visual queue loop — next mechanical cleanup pass — 2026-05-25

Scope: local-only operations report for the next mechanical cleanup pass. No Woo writes, no Noco writes, no source edits, no deploy, no deletes, no product-image generation.

Verification date for this pass: 2026-05-26 PDT.

## Inputs used

- `reports/codex-visual-queue-loop-2026-05-25.md` (previous pass)
- `reports/identity-pass-2026-05-25.md`
- `reports/supervised-agent-loops-safe-2026-05-25.md`
- `reports/claude-visual-audit-loop-2026-05-25.md`
- `reports/final-publish-readiness-2026-05-25.md`
- `reports/visual-queue-next-actions-2026-05-20.md`
- `scripts/audit-catalog.mjs`
- direct local checks on 2026-05-26:
  - `node -v` -> `v24.14.1`
  - `node scripts/verify-build.mjs` -> `OK: 11 product pages built`
  - `node scripts/audit-catalog.mjs --soft` -> `crashed: fetch failed`
  - `/tmp/noco.db` -> present
  - `~/Obsidian/WenuAgent/brand/04-photography/product-macro/final` -> present
  - `src/pages/index.astro` -> featured allow-list still hard-curated to 4 slugs

## Executive read

- The next mechanical cleanup pass should stay narrow and trust-first.
- The current home/category promo pool should remain very small and anchored in products already curated into the homepage or in READY items with real reference coverage.
- Several products should remain excluded from hero/featured until catalog trust debt is reduced. The blockers are not only visual quality; they also include orphan SKUs, category mismatch, price drift, sold-out drift, and weak naming/category semantics.
- The biggest operational weakness is still the audit loop. `verify-build` is usable as a smoke check, but `audit-catalog` is not a dependable local gate right now because it always depends on a live Woo fetch even in `--soft` mode.

## Featured-safe products for home and category promos

Use a very small first pool for the next mechanical cleanup pass.

### Current safest home-featured pool

These remain the strongest candidates to keep in home/category promo consideration because they are explicitly curated in the current homepage allow-list and avoid obvious category noise:

- `drop-con-amatista-2` — Teardrop Amethyst
- `carved-ethnic-ring` — Carved Ethnic Ring
- `gold-titanium-marquise-onyx-piercing` — Gold Titanium Marquise Piercing with Onyx Stone
- `ornamental-wood-ear-weights` — Ornamental Wood Ear Weights

Why this pool remains safest:

- already curated directly in `src/pages/index.astro`
- featured logic filters out placeholder/AI image patterns before selection
- featured logic also avoids `UNCATEGORIZED` leakage
- this set reads like statement merchandise rather than filler catalog support

### Secondary safe support pool for category promos

Keep these as category-promo candidates, not home-hero leaders:

- `WM-EAR-001` — Ethnic Shipibo Hoop Earrings (Gold & Silver)
- `WM-HAN-005` — Ornamental Bronze Snake Weights
- `WM-HAN-007` — Sanskrit Mantra Hanger with Secret Compartment
- `WM-HAN-009` — Magnetic Greek Hoop Hanger
- `WM-HAN-010` — Ornate Magnetic Hoop Hanger (small thick)
- `WM-HAN-017` — Spiral Pendulum Hangers (silver, 12mm)
- `WM-HAN-022` — Crown Spine Hangers (10mm)
- `WM-HAN-024` — Buddha Head Magnetic Hangers
- `WM-HAN-025` — Geometric Twist Magnetic Hangers
- `WM-SAD-009` — Ammonite Wood Teardrop Plug 20mm Pair (Brass Inlay)
- `WM-PLG-017` — Black Surgical Steel Wave Pattern Plug 16mm Pair
- `WM-PLG-030` — Tiger Eye Stone Plug 20mm Pair
- `WM-TUN-008` — Solar Light Weight Tunnel - Flower of Life 14mm
- `WM-TUN-009` — Solar Light Weight Tunnel - Cross Lattice 22mm
- `WM-TUN-010` — Solar Light Weight Tunnel - Dreamcatcher Dome 25mm

Why this pool is safer than the rest of READY:

- all are already in the `READY missing Woo URL` queue
- all were previously identified as having real reference support
- this set fits the established promo order: Plug, Hanger, Piercing, Tunnel, Earring
- they are stronger for category storytelling than generic titanium basics or tiny utility SKUs

### Category lanes that remain safest

1. Hanger
2. Plug
3. Piercing
4. Tunnel
5. Earring

This still matches the strongest current real-reference-led visual authority.

## Products that should stay excluded from hero / featured

### Hard hold until trust blockers are cleared

- `WM-CARE-001`
- `WM-SEP-008`
- `WM-SEP-001`
- `WM-HAN-028`
- `WM-TUN-017`
- `WM-SEP-002`

Reason:

- these intersect directly with current trust/reporting problems:
  - orphaned from NocoDB
  - category mismatch
  - SOLD OUT vs published drift
  - price drift
  - missing curated-photo support
- even if some become visually usable later, they should not lead trust-sensitive surfaces while their catalog state is still broken

### Hold because they are commodity-coded or too small to carry premium hero weight

- `WM-EAR-004` — Tiny Silver Star Stud Earrings
- `WM-TUN-015` — Implant Grade Titanium Tunnel 10mm
- `WM-TUN-016` — Implant Grade Titanium Tunnel 14mm
- `WM-PRC-014` — Marquise Red CZ Labret Top — Titanium 16G
- `WM-PRC-016` — Marquise Green CZ Labret Top — Titanium 16G
- `WM-PRC-020` — Bezel-Set Blue Cabochon Labret Top — Titanium 16G
- `WM-PRC-021` — Snowflake Labret Top with Central CZ — Titanium 16G

Reason:

- technically valid catalog items, but weak as premium-first-screen carriers
- better suited to close-crop support, specs, or PDP detail usage than to hero/promo leadership
- promoting too many of these early pulls the brand toward standard ecommerce

### Hold because they are weaker backlog or detail-system pieces

- `WM-TUN-001` — Wood Tunnels (Red, Black & Brown)
- `WM-TUN-022` — Purple Marbled Resin Tunnel 10mm Pair
- `WM-PLG-006` — Implant Grade Titanium Plug 6mm
- `WM-HAN-029` — Golden Stainless Steel Geometric Triangular Hanger 6mm

Reason:

- viable later in category support or technical-sheet work
- weaker than the current safe pool as home/category anchors
- visually usable, but not strong enough to justify first-screen prominence while stronger hanger/plug candidates already exist

## audit-catalog warnings/errors that block trust or catalog clarity

### Confirmed hard blockers from current reporting

1. `WM-CARE-001`
   - category mismatch: expected `accessories`, actual `[Sin categorizar]`
   - SKU not found in NocoDB
2. `WM-SEP-008`
   - SKU not found in NocoDB
3. SKU linkage debt remains structurally high in the local gap reporting
   - `wooWithoutSkuInName = 24`
   - `wooNotLinkedToNoco = 30`

### Medium blockers still reducing catalog trust

1. Confirmed price drift between Woo and Noco
   - `WM-HAN-028`: WC `80` vs Noco `50`
   - `WM-TUN-017`: WC `28` vs Noco `40`
   - `WM-SEP-002`: WC `45` vs Noco `30`

2. Published products missing curated-photo support in current reporting
   - `WM-CARE-001`
   - `WM-RNG-003`
   - `WM-HAN-028`
   - `WM-TUN-017`
   - `WM-PRC-006`
   - `WM-SEP-001`
   - `WM-HAN-026`
   - `WM-HAN-029`
   - `WM-SEP-002`
   - `WM-SEP-008`

3. Weak or generic published naming still reduces clarity
   - `Septum Ring | WM-SEP-001`
   - `Stone Plug 10mm | WM-PLG-010`
   - `Curated Stone Plug 10mm | WM-PLG-004`
   - `Stone Plug 10mm Detail | WM-PLG-004`
   - `Steel Labret 10mm | WM-LAB-003`
   - `Steel Labret 10mm | WM-LAB-002`
   - `Steel Labret 10mm | WM-LAB-001`

4. Published category framing still weakens brand clarity
   - `three-dot-titanium-piercing` still reads under `Ear Jewelry`
   - `gold-titanium-marquise-onyx-piercing` still reads under `Ear Jewelry`
   - several stronger statement pieces still sit inside generic or mixed category semantics instead of a tighter piercing/ritual structure

### Practical rule for the next cleanup pass

Do not expand promo/home candidates until these are handled in this order:

1. orphaned and mismatched SKUs
2. weak/generated published names
3. price drift
4. curated-photo gaps on already-published SKUs
5. only after that, broader promo curation

## Dependency and script friction that can break repeatable preview-build-audit runs

### 1. `audit-catalog` still depends on live Woo fetch and is failing locally

Observed locally today:

- `node scripts/audit-catalog.mjs --soft` -> `crashed: fetch failed`

Why it matters:

- the script always calls `fetchWcProducts()`
- it requires valid Woo credentials plus live API reachability
- it can fail before the Noco cross-check becomes useful, even when `/tmp/noco.db` and the curated macro directory are present
- the next mechanical pass cannot treat audit output as a stable local gate

### 2. `postbuild` still chains verify + audit, but only one half is dependable

Current scripts:

- `build` -> `astro build`
- `postbuild` -> `node scripts/verify-build.mjs && node scripts/audit-catalog.mjs --soft`

Why it matters:

- `verify-build` currently passes
- the audit half still crashes
- so "build finished" is not the same as "mechanical cleanup validated"
- this reduces confidence in unattended or repeatable preview-build-audit loops

### 3. `verify-build` is still catalog-sensitive rather than a trust gate

Observed locally today:

- `node scripts/verify-build.mjs` -> `OK: 11 product pages built`

Why it matters:

- useful smoke check
- only validates one layer of storefront output
- the site can still be green on built product count while catalog trust issues remain unresolved
- useful for supervised local work, but not sufficient as a release-quality cleanup gate

### 4. The audit depends on side inputs that are local but external to the repo

Confirmed locally today:

- `/tmp/noco.db` present
- `~/Obsidian/WenuAgent/brand/04-photography/product-macro/final` present

Why it matters:

- the loop is not repo-self-contained
- a future run on the same repo can fail or silently downgrade if any of those inputs disappear or go stale
- safe for supervised local work, weak for "repeatable by default" operations

### 5. Local environment is good enough for report work, but not hardened enough for unattended validation

Observed locally today:

- `node -v` -> `v24.14.1`

Why it matters:

- runtime is correct for this repo right now
- the fragile point is not Node version today; it is the network/env dependency inside the audit path

## Next mechanical pass — recommended execution order

1. Keep home/category promo candidates limited to the current featured-safe pool plus the secondary READY support pool listed above.
2. Continue excluding orphaned, mismatched, price-drifted, and weak-asset SKUs from hero/featured.
3. Use the hard/medium blockers above as the trust queue before any broader visual promotion decisions.
4. Treat `verify-build` as a smoke check only.
5. Treat `audit-catalog` as advisory until its Woo fetch dependency is made reliable enough for repeatable local runs.

## Result

RESULT: success

WHAT CHANGED:
- Replaced this report with a current local operations brief for the next mechanical cleanup pass.

WHAT WAS VERIFIED:
- Node runtime is correct for this repo (`v24.14.1`).
- Local Noco snapshot and curated macro-photo directory are present.
- `verify-build` still passes.
- `audit-catalog --soft` still fails on Woo fetch.
- The current homepage featured allow-list still favors four strong public-facing products and should remain narrow.

WHAT'S NEXT:
- Run the next supervised mechanical cleanup pass against trust blockers first, keeping visual promotion constrained to the safe pools in this report and treating audit instability as an operational caveat rather than a release signal.
