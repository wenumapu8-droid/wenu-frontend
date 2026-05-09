# Wenu Mapu — frontend

Astro 6.2.1 SSG. Sitio público en `wenumapuonline.com`. Lee productos de WooCommerce REST en build time.

## Comandos

```bash
npm run dev      # dev server localhost:4321
npm run build    # build SSG → ./dist
npm run preview  # serve build local
```

Node ≥ 22.12.0 (declarado en package.json).

## Datos

- Productos: WooCommerce REST API. Cliente en `src/lib/woo.ts`. Credenciales `WC_CONSUMER_KEY`/`WC_CONSUMER_SECRET` en `.env`.
- API base: `https://www.wenumapuonline.com/wp-json/wc/v3`.
- Fetch en build time → HTML estático. No hay runtime queries.

## Identidad visual

Documentación de marca en `~/Obsidian/WenuAgent/brand/`:
- `BRAND-DNA-2026-05-03.md` — ADN de marca
- `color-palette.md` — paleta
- `typography.md` — tipografías
- `voz-de-marca-real-2026-05-03.md` — voz/tono
- `copy-frontend-2026-05-01.md` — copy de secciones

## Sistema de estilos

CSS puro, sin Tailwind.

- `src/styles/tokens.css` — design tokens (paleta, escala tipográfica, spacing). Paleta dark-first: Obsidian #080706, Bone #F2EDE4, Sand #D6C1A3, Silver #A8A39A, Bronze #8A6A43, Ember #C4935A.
- `src/styles/global.css` — reset, typography, clases reusables (`.archive-card`, `.product-card`, `.btn`, `.btn--solid`, `.btn--ghost`, `.section--mega`, `.constellation-divider`, `.eyebrow`, `.sacred-mark`).

Tipografías cargadas vía `@fontsource`:
- DM Serif Display (display)
- Source Serif Pro (body)
- Inter Variable (UI/metadata)

## Componentes existentes (reusables)

- `Base.astro` — layout HTML + SEO metadata
- `Nav.astro` — header (en rediseño F2)
- `Logo.astro` — logo SVG
- `ProductCard.astro` — 2 modos: `product` y `archive`
- `Footer.astro` — footer (en rediseño F8)
- `EmbossedSeal.astro` — sello SVG decorativo (props: text, size)

## Páginas

- `/` — home (`src/pages/index.astro`)
- `/shop` — catálogo (`src/pages/shop.astro`)
- `/p/[slug]` — detalle producto (`src/pages/p/[slug].astro`)
- `/contact` — contacto
- `/local` — pickup Truckee

## i18n

`src/i18n/en.json` (inglés) + `src/i18n/mapudungun.json` (frases rituales en mapudungun).

## Rediseño en curso

Plan completo en `~/.claude/plans/hecho-trabajamos-los-dos-frolicking-sparrow.md`.

Trabajamos en branch `redesign-v2`. Producción intacta en `main` hasta merge final.

Fases F0-F10. Estado actual: ver TodoWrite del agente.

## Imágenes

Convención y proceso documentados en `public/img/README.md`.

Resumen:
- Lowercase kebab-case, sin emojis ni espacios.
- WebP para fotos pesadas, PNG para gráficos planos.
- Script `scripts/clean-images.mjs` strip metadata EXIF + convierte a WebP las > 800KB.
- Correr el script cada vez que se agreguen fotos crudas a `public/img/*`.

## Catálogo — categorías y tipos de piercing

Top categories (en CategoryStrip + dropdown Nav): Piercing, Hangers, Ear Weights, Amulets, Ritual Pieces.

Tipos de piercing pendientes de cargar al inventario WooCommerce (mayo 2026):
- Flat
- Eyebrow (ceja)
- Nipple
- Lip (labio)
- Tongue (lengua)

Cuando estos tipos se carguen como categorías o atributos en WooCommerce, aparecen automáticamente como tabs filtro en `/shop` — el shop lee dinámicamente las categorías de WC vía `getCategories()` en `src/lib/woo.ts`. No requiere cambios en el frontend.

Si más adelante hace falta un mega-menu en el Nav con sub-tipos de piercing, expandir `shopSubmenu` en `src/components/Nav.astro`.

## Reglas

- No tocar `src/lib/woo.ts` salvo necesidad explícita — fuente de productos estable.
- No reescribir tokens existentes; expandirlos si hace falta.
- Reusar clases de `global.css` antes de crear nuevas.
- Mobile-first o paridad mobile/desktop obligatoria.
- Cada fase debe pasar `npm run build` limpio antes de commit.
- Toda foto cruda nueva debe pasar por `node scripts/clean-images.mjs` (strip EXIF + WebP) y `node scripts/gen-avif.mjs` (AVIF companions).

## Componentes clave

- `Base.astro` (layout) — props soportados: `title`, `description`, `ogImage`, `ogType`, `noNav`, `noFooter`, `jsonLd`, `preloadImage`. Acepta jsonLd como object o array. preloadImage agrega `<link rel="preload">` para LCP.
- `PatternBand.astro` — divider textil mapuche (placeholder geométrico hasta que llegue el SVG real). Variantes: `hairline` (entre secciones) o `band` (footer/sacred).
- `SearchModal.astro` — vive en Base. Lazy-loads `/search-index.json`. Triggers: click, `/`, `Cmd+K`. Cierra con Esc.
- `ProductCard.astro` — props: `product`, `archive`, `fragmentIndex`, `badge`. Cards sin imagen muestran cardinal-cross placeholder en bronze.
- `HealingTimes.astro` — prop `titleAs: 'h1' | 'h2'` (default 'h2'; care-guide passes 'h1').
- `CardinalGrid.astro` — 4 SVGs cardinales con lang="arn" en labels mapudungun.

## Endpoints

- `/search-index.json` — Astro endpoint que emite todos los productos (id, slug, name, price, image, cat, cats). Consumido por SearchModal.
- `/sitemap-index.xml` — generado por @astrojs/sitemap con priorities curadas (config en `astro.config.mjs`).
- `/robots.txt` — manual en `public/robots.txt`.

## SEO / Structured data

- Home: `Organization` + `WebSite` (con `SearchAction`).
- `/p/[slug]`: `Product` + `BreadcrumbList`.
- `/faq`: `FAQPage` (cada Q/A es Question/acceptedAnswer).
- `/care-guide`: `HowTo` con los 3 principios + `HowToSupply`.
- Per-page OG images: home/heroe, custom-orders/ring, care-guide/meteorite, local/truckee, about/meteorite-final, shop/meteorite-banner.

## Performance

- Hero responsive: 600/900/1200/1800w en avif+webp via `<picture>` con `srcset+sizes`. Mobile baja ~15KB en vez de ~131KB.
- Hero preloaded via `<link rel="preload" as="image" type="image/avif">` con fetchpriority=high.
- AVIF companion para todas las imágenes >800KB (script `scripts/gen-avif.mjs`).
- Preconnect a `wenumapuonline.com` (CDN de productos), dns-prefetch a `formspree.io`.
- Fade-in stagger en cards de Featured / Categories / USPs / Cardinals via IntersectionObserver. Honra `prefers-reduced-motion`.
