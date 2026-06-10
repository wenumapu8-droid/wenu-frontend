# Marketing Folder Rescue Manifest - 2026-05-21

## Scope

Source-first visual rescue from:

`/Volumes/LaCie/Wenu mapu/30_MARKETING`

Initial audit was source-only. Follow-up implementation prepared and wired the first approved marketing-derived assets on 2026-05-22.

## Principle

Use the saved Wenu Mapu marketing archive before generating anything new.

The visual system should rescue:

- existing logo and wordmark material
- cosmos / sideral / sky / space memory
- old banners and campaign graphics
- product/category art from `branding`
- symbols from `symbol`
- identity files from `Identidad visual`
- social/feed/history pieces as editorial references

## Folder Map

| Folder | Approx role | Notes |
| --- | --- | --- |
| `branding/` | Product/category graphics, old feed assets, about visuals, large `fondo.png`, diptych/collateral | Strongest source for category tiles and brand mood. |
| `Identidad visual/` | Logos, identity exports, videos, profile images, cosmic/space assets | Primary identity memory. Preserve before redesigning. |
| `banners/` | Web banners and wide hero/campaign files | Best direct source for collection banners and hero bands. |
| `symbol/` | Symbol photography/graphics | Review visually before using; possible source for dividers, seals, background motifs. |
| `nueva identidad visual 2026/` | ChatGPT/generated identity explorations | Reference/intake only unless already approved. |
| `ig-posts/` | Social content | Use as campaign reference, not direct website imagery by default. |
| `certificado/` | Certificate/packaging direction | Good source for post-purchase/certificate system. |
| `me/` | Founder/self imagery | Human approval required before public use. |

## Strong Candidate Assets

| Source | Dimensions | Recommended role | Target idea |
| --- | ---: | --- | --- |
| `branding/fondo.png` | 3264 x 4928 | Core cosmic/identity background | `public/img/brand/wenu-fondo-cosmos-source.*` after crop/optimization. |
| `banners/banner_meteorite_ritual_rings.webp` | 1920 x 615 | Collection banner | Meteorite / Vacamuerta collection banner. |
| `banners/escritorio_banner1.webp` | 1920 x 615 | Web banner | General brand/shop banner candidate. |
| `banners/meteorite_ring_collection_banner.webp` | 2702 x 982 | Collection hero | Ritual Ring Vacamuerta / meteorite collection. |
| `banners/meteorite_ritual_collection_banner_final.webp` | 2702 x 1182 | Collection hero | Strong final meteorite campaign candidate. |
| `banners/banner_web_wenumapu.png` | 1920 x 615 | Legacy web banner | Review for home/brand archive use. |
| `banners/bannerweb_wenumapu2.png` | 1920 x 615 | Legacy web banner | Review for hero/archive use. |
| `banners/chica_modelo.png` | 3840 x 1920 | Editorial/model campaign | Human approval before use. |
| `banners/chica_grafica2.png` | 3840 x 1920 | Editorial/graphic campaign | Human approval before use. |
| `branding/EAR_CUFF.png` | 1920 x 1920 | Category tile | Candidate for `/ear-cuffs` replacement. |
| `branding/EXPAS_MADERA.png` | 1920 x 1920 | Category/material tile | Candidate for wood / tunnels / hangers. |
| `branding/gold_hanger.png` | 1920 x 1920 | Category/material tile | Candidate for gold / hanger / author jewelry. |
| `branding/about_us.png` | 1920 x 1920 | About / story visual | Candidate for About page. |
| `branding/diptico_kultrun.png` | 1122 x 1122 | Symbol/collateral reference | `[VERIFICAR CULTURALMENTE]` before using as live decorative symbol. |
| `Identidad visual/nueva_identidad visual_final.png` | 4023 x 2005 | Identity reference | Preserve as identity source; do not replace current logo automatically. |
| `Identidad visual/nueva_identidad visual_final_blanca.png` | 4023 x 2005 | Identity reference | Preserve as light/dark identity source. |
| `Identidad visual/png_negro_final.png` | 378 x 301 | Logo/mark source | Compare with current public logo; do not auto-replace. |
| `symbol/IMG_2320.PNG` | 2732 x 2048 | Symbol/reference | Review for pattern/seal/divider extraction. |

## Already Reflected In `public/img`

The public meteorite files are not byte-identical to the LaCie sources, but their dimensions and names indicate they are likely optimized/resized derivatives:

| Public asset | Dimensions | Marketing source family |
| --- | ---: | --- |
| `public/img/brand/meteorite-banner.webp` | 1200 x 384 | `banner_meteorite_ritual_rings.webp` |
| `public/img/brand/meteorite-collection.webp` | 1200 x 436 | `meteorite_ring_collection_banner.webp` |
| `public/img/brand/meteorite-final.webp` | 1200 x 525 | `meteorite_ritual_collection_banner_final.webp` |

Do not duplicate these. Use the public versions unless a better crop is needed.

## Publication Queue

### P0 - Use Marketing Assets To Replace Weak Current Website Imagery

| Website need | Source candidate | Proposed destination | Action |
| --- | --- | --- | --- |
| Ear cuffs category tile | `branding/EAR_CUFF.png` | `public/img/categories/ear-cuffs.webp` + `.avif` | Crop square, strip metadata, optimize. |
| Wood / tunnels / walnut material | `branding/EXPAS_MADERA.png` | `public/img/materials/walnut-wood.webp` + `.avif` | Crop square or 4:3 material tile. |
| Gold / author jewelry / hanger material | `branding/gold_hanger.png` | `public/img/materials/14k-gold-hanger.webp` + `.avif` | Crop product/material tile. |
| About page visual | `branding/about_us.png` | `public/img/brand/about-archive.webp` + `.avif` | Review crop and tone. |
| Core brand/cosmos texture | `branding/fondo.png` | `public/img/brand/wenu-fondo-cosmos.webp` + `.avif` | Needs careful downscale; original is 71 MB. |

### P1 - Collection / Hero Support

| Website need | Source candidate | Proposed destination | Action |
| --- | --- | --- | --- |
| Ritual Ring / meteorite collection | existing public `meteorite-*` files | already published | Use current public optimized assets. |
| General brand/shop banner | `banners/escritorio_banner1.webp` | `public/img/brand/escritorio-banner.webp` + `.avif` | Review against current shop hero before copying. |
| Legacy web hero archive | `banners/banner_web_wenumapu.png`, `bannerweb_wenumapu2.png` | `public/img/brand/archive-banner-*` | Review first; may contain old type/layout. |

### P2 - Review Only

| Source | Why review first |
| --- | --- |
| `branding/modelos/*` | AI/model imagery; do not present as real customer/founder/product context without approval. |
| `banners/chica_modelo.png`, `chica_grafica2.png` | Strong visual but public use needs human approval. |
| `symbol/*` | Good symbolic archive; cultural and brand-official status must be checked. |
| `Identidad visual/*logo*`, `png_*`, `nueva_identidad visual*` | Logo/identity material; preserve, compare, but do not auto-replace current logo. |
| `diptico_*`, `kultrun`, pattern files | Cultural-symbol risk; keep `[VERIFICAR CULTURALMENTE]`. |
| `nueva identidad visual 2026/*` | Generated explorations; use only after approval, and only as secondary visual support. |

## Exact Next Implementation Step

Use existing marketing assets only.

Status on 2026-05-22: first pass completed.

Prepared assets:

- `public/img/categories/ear-cuffs.webp` + `.avif`
- `public/img/materials/walnut-wood.webp` + `.avif`
- `public/img/materials/14k-gold-hanger.webp` + `.avif`
- `public/img/brand/about-archive.webp` + `.avif`
- `public/img/brand/wenu-fondo-cosmos.webp` + `.avif`

Wired pages:

- `src/pages/ear-cuffs.astro`
- `src/pages/material/index.astro`
- `src/pages/material/walnut-wood.astro`
- `src/pages/material/14k-gold.astro`
- `src/pages/about.astro`

Validation run:

```bash
npm run assets:inventory
npm run assets:board
nvm use && npm run build
```

Build result: green, 80 pages built, `[verify-build] OK: 33 product pages built`.

Status on 2026-05-22: second pass prepared and wired before final validation.

Prepared assets:

- `public/img/categories/ear-weights-archive.webp` + `.avif`
- `public/img/categories/hangers-archive.webp` + `.avif`
- `public/img/brand/archive-campaign-international.webp` + `.avif`

Wired pages:

- `src/pages/ear-weights.astro`
- `src/pages/hangers.astro`
- `src/pages/material/brass-bronze.astro`
- `src/pages/material/index.astro`
- `src/pages/collection/mystic-series.astro`

See `reports/marketing-assets-phase-2-wiring-2026-05-22.md` for the detailed asset map.

## Stop Rules

- Do not replace the logo.
- Do not publish symbol/cultural files until reviewed.
- Do not copy raw 71 MB `fondo.png` directly into `public/img`.
- Do not use `me/` founder photos publicly without approval.
- Do not use AI/model imagery as if it were real product/customer photography.
- Do not touch aftercare, `.env`, WooCommerce, DNS, deploy, git commit, or push.
