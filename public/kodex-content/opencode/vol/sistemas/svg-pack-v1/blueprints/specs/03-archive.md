# 03 — Archive Dossier

**ID:** `KDX_SCENE_03_ARCHIVE`  
**Theme:** `archive`  
**Purpose:** Present records as living specimens rather than cards or a SaaS database.

## Core composition

- Desktop grid: 12 columns
- Mobile grid: 4 columns
- Major ratio: 8:5
- Density: 0.82
- Negative space: 14%
- Headline: **ARCHIVES THAT REMEMBER**
- Primary CTA: **OPEN RECORD**
- Visual anchor: original specimen, artifact or memory organism

## Render split

### WebGL
- specimen movement
- memory particles
- signal field

### SVG
- record frames
- anatomy lines
- barcode
- auth seal

### DOM
- record title
- metadata
- CTA
- index

## Zones

| Zone | Role | Desktop x/y/w/h | Mobile x/y/w/h | Renderer | Motion |
|---|---|---|---|---|---|
| `header` | header | [0.04, 0.03, 0.92, 0.08] | [0.04, 0.03, 0.92, 0.07] | dom | dataTick |
| `specimen` | hero | [0.04, 0.15, 0.56, 0.68] | [0.04, 0.16, 0.92, 0.44] | webgl | breathSlow |
| `record_title` | display | [0.62, 0.15, 0.34, 0.2] | [0.04, 0.63, 0.92, 0.13] | dom | none |
| `metadata` | data | [0.62, 0.38, 0.34, 0.28] | [0.04, 0.77, 0.92, 0.11] | dom | dataTick |
| `auth` | status | [0.62, 0.69, 0.18, 0.12] | [0.04, 0.9, 0.42, 0.06] | svg | authFlash |
| `cta` | action | [0.82, 0.69, 0.14, 0.12] | [0.5, 0.9, 0.46, 0.06] | dom | none |
| `footer` | footer | [0.04, 0.89, 0.92, 0.07] | [0.04, 0.98, 0.92, 0.02] | dom | scanSoft |

## Motion stack

- `breathSlow` → specimen · low
- `dataTick` → metadata · medium
- `authFlash` → auth · high · trigger `verified`
- `glitchMicro` → record_title · high · trigger `record_change`

## Interaction

- **pointer:** specimen parallax; metadata remains fixed
- **click:** open active record
- **keyboard:** ArrowLeft/ArrowRight changes record
- **history:** pushState per record

## Event

```ts
document.addEventListener("kodex:archive-record-open", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Fallback

static specimen image + SVG overlays

## QA

- [ ] not a card grid
- [ ] metadata is real or semantically plausible
- [ ] only one record is dominant
