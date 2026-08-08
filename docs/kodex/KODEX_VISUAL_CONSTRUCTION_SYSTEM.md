# KODEX−∞ Visual Construction System

Status: ACTIVE PRODUCTION RULE
Owner: Ocín / KODEX−∞
Scope: all active KODEX scenes, labs and preview builds

## 1. Principle

KODEX scenes are not developed as open-ended coding experiments. Each scene is treated as a construction site with a visible target, a structural map, measurable implementation progress and a finite acceptance gate.

The canonical production chain is:

`REFERENCE → DECONSTRUCTION → CROPS → STRUCTURAL MAP → BLUEPRINT → INFORMATION DESIGN → NODE GRAPH → MATERIAL ASSIGNMENT → BUILD → LIVE PREVIEW → MEASURE → PATCH → ACCEPT`

Code is downstream of the blueprint.

## 2. Live Reference Scaffold

Every scene in `WORKING`, `MAPPED`, `BLUEPRINTED` or `BUILDING` state must expose its approved reference directly in the internal/noindex page while native KODEX layers are being constructed.

The scaffold exists to:

- keep the visual target continuously visible;
- prevent repeated searching/reloading of reference material;
- reduce context/token waste;
- make composition and implementation progress visually measurable;
- allow reference geometry to be reverse-engineered without treating filler content as canon;
- support real-browser audit while implementation continues.

The reference is temporary scaffolding. It is never canonical KODEX output and must not survive as a hidden raster dependency after the corresponding native layer is accepted.

### Scaffold modes

- `REFERENCE` — reference only.
- `OVERLAY` — reference and native implementation aligned with adjustable opacity.
- `SPLIT` — side-by-side or draggable comparison.
- `NATIVE` — implementation only.

Internal preview builds may expose these controls. Public production must not expose temporary scaffold controls.

## 3. Two independent progress metrics

Every active scene records:

### VISUAL_TARGET_MATCH
How closely the current scene matches the approved structural target in:

- massing;
- composition;
- focal hierarchy;
- negative space;
- depth;
- rhythm;
- density;
- spatial relationships.

### NATIVE_IMPLEMENTATION
How much of the accepted appearance is actually reconstructed as native KODEX:

- layout;
- components;
- effects;
- runtime;
- shader logic;
- information design;
- node graph;
- interaction;
- semantic memory.

These metrics must never be conflated. A scene can score high visually while still relying on the reference scaffold.

## 4. Reference reverse engineering

A reference is not copied as a whole. It is decomposed into reusable visual information.

Each encountered element is classified as:

- `STRUCTURAL` — grid, framing, spatial organization, hierarchy, negative space, depth.
- `MATERIAL` — texture, edge treatment, surface behavior, density, signal treatment.
- `BEHAVIOR` — motion, transition, temporal response, interaction behavior.
- `INFORMATIONAL_PLACEHOLDER` — a visually useful text/data block whose semantic content must be replaced by real KODEX content.
- `DISCARD` — filler or decorative material with no role in KODEX.

The rule is: preserve useful architecture, not accidental semantics.

## 5. Crop library

References may be decomposed hierarchically:

- `MACRO` — whole silhouette / principal mass.
- `MESO` — structural regions / clusters.
- `MICRO` — edge behavior / texture / signal / detail.

Each crop should store:

- `crop_id`
- `source_id`
- `bbox` and/or mask
- `scale_level`
- `role`
- `weight`
- provenance
- optional derived maps

Derived maps may include silhouette, edges, luminance, contrast, density, point field, occupancy grid, directional flow and later depth/mesh approximations.

## 6. Blueprint before build

Each scene must have a blueprint that declares at minimum:

- reference canvas dimensions;
- normalized structural zones;
- depth planes;
- dominant focal mass;
- negative-space target;
- information blocks;
- node locations;
- material/effect assignments;
- motion states;
- interaction states;
- responsive transformation rules;
- performance tier;
- acceptance criteria.

A coding agent should not invent major scene architecture while implementing the scene.

## 7. Information replacement

Reference copy, labels, numbers, charts and decorative UI are not inherited automatically.

Visually useful informational placeholders are replaced with real KODEX information using explicit semantic roles such as:

- `TITLE`
- `SIGNAL`
- `ANNOTATION`
- `ARCHIVE_ENTRY`
- `SYSTEM_MESSAGE`
- `QUESTION`
- `NODE_LABEL`
- `PROVENANCE`
- `RETURN_TRACE`

This is the information-design pass that converts a structural reference into a KODEX scene.

## 8. Node graph / propagation

Accepted visual elements can become semantic nodes.

Every navigable node must declare:

- node id;
- visual role;
- semantic role;
- relation type;
- target node/route;
- state behavior;
- provenance;
- memory reads/writes when applicable.

Not every visual element is interactive. Final scene elements are classified as:

- `STRUCTURAL`
- `INFORMATIONAL`
- `NAVIGABLE`
- `ATMOSPHERIC`

The propagation model is:

`NODE → RELATION → STATE → MEMORY → MUTATION → NEW NODE`

This allows KODEX to expand through shared laws rather than identical page layouts.

## 9. Construction / propagation separation

### KODEX Construction System

`Reference → Map → Blueprint → Materials → Build`

Builds the scene.

### KODEX Propagation System

`Node → Relation → State → Memory → Mutation → New Node`

Makes the scene part of the living archive.

## 10. Preview / audit loop

A scene progresses through:

`SCAFFOLD → MAPPED → BLUEPRINTED → BUILDING → PREVIEW_READY → PREVIEW_PUBLISHED → AUDITED → ACCEPTED`

Internal preview is continuous. Once a packet is green, it should become visible in noindex staging so Ocín can audit the actual browser/device while other production packets continue.

## 11. Acceptance gate

A scene cannot be `ACCEPTED` until:

1. the reference and provenance are recorded;
2. structural map exists;
3. filler has been classified as placeholder or discard;
4. native KODEX information replaces required placeholders;
5. node relationships are explicit;
6. visual target match has been measured;
7. native implementation has been measured independently;
8. desktop/mobile/reduced-motion/fallback QA passes;
9. accepted appearance no longer depends on the reference raster;
10. the internal comparison view confirms the native scene can stand on its own.

## 12. Production rule

Do not spend implementation cycles on unbounded visual experimentation when the target can first be expressed as a measurable blueprint.

The reference remains physically visible at the construction site until its function has been reconstructed and accepted.
