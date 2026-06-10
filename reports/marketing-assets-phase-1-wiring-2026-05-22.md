# Marketing Assets Phase 1 Wiring - 2026-05-22

## Result

Success. First marketing-folder rescue pass is wired into the site without generating new imagery.

## What Changed

- Added optimized marketing-derived assets:
  - `public/img/categories/ear-cuffs.webp` + `.avif`
  - `public/img/materials/walnut-wood.webp` + `.avif`
  - `public/img/materials/14k-gold-hanger.webp` + `.avif`
  - `public/img/brand/about-archive.webp` + `.avif`
  - `public/img/brand/wenu-fondo-cosmos.webp` + `.avif`
- Updated page image references:
  - `src/pages/ear-cuffs.astro`
  - `src/pages/material/index.astro`
  - `src/pages/material/walnut-wood.astro`
  - `src/pages/material/14k-gold.astro`
  - `src/pages/about.astro`
- Regenerated:
  - `docs/asset-inventory.md`
  - `docs/asset-board.html`

## Verified

- `npm run assets:inventory` -> `site_assets=114`
- `npm run assets:board` -> `assets=325`
- `nvm use && npm run build` -> green
- Build output: 80 pages
- Postbuild: `[verify-build] OK: 33 product pages built`

## Notes

- No logo replacement.
- No AI-generated product imagery.
- No aftercare, `.env`, WooCommerce write, DNS, deploy, commit, or push.
- `brass-bronze` currently uses the warm metal hanger candidate until a more exact bronze/brass marketing source is approved.

## Next

Review these five assets visually in `docs/asset-board.html`, then continue with category/collection surfaces from the same marketing archive.
