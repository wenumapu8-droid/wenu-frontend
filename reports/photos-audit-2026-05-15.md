# Auditoría de Fotos — 2026-05-15

Track de imágenes / wenu-frontend. Read-only. Sitio Astro 6 SSG, productos vía
WooCommerce REST en build time.

---

## (a) Estado de las imágenes del sitio

### Imágenes locales — `public/img/` (1.8 MB total)

Sanas. Convención del `README.md` se cumple bien.

- 14 webp + 14 avif companions + 3 png + 1 jpg. Total 1.8 MB.
- **Ninguna imagen >500KB.** La más pesada es `categories/amulets.webp` (156 KB).
- Hero servido con `<picture>` responsive completo: avif+webp en 600/900/1200/1800w,
  `srcset`+`sizes`, `loading="eager"` + `fetchpriority="high"` + `<link rel=preload>`.
  Ejemplar.
- Truckee, brand, ritual-ring usan `<picture>` avif→webp con `loading="lazy"` +
  `decoding="async"`. Correcto.

**Defectos locales (menores):**

1. **3 PNG sin AVIF companion ni WebP** — `categories/piercing.png` (17 KB),
   `categories/hangers.png` (29 KB), `categories/ritual-pieces.png` (63 KB).
   `ritual-pieces.png` es una foto (gradientes) mal guardada como PNG; debería ser
   webp+avif como sus hermanas `amulets`/`ear-weights`. `CategoryStrip.astro` las
   sirve como `<img>` crudo sin `<picture>` (las webp del strip sí tienen avif).
2. **1 JPG sin optimizar** — `products/hanger-ammonite-bronze.jpg` (81 KB). Bajo el
   umbral de 800KB del script, así que `clean-images.mjs` no lo toca, pero queda
   como único JPG del árbol sin webp/avif.

### Imágenes de producto — remotas (WooCommerce CDN)

Aquí está el problema real. **No se optimizan en absoluto.**

- `ProductCard.astro` (líneas 33, 67) y `p/[slug].astro` (líneas 81, 108) sirven
  `<img src={p.images[0].src}>` — URL cruda del CDN de WordPress.
- **Sin `<picture>`, sin `srcset`, sin `sizes`, sin `width`/`height`.** Solo hay
  `loading="lazy"` en cards y galería; la imagen principal de la PDP **ni siquiera
  tiene `loading`** (line 81).
- `width`/`height` ausentes en todas → causa layout shift (CLS).
- El sitio **no usa el componente `<Image>` de Astro** (`astro:assets`) en ninguna
  parte. `astro:assets` no procesa URLs remotas sin whitelist en `astro.config.mjs`
  + adapter, así que las fotos de producto van full-size tal cual las dé WooCommerce.
- WooCommerce genera thumbnails (`-300x300`, `-768x768`, etc.) pero el código toma
  el `src` full del primer objeto image — probablemente el original a tamaño completo.

## (b) Productos sin foto

Según `catalog-reconciliation-2026-05-15.md`:

- **50 productos publicados y vivos en el build — 0 sin foto entre los publicados.**
- **54 sin foto en el universo total de WooCommerce** (104 registros auditados).
- De los no publicados: **15 productos "needs_photo / needs_facts"** listos para
  publicarse en cuanto tengan foto (los otros 39 están bloqueados como duplicados).

**Activo no usado:** `~/Obsidian/WenuAgent/brand/04-photography/product-macro/final/`
tiene **23 SKUs con fotos profesionales ya procesadas** — webp+avif en 3 tamaños
(thumb 400px / medium 800px / full 1600px), EXIF stripped, IPTC + alt text listos.
Estas fotos **aún no se subieron a WooCommerce Media** (el METADATA.md de cada SKU
lo lista como pendiente). Son exactamente la munición para cubrir productos sin foto.

## (c) Qué falta para "óptimo para web"

| Dimensión | Locales | Producto (WC) |
|---|---|---|
| Formato moderno (webp/avif) | OK (salvo 3 png + 1 jpg) | NO — sirve lo que mande WC |
| Peso | OK (<160KB) | Desconocido / sin control |
| Responsive (srcset/sizes) | OK en hero+picture | NO — `<img>` crudo |
| Lazy loading | OK | Parcial — falta en PDP main |
| width/height (anti-CLS) | — | NO en ninguna parte |
| `<Image>` de Astro | No se usa | No se usa |

## (d) Acciones concretas

**Prioridad alta — fotos de producto:**

1. Subir las 23 sesiones de `04-photography/product-macro/final/` a WooCommerce
   Media y vincularlas a sus SKUs (cubre productos sin foto + reemplaza fotos pobres).
2. Agregar `width`, `height` y `loading="lazy"` (PDP main: `loading="eager"` +
   `fetchpriority="high"`) a los `<img>` de `ProductCard.astro` y `p/[slug].astro`.
   Elimina CLS sin tocar `woo.ts`.
3. Servir thumbnails de WC, no el original: derivar `-768x768`/`-300x300` del `src`,
   o usar el tamaño correcto del array `images`, y armar un `srcset` con ellos.
4. Decidir el camino de optimización: (a) habilitar `astro:assets` con
   `image.domains`/`remotePatterns` para `wenumapuonline.com` y usar `<Image>` con
   `<picture>` avif/webp generado en build, o (b) Cloudflare Images / `cf-resize`
   en el CDN. Opción (a) es la nativa del stack.

**Prioridad media — locales:**

5. Convertir `categories/ritual-pieces.png` (63 KB foto) a webp+avif y los otros 2
   png a webp+avif; servir el strip completo con `<picture>` en `CategoryStrip.astro`.
6. Convertir `products/hanger-ammonite-bronze.jpg` a webp+avif (bajar el umbral del
   script de 800KB, o convertir a mano).
7. Bajar el umbral de `clean-images.mjs` (`> 800 * 1024`): un JPG de 81 KB ya
   merece webp; un umbral de ~150–200 KB captura más sin riesgo.

**Sin acción:** el pipeline local (`clean-images.mjs` + `gen-avif.mjs`) está bien
diseñado — strip EXIF, resize por carpeta, webp q82, avif companions q60. Solo
afina el umbral y aplícalo también a la rama de producto.
