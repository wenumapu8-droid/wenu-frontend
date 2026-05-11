# Collection Pages — Copy and SEO

Date: 2026-05-10 (CEO night, parallel prep)
Scope: paste-ready copy + SEO blocks for the Astro Collection hub and 3 founding collection landings. Source-of-truth for a future **Codex Task 5** (collection landings, P2 priority per `market-reference-study-wenu-mapu.md` §16).

Sequencing: ships AFTER Codex Task 2 (Materials) so that material cross-links resolve. May ship before or after Codex Task 3 (Subscription) and Task 4 (Journal) — no hard dependency.

The 4th collection (`/collection/chaway`) is **gated on cultural-respect review with the founder** and is drafted here as forward-compat — DO NOT ship without explicit founder approval.

---

## 0. Inputs and rules

- **Voice rules** — `voz-de-marca-real-2026-05-03.md`.
- **Forbidden lexicon** — same as Tasks C and Journal: no beautiful / magical / enchanted / perfect / positive energy / "Mapuche Root" / "Earthly" / "Earthborn"; no Petrolia / Rizoma / Truth Tattoo / Showroom at home / vitrine / walk-ins / studio location.
- **Length discipline** — H1 ≤ ~50 chars, sub ≤ 1 sentence, meta ≤ 155 chars, SEO `<title>` ≤ 60 chars. Intro paragraphs 2-3 sentences each.
- **Material lockup phrases** — referenced verbatim from `materials-pages-copy-and-seo.md` and BRAND-DNA §4.
- **Naming discipline** — collection names carry the mystique (Kin pattern). PDP body stays grounded in material + provenance (BRAND-DNA §15 forbids festival / boho cliché names).

---

## 1. /collection — Collection axis hub (NEW)

- **Route:** `/collection/index.astro`
- **Status:** NEW
- **Eyebrow:** COLLECTIONS
- **H1:** Three collections, three intentions.
- **Subheadline:** Author series, mystic studies, and ritual rings. Each collection groups pieces around a single thread.
- **SEO `<title>`:** Collections — Ritual rings, mystic series, author jewelry | Wenu Mapu
- **Meta:** The three founding Wenu Mapu collections. Ritual Ring Vacamuerta, Mystic Series, Author Jewelry. Each piece named, each thread followed.
- **Sections:**
  1. Hero (eyebrow + H1 + sub).
  2. Lede: "A collection is a way of reading. We group pieces by the thread that runs between them — material, cosmology, technique, or moment — so that each piece can be seen against its kin."
  3. 3 cards grid (one per collection). Reuse `.archive-card` from `global.css`.
- **Cards:**
  - **Card 1 — Ritual Ring Vacamuerta**
    - Image: `/img/editorial/vacamuerta-raw.webp` (placeholder)
    - Title: Ritual Ring Vacamuerta
    - Sub: Author series built around Atacama meteorite. One-of-a-kind, numbered.
    - Link: `/collection/ritual-ring-vacamuerta`
  - **Card 2 — Mystic Series**
    - Image: `/img/categories/amulets.webp`
    - Title: Mystic Series
    - Sub: Themed pieces — cardinal forces, volcanic line, sky world.
    - Link: `/collection/mystic-series`
  - **Card 3 — Author Jewelry**
    - Image: `/img/categories/silver.webp`
    - Title: Author Jewelry
    - Sub: One-of-a-kind pieces signed by the maker.
    - Link: `/collection/author-jewelry`
- **JSON-LD:** `CollectionPage` + `BreadcrumbList` (Home → Collections).
- **Forbidden words:** standard + do NOT mention `/collection/chaway` on the hub until that page is approved.

---

## 2. /collection/ritual-ring-vacamuerta (NEW, flagship)

- **Route:** `/collection/ritual-ring-vacamuerta.astro`
- **Status:** NEW
- **Eyebrow:** RITUAL RING VACAMUERTA · AUTHOR SERIES
- **H1:** Ritual Ring Vacamuerta — the meteorite series.
- **Subheadline:** Author rings built around Atacama meteorite. Each piece numbered, each piece different.
- **SEO `<title>`:** Ritual Ring Vacamuerta — Atacama meteorite author series | Wenu Mapu
- **Meta:** Hand-forged ritual rings set with Atacama meteorite. Each piece numbered and one-of-a-kind. Author series by Wenu Mapu, Truckee, California.
- **Sections:**
  1. Hero (eyebrow + H1 + sub).
  2. **Series story** (3-4 sentences): "Ritual Ring Vacamuerta is the author series the brand was named in. Each ring is built around a single tablet of iron-nickel meteorite recovered from Chile's Atacama Desert. We do not repeat. Every piece is numbered, certified, and one-of-a-kind."
  3. **What ties them together** (3-4 sentences): "Every ring in the series is hand-forged in sterling silver 950 or 14k gold. Every meteorite tablet is etched to reveal the Widmanstätten pattern — the crystalline lattice that formed inside a parent asteroid as it cooled across millions of years. Every ring ships with a Certificate of Authenticity naming the find region of its meteorite."
  4. **What varies** (2-3 sentences): "The setting — wide-band signet, narrow stack, sculpted shoulder, hammered face — varies by piece. The size of the meteorite tablet varies. The orientation of the lattice varies. No two pieces in this series read the same on the hand."
  5. Featured rail label: "Available rings in this series"
  6. Cross-link block: → `/material/vacamuerta` material deep-dive · → `/journal/what-is-vacamuerta` material story · → `/journal/forging-the-meteorite` process · → `/custom-orders` commission a one-off variant.
- **Primary CTA:** Browse the series → `/shop?collection=ritual-ring-vacamuerta` (or filter on the WC category slug containing "ritual-ring-vacamuerta")
- **Secondary CTA:** Read about Vacamuerta meteorite → `/material/vacamuerta`
- **Internal links:** `/material/vacamuerta`, `/journal/what-is-vacamuerta`, `/journal/forging-the-meteorite`, `/custom-orders`, `/material/sterling-silver`, `/material/14k-gold`.
- **Product trust note:** "Each ring is numbered. Each piece ships with a Certificate of Authenticity naming the find region and approximate fragment age. Verified Atacama provenance."
- **Care note:** "Iron-nickel meteorite reacts to moisture and chloride salts. Keep dry. Light surface patina over years is expected; treated as part of the piece, not damage. Full care in our care guide."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList` (Home → Collections → Ritual Ring Vacamuerta).
- **Forbidden words:** standard. Do NOT add "mystical / sacred / cosmic" adjectives to the description — the material lockup phrase ("4.5 billion years of history") does the cosmological work; piling on dilutes it.
- **KEYWORDS array (Codex consumes):** `['ritual-ring-vacamuerta','ritual-ring','vacamuerta','meteorite']`

---

## 3. /collection/mystic-series (NEW)

- **Route:** `/collection/mystic-series.astro`
- **Status:** NEW
- **Eyebrow:** MYSTIC SERIES
- **H1:** Mystic Series — pieces that name a force.
- **Subheadline:** A themed series of amulets and ritual objects, each piece naming a cosmological force. Limited editions of three or fewer.
- **SEO `<title>`:** Mystic Series — Themed amulets and ritual objects | Wenu Mapu
- **Meta:** Hand-forged amulets and ritual objects naming the cardinal forces, the volcanic line, the sky world. Editions of three or fewer.
- **Sections:**
  1. Hero.
  2. **Series story** (3-4 sentences): "Mystic Series is our framework for the pieces that name a specific cosmological force. The four cardinal directions. The volcanic line. The sky world. We do not invent the cosmology; we name what was already there and forge it into metal that the body can carry."
  3. **Sub-themes** (a 4-card mini-grid OR a list, Codex picks the cleaner render):
     - **The Four Cardinal Forces** — Puel (East), Willi (South), Lafken (West), Pikun (North). Amulets carrying the cardinal cross.
     - **The Volcanic Line** — pieces naming the spine that runs from the Andes to the Cascades. Sculptural hangers and ritual objects.
     - **The Sky World** — pieces named after Wenumapu itself, the Land of the Sky. Cosmological pendants and meteorite-set amulets.
     - **The Body Threshold** — pieces marking transition zones (septum, lobe, lip). Made for moments of crossing.
  4. **What ties them together** (2-3 sentences): "Each piece in Mystic Series is forged in sterling silver 950 — sometimes with 14k gold accent, sometimes with Atacama meteorite, sometimes plain. Editions of three or fewer. Once an edition closes, the next iteration is a different material, a different scale, a different relationship to the same force."
  5. Featured rail label: "Available pieces in Mystic Series"
  6. Cross-link block: → `/amulets` placement landing · → `/material/sterling-silver` · → `/journal/four-cardinal-forces` · → `/about`.
- **Primary CTA:** Browse the Mystic Series → `/shop?collection=mystic-series`
- **Secondary CTA:** Read about the four cardinal forces → `/journal/four-cardinal-forces`
- **Internal links:** `/amulets`, `/material/sterling-silver`, `/journal/four-cardinal-forces`, `/about`, `/material/vacamuerta`.
- **Product trust note:** "Editions of three or fewer per piece. Hand-forged in Truckee, California. Each piece named for the force it carries."
- **Care note:** "Sterling silver patinas with use. Wipe with a soft cloth; for deeper polish, see the care guide."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList`.
- **Forbidden words:** standard. Note: the *names* of sub-themes carry mystique (Kin pattern); body copy stays grounded.
- **KEYWORDS array:** `['mystic-series','mystic','cosmic','cardinal','volcanic','sky-world']`

---

## 4. /collection/author-jewelry (NEW)

- **Route:** `/collection/author-jewelry.astro`
- **Status:** NEW
- **Eyebrow:** AUTHOR JEWELRY
- **H1:** Author Jewelry — one of a kind, signed.
- **Subheadline:** Pieces where the maker's hand is the point. One-offs and editions of three or fewer.
- **SEO `<title>`:** Author Jewelry — One-of-a-kind pieces | Wenu Mapu
- **Meta:** Hand-forged one-of-a-kind body jewelry signed by the maker. Sterling silver, 14k gold, Atacama meteorite. Editions of three or fewer.
- **Sections:**
  1. Hero.
  2. **What "author" means** (3-4 sentences): "An author piece is a piece where the maker's hand is the point of the work. It does not repeat. It is not part of a production run. It carries a signature — sometimes literal, sometimes a numbered punch — that names the person who forged it and the year it left the workshop."
  3. **Where they fit** (2-3 sentences): "Author pieces sit at the highest commercial tier of the catalogue. Most go into private collections; some pass through Wenu Mapu twice when a customer wants to upgrade an earlier piece. They are not the everyday tier. They are the tier you reach for at the moment that justifies it."
  4. **What you can expect** (3-4 sentences): "Each author piece is photographed under our daylight studio light. Each ships with a Certificate of Authenticity naming the maker, the year, and the edition number (or 1/1 for one-offs). Most author pieces carry a lifetime workshop repair on manufacturing defects. Where the piece sets a meteorite, the find region of the meteorite is named on the certificate."
  5. Featured rail label: "Currently available author pieces"
  6. Cross-link block: → `/custom-orders` (commission a custom author piece) · → `/material/14k-gold` · → `/about`.
- **Primary CTA:** Browse author pieces → `/shop?collection=author-jewelry`
- **Secondary CTA:** Commission an author piece → `/custom-orders`
- **Internal links:** `/custom-orders`, `/material/14k-gold`, `/material/vacamuerta`, `/about`, `/artistry`.
- **Product trust note:** "Signed and dated. Certificate of Authenticity. Lifetime workshop repair on manufacturing defects."
- **Care note:** "Care varies by material — refer to the material lockup on each piece's PDP and to our care guide."
- **JSON-LD:** `CollectionPage` + `BreadcrumbList`.
- **Forbidden words:** standard.
- **KEYWORDS array:** `['author-jewelry','author','signed','one-of-a-kind','numbered']`

---

## 5. /collection/chaway (DEFERRED — cultural respect review required)

- **Route:** `/collection/chaway.astro`
- **Status:** FORWARD-COMPAT — DEFERRED. Do NOT ship this page until founder has completed cultural-respect review per `full-site-completion-plan.md` /collection/chaway entry.
- **Why deferred:** "Chaway" references Mapuche-cultural material context. Building a Mapuche-inspired collection landing requires founder consultation with the cultural advisory the founder works with, AND explicit naming of how Wenu Mapu (a non-Mapuche brand based in California) honors the cosmology without appropriating it.
- **What needs to happen before this page ships:**
  1. Founder consultation with cultural advisor (Mapuche elder, language teacher, or community contact).
  2. Written framing of the brand's relationship to Mapuche cultural material (similar to the disclaimer in Journal Entry 2 "we are not Mapuche, and we work with care to honor the cosmology without claiming it").
  3. Decision on whether the collection name "Chaway" stays as is, gets replaced, or is qualified with "inspired by" / "in conversation with" language.
  4. Decision on whether the pieces themselves go through a cultural review (designs, materials, naming).
- **Placeholder for this file:** do not write the copy in this document. When the founder is ready, a separate prep cycle will produce the page text under the founder's direct authorship.
- **Until shipped:** the `/collection` hub does NOT mention `/collection/chaway`. Do not link to a 404.

---

## 6. Cross-link matrix (paste-ready for Codex)

| Collection | Primary CTA target | Secondary CTA target | Cross-links |
|---|---|---|---|
| ritual-ring-vacamuerta | `/shop?collection=ritual-ring-vacamuerta` | `/material/vacamuerta` | `/journal/what-is-vacamuerta` (fc), `/journal/forging-the-meteorite` (fc), `/custom-orders`, `/material/sterling-silver`, `/material/14k-gold` |
| mystic-series | `/shop?collection=mystic-series` | `/journal/four-cardinal-forces` (fc) | `/amulets`, `/material/sterling-silver`, `/about`, `/material/vacamuerta` |
| author-jewelry | `/shop?collection=author-jewelry` | `/custom-orders` | `/material/14k-gold`, `/material/vacamuerta`, `/about`, `/artistry` |

(`fc` = forward-compat link to a Journal entry that lands with Codex Task 4. OK to link before that page ships; do not 404-fail.)

---

## 7. i18n key shape (paste-ready for `src/i18n/en.json`)

Append to `en.json` under the existing `landing` key. Each collection gets a block of the same shape:

```json
"landing": {
  "collection_ritual_ring_vacamuerta": {
    "eyebrow": "RITUAL RING VACAMUERTA · AUTHOR SERIES",
    "title": "Ritual Ring Vacamuerta — the meteorite series.",
    "intro": "Author rings built around Atacama meteorite. Each piece numbered, each piece different.",
    "p1": "Ritual Ring Vacamuerta is the author series the brand was named in. Each ring is built around a single tablet of iron-nickel meteorite recovered from Chile's Atacama Desert. We do not repeat. Every piece is numbered, certified, and one-of-a-kind.",
    "p2": "Every ring in the series is hand-forged in sterling silver 950 or 14k gold. Every meteorite tablet is etched to reveal the Widmanstätten pattern. Every ring ships with a Certificate of Authenticity.",
    "p3": "The setting — wide-band signet, narrow stack, sculpted shoulder, hammered face — varies by piece. No two pieces in this series read the same on the hand.",
    "cta_primary": "Browse the series",
    "cta_secondary": "Read about Vacamuerta meteorite",
    "shop_target": "/shop?collection=ritual-ring-vacamuerta",
    "secondary_target": "/material/vacamuerta"
  },
  "collection_mystic_series": { ... },
  "collection_author_jewelry": { ... },
  "collection_hub": {
    "eyebrow": "COLLECTIONS",
    "title": "Three collections, three intentions.",
    "intro": "Author series, mystic studies, and ritual rings. Each collection groups pieces around a single thread.",
    "lede": "A collection is a way of reading. We group pieces by the thread that runs between them — material, cosmology, technique, or moment — so that each piece can be seen against its kin."
  }
}
```

Codex must populate the 3 collection blocks above using the per-collection copy in §2-§4. Do not invent new keys; do not rewrite existing keys.

---

## 8. Hard rules for Codex Task 5 (echo in the prompt when written)

- No commit, no push, no deploy, no DNS, no Cloudflare, no WC writes, no Aftercare touch.
- No `.env*` reads or writes.
- No new components.
- No new CSS classes — reuse `global.css` patterns.
- No deviation from the per-collection copy above.
- No homepage, nav, or `Base.astro` change.
- No new image generation.
- **Do NOT ship `/collection/chaway`.** It is deferred pending cultural-respect review. Do not link to it from the hub.
- Build target: 95 baseline + 3 new collections + 1 new hub = 99 pages, 64 products, postbuild OK.

---

## 9. Owner approval checklist (before Codex Task 5 runs)

- [ ] Owner has read this file end-to-end.
- [ ] Owner approves the 3 collection blocks (Ritual Ring Vacamuerta, Mystic Series, Author Jewelry).
- [ ] Owner confirms `/collection/chaway` stays deferred until cultural-respect review is complete.
- [ ] Owner has decided whether WooCommerce category slugs already exist for these 3 collections OR whether the matching is done via product `collection` attribute / tag.
  - If WC categories don't have collection slugs, the KEYWORDS arrays may match 0 products initially — that's OK; the landings render with empty featured rails until the catalog is tagged.
- [ ] Owner approves placeholder hero images (each collection uses an existing `/public/img/*.webp`).

---

## 10. References

- `~/wenu-frontend/full-site-completion-plan.md` (Collection section)
- `~/wenu-frontend/market-reference-study-wenu-mapu.md` §16 (collection priority)
- `~/wenu-frontend/materials-pages-copy-and-seo.md` (companion — material lockup phrases)
- `~/wenu-frontend/wenu-journal-entries-draft.md` (cross-linked entries)
- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` §15 (no festival/boho cliché names)
- `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md` (voice rules)
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md`
