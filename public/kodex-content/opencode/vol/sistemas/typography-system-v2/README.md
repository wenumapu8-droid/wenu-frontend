# KODEX Typography System V2

Research-based typography handoff for the KODEX product.

## Contents

```text
fonts/
  kdx.font-manifest.json

tokens/
  kdx.typography.tokens.json

css/
  kdx.fonts.dev.css
  kdx.fonts.production.template.css
  kdx.typography.v2.css

runtime/
  kdx-font-loader.ts

astro/
  KdxTypographyProvider.astro

docs/
  KDX_TYPOGRAPHY_SPEC_V2.md
  INTEGRATION.md
  kdx.reference-font-map.json

demo/
  index.html
```

## Important

No font files are included.

`kdx.fonts.dev.css` uses Google Fonts for rapid prototyping. Production should
use the approved site font pipeline and load only the relevant scene bundle.

## Start

Open:

```text
demo/index.html
```

Review desktop, mobile and texture modes.

## Core decision

```text
Global:
Barlow Condensed
Inter Tight
IBM Plex Mono

Conditional:
Oxanium
Azeret Mono
Bodoni Moda
Libre Baskerville

Symbols:
KODEX SVG glyph registry
```
