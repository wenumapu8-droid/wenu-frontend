# Wënü Mapü · Home v3 editorial — reversible integration

Date: 2026-10-10 · Status: **draft / NOT PRODUCTION**

## Why
Prior visual mockups were isolated; they never replaced or preserved a working production page. This is a source-level change to the actual Astro hero in the existing home. It preserves components and interactivity. An independent photograph-based asset pass lives in the handoff ZIP and must be integrated after review.

## What this PR changes
- **Only** `src/components/HeroCarousel.astro` plus docs: opt-in visual variant under `PUBLIC_WENU_HOME_V3=true`.
- Reuses `/img/hero/wm-han-001-full.webp` already in the repository and described in the existing home as an authentic product macro.
- Makes the first hero message commercially legible: "Adorn the body. Carry a universe." `/shop` primary CTA, `/manifesto` secondary CTA.
- Keeps the six slides, previous/next controls, dots, copy rotator, hover/focus pause, `prefers-reduced-motion`.
- On mobile, v3 autoplay rests by default; manual controls still function.
- **No catalog, shop, checkout, WordPress, WooCommerce, Wültufe, KODEX, Oracle, Journal, menu or footer removal.**
- All current other hero slides are retained pending authenticity/quality review, **not** falsely certified as improved.

## Safe flags
Default (production): `PUBLIC_WENU_HOME_V3` unset -> original hero unchanged.

Staging only: `PUBLIC_WENU_HOME_V3=true npm run build`

Preview in local Astro environment: `PUBLIC_WENU_HOME_V3=true npm run dev`

Do **not** set the flag in production until mobile, desktop, links and photography are approved.

## Incorporating authentic-photo pass
See downloadable `Wenu_Mapu_RealPhoto_Pass01.zip` in the chat. It contains:
- `hero-authentic-desktop.webp` (1920x1080)
- `hero-authentic-mobile.webp` (900x1350)
- `real-ring-editorial-portrait.webp` (1050x1350)
- source attribution manifest and before/after proof

Copy images into `public/img/hero/` (and editorial path as appropriate), implement `<picture>` mobile/desktop art direction, and replace the initial v3 fallback image **only after manual crop and contrast review**. Keep all original RAW/JPEG untouched.

## QA BEFORE MERGE
- [ ] `npm ci && npm run build` without the flag: baseline works.
- [ ] `PUBLIC_WENU_HOME_V3=true npm run build`: variant builds.
- [ ] Screenshot baseline vs v3: 390px / 768px / 1440px.
- [ ] No content clipped on 320px mobile; product, jewelry and text visible.
- [ ] First slide visible with no CLS/LCP regression.
- [ ] All six slides + arrows + dots still work.
- [ ] `prefers-reduced-motion` works and keyboard focus visible.
- [ ] Shop and Manifesto CTA links functional; Woo/cart/checkout unchanged.
- [ ] Verify no false production, artisan, material or stock claims.
- [ ] Approve original-photo source provenance and manual visual QC.
- [ ] Capture Core Web Vitals and commerce event baseline before rollout.

## Next passes
1. Audit each landing image for provenance, visual artifacts, product fidelity and mobile crop.
2. Replace artificial campaign imagery with authentic photo treatments / original art. Product images must be faithful to the SKU and retained unaltered for PDP.
3. Reduce homepage cognitive load by progressive disclosure **without deleting** Burning Drum, Oracle, Journal, Wültufe, KODEX or collectible interactions.
4. Reassess temporal Journal/almanac content: "Rising now · Strawberry full moon" is stale in October and should be archived/updated.
5. Check contact, service eligibility, shipping claims and accessibility. Test user flows before merging.

**Build, screenshots and production deployment have not been executed by this PR.**
