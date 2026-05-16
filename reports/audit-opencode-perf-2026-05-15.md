# Performance & Asset Hygiene Audit — 2026-05-15

**Project:** Wenu Mapu (Astro 6.2.1 SSG)  
**Branch:** `redesign-v2`  
**Auditor:** opencode/big-pickle  

---

## P0 — Critical

### P0.1 `public/aftercare/` — 4 oversized PNGs (>800KB), no WebP/AVIF

| File | Size | Could be |
|---|---|---|
| `public/aftercare/wm-img-2.png` | **4,703,129** (4.5 MB) | ~200 KB WebP |
| `public/aftercare/wm-img-4.png` | **2,553,350** (2.4 MB) | ~120 KB WebP |
| `public/aftercare/wm-img-3.png` | **2,301,925** (2.2 MB) | ~110 KB WebP |
| `public/aftercare/wm-img-1.png` | **1,132,117** (1.1 MB) | ~60 KB WebP |
| Total bloat | **10,690,521** (10.2 MB) | ~490 KB if converted |

These are CSS `background-image` assets in `public/aftercare/index.html` (a standalone HTML page served from `/aftercare/`). Referenced as:
- `wm-img-2.png` → `.wm-bg-materials` background (line 93)
- `wm-img-3.png` → `.wm-bg-wheel` background (line 97)
- `wm-img-4.png` → `.wm-bg-cta` background (line 101)
- `wm-img-1.png` → `<video>` poster + OG image (lines 17, 27, 611)

**Fix:** Run `node scripts/clean-images.mjs` after expanding its `ROOT` to include `public/aftercare/`, or run `sharp` pipeline manually. Each PNG is behind a dark gradient overlay so quality loss from WebP is invisible.

### P0.2 Scripts pipeline does not cover `public/aftercare/` or `public/logos/`

`scripts/clean-images.mjs:12` — `const ROOT = path.resolve('public/img')` — hardcoded to only scan `public/img/`. Same for `scripts/gen-avif.mjs:10`.

The `aftercare` directory has its own standalone HTML page and is deployed via Astro's `public/` passthrough. These assets hit production unoptimized.

**Fix:** Either expand the scripts to accept multiple roots, or run them per-directory.

### P0.3 `src/pages/p/[slug].astro:142` — LCP image missing `loading` + w/h attributes

```html
<img src={mainImg.src} alt={mainImg.alt || product.name}
     style="width:100%;height:100%;object-fit:cover;" />
```

- **No `loading` attribute** — defaults to `loading="lazy"` in modern browsers, which **delays the LCP candidate**.
- **No `width`/`height`** — CSS `width:100%;height:100%` does not reserve layout space; browser computes aspect ratio from actual loaded pixels → CLS.
- This is the primary image on every product detail page — the LCP element.

**Fix:**
```html
<img src={mainImg.src} alt={mainImg.alt || product.name}
     width={mainImg.width} height={mainImg.height}
     loading="eager" fetchpriority="high"
     style="width:100%;height:100%;object-fit:cover;" />
```

### P0.4 `src/pages/sets.astro:9` — `preloadImage` passed as string, interface expects object

```astro
<Base preloadImage="/img/hero/sets-hero.webp" ...>
```

`Base.astro:24` defines `preloadImage?: { avif?: string; webp?: string; alt?: string } | null`. Passing a string violates the type — the template checks `preloadImage?.avif` (line 88) which will be undefined on a string. The preload link **will not be emitted**.

**Fix:**
```astro
preloadImage={{ webp: '/img/hero/sets-hero.webp', alt: '...' }}
```

---

## P1 — Important

### P1.1 13 of 14 `<img>` tags lack explicit `width` and `height`

Explicit dimensions are required for the browser to reserve layout space before the image loads (aspect-ratio reservation). CSS-only sizing causes CLS.

| # | File | Line | Missing | Notes |
|---|---|---|---|---|
| 1 | `src/components/Logo.astro` | 16 | `width` | Has `height` prop; missing `width` |
| 2 | `src/pages/p/[slug].astro` | 142 | w/h + loading | **LCP candidate** — see P0.3 |
| 3 | `src/pages/p/[slug].astro` | 169 | w/h | Gallery thumbs; has `loading="lazy"` |
| 4 | `src/pages/collection/index.astro` | 68 | w/h | Category collection page |
| 5 | `src/pages/index.astro` | 187 | w/h | Truckee showcase (`loading="lazy"`) |
| 6 | `src/pages/index.astro` | 211 | w/h | Commissions teaser (`loading="lazy"`) |
| 7 | `src/pages/material/index.astro` | 88 | w/h | Material cards |
| 8 | `src/pages/custom-orders.astro` | 28 | w/h | Hero image (eager-loaded — **LCP risk**) |
| 9 | `src/components/ProductCard.astro` | 33 | w/h | Archive mode card |
| 10 | `src/components/ProductCard.astro` | 67 | w/h | Product card mode |
| 11 | `src/components/CategoryStrip.astro` | 28 | w/h | Category tiles with `<picture>` |
| 12 | `src/components/SearchModal.astro` | 111 | w/h | Dynamic JS template literal |

**Only compliant image:** `src/pages/index.astro:107-117` — hero portrait (width=1200, height=1500, eager, fetchpriority=high).

**Fix strategy:**
- **Static assets** (`Logo`, `CategoryStrip`, `custom-orders` hero, `Truckee showcase`): hardcode `width`/`height` matching the image's native dimensions.
- **Dynamic WC images** (`ProductCard`, `[slug]`, `collection`, `material`, `SearchModal`): WooCommerce API returns `images[].width` and `images[].height`. Read them from the product object.
- For `SearchModal` dynamic HTML: use inline `style="aspect-ratio: X/Y"` as fallback.

### P1.2 No font preload — renders delayed despite `font-display:swap`

Three font families loaded via `@fontsource` at `src/styles/global.css:7-12`:

| Font | Import | Weights |
|---|---|---|
| DM Serif Display | `@fontsource/dm-serif-display/400.css` | 400 |
| Source Serif Pro | `@fontsource/source-serif-pro/{300,400,600,400-italic}.css` | 3 weights + italic |
| Inter Variable | `@fontsource-variable/inter/index.css` | variable 100–900 |

Astro bundles these into `dist/_astro/Base.*.css` (~81 KB). Since Astro content-hashes the filenames (`Base.DaJxzb8_.css`), static `<link rel="preload">` paths cannot be hardcoded. The browser must download + parse the CSS before discovering `@font-face` blocks.

**Fix:** Use an Astro integration or build plugin to extract woff2 paths from the compiled CSS and inject preload links. Alternatively, inline the critical `@font-face` declarations for DM Serif Display (the hero font) and preload its woff2.

### P1.3 `src/pages/custom-orders.astro:28` — eager-loaded hero missing dimensions

```html
<img src="/img/products/ritual-ring-950.webp" alt="" loading="eager" decoding="async" />
```

This is an LCP candidate (eager-loaded, above fold on its page) but has no `width`/`height`. **Will cause CLS.** Native dimensions: 950×950.

---

## P2 — Low Priority

### P2.1 4 raw images in `public/img/` missing WebP/AVIF companions

| File | Size | Missing |
|---|---|---|
| `public/img/products/hanger-ammonite-bronze.jpg` | 83,328 | WebP + AVIF |
| `public/img/categories/hangers.png` | 29,133 | WebP + AVIF |
| `public/img/categories/piercing.png` | 17,003 | WebP + AVIF |
| `public/img/categories/ritual-pieces.png` | 63,310 | WebP + AVIF |

All under 800 KB so `clean-images.mjs` skips conversion (line 43: `before > 800 * 1024`). But `CategoryStrip.astro:28` has a `<picture>` element with AVIF source detection — these PNGs are served as-is without AVIF alternatives. At 100–200 KB aggregate it is minor, but inconsistent with the rest of the catalog.

**Fix:** Lower the threshold or convert manually (e.g., `npx sharp-cli -i input.png -o output.avif`).

### P2.2 `public/logos/` — 3 PNGs not converted to WebP

| File | Size |
|---|---|
| `public/logos/wenu-mapu-logo-white.png` | 304,127 |
| `public/logos/wenu-mapu-logo.png` | 280,628 |
| `public/logos/wenu-mapu-square.png` | 29,992 |

Under 800 KB. Logos are typically small, but WebP would save ~70%. Not urgent since these are referenced only from `<link rel="icon">` and OG tags, not `<img>`.

### P2.3 `dist/aftercare/` — oversized output (~12.7 MB)

Existing build output:
```
dist/aftercare/wm-img-2.png   4.5 MB
dist/aftercare/wm-img-4.png   2.4 MB
dist/aftercare/wm-img-3.png   2.2 MB
dist/aftercare/wm-header.mp4  2.2 MB
dist/aftercare/wm-img-1.png   1.1 MB
dist/aftercare/wm-logo.png    295 KB
```

Total: ~12.7 MB from 5 PNG + 1 MP4. These inflate Cloudflare Pages deploy bundles. Fixing P0.1 reduces the PNG portion by ~90%.

### P2.4 `decoding="async"` on LCP hero image

`src/pages/index.astro:113` — hero portrait has `decoding="async"`. This is safe (non-blocking decode) but may delay LCP by ~1 frame. The current LCP score is likely good given preload + eager + explicit dimensions, but worth removing `decoding="async"` if LCP is borderline.

### P2.5 `public/aftercare/index.html` loads external Google Fonts

```html
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:...');
```

This standalone page bypasses the @fontsource pipeline and loads from Google Fonts CDN — an extra DNS lookup and ~50 KB CSS+font download. The main site uses self-hosted fonts; aftercare should too for consistency.

---

## Summary

| Priority | Count | Key action |
|---|---|---|
| **P0** | 4 | Convert 4 aftercare PNGs to WebP; expand scripts to cover aftercare; fix LCP image on product detail page; fix sets.astro preloadImage type bug |
| **P1** | 3 | Add w/h to 13 image tags; add font preload pipeline; fix custom-orders LCP hero |
| **P2** | 5 | Convert 4 raw img assets to WebP/AVIF; convert 3 logos; note dist bloat; remove decoding=async on LCP; fix aftercare Google Fonts |

**Estimated bandwidth savings from fixing P0.1 only:** ~9.7 MB on first /aftercare/ page load.
