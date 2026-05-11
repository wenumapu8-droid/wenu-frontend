# Codex Task 5 — Collection landing pages (final prompt)

Date prepared: 2026-05-10 (CEO night, parallel prep)
Scope: paste-ready prompt for Codex/OpenCode to ship the `/collection/` hub + 3 founding collection landings. Mirrors the pattern from Codex Task 2 (Materials). Runs AFTER Task 2 has shipped + been approved.

`/collection/chaway` is DEFERRED — do NOT ship it. Cultural-respect review pending.

---

## Pre-flight checklist (Codex must confirm BEFORE first tool call)

- [ ] Codex Task 2 (Materials) reported `RESULT: success` AND human approved the commit.
- [ ] `git status` clean on `redesign-v2`.
- [ ] `nvm use && npm run build` is green RIGHT NOW (95+ pages baseline after Task 2).
- [ ] Owner has read `~/wenu-frontend/collection-pages-copy-and-seo.md` end-to-end and approved the 3 collection blocks.
- [ ] You have read `AGENT_CONTROL_CENTER.md` + `DO_NOT_TOUCH.md` + `collection-pages-copy-and-seo.md`.
- [ ] You have read the template you will mirror: `src/pages/material/sterling-silver.astro` (shipped in Task 2) OR `src/pages/piercing.astro` (original template).

If any box is unchecked, STOP and report blocked.

---

## Files allowed (write list)

```
NEW:
  src/pages/collection/index.astro                        (hub)
  src/pages/collection/ritual-ring-vacamuerta.astro
  src/pages/collection/mystic-series.astro
  src/pages/collection/author-jewelry.astro

EDIT (APPEND ONLY — do not rewrite existing keys):
  src/i18n/en.json
```

**Do NOT** ship `src/pages/collection/chaway.astro`. Deferred per `collection-pages-copy-and-seo.md` §5.

---

## Forbidden actions

- Any other file. No nav change. No homepage change. No `Base.astro` change. No new components. No new CSS.
- `git commit`, `git push`, deploy, DNS, Cloudflare, WC writes.
- `.env*` reads/writes.
- New image generation.
- `/collection/chaway` — DEFERRED. Do NOT create the file. Do NOT link to it from `/collection/index.astro`.

---

## Pattern (mirror `src/pages/material/<key>.astro` from Task 2)

For each collection page:

```astro
---
import Base from '../../components/Base.astro';
import ProductCard from '../../components/ProductCard.astro';
import PatternBand from '../../components/PatternBand.astro';
import { getProducts } from '../../lib/woo';
import en from '../../i18n/en.json';

const L = en.landing.collection_<slug>;
const KEYWORDS = [...]; // see §"KEYWORDS arrays" below

const all = await getProducts(50);
const matched = all.filter(p =>
  p.images?.[0]?.src &&
  p.categories.some(c => KEYWORDS.some(k => c.slug.toLowerCase().includes(k)))
);
const featured = matched.slice(0, 6);

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": L.title,
    "description": L.intro,
    "url": `https://wenumapuonline.com/collection/<slug>/`
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wenumapuonline.com/" },
      { "@type": "ListItem", "position": 2, "name": "Collections", "item": "https://wenumapuonline.com/collection/" },
      { "@type": "ListItem", "position": 3, "name": "<Collection display name>" }
    ]
  }
];
---
<!-- Body: same shape as material/<key>.astro from Task 2 -->
```

Where the Mystic Series page has an additional **sub-themes** block (4 items), render it as a small `.archive-card`-style grid or a simple `<ul>` — Codex picks the cleaner render based on the existing pattern.

---

## KEYWORDS arrays (paste-ready)

```js
ritual-ring-vacamuerta: ['ritual-ring-vacamuerta','ritual-ring','vacamuerta','meteorite']
mystic-series:          ['mystic-series','mystic','cosmic','cardinal','volcanic','sky-world']
author-jewelry:         ['author-jewelry','author','signed','one-of-a-kind','numbered']
```

Note: WC may not yet have collection slugs matching these. If a KEYWORDS array matches 0 products, the page renders with an empty featured rail. That is intentional and acceptable per `collection-pages-copy-and-seo.md` §9 — the landings ship now, the catalog gets tagged later.

---

## i18n key shape (append to `src/i18n/en.json`)

Use the per-collection copy from `collection-pages-copy-and-seo.md` §2-§4 verbatim. Shape per block:

```json
"landing": {
  "collection_<key>": {
    "eyebrow": "...",
    "title": "...",
    "intro": "...",
    "p1": "...",
    "p2": "...",
    "p3": "...",
    "cta_primary": "...",
    "cta_secondary": "...",
    "shop_target": "/shop?collection=<key>",
    "secondary_target": "/<route>"
  },
  "collection_hub": {
    "eyebrow": "COLLECTIONS",
    "title": "Three collections, three intentions.",
    "intro": "...",
    "lede": "..."
  }
}
```

Do NOT rewrite existing keys.

---

## Hub page (`/collection/index.astro`)

Render 3 cards using `.archive-card`. Each card:

- Image: from `collection-pages-copy-and-seo.md` §1 (placeholders).
- Title: collection name.
- Sub: 1-sentence summary per §1.
- Link: `/collection/<key>/`.

**Do NOT** render a 4th card for `/collection/chaway`.

---

## Build + acceptance

```bash
nvm use && npm run build
```

Expected: 95 baseline + 3 collection deep-dives + 1 hub = **99 pages**. 64 products. postbuild OK.

```bash
for slug in ritual-ring-vacamuerta mystic-series author-jewelry; do
  test -f "dist/collection/${slug}/index.html" && echo "OK collection/${slug}" || echo "MISS collection/${slug}"
done
test -f "dist/collection/index.html" && echo "OK collection/" || echo "MISS collection/"

# Chaway must NOT exist
test ! -f "dist/collection/chaway/index.html" && echo "OK chaway absent (correct)" || echo "FAIL chaway present (must NOT exist)"

# JSON-LD + forbidden-words sweep
grep -c '"@type": "CollectionPage"' dist/collection/ritual-ring-vacamuerta/index.html  # >= 1
grep -rEHn "Petrolia|Rizoma|Truth Tattoo|Showroom at home|\+145|contact@wenumapuonline\.com|beautiful|magical|enchanted" src/pages/collection/
# expected: 0 hits
```

---

## Report (per `AGENT_HANDOFF_PROTOCOL.md`, ≤ 200 words)

```
RESULT: <success | blocked | partial>
WHAT CHANGED:
  - src/pages/collection/index.astro (NEW)
  - src/pages/collection/{3 slugs}.astro (NEW)
  - src/i18n/en.json (APPEND 4 landing.collection_* blocks)
WHAT WAS VERIFIED:
  - npm run build → 99 pages, 64 products, postbuild OK
  - 4 dist/collection/* artifacts present
  - dist/collection/chaway/ absent (deferred — correct)
  - JSON-LD CollectionPage + BreadcrumbList on each
  - Forbidden-words scan: 0
WHAT'S NEXT: Codex Task 4 (Journal) or any P3/P4 task from the queue
```

---

## Hard rules echo

1. Read control center + DO_NOT_TOUCH + collection-pages-copy-and-seo first.
2. Per-edit + per-commit human approval.
3. **No commit, no push, no deploy.**
4. **No DNS, no Cloudflare, no Tunnel.**
5. **No WC writes.**
6. No `.env*` reads-into-output, no secret printing.
7. **No Aftercare touch.**
8. `npm run build` after every batch. Postbuild assertion must hold.
9. Report ≤ 200 words.
10. **No `/collection/chaway`.** Deferred. Do not improvise.

---

## Commit message

```
feat(collection): add 3 collection landings + hub (ritual-ring-vacamuerta, mystic-series, author-jewelry)
```

ONE commit. Do not amend earlier commits.

---

## References

- `~/wenu-frontend/collection-pages-copy-and-seo.md` (copy source)
- `~/wenu-frontend/codex-task-2-materials-pages-final-prompt.md` (same pattern)
- `~/wenu-frontend/full-site-completion-plan.md` (collection routes)
- `~/wenu-frontend/agent-control/*` (control center)
