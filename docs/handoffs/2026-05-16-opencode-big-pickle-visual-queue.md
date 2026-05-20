# OpenCode Big Pickle Visual Queue

Date: 2026-05-16  
Project: Wenu Mapu frontend  
Mode: review-first, no implementation unless Codex explicitly authorizes a narrow file scope later.

## Mission

Act as a visual strategy and asset review agent for Wenu Mapu. Your job is to help Codex decide which brand, marketing, product, and generated images should be used next on the website.

Do not edit files during this review queue. Produce concise recommendations with exact asset paths, intended website slots, and priority.

## Read First

- `docs/brand-asset-library.md`
- `docs/asset-board.html`
- `docs/chatgpt-image-manifest.md`
- `docs/asset-inventory.md`
- `src/pages/shop.astro` only for understanding current visual usage
- `src/pages/artistry.astro` only for understanding current visual usage
- `src/pages/collection/index.astro` only for understanding current collection layout

## Hard Boundaries

Do not touch:

- WooCommerce writes or product updates
- DNS
- secrets or `.env` files
- production deploys
- `sudo`
- `/aftercare`
- `.gitignore`
- `agent-control`
- unrelated dirty files from other agents

## Current Known Asset System

Codex already created a read-only asset system:

- `npm run assets:brand-library` generates `docs/brand-asset-library.md`
- `npm run assets:board` generates `docs/asset-board.html`
- `npm run assets:chatgpt-intake` checks downloaded ChatGPT images against the manifest

The current asset library classifies assets by role:

- `web-hero-banner`
- `web-background-texture`
- `web-graphic-ui`
- `product-master`
- `web-product`
- `identity-logo`
- `social-template`
- `marketing-collateral`
- `qr-code`
- `copy-doc`
- `archive-source`

## Task 1: Pick P0 Website Images

Review the asset library and board. Recommend 3 to 6 P0 assets that should be used first on the website.

For each recommendation, return:

- exact source path
- why it fits Wenu Mapu
- exact website slot: home, shop, collection, artistry, product, social, background, texture, QR
- whether it needs crop, optimization, renaming, or approval
- whether it is safe for Codex to implement later

Prefer assets with status:

- `website-ready-source`
- `already-wired`

Be careful with:

- `needs-human-approval`
- old screenshots
- duplicated banners
- logos not validated as official

## Task 2: Identify What Not To Use Yet

Return a short “do not use yet” list.

Include assets that are:

- visually off-brand
- duplicated
- too old or too rough
- likely screenshots
- logo variants needing human approval
- product images without a clear SKU or website slot

## Task 3: Recommend Next Codex Implementation

Do not implement. Recommend the next narrow implementation step for Codex.

Use this format:

```text
Recommended Codex task:
TASK: ...
FILES ALLOWED: ...
FORBIDDEN: WooCommerce writes, DNS, secrets, deploys, sudo, aftercare, .gitignore, agent-control, unrelated dirty files.
VALIDATION: ...
```

Keep the implementation small enough for one safe phase.

## Task 4: Keep The Queue Moving

After finishing a review, propose the next Big Pickle review task in English.

Good next tasks:

- Review collection banners only.
- Review product-master images for one SKU family only.
- Review background/textures only.
- Review social-template assets only.
- Review identity-logo assets but do not approve a final logo without human confirmation.

## Output Format

Use this exact structure:

```text
Big Pickle review complete.

P0:
- path: ...
  use: ...
  reason: ...
  implementation safety: ...

P1:
- path: ...
  use: ...
  reason: ...
  implementation safety: ...

Do not use yet:
- path: ...
  reason: ...

Recommended Codex task:
TASK: ...
FILES ALLOWED: ...
FORBIDDEN: ...
VALIDATION: ...

Next Big Pickle review task:
...
```

