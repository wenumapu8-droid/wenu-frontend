# OCÍN COLLAGE PUBLISHING V1

Status: BUILD + BROWSER VERIFIED / INTERNAL NOINDEX REVIEW
Creator direction: Ocín / Nicolás Ortega, 2026-08-13
Branch: `feature/ocin-kodex-collage-pages-v1`
Parent lineage: `feature/ocin-authorial-lab-v0` / PR #58
PR: #61 — `KODEX: Ocín original-art collage publishing pages v1`

## Objective

Make Ocín's authorial archive the visual material of KODEX without generating substitute artwork.
The interface is allowed to organize relationships around a work; it is not allowed to redraw the work.

## Non-negotiable artwork rule

For an Ocín original rendered inside the collage system:

- preserve aspect ratio;
- use `object-fit: contain`;
- no artistic crop;
- no recolor;
- no CSS filter;
- no blend mode over the artwork;
- no distortion or transform of the artwork element;
- no generative replacement;
- no invented scientific/cultural meaning;
- UI, metadata, navigation and motion live outside the artwork surface.

Responsive scaling is presentation, not modification. Any future animated derivative requires a separate creator-approved derivative record.

## V1 pages

| Plate | Route | Surface | Status |
|---|---|---|---|
| 00.01 | `/kodex/lab/ocin-collage/` | THRESHOLD collage | BUILD + BROWSER VERIFIED / NOINDEX |
| 00.02 | `/kodex/lab/ocin-collage/archive/` | ARCHIVE ATLAS | BUILD + BROWSER VERIFIED / NOINDEX |
| 00.03 | `/kodex/lab/ocin-collage/museum/` | MUSEUM OF SPACE | BUILD + BROWSER VERIFIED / NOINDEX |

Desktop and mobile are states of the same publishing system. Desktop remains a fixed KODEX plate. Mobile is also a fixed `100dvh` scene: no page-level vertical scroll. Supporting originals live in an internal horizontal archive strip so navigation can remain tactile without turning KODEX into a conventional scrolling page.

## V1 source works

| ID | Source filename | SHA-256 | Source size |
|---|---|---|---|
| OCN-TOR-005 | `image3A30005_mirror.jpg` | `79f907e6fe6a64ec1f6f8bff7d7fb7cbf6b2218f74421f97562bc77a47123e3b` | 1066×2814 |
| OCN-TOR-001 | `image3A30006_mirror3.jpg` | `fb6cbb2f89d4846e1fafe08cea16b33d46480d9fb6ebe13d395d900d678791a4` | 1575×2048 |
| OCN-SQR-001 | `image3A30110_mirror.jpg` | `552a23b946106c54d77353e62280e1234dfdf2297ca098ce11d37c0e77a43149` | 2048×2048 |
| OCN-FRC-002 | `image3A30006_mirror2.jpg` | `ac1153bdd24203a569ebd16f72f80d4fa0f43b8db404b5d3b628e2470d8d5689` | 2048×2048 |
| OCN-TRI-001 | `image3A30212_mirror5.jpg` | `7df364b4edb7993722b530410723ac3a33d5808cac43bd3295d6788f75e4d087` | 1222×2451 |
| OCN-MND-GRY-002 | `image3A30213_mirror5.jpg` | `53c397f8e9931dc15bf0e6ca1ee6d8c211e775fa84a3f7a3753c8c0477c2b805` | 2048×2048 |

## Source-mode separation

`reviewSrc`
- retains the creator Drive source reference for internal provenance/review only;
- must never be used as the permanent public runtime image origin.

`productionSrc`
- is populated for all six V1 works;
- resolves to checksum-verified same-origin files under `public/assets/kodex/ocin/originals/`;
- is the only source used by the current QA page renders.

The vendoring workflow downloads each source, verifies its registered SHA-256 and refuses to publish changed bytes. The original Drive permissions therefore do not become a runtime dependency.

## Security finding and resolution

All six inspected Drive provenance files currently expose an `anyone: writer` permission. Those URLs remain unsuitable as permanent public image origins.

V1 resolves that publication risk by vendoring immutable checksum-verified copies into the repository. Drive remains provenance/source storage; public rendering uses controlled same-origin assets. A future Drive permission cleanup is still desirable, but it is no longer a blocker for these vendored bytes.

## Files / contracts added

- `src/lib/kodex/ocin/collage-pages-v1.ts`
- `src/components/kodex/ocin/OcinArtworkTile.astro`
- `src/components/kodex/ocin/OcinCollageShell.astro`
- `src/styles/kodex-ocin-collage.css`
- `src/styles/kodex-ocin-collage-mobile.css`
- `src/pages/kodex/lab/ocin-collage/index.astro`
- `src/pages/kodex/lab/ocin-collage/archive.astro`
- `src/pages/kodex/lab/ocin-collage/museum.astro`
- `scripts/vendor-ocin-collage-assets.mjs`
- `scripts/qa-ocin-collage.mjs`
- `.github/workflows/ocin-collage-asset-vendor.yml`
- `.github/workflows/ocin-collage-qa.yml`

## Verified acceptance evidence

Latest code checkpoint tested before this documentation sync: `272cb9ee495016edf935470c73d3795797264062`.

- KODEX Vertical Slice #145: SUCCESS.
- Ocín Collage Browser QA #10: SUCCESS.
- Browser evidence artifact ID: `9209795052`.
- Evidence digest: `sha256:e6302fec5f4f7d428d4c18b1c1edccbbd8b6e873eb0fc261d84e677bbe00534e`.
- Desktop: THRESHOLD, ARCHIVE ATLAS and MUSEUM OF SPACE at 1440×1000.
- Mobile: all three surfaces at 390×844.
- Reduced-motion: MUSEUM OF SPACE at 412×915.
- Page-level horizontal overflow: 0 px on every audited viewport.
- Page-level vertical overflow: 0 px on every audited viewport.
- Every visible original loaded with `object-fit: contain`, `filter: none`, `transform: none`, `mix-blend-mode: normal`, `clip-path: none`, `opacity: 1`.
- All declared artwork records retain provenance IDs.
- Reduced-motion transition and animation duration resolve to 0.001 ms.

## Publication gates

Completed:

1. Vendor approved artwork bytes to `public/assets/kodex/ocin/originals/`.
2. Set `productionSrc` for every V1 work.
3. Verify hashes/provenance against the source registry.
4. Pass Astro production build and runtime checks.
5. Capture desktop evidence.
6. Capture 390×844 mobile evidence for all three surfaces.
7. Capture 412×915 reduced-motion evidence.
8. Verify zero page overflow and no artwork-level filter/transform/crop.

Still required before public deployment:

9. Ocín visual acceptance of the final plate compositions.
10. Promote accepted lab/noindex routes into the chosen public KODEX route architecture.
11. Integrate PR #61 through its parent lineage (PR #58) into the production branch.
12. Deploy and perform a final public-URL smoke test before marking `DEPLOYED`.

Do not collapse `BUILD VERIFIED`, `BROWSER VERIFIED` and `DEPLOYED` into the same status. V1 is verified code, not a deployed public release.

## Expansion path

The layout is data-driven. Do not hand-code one page per artwork. Expand `OCIN_COLLAGE_ASSETS_V1` from the curated seed toward the complete registry, then compose scene-specific selections from IDs. This allows the full Ocín archive to enter KODEX without losing provenance or visual integrity.
