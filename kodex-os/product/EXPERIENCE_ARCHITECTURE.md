# KODEX−∞ EXPERIENCE ARCHITECTURE

Status: `CANONICAL / BOOTSTRAP`

## Product model

KODEX is a directed, memory-preserving experience graph. It is not a linear website and not a random scene selector.

Each session contains:

```text
ENTRY CONTEXT
+ USER DECISIONS
+ SOURCE MATERIAL
+ SYSTEM STATE
+ SESSION MEMORY
= UNIQUE PATH
```

## Canonical experience graph

```text
                    ┌──────────── ARCHIVE ────────────┐
                    │                                  │
−∞ → THRESHOLD → PROLOGUE → DESCENT → MACHINE → COSMOLOGY
          │             │          │        │          │
          │             └──── HEART ┴────────┘          │
          │                                             │
          └──────── ACCESSIBILITY / EXIT ───────────────┘
                                  ↓
                           RETURN / +∞
                                  ↓
           ARTIFACT / SOURCES / CONTRIBUTION / RE-ENTRY
```

The diagram defines functions, not a fixed order. A valid route may enter HEART earlier, return to ARCHIVE, bypass MACHINE or open COSMOLOGY directly when the content requires it.

## Node contract

Every experience node must declare:

```yaml
node:
  id: ""
  title: ""
  function: ""
  entry_conditions: []
  required_memory: []
  sources: []
  user_decisions: []
  visual_variables: []
  interactions: []
  state_changes: []
  writes_to_memory: []
  exits: []
  convergence_contribution: ""
  accessibility:
    keyboard: true
    reduced_motion: true
    non_visual_alternative: true
    immediate_exit: true
```

## Decision law

A decision is canonical only when it changes at least one of:

- content selected;
- order of scenes;
- level of detail;
- representation;
- interaction;
- sonic behavior;
- session memory;
- final artifact;
- later available routes.

A decorative button that produces the same consequence is not a decision.

## Session memory

The system should record only what is necessary for continuity and user value.

```yaml
session_memory:
  path: []
  decisions: []
  sources_opened: []
  concepts_encountered: []
  annotations: []
  accessibility_preferences: {}
  contemplative_preferences: {}
  generated_artifacts: []
  consent: {}
```

Private reflection remains local or explicitly user-controlled unless the user consents to save or contribute it.

## Entry: `−∞`

Purpose:

- establish mystery without confusion;
- show incomplete relationships;
- invite orientation;
- avoid presenting darkness as moral failure.

Required behaviors:

- fast access to controls;
- no forced audio;
- no surprise intense motion;
- visible route to THRESHOLD.

## THRESHOLD

Purpose:

- consent;
- accessibility;
- language;
- motion and sound settings;
- session intention;
- first meaningful choice.

Possible first-choice families:

- `OBSERVE`
- `REMEMBER`
- `CONNECT`
- `TRANSFORM`
- `CONTRIBUTE`

These verbs shape the path but do not rank the user.

## ARCHIVE

Purpose:

- expose entities, sources and relationships;
- let users inspect provenance;
- represent absence and contradiction;
- allow retrieval and comparison.

Core interactions:

- open source;
- trace relation;
- compare versions;
- filter by evidence class;
- reveal uncertainty;
- save a node to session memory.

## MACHINE

Purpose:

- reveal computational transformations;
- permit simulation and generative manipulation;
- distinguish real data from synthetic or speculative output;
- expose code when publishable.

The machine must never imitate scientific instrumentation without a real signal.

## HEART

Purpose:

- restore orientation;
- provide a central pulse;
- coordinate optional breathing or stillness;
- connect paths through a living, non-scoring symbol.

Modes:

- `GUIDED_PULSE`: synthetic tempo, labeled `NOT MEASURED`;
- `TAP_PULSE`: user-tapped approximate rhythm, non-clinical;
- `SENSOR_PULSE`: future, disabled until real integration and consent exist.

The user can pause, stop, reduce motion or return to natural breathing at all times.

## COSMOLOGY

Purpose:

- reveal how local information participates in larger systems;
- connect time, territory, culture, ecology, technology and possible futures;
- distinguish factual, interpretive, speculative and mythopoetic layers.

Cosmology is a model of relationships, not an imposed universal truth.

## RETURN / `+∞`

Required sequence:

1. reduce unresolved motion;
2. reorient the user to ordinary time and interface controls;
3. reveal how the path changed the system;
4. expose sources and uncertainty;
5. generate or present the path artifact;
6. offer contribution, sharing and code access;
7. open a new branch based on unexplored relations.

Visual transformation:

```text
OBSIDIAN → OPEN WHITE
CONTAMINATED SIGNAL → PURE SPECTRUM
DENSE OVERLAY → SPATIAL CLARITY
FRAGMENT → RELATION
CONSUMPTION → CONTRIBUTION
```

## Contribution layer

Permitted contribution types:

- source suggestion;
- annotation;
- personal reflection kept private by default;
- correction;
- translation;
- code contribution;
- visual interpretation;
- community review.

All public contributions require attribution, moderation and rights checks.

## Vertical slice v0

The first complete product slice is:

```text
−∞
→ THRESHOLD
→ choose OBSERVE or REMEMBER
→ ARCHIVE
→ HEART
→ RETURN / +∞
→ path artifact + sources + re-entry
```

Success criteria:

- works on mobile and desktop;
- no scroll-dependent core interaction;
- one real dataset or documented corpus;
- every visual variable has a declared meaning;
- reduced-motion mode is complete;
- route choices affect the artifact;
- no deployment without approval.
