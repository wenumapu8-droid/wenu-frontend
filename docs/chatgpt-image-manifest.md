# ChatGPT Image Manifest

Source note: the image generations live in the ChatGPT conversation named `Wenu Mapu Imagenes`. This manifest converts that chat summary into website slots, filenames, and intake rules.

## Intake Rules

- Download images from ChatGPT into `~/Downloads` or a dedicated intake folder.
- Do not wire a file into Astro directly from `~/Downloads`.
- Rename files into lowercase kebab-case before putting them under `public/img`.
- Strip metadata and generate WebP/AVIF before using them on the site.
- Run `npm run assets:inventory` and `npm run assets:board` after intake.
- Do not write to WooCommerce from this workflow.
- Do not touch `public/aftercare`.

## Current Generated Image Set

The ChatGPT image session reports 32 generated assets:

- 4 tapestries / mural-style art pieces.
- 2 hero banners.
- 6 category shop images.
- 5 individual product images.
- 6 editorial ritual-space images.
- 3 symbols / UI / dividers.
- 3 backgrounds / textures.
- 1 material badge image.
- 2 social images.

## Website Intake Map

| Priority | Generated asset | Target filename | Target folder | Website slot |
| --- | --- | --- | --- | --- |
| P0 | Hero ear stack banner | `hero-ear-stack-ritual.webp` + `.avif` | `public/img/hero` | Home hero candidate |
| P0 | Shop hero flat lay | `shop-ritual-flatlay.webp` + `.avif` | `public/img/brand` | `/shop` visible hero/banner |
| P0 | Alternative dark smoke/geometric hero | `hero-obsidian-geometry.webp` + `.avif` | `public/img/hero` | fallback hero / text-safe banner |
| P1 | Piercing category | `piercing-editorial.webp` + `.avif` | `public/img/categories` | `/piercing`, category strip |
| P1 | Hangers / ear weights category | `hangers-ear-weights-editorial.webp` + `.avif` | `public/img/categories` | `/hangers`, `/ear-weights` |
| P1 | Septum category | `septum-obsidian-macro.webp` + `.avif` | `public/img/categories` | septum/search/category future |
| P1 | Amulets category | `amulets-volcanic-flatlay.webp` + `.avif` | `public/img/categories` | `/amulets` |
| P1 | Ear cuffs category | `ear-cuffs-serpentine-silver.webp` + `.avif` | `public/img/categories` | `/ear-cuffs` |
| P1 | Chaway category | `chaway-ceremonial-pair.webp` + `.avif` | `public/img/categories` | editorial/category future |
| P1 | Website texture | `obsidian-textile-texture.webp` + `.avif` | `public/img/brand` | background/section texture |
| P1 | Symbol mark | `wenu-portal-eclipse-mark.webp` + `.avif` | `public/img/brand` | brand/OG/social visual |
| P1 | Tileable ancestral pattern | `ancestral-pattern-tile.webp` + `.avif` | `public/img/brand` | overlay/background source |
| P1 | Symbol divider | `symbol-divider.webp` + `.avif` | `public/img/brand` | visual reference for UI dividers |
| P2 | About / Origin hands image | `about-origin-ritual-hands.webp` + `.avif` | `public/img/brand` | `/about`, `/artistry` |
| P2 | Ritual Space / Cosmos | `ritual-space-cosmos.webp` + `.avif` | `public/img/brand` | journal/about/editorial |
| P2 | Contact / Appointment | `contact-appointment-altar.webp` + `.avif` | `public/img/brand` | `/contact`, `/stockists`, `/local` |
| P2 | Newsletter / tribe banner | `newsletter-cosmic-landscape.webp` + `.avif` | `public/img/brand` | newsletter/footer/social |
| P2 | Tierra editorial | `ritual-space-tierra.webp` + `.avif` | `public/img/brand` | journal/editorial |
| P2 | Cuerpo editorial | `ritual-space-cuerpo.webp` + `.avif` | `public/img/brand` | journal/editorial |
| P2 | Luna / cycles editorial | `ritual-space-luna-ciclos.webp` + `.avif` | `public/img/brand` | journal/editorial |
| P2 | Ritual altar editorial | `ritual-space-altar.webp` + `.avif` | `public/img/brand` | journal/editorial |
| P2 | Material icons image | `material-icons-metal-trio.webp` + `.avif` | `public/img/brand` | material hub/reference |
| P3 | Titanium helix ring | `product-titanium-helix-ring.webp` + `.avif` | `public/img/products` | product-sheet source |
| P3 | Silver septum clicker | `product-silver-septum-clicker.webp` + `.avif` | `public/img/products` | product-sheet source |
| P3 | Silver ear weight | `product-silver-ear-weight.webp` + `.avif` | `public/img/products` | product-sheet source |
| P3 | Gold amulet | `product-gold-amulet.webp` + `.avif` | `public/img/products` | product-sheet source |
| P3 | Ear cuff with obsidian | `product-ear-cuff-obsidian.webp` + `.avif` | `public/img/products` | product-sheet/category source |
| P4 | Instagram square ear stack | `social-ear-stack-square.webp` | `public/img/social` | social archive |
| P4 | Instagram story vertical | `social-lunar-nape-story.webp` | `public/img/social` | social archive |
| P4 | Tapestry serpent | `tapestry-cosmic-serpent.webp` | `public/img/editorial` | future editorial |
| P4 | Tapestry four directions | `tapestry-four-directions.webp` | `public/img/editorial` | future editorial |
| P4 | Tapestry guardian | `tapestry-ritual-guardian.webp` | `public/img/editorial` | future editorial |
| P4 | Tapestry chaway portal | `tapestry-chaway-portal.webp` | `public/img/editorial` | future editorial |

## Implemented Local Assets

| Asset | Source file | Purpose | Status |
| --- | --- | --- | --- |
| `public/img/brand/shop-ritual-septum-hero.webp` + `.avif` | `~/Downloads/ChatGPT Image 8 may 2026, 12_56_13 p.m..png` | Visible `/shop` editorial banner and Open Graph image | Implemented |
| `public/img/brand/artistry-workbench.webp` + `.avif` | `~/Downloads/ChatGPT Image 8 may 2026, 12_59_47 p.m..png` | Visible `/artistry` workshop media and Open Graph image | Implemented |
| `public/img/brand/obsidian-textile-texture.webp` + `.avif` | `~/Downloads/ChatGPT Image 8 may 2026, 12_58_19 p.m..png` | Reusable dark textile texture/background source | Ready, not wired |

## Next Action

1. Download the 32 images from ChatGPT.
2. Run `npm run assets:chatgpt-intake`.
3. Rename each matched image to its target filename.
4. Copy approved assets into `public/img/...`.
5. Run metadata stripping/format generation.
6. Wire only the approved P0/P1 assets into Astro.
