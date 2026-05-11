# Codex Task 6 — PDP Trust Block + Related Pieces rail (final prompt)

Date prepared: 2026-05-10 (CEO night, parallel prep)
Scope: paste-ready prompt to add 2 small but high-leverage components to every product detail page (PDP):

1. **`<Spec>` component** — compact trust block under "Add to cart" (material / gauge / made-in / sizing / aftercare / returns / commission).
2. **`<RelatedPieces>` rail** — 3 cross-sell cards picked from the same material or same maker series.

Both come from `market-reference-study-wenu-mapu.md` §7 (premium PDP trust) and §19 (Codex Jobs 2 + 3). Both are net commercial uplift on every PDP in the catalogue.

Runs AFTER Codex Task 2 (Materials) has shipped + been approved. Has no dependency on Tasks 3, 4 or 5.

---

## Pre-flight checklist (Codex must confirm BEFORE first tool call)

- [ ] Codex Task 2 (Materials) reported `RESULT: success` AND human approved the commit.
- [ ] `git status` clean on `redesign-v2`.
- [ ] `nvm use && npm run build` is green RIGHT NOW (≥ 64 product pages — postbuild floor).
- [ ] You have read `AGENT_CONTROL_CENTER.md` + `DO_NOT_TOUCH.md` + `market-reference-study-wenu-mapu.md` §7 + §19 + this prompt end-to-end.
- [ ] You have READ `src/pages/p/[slug].astro` (the PDP template you will modify) and `src/components/ProductCard.astro`.
- [ ] You have confirmed the existing PDP renders gauge / material / dimensions data from WC — Codex must reuse what's there, not invent fields.

If any box is unchecked, STOP and report blocked.

---

## Files allowed (write list)

```
NEW components:
  src/components/visual/Spec.astro             (compact 5-7 row trust block)
  src/components/visual/RelatedPieces.astro    (3-card cross-sell rail)

EDIT:
  src/pages/p/[slug].astro                     (insert <Spec> under ATC; insert <RelatedPieces> below long description)
  src/i18n/en.json                             (APPEND spec.* and related.* labels)
```

That is the entire allowed write list.

---

## Forbidden actions

- Any other file. No nav change. No homepage change. No `Base.astro` change. No new CSS files.
- `Footer.astro`, `Newsletter.astro` — owned by other tasks; do not touch.
- `git commit`, `git push`, deploy, DNS, Cloudflare, WC writes.
- `.env*` reads/writes.
- Image generation.
- Aftercare files (`public/aftercare/*`, `dist/aftercare/*`, `src/pages/care-guide.astro`) — OFF-LIMITS. The `<Spec>` block LINKS to `/care-guide`; it never quotes from it.
- Adding new fields to WC products (no API writes; only reads).
- Inventing data that isn't already in WC (no fake "ASTM F-136" labels on non-titanium pieces; only render what the product actually carries).

---

## `<Spec>` component design

### Purpose

Render a compact, scannable table of trust signals under the "Add to cart" button. Premium body-jewelry PDP convention — see Buddha Jewelry, Maria Tash, BVLA precedent (per `market-reference-study-wenu-mapu.md` §7).

### Rows (render only what's available; skip silently otherwise)

| Row | Source | Example value |
|---|---|---|
| Material | Product's primary material attribute / category | `Sterling Silver 950 — pure, durable, alive with light.` |
| Gauge / size | Product's gauge attribute, fallback to dimensions | `16G (1.2 mm) · 8 mm post` OR `Inner diameter 8 mm` |
| Made in | Hardcoded | `Truckee, California — hand-forged` |
| Sizing | Cross-link | `Find your size →` (→ `/sizing-guide`) |
| Aftercare | Cross-link | `Read the aftercare guide →` (→ `/care-guide`) |
| Returns | Cross-link | `Body jewelry — see hygiene policy →` (→ `/shipping`) |
| Custom | Cross-link | `Want a custom variant of this? Start a commission →` (→ `/custom-orders`) |

### Material lockup mapping

The "Material" row's text is the product's material name PLUS the canonical lockup phrase from `BRAND-DNA-2026-05-03.md` §4 (already in `wenu-english-copy-pack-v1.md` §15 and `materials-pages-copy-and-seo.md`):

| Material slug detected on product | Material row text |
|---|---|
| `silver`, `sterling`, `925`, `950` | `Sterling Silver 950 — pure, durable, alive with light.` |
| `gold`, `14k` | `14k Gold — heirloom-grade. Warm. Made to outlast the wearer.` |
| `titanium`, `titanio` | `ASTM F-136 implant-grade titanium — hypoallergenic, durable, lightweight.` |
| `vacamuerta`, `meteorite`, `atacama` | `Atacama meteorite — cosmic fragments, 4.5 billion years old.` |
| `walnut`, `wood`, `madera` | `Walnut & tropical wood — sustainably sourced, warm, and grounded.` |
| `brass`, `bronze`, `laton` | `Brass & bronze — bold ancestral metals with deep tribal roots.` |

If a product's category slugs match MULTIPLE materials (e.g., a "Sterling Silver with Atacama Meteorite" piece): render the row as a combined string with both phrases joined by " · " — example: `Sterling Silver 950 — pure, durable, alive with light. · Atacama meteorite — 4.5 billion years old.` Keep the total row length scannable (under 200 chars).

If no material is detected: skip the Material row silently. Do NOT render `Material: unknown`.

### Layout

Inline `<style>` block in `Spec.astro`. Compact 2-column table:

```
+--------------+------------------------------------------+
| Material     | Sterling Silver 950 — pure, durable…    |
+--------------+------------------------------------------+
| Gauge / size | 16G (1.2 mm) · 8 mm post                |
+--------------+------------------------------------------+
| Made in      | Truckee, California — hand-forged       |
+--------------+------------------------------------------+
| Sizing       | Find your size →                        |
+--------------+------------------------------------------+
| Aftercare    | Read the aftercare guide →              |
+--------------+------------------------------------------+
| Returns      | Body jewelry — see hygiene policy →     |
+--------------+------------------------------------------+
| Custom       | Want a custom variant? Start a commission →|
+--------------+------------------------------------------+
```

Use existing tokens (`--bronze`, `--silver`, `--bone`, font sizes from `tokens.css`). No new colors. Mobile: stack rows to single column when viewport < 600px.

### i18n keys (append to `en.json`)

```json
"spec": {
  "label_material":  "Material",
  "label_gauge":     "Gauge / size",
  "label_made_in":   "Made in",
  "label_sizing":    "Sizing",
  "label_aftercare": "Aftercare",
  "label_returns":   "Returns",
  "label_custom":    "Custom",
  "made_in_value":   "Truckee, California — hand-forged",
  "sizing_cta":      "Find your size →",
  "aftercare_cta":   "Read the aftercare guide →",
  "returns_cta":     "Body jewelry — see hygiene policy →",
  "custom_cta":      "Want a custom variant? Start a commission →"
}
```

---

## `<RelatedPieces>` component design

### Purpose

3-card rail below the long product description. Cross-sells from the same material OR same maker series (collection slug or product name prefix). Premium PDP convention.

### Selection logic (Codex implements)

For each rendered PDP:

1. Pull the current product's category slugs and name.
2. Get all products via `getProducts(50)` (already paginated; no new pagination logic).
3. Filter candidates: any product (a) not the current product AND (b) sharing at least one category slug match (material or collection) OR (c) sharing the same name prefix before the first " — " or "Nº" (maker series detection).
4. Score each candidate:
   - +3 if shares same material slug (sterling-silver, vacamuerta, etc.).
   - +2 if shares same collection slug (ritual-ring-vacamuerta, mystic-series, author-jewelry).
   - +1 if shares same placement (piercing, hangers, ear-weights, amulets, ritual-objects).
   - +2 if name prefix matches (e.g., both start with `Ritual Ring Vacamuerta`).
5. Sort by score, descending. Tie-break by `featured` flag then by creation date.
6. Take top 3 with valid images.
7. If fewer than 3 candidates: render whatever exists. Do NOT fill with random products. Empty rail is acceptable.

### Layout

Use existing `ProductCard.astro` in `archive` or default mode (mirror whatever `/piercing.astro` uses for its featured rail). Reuse `.landing__rail` CSS class from `global.css`.

```astro
<section class="related-pieces section--mega">
  <div class="container">
    <p class="eyebrow">RELATED PIECES</p>
    <h2>Pieces in the same thread</h2>
    <div class="landing__rail">
      {related.map(p => <ProductCard product={p} />)}
    </div>
  </div>
</section>
```

### i18n keys (append to `en.json`)

```json
"related": {
  "eyebrow": "RELATED PIECES",
  "title":   "Pieces in the same thread"
}
```

---

## Where to inject in `/p/[slug].astro`

Codex reads the existing `/p/[slug].astro` to find the right insertion points. Conventionally:

1. `<Spec product={product} />` — IMMEDIATELY below the "Add to cart" button block, BEFORE the long description.
2. `<RelatedPieces product={product} allProducts={all} />` — BELOW the long description, ABOVE the footer pattern band (if any).

Do NOT alter the existing gallery, ATC, price, or JSON-LD blocks. Both new components are additive.

If `getProducts(50)` is not already invoked in `/p/[slug].astro` (it may pull just the single product), Codex adds the call to fetch the catalogue for the `<RelatedPieces>` component. This is a build-time call — no runtime cost on the client.

---

## Build + acceptance

```bash
nvm use && npm run build
```

Expected:

- **Page count:** unchanged from baseline (this task does not add routes; it adds components to existing PDPs).
- **Products page count:** 64. postbuild OK.
- **No TS errors, no Astro warnings.**

Verify on a known-good PDP (Codex picks a sterling-silver piece OR a vacamuerta piece — flagship test):

```bash
# Pick the first available PDP
PDP=$(ls dist/p/ | head -1)
grep -c "RELATED PIECES" "dist/p/${PDP}/index.html"   # >= 1
grep -c "Made in"        "dist/p/${PDP}/index.html"   # >= 1
grep -c "Truckee, California — hand-forged" "dist/p/${PDP}/index.html"  # >= 1

# Material lockup phrase present on at least one PDP per material
grep -rcl "Pure, durable, and alive with light"      dist/p/ | wc -l   # >= 1
grep -rcl "ASTM F-136 implant-grade titanium"        dist/p/ | wc -l   # >= 1
grep -rcl "4.5 billion years"                        dist/p/ | wc -l   # >= 1 (if vacamuerta pieces exist in catalogue)

# Forbidden-words sweep
grep -rEHn "Petrolia|Rizoma|Truth Tattoo|Showroom at home|\+145|contact@wenumapuonline\.com|beautiful|magical|enchanted" \
  src/components/visual/Spec.astro src/components/visual/RelatedPieces.astro src/pages/p/
# expected: 0 hits

# Aftercare files UNTOUCHED
git diff --stat src/pages/care-guide.astro public/aftercare/ dist/aftercare/
# expected: empty
```

Manual UX verification (you MUST do this before reporting success):

1. `npm run preview`.
2. Visit `/p/<first product slug>/`. Confirm:
   - `<Spec>` block renders under ATC with at least 4-5 rows.
   - "Material" row shows the canonical lockup phrase for the product's actual material.
   - All cross-link rows are clickable and route to the correct pages.
   - `<RelatedPieces>` rail renders 3 cards (or fewer if catalogue can't supply 3 thematically-related pieces).
3. Visit a Vacamuerta piece — confirm Material row says `Atacama meteorite — cosmic fragments, 4.5 billion years old.`
4. Visit a piercing piece — confirm Material row says `ASTM F-136 implant-grade titanium — hypoallergenic, durable, lightweight.`
5. Mobile viewport (< 600px): `<Spec>` rows stack to single column without overflow. `<RelatedPieces>` rail scrolls horizontally OR stacks (whichever the existing `.landing__rail` does on mobile).

If any check fails, STOP and report.

---

## Report (per `AGENT_HANDOFF_PROTOCOL.md`, ≤ 200 words)

```
RESULT: <success | blocked | partial>
WHAT CHANGED:
  - src/components/visual/Spec.astro (NEW)
  - src/components/visual/RelatedPieces.astro (NEW)
  - src/pages/p/[slug].astro (EDIT — inserted both components)
  - src/i18n/en.json (APPEND spec.* + related.* blocks)
WHAT WAS VERIFIED:
  - npm run build → same page count as baseline, 64 products, postbuild OK
  - Spec block renders on PDPs with correct material lockup phrase
  - RelatedPieces rail renders up to 3 thematic matches
  - /care-guide and /aftercare/* UNTOUCHED
  - Forbidden-words scan: 0
  - Manual UX check on 4 PDPs (sterling, titanium, vacamuerta, wood): pass
WHAT'S NEXT: Codex Task 4 (Journal) OR Cloudflare Pages preview deploy decision
NOTES FOR HUMAN: <only if action needed>
```

---

## Hard rules echo

1. Read control center + DO_NOT_TOUCH + market-reference §7/§19 + this prompt first.
2. Per-edit + per-commit human approval.
3. **No commit, no push, no deploy.**
4. **No DNS, no Cloudflare, no Tunnel.**
5. **No WC writes.** Reads only.
6. No `.env*` reads-into-output.
7. **No Aftercare modifications.** Cross-link only.
8. `npm run build` after every batch.
9. Report ≤ 200 words.
10. **No invented data.** Only render fields that exist on the product. Skip rows silently when data is missing.

---

## Commit message

```
feat(pdp): add Spec trust block + RelatedPieces rail to product pages
```

ONE commit.

---

## References

- `~/wenu-frontend/market-reference-study-wenu-mapu.md` §7 (PDP trust convention) + §19 (Codex Jobs 2 + 3)
- `~/wenu-frontend/wenu-english-copy-pack-v1.md` §15 (PDP trust block paste-ready copy)
- `~/wenu-frontend/materials-pages-copy-and-seo.md` (material lockup mapping)
- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` §4
- `~/wenu-frontend/agent-control/*`
