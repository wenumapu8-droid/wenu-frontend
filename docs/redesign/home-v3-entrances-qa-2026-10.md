# Wënü Mapü — Home V3 R2 editorial integration

Date: 2026-10-10 • Branch: `design/home-v3-editorial-2026-10-10` • Pull request: #184 • **NOT DEPLOYED**.

## Scope

This change extends PR #184 on the real Astro frontend. It is not an independent HTML landing or an image-only mockup. No production code path changes unless `PUBLIC_WENU_HOME_V3=true`.

- `src/components/HomeEditorialSelection.astro` introduces a mobile-first 3-door collection entrance. Photos are chosen at build time from **real WooCommerce product images**, with no fabricated product renders, names, prices, stock or technical claims.
- The three doors are Piercing Jewelry, Hangers & Weights and One-of-One. Paths lead to the existing `/piercing-jewelry`, `/hangers` and `/stones-one-of-one` pages. Secondary links preserve all categories, collections, and Wültufe discovery.
- The two legacy horizontal marquees are left intact in `src/pages/index.astro` and remain visible when V3 is OFF. If fewer than three DISTINCT non-placeholder catalogue photos resolve, V3 automatically falls back to the original marquees.
- The real `HeroCarousel.astro` retains all six original slides, arrows and tabs. On V3, rotation becomes manual to avoid competing messages while reading. Default hero autoplay remains unchanged.
- First V3 hero picture chooses medium mobile and extra-large desktop AVIF assets already in `public/img/hero/`, with a WebP fallback; do not add mythical jewelry images.
- V3 secondary hero link is `/constelaciones`, consistent with the original Cinematic Commerce Storyboard.
- V3 copy avoids unverified piercing appointment, manufacturing process and scarcity claims until product/operational verification. All default copy remains untouched.
- In V3, the old Strawberry Moon block is labelled an **archive**, not a currently rising event. The Journal content remains available.

## Preservation evidence

Unchanged baseline sections and routes: `DesignYourEarBanner`, `SignalBand`, `FeaturedShowcase`, `CatalogDeck`, `EmberCore`, `FrequencyBand`, Journal, `IgFollowGallery`, `Newsletter`, the ritual/Manifesto portal, `PowerAnimalsOracle`, `MarqueeDrag`, footer, KODEX link, product cards, WooCommerce integration and cart.

The initial R2 changes only the first-fold visual hierarchy. Cinema, video masters and authentic 3D/GLB remain pending R3/R4. No assertion is made that the final site is already immersive, animated or shipped.

## Safe local validation: Claude Code / staging

1. Confirm actual Cloudflare deployment branch, deploy method and currently live commit **before** changing anything.
2. Check out this PR branch on a separate workspace. Do not edit credentials, production branch or shared build outputs.
3. Use existing approved local WooCommerce environment variables (`WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`) without logging them.
4. `npm ci`
5. `node scripts/check-home-v3.mjs` (source-level parity only).
6. `npm run build` (default): legacy home still compiles, original two marquees present.
7. `PUBLIC_WENU_HOME_V3=true npm run build` (staging): new three real-photo cards appear if WooCommerce images pass selection.
8. `PUBLIC_WENU_HOME_V3=true npm run dev`, capture the actual Astro page at 390px and 1440px; also test 320/768.
9. QA first paint/LCP picture, keyboard/focus, arrows/dots, scroll-snap mobile, check SKU images, /shop → PDP → cart → test checkout, responsive crop.
10. Produce `docs/redesign/evidence/home-v3-2026-10-10/` with captured screenshots, build logs, WC photo source/alt, Lighthouse, regression report and original-vs-preview comparison.
11. Only upon explicit owner approval propose merge/release. No automatic production deploy.

If local secrets are unavailable, **STOP** rather than rendering an intentionally empty Woo catalogue as if it were a valid commercial preview. `ALLOW_EMPTY_PRODUCTS=true` is a technical troubleshooting mode, not a launch certificate.

## Blockers from this session

The connected environment can read/write GitHub but does not have authorized Cloudflare deployment access, the private WooCommerce build secrets or the user's local Claude Code filesystem. It cannot truthfully produce a rendered Astro staging URL yet. This branch is source-integrated and requires the above local build and browser QA. No Vercel project for the connected account was found; creating a separate host would be a divergent staging system, so this handoff keeps Cloudflare as the destination.

## Visual quality gates

- Original brand symbol unchanged. Actual photos trace to SKU; no synthetic SKU hero/carousel art.
- Desktop layout must be approved side by side with actual published page, same for mobile.
- Product card images with white studio backgrounds are legitimate but require cropping/background review; don't replace product geometry with generated art.
- LCP under 2.5 s, INP under 200 ms, CLS under 0.1 are goals requiring measurement, not confirmed results.
- Piercing appointment CTA remains a separate P0 legal/operation review for `Nav` and `DesignYourEarBanner`; do not promote unverified bookings.
- One focused scene of motion and one real 3D object only after R2 is visually and commercially accepted.

## Next planned iteration

R2B: confirm two main campaign photographs, curate real first-fold photo crop and generate an editorial image manifest; review in mobile and desktop. R3: implement still-first motion and real video masters. R4: a faithful SKU GLB with fallbacks.
