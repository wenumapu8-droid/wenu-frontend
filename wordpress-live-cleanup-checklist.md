# WordPress / WooCommerce Live Site — Cleanup Checklist

Date: 2026-05-10 (CEO night)
Scope: exact owner-action checklist for the legacy public WP/WC site at `https://www.wenumapuonline.com`. Owner-only — Claude does not log into WP, does not edit live, does not change DNS or Cloudflare.

This list translates findings from `live-site-audit-wenumapuonline.md` into discrete admin steps the owner can complete in a single sitting (~60–90 min total).

⚠️ **Status preservation rule:** for products/pages flagged as bad, change status to **Draft** — DO NOT delete. Preserves data + recoverable.

---

## 0. Before you start

- [ ] Take a fresh full backup of the site (UpdraftPlus / All-in-One WP Migration / cPanel backup). Cost: 5 min. Lets you roll back any of the changes below if something breaks.
- [ ] Note the WP admin URL and current admin user.
- [ ] Open this checklist in a separate window for reference.

---

## 1. P0 — Footer (visible on every page)

| # | Action | Where | Effort | Risk |
|---|---|---|---|---|
| 1.1 | Replace footer address line | WP Dashboard → Appearance → Customize → Footer (or Elementor → Theme builder → Footer template) | 5 min | Low |
| 1.2 | Replace footer phone | same | 2 min | Low |
| 1.3 | Replace footer email | same | 2 min | Low |
| 1.4 | Remove "Diseñado por Rizoma Digital" credit | same | 2 min | Low |

### Exact replacement copy

**Address (REPLACE the Petrolia line):**

```
Truckee, California — private appointments + free local delivery in the Truckee / North Lake Tahoe area.
```

**Phone (REPLACE the +145… line):**

```
Phone: +1 (408) 500-6211
```

**Email (REPLACE any contact@ / Cloudflare-obfuscated email):**

```
Email: marimari@wenumapuonline.com
```

**Credit line:** REMOVE "Diseñado por Rizoma Digital" entirely. Do not replace with anything (or use "© 2026 Wenu Mapu SpA · Truckee, CA · wenumapuonline.com" and keep it minimal).

### After saving

- [ ] Open `https://www.wenumapuonline.com/` in an incognito window. Confirm footer shows the new copy on at least 3 different pages (home, a category, a product).
- [ ] If using a caching plugin (WP Rocket / W3 Total Cache), purge the cache after edits.

---

## 2. P0 — Test products (visible on the homepage product loop)

| # | Action | Where | Effort | Risk |
|---|---|---|---|---|
| 2.1 | Find product `producto prueba`, change status to Draft | WP → Products → All Products → search "prueba" | 2 min | Low (status change only — does NOT delete) |
| 2.2 | Find product `Pronto`, change status to Draft | WP → Products → search "Pronto" | 2 min | Low |
| 2.3 | Find any product with a placeholder name like `Aonik` (suspected draft-leak) | WP → Products → search "Aonik" | 3 min | Verify it's a placeholder before drafting; if it's a real product name, leave alone |
| 2.4 | Spot-check the homepage product loop for any other test/placeholder products | Visit `https://www.wenumapuonline.com/` | 5 min | Read-only inspection |

**Important:** use **Quick Edit → Status: Draft → Update**. This removes the product from public view but preserves all data, images, variations, and history. NEVER click "Move to Trash" without explicit owner reason.

### After saving

- [ ] Refresh the homepage in incognito. Confirm `producto prueba` and `Pronto` are no longer visible in any product loop.
- [ ] Search the WC catalogue front-end for "prueba" — should return zero results.

---

## 3. P0 — Mixed-language UI strings

WC ships with localized strings; the site is set to Spanish (`<html lang="es">`) but content is mostly English. Quick fix in two layers:

| # | Action | Where | Effort | Risk |
|---|---|---|---|---|
| 3.1 | Set Site Language to English (United States) | WP → Settings → General → Site Language | 2 min | Low — affects only UI labels, not content |
| 3.2 | Set WC currency to USD ($) — verify currency code = USD, position = left, decimal = . | WP → WooCommerce → Settings → General | 2 min | Low |
| 3.3 | (Optional) Install **Loco Translate** plugin to override any remaining Spanish strings without changing site language | WP → Plugins → Add New → "Loco Translate" → Activate | 10 min | Medium — plugin install; test on a non-critical page first |
| 3.4 | If Loco Translate installed: override these strings to English: `Cesta` → `Cart`, `Añadir` → `Add to cart`, `Leer más` → `Read more`, `Descartar` → `Dismiss`, `Diseñado por` → `Designed by` (or remove), `Fono` → `Phone`, `No hay productos en la cesta` → `No products in the cart` | Loco Translate → WooCommerce → Edit translations | 20 min | Low |

### After saving

- [ ] Refresh several pages in incognito + a different browser. Verify cart label is "Cart," ATC button says "Add to cart," "Read more" replaces "Leer más" on the homepage product loop.
- [ ] Test adding a product to cart — flow should be entirely English.

⚠️ If switching site language breaks any existing layout (rare), revert and use Loco Translate path only.

---

## 4. P1 — SEO basics

| # | Action | Where | Effort | Risk |
|---|---|---|---|---|
| 4.1 | Install Yoast SEO **OR** RankMath (one or the other; not both) | WP → Plugins → Add New | 5 min | Low |
| 4.2 | Run the plugin's Setup Wizard | within the plugin | 10 min | Low |
| 4.3 | Set homepage `<title>` and meta description | Yoast/RankMath → Search Appearance → Front page | 5 min | Low |
| 4.4 | Set per-product templates: `%Product name% — %Material% \| Wenu Mapu` for `<title>`; meta = first 150 chars of short description | Yoast/RankMath → Search Appearance → Content types → Product | 10 min | Low |
| 4.5 | Enable Schema.org Product markup (Yoast SEO Premium / RankMath free both have this) | plugin settings | 5 min | Low |
| 4.6 | Set Open Graph defaults (image = a brand banner; title = "Wenu Mapu — Adornment for the sacred body") | plugin → Social | 5 min | Low |
| 4.7 | Generate sitemap.xml (auto with Yoast/RankMath) and submit to Google Search Console | plugin + GSC | 15 min | Low |
| 4.8 | Disable WP version generator meta tag | Yoast → Tools / RankMath → General → settings | 2 min | Low (security hygiene) |

### Recommended copy

**Homepage `<title>`:**
```
Wenu Mapu — Adornment for the sacred body
```

**Homepage meta:**
```
Hand-forged ritual body jewelry from Truckee, California. Implant-grade titanium, sterling silver, 14k gold, Atacama meteorite. Custom commissions accepted.
```

**Per-product `<title>` template:**
```
%Product name% — Wenu Mapu Body Jewelry
```

**Per-product meta template:**
```
%Excerpt% — hand-forged in Truckee, California.
```

### After saving

- [ ] View page source on the homepage and on one product page. Confirm `<title>` and `<meta name="description">` show the new values.
- [ ] Run the homepage URL through https://search.google.com/test/rich-results to verify schema is detected.

---

## 5. P1 — Apex domain 502

The apex `wenumapuonline.com` (without `www.`) returns Cloudflare 502 because the Cloudflare Tunnel routes apex → `localhost:4321` (Astro dev server, which isn't always running).

⚠️ **DNS / Cloudflare changes are owner-only and HIGH BLAST RADIUS.** See `cloudflared-local-managed-migration-plan.md` before changing anything in the tunnel.

Two safe options:

### Option A — Simple 301 from apex to www (LOWEST risk)

In Cloudflare dashboard → wenumapuonline.com → **Rules → Redirect Rules → Create rule**:

- Rule name: `apex-to-www`
- When incoming requests match: `Hostname equals wenumapuonline.com`
- Then: `Static` → `Type: 301` → `URL: https://www.wenumapuonline.com${request.uri}`
- Save + Deploy

This makes `wenumapuonline.com` → `www.wenumapuonline.com` at the Cloudflare edge, BEFORE the tunnel is consulted. The 502 disappears.

### Option B — Change the tunnel ingress for apex

In Cloudflare dashboard → Zero Trust → Networks → Tunnels → Wenuos tunnel → Public Hostnames → edit the apex entry → change service from `http://localhost:4321` to whatever the legacy WP origin URL is.

⚠️ This has a 3-hostname blast radius (per `cloudflared-local-managed-migration-plan.md`). Don't do this without re-reading that plan first.

**Recommendation: Option A.** It's reversible, doesn't touch the tunnel, and immediately closes the user-facing 502.

### After applying Option A

- [ ] In incognito: `curl -s -o /dev/null -w "%{http_code}\n" https://wenumapuonline.com/` → should return `301`
- [ ] In a browser, type `wenumapuonline.com` (no www) → should land on `https://www.wenumapuonline.com/` and render the homepage normally.

---

## 6. P1 — Slug cleanup (migration cruft)

The current site has `/contact-2/` and `/about-3/` slugs (Yoast/WP appended `-2/-3` after old pages were deleted). Cleanup:

| # | Action | Where | Effort | Risk |
|---|---|---|---|---|
| 6.1 | Verify the canonical slugs SHOULD be `/contact/` and `/about/` | check what links to which | 5 min | Low |
| 6.2 | If a "Contact" or "About" page exists at `/contact/` or `/about/` (now empty / draft) — delete it (NOT the live one) | WP → Pages | 5 min | Medium — be very careful which page you're deleting |
| 6.3 | Edit the live Contact page → change Permalink from `/contact-2/` to `/contact/` | WP → Pages → Contact → Permalink | 2 min | Low |
| 6.4 | Repeat for About | same | 2 min | Low |
| 6.5 | Add 301 redirects for the old `/contact-2/` → `/contact/` and `/about-3/` → `/about/` (Yoast Premium has Redirections; RankMath has built-in; or use the Redirection plugin free) | plugin | 10 min | Low |

### After saving

- [ ] In incognito: visit `/contact-2/` → should 301 to `/contact/`
- [ ] Visit `/contact/` → should render the Contact page (not 404)
- [ ] Same for `/about-3/` → `/about/`

---

## 7. P1 — Aftercare slug

Current: `/aftercare-guide-cuidado-posterior/` (mixed-language). Returns 200 via 301 from `/aftercare`.

| # | Action | Where | Effort | Risk |
|---|---|---|---|---|
| 7.1 | Edit the Aftercare page → change Permalink from `/aftercare-guide-cuidado-posterior/` to `/aftercare/` | WP → Pages → Aftercare → Permalink | 2 min | Low |
| 7.2 | Add 301 from old slug to new (with Redirection plugin) | plugin | 5 min | Low |

After saving: confirm `/aftercare/` resolves directly + old slug 301s.

⚠️ Per `agent-control/DO_NOT_TOUCH.md`: do NOT modify the aftercare page CONTENT. Only the slug + a 301.

---

## 8. P2 — Contact page body cleanup

Per `wenu-contact-and-operations-plan.md` §3 + `wenu-english-copy-pack-v1.md` §10, the live Contact page should mirror the canonical block:

- [ ] Email → `marimari@wenumapuonline.com`
- [ ] Phone → `+1 (408) 500-6211`
- [ ] Instagram → `@wenu__mapu`
- [ ] Online store → `wenumapuonline.com`
- [ ] **Remove WhatsApp block** (no business number confirmed)
- [ ] **Remove "Showroom at home" line** (replace with the appointment-only wording)
- [ ] Add the 3 prescribed wordings at the bottom:
  - Private appointments available in the Truckee / North Lake Tahoe area.
  - Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas.
  - Selected pieces may be viewed by appointment.

Effort: 15 min.
Risk: Low.

---

## 9. P2 — Recommended plugins (small, focused additions)

| Plugin | Purpose | Why |
|---|---|---|
| **Yoast SEO** OR **RankMath** | SEO + schema + sitemap | Closes the SEO gap |
| **Loco Translate** | Override individual UI strings | Removes Spanish leakage |
| **Redirection** | Manage 301 redirects | Cleans up migration slugs |
| **WP Rocket** OR **W3 Total Cache** | Page caching | Speeds up Bridge theme |
| **WP Mail SMTP** | Reliable transactional email | Ensures order confirmations actually deliver |

⚠️ Install ONE plugin at a time, test the front-end after each install, deactivate (don't delete) if anything breaks. Bridge theme + Slider Revolution + Elementor + WC is a heavy stack — every plugin added has interaction risk.

---

## 10. P3 — Plugins / theme to consider removing later (not now)

Out of scope for tonight; bookmark for future:

- **Slider Revolution** — auto-rotating hero is an anti-pattern for premium niche brands. Replace with a static hero in the next theme refresh.
- **Bridge theme** — generic ca. 2018. The Astro redesign is the path forward; once Pages preview cutover is decided, the legacy theme retires.
- **YITH Cookie / YITH Catalog** — review if still needed; YITH plugins are heavy.
- **Elementor** — keep until cutover; do not invest more time in Elementor templates.

Owner approval required for any of these. Discuss separately.

---

## 11. What you should NOT touch tonight

Per `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md`:

- ❌ Do not delete WordPress posts, pages, or products. Status changes to Draft only.
- ❌ Do not call WC write endpoints via the REST API.
- ❌ Do not modify the Cloudflare Tunnel without the migration plan open.
- ❌ Do not rotate the WC REST API keys (build environments depend on them).
- ❌ Do not change apex DNS records beyond the Option A 301 above.
- ❌ Do not delete the old phone/address — they leave a paper trail; replacing is enough.
- ❌ Do not modify the Aftercare page CONTENT (slug change is OK; body content is off-limits).
- ❌ Do not modify checkout / payment gateway settings.
- ❌ Do not change the WC product slug pattern from `/producto/` to `/product/` tonight (it requires careful 301 mapping for SEO; do in a separate session).

---

## 12. After the full cleanup — verification snapshot

Run these in incognito + spot-check on a phone:

- [ ] Apex `wenumapuonline.com` → 301 to www → renders the homepage (no 502)
- [ ] Footer shows: Truckee CA appointment line, marimari@, +1 (408), no Petrolia, no Rizoma
- [ ] Homepage product loop has zero placeholder products (no producto prueba, no Pronto)
- [ ] ATC button reads "Add to cart" (not "Añadir")
- [ ] Cart page reads "Cart" (not "Cesta")
- [ ] Tile CTAs read "Read more" (not "Leer más")
- [ ] `/contact/` resolves directly and shows: marimari@, +1 (408), @wenu__mapu, no WhatsApp, no Showroom
- [ ] `/contact-2/` 301s to `/contact/`
- [ ] `/about-3/` 301s to `/about/`
- [ ] `/aftercare/` resolves directly
- [ ] View page source: `<title>` and `<meta name="description">` are populated on home + at least one product
- [ ] Google Rich Results test on homepage shows valid Organization / WebSite schema

Total time: ~60–90 minutes if done in one sitting.

---

## 13. Communication after cleanup

- [ ] Post one Instagram story announcing the website refresh (optional, low key).
- [ ] Send The Wenu Mapu List (when wired) a "we're back" email — short, the maker's voice, no marketing claims.
- [ ] Update the Astro side `aftercare-readiness-report.md` if the legacy aftercare slug changed (so the Astro Aftercare deploy uses the right path reference).

---

## 14. Rollback plan

If anything breaks:

1. Restore the backup from §0.
2. Open the WP error log (`/wp-content/debug.log` or `/error_log` at site root) and read the most recent error.
3. Deactivate any plugin installed in this session, one at a time.
4. Reactivate the legacy footer copy if needed; the canonical copy can wait a day.

⚠️ The most likely break point is plugin installation (Yoast vs RankMath conflicts, Loco Translate vs theme conflicts). Install + test one at a time.

---

## 15. Out of scope tonight

- Custom theme development for the legacy site
- WC catalogue restructuring (3-axis nav)
- Migration to a new WP host
- Migration off WP entirely (Pages cutover is a separate decision)
- Reviews import / setup
- Affiliate / loyalty plugins
- Multi-currency / multi-language plugins

---

## 16. Consolidated search-and-destroy regex

Run this single command from your terminal AFTER all sections are applied. Returns 0 hits = clean. Any hit means a forbidden string still leaks publicly.

```bash
curl -sL https://www.wenumapuonline.com/ \
  | grep -ciE "petrolia|sherman rd|rizoma digital|showroom at home|vitrine|walk-?in|truth tattoo|troll studio|lucky7|thrue tattoo|\+145 ?8226|\+1 \(458\) 226-6027|contact@wenumapuonline\.com|contacto@wenumapuonline\.com|wenu\.mapu8@gmail\.com|diseñado por|fono:|cesta|añadir|leer más|descartar|producto prueba"
# expected: 0
```

Repeat against `/contact/`, `/about/`, `/cart/`, and any active category page:

```bash
for url in / /contact/ /about/ /cart/; do
  hits=$(curl -sL "https://www.wenumapuonline.com${url}" \
    | grep -ciE "petrolia|rizoma|sherman rd|\+145|showroom at home|truth tattoo|troll|lucky7|contact@wenumapuonline|cesta|añadir|leer más|fono")
  printf "%-15s %s\n" "$url" "$hits"
done
# expected: 0 across the board
```

If any URL > 0, return to the relevant section above (footer, language, slug, contact body) and repeat.

---

## 17. Owner sign-off

Fill in after completion (paste this block into the operations folder once done):

```
Date executed:        ____-__-__
Operator:             _______________________
Time spent:           ____ min
Backups verified:     [ ] DB  [ ] Uploads
Sections completed:
  [ ] §1 Footer
  [ ] §2 Test products
  [ ] §3 Language strings
  [ ] §4 SEO basics
  [ ] §5 Apex 502 (Option A 301)
  [ ] §6 Slug cleanup
  [ ] §7 Aftercare slug
  [ ] §8 Contact body
  [ ] §9 Plugins (only those needed)
Verification:
  [ ] §12 snapshot all green
  [ ] §16 search-and-destroy returns 0 hits
Issues encountered:   _______________________________________________________
                      _______________________________________________________
Cloudflare cache:     [ ] purged  [ ] not needed
```

Once signed off, this checklist closes. Future hygiene cycles open a new dated checklist.

---

## 18. References

- `~/wenu-frontend/live-site-audit-wenumapuonline.md` (audit input — FIX-1..FIX-10)
- `~/wenu-frontend/wenu-contact-and-operations-plan.md` §1, §2, §3 (canonical contact + footer + Contact page)
- `~/wenu-frontend/wenu-english-copy-pack-v1.md` (paste-ready English copy)
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` (binding blocklist)
- `~/wenu-frontend/cloudflared-local-managed-migration-plan.md` (apex 502 / Tunnel — separate track)
- Brand voice: `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md`
