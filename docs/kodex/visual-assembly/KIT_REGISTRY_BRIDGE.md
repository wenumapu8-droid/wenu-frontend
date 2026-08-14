# KODEX−∞ — Visual Assembly ↔ Kit Registry Bridge Spec v0.1

Status: **ARCHITECTURE PREP / NOT IMPLEMENTED**  
Epistemic status: **INFERRED** from the current Visual Assembly Library and the verified implementation `kitRegistry.js`.

## Problem

KODEX already has a repo-native Kit Protocol in `wenu-frontend`:

`KIT = MODULE + CONTRACT + EXAMPLE + FALLBACK/ACCEPTANCE`

The Visual Assembly Library must therefore **join** that system rather than create a parallel component universe.

## Boundary

This document prepares integration only.

It does **not**:
- open a new visual write lane;
- modify the current KOD-49 runtime;
- make the seven editorial visual modes the canonical journey topology;
- authorize KOD-50/ARCHIVE implementation;
- authorize deployment.

The current factory gate remains authoritative.

## Proposed relationship

```text
OCÍN MASTER / VERIFIED SOURCE
        │
        ▼
HERO MEDIA RESOLVER
        │
        ├───────────────┐
        ▼               ▼
RECIPE KIT        VISUAL COMPONENT KITS
RCP-*             KDX-VIS-*
        │               │
        └──────┬────────┘
               ▼
        ASSEMBLY CANDIDATE
               │
        hard-gate validator
               │
               ▼
        RECIPE RENDERER
        DOM / SVG / Canvas / WebGL
               │
               ▼
        QA + DEVICE EVIDENCE
```

## 1. KDX-VIS component kit

Each `KDX-VIS-*` entry should eventually become a governed kit record:

```js
{
  id: 'KDX-VIS-0001',
  kind: 'visual-component',
  slug: 'FRM_full_tech',
  family: 'frame',
  module: '...',
  contract: 'assembly_manifest.json',
  example: '...',
  fallback: 'transparent PNG / semantic omission',
  productionGate: 'READY_CONDITIONAL'
}
```

SVG remains the preferred native format for vector overlays. PNG is fallback/preview, not the primary web implementation.

## 2. Recipe kit

Each recipe becomes a higher-order kit:

- `RCP-MONOLITH`
- `RCP-ORBITAL-CLOCK`
- `RCP-TYPE-ARCH`
- `RCP-ARCHIVE-COLLAGE`
- `RCP-SIGNAL-BOARD`
- `RCP-QUIET-FIELD`
- `RCP-COLOR-EVENT`

A recipe does not contain artwork. It defines:
- allowed layer order;
- maximum media count;
- density envelope;
- color behavior;
- layout constraints;
- responsive behavior;
- reduced-motion obligations.

## 3. Hero-media resolver

The renderer must resolve the stable Ocín ID first.

Required output:

```ts
interface HeroMediaResolution {
  id: string;
  src: string;
  sourceClass: 'OCIN' | 'REFERENCE' | 'GENERATED' | 'OTHER';
  rightsStatus: string;
  provenanceStatus: string;
  publicExportAllowed: boolean;
  allowedTransformations: string[];
  fallback: string | null;
}
```

A composition candidate cannot override those permissions.

## 4. Assembly candidate

The agent returns **data**, not a new ad-hoc page:

```ts
interface VisualAssemblyCandidate {
  recipeId: string;
  heroMediaIds: string[];
  components: {
    id: string;
    slug: string;
    x: number;
    y: number;
    w: number;
    h: number;
    opacity?: number;
  }[];
  colorMode: string;
  textSlots: Record<string, string>;
  motionProfile: string;
  epistemicNotes: string[];
  provenanceCheck: 'PASS' | 'FAIL' | 'NEEDS_CONFIRMATION';
}
```

## 5. Hard-gate order

Before visual scoring:

1. canonical compatibility;
2. rights/provenance;
3. cultural policy;
4. scientific/epistemic boundary;
5. accessibility/input parity;
6. responsive contract;
7. reduced motion;
8. performance/fallback;
9. only then visual scoring.

## 6. Relationship to Effect Foundry / live motors

Visual components and live effects are different kit types.

```text
KDX-VIS-*     = editorial/vector/interface primitives
KDX-FX-*      = live effect / material / procedural systems
OCN-*         = authored Ocín work/source
RCP-*         = composition grammar
```

A final scene can combine them without collapsing identities:

```text
OCN-* master
+ RCP-* composition
+ bounded KDX-VIS-* overlays
+ optional approved KDX-FX-* live layer
= candidate scene render
```

The KDX-FX layer must not repaint the Ocín master unless the specific work's allowed transformations authorize a derivative.

## 7. Seven visual modes vs canonical topology

The seven current labels are a **visual/editorial mode taxonomy**.

They are not allowed to supersede:
- A–Y canonical coordinates;
- current Scene Bible contracts;
- event-trace routing;
- HEART/M or other canonical coordinate/state logic.

A canonical coordinate can request one of these render modes through an explicit mapping later.

Example:

```json
{
  "coordinate": "A",
  "canonical_scene": "THRESHOLD",
  "visual_mode": "00_THRESHOLD",
  "recipe": "RCP-MONOLITH"
}
```

## 8. Integration sequence after current write lane clears

1. Reserve/merge `KDX-VIS-*` IDs into canonical registry.
2. Add Visual Assembly kit type to the existing kit registry.
3. Add validator for `assembly_candidate.schema.json`.
4. Implement one recipe renderer only.
5. Reconstruct one existing JSON example exactly.
6. Add desktop/mobile/reduced-motion browser evidence.
7. Run Frontier Visual Gate.
8. Only after pattern acceptance, implement remaining recipes.

## 9. First recommended runtime proof

After KOD-49 has completed its active gate, use a **noindex lab route**, not public `/kodex/`.

Recommended proof:
- one `RCP-MONOLITH`;
- one internally approved Ocín A-candidate;
- 3–4 KDX-VIS primitives maximum;
- no new WebGL requirement;
- semantic copy in DOM;
- assembly JSON visible in debug;
- screenshot equality is not required, reconstructability is.

## 10. Definition of done

The bridge is successful when:
- existing `kitRegistry.js` remains the single kit index;
- Visual Assembly has no parallel hidden registry;
- an assembly JSON reconstructs the same composition across reloads;
- source permissions cannot be overridden by an agent;
- mobile/reduced-motion are first-class outputs;
- a new visual component cannot silently invent its own visual system;
- build pass, visual pass and creator acceptance remain separate gates.