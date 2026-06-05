# Banner & hero asset map — 2026-05-29

Intake of 40 ChatGPT design images from `~/Downloads` + 1 generated jaguar hero.
All raw PNGs (1672×941) stay in `~/Downloads`; only EXIF-stripped **webp + avif** were
written into the repo. Nothing existing was overwritten — new assets live under
`public/img/banners/` (new tree) and `public/img/hero/hero-jaguar*`.

---

## 1. Jaguar homepage hero (generated)

- Source: Pollinations `flux-realism`, mirrored so the cat sits center-right and the
  **left two-thirds is open dark space for copy**, upscaled to 2560×900, left→right dark scrim.
- Files: `public/img/hero/hero-jaguar.{avif,webp}` (master) +
  `hero-jaguar-{600,900,1200,1800,2560}w.{avif,webp}` (responsive).
- **Not yet wired into `index.astro`** — current home hero is `hero-portrait` (model).
  Swapping the homepage hero is a high-visibility brand decision; left for owner confirmation.
- Ready-to-paste `<picture>` (drop into the hero block when approved):

```html
<picture>
  <source type="image/avif" sizes="100vw"
    srcset="/img/hero/hero-jaguar-600w.avif 600w, /img/hero/hero-jaguar-900w.avif 900w,
            /img/hero/hero-jaguar-1200w.avif 1200w, /img/hero/hero-jaguar-1800w.avif 1800w,
            /img/hero/hero-jaguar-2560w.avif 2560w" />
  <source type="image/webp" sizes="100vw"
    srcset="/img/hero/hero-jaguar-600w.webp 600w, /img/hero/hero-jaguar-900w.webp 900w,
            /img/hero/hero-jaguar-1200w.webp 1200w, /img/hero/hero-jaguar-1800w.webp 1800w,
            /img/hero/hero-jaguar-2560w.webp 2560w" />
  <img src="/img/hero/hero-jaguar-1800w.webp" alt="" width="2560" height="900"
       fetchpriority="high" decoding="async" />
</picture>
```

> Brand note: a jaguar / Amazon-rainforest motif is a thematic departure from the Mapuche /
> Patagonia / cosmos canon. It passes the AI-image policy (atmospheric, never product), but
> confirm it fits the brand direction before it becomes the home hero.

---

## 2. Category banners — `public/img/banners/category/`

Wide editorial banners (model + product) for category/landing headers. Top nav categories
today are Piercing · Hangers · Ear Weights · Amulets · Ritual Pieces; these are finer types
that suit category-page headers or `/shop` filter heroes.

| # | file | label on art | suggested use |
|---|------|--------------|---------------|
| 3 | `septum.{webp,avif}` | SEPTUM · RITUAL PIERCING | piercing sub-type / `/piercing` |
| 4 | `ear-cuff.{webp,avif}` | EAR CUFF | `/ear-cuffs` header |
| 5 | `ear-cuff-alt.{webp,avif}` | EAR CUFF (variant) | alt / mobile crop |
| 6 | `tunnel.{webp,avif}` | TUNNEL · STRETCHING | ear-weights / tunnels |
| 7 | `ring.{webp,avif}` | RING · SACRED RINGS | rings category |
| 8 | `bracelet.{webp,avif}` | BRACELET · RITUAL BRACELETS | bracelets category |
| 9 | `hanger.{webp,avif}` | HANGER · EAR WEIGHTS | `/hangers` header |
| 10 | `piercing.{webp,avif}` | PIERCING · BODY JEWELRY | `/piercing` header |
| 11 | `necklace.{webp,avif}` | NECKLACE · RITUAL NECKLACES | necklaces category |
| 12 | `plug.{webp,avif}` | PLUG · STRETCHED LOBES | plugs / ear-weights |
| 13 | `earring.{webp,avif}` | EARRING · RITUAL EARRINGS | earrings category |

> Existing `public/img/categories/banner-*.webp` were NOT touched. These new ones are kept
> separate to avoid clobbering; promote/rename later if they replace the originals.

## 3. Collection banners — `public/img/banners/collection/`

Cosmic-landscape banners with a collection name. **No collection pages exist yet** for these
themes (current `/collection/*` pages are author-jewelry, mystic-series, ritual-ring-vacamuerta).
These are new collection concepts awaiting pages, or reusable as themed section backgrounds.

| # | file | theme | note |
|---|------|-------|------|
| 16 | `neo.{webp,avif}` | NEO | |
| 17 | `maya.{webp,avif}` | MAYA | |
| 18 | `solar.{webp,avif}` | SOLAR | golden eclipse, strong |
| 19 | `fossil.{webp,avif}` | FOSSIL | |
| 20 | `organic.{webp,avif}` | ORGANIC | |
| 21 / 26 | `india.{webp,avif}` / `india-alt` | INDIA | two variants |
| 22 / 29 | `ornamental.{webp,avif}` / `ornamental-alt` | ORNAMENTAL | two variants |
| 23 / 27 | `araucania.{webp,avif}` / `araucania-alt` | ARAUCANIA | two variants |
| 24 | `atacama.{webp,avif}` | ATACAMA | |
| 25 / 28 | `origin.{webp,avif}` / `origin-alt` | ORIGIN | two variants |

## 4. Atmospheric backgrounds — `public/img/banners/atmospheric/`

No text — full-bleed section backgrounds, CTA scrims, dividers, OG images.

| # | file | scene |
|---|------|-------|
| 15 | `mountain-starfield` | starry mountain night |
| 30 | `coastal-cliffs-goldenhour` | coastal cliffs, golden hour |
| 31 | `misty-ridge` | misty mountain ridge |
| 32 | `eclipse-mountains` | total eclipse over peaks |
| 33 | `eclipse-distant` | distant eclipse |
| 37 | `altar-candle-sparks` | candle / sparks altar |
| 38 | `night-forest-water` | misty forest + water at night |
| 39 | `night-forest-light` | dark forest with light |

## 5. Brand / promo — `public/img/banners/brand/`

| # | file | use |
|---|------|-----|
| 1 | `homepage-mock-reference` | **Design north-star** — full home mock (nav + "Adornment for the Sacred Body" hero + category strip). Reference only, not a shipped asset. |
| 34 | `adornment-promo-portrait` | promo card / newsletter (model) |
| 35 | `adornment-promo-eclipse` | promo card (eclipse + model) |
| 36 | `adornment-promo-wide` | wide CTA / newsletter banner |
| 40 | `adornment-portrait-eclipse` | portrait hero / about |

## 6. Graphics — `public/img/banners/graphics/`

| # | file | use |
|---|------|-----|
| 2 | `ritual-symbol-grid` | ritual symbol set — icons / about / texture |
| 14 | `ornamental-greca-divider` | horizontal section divider (greca) |

---

## Next steps (proposed, not yet done)

1. **Decide jaguar hero** — confirm if it replaces the home hero; if yes, wire the `<picture>` above into `src/pages/index.astro`.
2. **Category headers** — wire `banners/category/*` into the matching category pages (`/piercing`, `/hangers`, `/ear-cuffs`, etc.) as header blocks.
3. **Collection pages** — if Neo/Maya/Solar/… become real collections, scaffold `/collection/<slug>` pages using `banners/collection/*` as headers; otherwise repurpose as themed section backgrounds.
4. **Section backgrounds & dividers** — use `atmospheric/*` for CTA scrims and `graphics/ornamental-greca-divider` as a real section divider (replaces the geometric placeholder in `PatternBand.astro`).
5. Run `npm run build` after any wiring to confirm a clean build.
