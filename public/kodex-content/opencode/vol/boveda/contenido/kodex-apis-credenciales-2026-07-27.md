---
title: KODEX −∞ · APIs & credenciales pendientes (checklist Ocin)
date: 2026-07-27
status: needs-ocin-action
owner: Ocin
context: kodex-microsite
---

# KODEX −∞ · APIs y credenciales pendientes

Todo lo que necesito de vos (Ocin) para dejar KODEX 100% cableado. Ordenado por bloqueo/impacto.

**Convención:** cuando me pases una credencial, guárdela con `security add-generic-password -s <name> -a <acct> -w "<valor>"` — NO al vault. Yo la leo de Keychain vía `security find-generic-password -s <name> -a <acct> -w`.

---

## 1. Cloudflare — token con permisos R2 (para hostear packs)

**Bloquea:** Job 1 (los 4 zips de packs). Alternativa: subida manual por WP admin Media (más rápido pero manual cada vez).

**Cómo generar:**
1. `dash.cloudflare.com` → **My Profile → API Tokens → Create Token**.
2. Template: **Custom Token**.
3. Permissions:
   - `Account · Cloudflare Pages · Edit` (mantener)
   - `Account · Workers R2 Storage · Edit` (nuevo)
   - `Account · Account Settings · Read`
4. Account Resources: `Include · Wenu.mapu8@gmail.com's Account` (68d502a80b1badf06df7795aeb91d96c).
5. TTL: sin expiración.
6. Continue → Create Token → **copiar el token una sola vez**.
7. Guardar:
   ```bash
   security add-generic-password -s cloudflare-token-r2 -a wenu -w "PEGAR_TOKEN_ACA"
   ```
8. Actualizar `.env` (línea `CLOUDFLARE_API_TOKEN=`) también, para que wrangler lo tome.

**Después de esto:** yo creo bucket `wenu-kodex-packs`, subo los 4 zips, hago custom domain `kodex-assets.wenumapuonline.com` (opcional).

**Alternativa sin generar token:** subir por WP admin Media (5 min, ver `kodex-packs-hosting-2026-07-27.md`).

---

## 2. Printful — cuenta + OAuth WC (para prints/tees/stickers)

**Bloquea:** Job 4 (Prints/Tees/Stickers en /kodex/store).

**Cómo:**
1. `printful.com/auth/register` con `marimari@wenumapuonline.com`.
2. Billing → añadir método de pago (Visa/PayPal — Printful cobra por orden fulfilled).
3. `Stores → Add store → WooCommerce → wenumapuonline.com` → OAuth flow → aprobar en WP admin.
4. Verificar tienda como "Connected".
5. **Pasarme:** confirmación de que está conectada + email de la cuenta Printful.

**Después de esto:** yo guío la creación de los primeros 3 productos (ver `kodex-printful-guide-2026-07-27.md`) o los creo por API si generás el token:
```
Printful dashboard → Developers → Create new API key → scope Products/Orders/Files
security add-generic-password -s printful-api -a wenu -w "PEGAR"
```

---

## 3. Pinterest — cuenta business + verificación dominio

**Bloquea:** Job 3 (SEO orgánico, objetivo #1).

**Cómo (10 min):**
1. `pinterest.com/business/create` → nombre `Wenu Mapu KODEX` → email `marimari@`.
2. Settings → Claim → Websites → añadir `wenumapuonline.com` → método HTML tag.
3. Copiar el meta tag que Pinterest te da (algo tipo `<meta name="p:domain_verify" content="XXXXXX"/>`).
4. **Pasarme el content del meta tag** — yo lo cablo en `src/layouts/Base.astro` o `KodexShell.astro`.
5. Verificar en Pinterest.

**Después:** vos pineás con el kit (`kodex-pinterest-kit-2026-07-27.md`).

**Opcional (más adelante):** generar Pinterest API access token para automatizar:
```
developers.pinterest.com → My Apps → Create App → OAuth 2.0 → scopes boards:read + pins:write
```

---

## 4. NFT chain — decisión de plataforma

**Bloquea:** Producto WC 3438 (NFT placeholder) para volverlo real.

**Recomiendo Foundation** (`foundation.app`) — cuidado curatorial + comunidad art-first, mejor fit KODEX que OpenSea (spam) o Zora (más web3-native, menos art-market).

**Alternativas:**
- **Manifold** (`manifold.xyz`) — contract propio, cuidado editorial, edición limitada. Excelente para KODEX.
- **Zora** (Base chain, gas barato).
- **Foundation** (Ethereum mainnet, gas más caro pero prestige).

**Cómo:**
1. Elegir plataforma (te recomiendo Manifold para KODEX — es lo más cerca del "signed on-chain edition").
2. Conectar wallet (Rainbow / MetaMask). Si no tenés wallet, `rainbow.me` o `metamask.io` — te ayudo a setup.
3. **Pasarme:** wallet address + plataforma elegida + qué obra vas a mintear primero.

**Después:** yo cablo en `/kodex/store.astro` los links reales al listing NFT y publico el producto 3438 con precio en USD equivalente (opcional venta fiat via WC → yo minteo y transfiero).

---

## 5. Cloudflare Pages — verificar deploy actual

**No bloquea nada — es para health-check.**

**Cómo:**
1. `dash.cloudflare.com → Pages → wenu-frontend → Deployments`.
2. Verificar que la última deployment está en `redesign-v2` y sirve `wenumapuonline.com`.
3. Screenshot o compartir link.

Yo puedo confirmar por wrangler cuando tengas el token con permisos Pages (que ya tenés).

---

## 6. Google Search Console (opcional, para SEO)

**Cómo:**
1. `search.google.com/search-console` → Add property → `wenumapuonline.com`.
2. Verificación DNS o HTML tag.
3. Submit sitemap `https://wenumapuonline.com/sitemap-index.xml` (ya existe).

Aumenta descubrimiento de `/kodex/*` en Google.

---

## Resumen de qué necesito de vos, en orden

| # | Cosa | Tiempo | Bloqueo |
|---|------|--------|---------|
| 1 | Subir 4 zips por WP admin Media (o token R2) | 5 min | Job 1 packs |
| 2 | Meta tag Pinterest para verificar dominio | 2 min | Job 3 |
| 3 | Cuenta Printful + OAuth WC connect | 15 min | Job 4 |
| 4 | Plataforma NFT elegida + wallet address | 30 min (1a vez) | Producto NFT |
| 5 | Screenshot/confirmar deploy Pages activo | 2 min | health |
| 6 | (Opcional) Google Search Console | 5 min | SEO extra |

**Total ~1 hora tuya para desbloquear TODO KODEX.**

Cuando tengas cada cosa, pasámela por acá y cierro el loop en < 30 min por item.
