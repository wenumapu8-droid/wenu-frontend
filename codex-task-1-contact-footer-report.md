# Codex Task 1 Contact + Footer Report

Date: 2026-05-09

RESULT: success for the allowed Task 1 scope; residual stale contact references remain outside the approved file list.

WHAT CHANGED:
- `src/components/Footer.astro`: changed the footer mailto to `marimari@wenumapuonline.com`, added the Truckee private appointment/free local delivery line, added the canonical phone, and removed the Northbound credit line.
- `src/pages/contact.astro`: changed the channel block to Email, Phone, Instagram, and Online store; removed the WhatsApp card; added private appointment, local delivery, and view-by-appointment wording.
- `src/components/Newsletter.astro`: changed the mailto fallback recipient to `marimari@wenumapuonline.com`.
- `src/i18n/en.json`: updated contact email/phone/Instagram/store values, added appointment/local delivery/view-by-appointment lines, and changed the FAQ intro email from `contact@` to `marimari@`.

WHAT WAS VERIFIED:
- Initial shell recovery checks passed: `echo "shell-ok"`, `pwd`, and `git status --short --branch`.
- `npm run build` first failed under Node 20.18.3 because Astro requires `>=22.12.0`.
- `source ~/.nvm/nvm.sh && nvm use && npm run build` first failed inside the sandbox because DNS resolution for `www.wenumapuonline.com` was blocked.
- The same build command passed after approved network access: 88 pages built, WooCommerce fetched 64 products, postbuild verified 64 product pages.
- Scoped stale-reference search across the four allowed files returned zero matches for `contact@wenumapuonline.com`, legacy phones, Petrolia, Rizoma, Northbound, partner-studio names, WhatsApp, showroom/vitrine/walk-in wording, and studio location wording.
- Canonical scoped search confirmed `marimari@wenumapuonline.com`, `+1 (408) 500-6211`, private appointment wording, local delivery wording, and view-by-appointment wording are present.
- `git status --short -- public/aftercare dist/aftercare src/pages/aftercare public/downloads .env .env.local .env.production` returned no changes.
- No commits, push, deploy, DNS, Cloudflare, Aftercare, WooCommerce writes, forms provider changes, config changes, package changes, or homepage redesign were performed.

RESIDUAL OUT-OF-SCOPE REFERENCES:
- A global `src` search still finds `contact@wenumapuonline.com` outside the allowed files in `src/pages/custom-orders.astro`, `src/pages/stockists.astro`, `src/pages/index.astro`, `src/pages/terms.astro`, `src/pages/privacy.astro`, and `src/pages/accessibility.astro`.
- `src/pages/404.astro` still mentions `WhatsApp` in a blurb.
- These were not edited because they were outside the explicit Task 1 file allowance.

WHAT'S NEXT:
- Approve a follow-up scoped cleanup for the remaining stale contact references outside Task 1.
