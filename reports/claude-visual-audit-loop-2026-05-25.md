# Claude visual polish — Wave 1 identity pass — 2026-05-25 (loop refresh)

Local-only re-audit of `/`, `/shop`, `/about`, `/stockists`, `/p/[slug]` after the Wave 1 identity pass. Source last re-read from `redesign-v2` working tree. No edits, no deploys, no external writes.

## WHAT IMPROVED

- **Featured rail is curation, not Woo drift.** `index.astro:14–52` filters placeholder image patterns, drops `UNCATEGORIZED`, prefers a 4-slug allow-list, locks the rail to four cells, and routes badges through `deriveBadge`. The home no longer leaks raw catalogue noise.
- **Editorial band carries a real tier-1 macro.** `index.astro:196–219` runs Witral Vilu (`wm-han-001`) at 1600/2400/3200w with caption restrained to a single eyebrow line.
- **PDP separates hero-worthy from support SKUs.** `p/[slug].astro:32–33` gates `RitualHeader` + `RitualProductHero` behind `isSupportProduct` (`wm-care`, `aftercare|saline`, `uncategorized`). Saline spray no longer inherits the museum register.
- **Shop reframes as archive.** `shop.astro:101–106` introduces `CURATED ARCHIVE — Released pieces only.` and `Brass & bronze` (line 180) was rewritten away from "tribal roots."
- **Stockists is now Presence.** `stockists.astro:48–77` re-eyebrows as `PRESENCE · IN PERSON`, lists workshop / popup / pickup / travel, and closes with `Wholesale is not open right now.` Posture is finally legible.
- **About reads as atelier note.** `about.astro:23–95` paces `01 · Story / 02 · Materials / 03 · Artistry / 04 · Presence` — editorial, not corporate.

## WHAT STILL FEELS PROVISIONAL

1. **Commissions teaser is the weakest visual below-the-fold.** `index.astro:271–274` still serves `/img/products/ritual-ring-950.{avif,webp}` at 950². Sitting directly below the 2400px Witral Vilu band, the fidelity drop reads as tier mismatch.
2. **PDP duplicates the hero image for premium SKUs.** When `shouldUseRitualHero` is true, `RitualProductHero` renders `mainImg`, then `p/[slug].astro:164–169` repeats the same `mainImg` at 4/5 inside the asym grid. Double-take, not deepening.
3. **Shop band → filter bar is still abrupt.** `shop.astro:88–123` goes hero band → archive note → filter bar → grid with no editorial 3-up to slow the eye before it hits the matrix.
4. **Material tiles remain text-only.** `shop.astro:151–181` — six tiles, all type, in the block meant to be the catalogue's strongest narrative anchor. Reads as definition list.
5. **About `#artistry` and `#materials` still carry zero figures.** `about.astro:43–76`. Only Story has a figure. The two blocks that *promise craft* are pure text.
6. **Proof beat is still a flat bullet list.** `index.astro:153–158`. Honest, but visually undersold for the register the hero opens with. The `39°19′N · 120°11′W` coord at `index.astro:113` is also one weight too light to register as a real "place" cue.
7. **Stockists `kind` labels are unstyled inline text.** `stockists.astro:59` renders `workshop / popup / pickup / travel` as plain metadata, not as taxonomy badges. `/img/truckee/showcase.*` is wired only as OG (`stockists.astro:45`), not rendered on-page.
8. **`Photography in progress` PDP fallback risks frequency.** `p/[slug].astro:170–188` — the empty state is well-designed, but if more than ~5 released SKUs land there the catalogue reads understocked.

## TOP 5 FIXES (next, highest-impact)

1. **Kill the PDP image duplication when `shouldUseRitualHero` is true.** Skip or shrink the in-grid `mainImg` block at `p/[slug].astro:164–169` — start the left column at the gallery thumbnails. Smallest surface, largest premium-consistency win — applies to every tier-1 SKU.
2. **Replace or verify `ritual-ring-950`.** Weakest visual on home below the fold. Swap for a verified tier-1 macro already on disk (`editorial-desert-guardian`, `wm-oth-001`) or drop the figure entirely and lean on copy + CTA.
3. **Wire `artistry-workbench` into `/about #artistry`.** One existing real asset converts a text-only block into craft proof — smallest content delta, largest credibility gain on About.
4. **Insert a 3-up editorial row between the shop hero band and the filter bar.** Three verified macros (Witral Vilu + two others), eyebrow captions, no prices. Reframes shop as "archive first," not "grid first."
5. **Style the four `.stockists-list__kind` labels as ritual-mark badges and render `/img/truckee/showcase.*` as a page-top strip on `/stockists`.** Tiny CSS surface, big editorial-register lift on a page whose only job is communicating posture.

## FILE-BY-FILE NEXT STEPS

### `src/pages/index.astro`
- Audit `/img/products/ritual-ring-950.{avif,webp}` provenance before any further publish; swap to `/img/hero/*` or `/img/brand/*` if non-tier-1.
- Promote `39°19′N · 120°11′W` (line 113) one weight up — currently dissolves beside the eyebrow.
- Trade bullets in `proof__list` (lines 153–158) for hairline-separated phrases to lift register without losing facts.

### `src/pages/shop.astro`
- Add a `shop-editorial-row` between `</picture>` (line 99) and `.shop-archive-note` (line 101). Three real macros, one-line eyebrow caption per cell, no prices.
- Bring at least one figure into 3 material tiles (titanium, vacamuerta, walnut). Even 220×220 lifts the block out of definition-list register.
- Consider promoting 1–2 ritual-prefix tabs (`KÜRÜF · KUYÉN · ANTÜ`) to the front of the filter bar so the prefix system reads as primary taxonomy, not decoration.

### `src/pages/p/[slug].astro`
- Resolve hero/grid duplication: when `shouldUseRitualHero` is true, replace the in-grid `mainImg` block (lines 164–169) with the gallery only.
- Grep which released SKUs hit the `Photography in progress` branch (lines 170–188); cap allowed fallback count before tuning density.
- Confirm `RelatedPieces` (line 276) never pulls `isSupportProduct` SKUs into a premium PDP's related row.

### `src/pages/about.astro`
- Add a figure to `#artistry` using `/img/brand/artistry-workbench.*` (already on disk).
- Add a one-line caption under the story figure ("Truckee · 2024" or similar) — atelier credibility in a single line.
- Add a third macro inside `#materials` (stock-shelf or flatlay) to convert that block from list to inventory.

### `src/pages/stockists.astro`
- Style `.stockists-list__kind` pills as small ritual-mark badges (uppercase tracking + bronze hairline border).
- Render `/img/truckee/showcase.*` as a hero strip at the top of the route — wired as OG but invisible on-page.

## BEST REAL ASSETS TO PROMOTE NEXT

Verified, on-disk, tier-1:

- `/img/hero/wm-han-001-*` — Witral Vilu. Already on home editorial band. **Promote** into the shop 3-up and as one of the 3 reference PDPs.
- `/img/brand/artistry-workbench.*` — currently unused. **Promote** into `/about #artistry`.
- `/img/brand/editorial-desert-guardian.*` — currently unused. Strong candidate to replace `ritual-ring-950` or anchor a shop 3-up cell.
- `/img/brand/shop-ritual-septum-hero.*` — already correctly placed as `/shop` band + OG.
- `/img/truckee/showcase.*` — already on home Truckee block; **also promote** as `/stockists` page hero.
- `/img/hero/wm-oth-001-*` — unused tier-1 macro; viable for the shop 3-up or commissions teaser swap.

Defer until verified: `/img/products/ritual-ring-950.*` — filesize and naming suggest non-tier-1 provenance.

## SAFE NEXT ACTIONS

All local-only, reversible, no external writes:

1. Inspect `ritual-ring-950` provenance (asset inventory, raw sibling, mtime) before any home edit.
2. Grep which released SKUs currently trigger `isSupportProduct` and which fall to `Photography in progress`.
3. Pin 3 reference PDP slugs (hanger / titanium / amulet) in a follow-up note and tune `RitualProductHero` against those only.
4. Open a focused local branch for the PDP image-duplication fix — smallest surface, highest premium-consistency win.
5. Open a parallel focused local branch for the `commissions-teaser` asset swap once provenance is settled.

No deploys, no commits, no WC / Noco / WordPress / `.env` writes. Product imagery generation remains deferred.
