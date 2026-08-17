# KODEX−∞ LIVE REVIEW — Direct Upload handoff

Status: PREPARED / EXECUTION BLOCKED

This handoff is for the isolated KODEX review preview only. It must not replace production `/kodex/`, modify apex/custom-domain routing, or be treated as a production release.

## Required authorization

Do not execute the deploy command until the creator provides the exact phrase:

`APROBAR DEPLOY`

Previous authorization does not carry over to this snapshot.

## Validated product source

The preview branch is rebuilt on top of product SHA:

`b76679719e37a43e79be412269c5a4ddec2c2ccc`

That source has exact-head PASS evidence for Product Corridor, AUTHORIAL_STATE, AUTHORIAL_MOTION and AUTHORIAL_TRANSITION. Preview-only commits above it add staging guards/docs/build preparation and do not change the KODEX product runtime.

## Local Cloudflare station

The known Pages project is `wenu-frontend`. Publication uses Cloudflare Pages Direct Upload through Wrangler.

```bash
cd /path/to/wenu-frontend
git fetch --all --prune
git checkout preview/kodex-live-review-2026-08-17
git pull --ff-only

PREVIEW_SHA="$(git rev-parse HEAD)"
[ -n "$PREVIEW_SHA" ] || { echo "NO HEAD — STOP"; exit 1; }

echo "Publishing isolated KODEX review snapshot: $PREVIEW_SHA"

ALLOW_EMPTY_PRODUCTS=true npm run build

test -f dist/_headers || { echo "NO _headers — STOP"; exit 1; }
grep -F 'X-Robots-Tag: noindex, nofollow, noarchive' dist/_headers || { echo "NO NOINDEX GUARD — STOP"; exit 1; }
test -f dist/kodex/index.html || { echo "NO KODEX ENTRY — STOP"; exit 1; }

npx wrangler pages deploy dist \
  --project-name=wenu-frontend \
  --branch=kodex-live-review-2026-08-17 \
  --commit-hash="$PREVIEW_SHA" \
  --commit-message="KODEX live review 2026-08-17"
```

If Cloudflare authentication is unavailable, stop and report:

`BLOCKED_CLOUDFLARE_AUTH`

with the exact failing command. Do not switch to production credentials or domain changes as a workaround.

## Required return evidence

After an authorized deploy, record all of the following before calling the preview published:

1. exact returned `*.pages.dev` preview URL;
2. exact deployed commit SHA;
3. HTTP 200 for `/kodex/`;
4. `X-Robots-Tag: noindex, nofollow, noarchive` verified on the live response;
5. desktop smoke;
6. 390×844 smoke;
7. 412×915 smoke;
8. end-to-end traversal through the dominant KODEX journey;
9. confirmation that `https://wenumapuonline.com/kodex/` and production domain routing were not changed.

Creator visual acceptance remains separate: each scene is `KEEP | REFINE | REJECT` only after live review.
