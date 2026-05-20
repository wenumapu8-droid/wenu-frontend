# Asset Reference Audit — Brand + Lifestyle

Generated: 2026-05-20

Scope: reference audit for `public/img/brand/` and `public/img/lifestyle/`. No images, code, aftercare files, secrets, git, DNS, production, or WooCommerce data were changed.

## Summary

- `public/img/brand/`: 23 files total: 11 WebP, 11 AVIF, 1 SVG.
- `public/img/lifestyle/`: 48 files total: 24 WebP, 24 AVIF.
- Docs/reference scan: all brand and lifestyle files are referenced somewhere in repo documentation or asset inventories.
- Active code/public scan: only selected brand assets are used by site code today; lifestyle assets are source-ready but not wired into pages yet.

## Active Code References

Brand assets referenced from `src/` or public root:

- `public/img/brand/artistry-workbench.avif`
- `public/img/brand/artistry-workbench.webp`
- `public/img/brand/meteorite-banner.webp`
- `public/img/brand/meteorite-collection.webp`
- `public/img/brand/meteorite-final.webp`
- `public/img/brand/shop-ritual-septum-hero.avif`
- `public/img/brand/shop-ritual-septum-hero.webp`
- `public/img/brand/wenu-mapu-mark.svg`

Lifestyle assets referenced from active code/public root:

- None found.

## Source-Only Candidates

These are not deletion candidates. They are candidates for asset-board classification, future page wiring, or source-only retention.

Brand source-only in the active code scan:

- `editorial-desert-guardian` AVIF/WebP
- `meteorite-banner.avif`
- `meteorite-collection.avif`
- `meteorite-final.avif`
- `obsidian-cardinal-textile` AVIF/WebP
- `obsidian-textile-texture` AVIF/WebP
- `ritual-space-cosmos` AVIF/WebP
- `symbol-divider` AVIF/WebP
- `wenu-portal-eclipse-mark` AVIF/WebP

Lifestyle source-only in the active code scan:

- All 24 lifestyle image pairs under `public/img/lifestyle/`.

## Notes

- Current pages use brand images mainly in `artistry.astro`, `shop.astro`, material/collection pages, journal OG images, and `journal/[slug].astro` schema logo.
- The lifestyle intake is ready as a visual library but is not yet connected to page templates.
- Do not delete any source-only assets. The next safe step is to tag role/status in the asset board or choose 3-5 lifestyle assets for a scoped page wiring task.

## Result

RESULT: success

WHAT CHANGED:
- Added this audit report.

WHAT WAS VERIFIED:
- File counts and formats for `public/img/brand/` and `public/img/lifestyle/`.
- References across docs and active code/public surfaces.
- Active code currently uses selected brand assets and no lifestyle assets.

WHAT'S NEXT:
- Pick a scoped visual wiring task, such as adding one approved lifestyle band to `/artistry` or `/shop`, or classify lifestyle assets in `docs/asset-board.html` without deleting files.
