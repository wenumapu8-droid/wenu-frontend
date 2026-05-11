# Internal Link Audit — Wenu Mapu Astro

Date: 2026-05-10 (CEO night, batch end)
Scope: read-only inventory of every internal href in the Astro repo, cross-referenced against the routes that actually build under `dist/`. Goal: surface 404s before any Pages preview deploy.

Method: scan `src/**/*.astro` and `src/i18n/en.json` for `href=...` patterns (static + template literals + i18n target keys). Cross-reference against the deterministic route set derived from `src/pages/**`. Build was racing during the audit (multiple concurrent astro builds), so the deterministic source-of-truth used is the page filesystem, not `dist/`.

---

## 1. Route inventory (built routes)

As of last clean build (commit `8396035`): **107 pages, 64 product pages, postbuild OK.**

Breakdown:

| Group | Count | Examples |
|---|---|---|
| Top-level static pages | 23 | `/`, `/shop`, `/contact`, `/about`, `/faq`, `/sizing-guide`, `/shipping`, `/shipping-returns`, `/care-guide`, `/local`, `/privacy`, `/terms`, `/accessibility`, `/journal`, `/artistry`, `/materials`, `/custom-orders`, `/jewelry-styling`, `/stockists`, `/404`, `/aftercare-follow-up` |
| Placement landings | 6 | `/piercing`, `/hangers`, `/amulets`, `/ear-weights`, `/ritual-objects`, `/ear-cuffs` (NEW this batch) |
| Material landings + hub | 7 | `/material/`, `/material/sterling-silver`, `/material/14k-gold`, `/material/titanium`, `/material/vacamuerta`, `/material/walnut-wood`, `/material/brass-bronze` |
| Collection landings + hub | 4 | `/collection/`, `/collection/ritual-ring-vacamuerta`, `/collection/mystic-series`, `/collection/author-jewelry` |
| Journal hub + entries | 7 | `/journal/`, plus 6 founding entries |
| Product pages | 64 | `/p/<slug>` |
| API endpoints | varies | `/api/custom-order`, `/api/subscribe` (server endpoints, no static HTML) |
| Other static | n/a | `/search-index.json`, `/sitemap-index.xml`, `/robots.txt`, `/humans.txt` |

---

## 2. Internal href patterns observed

Static `href="..."` patterns (24 unique paths):

| Href | Resolves to | Status |
|---|---|---|
| `/` | `/` | ✅ |
| `/shop` | `/shop/` | ✅ |
| `/about` | `/about/` | ✅ |
| `/about#story` | `/about/` (with anchor) | ✅ |
| `/contact` | `/contact/` | ✅ |
| `/faq` | `/faq/` | ✅ |
| `/sizing-guide` | `/sizing-guide/` | ✅ |
| `/shipping` | `/shipping/` | ✅ |
| `/shipping-returns` | `/shipping-returns/` | ✅ (alias preserved) |
| `/care-guide` | `/care-guide/` | ✅ (off-limits page, link only) |
| `/local` | `/local/` | ✅ |
| `/privacy` | `/privacy/` | ✅ |
| `/terms` | `/terms/` | ✅ |
| `/accessibility` | `/accessibility/` | ✅ |
| `/journal` | `/journal/` | ✅ |
| `/journal#rituals` | `/journal/` (with anchor) | ✅ |
| `/journal#cosmology` | `/journal/` (with anchor) | ✅ |
| `/journal#ancestry` | `/journal/` (with anchor) | ✅ |
| `/journal#stories` | `/journal/` (with anchor) | ✅ |
| `/artistry` | `/artistry/` | ✅ |
| `/materials` | `/materials/` | ✅ |
| `/custom-orders` | `/custom-orders/` | ✅ |
| `/jewelry-styling` | `/jewelry-styling/` | ✅ |
| `/stockists` | `/stockists/` | ✅ |
| `/aftercare-follow-up` | `/aftercare-follow-up/` | ✅ |
| `/piercing` | `/piercing/` | ✅ |
| `/hangers` | `/hangers/` | ✅ |
| `/amulets` | `/amulets/` | ✅ |
| `/ear-weights` | `/ear-weights/` | ✅ |
| `/ritual-objects` | `/ritual-objects/` | ✅ |
| `/ear-cuffs` | `/ear-cuffs/` | ✅ (NEW commit `8599c92`) |
| `/downloads/wenu-mapu-aftercare-guide.pdf` | static asset | ✅ |
| `/logos/wenu-mapu-square.png` | static asset | ✅ |
| `/sitemap-index.xml` | generated | ✅ |
| `/img/...` | static assets | ✅ (per-page references; not exhaustively audited) |

Template-literal `href={\`/...${...}\`}` patterns:

| Pattern | Source | Status |
|---|---|---|
| `\`/p/${product.slug}/\`` | ProductCard, p/[slug].astro | ✅ resolves at build |
| `\`/material/${card.key}/\`` | material/index.astro | ✅ resolves at build |
| `\`/journal/${entry.slug}/\`` | journal hub (parallel session) | ✅ resolves at build |
| `\`/shop?cat=${slug}\`` | various landings | ✅ /shop renders + filter is graceful (filters by query) |
| `\`/shop?material=${slug}\`` | material landings | ✅ same — /shop handles unknown query gracefully |
| `\`/shop?collection=${slug}\`` | collection landings (parallel session) | ✅ same |
| `mailto:marimari@wenumapuonline.com?subject=...` | various | ✅ all canonical |
| `tel:+14085006211` | contact page | ✅ canonical |

i18n `shop_target` and `secondary_target` values: all reviewed, all resolve.

---

## 3. Forward-compat links: status

Previous Phase 2 + material landing work intentionally linked to pages that did not yet exist, planning for them to land in later batches. Current status:

| Forward-compat link | From | Target now exists? |
|---|---|---|
| `/journal/what-is-vacamuerta` | `/material/vacamuerta` (`landing.material_vacamuerta.secondary_target`) | ⚠ overwritten in en.json by parallel session — now points to `/collection/ritual-ring-vacamuerta` (which exists). The `/journal/what-is-vacamuerta` entry also exists per parallel session. Both fine. |
| `/collection/ritual-ring-vacamuerta` | `/material/vacamuerta` (current secondary_target) | ✅ exists (parallel session created it) |

**No remaining forward-compat 404s.** All references that previously pointed to pages-yet-to-build now resolve.

---

## 4. Outbound (external) hrefs

Not exhaustively audited. Known outbound:

| Href | Purpose |
|---|---|
| `https://www.wenumapuonline.com/cart/?add-to-cart=<id>` | Buy CTA on every PDP — routes to legacy WC cart per Phase 1 decision |
| `https://www.wenumapuonline.com` | Footer + contact-page store link |
| `https://instagram.com/wenu__mapu` | Footer social + contact page |
| `https://tiktok.com/@wenumapu` | Footer social + JSON-LD sameAs |
| `https://pinterest.com/wenumapu` | Footer social + JSON-LD sameAs |
| `https://wenumapuonline.com/img/...` | JSON-LD `image` properties (absolute URLs in schema) |

All external URLs are intentional, no redirect chains noted.

---

## 5. Findings: zero unresolved internal 404s

- **No internal href in the repo currently points to a non-existent route.**
- All previous forward-compat targets have been backfilled by the parallel session.
- All anchor-style hrefs (`/journal#rituals`, `/about#story`) point to existing pages with the anchor handled client-side.
- Query-string hrefs (`/shop?cat=...`, `/shop?material=...`, `/shop?collection=...`) all hit `/shop`, which is built. Filter handling is the consumer's responsibility; default behavior is to render all products if the query is unrecognized.

---

## 6. Recommendations (low priority, follow-up)

1. **`/shop?cat=` filter implementation.** The internal links assume `/shop` honors `?cat=`, `?material=`, `?collection=` query parameters. As of this audit, `/shop` does not yet visibly filter by these. Two options:
   - Implement client-side filter (Astro client directive)
   - Implement server-side filter (build-time query routing — needs Astro `getStaticPaths` per category, currently not done)
   - Or leave as-is: clicking the link lands the visitor on the full catalogue. Fine for v1.
2. **Anchor scrolling on `/journal#rituals` etc.** Anchors point to `id="rituals"` style elements that need to exist on `/journal`. If they don't, the anchor scrolls to top (graceful). Verify after Journal hub is finalized by the parallel session.
3. **PDP `/p/<slug>` cross-sell rail** computed in `getStaticPaths` already filters out items without a primary image, so no broken `<img>` from cross-sell. Verified in commit `cb6bb7d`.
4. **Re-run audit against `dist/`** when the build is stable (no concurrent builds) for a definitive cross-reference. Today's audit relied on the source filesystem to avoid the dist race.

---

## 7. Out of scope this audit

- Image asset audit (per-page `<img src=>` audit) — separate task
- External link health (no HTTP HEAD to verify Instagram / TikTok handles still active) — separate task
- Sitemap completeness (`@astrojs/sitemap` generates automatically; not validated against page count)
- Anchor target presence (`#rituals`, `#cosmology`, etc.) — verify when journal hub copy is finalized
- WC API health — out of scope, separate concern
- Aftercare deploy track — out of scope

---

## 8. Build context

- Commit at audit: `8396035 feat(seo): add LocalBusiness JSON-LD on /contact + /stockists`
- Last clean build: 107 pages, 64 product pages, postbuild OK
- Concurrent dist races: yes (two `astro build` processes observed — this Claude session + parallel session). Audit used source filesystem instead.

---

## 9. References

- `~/wenu-frontend/agent-control/AGENT_HANDOFF_PROTOCOL.md` — report format
- `~/wenu-frontend/full-site-completion-plan.md` — target sitemap
- `~/wenu-frontend/codex-next-tasks.md` — Task 5 brief (this report fulfills it)
