# Aftercare readiness report

Date: 2026-05-09
Scope: `/aftercare/` only

## Verdict

AFTERCARE READY

## Local route verification

- `/aftercare/` returned `HTTP/1.1 200 OK`.
- Response size: `33,252` bytes.
- Served HTML matched `public/aftercare/index.html` exactly.
- The page did not fall back to the homepage.
- Confirmed aftercare-specific markers in the served HTML:
  - `<title>Aftercare - Wenu Mapu</title>`
  - `<body class="wm-page">`
  - `<h1>Ritual Aftercare</h1>`
  - video source `/aftercare/wm-header.mp4?v=540p`

## Video verification

- Active source in page: `/aftercare/wm-header.mp4?v=540p`
- Local asset: `public/aftercare/wm-header.mp4`
- Local HTTP request returned `HTTP/1.1 200 OK`.
- Content-Type: `video/mp4`
- Content-Length: `2,276,159` bytes, approximately `2.2 MB`.
- Downloaded response matched the local MP4 exactly.

## PDF verification

- PDF path: `/downloads/wenu-mapu-aftercare-guide.pdf`
- Local asset: `public/downloads/wenu-mapu-aftercare-guide.pdf`
- Local HTTP request returned `HTTP/1.1 200 OK`.
- Content-Type: `application/pdf`
- Content-Length: `82,031` bytes.
- Downloaded response matched the local PDF exactly.

## Visual system verification

`/aftercare/` uses its intended Wenu Mapu visual system rather than the Astro storefront layout:

- Wenu Mapu page title, canonical, Open Graph, and Twitter metadata.
- Wenu logo asset at `/aftercare/wm-logo.png`.
- Dedicated `.wm-page` visual system.
- Dark background, cream text, gold accent tokens:
  - `--wm-black`
  - `--wm-cream`
  - `--wm-gold`
  - `--wm-line`
- Ritual typography imports:
  - `Cinzel Decorative`
  - `Cormorant Garamond`
- Branded background assets:
  - `/aftercare/wm-img-1.png`
  - `/aftercare/wm-img-2.png`
  - `/aftercare/wm-img-3.png`
  - `/aftercare/wm-img-4.png`
  - `/aftercare/wm-header.mp4`

## Notes

- This report intentionally excludes WooCommerce, storefront forms, category routes, and full-site push readiness.
- Existing worktree note: `public/aftercare/index.html` was already modified before this report update and was treated as the current intended aftercare page.
