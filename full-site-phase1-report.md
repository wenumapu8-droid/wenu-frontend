# Wenu Mapu — Full-Site Phase 1 Report

Date: 2026-05-09
Branch: `redesign-v2`
Scope: full-site Phase 1 launch blockers. Aftercare track untouched.

---

## 1. Branch

`redesign-v2`. No push performed. Commits below are local only.

## 2. Files changed

```
.nvmrc                                      (new)
CLAUDE.md                                   (extended: build safety + Cloudflare Pages section)
README.md                                   (rewritten: brand-relevant local dev + deployment context)
package.json                                (postbuild script added)
scripts/verify-build.mjs                    (new)
src/lib/woo.ts                              (throw on errors + ALLOW_EMPTY_PRODUCTS escape hatch)
src/components/Newsletter.astro             (form replaced with mailto fallback)
src/pages/custom-orders.astro               (form replaced with mailto fallback panel)
src/i18n/en.json                            (fallback copy + landing copy + add_to_cart)
src/styles/global.css                       (fallback panel + landing CSS)
src/pages/piercing.astro                    (new — SEO landing + featured rail + CollectionPage JSON-LD)
src/pages/hangers.astro                     (new — SEO landing + featured rail + CollectionPage JSON-LD)
src/pages/shipping.astro                    (new — canonical shipping policy; legacy /shipping-returns kept)
src/pages/p/[slug].astro                    (Buy CTA → same-tab /cart/?add-to-cart=<id>)
full-site-phase1-report.md                  (this file)
```

Aftercare files were not modified. The pre-existing untracked aftercare reports and the existing `package.json` `build:cloudflare` alias from the aftercare track were left in place.

## 3. WooCommerce safety change

`src/lib/woo.ts`:

- `getProducts`, `getProduct`, `getCategories` no longer swallow errors and return `[]`/`null`.
- They now `throw` on non-2xx HTTP responses or network errors.
- New env flag `ALLOW_EMPTY_PRODUCTS=true` is the explicit escape hatch for offline/dev builds. When set, the helpers log a loud `[woo] WARNING:` and degrade to empty arrays as before.
- On success `getProducts` logs `[woo] fetched N products`.

`scripts/verify-build.mjs` (new postbuild step):

- Counts directories under `dist/p/`.
- If count `< 20` and `ALLOW_EMPTY_PRODUCTS` is not `true`, exits non-zero with a clear `[verify-build] FAIL: only N product pages` message.
- Otherwise prints `[verify-build] OK: N product pages built.`

`package.json`:

- New `"postbuild": "node scripts/verify-build.mjs"` runs automatically after `npm run build`.

Verified failure path:

```
WC_CONSUMER_KEY=invalid WC_CONSUMER_SECRET=invalid npm run build  →  EXIT=1, "WC products fetch failed: HTTP 401" in log.
```

Verified success path:

```
npm run build  →  EXIT=0, "[woo] fetched 64 products", "[verify-build] OK: 64 product pages built."
```

## 4. Forms change

Both placeholder Formspree endpoints removed. No fake submit, no fake success state.

`src/components/Newsletter.astro`:

- `<form action="https://formspree.io/f/placeholder">` removed entirely.
- Replaced with explanation copy + `<a class="btn btn--solid" href="mailto:contact@wenumapuonline.com?subject=Join the ritual">Join via email →</a>`.
- Visual frame (band, flame, heading, body copy) preserved.

`src/pages/custom-orders.astro`:

- The full multi-field `<form>` block was replaced with a `<div class="custom-form__fallback-panel">` containing:
  - Explanation copy.
  - A bulleted list of fields the visitor should include in their email (Type, Material, Budget, Timing, Story).
  - Primary CTA: `<a class="btn btn--solid" href="mailto:contact@wenumapuonline.com?subject=Commission inquiry">Send commission inquiry →</a>`.
  - Direct address fallback link.
- Honeypot field, multi-field inputs, and submit button removed (they were attached to the dead endpoint).

`src/i18n/en.json` extended with `newsletter.fallback`, `newsletter.fallback_cta`, `newsletter.fallback_subject`, `custom.form.fallback_intro`, `custom.form.fallback_cta`, `custom.form.fallback_subject`. Original form keys kept untouched for re-enable when a real endpoint is wired.

Verified:

```
$ grep -rn "formspree.io/f/placeholder" src/ public/
(no matches)
```

## 5. Route strategy

Three new standalone Astro routes. No redirects added in Phase 1 — direct files keep things explicit and SEO-clean.

### `/piercing` (new)

- SEO landing for piercing pieces.
- `<title>`, `<meta description>`, `og:image` per page.
- `CollectionPage` + `BreadcrumbList` JSON-LD.
- Pulls products with category slugs containing `piercing | septum | labret | plug | tunnel | tapón | tunel`. Filters out items without a primary image. Featured rail of up to 6.
- CTAs: "Browse the piercing catalogue →" → `/shop?cat=piercing`. Secondary: "Care guide".

### `/hangers` (new)

- Same shape. Keywords: `hanger | pendant | pendiente | colgante`.
- CTAs: "Browse hangers →" → `/shop?cat=hangers`. Secondary: "Sizing guide".

### `/shipping` (new)

- Renders the canonical shipping policy by reusing `en.shipping` i18n.
- `/shipping-returns` legacy URL stays in place (uses the same i18n, same content) — no inbound link breakage.
- `/shipping` is now the preferred URL going forward; existing internal nav/footer links to `/shipping-returns` continue to work and can be migrated incrementally in a future commit.

Verified:

```
$ ls dist/{piercing,hangers,shipping,shipping-returns}/index.html
dist/piercing/index.html
dist/hangers/index.html
dist/shipping/index.html
dist/shipping-returns/index.html
```

## 6. Buy CTA decision

`src/pages/p/[slug].astro` line 132 changed from:

```
<a href="https://www.wenumapuonline.com/?add-to-cart=ID" target="_blank" rel="noopener">{en.product.buy_in_store}</a>
```

to:

```
<a href="https://www.wenumapuonline.com/cart/?add-to-cart=ID">{en.product.add_to_cart}</a>
```

Three changes:

1. Path corrected: `/cart/?add-to-cart=` (lands on the WooCommerce cart with the item added) instead of `/?add-to-cart=` (which would land on the WordPress homepage).
2. `target="_blank"` removed — same-tab navigation, customer doesn't lose context.
3. Label changed: "Buy in store →" → "Add to cart →" (clearer e-commerce intent, removes the "in store" ambiguity).

`en.product.buy_in_store` retained in i18n (in case any other place still uses it); `en.product.add_to_cart` added as the new canonical key.

This is the **safe interim cart strategy** for the Cloudflare preview. A native cart on the Astro side is out of Phase 1 scope and tracked for a follow-up phase.

## 7. Build status

```
$ nvm use && npm run build
Now using node v24.14.1
[build] 85 page(s) built in 40.30s
[build] Complete!
[woo] fetched 64 products
[verify-build] OK: 64 product pages built.
EXIT=0
```

85 pages built (2 new landing routes + 1 new shipping route = 3 more than before, with 64 product pages).

## 8. Product count / search index status

| Metric | Value |
|---|---|
| `dist/p/*` product pages | 64 |
| `dist/search-index.json` length | 64 |
| `dist/sitemap-0.xml` URLs | 85 |
| Failure-mode tested | yes (HTTP 401 → exit 1) |
| Success-mode tested | yes (catalog assertion green) |

## 9. Remaining blockers

These are NOT in Phase 1 and remain open. Most can ship with the preview, flagged as known debt; some must be resolved before any production cutover.

| # | Blocker | Severity for preview | Severity for production |
|---|---|---|---|
| 1 | Newsletter / Custom Orders mailto fallback is interim — real endpoint not wired | low (mailto works) | high (need real subscription + commission inbox automation) |
| 2 | Cardinal SVGs and pattern band are placeholder geometric, not the real Mapuche textile | low (visual debt) | high (brand premise) |
| 3 | Color tokens drift from approved spec (image 1) | low | medium (polish) |
| 4 | Buy CTA still routes to WC `/cart/` — no native cart on Astro side | low | medium (UX continuity) |
| 5 | `/piercing`, `/hangers` rails are heuristic by keyword; not yet driven by a slug-translation map | medium (catalog matching may be incomplete) | high (every category needs deterministic mapping) |
| 6 | WooCommerce slugs include `producto-prueba`, `producto-1281` etc. that should be cleaned | low | high (SEO + sitemap hygiene) |
| 7 | No real form-success / form-error feedback states | low (no form active) | medium (when forms reactivate) |
| 8 | No analytics / Search Console verification meta | low | medium |
| 9 | Footer credit "Web design by Northbound" is placeholder | low | low (cosmetic) |
| 10 | Standalone routes for `/ear-weights`, `/amulets`, `/ritual-objects` not yet built | low | medium (parity with /piercing /hangers) |

## 10. Cloudflare Pages preview readiness

**READY for Cloudflare Pages preview** once these manual steps complete:

1. Push `redesign-v2` to GitHub (no auto-push performed — awaiting approval).
2. Create the Cloudflare Pages project per the settings in `CLAUDE.md > Cloudflare Pages preview`.
3. Set encrypted env vars `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` in the Pages dashboard. Set `NODE_VERSION=24.14.1` and `WC_URL`.
4. Confirm production branch in the Pages project = `redesign-v2` (not `main`). No custom domain attached.

The preview build will use the same code path verified locally, with the same WC safety net.

## 11. Production domain readiness

**NOT READY**. Do not connect `wenumapuonline.com` to this build. Reasons:

- Real form endpoints not wired (subscriptions and commissions still go through mailto).
- Visual placeholders remain (cardinals, pattern band).
- Standalone routes incomplete (only piercing/hangers/shipping landed; ear-weights/amulets/ritual-objects pending).
- WooCommerce remains the source of cart and checkout — production cutover requires a documented routing plan that keeps `/wp-json/`, `/cart/`, `/checkout/` reachable.

## 12. Exact next commands

```bash
# 1. Verify locally
nvm use
npm run build
test "$(ls dist/p | wc -l)" -ge 20 && echo OK
grep -rn "formspree.io/f/placeholder" src/ public/ && echo FAIL || echo OK

# 2. Review the 5 commits below before pushing
git log --oneline | head -7

# 3. When ready to push (manual, after approval)
git push origin redesign-v2

# 4. In Cloudflare dashboard, create the Pages project per CLAUDE.md settings.
#    Connect to GitHub repo, production branch = redesign-v2.

# 5. After the first preview deploy lands, smoke test:
PREVIEW="https://<your-pages-subdomain>.pages.dev"
for p in / /shop/ /piercing/ /hangers/ /shipping/ /care-guide/ /custom-orders/; do
  echo "$p $(curl -s -o /dev/null -w '%{http_code}' $PREVIEW$p)"
done
```

---

## Final verdict

```
✅  AFTERCARE: handled separately
🟡  FULL SITE: READY FOR CLOUDFLARE PAGES PREVIEW (after manual push + Pages setup)
❌  PRODUCTION DOMAIN: NOT READY — do not connect wenumapuonline.com yet
```

Phase 1 closes the four launch-blocker categories: WC silent-fail, fake forms, missing routes, broken Buy CTA. Production-cutover blockers (real form endpoints, visual asset replacement, full route parity, slug hygiene) tracked for subsequent phases.

---

## Access audit (2026-05-09)

| Resource | Status |
|---|---|
| Browser automation (Chrome MCP, computer-use) | ✅ available |
| Wrangler CLI | ❌ not installed (`which wrangler` empty) |
| Cloudflare API token / Account ID env | ❌ not in shell |
| `~/.wrangler/config/default.toml` | ❌ absent |
| **GitHub remote `origin`** | ❌ **not configured** (`git remote -v` empty) |
| WooCommerce `.env` (`WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`) | ✅ present locally (not exposed) |
| Node 24.14.1 (via nvm) | ✅ available, `.nvmrc` pins it |
| `redesign-v2` branch with Phase 1 commits | ✅ ready |

## Phase 1 final verification (Node 24)

```
[verify-build] OK: 64 product pages built.
dist/p/ → 64 directories
search-index.json → 64 entries
/piercing /hangers /shipping /shipping-returns → all built
formspree.io/f/placeholder → 0 matches
Buy CTA → /cart/?add-to-cart=${product.id}, same-tab
bad-creds build → exit 1 (HTTP 401 in log)
```

## Remaining manual steps that need your approval

These cannot be automated from inside the repo. Each is a discrete action you decide on.

### A — Create the GitHub remote

The repo has no `origin`. Cloudflare Pages connects to GitHub. Two paths:

1. **You create the repo on GitHub** (private recommended), then locally:
   ```
   git remote add origin git@github.com:<your-handle>/wenu-frontend.git
   git push origin redesign-v2     # I will not run this without approval
   ```
2. Or if you prefer the GitHub CLI:
   ```
   gh repo create wenu-frontend --private --source=. --remote=origin
   ```

I will not push or create the repo without your explicit approval.

### B — Cloudflare access for the preview project

Two paths to choose from. Pick one:

1. **Dashboard route (no terminal credentials needed)** — open https://dash.cloudflare.com/pages, create project `wenu-mapu-redesign` connected to the GitHub repo from step A, branch `redesign-v2`. I can drive your browser via Chrome MCP and walk through the form fields if you log in first; I will pause and ask before submitting.
2. **Wrangler route** — install + auth + use `wrangler pages` from the terminal:
   ```
   npm install -g wrangler          # I will not run this without approval
   wrangler login                   # opens browser, you authenticate
   wrangler pages project create wenu-mapu-redesign --production-branch=redesign-v2
   ```
   This adds a Cloudflare API token to `~/.wrangler/config/default.toml`. I will not run any of these commands without approval.

### C — Cloudflare Pages settings to apply (whichever route you choose)

| Field | Value |
|---|---|
| Project name | `wenu-mapu-redesign` |
| Production branch (in this Pages project) | `redesign-v2` |
| Framework preset | Astro |
| Build command | `npm run build` |
| Output directory | `dist` |
| Root directory | `/` |
| Custom domain | **none yet** — use auto `*.pages.dev` URL |

**Environment variables (Production + Preview):**

| Var | Value | Encrypt |
|---|---|---|
| `NODE_VERSION` | `24.14.1` | no |
| `WC_URL` | `https://www.wenumapuonline.com/wp-json/wc/v3` | no |
| `WC_CONSUMER_KEY` | from local `.env` (you copy it into the dashboard) | yes |
| `WC_CONSUMER_SECRET` | from local `.env` (you copy it into the dashboard) | yes |

I will not type secrets into chat or terminal output. You paste them directly into the encrypted Cloudflare UI. If you choose the Chrome MCP browser-driven path, I will pause the form before the secret fields and let you fill them.

### D — What stays untouched

- `wenumapuonline.com` apex DNS — not modified.
- `aftercare.wenumapuonline.com` — separate track, not touched.
- Cloudflare Tunnel — not modified.
- `main` branch — not modified.
- Any production deploy — not performed.
