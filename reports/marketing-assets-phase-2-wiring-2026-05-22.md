# Marketing Assets Phase 2 Wiring - 2026-05-22

## Scope

Continued the rescue-first visual pass from `/Volumes/LaCie/Wenu mapu/30_MARKETING`, using existing marketing/archive material only.

No new AI product imagery was created. No logo, official mark, `.env`, WooCommerce, commit, deploy, or aftercare changes were made.

## Source Assets Used

| Source | Derived web assets | Use |
| --- | --- | --- |
| `30_MARKETING/branding/earweights.png` | `public/img/categories/ear-weights-archive.webp`, `.avif` | Ear Weights page, Brass & Bronze page, Brass & Bronze material hub card |
| `30_MARKETING/branding/hanger2.png` | `public/img/categories/hangers-archive.webp`, `.avif` | Hangers page |
| `30_MARKETING/branding/grafica_promocional.png` | `public/img/brand/archive-campaign-international.webp`, `.avif` | Mystic Series editorial archive image |

## Pages Wired

- `src/pages/ear-weights.astro`
  - Updated Open Graph image to the archived ear weights image.
  - Added a visible AVIF/WebP editorial figure below the divider.
- `src/pages/hangers.astro`
  - Updated Open Graph image to the archived hanger image.
  - Added a visible AVIF/WebP editorial figure below the divider.
- `src/pages/material/brass-bronze.astro`
  - Updated Open Graph image to the archived ear weights image.
  - Added a visible AVIF/WebP editorial figure below the divider.
- `src/pages/material/index.astro`
  - Replaced the temporary 14k gold image on the Brass & Bronze card with the archived ear weights visual.
- `src/pages/collection/mystic-series.astro`
  - Updated Open Graph image to the archived campaign visual.
  - Added a visible AVIF/WebP editorial figure below the divider.

## Notes

- `grafica_promocional.png` includes embedded campaign text and a prior Wenu lockup. It is used as an archive/campaign image only, not as a replacement identity.
- Human/model banner images remain unused pending explicit approval.
- Culturally specific assets such as `diptico_kultrun.png` remain reserved for review before public wiring.
