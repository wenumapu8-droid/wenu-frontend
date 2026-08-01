# Deployment readiness report

Date: 2026-05-09
Branch: `redesign-v2`
Commit checked: `688b1b6` plus local deployment config/report changes

## Build status

Passed with Node `v24.14.1`.

Commands run:

```bash
PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run build
PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run build:cloudflare
```

Result:

- Astro output mode: `static`
- Build directory: `/Users/user1/wenu-frontend/dist/`
- Pages built: `82`
- `npm run build` completed successfully.
- `npm run build:cloudflare` completed successfully with network access and produced the same 82-page static output.

Known runtime requirement:

- Node must be `>=22.12.0`.
- Local successful runtime: Node `v24.14.1`.
- Cloudflare Pages should set `NODE_VERSION=24`.

## Static output

- Astro config uses `output: 'static'`.
- Build output directory is `dist`.
- `dist` is the final static output directory for Cloudflare Pages.

## `/aftercare/` status

`/aftercare/` is static and ready for Cloudflare Pages hosting.

Verified assets expected in `dist` after build:

- `dist/index.html` - present
- `dist/aftercare/index.html` - present, 32 KB
- `dist/aftercare/wm-header.mp4` - present, 2.2 MB
- `dist/downloads/wenu-mapu-aftercare-guide.pdf` - present, 80 KB

Static aftercare markers verified in `dist/aftercare/index.html`:

- `<body class="wm-page">`
- `<h1>Ritual Aftercare</h1>`
- `/aftercare/wm-header.mp4?v=540p`

The aftercare page can be hosted by Cloudflare Pages without the local Mac, localhost, `npx serve`, or Cloudflare Tunnel.

## Cloudflare Tunnel status

Cloudflare Tunnel can be retired for production static hosting only after Cloudflare Pages is connected, deployed, verified, and the custom domain is moved to Pages.

Do not retire the Tunnel before DNS/custom-domain cutover is complete.

## Recommended Cloudflare Pages settings

- Framework preset: `Astro`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root, unless this app is inside a monorepo subdirectory
- Node version environment variable: `NODE_VERSION=24`
- Production branch: do not use `main` until approved. Use `redesign-v2` for preview only.

Required build environment variables:

```text
NODE_VERSION=24
WC_URL=https://www.wenumapuonline.com/wp-json/wc/v3
WC_CONSUMER_KEY=<WooCommerce read-only consumer key>
WC_CONSUMER_SECRET=<WooCommerce read-only consumer secret>
```

## Deployment blocker risks

- WooCommerce can still build empty if the API/network fails after credentials are present.
- Forms still use Formspree placeholder endpoints.
- The full site is not safe to publish as the final e-commerce production site.
- `/piercing`, `/hangers`, and `/shipping` full-site route blockers remain intentionally unresolved.
- These blockers do not change the architecture conclusion: Cloudflare Pages is the correct static hosting target to remove local-computer dependency.

## Deployment options

Option A: deploy the whole `redesign-v2` site to a Cloudflare Pages preview URL only.

- Safe for architecture validation.
- Does not affect `wenumapuonline.com`.
- Recommended first step.

Option B: deploy only aftercare to a temporary Cloudflare Pages project/subdomain.

- Safest public option if the goal is to publish aftercare without exposing the unfinished full storefront.
- Avoids production e-commerce risk.
- Recommended if `/aftercare/` must go public before the full site is fixed.

Option C: deploy the whole site to production domain `wenumapuonline.com`.

- Not recommended.
- Only safe after WooCommerce empty-build behavior, form placeholders, and route decisions are resolved.

## Safe deployment option

Recommended: Option A first, then Option B if a public aftercare-only URL is needed before full storefront readiness.

Do not use Option C yet.

## Exact next commands

Local verification:

```bash
cd /Users/user1/wenu-frontend
git status --short --branch
PATH=/Users/user1/.nvm/versions/node/v24.14.1/bin:$PATH npm run build
test -f dist/index.html
test -f dist/aftercare/index.html
test -f dist/downloads/wenu-mapu-aftercare-guide.pdf
test -f dist/aftercare/wm-header.mp4
ls -lh dist/aftercare/index.html dist/aftercare/wm-header.mp4 dist/downloads/wenu-mapu-aftercare-guide.pdf
```

Cloudflare Pages verification after preview deploy:

```bash
curl -I https://<pages-preview-host>/aftercare/
curl -I https://<pages-preview-host>/aftercare/wm-header.mp4
curl -I https://<pages-preview-host>/downloads/wenu-mapu-aftercare-guide.pdf
```

## Final verdict

READY FOR CLOUDFLARE PAGES PREVIEW

Production domain verdict: NOT READY FOR PRODUCTION DOMAIN until WooCommerce empty-build behavior, placeholder forms, and full-site route blockers are resolved.
