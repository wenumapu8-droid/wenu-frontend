# 02 — Descent Tunnel

**ID:** `KDX_SCENE_02_DESCENT`  
**Theme:** `descent`  
**Purpose:** Move the visitor from interface surface into spatial depth.

## Core composition

- Desktop grid: 12 columns
- Mobile grid: 4 columns
- Major ratio: 3:1
- Density: 0.64
- Negative space: 22%
- Headline: **DESCEND THROUGH THE SIGNAL**
- Primary CTA: **CONTINUE DESCENT**
- Visual anchor: wireframe tunnel, split vanishing field or warped corridor

## Render split

### WebGL
- tunnel
- grid warp
- fog
- depth markers

### SVG
- distance scale
- side rails
- vector labels

### DOM
- headline
- descent progress
- CTA

## Zones

| Zone | Role | Desktop x/y/w/h | Mobile x/y/w/h | Renderer | Motion |
|---|---|---|---|---|---|
| `headline` | display | [0.04, 0.05, 0.42, 0.18] | [0.04, 0.05, 0.86, 0.15] | dom | none |
| `tunnel` | hero | [0.12, 0.18, 0.76, 0.68] | [0.04, 0.24, 0.92, 0.54] | webgl | gridWarpLow |
| `distance_rail` | rail | [0.9, 0.18, 0.06, 0.68] | [0.04, 0.8, 0.92, 0.06] | svg | scanSoft |
| `progress` | data | [0.04, 0.34, 0.06, 0.46] | [0.04, 0.88, 0.42, 0.05] | dom | dataTick |
| `cta` | action | [0.72, 0.88, 0.24, 0.08] | [0.5, 0.88, 0.46, 0.05] | dom | none |

## Motion stack

- `gridWarpLow` → tunnel · low
- `scanSoft` → distance_rail · medium
- `dataTick` → progress · medium
- `stateOpen` → tunnel · critical · trigger `cta`

## Interaction

- **pointer:** bias tunnel vanishing point within 4% range
- **click:** advance depth step
- **wheel:** disabled for navigation; optional micro-depth only
- **keyboard:** ArrowDown advances

## Event

```ts
document.addEventListener("kodex:descent-complete", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Fallback

CSS perspective grid with opacity transition

## QA

- [ ] no vertical scroll
- [ ] vanishing point remains stable
- [ ] mobile tunnel keeps >=42% viewport height
