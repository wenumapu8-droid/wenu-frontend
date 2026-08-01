# Materials Pages — Copy and SEO

Date: 2026-05-10 (CEO night, parallel to Codex Task 1)
Scope: paste-ready copy + SEO blocks for the Astro Materials hub and 6 per-material deep-dive pages. Source-of-truth for **Codex Task 2** (`codex-task-2-materials-pages-final-prompt.md`).

This file is the canonical content source. Codex consumes it verbatim; do not let Codex paraphrase the canonical lockup phrases.

---

## 0. Inputs and rules

- **Material lockup phrases** — non-negotiable, from `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` §4. Each material has ONE phrase that must appear wherever the material is named.
- **Voice rules** — `voz-de-marca-real-2026-05-03.md`. Allowed lexicon: ritual, ancestral, sacred, portal, cosmos, fragment, body, signal, cycle, origin, threshold, mysticism, intentional, sacred territory, "Born from the Earth, guided by the Cosmos", handcrafted, one of a kind, ceremonial, bridge between worlds, Mapuche, tribal, cosmic, contemporary, memory, Earth, Atacama, 4.5 billion years, Land of the Sky.
- **Forbidden lexicon** — beautiful, magical, enchanted, perfect, positive energy, "Mapuche Root", "Earthly", "Earthborn", any AI cliché. Plus the canonical-business forbidden list: Petrolia, Rizoma, Truth Tattoo, Troll Studio, Lucky7, Showroom at home, vitrine, walk-ins, studio location.
- **Length discipline** — H1 ≤ ~50 chars where possible, sub ≤ 1 sentence, meta ≤ 155 chars, SEO `<title>` ≤ 60 chars.
- **Material lockup phrases (canonical, BRAND-DNA §4):**
  - Sterling Silver 950 → "Pure, durable, and alive with light."
  - 14k Gold → "Heirloom-grade. Warm. Made to outlast the wearer."
  - Implant-grade Titanium → "Hypoallergenic, durable, lightweight." (medical register; no ancestral claim)
  - Vacamuerta Meteorite → "Cosmic fragments that fell in Chile's Atacama Desert. Each piece carries 4.5 billion years of history."
  - Walnut & Tropical Wood → "Sustainably sourced, warm, and grounded."
  - Brass & Bronze → "Bold ancestral metals with deep tribal roots."

---

## 1. Brand-wide /materials primer (EXISTS — keep)

Route: `/materials`
Status: EXISTS in Astro (`src/pages/materials.astro`) and is on-voice. NO REWRITE in Codex Task 2 — only ensure that each material section in `/materials` cross-links to its `/material/<key>` deep-dive page once those land.

The `/materials` primer remains the brand-wide starting point. The deep-dive pages below are SEO-targeted children.

---

## 2. /material — Material axis hub (NEW)

- **Route:** `/material/index.astro`
- **Status:** NEW
- **Eyebrow:** MATERIALS
- **H1:** Six materials, six origins.
- **Subheadline:** We work in six material families. Each carries its own provenance and its own behavior on the body.
- **SEO `<title>`:** Materials — Six material families | Wenu Mapu
- **Meta:** The six material families behind every Wenu Mapu piece. Sterling silver, 14k gold, titanium, Atacama meteorite, walnut, brass.
- **Sections:**
  1. Hero (eyebrow + H1 + sub).
  2. Lede paragraph: "We do not work in materials we cannot vouch for. Every piece names its material, names its provenance, and names what to expect of it on the body."
  3. 6 cards grid (one per material). Each card uses the existing `.archive-card` pattern from `global.css`.
- **Card content (one per material):**
  - **Card 1 — Sterling Silver 950**
    - Image: `/img/categories/silver.webp` (placeholder until macro shoot)
    - Title: Sterling Silver 950
    - Sub: Pure, durable, and alive with light.
    - Link: `/material/sterling-silver`
  - **Card 2 — 14k Gold**
    - Image: `/img/categories/gold.webp`
    - Title: 14k Gold
    - Sub: Heirloom-grade. Warm. Made to outlast the wearer.
    - Link: `/material/14k-gold`
  - **Card 3 — Implant-grade Titanium**
    - Image: `/img/categories/titanium.webp`
    - Title: Implant-grade Titanium
    - Sub: Hypoallergenic, durable, lightweight. ASTM F-136.
    - Link: `/material/titanium`
  - **Card 4 — Vacamuerta Meteorite**
    - Image: `/img/categories/meteorite.webp`
    - Title: Vacamuerta Meteorite
    - Sub: Cosmic fragments from Chile's Atacama Desert. 4.5 billion years old.
    - Link: `/material/vacamuerta`
  - **Card 5 — Walnut & Tropical Wood**
    - Image: `/img/categories/wood.webp`
    - Title: Walnut & Tropical Wood
    - Sub: Sustainably sourced, warm, and grounded.
    - Link: `/material/walnut-wood`
  - **Card 6 — Brass & Bronze**
    - Image: `/img/categories/brass.webp`
    - Title: Brass & Bronze
    - Sub: Bold ancestral metals with deep tribal roots.
    - Link: `/material/brass-bronze`
- **JSON-LD:** `CollectionPage` + `BreadcrumbList` (Home → Materials)
- **Forbidden words for this block:** beautiful, magical, enchanted, perfect, positive energy.

---

## 3. /material/sterling-silver (NEW)

- **Route:** `/material/sterling-silver.astro`
- **Status:** NEW
- **Eyebrow:** STERLING SILVER 950
- **H1:** Sterling Silver 950 — pure, durable, alive with light.
- **Subheadline:** A higher silver content than standard 925. Heavier on the skin, brighter under light, ages with grace.
- **SEO `<title>`:** Sterling Silver 950 — Pure, durable, alive with light | Wenu Mapu
- **Meta:** Sterling silver 950 — higher silver content than 925. Hand-forged in Truckee, California. Used in amulets, hangers, ear weights and rings.
- **Canonical lockup phrase (BRAND-DNA §4):** *Pure, durable, and alive with light.*
- **Sections:**
  1. Hero.
  2. **Origin story** (3-5 sentences): "Sterling Silver 950 is our standard silver alloy — 95% pure silver, 5% copper. It carries more weight, more brightness, and more longevity than the more common 925. Used by Mapuche silversmiths for centuries in ceremonial pieces. We pour, hammer, and finish it by hand in our Truckee studio."
  3. **Craft note** (2-3 sentences): "Every piece is hand-finished — the surface tells you who made it. Small variations between units are part of the material's nature. Polished or oxidized finish per piece."
  4. Featured rail label: "Pieces in Sterling Silver 950"
  5. Cross-link block: → `/materials` primer · → `/care-guide` aftercare · → `/custom-orders` commission a silver piece.
- **Primary CTA:** Browse pieces in sterling silver → `/shop?material=sterling-silver`
- **Secondary CTA:** Aftercare guide → `/care-guide`
- **Internal links:** `/materials`, `/care-guide`, `/custom-orders`, `/journal/four-cardinal-forces` (forward-compat — entry not yet published; OK).
- **Product trust note:** "Solid 950 silver. Hand-finished in Truckee. Lifetime workshop repair on manufacturing defects."
- **Care note:** "Silver patinas with use. Wipe clean with a soft cloth; for deeper polish, see the care guide. Avoid chlorinated water and harsh chemicals."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList`.
- **Forbidden words for this block:** beautiful, magical, enchanted, perfect, positive energy.
- **KEYWORDS array (Codex consumes):** `['silver','plata','sterling','925','950']`

---

## 4. /material/14k-gold (NEW)

- **Route:** `/material/14k-gold.astro`
- **Status:** NEW
- **Eyebrow:** 14K GOLD
- **H1:** 14k Gold — heirloom-grade, made to outlast the wearer.
- **Subheadline:** 58% pure gold alloy. Yellow, rose or white. Reserved for commissions and signature pieces.
- **SEO `<title>`:** 14k Gold — Heirloom-grade body jewelry | Wenu Mapu
- **Meta:** 14k gold body jewelry — warm, durable, heirloom-grade. Reserved for commissions and signature pieces. Hand-forged in Truckee, California.
- **Canonical lockup phrase (BRAND-DNA §4):** *Heirloom-grade. Warm. Made to outlast the wearer.*
- **Sections:**
  1. Hero.
  2. **Origin story:** "14k gold is our long-game material — used for the pieces meant to leave the workshop and stay in a family. Sourced from certified suppliers in the United States. Available in yellow, rose and white finish. We work it for commissions and a small number of author-series signets and amulets."
  3. **Craft note:** "Each 14k piece is forged from solid alloy — no plating. Hand-set, hand-finished, with care to avoid contamination of the metal during work."
  4. Featured rail label: "Pieces in 14k Gold"
  5. Cross-link block: → `/custom-orders` (most 14k work is commissioned) · → `/materials` primer · → `/care-guide`.
- **Primary CTA:** Request a 14k commission → `/custom-orders`
- **Secondary CTA:** Browse pieces in 14k gold → `/shop?material=14k-gold`
- **Internal links:** `/custom-orders`, `/materials`, `/care-guide`.
- **Product trust note:** "Solid 14k gold — no plating. Hand-forged in Truckee. Lifetime workshop repair on manufacturing defects. Certificate of authenticity issued on commission pieces."
- **Care note:** "14k gold ages slowly. Wipe with a soft cloth; deeper polish via the care guide. Remove for swimming pools and saltwater bathing."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList`.
- **Forbidden words for this block:** beautiful, magical, enchanted, perfect, positive energy.
- **KEYWORDS array (Codex consumes):** `['gold','oro','14k','14-kilatess','14kilates','golden']`

---

## 5. /material/titanium (NEW)

- **Route:** `/material/titanium.astro`
- **Status:** NEW
- **Eyebrow:** IMPLANT-GRADE TITANIUM
- **H1:** Implant-grade titanium — ASTM F-136.
- **Subheadline:** The international standard for body-safe jewelry. Bio-compatible, hypo-allergenic, non-reactive.
- **SEO `<title>`:** Implant-grade Titanium — ASTM F-136 | Wenu Mapu
- **Meta:** Every Wenu Mapu piercing piece is forged from ASTM F-136 implant-grade titanium. Bio-compatible, hypo-allergenic, lifetime safe in the body.
- **Canonical lockup phrase (BRAND-DNA §4):** *Hypoallergenic, durable, lightweight.* (Medical register — no ancestral claim attached to titanium; the material's value is medical, not cosmological.)
- **Sections:**
  1. Hero.
  2. **Origin story:** "Every piece labeled \"piercing\" on this site is forged from ASTM F-136 implant-grade titanium — the same material used in surgical implants. Bio-compatible. Will not corrode. Will not provoke an allergic reaction. Stays in healing piercings without irritation."
  3. **Craft note:** "Titanium is harder to forge than silver or gold; we mill, anodize and finish each piece in-studio. Anodized colors are non-coating — they're light interference on the metal surface itself, will not flake."
  4. Featured rail label: "Piercing pieces in titanium"
  5. Cross-link block: → `/piercing` placement landing · → `/care-guide` aftercare · → `/sizing-guide` gauge reference.
- **Primary CTA:** Browse piercing pieces → `/piercing`
- **Secondary CTA:** Aftercare guide → `/care-guide`
- **Internal links:** `/piercing`, `/care-guide`, `/sizing-guide`, `/materials`.
- **Product trust note:** "ASTM F-136 implant-grade titanium. Same material as surgical implants. Bio-compatible. Safe for fresh and healing piercings."
- **Care note:** "Titanium needs little care. Sterile saline twice daily for healing piercings; mild soap and water for fully healed wear. See the aftercare guide for healing protocols."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList`.
- **Forbidden words for this block:** beautiful, magical, enchanted, perfect, positive energy. ALSO: do NOT attach ancestral or cosmological claims to titanium — its register is medical.
- **KEYWORDS array (Codex consumes):** `['titanium','titanio']`

---

## 6. /material/vacamuerta (NEW — flagship)

- **Route:** `/material/vacamuerta.astro`
- **Status:** NEW
- **Eyebrow:** ATACAMA METEORITE
- **H1:** Vacamuerta meteorite — cosmic fragments, 4.5 billion years old.
- **Subheadline:** Sourced from Chile's Atacama Desert. Each fragment carries 4.5 billion years of history. Limited and one-of-a-kind.
- **SEO `<title>`:** Vacamuerta Meteorite — Atacama meteorite jewelry | Wenu Mapu
- **Meta:** Hand-forged jewelry set with Vacamuerta meteorite from Chile's Atacama Desert. 4.5 billion years old. Limited, one-of-a-kind pieces.
- **Canonical lockup phrase (BRAND-DNA §4 — DO NOT REWRITE):** *Cosmic fragments that fell in Chile's Atacama Desert. Each piece carries 4.5 billion years of history.*
- **Sections:**
  1. Hero.
  2. **Origin story:** "Vacamuerta is our name for the iron-nickel meteorites recovered from Chile's Atacama Desert. The Atacama is the driest non-polar desert on Earth — meteorites that fall there are preserved instead of weathering away. The fragments we use are sourced through verified Chilean cooperatives that document chain of custody."
  3. **Craft note:** "Each meteorite piece is set by hand into silver or gold — never glued, never dyed. The Widmanstätten pattern (the cross-hatched crystalline grain visible inside iron-nickel meteorites) is etched and stabilized so the piece reveals its 4.5-billion-year structure on the surface."
  4. Featured rail label: "Pieces with Vacamuerta meteorite"
  5. Cross-link block: → `/collection/ritual-ring-vacamuerta` flagship author series (FORWARD-COMPAT — collection page lands later) · → `/journal/what-is-vacamuerta` (FORWARD-COMPAT — entry lands in Phase 4) · → `/materials` primer.
- **Primary CTA:** Browse pieces with Vacamuerta → `/shop?material=vacamuerta`
- **Secondary CTA:** Read the journal entry → `/journal/what-is-vacamuerta` (forward-compat link; OK to ship before journal lands)
- **Internal links:** `/collection/ritual-ring-vacamuerta`, `/journal/what-is-vacamuerta`, `/materials`, `/custom-orders` (commissions accepted).
- **Product trust note:** "Verified Atacama provenance. Chain of custody documented. Each meteorite piece ships with a Certificate of Authenticity naming the find region and approximate fragment age."
- **Care note:** "Iron-nickel meteorite is reactive to moisture and salt. Keep dry, wipe with a soft cloth, store in a dry environment. Light surface oxidation over years is expected and considered patina, not damage."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList`.
- **Forbidden words for this block:** beautiful, magical, enchanted, perfect, positive energy. The canonical phrase carries the cosmic register; do NOT add adjectives to it.
- **KEYWORDS array (Codex consumes):** `['vacamuerta','meteorite','meteorito','atacama']`

---

## 7. /material/walnut-wood (NEW)

- **Route:** `/material/walnut-wood.astro`
- **Status:** NEW
- **Eyebrow:** WALNUT & TROPICAL WOOD
- **H1:** Walnut & tropical wood — sustainably sourced, warm, grounded.
- **Subheadline:** Selected for grain, density and ritual resonance. No two pieces are alike.
- **SEO `<title>`:** Walnut & Tropical Wood — Hand-forged plugs and hangers | Wenu Mapu
- **Meta:** Plugs, tunnels and hangers in walnut and tropical wood. Sustainably sourced, hand-forged in Truckee, California.
- **Canonical lockup phrase (BRAND-DNA §4):** *Sustainably sourced, warm, and grounded.*
- **Sections:**
  1. Hero.
  2. **Origin story:** "We work primarily in American black walnut and select tropical hardwoods. All wood is sourced from certified sustainable suppliers — no rainforest extraction. Each plank is selected for grain, density and resistance to swelling."
  3. **Craft note:** "Wood pieces are turned, sanded and oiled by hand. The natural finish darkens with skin oils over time — this is part of the material's life. We do not stain or lacquer; the grain has to speak for itself."
  4. Featured rail label: "Pieces in walnut and tropical wood"
  5. Cross-link block: → `/artistry` process · → `/sizing-guide` for plug gauge · → `/materials` primer.
- **Primary CTA:** Browse pieces in wood → `/shop?material=walnut-wood`
- **Secondary CTA:** Our artistry → `/artistry`
- **Internal links:** `/artistry`, `/sizing-guide`, `/materials`.
- **Product trust note:** "Sustainably sourced. Hand-turned and oiled in Truckee. Each piece is one-of-a-kind by grain."
- **Care note:** "Wood does not love water. Avoid swimming, prolonged showers and humid storage. Re-oil every 6-12 months with a drop of jojoba or beeswax-based wood oil — full protocol in the care guide."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList`.
- **Forbidden words for this block:** beautiful, magical, enchanted, perfect, positive energy.
- **KEYWORDS array (Codex consumes):** `['wood','madera','walnut','nogal','wooden','tropical']`

---

## 8. /material/brass-bronze (NEW)

- **Route:** `/material/brass-bronze.astro`
- **Status:** NEW
- **Eyebrow:** BRASS & BRONZE
- **H1:** Brass & bronze — bold ancestral metals.
- **Subheadline:** Worked for weight, patina and presence. Used in hangers, ear weights and ritual objects.
- **SEO `<title>`:** Brass & Bronze — Hand-forged hangers and ritual objects | Wenu Mapu
- **Meta:** Hand-forged hangers, ear weights and ritual objects in brass and bronze. Patinas with use. Made in Truckee, California.
- **Canonical lockup phrase (BRAND-DNA §4):** *Bold ancestral metals with deep tribal roots.*
- **Sections:**
  1. Hero.
  2. **Origin story:** "Brass and bronze are the oldest jewelry metals on the human record — worked since the bronze age, named in ritual contexts across continents. We use them for ear weights, hangers and ceremonial objects where weight and patina are the point."
  3. **Craft note:** "Cast or hammered, then hand-finished. We do not seal brass or bronze — patina is invited, not prevented. Each piece becomes a record of its wearer."
  4. Featured rail label: "Pieces in brass and bronze"
  5. Cross-link block: → `/artistry` process · → `/hangers` placement landing · → `/materials` primer.
- **Primary CTA:** Browse pieces in brass & bronze → `/shop?material=brass-bronze`
- **Secondary CTA:** Our artistry → `/artistry`
- **Internal links:** `/artistry`, `/hangers`, `/ritual-objects`, `/materials`.
- **Product trust note:** "Solid brass or bronze — no plating. Hand-finished in Truckee. Patina expected with wear and considered part of the piece."
- **Care note:** "Brass and bronze develop a patina with skin contact — this is intentional. To slow patina: wipe dry after wear, store in a dry pouch. To restore brightness: see the care guide. People with copper sensitivity should consult a doctor before wearing brass on broken skin."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList`.
- **Forbidden words for this block:** beautiful, magical, enchanted, perfect, positive energy.
- **KEYWORDS array (Codex consumes):** `['brass','bronze','bronce','laton']`

---

## 9. /material/stone (FORWARD-COMPAT — defer)

- **Route:** `/material/stone.astro`
- **Status:** FORWARD-COMPAT — DEFER (per `market-reference-study-wenu-mapu.md` §16, stone is not in the P1 priority list; build only when stone catalog has ≥3 pieces and provenance is documented).
- **Why defer:** stone in our catalog today is small-volume and lacks a provenance story strong enough to justify a dedicated landing. Premature build would dilute the materials matrix.
- **When to build:** owner approval + at least 3 stone-set pieces in WC + verified source documentation (cooperative or supplier name) for at least one stone family (e.g., Patagonian agate, Pacific obsidian, Andean lapis).
- **Placeholder:** none for now. The /material hub does NOT list stone. The /materials brand-wide primer can mention stone as a future material.

---

## 10. Cross-link matrix (paste-ready for Codex)

Each material page must link OUT to:

| Material | Primary CTA target | Secondary CTA target | Cross-links |
|---|---|---|---|
| sterling-silver | `/shop?material=sterling-silver` | `/care-guide` | `/materials`, `/custom-orders`, `/journal/four-cardinal-forces` (fc) |
| 14k-gold | `/custom-orders` | `/shop?material=14k-gold` | `/materials`, `/care-guide` |
| titanium | `/piercing` | `/care-guide` | `/sizing-guide`, `/materials` |
| vacamuerta | `/shop?material=vacamuerta` | `/journal/what-is-vacamuerta` (fc) | `/collection/ritual-ring-vacamuerta` (fc), `/materials`, `/custom-orders` |
| walnut-wood | `/shop?material=walnut-wood` | `/artistry` | `/sizing-guide`, `/materials` |
| brass-bronze | `/shop?material=brass-bronze` | `/artistry` | `/hangers`, `/ritual-objects`, `/materials` |

(`fc` = forward-compat link; the target page does not exist yet but the link is intentional and will resolve when that page lands.)

---

## 11. i18n key shape (paste-ready for `src/i18n/en.json`)

Append to `en.json` under the existing `landing` key. Do NOT rewrite existing keys. Each material gets a block of the same shape:

```json
"landing": {
  "material_sterling_silver": {
    "eyebrow": "STERLING SILVER 950",
    "title": "Sterling Silver 950 — pure, durable, alive with light.",
    "intro": "Pure, durable, and alive with light.",
    "p1": "Sterling Silver 950 is our standard silver alloy — 95% pure silver, 5% copper. It carries more weight, more brightness, and more longevity than the more common 925. Used by Mapuche silversmiths for centuries in ceremonial pieces. We pour, hammer, and finish it by hand in our Truckee studio.",
    "p2": "Every piece is hand-finished — the surface tells you who made it. Small variations between units are part of the material's nature. Polished or oxidized finish per piece.",
    "cta_primary": "Browse pieces in sterling silver",
    "cta_secondary": "Aftercare guide",
    "shop_target": "/shop?material=sterling-silver",
    "secondary_target": "/care-guide"
  },
  "material_14k_gold": { ... },
  "material_titanium": { ... },
  "material_vacamuerta": { ... },
  "material_walnut_wood": { ... },
  "material_brass_bronze": { ... },
  "material_hub": {
    "eyebrow": "MATERIALS",
    "title": "Six materials, six origins.",
    "intro": "We work in six material families. Each carries its own provenance and its own behavior on the body.",
    "lede": "We do not work in materials we cannot vouch for. Every piece names its material, names its provenance, and names what to expect of it on the body."
  }
}
```

Codex must populate the 6 material blocks above using the per-material copy in §3-§8. Do not invent new keys; do not rewrite existing keys.

---

## 12. Hard rules for Codex (echoed in Task 2 prompt)

- No commit, no push, no deploy, no DNS, no Cloudflare, no WC writes, no Aftercare touch.
- No `.env*` reads or writes.
- No new components beyond `src/pages/material/*.astro`.
- No new CSS classes — reuse `global.css` patterns (`.archive-card`, `.product-card`, `.btn`, `.btn--solid`, `.btn--ghost`, `.section--mega`, `.eyebrow`, `.constellation-divider`).
- No deviation from the canonical lockup phrases above.
- No homepage, nav, or `Base.astro` change.
- No new image generation (placeholder images already exist in `public/img/categories/`).
- Build target: `nvm use && npm run build` → 88 + 6 + 1 = 95 pages, 64 products, postbuild OK.

---

## 13. Owner approval checklist (before Codex Task 2 runs)

- [ ] Owner has read this file end-to-end.
- [ ] Owner approves the canonical lockup phrases (BRAND-DNA §4 verbatim).
- [ ] Owner approves the per-material copy in §3-§8.
- [ ] Owner confirms `/material/stone` stays deferred (or asks to add).
- [ ] Owner confirms placeholder category images in `public/img/categories/*.webp` are acceptable for hero (per-material macro shoot is not yet done).
- [ ] Owner has read `codex-task-2-materials-pages-final-prompt.md` and is ready to paste into Codex once Codex Task 1 is approved.

---

## 14. References

- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` §4 — canonical material lockup phrases (DO NOT REWRITE)
- `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md` — voice rules
- `~/wenu-frontend/full-site-completion-plan.md` — site map + per-material spec
- `~/wenu-frontend/market-reference-study-wenu-mapu.md` §16 — material priority list
- `~/wenu-frontend/wenu-english-copy-pack-v1.md` §6 — paste-ready hero blocks
- `~/wenu-frontend/codex-task-2-materials-pages-final-prompt.md` — implementation prompt for Codex
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` — binding blocklist
