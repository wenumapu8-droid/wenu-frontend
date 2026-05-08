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

## Reglas

- No tocar `src/lib/woo.ts` salvo necesidad explícita — fuente de productos estable.
- No reescribir tokens existentes; expandirlos si hace falta.
- Reusar clases de `global.css` antes de crear nuevas.
- Mobile-first o paridad mobile/desktop obligatoria.
- Cada fase debe pasar `npm run build` limpio antes de commit.
