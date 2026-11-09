# KODEX SVG Pack v1

A modular, transparent-background SVG starter system for KODEX−∞.

## Included

1. `01-kodex-logo-kit.svg` — geometric wordmark, stacked mark, K−∞ mark, infinity mark and seal.
2. `02-kodex-symbol-language.svg` — archive, eye, scan, growth, protection, serpent, solar disk and portal symbols.
3. `03-kodex-ui-buttons.svg` — primary, secondary, destructive and commercial CTA shells.
4. `04-kodex-navigation-progress.svg` — scene navigation, progress and journey controls.
5. `05-kodex-frames-panels.svg` — modular panel shells, drawers, banners and corner systems.
6. `06-kodex-status-alerts.svg` — status chips and alert modules.
7. `07-kodex-data-barcodes.svg` — barcodes, matrix codes and metadata labels.
8. `08-kodex-signal-graphics.svg` — waveforms, spectra and orbit graphics.
9. `09-kodex-hero-motifs.svg` — pattern tree, archive eye, solar disk, cosmic serpent, portal and monolith.
10. `10-kodex-textures-patterns.svg` — vector grid, scanline, dot, dither and circuit patterns plus procedural noise.
11. `kodex-sprite.svg` — reusable core symbols for inline `<use>` workflows.
12. `kodex-tokens.css` — palette and utility classes.

## Important

These are original vector redraws built from geometric paths and reusable SVG primitives. They are not auto-traced versions of the AI concept boards. This makes them cleaner, editable and suitable for code.

## Use in HTML

```html
<svg class="kdx-svg kdx-svg--lime" viewBox="0 0 680 100" aria-label="KODEX">
  <use href="/assets/kodex-sprite.svg#kdx-logo"></use>
</svg>
```

Some browsers and build systems restrict external `<use>` references. In that case, inline `kodex-sprite.svg` once in the document or import the desired SVG through your framework's SVG loader.

## Editing

Open the files in Figma, Illustrator, Affinity Designer or Inkscape. All canvases use `viewBox`, transparent backgrounds and named groups. Elements use `currentColor` wherever practical, so color can be controlled with CSS.

## Production note

The KODEX wordmark is a functional geometric v1. Before trademark filing or large-format manufacture, run a final optical refinement pass on spacing, diagonals and the infinity relationship.
