# 00 — Threshold Portal

**ID:** `KDX_SCENE_00_THRESHOLD`  
**Theme:** `threshold`  
**Purpose:** Establish access, tension and first consent to enter the KODEX universe.

## Core composition

- Desktop grid: 12 columns
- Mobile grid: 4 columns
- Major ratio: 8:5
- Density: 0.58
- Negative space: 28%
- Headline: **ENTER THE ARCHIVE**
- Primary CTA: **INITIALIZE**
- Visual anchor: central portal or membrane generated in WebGL

## Render split

### WebGL
- portal
- particles
- depth field
- signal response

### SVG
- orbit rings
- corner brackets
- authentication seal

### DOM
- headline
- microcopy
- CTA
- status metadata

## Zones

| Zone | Role | Desktop x/y/w/h | Mobile x/y/w/h | Renderer | Motion |
|---|---|---|---|---|---|
| `system_bar` | header | [0.03, 0.03, 0.94, 0.08] | [0.04, 0.03, 0.92, 0.07] | dom | dataTick |
| `headline` | display | [0.04, 0.18, 0.4, 0.28] | [0.04, 0.16, 0.82, 0.22] | dom | none |
| `portal` | hero | [0.38, 0.12, 0.56, 0.72] | [0.1, 0.34, 0.8, 0.42] | webgl | breathSlow |
| `auth` | status | [0.04, 0.62, 0.26, 0.14] | [0.04, 0.8, 0.5, 0.1] | svg | authFlash |
| `cta` | action | [0.04, 0.8, 0.22, 0.1] | [0.04, 0.91, 0.92, 0.06] | dom | none |
| `footer` | footer | [0.03, 0.92, 0.94, 0.05] | [0.04, 0.98, 0.92, 0.02] | dom | dataTick |

## Motion stack

- `breathSlow` → portal · low
- `scanSoft` → system_bar · medium
- `authFlash` → auth · high · trigger `ready`
- `stateOpen` → scene · critical · trigger `cta`

## Interaction

- **pointer:** subtle portal parallax only
- **click:** advance portal state and emit scene completion
- **audio:** optional low-frequency pressure
- **keyboard:** Enter activates CTA

## Event

```ts
document.addEventListener("kodex:threshold-open", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Fallback

static SVG portal with crossfade

## QA

- [ ] headline readable in <3 seconds
- [ ] CTA visible without hover
- [ ] background remains >=75% dark
