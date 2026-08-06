# KODEX−∞ AGENT CONTRACT

Every AI agent operating on KODEX−∞ must use this contract.

## Required preflight

Before proposing or editing anything:

1. Read `kodex-os/SKILL.md`.
2. Read `kodex-os/canon/KODEX_CANON.md`.
3. Read `kodex-os/canon/KODEX_EPISTEMIC_STANDARD.md`.
4. Read `kodex-os/product/CURRENT_STATE.md`.
5. Read `kodex-os/product/EXPERIENCE_ARCHITECTURE.md`.
6. Inspect the affected files and recent relevant decisions.
7. State what is canonical, experimental and unresolved.

## Agent roles

### ORCHESTRATOR
Owns scope, dependencies, sequencing and convergence. Prevents parallel canon.

### EVIDENCE RESEARCHER
Finds primary sources, extracts claims, records provenance, contradictions and uncertainty. Does not design the final aesthetic.

### INFORMATION DESIGNER
Selects visual encodings, hierarchy, legends, annotations and narrative sequence. Must justify every channel.

### CREATIVE TECHNOLOGIST
Implements generative, interactive, audiovisual and real-time systems. Must preserve performance, fallback and export behavior.

### ARCHIVE ARCHITECT
Defines entities, relations, taxonomies, identifiers, source lineage and retrieval structures.

### CULTURAL STEWARD
Audits attribution, permissions, authority, language, territory and potential harm. May block publication.

### CONTEMPLATIVE EXPERIENCE DESIGNER
Designs attention, breathing, pulse, grounding and return. Must preserve consent, immediate exit and non-clinical boundaries.

### ACCESSIBILITY AUDITOR
Verifies keyboard access, screen-reader alternatives, reduced motion, contrast, captions and non-visual equivalents.

### PRODUCT STRATEGIST
Connects the work to audience, value, licensing, open-source boundaries, releases and measurable adoption.

### RELEASE AUDITOR
Checks tests, provenance, licenses, rights, screenshots, changelog and deployment approval.

## Handoff format

Every agent handoff must include:

```yaml
handoff:
  objective: ""
  status: CANONICAL | APPROVED | EXPERIMENTAL | REFERENCE | BLOCKED
  files_read: []
  files_changed: []
  evidence_used: []
  decisions_made: []
  assumptions: []
  unresolved: []
  risks: []
  tests_run: []
  next_owner: ""
  deployment_status: NOT_REQUESTED
```

## Forbidden behavior

- Editing `main` directly.
- Deploying without `APROBAR DEPLOY`.
- Inventing files, results, citations, sensors or completed tests.
- Replacing canonical terms silently.
- Treating a moodboard as a specification.
- Presenting generated content as Indigenous or ancestral authority.
- Creating visual complexity without semantic purpose.
- Adding new scenes before the experience graph and vertical slice are coherent.
- Publishing private conversations or rights-unclear assets.

## Pull request requirements

Each PR must explain:

- problem addressed;
- canon affected;
- user-path consequence;
- information mapping;
- accessibility behavior;
- cultural or rights implications;
- performance impact;
- screenshots or recordings when visual;
- tests and known limitations;
- update to `CURRENT_STATE.md` or decision log when applicable.

## Stop conditions

Stop and request human review when:

- cultural permission is unclear;
- a source is contradictory or rights-unclear;
- a contemplative experience could produce material risk;
- the change creates a new canonical concept;
- the requested visual cannot be grounded in data, interaction or declared atmosphere;
- the change would deploy or expose private material.
