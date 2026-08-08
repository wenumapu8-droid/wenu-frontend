# 06 — Ghost Hardware

**ID:** `KDX_SCENE_06_GHOST`  
**Theme:** `ghost`  
**Purpose:** Create a restrained documentary interlude with near-monochrome visual evidence.

## Core composition

- Desktop grid: 12 columns
- Mobile grid: 4 columns
- Major ratio: 3:2
- Density: 0.62
- Negative space: 30%
- Headline: **MEMORY LEAVES HARDWARE BEHIND**
- Primary CTA: **READ TRACE**
- Visual anchor: high-contrast monochrome artifact, silhouette or machine trace

## Render split

### WebGL
- subtle threshold noise only

### SVG
- measurement lines
- technical annotations
- frame

### DOM
- headline
- short editorial statement
- CTA
- trace metadata

## Zones

| Zone | Role | Desktop x/y/w/h | Mobile x/y/w/h | Renderer | Motion |
|---|---|---|---|---|---|
| `headline` | display | [0.04, 0.05, 0.64, 0.18] | [0.04, 0.05, 0.92, 0.14] | dom | none |
| `trace` | hero | [0.04, 0.25, 0.58, 0.6] | [0.04, 0.23, 0.92, 0.48] | webgl | breathSlow |
| `statement` | editorial | [0.66, 0.27, 0.3, 0.24] | [0.04, 0.74, 0.92, 0.1] | dom | none |
| `metadata` | data | [0.66, 0.55, 0.3, 0.18] | [0.04, 0.86, 0.62, 0.08] | dom | dataTick |
| `cta` | action | [0.66, 0.76, 0.3, 0.09] | [0.7, 0.86, 0.26, 0.08] | dom | none |
| `footer` | footer | [0.04, 0.91, 0.92, 0.05] | [0.04, 0.97, 0.92, 0.02] | svg | scanSoft |

## Motion stack

- `breathSlow` → trace threshold · low
- `scanSoft` → footer · medium
- `glitchMicro` → trace · high · trigger `trace_found`

## Interaction

- **pointer:** none or nearly imperceptible
- **click:** reveal one trace annotation
- **keyboard:** Enter reveals trace
- **audio:** disabled by default

## Event

```ts
document.addEventListener("kodex:ghost-trace-open", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Fallback

static threshold image

## QA

- [ ] near-monochrome
- [ ] red accent <=4%
- [ ] motion never competes with editorial reading
