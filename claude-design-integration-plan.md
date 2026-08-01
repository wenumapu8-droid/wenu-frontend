# Claude Design → Astro integration plan

Date: 2026-05-09
Scope: how visual outputs from Claude Design (browser canvas) become parts of the existing `wenu-frontend` Astro repo. Planning only — no edits.

**One-line rule:** Claude Design produces handoff specs and raw assets. Claude Code translates them into Astro components, CSS additions, and `public/` assets that live inside the existing build. **No parallel `index.html`, no orphan `/styles` folder, no second design system.**

---

## 1. Current Astro structure (verified 2026-05-09)

```
~/wenu-frontend/
├── src/
│   ├── pages/                23 .astro pages (incl. /p/[slug].astro for products) + search-index.json.ts
│   ├── layouts/              Base.astro                  ← only layout; all pages wrap with this
│   ├── components/           11 .astro components        ← reuse first; create new only when truly novel
│   │     CardinalGrid · CategoryStrip · EmbossedSeal · Footer ·
│   │     HealingTimes · Logo · Nav · Newsletter · PatternBand · ProductCard · SearchModal
│   ├── styles/
│   │     tokens.css          design tokens (palette, scale, spacing) — extend, don't replace
│   │     global.css          reset + reusable classes (.btn, .archive-card, .product-card,
│   │                         .section--mega, .constellation-divider, .eyebrow, .sacred-mark)
│   ├── lib/woo.ts            WooCommerce REST client (off-limits unless explicit)
│   ├── i18n/                 en.json + mapudungun.json
│   └── assets/logos/         logo SVG sources for build-time inlining
│
├── public/                   Astro serves this verbatim at site root
│   ├── img/                  README.md + brand/ categories/ hero/ products/ truckee/
│   ├── logos/                public-served logos
│   ├── aftercare/            ← OFF-LIMITS for design integration (separate deploy track)
│   ├── downloads/            ← OFF-LIMITS unless task says so
│   ├── favicon.{ico,svg}, humans.txt, robots.txt
│
├── astro.config.mjs          SSG, output: static, sitemap config
├── package.json              build/dev/preview scripts (Astro 6, Node 24)
└── (no docs/ folder yet — will be created when first doc needs it)
```

Stack: Astro 6.2.1 SSG, plain CSS (no Tailwind), `@fontsource-*` for typography. Pinned Node 24.14.1 via `.nvmrc`.

---

## 2. Where visual assets should live

| Asset type | Source from Claude Design | Final path in repo | Notes |
|---|---|---|---|
| Patterns / textile bands | hand-tuned SVG | `public/assets/patterns/<name>.svg` | flat SVG, no embedded raster, no IDs that collide |
| Ritual dividers | SVG | `public/assets/dividers/<name>.svg` | same conventions |
| Decorative seals | SVG | `public/assets/seals/<name>.svg` | (existing `EmbossedSeal.astro` already covers one — extend, don't duplicate) |
| Logo variants | SVG | `src/assets/logos/<name>.svg` (build-inlined) **or** `public/logos/<name>.svg` (URL-served) | inline only when reused across many pages |
| Photographic assets | **never invented** by Claude Design | `public/img/<category>/<slug>.{webp,avif}` | follow existing `public/img/README.md` (lowercase kebab-case, WebP > 800KB → AVIF companion via `scripts/gen-avif.mjs`) |
| Hero / OG / social images | exported from Canva or human-made | `public/img/hero/`, `public/img/brand/` | per-page OG already wired via `Base.astro` props |
| Color / spacing / typography tweaks | spec doc | `src/styles/tokens.css` (extend variables) | never duplicate the file; never introduce a parallel tokens system |
| Layout-level utility classes | spec doc | `src/styles/global.css` (append) | reuse before adding |
| Page-specific styles | scoped `<style>` block in the .astro file | inline in the page or component | no separate per-page stylesheet |

A **new top-level folder** `public/assets/` is acceptable. A new `/styles/` at repo root is **not** — styles live in `src/styles/`.

---

## 3. Reusable components (proposal)

Create only when the existing 11 don't fit. Group new visual primitives under `src/components/visual/` for clarity (existing 11 stay where they are).

| New component | Purpose | Replaces / extends |
|---|---|---|
| `src/components/visual/AssetSlot.astro` | wrapper that renders an SVG/picture asset with consistent sizing, lazy-load defaults, and a fallback. Props: `src`, `alt`, `aspectRatio`, `loading?`, `sizes?` | nothing — fills a real gap |
| `src/components/visual/RitualDivider.astro` | thin section divider using one of the SVG dividers in `public/assets/dividers/`. Props: `variant`, `density` | extends the existing `.constellation-divider` class in `global.css`; do not delete that class |
| `src/components/visual/PatternBand.astro` | **already exists at `src/components/PatternBand.astro`** — reuse, do not create a duplicate. Extend its props if a Design output requires a new variant | already present |
| `src/components/visual/SealMark.astro` | small inline SVG mark (different from the existing `EmbossedSeal.astro`). Only create if Design produces a clearly distinct mark | extends, doesn't replace `EmbossedSeal` |
| `src/components/visual/HeroFrame.astro` | visual frame around hero media. Props: `media`, `caption?`, `size` | new — only if a Design output specifies a new hero treatment that the current home doesn't have |

Rules:

- **Reuse before create.** Open `src/components/` first; if 80% of the proposed thing is already there, extend instead.
- **Same import contract.** All `.astro` components accept props with sensible defaults; no global side effects.
- **No JS dependencies added without explicit approval.** `package.json` stays minimal.
- **No new layout files.** `Base.astro` is the only layout. New page templates are pages, not layouts.

---

## 4. Files that would be touched (per integration cycle, after approval)

For each Claude Design handoff, the typical change set is:

```
src/components/visual/<NewComponent>.astro       (new file)
public/assets/<type>/<asset>.svg                 (new asset, or replace if same name)
src/styles/tokens.css                            (append variables only, never rewrite)
src/styles/global.css                            (append a new utility class only if needed)
src/pages/<page>.astro                           (consume the new component — typically 1–3 lines added)
docs/asset-pipeline.md                           (documentation update — see §5)
```

**Files that must NOT be touched without explicit per-edit approval:**
`src/lib/woo.ts`, `src/pages/index.astro` (homepage), `public/aftercare/*`, `public/downloads/*`, `astro.config.mjs`, `package.json`, `.gitignore`.

---

## 5. What Claude Design should output for handoff

A Claude Design "handoff" is a markdown spec + asset attachments. Saved into `docs/handoffs/<YYYY-MM-DD>-<slug>/` (folder created on first handoff).

Required contents per handoff:

1. **`spec.md`** — what the design is, where on the site it goes, which existing component (if any) it extends.
2. **Assets** — SVGs as raw files (not screenshots), in the exact dimensions the implementation needs. Photos as PNG/JPG; Codex converts to WebP/AVIF via `scripts/clean-images.mjs` and `scripts/gen-avif.mjs`.
3. **Token deltas** — list of new or changed entries for `tokens.css` (variable name, value, intent). Never a full replacement file.
4. **Class deltas** — list of new utility classes for `global.css`. Each with a one-line purpose.
5. **Acceptance** — what "this is correctly integrated" looks like (visible behavior, not implementation). E.g., "On mobile, the divider stays under 32 px tall; on desktop, 56 px."
6. **Constraints** — what NOT to change (existing components, classes, page structure).

Out of scope for Claude Design output: real photo invention, copy that wasn't approved, structural site reorganization, new pages.

---

## 6. What Codex / Claude Code should implement

Per handoff, the implementation pass:

1. Read the handoff spec.
2. Re-read `agent-control/AGENT_CONTROL_CENTER.md` and `agent-control/DO_NOT_TOUCH.md`.
3. Confirm there is no parallel `index.html` or duplicate styles folder being introduced. If there is, push back.
4. Place SVGs in `public/assets/<type>/`.
5. Add token entries to `src/styles/tokens.css` (append only).
6. Add class entries to `src/styles/global.css` (append only).
7. Create the new `.astro` component(s) under `src/components/visual/`.
8. Wire the component into the relevant page(s). For the homepage `index.astro`, **explicit per-edit approval is required** — do not modify the homepage without a green light.
9. Run `npm run build`. Confirm 82+ pages, 64 product pages, postbuild OK.
10. Run `npm run preview` and visually verify only the touched pages.
11. Update `docs/asset-pipeline.md` with what was added and where.

---

## 7. Build / test commands

```bash
nvm use                        # reads .nvmrc → Node 24.14.1
npm install                    # only if package.json changed (it shouldn't, normally)
npm run build                  # full SSG build → dist/ ; postbuild asserts ≥20 product pages
npm run preview                # serve dist/ on localhost for visual check
node scripts/clean-images.mjs  # if photo assets were added: strips EXIF + converts > 800KB to WebP
node scripts/gen-avif.mjs      # AVIF companions for >800KB
```

Smoke test for an integrated component (illustrative; replace `<page>` and `<sel>`):

```bash
curl -sI http://localhost:4321/<page>/  | head -3
curl -s  http://localhost:4321/<page>/  | grep -c '<sel>'
```

---

## 8. Risks

| Risk | Mitigation |
|---|---|
| Claude Design outputs a full `index.html` that suggests rewriting the homepage | This plan forbids it. Treat any such output as **inspiration only**; map intent into an Astro component and consume it from `index.astro` after explicit approval. |
| New tokens collide with existing `tokens.css` variable names | Append, don't replace. Reviewer checks for name collisions before merging. |
| Heavy SVGs blow up page weight | Optimize via SVGO before commit. Hard-cap inline SVG at ~6 KB; URL-load larger ones from `public/assets/`. |
| New utility class duplicates a `global.css` class | Read `global.css` first; if 80% match exists, extend. |
| Photographic assets get invented | **Forbidden.** Photos come from human-curated sources (Canva, brand shoots). Claude Design never produces final photo. |
| Component proliferation (10 new visual components after one design pass) | Cap each handoff at 1–3 new components. Bundle smaller pieces into existing components when feasible. |
| Aftercare gets touched | `public/aftercare/*` is off-limits per `DO_NOT_TOUCH.md`. Aftercare is a separate deploy track. |
| Homepage gets silently rewritten | Homepage edits require explicit per-edit owner approval; this plan codifies that. |
| Build breaks on a new component | Run `npm run build` before any commit; postbuild verifies product page count. If build fails, revert and report — do not "fix forward". |

---

## 9. Approval checkpoint (mandatory before any edit)

Before Claude Code modifies any file under `~/wenu-frontend/`, the human owner must approve:

1. **The handoff spec** is acceptable (intent + assets + token/class deltas).
2. **The list of files to be touched** (per §4) is acceptable.
3. **Whether the homepage `src/pages/index.astro` is in scope.** Default is NO unless explicitly approved.
4. **Whether new dependencies will be added to `package.json`.** Default is NO.
5. **Whether the build will be run and the preview visually checked** by the owner before any commit.

The handoff/integration loop:

```
[Claude Design] produces spec.md + assets in docs/handoffs/<date>-<slug>/
       ↓ (owner reviews)
[approval] owner says go on specific files
       ↓
[Claude Code] implements per §6, runs build, reports diff
       ↓ (owner reviews)
[approval] owner stages + commits (locally) when satisfied
       ↓
(no push, no deploy, no DNS — those are separate gates documented in agent-control/)
```

Do not skip any gate. If any step fails, stop and ask — do not improvise.

---

## What this plan does NOT cover

- Cloudflare Pages deploy of the redesigned site (P3 in `TASK_QUEUE.md`).
- Aftercare hosting (P2; separate track).
- WooCommerce catalog edits (human via WP admin).
- Brand strategy / copy decisions (`wenu-brand` subagent + ChatGPT).
- Final asset photography (human + brand sessions).
- Any commit, push, or deploy.
