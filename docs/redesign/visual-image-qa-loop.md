# Wënü Mapü — recursive visual QA protocol v1

## Source-of-truth
Live public site: https://wenumapuonline.com/
Code: `wenumapu8-droid/wenu-frontend`, Astro + WooCommerce.
Editorial identity: obsidian / charcoal / bone / candle gold; original sigil geometry is a canonical brand asset.

## Image review: score 0-5 on each axis
- **Product authenticity**: exact physical geometry and count of piercings/jewelry, materials, engravings, stones.
- **Photo credibility**: natural light direction, focus hierarchy, plausible texture, no AI shine or unnatural skin.
- **Brand fidelity**: dark ritual editorial, no boho/template nebula, no extra sigils.
- **Cropping**: desktop 16:9 and mobile 3:4 retain the actual subject.
- **Commercial utility**: actual SKU when shoppable, legible CTA overlay, optimized loading.
- **Traceability**: source, photographer/license, original filename and SKU/collection mapping.

**Gate**: any 0/1 in authenticity blocks publication; all other axes >=3, total >=24/30 before public deployment. Score twice with a mobile and desktop screenshot after implementation.

## Triage
| Surface | Current candidate | Status | Action |
|---|---|---|---|
| Hero slide 1 | /img/hero/hero-cosmos-eclipse.webp | Generated-looking, unverified | Use confirmed real macro first; replace with new genuine shoot when approved |
| Hero slide 2 | /img/banners/hero/atelier-forge.webp | Provenance pending | Audit workshop representation before making artisan claims |
| Hero slides 3 & 5 | /img/hero/hero-body-eclipse.webp | Provenance pending | Ensure actual piercing is accurately depicted, no fake work claims |
| Hero slide 4 | /img/banners/hero/araucania-lake.webp | Provenance pending | Keep atmospheric only until real location photography |
| Hero slide 6 | /img/banners/hero/atacama-meteorite.webp | Provenance pending | Match actual SKU and geological/meteorite claims |
| Piercing category tiles | /img/banners/category/* | Provenance pending | Replace only after stock/piece mapping and visual QA |
| Collection tiles | /img/banners/collection/* | Provenance pending | 3 candidates, source tracking, verify crop and links |
| Product details | WooCommerce original photos | Preserve SKU faithfulness | Never substitute an invented jewelry render |

## Recursive pass schedule
**Round A / INVENTORY** — enumerate assets, map usage and live thumbnails, label verified vs candidate vs unknown.
**Round B / CRAFT** — grade/expose/crop real originals; generate only atmospheric contextual images; never fabricate purchasable object imagery.
**Round C / QA** — compare side-by-side on 390/768/1440, user test shop→PDP→cart; scores and signoff. Repeat B→C until gate passed.
**Round D / RELEASE** — stage a feature-flagged component, confirm functional parity and logs, publish only with human approval.
**Round E / MEASURE** — track Core Web Vitals, hero CTA clickthrough, PDP view, add-to-cart, conversion; roll back if regression.

## Do-not-delete rule
Any section hidden from home must remain reachable elsewhere and must have an approved destination. No destructive redesign of Wültufe, KODEX, Oracle, Drum, product catalog or Journal.

No automated model should mark image authenticity as verified without inspecting both reference photos and published result. If a source is missing, flag unknown; do not hallucinate provenance.
