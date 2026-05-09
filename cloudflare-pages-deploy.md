# Cloudflare Pages deployment notes

Scope: prepare `redesign-v2` for static hosting on Cloudflare Pages so production no longer depends on a local Mac, `npx serve`, localhost, or Cloudflare Tunnel.

## Recommended Cloudflare Pages settings

- Framework preset: `Astro`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: `/` if the GitHub repository root is `wenu-frontend`; otherwise set it to the repo subdirectory that contains this `package.json`.
- Production branch: do not use `main` yet. Use `redesign-v2` for preview deployments, or a dedicated deployment branch such as `deploy/aftercare-pages` if you want isolation.
- Node version environment variable: `NODE_VERSION=24`

Optional equivalent build command:

```bash
npm run build:cloudflare
```

`build:cloudflare` currently maps directly to `astro build`. It exists only to make Cloudflare-specific intent explicit.

## Required environment variables

Set these in Cloudflare Pages project settings under Environment variables:

```text
NODE_VERSION=24
WC_URL=https://www.wenumapuonline.com/wp-json/wc/v3
WC_CONSUMER_KEY=<WooCommerce read-only consumer key>
WC_CONSUMER_SECRET=<WooCommerce read-only consumer secret>
```

Notes:

- `WC_URL` is optional in code because it has a default, but setting it explicitly in Cloudflare is clearer.
- `WC_CONSUMER_KEY` and `WC_CONSUMER_SECRET` are required at build time. Without them, `src/lib/woo.ts` throws and the build fails.
- Do not commit WooCommerce credentials.

## WooCommerce API considerations

This Astro site is static. WooCommerce product data is fetched at build time, then written into static HTML and JSON in `dist`.

Current known risk: if WooCommerce network/API requests fail after credentials are present, `getProducts()` catches the error and returns `[]`. That can allow a successful build with:

- zero product detail pages under `/p/`
- an empty `/search-index.json`
- no featured products on the home page
- an empty/no-products shop surface

This is a storefront blocker, but it does not block proving the Cloudflare Pages deployment architecture or hosting `/aftercare/` statically.

## GitHub connection flow

1. Push the intended deployment branch to GitHub only after approval.
2. In Cloudflare dashboard, open `Workers & Pages`.
3. Choose `Create application`.
4. Choose `Pages`.
5. Choose `Connect to Git`.
6. Authorize GitHub and select the Wenu frontend repository.
7. Select the deployment branch. Recommended for now: `redesign-v2` for preview only, not `main`.
8. Apply the build settings above.
9. Add environment variables before the first production-like build.
10. Trigger a deploy.

## Custom domain setup

Do not point `wenumapuonline.com` at this Pages project until the full-site blockers are resolved and the user explicitly approves production cutover.

When approved:

1. In the Pages project, open `Custom domains`.
2. Add `wenumapuonline.com`.
3. Add `www.wenumapuonline.com` if you want the `www` host served by the same Pages project.
4. Let Cloudflare create/update the DNS records.
5. Remove or disable the old Tunnel route for the same hostname after Pages is serving successfully.
6. Verify both apex and `www` behavior.

## Verify `/aftercare/`

After a Cloudflare Pages deploy, verify:

```bash
curl -I https://<pages-preview-host>/aftercare/
curl -I https://<pages-preview-host>/aftercare/wm-header.mp4
curl -I https://<pages-preview-host>/downloads/wenu-mapu-aftercare-guide.pdf
```

Expected:

- `/aftercare/` returns `200`
- `/aftercare/` contains `Ritual Aftercare`, `wm-page`, and `/aftercare/wm-header.mp4?v=540p`
- `/aftercare/wm-header.mp4` returns `200` and `Content-Type: video/mp4`
- `/downloads/wenu-mapu-aftercare-guide.pdf` returns `200` and `Content-Type: application/pdf`
- `/aftercare/` does not render the storefront homepage

## Rollback

Preview deployments:

- Delete or ignore the preview deployment.
- No DNS rollback is needed if no custom domain was attached.

Production custom domain:

1. In Cloudflare Pages, open `Deployments`.
2. Select the last known good deployment.
3. Use `Rollback to this deployment`.
4. If the Pages project itself must be removed from production, detach the custom domain and restore the previous DNS/Tunnel routing only as a temporary fallback.

## Recommended path

Use Cloudflare Pages preview first. Do not attach `wenumapuonline.com` to the full redesign until the storefront blockers are fixed.

For publishing only aftercare without making the full redesign the production e-commerce site, create a temporary Pages project or branch that serves the static aftercare asset set separately. That avoids changing the live storefront while still removing the dependency on the local computer for the aftercare page.
