# KODEX−∞ Command Shell + Title Engine P0.1

Status: `EXPERIMENTAL / LAB-ONLY / CREATOR REVIEW REQUIRED`

Route: `/kodex/lab/command-shell/`

## Purpose

Test a bounded convergence between two external interface ideas and the existing KODEX runtime language:

1. keyboard-first / command-palette / configurable terminal-shell interaction;
2. scene-specific kinetic typography generated from operators instead of one fixed display treatment.

This proof does **not** copy third-party code, fonts, branding, theme names, content models or social-network behavior.

## External references

### Cyberspace

Reference: <https://cyberspace.online/>

Observed transferable principles:

- command-first navigation;
- visible keyboard affordances;
- multiple display modes;
- dense but legible system/status chrome;
- terminal/editorial interface grammar;
- user-controlled navigation instead of opaque recommendation logic.

KODEX translation:

- `⌘/Ctrl+K` opens a scene command palette;
- arrows and `0–6` switch scene/operator previews;
- `O` opens the canonical existing scene route;
- `T` cycles KODEX-owned display modes;
- status bars expose scene/operator/mode state.

No social feed, account model, recommendation system or Cyberspace identity is reproduced.

### Space Type Generator

Reference: <https://spacetypegenerator.com/morisawa>

Observed transferable principle:

`TEXT + PARAMETRIC STRUCTURE + TIME + INTERACTION → KINETIC TYPOGRAPHIC MANIFESTATION`

KODEX translation is implemented independently as seven KODEX-owned scene operators:

| Scene | Operator | Intended semantic read |
| --- | --- | --- |
| 00 THRESHOLD | `APERTURE` | closed field becoming accessible |
| 01 PROLOGUE | `SCAN` | observation / acquisition |
| 02 DESCENT | `VORTEX` | directional compression into depth |
| 03 ARCHIVE | `STRATA` | accumulated layers / genealogy |
| 04 MACHINE | `ASSEMBLY` | deterministic construction |
| 05 COSMOLOGY | `ORBIT` | relational field / connection |
| 06 RETURN | `RECALL` | dissolution followed by reconstruction |

These are not copies of Space Type Generator modes or code.

## Existing-authority boundary

The current KODEX scene registry remains the source of scene names, canonical routes, accents and subtitles.

The lab adds no:

- router;
- memory store;
- persistence authority;
- renderer replacement;
- scene canon rewrite;
- protected-source transformation;
- deployment behavior.

The proof is a presentation/input layer only.

## Display modes

The lab uses KODEX-owned modes:

- `VOID`
- `PHOSPHOR`
- `AMBER`
- `PAPER`
- `SIGNAL`

They are display skins only and do not change scene meaning, route state or memory.

## Interaction contract

- `⌘/Ctrl+K` — open/close command palette
- `↑/↓` — previous/next scene operator
- `0–6` — direct scene operator selection
- `T` — cycle display mode
- `O` — open canonical existing KODEX scene
- `ESC` — close command palette

Touch/pointer equivalents remain visible through scene, mode and action buttons.

## Reduced motion

`prefers-reduced-motion: reduce` disables kinetic title animation and command-palette transition while preserving:

- scene selection;
- title identity;
- operator label;
- command palette;
- theme selection;
- canonical route opening.

## Creator review

Verdict:

`KEEP | REFINE | REJECT`

Review questions:

1. Does the shell feel like a living KODEX operating system rather than a generic terminal skin?
2. Are scene titles materially distinct at macro-silhouette and motion level?
3. Does command-first navigation increase clarity without flattening the ritual/journey quality?
4. Which display modes belong in production, if any?
5. Should title operators become an input to the existing Manifestation Recipe rather than remain a presentation-only layer?

## Next bounded step if KEEP

Do not spread this lab CSS across production pages directly.

Instead:

1. extract a reusable `KodexCommandPalette` presentation component that reads the existing scene registry;
2. encode title operator IDs into the existing generative-grammar / Manifestation Recipe crosswalk;
3. map scene headings to those operator IDs without changing canonical copy;
4. verify desktop, 390×844, 412×915, keyboard, touch and reduced-motion;
5. obtain creator visual acceptance before production integration or deploy.

Truth boundary:

`REFERENCE STUDIED ≠ THIRD-PARTY CODE LICENSED ≠ LAB IMPLEMENTED ≠ BROWSER VERIFIED ≠ CREATOR ACCEPTED ≠ MERGED ≠ DEPLOYED ≠ CANON`.
