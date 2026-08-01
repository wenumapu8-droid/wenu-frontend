---
type: implementation-plan
status: draft-serio
fecha: 2026-07-23
relacionado:
  - contenido/kodex-from-pdf-2026-07-23.md
  - /Users/user1/wenu-frontend/src/pages/index.astro
  - /Users/user1/wenu-frontend/src/layouts/Base.astro
  - /Users/user1/wenu-frontend/src/components/Nav.astro
---

# KODEX−∞ microsite — implementation handoff

> **For Hermes / Claude / Codex:** build this as a contained microsite inside `wenu-frontend`, using real source art from the KODEX PDF. Do not invent replacement geometry.

**Goal:** ship a first buildable version of KODEX−∞ inside Wenu as a portal microsite with 3 routes: portal home, one archive chapter, and one editions/collaborate page.

**Architecture:** KODEX lives inside the existing Astro frontend as a semi-standalone sub-experience under `/kodex`. It should use the existing `Base.astro` shell where helpful, but suppress the normal commercial chrome on the immersive pages (`noNav`, `noFooter`, `noOverlays`) so the world shift feels real. Visuals come from extracted PDF assets, not generated filler.

**Tech stack:** Astro existing app, CSS modules or scoped Astro styles, optional lightweight vanilla JS, optional GSAP for reveal/pulse/transitions. No heavy WebGL in v1.

---

## Constraints already verified from the real repo

### Existing files
- `src/layouts/Base.astro` already supports:
  - `noNav`
  - `noFooter`
  - `noOverlays`
- `src/pages/index.astro` is very full and commercially dense. Do **not** overload it with KODEX content.
- `src/components/Nav.astro` drives the Wenu commercial navigation and currently does **not** include a KODEX door.

### Existing strategic rule
KODEX should be the parallel inner world of Wenu, not the dominant visual style of the main homepage.

### Source assets
Use the extracted assets from:
- `/tmp/kodex_pdf_assets/key-page-04.jpg`
- `/tmp/kodex_pdf_assets/key-page-28.jpg`
- `/tmp/kodex_pdf_assets/key-page-29.jpg`
- `/tmp/kodex_pdf_assets/key-page-34.jpg`
- `/tmp/kodex_pdf_assets/key-page-62.jpg`

Before final implementation, copy approved assets into a stable project path, for example:
- `public/img/kodex/`

Never hotlink `/tmp/...` in committed code.

---

## Content model for v1

### Route 1 — `/kodex`
Role: portal / threshold / activation

Use:
- primary hero art: `key-page-04.jpg`
- manifesto language condensed from PDF pages 5 and 12

### Route 2 — `/kodex/archive/conjuncion`
Role: canonical inner chapter

Use:
- primary art: `key-page-29.jpg`
- support/detail: `key-page-34.jpg`
- text line: `Líneas que se encuentran para formar un código ritual.`

### Route 3 — `/kodex/editions`
Role: economic translation with dignity

Use:
- framing text from `key-page-62.jpg`
- Yayentru referenced conceptually, but avoid Behance UI clutter from p.64 unless manually cleaned

---

# Implementation plan

## Task 1: create a stable KODEX asset folder in the frontend

**Objective:** give the build a durable local asset path instead of `/tmp`.

**Files:**
- Create: `public/img/kodex/README.md` (optional but recommended)
- Create/copy assets into: `public/img/kodex/`

**Steps:**
1. Create `public/img/kodex/`
2. Copy the approved JPGs from `/tmp/kodex_pdf_assets/` into that folder with clearer names:
   - `portal-hero.jpg` ← page 04
   - `portal-expansion.jpg` ← page 28
   - `portal-conjuncion.jpg` ← page 29
   - `portal-detail-code.jpg` ← page 34
   - `sol-negro-statement.jpg` ← page 62
3. If needed, create cleaned crops/derivatives for mobile and interior sections.
4. Verify each file loads at a predictable public URL.

**Verification:**
- Run local preview and open each file path directly.
- Expected: all assets resolve under `/img/kodex/...`

---

## Task 2: add KODEX routes

**Objective:** create the 3 route files.

**Files:**
- Create: `src/pages/kodex/index.astro`
- Create: `src/pages/kodex/archive/conjuncion.astro`
- Create: `src/pages/kodex/editions.astro`

**Steps:**
1. Create all three files with valid Astro frontmatter.
2. Use `Base.astro` in all three.
3. For immersive pages, pass:
   - `noNav={true}`
   - `noFooter={true}`
   - `noOverlays={true}`
4. Set route-specific `title` and `description` in the page props.

**Verification:**
- Run local build and preview.
- Expected:
  - `/kodex`
  - `/kodex/archive/conjuncion`
  - `/kodex/editions`
  all render with no global Wenu menu/footer clutter.

---

## Task 3: create a lightweight KODEX shell component set

**Objective:** avoid dumping all markup inline; make the microsite maintainable.

**Files:**
- Create: `src/components/kodex/KodexHeader.astro`
- Create: `src/components/kodex/SignalToggle.astro`
- Create: `src/components/kodex/ThresholdCTA.astro`
- Create: `src/components/kodex/ArchiveIndex.astro`
- Create: `src/components/kodex/ChapterNav.astro`
- Create: `src/components/kodex/NextLayerCard.astro`
- Create: `src/components/kodex/EditionEntry.astro`

**Notes:**
Keep these components simple. This is v1, not a giant abstractions festival.

**Verification:**
- Import each component into one page.
- Build should pass with no unused-prop chaos.

---

## Task 4: build `/kodex` portal page

**Objective:** make the threshold feel real.

**Files:**
- Modify: `src/pages/kodex/index.astro`
- Import from: `src/components/kodex/*`

**Required structure:**
1. minimal KODEX header
2. sound/signal toggle
3. monumental hero artwork
4. overline
5. H1 `Arquitecturas Tecno-Tribales`
6. short manifesto block
7. threshold CTA (`Entrar al sistema`)
8. archive index with 5 entries
9. subtle lower cue implying descent

**Design requirements:**
- black background
- white/gray type only
- huge serif title
- restrained sans metadata
- art dominates; UI frames it
- CTA should not look like a standard filled button

**Implementation note:**
Use the existing `Base.astro`, but let the page own the world.

**Verification:**
- First viewport should read as portal, not portfolio.
- Hero art should dominate over UI.
- CTA should feel like activation.

---

## Task 5: build `/kodex/archive/conjuncion`

**Objective:** prove the archive-page pattern with one canonical chapter.

**Files:**
- Modify: `src/pages/kodex/archive/conjuncion.astro`
- Use: `ChapterNav`, `NextLayerCard`, `ThresholdCTA`

**Required structure:**
1. slim top header
2. left vertical archive nav
3. chapter number
4. monumental chapter title
5. dominant artwork (`Conjunción`)
6. support detail/loop pane
7. short interpretive text block
8. `System reading` section
9. `Fragment / note` section
10. next chapter card
11. soft CTA

**Design requirements:**
- less homepage, more chamber
- stronger text hierarchy
- artwork centered as the system being read
- support panel should feel like magnified signal, not embedded video UI

**Verification:**
- Reading flow should go: orientation → artwork → interpretation → next layer
- No product-grid energy anywhere

---

## Task 6: build `/kodex/editions`

**Objective:** translate the archive into collectible / collaborative offers without breaking tone.

**Files:**
- Modify: `src/pages/kodex/editions.astro`
- Use: `EditionEntry.astro`

**Required structure:**
1. curatorial intro
2. editions list (not shop grid)
3. commissions block
4. collaboration block
5. optional support-the-lab note

**Offer lanes:**
- numbered prints
- digital editions / moving loop editions
- private commissions
- collaborations for spaces / releases / installations

**Verification:**
- Page feels like collectible archive entries, not WooCommerce lite
- Commercial CTA appears only after context

---

## Task 7: connect Wenu to KODEX softly

**Objective:** add one intentional door from the commercial world into KODEX.

**Files:**
- Modify: `src/pages/index.astro` or the actual component currently rendering “Cosmic Portal”
- Possibly modify: `src/components/Nav.astro` only if needed later, not mandatory for v1

**Preferred approach:**
- use the existing “Cosmic Portal” placement as the main door
- link it to `/kodex`
- do **not** redesign the whole Wenu homepage around KODEX

**Verification:**
- There is one elegant entry into KODEX from Wenu
- Wenu home stays commercially legible

---

## Task 8: add subtle motion only where it matters

**Objective:** make the archive feel alive without turning it into a dashboard or tech demo.

**Files:**
- Modify page/component styles and optional small JS hooks

**Motion language:**
- breath
- pulse
- reveal
- descent
- resonance

**Allowed:**
- opacity reveals
- parallax drift
- subtle image pulse
- hover proximity changes
- quiet line sweeps

**Avoid:**
- loud neon glows
- constant spinning geometry
- game UI behavior
- heavy WebGL for v1

**Verification:**
- Motion deepens the art
- Motion never competes with the art

---

## Task 9: QA the narrative, not only the code

**Objective:** confirm the pages feel ontologically correct.

**Checklist:**
- [ ] `/kodex` feels like a threshold, not a project listing
- [ ] `/kodex/archive/conjuncion` feels like entering a live chapter, not reading a blog post
- [ ] `/kodex/editions` feels collectible and curated, not like a normal store grid
- [ ] real KODEX artwork remains primary on every page
- [ ] no invented sacred-geometry filler sneaks in
- [ ] Wenu homepage clarity is preserved

---

# File structure proposal

```text
src/
  components/
    kodex/
      ArchiveIndex.astro
      ChapterNav.astro
      EditionEntry.astro
      KodexHeader.astro
      NextLayerCard.astro
      SignalToggle.astro
      ThresholdCTA.astro
  pages/
    kodex/
      index.astro
      editions.astro
      archive/
        conjuncion.astro
public/
  img/
    kodex/
      portal-hero.jpg
      portal-expansion.jpg
      portal-conjuncion.jpg
      portal-detail-code.jpg
      sol-negro-statement.jpg
```

---

# Suggested metadata

## `/kodex`
- Title: `KODEX−∞ — Arquitecturas Tecno-Tribales`
- Description: `A living archive of pattern, memory, code, and resonance inside the world of Wenu Mapu.`

## `/kodex/archive/conjuncion`
- Title: `Conjunción — KODEX−∞ Archive`
- Description: `Lines converge to form a ritual code inside the KODEX archive.`

## `/kodex/editions`
- Title: `Editions & Collaborations — KODEX−∞`
- Description: `Collect editions, request commissions, or collaborate with the KODEX laboratory.`

---

# Anti-patterns

Do NOT do any of these:
- embed Behance UI screenshots as final layout
- generate replacement geometry with AI
- force the Wenu global nav/footer into the immersive pages
- make a product card grid and call it “editions”
- over-explain every page with long mystical paragraphs
- make KODEX feel like a startup launch page

---

# Recommended execution order

1. asset stabilization in `public/img/kodex/`
2. routes
3. shared KODEX components
4. portal page
5. archive chapter page
6. editions page
7. Wenu → KODEX linking
8. motion polish
9. QA

---

# Final instruction for implementer

Treat the interface as a **cultural operating system** that reveals the work.
The interface should never try to outperform the work itself.
