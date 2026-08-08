# 05 — Cosmology Core

**ID:** `KDX_SCENE_05_COSMOLOGY`  
**Theme:** `cosmology`  
**Purpose:** Display the KODEX cosmology as an indexable system of relations and trajectories.

## Core composition

- Desktop grid: 12 columns
- Mobile grid: 4 columns
- Major ratio: 1:1
- Density: 0.88
- Negative space: 10%
- Headline: **A COSMOLOGY CAN BE INDEXED**
- Primary CTA: **ENTER ORBIT**
- Visual anchor: planetary core, orbital atlas or cosmology engine

## Render split

### WebGL
- core
- orbits
- particles
- depth

### SVG
- constellation links
- labels
- trajectory lines
- legend

### DOM
- headline
- node list
- CTA
- coordinates

## Zones

| Zone | Role | Desktop x/y/w/h | Mobile x/y/w/h | Renderer | Motion |
|---|---|---|---|---|---|
| `headline` | display | [0.04, 0.04, 0.46, 0.16] | [0.04, 0.04, 0.9, 0.14] | dom | none |
| `cosmology` | hero | [0.18, 0.16, 0.64, 0.68] | [0.04, 0.22, 0.92, 0.5] | webgl | orbitalDrift |
| `legend` | rail | [0.04, 0.28, 0.12, 0.42] | [0.04, 0.75, 0.44, 0.12] | dom | dataTick |
| `node_list` | data | [0.84, 0.28, 0.12, 0.42] | [0.52, 0.75, 0.44, 0.12] | dom | dataTick |
| `coordinates` | footer | [0.18, 0.86, 0.48, 0.08] | [0.04, 0.9, 0.62, 0.06] | svg | scanSoft |
| `cta` | action | [0.68, 0.86, 0.28, 0.08] | [0.7, 0.9, 0.26, 0.06] | dom | none |

## Motion stack

- `orbitalDrift` → outer orbits · low
- `breathSlow` → core · low
- `nodePing` → active node · medium
- `dataTick` → coordinates · medium

## Interaction

- **pointer:** hover selects one orbit at a time
- **click:** focus node and reveal relation
- **keyboard:** Tab cycles nodes
- **history:** optional query parameter for selected node

## Event

```ts
document.addEventListener("kodex:cosmology-node-open", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Fallback

SVG orbital map

## QA

- [ ] at least one quiet black zone
- [ ] labels do not orbit
- [ ] one selected node maximum
