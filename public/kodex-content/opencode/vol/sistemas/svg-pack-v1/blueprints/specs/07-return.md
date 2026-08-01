# 07 — Return Signal

**ID:** `KDX_SCENE_07_RETURN`  
**Theme:** `return`  
**Purpose:** Close the journey while preserving memory of the visitor's path and selected records.

## Core composition

- Desktop grid: 12 columns
- Mobile grid: 4 columns
- Major ratio: 5:3
- Density: 0.66
- Negative space: 24%
- Headline: **THE ARCHIVE REMEMBERS YOUR RETURN**
- Primary CTA: **RETURN TO INDEX**
- Visual anchor: residual signal, path map or memory bloom

## Render split

### WebGL
- residual particles
- memory paths
- signal bloom

### SVG
- journey map
- visited node marks
- completion seal

### DOM
- headline
- session summary
- CTA
- restart action

## Zones

| Zone | Role | Desktop x/y/w/h | Mobile x/y/w/h | Renderer | Motion |
|---|---|---|---|---|---|
| `headline` | display | [0.04, 0.06, 0.52, 0.2] | [0.04, 0.05, 0.92, 0.16] | dom | none |
| `memory_map` | hero | [0.34, 0.2, 0.6, 0.58] | [0.06, 0.25, 0.88, 0.42] | webgl | breathSlow |
| `session` | data | [0.04, 0.34, 0.26, 0.3] | [0.04, 0.7, 0.92, 0.12] | dom | dataTick |
| `seal` | status | [0.04, 0.68, 0.18, 0.12] | [0.04, 0.85, 0.4, 0.07] | svg | authFlash |
| `cta` | action | [0.04, 0.83, 0.26, 0.09] | [0.48, 0.85, 0.48, 0.07] | dom | none |
| `footer` | footer | [0.34, 0.84, 0.6, 0.08] | [0.04, 0.96, 0.92, 0.03] | dom | scanSoft |

## Motion stack

- `breathSlow` → memory_map · low
- `nodePing` → visited nodes · medium
- `authFlash` → seal · high · trigger `summary_ready`
- `stateOpen` → scene · critical · trigger `cta`

## Interaction

- **pointer:** highlight visited path
- **click:** return to index or restart
- **keyboard:** Enter returns; R restarts
- **storage:** read session path from local/session state

## Event

```ts
document.addEventListener("kodex:return-index", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Fallback

SVG journey map

## QA

- [ ] uses real session data when available
- [ ] clear ending
- [ ] return CTA is primary
