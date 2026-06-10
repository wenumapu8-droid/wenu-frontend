# Home Symbol, Pattern, And Image Extraction - 2026-05-21

## Scope

Read-only extraction from the current home page implementation. No files were changed in `src/`, `public/`, `.env`, aftercare, WooCommerce, git, or deployment surfaces.

## Home Structure

| Order | Section | Visual system used |
| --- | --- | --- |
| 1 | Hero V2 | Ritual portrait image, small sacred mark, coordinate line, circular embossed seal, dark gradient veil. |
| 2 | Proof beat | Text-only trust strip with dot separators. |
| 3 | Category strip | Five square image tiles with dark bottom gradient and arrow symbol. |
| 4 | Pattern divider | Bronze repeating textile-style SVG line. |
| 5 | Featured pieces | WooCommerce product cards; image quality is filtered to avoid known placeholders. |
| 6 | Sacred territory | Text, subtle radial glow, repeated textile background, four-direction cardinal SVG grid. |
| 7 | Pattern divider | Same bronze repeating textile-style SVG line. |
| 8 | Truckee showcase | Landscape image with dark veil. |
| 9 | Commissions teaser | Product ring image with dark side veil. |
| 10 | USPS / value grid | Four inline SVG glyphs: cross/circle, pentagon/material shape, diamond, quality target. |
| 11 | Pattern divider | Same bronze repeating textile-style SVG line. |
| 12 | Newsletter | Flame/glow graphic made in CSS, not an image file. |

## Current Home Image Files

| Surface | Image assets |
| --- | --- |
| Hero | `/img/hero/hero-portrait-600w.*`, `900w.*`, `1200w.*`, `1800w.*` |
| Category: Piercing | `/img/categories/piercing-editorial.webp` + `.avif` |
| Category: Hangers | `/img/categories/hangers.webp` + `.avif` |
| Category: Ear weights | `/img/categories/ear-weights.webp` + `.avif` |
| Category: Amulets | `/img/categories/amulets.webp` + `.avif` |
| Category: Ritual pieces | `/img/categories/ritual-pieces.png` only |
| Featured pieces | WooCommerce product images from `getProducts()` after placeholder filtering |
| Truckee showcase | `/img/truckee/showcase.webp` + `.avif` |
| Commissions teaser | `/img/products/ritual-ring-950.webp` + `.avif` |

## Symbol And Pattern Inventory

| Element | Where used | Construction | Meaning / visual role |
| --- | --- | --- | --- |
| `sacred-mark` | Hero copy | CSS class, small 18px mark | Small ritual accent before the hero copy. |
| Coordinate line | Hero bottom-left | Text `39°19′N · 120°11′W`, bronze hairline separator | Grounds the brand in Truckee/local geography. |
| Embossed seal | Hero image bottom-right | SVG circles + circular text path | Archive/certification feeling: `WENU · MAPU · TRUCKEE · 2026`. |
| PatternBand | Between major sections | SVG repeated pattern | Textile-inspired divider: nested diamond, stepped fret, cardinal cross, terminal triangles. |
| Sacred background pattern | Sacred territory section | CSS inline SVG background | Very subtle bronze textile/cardinal repeat behind copy and grid. |
| CardinalGrid | Sacred territory | Four inline SVG symbols | Four-direction system: Puel/East/Air, Will/South/Fire, Pewen/West/Water, Nüku/North/Earth. |
| USPS glyphs | Why Wenu Mapu section | Four inline SVG icons | Material, craft, design, quality. |
| Category arrows | Category strip | Text arrow `→` | Commerce/navigation cue. |
| Veils | Hero, category tiles, Truckee, commissions | CSS gradients | Make images feel darker, cinematic, and text-safe. |
| Newsletter flame | Newsletter | CSS radial gradient + animation | Ritual/fire cue without an image file. |

## Cultural / Brand Notes

- `PatternBand.astro` explicitly says its motif is inspired by Mapuche textile geometry and is a placeholder until a brand-supplied SVG arrives.
- PatternBand includes comments naming `lukutuel`, `greca`, and `meli witran mapu`. These should remain `[VERIFICAR CULTURALMENTE]` before being treated as final official symbolism.
- `CardinalGrid.astro` encodes directional labels and element associations in the UI. These are visually strong but should also stay culturally reviewed before expanding into packaging, merch, or official brand doctrine.
- The current home is not image-heavy decoration. It uses a few strong images, then relies on restrained SVG/CSS symbols and dark veils for identity.

## Design Implication

The home already has a symbolic language:

- Circle / seal / center point.
- Cross / cardinal axis / four directions.
- Diamond / nested lozenge.
- Stepped fret / textile band.
- Triangles / ascent/fire.
- Waves / water.
- Radial glow / ember/cosmos.
- Dark veils / obsidian luxury.

The next visual work should not invent a new decorative system. It should refine these same primitives, replace placeholder cultural motifs with approved final graphics, and add better real product/material imagery where the home currently relies on generic category or WooCommerce images.
