# Wenu Visual Agent — Plan

## 1. Purpose

A local script that generates image assets for the Wenu Mapu Astro project via OpenAI image API (DALL-E 3 / GPT-4o image generation). It lives inside `wenu-frontend` and reads brand + visual system docs so every prompt is on-brand. It never deploys, never touches production, never overwrites without approval, and never charges without asking.

## 2. Where it lives

```
~/wenu-frontend/
├── scripts/
│   ├── gen-visual.mjs          ← main entry point
│   ├── gen-visual-dry.mjs      ← dry-run alias (prompt-only, no API call)
│   └── clean-images.mjs        ← existing (post-gen pipeline)
├── prompts/
│   └── visual/                 ← prompt templates per asset type, gitignored output
├── public/img/                 ← target folders (see §4)
├── docs/
│   └── handoffs/               ← handoff specs go here
├── wenu-visual-agent-plan.md   ← this file
└── package.json                ← add `"gen:visual": "node scripts/gen-visual.mjs"`
```

- `scripts/gen-visual.mjs` — single file, no framework. Reads brand docs, builds a prompt, asks approval, calls OpenAI, saves image, writes handoff.
- `prompts/visual/` — YAML or markdown templates that map asset types → prompt patterns. Versioned alongside code.

## 3. Which files it reads

### Brand / visual identity (read-only, source of truth)
| File | What it provides |
|---|---|
| `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` | Brand DNA, voice, materials, categories, manifesto |
| `~/Obsidian/WenuAgent/brand/color-palette.md` | Color hex values (bone, sand, bronze, earth, organic) |
| `~/Obsidian/WenuAgent/brand/visual-rules.md` | Visual guidelines |
| `~/Obsidian/WenuAgent/brand/identity-core.md` | Brand essence, promise, "no caer en" |
| `~/Obsidian/WenuAgent/brand/patterns-textures.md` | Texture direction |
| `~/Obsidian/WenuAgent/brand/graphic-structures.md` | Composition patterns |
| `~/Obsidian/WenuAgent/brand/typography.md` | Font stack |
| `~/Obsidian/WenuAgent/brand/logo-system.md` | Logo usage |
| `~/Obsidian/WenuAgent/brand/copy-frontend-2026-05-01.md` | Section copy for context |
| `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md` | Tone of voice |

### Project structure
| File | What it provides |
|---|---|
| `src/styles/tokens.css` | CSS variable names + values for correct color vocabulary |
| `public/img/README.md` | Naming convention, folder structure, format rules |
| `CLAUDE.md` | Project commands, conventions |
| `agent-control/AGENT_CONTROL_CENTER.md` | Permissions, safe boundaries |
| `agent-control/DO_NOT_TOUCH.md` | Hard blocks |
| `agent-control/AGENT_HANDOFF_PROTOCOL.md` | Handoff format |
| `wenu-visual-agent-plan.md` | This plan (self-referential) |

### Existing asset inventory (to avoid duplicates / understand current state)
| Path | What it provides |
|---|---|
| `public/img/hero/` | Existing hero images |
| `public/img/categories/` | Existing category images |
| `public/img/products/` | Existing product images |
| `public/img/brand/` | Existing brand banners |
| `docs/handoffs/` directory | Previous handoff specs |

## 4. Which folders it can write to

| Folder | Permission | Notes |
|---|---|---|
| `public/img/hero/` | write (new files) | Homepage hero variants |
| `public/img/categories/` | write (new files) | Category banners |
| `public/img/brand/` | write (new files) | Brand banners, OG images, 404 visuals |
| `public/img/products/` | write (new files) | Product placeholders |
| `public/img/` | write (new subdirs) | Only if a new category legitimately needs one |
| `docs/handoffs/<YYYY-MM-DD>-<slug>/` | write (new dir + files) | Handoff specs |
| `prompts/visual/` | write (templates) | Prompt templates, committed |
| `scripts/` | write | `gen-visual.mjs` itself, committed |

**Never write to:**
- `public/aftercare/` — separate deploy track
- `public/downloads/` — off-limits unless explicit
- `src/` — code edits go through Claude Code
- `agent-control/` — only by assigned agent
- `.env*` — never

## 5. Required environment variables (names only)

| Variable | Purpose | Source |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI authentication | `~/wenu-agent-hub/.env` already has this |
| `OPENAI_IMAGE_MODEL` | Model override (default: `dall-e-3`) | Optional, sensible default in code |

These are already defined in `~/wenu-agent-hub/.env`. The visual agent reads them via `dotenv` from `wenu-frontend/.env` (the agent adds them there, human copies the value).

Additional (non-secret, hardcoded or in prompt templates):
- Brand color hex values (from `color-palette.md`)
- Image size constants (1024×1024, 1792×1024, etc.)
- Asset naming patterns (from `public/img/README.md`)

## 6. How to call OpenAI image generation safely

The agent uses OpenAI's **Images API** (`https://api.openai.com/v1/images/generations`) with these safety measures:

```
POST https://api.openai.com/v1/images/generations
Authorization: Bearer ${OPENAI_API_KEY}   ← only in memory, never logged
Content-Type: application/json

{
  "model": "dall-e-3",
  "prompt": "<brand-informed-prompt>",
  "n": 1,
  "size": "1792x1024",         ← depends on asset type
  "quality": "hd",             ← optional, costs more
  "response_format": "b64_json" ← decode locally, save as file
}
```

Safety chain:
1. Prompt template is rendered from brand docs (never raw user input).
2. User explicitly approves each call (cost gate).
3. Response is validated: is it a valid image? Does it match expected size?
4. Image is decoded from base64 and saved to the correct folder.
5. Raw API response is never printed. Only filename + dimensions logged.
6. `OPENAI_API_KEY` is never logged, never in error messages (redacted).
7. Network fetch uses Node native `fetch` or `https` — no extra dependency needed.

## 7. How to avoid exposing API keys

- `OPENAI_API_KEY` lives in `wenu-frontend/.env` (already gitignored).
- The script reads it via `process.env.OPENAI_API_KEY` — never hardcoded.
- All error handlers redact: `error.message.replace(process.env.OPENAI_API_KEY, '<REDACTED>')`.
- No `console.log` of the raw request body or response.
- `.env` is never read into chat output (key names only via `awk -F= '/^[A-Z_]+=/{print $1}'`).
- Follows `DO_NOT_TOUCH.md` §5 rules strictly.
- The key already exists in `~/wenu-agent-hub/.env` — same key can be copied to `wenu-frontend/.env` by the human.

## 8. Asset workflow

```
[Human request]
     ↓
1. REQUEST — human says "generate hero image for collection X"
     ↓
2. PROMPT CREATION
   - Read brand docs (color palette, voice, visual rules)
   - Read project conventions (naming, sizes, folders)
   - Read existing assets in target folder to avoid duplication
   - Render a prompt template with: subject, mood, colors, format constraints, negative space rules
   - Show prompt to human for review (dry-run mode)
     ↓
3. APPROVAL GATE
   - Show: prompt, estimated cost (~$0.040-0.080 per HD 1024x1024), target folder, filename
   - Human says yes/no. If no → revise prompt or cancel.
     ↓
4. GENERATION
   - Call OpenAI Images API with the approved prompt
   - Validate response (has image, correct size, valid base64)
   - On error: retry once with degraded quality, then report
     ↓
5. SAVE IMAGE
   - Decode base64 → write to `public/img/<type>/<generated-name>.png`
   - Run `node scripts/clean-images.mjs` to strip metadata + convert to WebP
   - Run `node scripts/gen-avif.mjs` to generate AVIF companion
   - Result: `.webp` + `.avif` in target folder
     ↓
6. CREATE HANDOFF
   - Write `docs/handoffs/<YYYY-MM-DD>-<slug>/spec.md`
   - Contents: asset name, prompt used, model + params, where it goes in the site, sizing, alt text
   - Reference the Claude Design handoff format from `claude-design-integration-plan.md`
     ↓
7. REVIEW
   - Show human: file path, dimensions, size, preview
   - Human accepts or rejects. If rejected → option to retry with revised prompt.
     ↓
8. INTEGRATION (by Claude Code / Codex — separate step, not done by Visual Agent)
   - Claude Code reads the handoff spec
   - Wires the image into the appropriate `.astro` page or component
   - Runs `npm run build` to confirm
   - This step is out of scope for the Visual Agent — it only generates assets
```

## 9. Supported asset types

| Type | Default size | Target folder | Naming pattern | Notes |
|---|---|---|---|---|
| homepage hero | 1792×1024 | `public/img/hero/` | `hero-{descriptor}-{variant}.png` | Full-bleed, dark background, focus on center-top |
| piercing banner | 1200×1200 | `public/img/categories/` | `piercing-{variant}.png` | Square crop for CategoryStrip |
| hangers banner | 1200×1200 | `public/img/categories/` | `hangers-{variant}.png` | Square crop |
| amulets banner | 1200×1200 | `public/img/categories/` | `amulets-{variant}.png` | Square crop |
| ear weights banner | 1200×1200 | `public/img/categories/` | `ear-weights-{variant}.png` | Square crop |
| ritual pieces banner | 1200×1200 | `public/img/categories/` | `ritual-pieces-{variant}.png` | Square crop |
| materials visual | 1200×800 | `public/img/brand/` | `material-{name}-{variant}.png` | Meteorite, silver, wood, brass |
| product placeholder | 1024×1024 | `public/img/products/` | `placeholder-{category}-{variant}.png` | Only when no product photo exists |
| OG image | 1200×630 | `public/img/brand/` | `og-{page}-{variant}.png` | Social share card |
| 404 visual | 1200×800 | `public/img/brand/` | `404-{variant}.png` | On-brand "lost in the cosmos" |

## 10. Safety boundaries

| Rule | Enforcement |
|---|---|
| **No production deploy** | The script has no deploy capability. No `wrangler`, no `gh`, no `rsync`, no `scp`. |
| **No DNS** | No DNS-related operations. No HTTP server. No domain manipulation. |
| **No automatic overwrite** | If target filename exists, script refuses with "file exists — use --force to overwrite". No --force without explicit human approval. |
| **No unlimited generations** | Hard cap: `--max 2` per run (overrideable with warning). Enforced at script level. Prompt templates cap at `n=1` per call. |
| **Max 2 options per asset unless approved** | Default: 1 generation per request. Human may say "generate 2 options" — script does 2 separate API calls. |
| **No code edits** | Script does NOT touch `src/` files. Integration is a separate step for Claude Code. |
| **No Aftercare** | `public/aftercare/` is never a target. |
| **No WooCommerce** | No WC API calls. |
| **No git push** | No `git push` in the script. Commit is human decision. |
| **No parallel website** | Assets are saved into the existing `public/img/` tree. No `index.html`, no `/styles/`, no second site. |

## 11. Cost controls

| Mechanism | How it works |
|---|---|
| **Dry-run mode** | `npm run gen:visual -- --dry-run` — reads brand docs, renders prompt, prints everything, NO API call. Returns 0. |
| **Prompt-only mode** | Same as dry-run but also saves the prompt to a `.prompt.md` file for manual use in ChatGPT/Midjourney. |
| **Approval gate** | Every API call requires human typing "y" or "yes". No `--yes` flag. |
| **Cost display** | Before each call, prints: "DALL-E 3 HD 1792x1024 = ~$0.080. Continue? (y/N)" |
| **Generation manifest** | After each run, appends to `docs/visual-generation-manifest.md`: date, asset type, filename, model, size, cost estimate. |
| **Monthly cap** | Optional env `VISUAL_MONTHLY_BUDGET_CENTS` — if set, script reads manifest and refuses if exceeded. |
| **Quality toggle** | Prompt templates allow `--quality standard` (cheaper) vs `--quality hd` (default). |
| **Retry with degrade** | If an HD call fails, auto-suggest retry with standard quality at half cost. |

Manifest format (`docs/visual-generation-manifest.md`):
```markdown
# Visual Generation Manifest
| Date | Asset | File | Model | Size | Quality | Est. Cost |
|---|---|---|---|---|---|---|
| 2026-05-09 | piercing banner | piercing-hero.png | dall-e-3 | 1792×1024 | hd | $0.080 |
```

## 12. Recommended commands

```bash
# Add to package.json scripts
"gen:visual":    "node scripts/gen-visual.mjs"
"gen:visual:dry"  "node scripts/gen-visual.mjs --dry-run"
"gen:visual:p"    "node scripts/gen-visual.mjs --prompt-only"   # save prompt, no API

# Usage
npm run gen:visual:dry                     # see what would be generated
npm run gen:visual -- --type hero --subject "meteorite-collection" --variant "dark-portrait"
npm run gen:visual -- --type og --page about --variant "meteorite-final"
npm run gen:visual -- --type category --subject piercing --variant "hero"
npm run gen:visual -- --type placeholder --category hangers --variant "bronze-ammonite"
npm run gen:visual -- --type 404 --variant "cosmic"
npm run gen:visual -- --list-types         # show supported asset types
npm run gen:visual -- --manifest           # show cost history

# Post-generation (automatic in script, also manual):
node scripts/clean-images.mjs              # strip EXIF + convert >800KB to WebP
node scripts/gen-avif.mjs                  # AVIF companions
```

## 13. Next implementation step

When approved, implement in this order:

1. **Create `scripts/gen-visual.mjs`** — single file with:
   - Argument parser (`--type`, `--subject`, `--variant`, `--dry-run`, `--prompt-only`, `--quality`, `--force`)
   - Brand doc reader (reads from `~/Obsidian/WenuAgent/brand/`)
   - Prompt builder per asset type (renders template from brand data)
   - Approval gate (readline prompt)
   - OpenAI API caller (fetch to `api.openai.com/v1/images/generations`)
   - Image saver (base64 decode → PNG → `public/img/<type>/`)
   - Post-processing runner (calls `clean-images.mjs` + `gen-avif.mjs`)
   - Handoff writer (`docs/handoffs/<date>-<slug>/spec.md`)
   - Manifest logger (`docs/visual-generation-manifest.md`)
   - Safety checks (file exists, cost cap, max generations)
   - Key redaction in all error handlers
   - No dependencies beyond `sharp` (already in `wenu-frontend`), `fetch` (Node 18+), and `dotenv` (or `process.env` via `--env-file`)

2. **Create `prompts/visual/`** with initial prompt templates:
   - `hero.md` — homepage hero template
   - `category.md` — category banner template
   - `brand.md` — brand banner / OG template
   - `placeholder.md` — product placeholder template
   - `404.md` — 404 page visual template

3. **Add `OPENAI_API_KEY` and `OPENAI_IMAGE_MODEL`** to `wenu-frontend/.env.example` (human copies value from `~/wenu-agent-hub/.env`).

4. **Add scripts to `package.json`** — `"gen:visual"` and `"gen:visual:dry"`.

5. **First run in dry mode** — `npm run gen:visual:dry -- --type hero --subject test` — verify prompts look good without spending credits.

6. **Iterate on prompt quality** — refine templates until the dry-run prompts are brand-true.
