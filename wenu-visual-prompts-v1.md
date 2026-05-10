# Wenu Mapu — Visual Prompts Pack v1

Date: 2026-05-10 (CEO night)
Scope: ready-to-use prompts for the most-needed visual assets. Default mode = **Mode A (prompt-only)** per `wenu-visual-agent-plan.md` §3 — no images generated tonight, no credits spent.

When the owner explicitly approves generation:
- Run via `~/wenu-frontend/scripts/gen-visual.mjs` (per the refined visual-agent plan)
- Cap: 2 generations per asset
- Save outputs to `public/img/_drafts/` (NOT directly to final paths)
- Write a manifest entry per generation
- Approve before moving to final path

Negative prompts and rejection criteria apply to every prompt below.

---

## 1. Universal negative prompt (append to every generation)

```
Negative: no human faces, no fake tribal patterns, no festival aesthetic, no boho aesthetic, no fantasy clichés, no cyberpunk, no AI clip-art look, no soft glow halos, no plastic gradients, no watermarks, no signatures, no model artifacts, no pure red / pure blue / pure yellow, no drop shadows, no decoration for decoration's sake, no busy compositions, no faux-aged textures.
```

---

## 2. Brand palette (use exactly in every prompt)

- **Obsidian** `#080706`
- **Bone** `#F2EDE4`
- **Sand** `#D6C1A3`
- **Silver** `#A8A39A`
- **Bronze** `#8A6A43`
- **Ember** `#C4935A`

When colors are specified in a prompt, use HEX values inline so the model has zero room to drift.

---

## 3. Per-asset prompts

### 3.1 Homepage hero (replacement / variant)

- **Asset slot:** `src/pages/index.astro` hero `<picture>`
- **Final path target:** `public/img/hero/hero-portrait-{600,900,1200,1800}w.{webp,avif}`
- **Aspect:** 4:5 portrait (1200 × 1500 base)
- **Tool:** real photographer preferred (this is THE marquee image). AI generation is for **mood compositing or background replacement only**, never the model.

**Prompt — for AI mood / background composition WITHOUT a face (silhouette / hand / detail):**

```
A close-up editorial portrait detail of a hand-forged sterling silver hanger resting against bare clavicle skin, dark obsidian #080706 background, single soft top light from upper left, deep negative space, sand-toned skin (#D6C1A3 highlights), the silver piece catching one cool reflection (#A8A39A), composition follows rule of thirds with the piece in the lower-right third, no face visible (frame ends at jawline), no hair, no clothing decoration, dark ritual luxury, editorial fashion photography, 4:5 portrait, 1200×1500 pixels, photorealistic, high contrast, no text, no watermark.
```

**Acceptance criteria:**
- ✅ No face / no model identity visible
- ✅ Single point of light, deep shadow elsewhere
- ✅ Skin tone in sand range (no pink / orange / over-saturated)
- ✅ Silver piece reads as Wenu Mapu (clean lines, hand-forged feel — not commercial jewelry-store gloss)
- ✅ Negative space dominant (≥50%)
- ❌ Reject if the model looks anywhere close to a real person who could be confused with a customer or the founder

---

### 3.2 Piercing category banner

- **Asset slot:** `public/img/categories/piercing.png` (current — replace with .webp)
- **Final path target:** `public/img/categories/piercing.webp` + `.avif`
- **Aspect:** 16:9 banner (1600 × 900)

**Prompt:**

```
A macro detail of three implant-grade titanium septum clickers arranged on a flat obsidian #080706 surface, hairline composition with 80% negative space, single cool overhead light, 1600×900 pixels, dark ritual luxury, editorial product photography, photorealistic, no human, no body, no face, no hands, no jewelry display props, no decorative clutter, no glitter, no watermark, sharp focus on the curvature of the metal, soft shadow only directly under each piece, monochromatic with single bronze accent (#8A6A43) reflecting from a single piece.
```

**Acceptance criteria:**
- ✅ Three pieces only — no more, no fewer
- ✅ Reads as serious metalwork, not as commerce
- ✅ Background is true obsidian (not gray, not blue)

---

### 3.3 Hangers category banner

- **Asset slot:** `public/img/categories/hangers.png` → replace
- **Final path:** `public/img/categories/hangers.webp` + `.avif`
- **Aspect:** 16:9

**Prompt:**

```
A single hand-forged sterling silver hanger pendant suspended in mid-frame, against deep obsidian #080706 background, the chain catching a single thin bronze light from upper right, the piece weighted naturally (gravity visible in the curve of the silver), 1600×900 pixels, editorial product photography, photorealistic, no human, no body, no face, no hands holding the chain, no studio lighting reflectors visible, no watermark, no logo. Surrounding 70% negative space. Dark ritual luxury.
```

---

### 3.4 Amulets category banner

- **Final path:** `public/img/categories/amulets.webp` (already exists; this is a refinement option)

**Prompt:**

```
A close-up of a single sterling silver amulet pendant, cosmic-symbol motif (abstract four-pointed star or volcanic-line geometry), resting flat on raw bone-colored linen (#F2EDE4) against an obsidian #080706 background corner, edge-lit from upper left with bronze (#8A6A43) reflection, 1600×900 pixels, editorial product photography, photorealistic, no human, no face, no hands, no clutter, no other pieces in frame, no watermark. Composition: amulet in lower-right third, 60% negative space.
```

---

### 3.5 Ear weights category banner

- **Final path:** `public/img/categories/ear-weights.webp` (already exists; refinement)

**Prompt:**

```
A pair of hand-forged ear weights — one tear-drop shape, one geometric — arranged side by side on a flat obsidian #080706 surface with bone-colored linen (#F2EDE4) under one corner. Top-down composition. Single cool light from above. 1600×900 pixels, editorial product photography, photorealistic, no human, no face, no hands, no display stands, no jewelry rolls, no watermark. The pair reads as balanced for the body. Surrounding 60% negative space. Dark ritual luxury.
```

---

### 3.6 Ritual objects category banner

- **Final path:** `public/img/categories/ritual-pieces.png` → replace `.webp`

**Prompt:**

```
A small hand-forged bronze incense vessel and a single sterling silver hand-piece talisman, arranged on raw obsidian stone surface, with one wisp of smoke rising from the vessel (subtle, not theatrical), single warm ember light (#C4935A) from upper right, 1600×900 pixels, editorial photography, photorealistic, no human, no face, no fire visible, no flames, no candles, no excessive smoke, no watermark. Negative space dominant. Dark ritual luxury.
```

**Acceptance criteria:**
- ✅ Smoke is subtle (one thin wisp, not a cloud)
- ✅ No literal fire / flame visible
- ❌ Reject if it looks like a wellness-industry candle ad

---

### 3.7 Materials hub visual (per-material macros)

For `/material/<key>` landings. These should ideally be REAL photographs of the brand's materials. AI generation is acceptable as a placeholder ONLY until a real shoot lands.

#### Sterling Silver

```
A macro close-up of a hand-forged sterling silver bar / sheet edge against obsidian #080706, single cool white light from above, the silver showing tool marks from hand-forging (file marks, slight asymmetry), no polish gloss, 1024×1024 pixels, editorial material photography, photorealistic, no human, no face, no hands, no jewelry tools in frame, no watermark.
```

#### 14k Gold

```
A macro close-up of a hand-forged 14k yellow gold ring shank in profile, against obsidian #080706 with bronze (#8A6A43) ambient light from below, the gold showing warm depth without glitter, 1024×1024 pixels, editorial material photography, photorealistic, no human, no face, no hands, no diamond, no stones, no watermark.
```

#### Implant-grade Titanium

```
A macro close-up of an ASTM F-136 implant-grade titanium piece edge — a labret post and disc — against obsidian #080706, single cool overhead light, the titanium showing matte cool-gray surface with no polish gloss, 1024×1024 pixels, editorial material photography, photorealistic, no human, no face, no hands, no medical-equipment association, no clinical sterility look, no watermark.
```

#### Vacamuerta Meteorite

```
A macro close-up of a single Atacama meteorite fragment (Vacamuerta), iron-nickel matrix surface visible (Widmanstätten pattern faintly etched), set into a sterling silver bezel (the bezel only partially visible at the frame edge), against obsidian #080706 with one warm ember light (#C4935A) from upper left, 1024×1024 pixels, editorial material photography, photorealistic, no human, no face, no hands, no fictional crystalline structures, no fantasy meteor look, no watermark. The meteorite reads as ancient iron, not as a gemstone.
```

**Acceptance criteria for meteorite especially:**
- ✅ Iron-gray / dark gray surface, NOT colorful
- ✅ Slight Widmanstätten crystalline pattern visible
- ❌ Reject if it looks like opal / rainbow / glowing / sci-fi

#### Walnut & Tropical Wood

```
A macro close-up of a hand-turned walnut wood plug edge, the grain reading as a continuous cosmic line, against obsidian #080706 with single warm light from upper right, 1024×1024 pixels, editorial material photography, photorealistic, no human, no face, no hands, no varnish gloss, no fake aging, no watermark.
```

#### Brass & Bronze

```
A macro close-up of a hand-forged brass / bronze bar edge with natural patina (no polish), against obsidian #080706 with one ember light (#C4935A) from below, 1024×1024 pixels, editorial material photography, photorealistic, no human, no face, no hands, no antique-shop aesthetic, no watermark.
```

---

### 3.8 Product placeholder (for PDPs missing real product photography)

```
A neutral 1:1 square frame, deep obsidian #080706 background, a small bronze (#8A6A43) hairline cardinal cross (four short lines radiating from a center point) at the visual center, occupying ~10% of the frame, with the wordmark "WENU MAPU" in fine letter-spaced caps (font: serif, similar to DM Serif Display) below the cross at 30% opacity, 1024×1024 pixels, no human, no body, no face, no logo SVG embedded, no watermark, true minimal placeholder for an unphotographed piece.
```

---

### 3.9 OG image default (fallback for pages without per-page OG)

```
A 1200×630 horizontal frame, deep obsidian #080706 background, the wordmark "WENU MAPU" in fine letter-spaced caps centered, with the line "Adornment for the sacred body." in serif italic centered below the wordmark, both in bone (#F2EDE4) at 90% opacity, with a single bronze (#8A6A43) hairline pattern band running across the bottom 10% of the frame, no human, no body, no face, no other text, no watermark, no logo SVG, true editorial OG image.
```

---

### 3.10 404 visual

```
A 1024×1024 square, deep obsidian #080706 background, a single bronze (#8A6A43) hairline cardinal cross slowly rotating (no, NOT animated — single static frame), occupying 30% of frame at the visual center, with the line "Not in this portal" in fine serif caps below the cross at 60% opacity, no human, no body, no face, no broken-link icon, no error-page cliché, no watermark.
```

---

## 4. Nano Banana / Gemini edit prompts (for refining EXISTING photos)

When real product photography exists but needs background cleanup or color matching, use Nano Banana / Gemini Vision edit:

### Background replacement

```
Edit: replace the background with deep obsidian #080706 only. Keep the subject (the jewelry piece) untouched, including its shadow on the surface directly beneath it. Do not add any new objects, decoration, or text. Preserve the single light direction visible in the original. 1024×1024 output.
```

### Color matching to brand palette

```
Edit: shift the photo's color cast so the highlights are bone (#F2EDE4) and the shadows are obsidian (#080706). Preserve material accuracy of the metal — silver should read silver, gold should read warm yellow. Reduce saturation by 15% globally. Do not add any color grading "look" beyond this. Preserve composition.
```

### Crop + composition fix

```
Edit: re-crop to 1:1 square with the subject in the lower-right third per rule of thirds. Add 60% negative space on the upper-left two-thirds. Background fill: deep obsidian #080706 (preserve any natural light gradient). Do not warp, stretch, or add any objects.
```

---

## 5. Asset manifest template

Every generation logs one row to `docs/handoffs/<date>-<slug>/manifest.json`. Schema per `wenu-visual-agent-plan.md` §5. New helper format for tonight's prompts pack:

```json
{
  "asset_id": "homepage-hero-v2",
  "slot": "src/pages/index.astro hero <picture>",
  "kind": "raster-hero",
  "mode": "prompt-only",
  "status": "draft",
  "tool_intended": "OpenAI gpt-image-1 (DALL-E 3) HD",
  "prompt_file": "prompt-homepage-hero.md",
  "negative_prompt_file": "negative-prompt.md",
  "approved_by": null,
  "options_generated": 0,
  "options_max": 2,
  "draft_paths": [],
  "final_path_when_approved": "public/img/hero/hero-portrait-1200w.png",
  "post_processing": ["scripts/clean-images.mjs", "scripts/gen-avif.mjs"],
  "acceptance": "see prompts pack v1 §3.1 acceptance criteria",
  "estimated_cost_usd": 0.08
}
```

---

## 6. Folder paths (where assets eventually land)

| Asset type | Final folder | Naming |
|---|---|---|
| Hero variants | `public/img/hero/` | `hero-portrait-{600,900,1200,1800}w.{webp,avif}` |
| Category banners | `public/img/categories/` | `<slug>.webp` + `<slug>.avif` if > 800 KB |
| Material macros | `public/img/materials/` (new folder) | `<material-key>.webp` + `.avif` |
| Editorial / Journal | `public/img/editorial/` (new folder) | `<entry-slug>-{1,2,3}.webp` |
| Workshop | `public/img/truckee/` (existing) | `workshop-{interior,detail-N}.webp` |
| Founder portrait | `public/img/brand/` (existing) | `founder-portrait.webp` |
| Patterns / dividers | `public/assets/patterns/`, `public/assets/dividers/` | `<slug>.svg` |
| Product placeholder | `public/img/products/` | `placeholder-cardinal-cross.webp` |
| OG default | `public/img/brand/` | `og-default.webp` |
| 404 visual | `public/img/brand/` | `404.webp` |
| Drafts (in review) | `public/img/_drafts/` | `<date>-<slug>-v{N}.<ext>` |
| Rejected (archived) | `public/img/_drafts/_rejected/` | same |

Aftercare folders (`public/aftercare/*`, `public/downloads/*`) are OFF-LIMITS — no visual generation lands there.

---

## 7. Credit discipline (binding)

- **No generation without explicit human approval per asset.** Default: Mode A (prompt-only).
- **Cap:** 2 generations per asset. Then approve or revise prompt.
- **Cost ceiling per session:** $5. If exceeded → STOP and report.
- **Monthly soft cap:** $20. If exceeded → re-evaluate the pipeline.
- **Real photography always preferred over AI for product / face / workshop.** AI is for mood / background / placeholder / minimal SVG-style assets only.

---

## 8. Approval criteria (per-asset checklist before integration)

For each generated asset, before it leaves `_drafts/`:

- [ ] Inside Wenu Mapu palette (no off-palette colors)
- [ ] No human face / no founder identity / no real customer recognizable
- [ ] No fake tribal motifs / no festival aesthetic / no fantasy
- [ ] No watermark / no model signature / no "AI-look" artifacts
- [ ] Negative space ≥ 50%
- [ ] Reads as "this could be on Maria Tash / Aesop" — premium register
- [ ] File size: SVG ≤ 6 KB, WebP ≤ 250 KB at hero size, AVIF companion if > 800 KB original
- [ ] Naming convention follows `public/img/README.md`
- [ ] Manifest entry updated with `status: in-review`
- [ ] Owner has explicitly said "approve"

---

## 9. Rejection criteria (auto-reject on sight)

Any asset that:

- Has soft glow halos, plastic gradients, or "AI rendering" tells
- Includes invented "tribal" patterns
- Renders a face the customer might confuse with the founder or themselves
- Includes vivid primary colors not in the palette
- Includes fire / flame / candles (smoke is OK if subtle)
- Has any text outside the brand wordmark / approved phrases
- Looks like a stock-photo wedding / festival / wellness ad
- Uses any model artifacts (e.g., model name baked into the image)
- Includes any watermark

→ Move to `public/img/_drafts/_rejected/` with one-line reason in the manifest.

---

## 10. Out of scope tonight

- Generating ANY image (Mode A only)
- Spending ANY credits
- Creating new prompt templates beyond §3 list
- Creating an AI video pipeline
- 3D / Blender / generative-3D pipeline
- Logo redesign (logo system is in `~/Obsidian/WenuAgent/brand/logo-system.md`; not regenerated)
