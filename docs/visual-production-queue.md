# Wenu Mapu Visual Production Queue

Generated for ongoing asset work. This queue is safe to use from ChatGPT, Codex, Claude, OpenCode, or a manual browser workflow.

## Rules

- Do not write to WooCommerce from this workflow.
- Do not touch `public/aftercare`.
- New website-ready assets go through `public/img`, never directly from random downloads.
- Use lowercase kebab-case filenames.
- Strip metadata and generate modern formats before wiring an asset into a page.
- Use `npm run assets:inventory` and `npm run assets:board` after adding new images.

## Current Safe Visual Primitives

- `/img/brand/wenu-mapu-mark.svg` — missing JSON-LD brand mark now available.
- `/img/graphics/cardinal-sigil.svg` — reusable ritual icon/background source.
- `/img/graphics/collection-backdrop.svg` — fallback backdrop for collection banners and prompt references.
- `/img/graphics/product-photo-pending.svg` — fallback visual for product/photo review workflows.

## High-Priority Assets To Create

### 1. Collection Banners

Target folder: `public/img/brand`

- `ritual-ring-vacamuerta-banner.webp` and `.avif`
- `mystic-series-banner.webp` and `.avif`
- `author-jewelry-banner.webp` and `.avif`

Prompt base:

```text
Use case: ads-marketing
Asset type: website collection banner, 16:9, no text
Primary request: Create a dark luxury body-jewelry collection banner for Wenu Mapu.
Scene/backdrop: obsidian black studio surface, bronze textile geometry, subtle meteorite/metal texture, premium editorial lighting.
Subject: handcrafted body jewelry arranged as a collection, with negative space for web layout.
Style: cinematic, tactile, high-end craft, dark obsidian palette with bone, bronze, warm silver accents.
Avoid: text, logos, watermarks, extra hands, plastic shine, stock-photo look, fantasy characters.
```

### 2. Category Tiles

Target folder: `public/img/categories`

- `ear-cuffs.webp` and `.avif`
- `ritual-objects.webp` and `.avif`
- `sets.webp` and `.avif`
- future replacement for `hangers.png`, `piercing.png`, `ritual-pieces.png`

Prompt base:

```text
Use case: product-mockup
Asset type: square ecommerce category tile, 1:1, no text
Primary request: Create a clean Wenu Mapu category tile for <CATEGORY>.
Scene/backdrop: dark obsidian product table with restrained bronze geometry.
Subject: <CATEGORY SUBJECT>, centered with generous breathing room.
Style: realistic product editorial, premium handmade jewelry, crisp edges, controlled highlights.
Avoid: text, logo, watermark, model face, busy background, unrelated objects.
```

### 3. Product Sheets

Target folder: `public/img/products` for web images, `Obsidian/WenuAgent/brand/07-marketing-collateral/product-sheets` for editorial sheets.

Needed first:

- Ritual Ring No. 3 product sheet
- Ritual Ring No. 19 product sheet
- Mystic Bee product sheet
- Mystic snake product sheet
- Teardrop Amethyst product sheet

Prompt base:

```text
Use case: product-mockup
Asset type: ecommerce product sheet, 4:5, no text
Primary request: Create a premium product sheet background and layout for <PRODUCT NAME>.
Scene/backdrop: dark studio, handcrafted metal jewelry on stone or matte obsidian surface, subtle Wenu Mapu bronze geometry.
Subject: one product only, centered, sharp, realistic scale, no duplicate pieces.
Style: luxury craft catalog, tactile metal, warm highlights, clean negative space.
Avoid: text, watermark, extra jewelry unless specified, unrealistic gemstones, hands, body model.
```

## Implementation Order

1. Finish collection banner replacements.
2. Replace PNG category tiles with optimized WebP/AVIF.
3. Create product-sheet source images for the top collection products.
4. Wire only approved assets into Astro pages.
5. Run `nvm use && npm run build`.
