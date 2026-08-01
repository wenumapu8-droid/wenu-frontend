# Morning verification report - redesign-v2

Date: 2026-05-09
Repo: `/Users/user1/wenu-frontend`
Branch verified: `redesign-v2`

## Summary

Not safe to push yet.

The branch builds successfully with the required Node 24 runtime and a reachable WooCommerce API, producing 82 pages and 64 product detail pages. However, the product fetch layer catches WooCommerce failures and returns empty arrays, so a network/API failure can still produce a successful static build with zero products. Forms also still point at Formspree placeholder endpoints. Those are launch blockers.

## Commands run

```bash
git branch --show-current
git log --oneline --decorate -30
git status --short --branch
sed -n '1,220p' package.json
sed -n '1,260p' redesign-v2-night-report.md
npm run build
PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run build
PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run astro -- check
find src/pages -maxdepth 2 -type f | sort
find dist -maxdepth 2 -name index.html | sort
rg -n "aftercare|formspree|placeholder|NO IMAGE|Uncategorized|fallback|/downloads/|\\.svg|\\.webp|\\.avif|\\.jpg|\\.png|/img/|/assets/" src public package.json astro.config.mjs
rg -n "formspree\\.io/f/placeholder|NO IMAGE|Uncategorized|return \\[\\]|catch \\(e\\)|catch \\{|getProducts\\(|getStaticPaths|search-index" src
wc -c dist/search-index.json
find dist/p -mindepth 2 -maxdepth 2 -name index.html | wc -l
du -h public/downloads/wenu-mapu-aftercare-guide.pdf
```

## Git verification

- Current branch: `redesign-v2`
- Git status: clean before report creation.
- Latest branch history includes 26 commits after `main` plus the `main` baseline in `git log --oneline --decorate -30`.
- The night report exists at `redesign-v2-night-report.md` and claims the main redesign tasks plus bonus tasks were completed.

Latest 26 commits on `redesign-v2`:

```text
df56330 BN13: humans.txt - small ritual signature for the studio
faf4b6d BN12: final report update with all bonus tasks + closing summary
fc42433 BN11: print stylesheet for legal pages + 404 popular destinations
645b4bf BN10: update CLAUDE.md with all night additions
89bdd55 BN9: third-party preconnect + visible search keyboard hint
7f4307e BN8: night report updated with all BN tasks completed
1f6d17e BN6+BN7: ritual NO-IMAGE placeholder + curated sitemap priorities
a6e19b7 BN1-BN5: bonus pass - entities, image filter, hero srcset, HowTo schema
d87fcd5 N10: night report - full summary of N1-N9 + findings + TODOs
dc4f766 N9: a11y - fix missing h1 on /care-guide + lang=arn on Mapudungun terms
2775d1d N8: microinteractions - fade-in stagger on scroll
00c449c N7: CSS cleanup - remove dead rules from v1 hero and dividers
d1c59db N5: standalone pages /materials /artistry /stockists
d1b3406 N4: site-wide search modal with keyboard nav
6eb01d2 N3: SEO - BreadcrumbList + per-page OG images
cafe46d N2: Performance LCP - preload hero + AVIF for all webp
26310d6 N1: pattern band expansion to footer + support pages
07bbd35 add Mapuche-textile pattern band as section dividers + Sacred bg
acb9c63 add /aftercare standalone + PDF download + 3 healing zones
61b3e71 polish pass: SEO, a11y, perf, legal pages, polish contact/local/detail
cb20f0d localize category names ES -> EN at display layer
46c3abd add /custom-orders + soporte completo (FAQ, sizing, shipping, about, journal)
549ad5e add /care-guide page with Healing Times by Zone (full spectrum)
d0dc5af clean image metadata + naming convention + piercing roadmap
5d802ec F3-F10: rediseño visual home + footer + a11y mínimo
7288e73 F1+F2: fotos categorizadas + Nav rediseñado
```

## Dependency status

No dependency install was needed. `node_modules/` and `package-lock.json` already exist.

Important runtime note: the default shell Node is `v20.18.3`, which fails immediately because Astro requires `>=22.12.0`. Builds must use:

```bash
PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run build
```

## Build status

- `npm run build` with default Node `v20.18.3`: failed before compile because Node is unsupported.
- `PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run build` with sandboxed network: completed, but WooCommerce DNS failed and only 18 static pages were built. `dist/search-index.json` was `[]`, and no `dist/p/` product pages existed.
- Same Node 24 build with approved network access: passed. Astro built 82 pages in about 30s. `dist/search-index.json` is 14,962 bytes and `dist/p/` contains 64 product pages.

## Lint/typecheck status

- No `lint` script exists in `package.json`; lint was not available.
- No `typecheck` script exists in `package.json`.
- `npm run astro -- check` was attempted as the closest available check. Astro did not run the check because `@astrojs/check` and `typescript` are not installed.

## Routes verified

Requested route status:

- `/` - exists: `src/pages/index.astro`, `dist/index.html`
- `/shop` - exists: `src/pages/shop.astro`, `dist/shop/index.html`
- `/piercing` - missing as a standalone route. Navigation uses `/shop?cat=piercing`.
- `/hangers` - missing as a standalone route. Navigation uses `/shop?cat=hangers`.
- `/materials` - exists: `src/pages/materials.astro`, `dist/materials/index.html`
- `/artistry` - exists: `src/pages/artistry.astro`, `dist/artistry/index.html`
- `/stockists` - exists: `src/pages/stockists.astro`, `dist/stockists/index.html`
- `/faq` - exists: `src/pages/faq.astro`, `dist/faq/index.html`
- `/care-guide` - exists: `src/pages/care-guide.astro`, `dist/care-guide/index.html`
- `/shipping` - missing. The implemented route is `/shipping-returns`.
- `/about` - exists: `src/pages/about.astro`, `dist/about/index.html`
- `/journal` - exists: `src/pages/journal.astro`, `dist/journal/index.html`

Additional routes present: `/aftercare`, `/contact`, `/custom-orders`, `/local`, `/privacy`, `/sizing-guide`, `/terms`, `/accessibility`, product detail pages under `/p/[slug]`.

## Broken references found

- Aftercare PDF: fixed/present. `public/downloads/wenu-mapu-aftercare-guide.pdf` exists and is 84 KB.
- Formspree placeholders: broken. Both `src/components/Newsletter.astro` and `src/pages/custom-orders.astro` submit to `https://formspree.io/f/placeholder`.
- Placeholder cardinal symbols: present. `src/components/CardinalGrid.astro` and the product no-image placeholder still use local geometric/cardinal SVG-style placeholders. This may be acceptable visually, but it is not final cultural artwork.
- Empty WooCommerce fallback: critical. `src/lib/woo.ts` catches fetch errors and returns `[]`; product-dependent routes then build without failing.
- Image paths: local image/PDF/video paths referenced from `src` and `public` were present. Product images are remote WooCommerce URLs and depend on Woo availability/content.
- `/piercing`, `/hangers`, and `/shipping` as standalone requested routes are missing.

## WooCommerce risk assessment

High risk until fixed.

Confirmed failure mode: when WooCommerce cannot be reached, the static build still exits successfully. In the sandboxed build, Woo fetches failed with `getaddrinfo ENOTFOUND www.wenumapuonline.com`, but Astro still completed with only 18 pages, an empty search index, no product detail pages, and empty product surfaces.

Relevant code:

- `src/lib/woo.ts`: `getProducts()` catches fetch errors and returns `[]`.
- `src/pages/p/[slug].astro`: `getStaticPaths()` maps over `getProducts(100)`, so `[]` means zero product detail pages.
- `src/pages/shop.astro`: renders a no-products fallback when products are empty.
- `src/pages/search-index.json.ts`: emits an empty search index when products are empty.
- `src/pages/index.astro`: hides featured products when products are empty.

This should fail the build in production/preview unless an explicit offline mode is requested.

## Recommended next actions

1. Replace the Formspree placeholder endpoints in Newsletter and Custom Orders with real endpoints, or disable the forms with a clear mailto fallback.
2. Make WooCommerce fetch failures fail CI/build by default. Only allow empty product builds behind an explicit environment flag such as `ALLOW_EMPTY_PRODUCTS=true`.
3. Decide whether `/piercing`, `/hangers`, and `/shipping` should be real routes or whether all references/specs should be updated to `/shop?cat=piercing`, `/shop?cat=hangers`, and `/shipping-returns`.
4. Add `lint` and `typecheck` scripts, or install/configure `@astrojs/check` and `typescript`.
5. Validate placeholder cardinal art before launch, or replace it with approved artwork.
6. Rebuild once those blockers are fixed and verify `dist/search-index.json` is non-empty and `dist/p/` contains product pages.

## Safe to push?

No.

It is not safe to push `redesign-v2` to GitHub for preview/deploy yet because:

- Forms are still wired to placeholder endpoints.
- WooCommerce failures can produce a successful build with zero products.
- Requested standalone routes `/piercing`, `/hangers`, and `/shipping` do not exist.

## Exact commands to run next

```bash
cd /Users/user1/wenu-frontend
git status --short --branch
PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run build
wc -c dist/search-index.json
find dist/p -mindepth 2 -maxdepth 2 -name index.html | wc -l
rg -n "formspree\\.io/f/placeholder|return \\[\\]|/shipping\\b|href=\\\"/(piercing|hangers)\\b" src
```

After fixing blockers:

```bash
cd /Users/user1/wenu-frontend
PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run build
git status --short --branch
git log --oneline --decorate -5
```
