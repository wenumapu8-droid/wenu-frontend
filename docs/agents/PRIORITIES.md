# PRIORITIES — KODEX−∞ + WËNU MAPU

Last reviewed: 2026-08-11.  
Purpose: tell Kimi and other stations what deserves attention next. This is a ranked operating list, not a backlog dump.

> Re-rank when a blocker is resolved, a creator decision changes direction, or verified production state changes.

---

## P0 — Protect the source of truth

### P0.1 Merge the cross-agent memory contract

Goal: make `AGENTS.md` + `docs/agents/*` available to every station on the active development lineage.

Acceptance:

- files are reviewed for obvious contradictions;
- branch/PR target matches the active lineage;
- at least one engineering agent and one intelligence/visual agent can bootstrap from the same files;
- no agent-specific private memory is treated as the only source of truth.

### P0.2 Stop parallel reinvention

Before opening a new KODEX implementation lane, search current branches/PRs for an existing renderer, plate, state contract, node route, visual engine or QA tool.

Default: reuse / combine / compare before inventing.

---

## P1 — Converge KODEX architecture

### P1.1 Resolve JourneyState / memory lineage

There are known incompatible state/memory APIs across branches. Do not add more stateful interactions until the authoritative lineage is identified and the migration/reconciliation path is explicit.

Desired output:

- one authoritative state contract;
- one serialization/memory strategy;
- compatibility/migration note for valid existing work;
- tests that prove transitions and persistence behavior;
- documented mutation limits and voluntary-action semantics.

### P1.2 Consolidate node + graph contracts

Use the recovered/typed node atlas and graph work as evidence. Avoid duplicate node loaders and invented coordinates/relations.

Desired output:

- one loader path;
- one node schema;
- one relation validity model;
- explicit cultural-review status;
- route generation verified in build/browser.

### P1.3 Standardize scene runtime boundaries

Renderer, journey state, routing/history, audio, memory and telemetry should have clear ownership boundaries. Shaders/canvas should render visual state, not secretly own navigation or canonical memory.

---

## P1 — Converge creator-level visual fidelity

### P1.4 Finish THRESHOLD by evidence, not another redesign

Use approved references + recovered authored renderer + current voluntary-entry semantics. Compare existing candidates before generating a new portal.

Required evidence:

- desktop;
- 390×844;
- 412×915;
- reduced motion;
- no critical overflow/console failure;
- creator visual review.

### P1.5 Advance HEART CHAMBER plate-to-live

Preserve the approved plate. Treat live behavior as augmentation.

Validate:

- hotspot alignment;
- motion restraint;
- simulation labels;
- mobile fit;
- reduced motion;
- no fake biometric claims;
- decision on whether the technique generalizes to other approved plates.

### P1.6 Turn visual plates into a repeatable production method

Preferred pipeline:

`approved plate → provenance → semantic zones → live effect recipe → interaction contract → accessibility/fallback → browser evidence → creator gate → integration`

Do not redraw approved artwork from prose when the plate itself exists.

---

## P2 — Make QA/evidence a factory primitive

### P2.1 Adopt one browser evidence workflow

Reuse the existing build/sweep knowledge rather than re-discovering screenshot traps.

Every visual packet should report:

- viewport dimensions;
- browser/runtime used;
- overflow;
- console errors;
- target/tap sizes where applicable;
- reduced motion state;
- screenshot/capture evidence;
- what was not verified.

### P2.2 Align CI/build documentation with reality

Resolve drift between docs and actual CI/offline product-fetch behavior. A green-looking packet without a reproducible check is not evidence.

### P2.3 Convert demoscene research into delta-only Effect Foundry work

Research packet: `docs/research/KODEX_DEMOSCENE_CRT_RESEARCH_2026-08-11.md`.

Important correction: do **not** create another CRT renderer as the default next step. `src/kodex/crt/kodex-crt.esm.js` already implements the core CRT effect family plus scene presets, adaptive quality and anomaly behavior.

Next actions:

1. compare external CRT research against the existing KODEX CRT and list only genuine missing capabilities;
2. search current Effect Foundry/shader lanes for sine/plasma equivalents before writing new code;
3. if no equivalent exists, create the smallest reversible semantic recipes (procedural plasma and/or sine-scroller) with no unnecessary dependency;
4. keep JourneyState/user action authoritative for narrative progression — time only modulates effects;
5. validate any new recipe at 390×844 and 412×915 plus reduced motion;
6. do not copy external implementation code until the exact source/license is resolved.

---

## P2 — Build the KODEX asset corpus as a production resource

The project already has large amounts of imagery, plates and references. The need is curation, not volume.

Kimi should help maintain:

- stable asset IDs;
- creator/source/provenance;
- approved/reference/experimental status;
- scene/node relationship;
- rights/cultural-review status;
- derivative lineage;
- implementation readiness;
- thumbnail/contact-sheet access for agents.

Prioritize Ocín-authored artwork and approved KODEX plates before generating replacements.

### ANSI audit note

The audited `src/kodex/ascii/` subtree on `redesign-v2` currently contains renderer/config/scene code but no `.ans` files. Do not invent an ANSI ingestion migration until assets exist. External ANSI art should remain `REF` until stable ID, creator, provenance and rights are verified.

---

## P2 — WËNU MAPU continuous improvement lane

Kimi should periodically inspect the real commerce system and turn verified gaps into small work packets.

Highest-value checks:

1. Product truth — material, sizing, stock, category and care accuracy.
2. Catalog completeness — missing/weak descriptions, images, metadata and filters.
3. Home clarity — can a first-time visitor understand WËNU MAPU quickly?
4. Product imagery consistency — lighting, detail, crop and material readability.
5. SEO/structured data — real, non-spammy coverage.
6. Mobile UX — navigation, product discovery, PDP and checkout handoff.
7. Content system — useful education + authored storytelling without filler.
8. Local/piercing information — clear logistics and customer-safety boundaries.

Do not let experimental KODEX aesthetics reduce store usability.

---

## P3 — Expand research only when it feeds a scene, node or decision

Research themes may include science, mathematics, cosmology, archive theory, generative systems, Indigenous/ancestral knowledge, altered-state art, UFO/contact testimony, Jungian psychology and ecology.

Every research packet should answer:

- Which KODEX node/scene/problem needs this?
- What is established evidence vs interpretation/speculation?
- What can be visualized without misleading the visitor?
- What provenance/permission is required?
- What implementation or copy decision changes because of the research?

If there is no downstream use, it is reference collection — not a priority.

---

## Escalation triggers — ask Ocín

Escalate only when the next action requires a true creator/business decision, for example:

- choose between two meaningfully different final visual directions;
- change the seven-scene narrative function;
- publish culturally sensitive material;
- change brand identity/name/voice at a foundational level;
- remove or reinterpret an approved artwork;
- make a material/product claim not supported by source data;
- deploy a previously blocked KODEX experience publicly;
- accept a major architecture tradeoff that would invalidate substantial approved work.

Do not escalate routine refactors, documentation, QA, reversible experiments or obvious consistency fixes.