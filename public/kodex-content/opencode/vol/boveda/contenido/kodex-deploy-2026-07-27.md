---
title: KODEX −∞ · Deploy 2026-07-27 (filtro woo.ts + store wire)
date: 2026-07-27
status: deploying
owner: Claude Code
context: kodex-microsite
---

# KODEX −∞ · Deploy log 2026-07-27

## Cambios que van en este deploy

1. **`src/lib/woo.ts`** — filtro categoría `kodex` en 3 puntos + `getKodexProducts()` helper.
2. **`src/pages/kodex/store.astro`** — sección packs dinámica con estado WC (SOON/DOWNLOAD/BUY).
3. **`scripts/kodex-wire-packs.mjs`** — nuevo, cablea packs post-hosting.

## Stash de drift Cowork

Antes de deploy: `git stash push -u --keep-index -m "cowork drift 2026-07-27"` — 58 archivos (Cart/Nav/HeroCarousel/journal/scripts/etc.). Se restauran con `git stash pop` post-deploy.

## Verify pre-deploy (build local)

- 174 productos en `dist/p/` ✅
- 0 kodex leaks en `dist/shop/index.html` ✅
- 0 kodex leaks en `dist/search-index.json` ✅
- `dist/kodex/store/index.html` muestra 4 packs con precios reales de WC ($18/$18/$18/$49) y SOON ✅

## Post-deploy checklist

Cuando `deploy-now.sh` termine exit 0:

1. Verificar en `wenumapuonline.com/shop` — no aparecen slugs `kodex-*`.
2. Verificar en `wenumapuonline.com/kodex/store` — se ven los 4 packs con precios y SOON.
3. Verificar en `wenumapuonline.com/p/kodex-pack-achroma` — debe ser 404 (getProduct devuelve null).
4. Forzar refresh (Cmd+Shift+R) para bypass caché Cloudflare.
5. `git stash pop` para restaurar drift Cowork.
6. Commit los 3 archivos míos con mensaje descriptivo.

## Commit message preparado

```
KODEX: WC commerce lane wired — category filter + kodex-only helper + store product state

- src/lib/woo.ts: exclude category slug 'kodex' from getProducts/getProduct/getCategories
  so KODEX products never leak into /shop, PDPs, search-index or category listings.
  New getKodexProducts() fetches only category 485 (includes drafts) for /kodex/store.
- src/pages/kodex/store.astro: dynamic pack cards. Each pack looks up its WC product
  by slug (kodex-pack-achroma/disco-solar/tribe-space/archive) and renders one of:
  DOWNLOAD PACK · $price (publish + downloadable), BUY PACK · $price (publish),
  FULL PACK · SOON (draft). WC prices show in the pack header.
- scripts/kodex-wire-packs.mjs: post-hosting script — validates 4 zip URLs, backs up
  current WC state, PUTs downloads into products 3434-3437. Supports --dry-run,
  --skip-wc, --publish, --force.

Ocin pending: host 4 zips (WP admin Media or R2), Pinterest verify tag, Printful
OAuth + first 3 products, NFT platform + wallet. Full checklist in
Obsidian/WenuAgent/contenido/kodex-apis-credenciales-2026-07-27.md.
```
