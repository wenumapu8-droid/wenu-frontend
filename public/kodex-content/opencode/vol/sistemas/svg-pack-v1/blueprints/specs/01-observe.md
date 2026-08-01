# 01 — Observation Eye

**ID:** `KDX_SCENE_01_OBSERVE`  
**Theme:** `observe`  
**Purpose:** Introduce the system as an observer that reacts to presence, pointer and signal.

## Core composition

- Desktop grid: 12 columns
- Mobile grid: 4 columns
- Major ratio: 2:1
- Density: 0.74
- Negative space: 18%
- Headline: **THE ARCHIVE IS WATCHING**
- Primary CTA: **ALLOW OBSERVATION**
- Visual anchor: procedural eye or sensor aperture

## Render split

### WebGL
- eye
- pupil response
- feedback
- noise

### SVG
- sensor rings
- reticle
- telemetry graph

### DOM
- headline
- status rail
- CTA
- labels

## Zones

| Zone | Role | Desktop x/y/w/h | Mobile x/y/w/h | Renderer | Motion |
|---|---|---|---|---|---|
| `headline` | display | [0.04, 0.06, 0.54, 0.18] | [0.04, 0.05, 0.88, 0.16] | dom | none |
| `eye` | hero | [0.18, 0.2, 0.58, 0.62] | [0.08, 0.25, 0.84, 0.42] | webgl | breathSlow |
| `telemetry` | data | [0.76, 0.22, 0.2, 0.42] | [0.04, 0.7, 0.44, 0.16] | svg | dataTick |
| `sensor_rail` | rail | [0.04, 0.3, 0.12, 0.46] | [0.52, 0.7, 0.44, 0.16] | dom | scanSoft |
| `cta` | action | [0.76, 0.7, 0.2, 0.1] | [0.04, 0.89, 0.92, 0.07] | dom | none |
| `footer` | footer | [0.04, 0.91, 0.92, 0.05] | [0.04, 0.98, 0.92, 0.02] | dom | dataTick |

## Motion stack

- `breathSlow` → eye · low
- `nodePing` → sensor rings · medium
- `dataTick` → telemetry · medium
- `glitchMicro` → eye · high · trigger `state_change`

## Interaction

- **pointer:** pupil follows with capped displacement
- **click:** switch DORMANT → AWARE → OPEN
- **audio:** low/mid/high affect dilation, warp and grain
- **keyboard:** Space changes state

## Event

```ts
document.addEventListener("kodex:observe-open", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Fallback

three-state SVG eye

## QA

- [ ] pupil displacement capped
- [ ] telemetry never overlaps headline
- [ ] glitch is episodic only
