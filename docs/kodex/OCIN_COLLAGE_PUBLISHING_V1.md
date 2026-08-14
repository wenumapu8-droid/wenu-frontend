# OCÍN COLLAGE PUBLISHING V1

Status: IMPLEMENTED CANDIDATE / INTERNAL REVIEW
Creator direction: Ocín / Nicolás Ortega, 2026-08-13
Branch: `feature/ocin-kodex-collage-pages-v1`
Parent lineage: `feature/ocin-authorial-lab-v0` / PR #58

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
| 00.01 | `/kodex/lab/ocin-collage/` | THRESHOLD collage | IMPLEMENTED CANDIDATE / NOINDEX |
| 00.02 | `/kodex/lab/ocin-collage/archive/` | ARCHIVE ATLAS | IMPLEMENTED CANDIDATE / NOINDEX |
| 00.03 | `/kodex/lab/ocin-collage/museum/` | MUSEUM OF SPACE | IMPLEMENTED CANDIDATE / NOINDEX |

Mobile is a responsive state of the same publishing system, not a separate artwork or route.

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
- available only to internal/noindex lab pages;
- currently points at the creator's Drive source for visual review;
- must never be used by a public route.

`productionSrc`
- must be same-origin or a controlled public asset origin;
- remains `null` until the approved bytes are vendored;
- public code must resolve only this field.

This is an explicit integrity gate. A page is not PUBLIC READY while any required `productionSrc` is null.

## Blocking security finding

All six inspected Drive source files currently expose an `anyone: writer` permission.
Do not use those Drive URLs as the permanent public image origin. Correct the permission model or vendor immutable approved copies into the website/CDN first.

## Files added

- `src/lib/kodex/ocin/collage-pages-v1.ts`
- `src/components/kodex/ocin/OcinArtworkTile.astro`
- `src/components/kodex/ocin/OcinCollageShell.astro`
- `src/styles/kodex-ocin-collage.css`
- `src/pages/kodex/lab/ocin-collage/index.astro`
- `src/pages/kodex/lab/ocin-collage/archive.astro`
- `src/pages/kodex/lab/ocin-collage/museum.astro`

## Acceptance gates before public promotion

1. Vendor approved artwork bytes to `public/assets/kodex/ocin/originals/` or controlled CDN.
2. Set `productionSrc` for every published work.
3. Verify hashes/provenance against the source registry.
4. Build passes.
5. Browser evidence at desktop + 390×844 + 412×915.
6. Reduced-motion evidence.
7. No horizontal overflow.
8. No artwork-level filters/transforms/crops.
9. Creator visual review.
10. Only then create/replace public routes and change robots to `index, follow`.

## Expansion path

The layout is data-driven. Do not hand-code one page per artwork. Expand `OCIN_COLLAGE_ASSETS_V1` from the curated seed toward the complete registry, then compose scene-specific selections from IDs. This allows the full Ocín archive to enter KODEX without losing provenance or visual integrity.
