# CSS Orphan BEM Audit — 2026-05-18

Scope: classes matching `block__element` used in `src/` markup but not directly defined as `.block__element` in `src/styles/`.

## Fixed

| Class | Files | Decision |
| --- | --- | --- |
| `archive-card__title` | `src/pages/collection/index.astro`, `src/pages/material/index.astro` | Bug real: collection/material archive cards used title class without typography/layout. Added CSS. |
| `archive-card__sub` | `src/pages/collection/index.astro`, `src/pages/material/index.astro` | Bug real: supporting copy was unstyled browser/default text. Added CSS. |
| `archive-card__cta` | `src/pages/collection/index.astro` | Bug real: CTA lacked archive-card treatment. Added CSS. |

## Reviewed, no code change

| Class | Files | Decision |
| --- | --- | --- |
| `artistry-stages__body` | `src/pages/artistry.astro` | False positive: wrapper only; child title/text carry layout and typography. |
| `book-grid__col` | `src/pages/piercing.astro` | False positive: grid child; parent `.book-grid` supplies layout. |
| `contact-channels__copy` | `src/pages/contact.astro` | False positive: grid content wrapper; child classes supply typography. |
| `custom-form__copy` | `src/pages/custom-orders.astro` | False positive: first grid column inside `.custom-form__inner`; no separate rules needed. |
| `custom-process__body` | `src/pages/custom-orders.astro`, `src/pages/jewelry-styling.astro` | False positive: body wrapper; head/text classes supply structure. |
| `custom-terms__head` | `src/pages/custom-orders.astro` | False positive: grid column; section title/intro classes style contents. |
| `footer-v2__contact-line` | `src/components/Footer.astro` | No layout bug observed; footer brand stack controls spacing. Candidate for future polish only. |
| `footer-v2__sep` | `src/components/Footer.astro` | No layout bug observed; inline separator. Candidate for future polish only. |
| `footer-v2__tagline` | `src/components/Footer.astro` | No layout bug observed; footer brand stack controls spacing. Candidate for future polish only. |
| `local-steps__copy` | `src/pages/local.astro` | False positive: grid content wrapper; title/body classes supply layout. |
| `materials-list__body` | `src/pages/materials.astro` | False positive: grid content wrapper; title/intro/dl classes supply layout. |
| `materials-list__deep-dive` | `src/pages/materials.astro` | Not a layout bug; link inherits text/link styles. Candidate for future polish only. |
| `sacred__links` | `src/pages/index.astro` | False positive: modifier-like paragraph class paired with existing `sacred__p`. |
| `set-card__copy` | `src/pages/sets.astro` | False positive: only appears in commented future markup. |
| `wenu__mapu` | URLs/handles in multiple files | False positive: parsed from `@wenu__mapu`, not a CSS class. |

## Command

Audit used literal `block__element` extraction from `src/` markup and `.block__element` definitions from `src/styles/` plus local Astro style blocks.
