---
title: KODEX −∞ · Hostear los 4 packs (bloqueo Job 1)
date: 2026-07-27
status: needs-ocin-action
owner: Ocin
context: kodex-microsite
---

# KODEX −∞ · Hostear los 4 packs

## Estado

Los 4 zips están guardados y a salvo en `/Users/user1/_kodex-packs-hold/`:

- `kodex-achroma.zip` (4.1 MB)
- `kodex-disco-solar.zip` (6.1 MB)
- `kodex-tribe.zip` (5.2 MB)
- `kodex-archive.zip` (12 MB) — el codex completo, 52 láminas

**Total: 27 MB.**

## Por qué esto está bloqueado

- Cloudflare Pages desde esta Mac corta socket con payloads grandes (bug macOS 12.6 + wrangler 4.x). 8 intentos fallidos previos.
- Cloudflare R2 requiere token con permisos R2 — el `CLOUDFLARE_API_TOKEN` actual solo tiene Pages Deploy. `Authentication error [code: 10000]` al listar buckets.
- WordPress Media API rechaza `.zip` por Mod_Security (HTTP 406). Path bloqueado.

## Camino más rápido — Ocin sube por WP admin (5 min)

1. Login `wenumapuonline.com/wp-admin` (user Marimari).
2. Menu izquierdo → **Media → Add New Media File**.
3. Arrastrar los 4 archivos desde `/Users/user1/_kodex-packs-hold/` (o pedírmelos vía Telegram/AirDrop si estás en otro Mac).
4. WP los guarda en `/wp-content/uploads/YYYY/MM/kodex-*.zip` (ó `.zip.txt` renombrado según settings — verificar).
5. Después de subir, en la lista de Media, hacer click en cada uno y copiar la URL:
   - `https://www.wenumapuonline.com/wp-content/uploads/2026/07/kodex-achroma.zip`
   - ... etc

6. **Mandarme las 4 URLs** — yo las cableo en 2 lugares:
   - `src/pages/kodex/store.astro`: array `packs`, propiedad `file`, botón "DOWNLOAD PACK · FREE"
   - Productos WC id 3434/3435/3436/3437: añadir el download real vía PUT

## Si WP rechaza el .zip

WP por default acepta zip. Si no lo hace:
- Instalar plugin `WP Extra File Types` (gratis, 1 click).
- O renombrar a `.wpzip` — pero rompe la extensión y hay que servir con Content-Type manual (más lío).

## Camino alternativo — Cloudflare R2 (10 min si generás token)

1. `dash.cloudflare.com` → **R2 → Create bucket** → nombre `wenu-kodex-packs` → región Automatic → Public bucket = ON.
2. Uploader web: drag & drop los 4 zips a la raíz del bucket.
3. Copiar las 4 URLs públicas: `https://pub-<hash>.r2.dev/kodex-achroma.zip` etc. O configurar custom domain (`kodex.wenumapuonline.com` → R2) si querés dominio propio.
4. Pasarme las 4 URLs.

Alternativa técnica pero requiere abrir dashboard.

## Cuando esté hecho

Yo cableo en 15 min: `store.astro` (revertir botones a DOWNLOAD FREE) + productos WC (añadir downloads reales) + memoria KODEX actualizada.
