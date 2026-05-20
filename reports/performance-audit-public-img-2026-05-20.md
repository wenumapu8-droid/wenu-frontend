# Performance Audit — public/img

Generated: 2026-05-20

Scope: read-only audit of `public/img/`, project-large files, and current `dist/` output. No code, image, aftercare, git, secret, DNS, production, or WooCommerce write actions were performed.

## Summary

- `public/img/` total: 7.6 MB.
- `dist/` total: 18 MB.
- Largest built folders: `dist/img/` 9.2 MB, `dist/aftercare/` 3.8 MB, `dist/p/` 1.6 MB, `dist/_astro/` 1.0 MB.
- `public/img/` format mix: 49 WebP, 49 AVIF, 5 SVG, 3 PNG, 1 JPG, 1 README.
- No `public/img/` file is above 800 KB. This confirms the prior optimization pass is still holding.

## Largest `public/img` Files

| Size | File |
| ---: | --- |
| 304 KB | `public/img/brand/obsidian-cardinal-textile.webp` |
| 248 KB | `public/img/brand/obsidian-cardinal-textile.avif` |
| 232 KB | `public/img/lifestyle/editorial-model-labret-earweights.webp` |
| 196 KB | `public/img/brand/symbol-divider.webp` |
| 180 KB | `public/img/brand/ritual-space-cosmos.webp` |
| 176 KB | `public/img/lifestyle/editorial-model-labret-earweights.avif` |
| 172 KB | `public/img/brand/symbol-divider.avif` |
| 156 KB | `public/img/lifestyle/rings-spiral-tribal-hands.webp` |
| 156 KB | `public/img/brand/wenu-portal-eclipse-mark.webp` |
| 148 KB | `public/img/lifestyle/rings-classic-bands-hands.webp` |

## Remaining Raster Originals

These are the only JPG/PNG files under `public/img/`:

- `public/img/products/hanger-ammonite-bronze.jpg` — 80 KB
- `public/img/categories/piercing.png` — 17 KB
- `public/img/categories/hangers.png` — 28 KB
- `public/img/categories/ritual-pieces.png` — 62 KB

None are urgent by size. If the visual system wants strict WebP/AVIF-only delivery, convert these four in a later scoped image pass.

## Notes

- `dist/aftercare/` is 3.8 MB but aftercare is protected by `DO_NOT_TOUCH.md`; do not optimize or rewrite it without an explicit aftercare task.
- A naive unused-asset check produced too many false positives because image references can be generated through data, docs, or build-time paths. Treat unused detection as a separate task with an AST/build-manifest aware script before deleting anything.
- The current performance risk is not bulk image size. The useful next pass is targeted: confirm which `public/img/brand` and `public/img/lifestyle` assets are actually referenced by current pages, then mark source-only candidates in the asset library rather than deleting files.

## Result

RESULT: success

WHAT CHANGED:
- Added this read-only audit report.
- No app code, images, aftercare files, secrets, git history, DNS, production, or WooCommerce data were changed.

WHAT WAS VERIFIED:
- `public/img/` size and format mix.
- `dist/` total size and largest built folders.
- Largest image files over 100 KB.
- Remaining JPG/PNG files under `public/img/`.

WHAT'S NEXT:
- Run a manifest-aware referenced-asset audit for `public/img/brand` and `public/img/lifestyle`, then update asset-board/brand-library decisions without deleting source files.
