# Handoff — 2026-05-09 — Asset 07 (Footer Pattern Band) + Asset 08 (Ritual Divider) + Asset Slot System

Status: **Mode A (prompt-only)**. No source SVG / canvas output has been received from Claude Design yet. This folder is the skeleton awaiting that output. No files generated. No credits spent. No assets integrated into Astro.

If/when Claude Design (or any other source) produces SVG or raster for these assets, the user pastes the output into a per-asset prompt or asset file in this folder, and the next agent runs the manifest update + moves through Mode B → C → D per `wenu-visual-agent-plan.md` §3.

---

## 1. Intent

These three pieces close the most-visible gap between Wenu Mapu's current placeholder geometry (the existing `PatternBand.astro` is a generic placeholder per Phase 1 blocker #2) and a brand-true visual system grounded in Mapuche textile geometry.

| Asset | Slot | Why |
|---|---|---|
| Asset 07 — Footer Pattern Band | bottom of `Footer.astro` (replaces current placeholder band) | Gives the brand its strongest "signature shape" at the most-seen point in every page. |
| Asset 08 — Ritual Divider | between major sections on home + landings | Replaces the generic `.section-divider` PatternBand instances with a brand-specific divider mark that reads as ceremonial, not decorative. |
| Asset Slot System | `src/components/visual/AssetSlot.astro` | A wrapper that lets future SVG/raster assets be dropped into pages with consistent loading, sizing, and accessibility behavior. Per `claude-design-integration-plan.md` §3. |

---

## 2. Brand context (binding constraints)

- **Palette:** Obsidian #080706, Bone #F2EDE4, Sand #D6C1A3, Silver #A8A39A, Bronze #8A6A43, Ember #C4935A. (Per `~/wenu-frontend/CLAUDE.md`.)
- **Voice:** dark ritual luxury. Negative-space dominant. No clutter. No decoration for decoration's sake.
- **Cultural:** Mapuche-derived patterns must be either authentically sourced (cite the source) or honest abstractions. **No invented "tribal" patterns.** Founder review required for any pattern explicitly labeled Mapuche.
- **Forbidden aesthetics:** boho, festival, generic new age, cyberpunk, fantasy cliché, AI clip-art look.
- **Forbidden treatments:** drop shadows, glows, soft halos, watermarks, model signatures.

---

## 3. Asset 07 — Footer Pattern Band

### Slot

`src/components/Footer.astro` — currently:

```astro
<div class="footer-v2__band" aria-hidden="true">
  <PatternBand variant="band" tone="bronze" />
</div>
```

`PatternBand.astro` is a placeholder per Phase 1 blocker #2. Asset 07 replaces what `PatternBand` renders when `variant="band"`, OR adds a new `<svg>` inline that supersedes it, OR loads a URL-served SVG from `public/assets/patterns/`.

### Visual brief

A horizontal band, 12:1 ratio (e.g., 2400 × 200 px), placed at the bottom of every page.

- **Composition:** a single repeating textile-derived motif, hairline strokes, abstract diamond/zigzag/step pattern (echoes Mapuche `lukutuwe` or `wirin` textile geometry without copying any restricted ceremonial pattern).
- **Color:** Bronze (`#8A6A43`) lines on transparent / Obsidian background. The band sits on the dark footer.
- **Density:** 50–70% negative space. The pattern reads as restraint, not as ornament.
- **Stroke:** 1–1.5 px hairline. No fills. No gradients.
- **Mobile rule:** scales down cleanly without losing readability at 32 px tall.
- **Desktop rule:** sits at 56 px tall.

### Output format

- **Preferred:** SVG, < 6 KB, optimized via SVGO.
- **Acceptable:** transparent PNG, 2400 × 200 px, < 60 KB (smaller is better — band is on every page).

### Acceptance criteria

- ✅ Reads as Wenu Mapu (matches Obsidian/Bone/Bronze palette discipline).
- ✅ Reads as a textile band, not as decoration.
- ✅ At 32 px on mobile, the motif is still distinct.
- ✅ At 56 px on desktop, the motif breathes — no over-density.
- ✅ Honors negative-space rule (50–70%).
- ✅ Founder confirms no Mapuche cultural restriction is violated.
- ✅ File ≤ 6 KB SVG OR ≤ 60 KB PNG.
- ✅ No raster embedded inside SVG.

### Final paths (when approved)

- SVG: `public/assets/patterns/footer-band-mapuche-textile.svg`
- Astro consumer: `src/components/visual/PatternBand.astro` (extend current component to load from this path when `variant="band"`)

---

## 4. Asset 08 — Ritual Divider

### Slot

Replaces or augments the current `.section-divider` (which uses `<PatternBand variant="hairline" tone="bronze" />`) at three positions in `src/pages/index.astro`:

1. After CategoryStrip (before Featured)
2. After Sacred Territory (before Truckee)
3. After USPs (before Newsletter)

Also usable on `/piercing`, `/hangers`, `/amulets`, `/ear-weights`, `/ritual-objects`, `/material/*`, `/collection/*`, `/sizing-guide`, `/faq` (already wrapped via the existing `<PatternBand>` in those landings).

### Visual brief

A small centered ornament — not a band — that punctuates major section breaks.

- **Composition:** a cardinal / cross / four-points motif, abstract, drawn in hairline. Echoes the cardinal-cross idea from `CardinalGrid.astro` without copying it. Could be 4 short lines radiating from a centerpoint, or a single small diamond, or a vertical stack of two thin marks.
- **Width:** ~240 px max.
- **Height:** ~24 px.
- **Color:** Bronze (`#8A6A43`) hairline on transparent.
- **Composition rule:** the divider is a PUNCTUATION, not a banner. If it draws the eye more than the content above/below, it's wrong.

### Output format

- **Preferred:** SVG, < 2 KB.

### Acceptance criteria

- ✅ Reads as ceremonial, not decorative.
- ✅ Distinct from the Footer band — same family, different role.
- ✅ Honors `prefers-reduced-motion` if any animation is added (default: no animation).
- ✅ File ≤ 2 KB SVG.

### Final paths (when approved)

- SVG: `public/assets/dividers/ritual-divider-cardinal.svg`
- Astro consumer: `src/components/visual/RitualDivider.astro` (NEW component per `claude-design-integration-plan.md` §3)
- Variant prop: `variant: "hairline" | "ornament"` so the existing call sites can be migrated incrementally.

---

## 5. Asset Slot System (`AssetSlot.astro`)

### Purpose

A reusable wrapper that consumes any visual asset (SVG, raster) with consistent:
- aspect-ratio handling
- lazy-load defaults
- `srcset` / `sizes` for raster
- accessibility (alt text, aria-hidden when decorative)
- fallback (generic dark placeholder on missing src)

This component is designed in `claude-design-integration-plan.md` §3 and implemented as part of integrating Asset 07 + Asset 08.

### Props

```ts
interface AssetSlotProps {
  src: string;                 // path under public/assets/ or public/img/
  alt: string;                 // empty string for decorative; non-empty for content
  aspectRatio?: string;        // e.g., "12 / 1" for the footer band, "1 / 1" for square
  loading?: 'lazy' | 'eager';  // default 'lazy'
  sizes?: string;              // for raster srcset — default "100vw"
  decorative?: boolean;        // when true, sets aria-hidden + role="presentation"
}
```

### Acceptance criteria

- ✅ Renders SVG inline if `src` ends in `.svg` and is under inline cap (6 KB)
- ✅ Renders `<picture>` with AVIF + WebP for raster sources
- ✅ Honors `prefers-reduced-motion` (no animation defaults)
- ✅ Falls back gracefully on missing source (placeholder, not broken image icon)
- ✅ Build passes; no console warnings

### Final path (when implemented)

- `src/components/visual/AssetSlot.astro` (NEW)

---

## 6. Token / class deltas (to apply when assets land)

### `src/styles/tokens.css` (append only — never replace)

No new color tokens needed (palette already complete). Only add if Asset 07 or Asset 08 introduces a new line weight or pattern density that needs naming. Default: no token additions.

### `src/styles/global.css` (append only)

Possibly one new utility class:

```css
.divider-ornament {
  display: flex;
  justify-content: center;
  margin: var(--space-l) auto;
  max-width: 240px;
  opacity: 0.65;
}
```

Only add if `RitualDivider.astro` needs a wrapper class beyond what `<AssetSlot>` provides.

---

## 7. Approval criteria (binding)

Before any of these assets enter production:

1. ✅ Owner approves the spec in this file (Mode A).
2. ✅ Source SVG / canvas output is provided by Claude Design (or alternative tool — owner choice).
3. ✅ Asset passes Gates G1–G5 in `wenu-visual-agent-plan.md` §7.
4. ✅ Cultural review by founder for any Mapuche-derived motif.
5. ✅ Per-commit approval for the integration commit.
6. ✅ `npm run build` green; postbuild assertion still ≥ 64 product pages.

---

## 8. Constraints (do NOT do)

- ❌ Do NOT generate the assets autonomously tonight. No credits spent.
- ❌ Do NOT modify `Footer.astro` until both assets are approved AND the user explicitly authorizes the integration commit.
- ❌ Do NOT create a parallel `index.html` at the repo root.
- ❌ Do NOT introduce a second design tokens file or styles folder.
- ❌ Do NOT touch homepage `src/pages/index.astro` outside of changing what `PatternBand` / new RitualDivider renders. Do not restructure sections.
- ❌ Do NOT modify Aftercare files.

---

## 9. Status

| Asset | Mode | Source provided? | Generations used | Approval | Final path |
|---|---|---|---|---|---|
| Asset 07 — Footer Pattern Band | A (prompt-only) | NO | 0 / 2 max | pending | `public/assets/patterns/footer-band-mapuche-textile.svg` |
| Asset 08 — Ritual Divider | A (prompt-only) | NO | 0 / 2 max | pending | `public/assets/dividers/ritual-divider-cardinal.svg` |
| Asset Slot System | design only | n/a | n/a | pending | `src/components/visual/AssetSlot.astro` |

**Next step:** owner provides the Claude Design output (paste SVG into this folder OR attach as `asset-07-claude-design-v1.svg` / `asset-08-claude-design-v1.svg`). Then a follow-up agent updates `manifest.json` (to be created with the first source file) and proceeds with Mode B/C.

---

## 10. Reference inputs (when available)

If/when reference images for the textile motif arrive, place them here:

- `reference-asset-07-1.jpg` — primary Mapuche textile reference (cite source)
- `reference-asset-07-2.jpg` — secondary reference
- `reference-asset-08-1.jpg` — cardinal cross reference

These are NEVER generated; they are real photographs or scans owned/licensed by the brand.
