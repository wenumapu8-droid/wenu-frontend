---
tipo: plan
proyecto: KODEX
fecha: 2026-07-26
estado: estudio + aislamiento hecho; flip pendiente de decisión de Ocin
---

# KODEX → Producción · Integración Limpia

> Estudio pedido por Ocin (2026-07-26): "que la integración sea limpia, no quiero Kai y UFO
> dando vuelta por KODEX para no ensuciar la experiencia". Enlaza con [[project_kodex_microsite]]
> y [[project_hidden_sky_etica]].

## 1. Objetivo

Llevar KODEX (`/kodex/**`) a producción en `wenumapuonline.com` **sin que nada del mundo
comercial ni de ficción del sitio (Kai, UFO/Hidden Sky, carrito, nav, temas) aparezca dentro
de la experiencia KODEX**. KODEX debe sentirse un mundo aparte, aislado.

## 2. Dónde vivían las fugas (diagnóstico)

Dos capas de páginas KODEX, dos niveles de aislamiento:

- **Mis páginas (`/kodex/work/[id]`, `/kodex/works`, `/kodex/world`)** → usan `KodexShell.astro`,
  que NO extiende Base: ya estaban 100% limpias (sin Cart, sin Immersive, sin Kai, sin Nav).
- **Páginas de la otra sesión (`/kodex`, `/kodex/folio/[folio]`, `/kodex/editions`,
  `/kodex/archive/conjuncion`)** → usan `Base.astro` con props de aislamiento.

`Base.astro` ya tenía props: `noNav`, `noFooter`, `noOverlays`, `noQuote`, `noThemes`, `noKai`.
Las páginas KODEX ya las ponían todas en `true`. **PERO faltaban dos opt-outs**, así que dos
cosas se colaban igual:

1. **`<Immersive />`** — se renderizaba SIEMPRE (sin prop). Su punto 4 es literalmente
   *"Hidden Sky — a rare UFO that blips into random spots across the site with glitch"*. = el UFO
   que Ocin no quiere en KODEX. (Las páginas KODEX tienen su propio sistema de reveals, así que
   Immersive no les aportaba nada útil, sólo la fuga.)
2. **`<Cart />`** — se renderizaba SIEMPRE (sin prop). Invisible en KODEX (no hay trigger porque
   el Nav está off), pero cargaba chrome/JS de comercio en el mundo del arte.

## 3. Fix de aislamiento (HECHO 2026-07-26)

- `Base.astro`: agregué props `noCart` y `noImmersive` (default `false` → **no cambia nada en el
  resto del sitio**), y las cablé: `{!noCart && <Cart />}` · `{!noImmersive && <Immersive />}`.
- Las 4 páginas KODEX+Base ahora pasan `noCart={true} noImmersive={true}` además de las anteriores.
- Resultado: **cero Kai, cero UFO, cero carrito** en toda la superficie KODEX.
- Verificación: build + preview; confirmar que el HTML de `/kodex` no incluye el script de
  Immersive ni el markup de Cart.

Archivos tocados: `src/layouts/Base.astro`, `src/pages/kodex/index.astro`,
`src/pages/kodex/editions.astro`, `src/pages/kodex/folio/[folio].astro`,
`src/pages/kodex/archive/conjuncion.astro`.

## 4. Mecánica real del "flip" a producción — y el RIESGO grande

Hallazgos al inspeccionar git/deploy:

- La rama actual del working tree **ES `redesign-v2`** (la rama de producción).
- **Todo KODEX está SIN commitear** (untracked, `??`): `src/pages/kodex/`, `src/lib/kodex*.js`,
  `src/kodex/`, `KodexShell`, `KodexChrome`, `KodexOverlays`, `KodexCell`, `src/styles/kodex.css`,
  `public/img/kodex/`, etc. En `redesign-v2` commiteada **no hay `/kodex`** (0 archivos).
- El build de Astro compila **los archivos en disco**, no lo que está commiteado. Y `deploy-now.sh`
  hace `npm run build` sobre el working tree y sube `dist/` a producción con wrangler.
- **Conclusión:** el "flip" NO es un merge de git. Correr `deploy-now.sh` **ya publicaría KODEX**
  porque los archivos están en disco.

**PERO — riesgo crítico:** el working tree tiene MUCHO cambio no-KODEX sin commitear que un deploy
de producción **también barrería a la tienda viva**:

- Modificados (tracked): `Cart.astro`, `Nav.astro`, `Base.astro`, `CatalogDeck.astro`,
  `HeroCarousel.astro`, `account.astro`, `p/[slug].astro`, `journal/[slug].astro`,
  `public/robots.txt`, `public/experience/index.html`, un journal `.md`.
- Untracked no-KODEX: `/gallery`, `/projects` (imágenes physical/gallery), `public/experience/`
  constellation.*, imágenes cosmos, handoff de instagram, decenas de scripts.

O sea: **hoy `deploy-now.sh` publicaría KODEX + toda esa deriva a la vez**, sin revisión. Eso puede
mandar trabajo a medio hacer al store de Ocin. Ese es el punto que hay que resolver para un flip
"limpio".

## 5. Opciones para un flip limpio

**Opción A — Commit selectivo + deploy (recomendada, más limpia).**
1. Ocin (o con su ok) commitea a `redesign-v2` SÓLO lo que va a producción: KODEX completo
   (`src/pages/kodex`, `src/kodex`, `src/lib/kodex*`, `KodexShell/Chrome/Overlays/Cell`,
   `styles/kodex.css`, `public/img/kodex`) + el fix de aislamiento en `Base.astro` + `/gallery` y
   `/projects` si también van. Dejar afuera lo experimental.
2. Revisar `git status` → que el working tree quede == lo que se quiere en prod.
3. `deploy-now.sh` (build + verify + wrangler a producción).
4. Verificar en vivo en `wenumapuonline.com/kodex`.

**Opción B — Deploy del working tree tal cual (rápida, riesgosa).**
- Correr `deploy-now.sh` ahora publica TODO el working tree. Sólo si Ocin confirma que TODA la
  deriva actual está lista para producción. No recomendada sin revisar la lista de §4.

En ambas: **la otra sesión es la dueña del deploy de producción** — coordinar para no pisar y para
serializar (un solo build por vez; `deploy-now.sh` ya tiene lock).

## 6. Entrada a KODEX desde el sitio (puerta)

- Hoy KODEX es un mundo aislado sin link entrante desde `wenumapuonline.com` (por diseño, mientras
  fue preview). Para el lanzamiento hay que decidir la **puerta**:
  - **Directo por URL** (`/kodex`) — más discreto; se comparte por Pinterest/IG, no desde el nav.
  - **Portal oculto** ("Cosmic Portal" ya mencionado) — un acceso sutil desde el sitio principal
    (ej. el mandala girando de `/experience`), sin ítem de nav comercial. Coherente con el espíritu
    "no ensuciar".
- Recomendación: entrada por URL + portal oculto; **nunca** un ítem de menú comercial que meta a
  KODEX en el flujo de tienda.

## 7. SEO / indexación (para Pinterest orgánico)

- Hoy las páginas KODEX llevan `noindex` (bien para preview). **Para que Pinterest empuje SEO real,
  KODEX en producción debe ser indexable.** Antes del flip: quitar `noindex` en las páginas KODEX
  (o poner `robots="index, follow"`), agregar OG images por obra, y sumar `/kodex` al sitemap.
- Esto se coordina con el bloque comercial (Printful/Gelato + Foundation/Rarible + Pinterest) que
  Ocin dejó para después.

## 8. Checklist de lanzamiento limpio

- [x] Aislamiento: `noCart` + `noImmersive` en Base + páginas KODEX (cero Kai/UFO/carrito).
- [ ] Verificar en preview que `/kodex` no carga Immersive ni Cart (HTML).
- [ ] Decidir Opción A vs B del flip (commit selectivo recomendado).
- [ ] Quitar `noindex` de KODEX + OG por obra + sitemap (para Pinterest).
- [ ] Definir la puerta de entrada (URL + portal oculto, sin nav comercial).
- [ ] Coordinar con la otra sesión (dueña del deploy) + ok de Ocin.
- [ ] `deploy-now.sh` a producción.
- [ ] Verificar en vivo `wenumapuonline.com/kodex` (sin UFO/Kai/carrito, obras/activación OK,
      móvil OK).
- [ ] Recién ahí: comercio (POD/NFT) + campaña Pinterest.

## 9. Lista EXACTA de commit para el flip limpio (2026-07-26)

Del análisis del working tree (`git status` / `git diff`):

**GRUPO 1 — KODEX core** (commitear; todo NUEVO/untracked, riesgo cero para el store):
- `src/pages/kodex/` (index, work/[id], works, world, editions, folio/[folio], archive/conjuncion)
- `src/kodex/` (engine, shaders, audio)
- `src/lib/kodex.js`, `src/lib/kodexBook.js`
- `src/layouts/KodexShell.astro`
- `src/components/KodexCell.astro`, `KodexChrome.astro`, `KodexOverlays.astro`
- `src/styles/kodex.css`
- `public/img/kodex/`

**GRUPO 2 — Aislamiento** (commitear; necesario). `src/layouts/Base.astro` — TODO su diff es la
infraestructura de aislamiento (`noThemes`/`noKai`/`noCart`/`noImmersive` + `themesOn` + gating de
kai/Cart/Immersive). Nada ajeno. Seguro de commitear entero.

**GRUPO 3 — Mundos hermanos** (commitear SI lanzan junto a KODEX — decisión de Ocin):
- `src/pages/gallery.astro` + `public/img/gallery/`
- `src/pages/projects.astro` + `public/img/physical/`

**GRUPO 4 — SEO benigno** (opcional): `public/robots.txt` (ahora permite crawlers de AI-search —
discovery; cambio general del sitio, no KODEX-específico).

**NO commitear en el flip KODEX** (deriva NO relacionada — iría al store en vivo sin revisar):
- `src/components/Nav.astro` (76 líneas, sin nada de KODEX), `Cart.astro`, `CatalogDeck.astro`,
  `HeroCarousel.astro`
- `src/pages/account.astro`, `journal/[slug].astro`, `p/[slug].astro`
- `src/content/journal/apprentice-page-1.md`
- `public/experience/index.html`, `public/img/experience/`, `public/img/journal/`
- `scripts/*`, `wm-*.mjs` (tooling; no se sirven en el sitio)

**⚠️ PROCEDIMIENTO (clave):** `deploy-now.sh` buildea el **working tree (disco)**, no lo
commiteado. Así que commitear selectivo NO basta para un deploy limpio. Secuencia limpia:
1. Commitear grupos 1–3 (y 4 si se quiere) a `redesign-v2`.
2. `git stash push` de la deriva restante (la lista "NO commitear").
3. `deploy-now.sh` (ahora el working tree = KODEX + store baseline, sin deriva).
4. Verificar en vivo `wenumapuonline.com/kodex`.
5. `git stash pop` para recuperar la deriva y seguir.
La **otra sesión es la dueña del deploy de producción** → coordina y serializa.

## 10. Ediciones — referencia de diseño (Fox Rockett Studio, dada por Ocin 2026-07-26)

`foxrockettstudio.com/products/micrographics-vol-1` = cómo Ocin imagina las Ediciones KODEX.
Es una tienda de **assets digitales** (Shopify) con estética técnica/cyberpunk/data — idéntica a la
vibra KODEX. La página de producto:
- Hero grande del producto (gráfico técnico anotado, mono, data-viz).
- Título + rating + precio (£25).
- Toggle de **licencia** (Commercial / Extended) + "License info".
- **Add to cart** + **Buy** (pago instantáneo).
- Bullets de features (ej. "70 Editable Vector Graphics · 150 elements · SVG/PNG/AI · clean files").
Modelo para KODEX Ediciones: página de producto limpia por obra/pack (descarga digital + print/
sticker/tee POD + donación), con opciones de licencia, **reutilizando el checkout de Wenu Mapu**
(no Shopify). PENDIENTE decisión de Ocin: ¿ventas KODEX en el mismo backend/órdenes que la joyería,
o separadas? Esto es el bloque comercial diferido.

## 11. Espacios / marketplaces de distribución (Ocin 2026-07-26, "después tenemos que estar")

Ocin mandó más referencias — el patrón = **productos digitales + marketplaces de creadores**:
- `foxrockettstudio.com` — tienda de assets gráficos (packs vector/textura, licencias).
- `aescripts.com` (ej. FXAA) — **marketplace multi-autor** de plugins/scripts de After Effects
  (Browse / Authors / Learn; cada autor vende sus herramientas). FXAA = plugin gratis de un autor.
- `blewtoof.com/blobz` — tienda de un creador (assets de diseño/arte).

Lectura: KODEX no es solo prints/NFT — su comercio natural son **PRODUCTOS DIGITALES con su esencia**:
packs de gráficos generativos, presets/herramientas de efectos, librerías de assets, además de
prints/tees POD y NFT. Dos capas de canal:
1. **Storefront propio** = `/kodex/editions` con el lenguaje Fox Rockett (página de producto limpia,
   licencia, checkout Wenu Mapu).
2. **Marketplaces de terceros** (aescripts-style / Gumroad / Creative Market) = distribución +
   discovery, "después". Cada listing debe sentirse KODEX (cosmogónico/generativo/cyberpunk-ritual),
   nunca genérico — regla de Ocin: "más integraciones con nuestra esencia".

**Through-line honesto:** TODOS estos espacios son downstream de una sola cosa — **KODEX vivo y
público en una URL real**. Ninguno puede destacarnos hasta que existamos en producción. Por eso el
go-live sigue siendo el desbloqueo de toda esta visión; lo demás es "después".

<!-- wenu-backlinks -->
Relacionado: [[Home]] · [[project_kodex_microsite]] · [[project_hidden_sky_etica]] · [[reference_cloudflare_deploy]]
