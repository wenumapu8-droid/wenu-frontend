# Codex Task 2 — Materials pages (final prompt)

Date prepared: 2026-05-10 (CEO night, while Codex Task 1 is in flight)
Scope: paste-ready prompt for Codex/OpenCode to ship the 6 material landing pages + the `/material/` hub on the Wenu Mapu Astro repo. Run AFTER Codex Task 1 (Footer + Contact + Newsletter) has reported `RESULT: success` and the human has approved the commit.

This file supersedes `codex-next-tasks.md` Task 2 for execution. The original prompt remains valid as a reference; this version is tightened with pre-flight, copy source-of-truth, acceptance gate, and hard rules echo.

---

## Pre-flight checklist (Codex must confirm BEFORE first tool call)

- [ ] Codex Task 1 reported `RESULT: success` AND the human approved the commit.
- [ ] `git status` clean on `redesign-v2` (no uncommitted changes).
- [ ] `nvm use && npm run build` is green RIGHT NOW (88 pages baseline before this task).
- [ ] You have read `~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md` and `DO_NOT_TOUCH.md`.
- [ ] You have read the copy source-of-truth: `~/wenu-frontend/materials-pages-copy-and-seo.md`.
- [ ] You have read the template you will mirror: `src/pages/piercing.astro`.

If any box is unchecked, STOP and report blocked.

---

## Files to read first (read-only)

| File | Why |
|---|---|
| `~/wenu-frontend/materials-pages-copy-and-seo.md` | Canonical copy + SEO + KEYWORDS arrays + i18n shape |
| `src/pages/piercing.astro` | Template to mirror 1:1 |
| `src/i18n/en.json` | Existing `landing.*` shape — append, do NOT rewrite |
| `src/lib/woo.ts` | `getProducts` pagination |
| `src/components/Base.astro` | Layout + SEO metadata |
| `src/components/ProductCard.astro` | Card component (reuse — no new component) |
| `src/styles/global.css` | Existing classes to reuse — no new CSS |

---

## Files allowed (write list)

```
NEW:
  src/pages/material/index.astro
  src/pages/material/sterling-silver.astro
  src/pages/material/14k-gold.astro
  src/pages/material/titanium.astro
  src/pages/material/vacamuerta.astro
  src/pages/material/walnut-wood.astro
  src/pages/material/brass-bronze.astro

EDIT (APPEND ONLY — do not rewrite existing keys):
  src/i18n/en.json
```

That is the entire allowed write list. Any other file is forbidden.

---

## Forbidden actions

- Any other file. No nav change. No homepage change. No `Base.astro` change. No new components. No new CSS classes.
- No `git commit`, no `git push`, no `git remote add`, no merge, no rebase.
- No DNS, no Cloudflare, no Cloudflare Tunnel.
- No WooCommerce write (no POST/PUT/DELETE to WC REST). Only `getProducts` reads at build time.
- No `.env*` reads, edits, deletes.
- No secret printing. JWT redaction via `sed -E 's/(eyJ[A-Za-z0-9_-]+)/<REDACTED>/g'` if any token surfaces.
- No Aftercare modifications (`/care-guide`, `public/aftercare/*`, `dist/aftercare/*` are OFF-LIMITS).
- No deviation from the canonical material lockup phrases. Copy is consumed verbatim from `materials-pages-copy-and-seo.md`.
- No image generation. Reuse existing `public/img/categories/*.webp`.
- No `/material/stone.astro`. Stone is deferred per `materials-pages-copy-and-seo.md` §9.

---

## Routes to create (7 total)

1. `/material/index.astro` (hub)
2. `/material/sterling-silver.astro`
3. `/material/14k-gold.astro`
4. `/material/titanium.astro`
5. `/material/vacamuerta.astro`
6. `/material/walnut-wood.astro`
7. `/material/brass-bronze.astro`

Each renders as a static page at build time. No SSR, no dynamic routes, no API endpoints.

---

## Components to reuse (no new components)

From `src/components/`:

- `Base.astro` — layout (props: `title`, `description`, `ogImage`, `jsonLd`, `preloadImage`)
- `ProductCard.astro` — for the featured rail (mode `archive` or default; mirror what `/piercing` uses)
- `PatternBand.astro` — for section dividers (variant `hairline` or `band`)

From `src/styles/global.css`:

- `.section--mega` — section wrapper
- `.archive-card`, `.product-card` — card styles
- `.btn`, `.btn--solid`, `.btn--ghost` — buttons
- `.eyebrow` — eyebrow caps
- `.constellation-divider` — between subsections
- `.landing__copy`, `.landing__cta`, `.landing__rail` — landing-specific (already used by `/piercing`)

If a class you need does not exist, STOP and report — do NOT add new CSS.

---

## Pattern (mirror `src/pages/piercing.astro` 1:1)

For each material page:

```astro
---
import Base from '../../components/Base.astro';
import ProductCard from '../../components/ProductCard.astro';
import PatternBand from '../../components/PatternBand.astro';
import { getProducts } from '../../lib/woo';
import en from '../../i18n/en.json';

const L = en.landing.material_<slug>;
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
    "url": `https://wenumapuonline.com/material/<slug>/`
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://wenumapuonline.com/" },
      { "@type": "ListItem", "position": 2, "name": "Materials", "item": "https://wenumapuonline.com/material/" },
      { "@type": "ListItem", "position": 3, "name": "<Material display name>" }
    ]
  }
];
---
<Base
  title={`${L.title.split(' — ')[0]} | Wenu Mapu`}
  description={L.intro}
  ogImage="/img/categories/<slug>.webp"
  jsonLd={jsonLd}
>
  <section class="section--mega">
    <div class="container">
      <p class="eyebrow">{L.eyebrow}</p>
      <h1 class="page-title">{L.title}</h1>
      <p class="page-divider">{L.intro}</p>
      <div class="landing__copy">
        <p>{L.p1}</p>
        <p>{L.p2}</p>
      </div>
      <div class="landing__cta">
        <a class="btn btn--solid" href={L.shop_target}>{L.cta_primary}</a>
        <a class="btn btn--ghost" href={L.secondary_target}>{L.cta_secondary}</a>
      </div>
      {featured.length > 0 && (
        <div class="landing__rail">
          {featured.map(p => <ProductCard product={p} />)}
        </div>
      )}
    </div>
  </section>
  <PatternBand variant="hairline" />
</Base>
```

(Codex: this is a sketch. Mirror `/piercing.astro` exactly — same imports, same JSON-LD shape, same hero+rail layout. If `/piercing.astro` differs from the sketch above, follow `/piercing.astro` — it is the authoritative pattern.)

---

## KEYWORDS arrays (paste-ready, per material)

```js
sterling-silver: ['silver','plata','sterling','925','950']
14k-gold:        ['gold','oro','14k','14-kilatess','14kilates','golden']
titanium:        ['titanium','titanio']
vacamuerta:      ['vacamuerta','meteorite','meteorito','atacama']
walnut-wood:     ['wood','madera','walnut','nogal','wooden','tropical']
brass-bronze:    ['brass','bronze','bronce','laton']
```

---

## i18n key shape (append to `src/i18n/en.json` under existing `landing` key)

Use the per-material copy from `materials-pages-copy-and-seo.md` §3-§8 verbatim. Each block has shape:

```json
"landing": {
  "material_<key>": {
    "eyebrow": "...",
    "title": "...",
    "intro": "...",
    "p1": "...",
    "p2": "...",
    "cta_primary": "...",
    "cta_secondary": "...",
    "shop_target": "/shop?material=<key>",
    "secondary_target": "/<route>"
  },
  "material_hub": {
    "eyebrow": "MATERIALS",
    "title": "Six materials, six origins.",
    "intro": "We work in six material families. Each carries its own provenance and its own behavior on the body.",
    "lede": "We do not work in materials we cannot vouch for. Every piece names its material, names its provenance, and names what to expect of it on the body."
  }
}
```

Do NOT rewrite existing `landing.piercing`, `landing.hangers`, etc. APPEND only.

---

## Hub page (`/material/index.astro`)

Use `landing.material_hub` for hero. Below the hero, render 6 cards (one per material) using `.archive-card` from `global.css`. Each card:

- Image: `/img/categories/<material-key>.webp`
- Title: material name
- Sub: canonical lockup phrase (one sentence)
- Link: `/material/<key>/`

Do NOT invent a new card class. Use `.archive-card` (already used elsewhere).

JSON-LD: `CollectionPage` + `BreadcrumbList` (Home → Materials).

---

## Build command + acceptance criteria

After all 7 files are written, run:

```bash
nvm use && npm run build
```

Expected output:

- **Page count:** 95 pages (88 baseline + 6 deep-dives + 1 hub).
- **Products page count:** 64 (unchanged).
- **postbuild assertion:** OK (≥ 20 product directories in `dist/p/`).
- **No TS errors, no Astro warnings.**

Verify the new artifacts:

```bash
for slug in sterling-silver 14k-gold titanium vacamuerta walnut-wood brass-bronze; do
  test -f "dist/material/${slug}/index.html" && echo "OK material/${slug}" || echo "MISS material/${slug}"
done
test -f "dist/material/index.html" && echo "OK material/" || echo "MISS material/"
```

All 7 should print `OK`.

Verify SEO + JSON-LD on one page (vacamuerta — flagship):

```bash
grep -c '"@type": "CollectionPage"' dist/material/vacamuerta/index.html  # >= 1
grep -c '"@type": "BreadcrumbList"' dist/material/vacamuerta/index.html  # >= 1
grep -c '<title>' dist/material/vacamuerta/index.html                    # 1
grep -c '<h1' dist/material/vacamuerta/index.html                        # 1
```

Verify forbidden words are absent:

```bash
grep -rEHn "Petrolia|Rizoma|Truth Tattoo|Troll Studio|Lucky7|Showroom at home|vitrine|walk-?in|\+145|contact@wenumapuonline\.com" \
  src/pages/material/
# expected: 0 hits

grep -rEHn "beautiful|magical|enchanted|positive energy|Mapuche Root|Earthly|Earthborn" \
  src/pages/material/
# expected: 0 hits
```

Verify canonical lockup phrases present (one per material):

```bash
grep -c "Pure, durable, and alive with light"          src/i18n/en.json  # >= 1
grep -c "Heirloom-grade"                                src/i18n/en.json  # >= 1
grep -c "Hypoallergenic, durable, lightweight"         src/i18n/en.json  # >= 1
grep -c "4.5 billion years"                             src/i18n/en.json  # >= 1
grep -c "Sustainably sourced, warm, and grounded"      src/i18n/en.json  # >= 1
grep -c "Bold ancestral metals with deep tribal roots" src/i18n/en.json  # >= 1
```

If any check fails, STOP and report. Do NOT proceed to commit.

---

## Report

Per `~/wenu-frontend/agent-control/AGENT_HANDOFF_PROTOCOL.md`. Inline in chat, ≤ 200 words. Format:

```
RESULT: <success | blocked | partial>
WHAT CHANGED:
  - src/pages/material/index.astro          (NEW, X lines)
  - src/pages/material/sterling-silver.astro (NEW, X lines)
  - ... (one bullet per file)
  - src/i18n/en.json                         (APPENDED 7 landing.material_* blocks)
WHAT WAS VERIFIED:
  - npm run build → 95 pages, 64 products, postbuild OK
  - 7 dist/material/*/index.html files present
  - JSON-LD CollectionPage + BreadcrumbList on vacamuerta page
  - Forbidden-words scan: 0 hits
  - Canonical lockup phrases present: 6 of 6
WHAT'S NEXT: Codex Task 3 (Subscription forms — gated on owner MailerLite decision)
NOTES FOR HUMAN: <only if action needed; otherwise omit>
```

Do NOT write a new `*-report.md` file unless the human asks.

---

## Hard rules echo (10 rules)

1. Read `AGENT_CONTROL_CENTER.md` + `DO_NOT_TOUCH.md` first.
2. Per-edit + per-commit human approval.
3. **No commit, no push, no remote-add, no deploy.**
4. **No DNS, no Cloudflare changes, no Tunnel changes.**
5. **No WC product writes.**
6. No `.env*` reads-into-output, no secret printing.
7. **No Aftercare modifications.**
8. `npm run build` after every batch. Postbuild assertion must hold.
9. Report ≤ 200 words per protocol.
10. If blocked or rule conflict: STOP and ask, do not improvise.

---

## Commit message (after explicit human "yes")

```
feat(material): add 6 material landing pages + hub (sterling-silver, 14k-gold, titanium, vacamuerta, walnut-wood, brass-bronze)
```

ONE commit only. Squash if necessary. Do NOT amend Codex Task 1's commit.

---

## What this prompt does NOT cover

- 3-axis Shop filter UI (P3 in `TASK_QUEUE.md`).
- Stone material page (deferred per `materials-pages-copy-and-seo.md` §9).
- Per-material macro photography (visual-asset gap; placeholders OK for now).
- Collection landings (`/collection/*` — separate task).
- Journal entries (`/journal/<slug>` — separate task).
- Subscription forms (Codex Task 3 — separate prompt at `codex-task-3-subscription-final-prompt.md`).

---

## References

- `~/wenu-frontend/materials-pages-copy-and-seo.md` (copy source-of-truth)
- `~/wenu-frontend/codex-next-tasks.md` Task 2 (original; superseded by this file for execution)
- `~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md` (control center)
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` (binding blocklist)
- `~/wenu-frontend/agent-control/AGENT_HANDOFF_PROTOCOL.md` (report format)
- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` §4 (canonical lockup phrases)
- `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md` (voice rules)
- `src/pages/piercing.astro` (authoritative template)
