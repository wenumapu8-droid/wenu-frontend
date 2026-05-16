# Wenu Mapu Frontend Audit - 2026-05-15

Scope: read-only audit of `src/pages`, `src/components`, `src/styles`, and `src/lib` on `redesign-v2`.

## P0

- CODE QUALITY - `src/components/SearchModal.astro:109`: Search results are rendered with `innerHTML` using catalogue fields from `/search-index.json`, creating an injection/XSS risk if Woo data contains markup; build each result with DOM APIs and `textContent`/safe attributes instead.
- CODE QUALITY - `src/components/forms/CustomOrderForm.astro:151`: `showPanel()` writes interpolated user form data into `panel.innerHTML`, so fallback summaries can inject markup; render the summary into a readonly textarea via DOM APIs and set text with `textContent`.
- SEO - `src/pages/shipping.astro:12` and `src/pages/shipping-returns.astro:9`: Two indexable routes emit the same title, meta description, and body while Base auto-canonicalizes each URL separately; make `/shipping-returns` redirect/noindex or allow Base to accept a canonical override to `/shipping`.

## P1

- ACCESSIBILITY - `src/components/Nav.astro:42`: The desktop nav uses `role="menubar"`/`menuitem` without implementing expected menubar keyboard behavior; use plain list navigation or add full arrow/Home/End/Escape roving-focus support.
- ACCESSIBILITY - `src/components/Nav.astro:117`: The mobile drawer is a hidden `div` with no modal semantics, focus trap, inert background, or focus return; make it a `dialog`/`role="dialog" aria-modal="true"` flow and manage focus on open/close.
- ACCESSIBILITY - `src/components/SearchModal.astro:34`: The results container is `role="listbox"` but options contain links and no `aria-selected`/`aria-activedescendant`; use a plain list of links or implement a complete combobox/listbox pattern.
- ACCESSIBILITY - `src/pages/local.astro:30`: The local pickup page jumps from the page `h1` to `h3` step titles; change the step titles to `h2` or add a visible/hidden `h2` before the ordered list.
- SEO - `src/pages/about.astro:8`: The About page has no JSON-LD even though it describes the organization/workshop; pass `AboutPage` or `Organization` JSON-LD through `jsonLd`.
- SEO - `src/pages/local.astro:9`: The Local Pickup page lacks LocalBusiness/Breadcrumb JSON-LD for the Truckee service-area page; add `LocalBusiness`/`Service` plus `BreadcrumbList` JSON-LD.
- CODE QUALITY - `src/pages/api/custom-order.ts:1`: The API route is marked inactive for static output while `CustomOrderForm` still posts to it at runtime; remove the dead route/client fetch or switch the site to an SSR-capable endpoint.
- ACCESSIBILITY - `src/styles/global.css:3097`: Newsletter inputs remove the focus outline without an equivalent replacement; keep the global `:focus-visible` outline or add a visible border/box-shadow focus state.

## P2

- SEO - `src/layouts/Base.astro:45`: Default `og:image:alt` falls back to the page title, which is not descriptive image alt text; require `ogImageAlt` for custom `ogImage` values or provide page-specific defaults.
- SEO - `src/pages/sets.astro:9`: `preloadImage` is passed as a string even though Base expects `{ avif, webp }`, so the intended hero preload never emits; pass `preloadImage={{ webp: '/img/hero/sets-hero.webp' }}`.
- CODE QUALITY - `src/lib/woo.ts:105`: `getProduct()` is exported but unused in the audited source while PDPs already use `getProducts()` in `getStaticPaths`; remove it or document the intended consumer.
- CODE QUALITY - `src/lib/subscribe.ts:30`: `hasMailerLiteConfig()` is exported but unused; remove it or use it in the API route health/config response.
- CONSISTENCY - `src/pages/p/[slug].astro:129`: PDP breadcrumbs and layout rely on extensive inline styles instead of shared classes; extract PDP sections/breadcrumbs into shared component or global classes.
- CONSISTENCY - `src/pages/shop.astro:124`: The material exploration block uses inline grid/heading/card styles instead of the landing/archive card system used by material pages; replace with shared `archive-grid`/card classes.
- CONSISTENCY - `src/pages/wholesale.astro:24`: The wholesale page is mostly bespoke inline layout rather than the shared page-title/section/container utility system; move these styles to global page classes.
- ACCESSIBILITY - `src/pages/shop.astro:89`: Filter tabs toggle visual `.active` state only and do not expose pressed/current state to assistive tech; add `type="button"` and update `aria-pressed` or use real links for category filters.
- CODE QUALITY - `src/pages/shop.astro:107`: The external fallback store link opens a new tab without `rel="noopener"`; add `rel="noopener"` to the anchor.
- ACCESSIBILITY - `src/pages/wholesale.astro:92`: The CTA section uses undefined `--bg-deep`/`--fg-light` tokens and dark text colors on a dark fallback, creating a contrast risk; define the tokens or use existing high-contrast `--bg`/`--bone` roles.
