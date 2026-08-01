# KODEX −∞ · elevation changelog

Serialized stage-by-stage build log per `KODEX-BUILD.md`. Each entry: what changed, provenance (codeado / build OK / desplegado / verificado en vivo), and captures.

---

## 2026-07-28 · Stage 1 + 2 — SVG pack + fonts

**Codeado**
- Reconciled `public/assets/kodex/kodex-tokens.css` to INTERFACE DNA:
  - `--kdx-off-white` → `--kdx-dust-white` (#E6E6E6 → #EDEDED)
  - `--kdx-lime` → `--kdx-acid` (#A6FF00 → #B7FF00)
  - `--kdx-violet` (#8A5CFF → #B770FF)
  - `--kdx-orange` (#FF6A00 → #FF8A33)
  - `--kdx-red` (#FF3038 → #FF3B33)
  - Added `--kdx-muted #88888A`, `--kdx-line rgba(237,237,237,.15)`
  - Legacy aliases preserved (`--kdx-lime`, `--kdx-off-white` → new tokens) so nothing breaks.
- Reconciled the same 5 hex values inside `public/assets/kodex/kodex-sprite.svg`
  (root `style="color:…"` + internal `<style>` block). External `<use>` needs
  the sprite to carry canonical colors, since Shadow DOM blocks parent CSS.
- `src/layouts/KodexShell.astro`:
  - Linked `/assets/kodex/kodex-tokens.css` so KODEX pages have INTERFACE DNA vars.
  - Added Google Fonts variable for Archivo (wdth 125, wght 600–800) —
    KODEX SANS headers use Archivo Expanded now; Space Grotesk stays for UI.
  - Replaced text wordmark `<p>KODEX<span>−∞</span></p>` in menu with
    `<svg><use href="/assets/kodex/kodex-sprite.svg#kdx-logo"/></svg>` +
    sr-only text fallback. New `.kxm-mark__svg` sizes to `min(64vw,340px)`.
  - Extended display font-family stack to include `Archivo` first,
    `font-stretch:125%` for expanded look.

**Guardrails respetados**
- Only `KodexShell.astro`, `kodex-tokens.css`, `kodex-sprite.svg` touched.
  Jewelry side (`Base.astro`, `Nav.astro`, `global.css`, shop pages) untouched.
- `deploy-now.sh` enforces `verify-build` (products=174, home/shop/gallery).
- Sprite kept — no rebuild, just token reconciliation.

**Ampliación (mismo stage)**
- Descubierto en verificación: `/kodex/` (index) y `/kodex/folio/*` usan
  `KodexChrome.astro` + `src/styles/kodex.css`, NO `KodexShell.astro`.
  KodexShell cubre `/store /works /return /work/[id] /world /movement`.
- Aplicado a `src/styles/kodex.css`: `@import` de `kodex-tokens.css` +
  Google Fonts Archivo.
- `src/components/KodexChrome.astro`: mismo swap wordmark→SVG use (con sr-only).
  `.kx-word` re-styled a inline-flex + `.kx-word__svg { height:20px }`
  (mantiene la altura del wordmark previo de 23px Instrument Serif).

**Deferred (follow-up)**
- Migrate Space Grotesk + Archivo from Google Fonts links to `@fontsource`
  self-host (per brief §5 "self-host @fontsource"). Needs `npm install`.
- Add Departure Mono (OFL) via `@fontsource` for MACHINE readouts. Meanwhile
  MACHINE uses JetBrains Mono (already installed).
- Update the 10 individual SVG files in the pack (they use `currentColor`
  already, but their in-file preview colors still show legacy hex).

**Build + deploy**
- (pending — this section fills in once `deploy-now.sh` returns)

**Verificado en vivo** (deploy #2 · `ef65545b.wenu-frontend.pages.dev`)
- `/kodex/` header top-left ahora es SVG wordmark (antes Instrument Serif texto).
- Fonts cargados: Archivo (variable, wdth 125) + Space Grotesk (JS `document.fonts` = true para ambos).
- Tokens vivos: `--kdx-dust-white` = `#EDEDED`, `--kdx-acid` = `#B7FF00`, `--kdx-violet` = `#B770FF`.
- `verify-build` OK: 174 productos preservados (jewelry intacta).

---

## 2026-07-28 · Stage 3 — 7 scenes ordering (INDEX overlay + progress + deep-link)

**Codeado**
- `src/lib/kodexScenes.js`: fuente única de las 7 escenas (00 THRESHOLD → 06 RETURN)
  con `index / code / subtitle / accent / accentHex / motif / lede / cta / href / hash`
  + `tagline` "YOU ARE THE SIGNAL. THE ARCHIVE REMEMBERS." + helper `findSceneByPath`.
- `src/components/KodexIndexOverlay.astro`: overlay full-screen listando las 7
  escenas como tarjetas (numero + code + subtitle + lede + CTA). Marca `is-current`
  la escena activa. Trigger `[data-kdx-index-open]` · Escape · click fondo · focus trap.
  Hash router: `/kodex/#index` abre el overlay, `/kodex/#threshold|#prologue|…` navega.
- `src/components/KodexChrome.astro`: importa `KodexIndexOverlay` + `findSceneByPath`.
  Astro-HUD ahora muestra `00/07 THRESHOLD` (o el que toque) según `Astro.url.pathname`
  y aplica el accent color de esa escena vía `--kdx-scene-accent` custom-property.
  El `◉ INDEX` del deckbar cambió de `<a href="/kodex/#index">` a `<button
  data-kdx-index-open>`. Style ajustada (background:none, border:0) para que no
  herede la caja del `.kx-deckbar button` genérico.

**Preservado**
- Engine `kodex-engine.js` intacto (ya tenía ArrowLeft/Right para nav, Escape para
  cerrar viewer/gallery).
- Copy de folios existente sin tocar (RETURN se preserva por ser fuerte, per brief).
- Deep-linking mantiene URLs canónicas `/kodex/folio/i..vi/` (mejor SEO que hashes),
  con hashes como aliases.

**Deferred (stage 3+)**
- Copy on-screen de folios: alinear a §3 storyboard (frase por frase) → requiere
  aprobación de Ocin porque cambia narrativa existente.
- Poner el mismo `KodexIndexOverlay` en `KodexShell.astro` (companion pages
  /store /works /return) — no crítico; su menú actual ya cubre navegación.

---

## 2026-07-28 · Stage 4 — Commission a System

**Codeado**
- `src/components/kodex/CommissionForm.astro`: overlay `[data-kdx-commission]`
  con copy autoritativo del brief §7. Fields: type, industry, objective, budget,
  timeline, use, name, email, refs. Botón `REQUEST A SYSTEM →`. Envío v1 vía
  `mailto:marimari@wenumapuonline.com` con subject/body pre-formateado.
- `KodexChrome.astro`: importa + renderiza `<CommissionForm />`, agrega botón
  `◆ COMMISSION` al deckbar junto al `◉ INDEX`.

**Deferred**
- Upgrade `mailto:` → POST `${API_BASE}/kodex/commission` cuando el backend
  wenu-platform exponga el handler (necesita trabajo del lado servidor).
- No precios públicos (brief §7: "recomendación interna, NO públicos sin aprobar").

**Verificado en vivo** (deploy #4 · `4fc81714.wenu-frontend.pages.dev`)
- Botón COMMISSION en deckbar visible.
- Overlay abre con click, 11 fields renderizados, submit text correcto.
- Archivo Expanded en título, acid green eyebrow, dust-white body.

---

## 2026-07-28 · Stage 5 — MACHINE real states

**Codeado**
- `src/pages/kodex/folio/[folio].astro` (folio IV MACHINE):
  - Eliminado el fake `00 FPS`; shader status ahora usa `<b class="kdx-status">
    INITIALIZING</b>` con transición a `READY`/`ERROR`/`NO WEBGL` (mapeado a
    color semántico por `data-kdx-status`).
  - Atelier panel agrega readout `KDX-GEN-XXXX · SEED XXXX-XXXX · METHOD
    X/Y/Z · SOURCE XXX · STATUS X` (elementos con `data-atelier-{id,seed,
    method,source,status}`).
  - CTA renombrada `◇ LET IT MAKE ANOTHER` → `◇ GENERATE SIGNAL`.
- `src/scripts/kodex-engine.js`:
  - Atelier: agregado `setStatus()` helper, `seedStr()` (hex XXXX-XXXX),
    `codeFromSrc()` (ACHROMA-03 / TRIBE-XX / DISCO-XX según ruta).
  - Boot state = READY; al llamar `makeWork()` → GENERATING; onload → COMPLETE
    (o REDUCED si `prefers-reduced-motion`); onerror → ERROR.
  - Shader lab: `COMPILED OK` → `READY` (data-kdx-status="ready"),
    `ERROR` → `data-kdx-status="error"`, `NO WEBGL` → `data-kdx-status="reduced"`.
- `src/styles/kodex.css`: agregado `.kdx-status` chip semántico
  (initializing / ready / generating / complete / error / reduced) + `.kdx-readout`
  format (mono, uppercase, ID+SEED en dust-white).

**Verificado en vivo** (deploy #5 · `ab704f3c.wenu-frontend.pages.dev/kodex/folio/iv/`)
- Shader: `READY · ready` (chip cyan).
- Atelier post-click: `KDX-GEN-1001 · SEED F8CD-0DF3 · METHOD DITHER/PIXEL SORT/GLITCH/CHROMA · SOURCE ACHROMA-15 · STATUS COMPLETE`.
- Match exacto al spec §3 del brief.

---

## 2026-07-28 · Stage 6 — COSMOLOGY map (ecosystem portals)

**Codeado**
- `src/components/kodex/CosmologyMap.astro`: SVG 500x500 con 6 nodos concepto
  (SIGNAL/MATTER/BODY/MEMORY/TERRITORY/MACHINE) en hexágono orbitando KODEX∞ (centro).
  Hover un nodo → pulsa organ correspondiente (Signal↔Machine, Matter/Body↔Wenu
  Mapu, Memory↔Cosmic Serpent, Territory↔Soma, Machine↔Practice).
- Portals a la derecha del mapa: Wenu Mapu (`/`), Soma/Disco Solar/Cosmic
  Serpent (mailto: hasta que existan), Practice (`/kodex/`).
- Insertado como nueva slide al final de folio V (`/kodex/folio/v/`), después
  del flow-field. Triad + doctrine + principles + geometría existentes preservados.

**Deferred**
- Reemplazar `mailto:` de Soma/Disco/Serpent por URLs reales cuando existan.

**Verificado en vivo** (deploy #6 · `f6c1c9c5.wenu-frontend.pages.dev/kodex/folio/v/`)
- curl confirma render: `kdx-cosmo`, `COSMOLOGY · MAP`, SIGNAL, MEMORY, SOMA,
  COSMIC SERPENT, WENU MAPU presentes en HTML servido.
- (captura visual denegada por Chrome MCP; curl-check sirve como prueba.)

---

## 2026-07-28 · Stage 7 — Editions dossier en /kodex/store

**Ya presente antes de este stage** (evolución previa del store):
- Hero "Editions" con print drops, downloads gratis, NFT Manifold, packs, canales.
- 3 print drops LIVE con SKU, tamaño, precio, buy-direct via WooCommerce
  (WM-KDX-PRT-32302-12 Cardinal Bloom, WM-KDX-PRT-30110-12 Mandala Axis,
  WM-KDX-PRT-30211-10 Square Field). Obras reales de Ocin desde `book/0cin`.
- NFT edición LIVE (Cardinal Wenelfe Bloom 32302 en Manifold Ethereum).

**Codeado en este stage (upgrade dossier)**
- `src/pages/kodex/store.astro`: añadido `<dl class="kdx-dossier">` a cada
  print card. Rows: YEAR (2026) · TECHNIQUE · EDITION · SOURCE (con plate id
  extraído del SKU) · PROVENANCE (Ocin/Wenu Mapu) · CERTIFICATE (SKU +
  authentication mark).
- `src/layouts/KodexShell.astro`: estilos globales `.kdx-dossier` (grid
  auto/1fr, JetBrains Mono, dust-white sobre muted labels).

**No aplicado (aceptado como divergencia intencional del brief §8)**
- Naming original del brief `KDX-ACH-001..005 STAR FRACTURE / MERIDIAN / BLOOM
  / SIGNAL LATTICE / MONOLITH` NO se usa. El store ya evolucionó a los nombres
  reales de los drops Printful (Cardinal Bloom, Mandala Axis, Square Field).
  Los KDX-ACH-* fueron placeholders internos que no llegaron a producto real.

---

## 2026-07-28 · Stage 8 — GA4 analytics events

**Codeado**
- `src/scripts/kdx-analytics.js`: wrapper `kdx(name, params)` que reenvía a
  `window.gtag('event', ...)` cuando GA4 está cargado (silent no-op si no).
- Bootstrap inline en `KodexChrome.astro`: expone `window.kdx()` global, emite
  `kdx_enter` (con landing/scene_index) + `scene_view` al montar. Compatible con
  el loader existente `src/components/Analytics.astro` (requiere `PUBLIC_GA_ID`).
- Eventos wired:
  - `next_scene / previous_scene` — kodex-engine.js goNext/goPrev.
  - `generator_start` (con source) + `generator_complete` (con id, seed,
    method, source) — atelier makeWork.
  - `index_open` — KodexIndexOverlay open().
  - `commission_open` + `commission_submit` (con type, budget) — CommissionForm.
  - `outbound_wenumapu|soma|disco|serpent|practice` (con href) — CosmologyMap
    portal clicks.

**Deferred (aplicado en polish pass)**
- ~~artwork_open, edition_open, restart_journey~~ ✅ wired en polish pass:
  - `artwork_open` en `kodex-engine.js` viewer open()
  - `edition_open` delegado en `.ks-buy` clicks del store
  - `restart_journey` delegado en `[data-kdx-restart]` (RETURN scene link)
- Set `PUBLIC_GA_ID` en Cloudflare Pages environment vars para activar el envío
  real. Sin eso los eventos siguen dispatching como CustomEvents `kdx:*`
  (útil para debug local).

---

## 2026-07-28 · Polish pass (post-stage 8)

**Codeado**
- `scripts/audit-catalog.mjs`: agregado KDX (id 489, kodex) + KOD (id 485,
  kodex-packs) + ART (accessories) al `PREFIX_TO_WC_CAT` — cierra los warnings
  "unknown SKU prefix" que ensuciaban el log de deploy.
- `kodex-engine.js` viewer.open() → `artwork_open` event (title + src filename).
- `store.astro` script → delegated listener sobre `.ks-buy` → `edition_open`
  event (label + href).
- `folio/[folio].astro` RETURN scene: `[data-kdx-restart]` en "READ AGAIN" +
  fix URL /kodex/editions/ → /kodex/store/ (la ruta real).
- `KodexChrome.astro` → delegated listener global para `[data-kdx-restart]` →
  `restart_journey` event.
- `KodexShell.astro`: incluye `<KodexIndexOverlay />` + agrega botón "◉ Open
  Codex Index" al menú overlay. Companion pages (/store /works /return /work
  /world /movement) ahora tienen la misma navegación de 7 escenas.

---

## 2026-07-29 · KODEX OS pass — fullscreen alien archive system

**Codeado**
- `/kodex/` queda como `00 · THRESHOLD`: escena única 100dvh con logo SVG,
  portal/eclipse rojo, rail de metadatos, barcode y CTA único `ENTER THE KODEX`.
- `/kodex/folio/[folio]/` se reestructura: cada folio principal es ahora una
  escena fullscreen única:
  - `01 · PROLOGUE`: ojo/observación + overlay de protocolo.
  - `02 · DESCENT`: estratos internos por click/tap, no once placas visibles.
  - `03 · ARCHIVE`: specimen seleccionado + drawer dossier.
  - `04 · MACHINE`: estados reales, seed, source, method y canvas output.
  - `05 · COSMOLOGY`: conexión por nodo, no red caótica.
  - `06 · RETURN`: inversión off-white + rutas Collect/Commission/Ecosystem.
- `src/styles/kodex.css`: agregado sistema visual `.kx-os-scene*` con grilla,
  halo/portal, scanlines, metadata rail, dossier tables, drawers, barcode,
  layout mobile específico y reduced-motion.

**Referencias usadas**
- `~/.hermes/image_cache`: KODEX visual identity board, journey board, logo
  lockups, crosshair/barcode/waveform/dossier references.
- Obsidian addendum `kodex-contenido-escenas-commission-2026-07-28.md`:
  vortex/túnel, dither/halftone, CJK vertical, marcas de registro, barcode,
  dossier técnico.

**Verificación**
- `git diff --check -- src/pages/kodex/index.astro 'src/pages/kodex/folio/[folio].astro' src/styles/kodex.css` OK.
- `node --check src/scripts/kodex-engine.js` OK.
- Preview temporal no-Astro creado en `/private/tmp/kodex-preview/index.html`;
  capturas generadas:
  - `/private/tmp/kodex-preview/desktop.png`
  - `/private/tmp/kodex-preview/mobile.png`

**Pendiente / bloqueo**
- Astro local sigue colgándose antes de iniciar Vite/puerto (`astro dev`,
  `astro dev --verbose`, con y sin `ALLOW_EMPTY_PRODUCTS=true`). No se pudieron
  sacar capturas reales de `/kodex/` todavía.
- Las capturas temporales confirmaron dirección general pero detectaron riesgo
  móvil de tipografía demasiado grande; se redujeron límites mobile en CSS.
