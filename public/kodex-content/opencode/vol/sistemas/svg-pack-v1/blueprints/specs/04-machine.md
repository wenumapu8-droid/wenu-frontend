# 04 — Ritual Machine

**ID:** `KDX_SCENE_04_MACHINE`  
**Theme:** `machine`  
**Purpose:** Expose the system as an instrument that accepts input and visibly changes state.

## Core composition

- Desktop grid: 12 columns
- Mobile grid: 4 columns
- Major ratio: 5:3
- Density: 0.78
- Negative space: 16%
- Headline: **THE MACHINE READS THE SIGNAL**
- Primary CTA: **ACTIVATE DEVICE**
- Visual anchor: original device, resonator, ring system or signal core

## Render split

### WebGL
- device core
- feedback
- energy
- audio response

### SVG
- controls
- rings
- frequency chart
- status tracks

### DOM
- headline
- control labels
- CTA
- status readout

## Zones

| Zone | Role | Desktop x/y/w/h | Mobile x/y/w/h | Renderer | Motion |
|---|---|---|---|---|---|
| `headline` | display | [0.04, 0.05, 0.5, 0.18] | [0.04, 0.05, 0.88, 0.15] | dom | none |
| `device` | hero | [0.24, 0.22, 0.52, 0.56] | [0.08, 0.24, 0.84, 0.42] | webgl | orbitalDrift |
| `controls` | controls | [0.04, 0.28, 0.16, 0.42] | [0.04, 0.69, 0.44, 0.16] | svg | dataTick |
| `readout` | data | [0.8, 0.28, 0.16, 0.42] | [0.52, 0.69, 0.44, 0.16] | dom | dataTick |
| `frequency` | graph | [0.24, 0.81, 0.52, 0.12] | [0.04, 0.87, 0.62, 0.07] | svg | scanSoft |
| `cta` | action | [0.8, 0.81, 0.16, 0.12] | [0.7, 0.87, 0.26, 0.07] | dom | none |

## Motion stack

- `orbitalDrift` → device rings · low
- `breathSlow` → device core · low
- `dataTick` → readout · medium
- `glitchMicro` → device · high · trigger `overload`
- `stateOpen` → device · critical · trigger `cta`

## Interaction

- **pointer:** one parameter only; no freeform HUD
- **click:** activate device and change measured state
- **audio:** optional; smooth FFT bands
- **keyboard:** Enter activates; Escape returns to idle

## Event

```ts
document.addEventListener("kodex:machine-activated", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Fallback

SVG concentric device with CSS pulse

## QA

- [ ] controls visibly alter output
- [ ] device remains central
- [ ] no fake dashboard density
