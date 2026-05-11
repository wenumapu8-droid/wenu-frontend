# Codex Task 4 — Journal template + 6 founding entries (final prompt)

Date prepared: 2026-05-10 (CEO night, parallel prep)
Scope: paste-ready prompt for Codex/OpenCode to ship the Astro Journal as an editorial publication. Adds Astro Content Collections config, the `/journal/[slug]` route template, 6 founding entries, and updates the `/journal` hub to list them. Run AFTER Codex Task 2 (Materials) and ideally Task 3 (Subscription) have shipped — but Task 4 has no hard dependency on Task 3.

This file supersedes `codex-next-tasks.md` Task 7 for execution.

---

## Pre-flight checklist (Codex must confirm BEFORE first tool call)

- [ ] Codex Task 2 (Materials) reported `RESULT: success` AND human approved the commit.
- [ ] Codex Task 3 (Subscription) is either (a) shipped + approved, or (b) explicitly deferred — Task 4 has no hard dependency on it but the Subscription form on `/journal` will be a placeholder until Task 3 lands.
- [ ] `git status` clean on `redesign-v2`.
- [ ] `nvm use && npm run build` is green RIGHT NOW (95+ pages baseline).
- [ ] Owner has read AND approved `~/wenu-frontend/wenu-journal-entries-draft.md` end-to-end (all 6 entries + cultural-respect framing of Entry 2 + medical framing of Entry 5).
- [ ] You have read `AGENT_CONTROL_CENTER.md`, `DO_NOT_TOUCH.md`, `wenu-journal-entries-draft.md`.
- [ ] Astro version supports Content Collections (Astro 6.2.1 → yes).

If any box is unchecked, STOP and report blocked.

---

## Files to read first (read-only)

| File | Why |
|---|---|
| `~/wenu-frontend/wenu-journal-entries-draft.md` | Canonical entry text (consume verbatim) |
| `src/pages/journal.astro` | Existing hub — replace "First entries forthcoming" with index |
| `src/components/Base.astro` | Layout + JSON-LD support |
| `src/components/PatternBand.astro` | Section divider |
| `src/components/ProductCard.astro` | For the 2-card tail |
| `src/lib/woo.ts` | For loading products in tail rail |
| `src/styles/global.css` | Reuse classes; no new CSS |
| `src/i18n/en.json` | APPEND only |
| `astro.config.mjs` | Verify Content Collections support; do NOT change config |

---

## Files allowed (write list)

```
NEW config:
  src/content/config.ts                        (Astro Content Collections schema)

NEW content (6 entries):
  src/content/journal/what-is-vacamuerta.md
  src/content/journal/four-cardinal-forces.md
  src/content/journal/why-truckee.md
  src/content/journal/forging-the-meteorite.md
  src/content/journal/aftercare-first-90-days.md
  src/content/journal/reading-the-body.md

NEW route template:
  src/pages/journal/[slug].astro

EDIT (replace "First entries forthcoming" with entries index):
  src/pages/journal.astro

EDIT (APPEND only):
  src/i18n/en.json                             (journal hub strings + "Read more" labels)

NEW images (only IF needed; copy from existing /public/img assets — do NOT generate):
  public/img/editorial/vacamuerta-raw.webp     (or symlink/copy from /img/categories/meteorite.webp)
  public/img/editorial/cardinal-cross.webp     (placeholder)
  public/img/editorial/truckee-workshop.webp   (placeholder)
  public/img/editorial/meteorite-forging.webp  (placeholder)
  public/img/editorial/aftercare-primer.webp   (READ /public/aftercare/ for the existing hero filename and COPY only, do NOT modify aftercare files)
  public/img/editorial/curation-still-life.webp (placeholder)
```

That is the entire allowed write list.

---

## Forbidden actions

- `/care-guide` content (`src/pages/care-guide.astro`) — OFF-LIMITS.
- `/public/aftercare/*` and `/dist/aftercare/*` — OFF-LIMITS for modification. READ-only allowed for finding an existing image to copy into `/public/img/editorial/aftercare-primer.webp`.
- Homepage structural change (`src/pages/index.astro`).
- Nav (`src/components/Nav.astro`) — Journal is already in nav.
- `Base.astro`, `Footer.astro`.
- `astro.config.mjs` — verify Content Collections support is implicit; do NOT modify config.
- New CSS files. Reuse `global.css` patterns. Per-entry styles can be inline `<style>` scoped to the [slug].astro template.
- Image generation — ZERO new image credits. All editorial images are placeholders copied from existing `/public/img/` paths.
- `git commit`, `git push`, deploy, DNS, Cloudflare, WC writes.
- `.env*` reads/writes.
- AI-rewriting any of the 6 entries. The text in `wenu-journal-entries-draft.md` is consumed verbatim once owner-approved. Codex may fix typos and adjust markdown formatting; Codex does NOT rewrite paragraphs.

---

## Astro Content Collections config

Create `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const journal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    date: z.coerce.date(),
    ogImage: z.string(),
    excerpt: z.string(),
    related: z.array(z.string()).default([]),
    length_words: z.number().optional(),
  }),
});

export const collections = { journal };
```

---

## Entry markdown shape

For each of the 6 entries in `src/content/journal/<slug>.md`, populate frontmatter and body verbatim from `wenu-journal-entries-draft.md` §1-§6. Example (entry 1):

```markdown
---
title: "What is Vacamuerta meteorite?"
eyebrow: "JOURNAL · MATERIAL STORY"
date: 2026-05-15
ogImage: /img/editorial/vacamuerta-raw.webp
excerpt: "Cosmic fragments that fell in Chile's Atacama Desert. We work them into rings, amulets and signature pieces."
related: ["/material/vacamuerta", "/about", "/artistry"]
length_words: 720
---

The first time you hold a fragment of Vacamuerta meteorite, it is heavier than you expect. Iron-nickel meteorites are denser than terrestrial iron — about 7.8 grams per cubic centimeter — and the weight registers in the hand as something between a stone and a tool. It does not feel made. It feels found.

That is, in fact, what it is.

[... full body from wenu-journal-entries-draft.md §1 ...]
```

(Repeat for entries 2-6, using §2-§6 verbatim.)

---

## `/journal/[slug].astro` template

Renders a single entry. Pattern:

```astro
---
import Base from '../../components/Base.astro';
import ProductCard from '../../components/ProductCard.astro';
import PatternBand from '../../components/PatternBand.astro';
import { getCollection } from 'astro:content';
import { getProducts } from '../../lib/woo';

export async function getStaticPaths() {
  const entries = await getCollection('journal');
  return entries.map(entry => ({
    params: { slug: entry.slug },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await entry.render();
const { title, eyebrow, date, ogImage, excerpt, related } = entry.data;

// Tail product rail — pick 2 from related material
const all = await getProducts(50);
// Heuristic: if related[] contains a /material/<slug> path, filter products by that material; otherwise pick 2 most recent.
const materialMatch = related.find(r => r.startsWith('/material/'));
const materialKey = materialMatch ? materialMatch.replace('/material/', '') : null;
const tail = materialKey
  ? all.filter(p => p.images?.[0]?.src && p.categories.some(c => c.slug.toLowerCase().includes(materialKey))).slice(0, 2)
  : all.filter(p => p.images?.[0]?.src).slice(0, 2);

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": excerpt,
  "datePublished": date.toISOString(),
  "image": ogImage,
  "author": { "@type": "Organization", "name": "Wenu Mapu" },
  "publisher": {
    "@type": "Organization",
    "name": "Wenu Mapu",
    "logo": { "@type": "ImageObject", "url": "https://wenumapuonline.com/img/brand/wenu-mapu-mark.svg" }
  }
};
---
<Base
  title={`${title} | Wenu Mapu Journal`}
  description={excerpt}
  ogImage={ogImage}
  ogType="article"
  jsonLd={jsonLd}
>
  <article class="section--mega">
    <div class="container">
      <p class="eyebrow">{eyebrow}</p>
      <h1 class="page-title">{title}</h1>
      <p class="entry-meta">{date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <div class="entry-prose">
        <Content />
      </div>
      <PatternBand variant="hairline" />
      {tail.length > 0 && (
        <div class="entry-tail">
          <p class="eyebrow">FROM THE CATALOGUE</p>
          <div class="landing__rail">
            {tail.map(p => <ProductCard product={p} />)}
          </div>
        </div>
      )}
      {related.length > 0 && (
        <nav class="entry-related">
          <p class="eyebrow">RELATED</p>
          <ul>
            {related.map(href => <li><a href={href}>{href}</a></li>)}
          </ul>
        </nav>
      )}
    </div>
  </article>
</Base>
```

(This is a sketch. Mirror the existing patterns in `src/pages/p/[slug].astro` if it has a more polished prose render — that file is the authoritative reference for prose-heavy templates.)

The `.entry-prose` class can be defined inline in this template's `<style>` block — it sets max-width (~65ch), font-family Source Serif Pro for body, and prose spacing. Reuse existing tokens; do not hardcode pixel values.

---

## `/journal/index.astro` (hub) update

Replace the "First entries forthcoming" placeholder. New shape:

```astro
---
import Base from '../components/Base.astro';
import { getCollection } from 'astro:content';
import en from '../i18n/en.json';

const entries = (await getCollection('journal'))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<Base title="Journal — Wenu Mapu" description="Material stories, process notes, and quiet announcements from the Wenu Mapu workshop.">
  <section class="section--mega">
    <div class="container">
      <p class="eyebrow">JOURNAL</p>
      <h1 class="page-title">The Wenu Mapu Journal.</h1>
      <p class="page-divider">Material stories, process notes, drop announcements. Written by the maker. Sent rarely.</p>
      <ul class="journal-index">
        {entries.map(entry => (
          <li class="archive-card">
            <a href={`/journal/${entry.slug}/`}>
              <p class="eyebrow">{entry.data.eyebrow}</p>
              <h2>{entry.data.title}</h2>
              <p>{entry.data.excerpt}</p>
              <p class="entry-meta">{entry.data.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {entry.data.length_words} words</p>
            </a>
          </li>
        ))}
      </ul>
      <!-- Subscription block: render JoinTheCircleForm if Codex Task 3 has shipped; otherwise mailto fallback. -->
    </div>
  </section>
</Base>
```

Reuse `.archive-card` class from `global.css`. Do NOT invent new card class.

---

## i18n key shape (append to `src/i18n/en.json`)

```json
"journal": {
  "hub_eyebrow": "JOURNAL",
  "hub_title": "The Wenu Mapu Journal.",
  "hub_intro": "Material stories, process notes, drop announcements. Written by the maker. Sent rarely.",
  "read_more": "Read the entry",
  "back_to_journal": "← All entries",
  "from_catalogue": "FROM THE CATALOGUE",
  "related": "RELATED"
}
```

Do NOT rewrite existing keys.

---

## Build command + acceptance criteria

```bash
nvm use && npm run build
```

Expected:

- **Page count:** 95 (or current baseline) + 6 new entry pages = 101 (Journal hub already counted in baseline).
- **Products page count:** 64 (unchanged — postbuild assertion holds).
- **postbuild OK.** No TS errors, no Astro warnings.

Verify the new artifacts:

```bash
for slug in what-is-vacamuerta four-cardinal-forces why-truckee forging-the-meteorite aftercare-first-90-days reading-the-body; do
  test -f "dist/journal/${slug}/index.html" && echo "OK journal/${slug}" || echo "MISS journal/${slug}"
done
test -f "dist/journal/index.html" && echo "OK journal/" || echo "MISS journal/"
```

All 7 should print `OK`.

Verify SEO + JSON-LD on one entry (vacamuerta — flagship):

```bash
grep -c '"@type": "Article"' dist/journal/what-is-vacamuerta/index.html  # >= 1
grep -c '<title>' dist/journal/what-is-vacamuerta/index.html             # 1
grep -c '<h1' dist/journal/what-is-vacamuerta/index.html                 # 1
```

Verify `/care-guide` and `/aftercare/*` UNTOUCHED:

```bash
git diff --stat src/pages/care-guide.astro public/aftercare/ dist/aftercare/
# expected: empty (no changes)
```

Verify forbidden words absent (canonical-business + voice forbidden):

```bash
grep -rEHn "Petrolia|Rizoma|Truth Tattoo|Troll Studio|Lucky7|Showroom at home|vitrine|walk-?in|\+145|contact@wenumapuonline\.com" \
  src/content/journal/ src/pages/journal/ src/pages/journal.astro
# expected: 0 hits

grep -rEHn "beautiful|magical|enchanted|positive energy|Mapuche Root|Earthly|Earthborn" \
  src/content/journal/ src/pages/journal/ src/pages/journal.astro
# expected: 0 hits
```

Verify entry length discipline (600-1200 words per BRAND-DNA §10):

```bash
for f in src/content/journal/*.md; do
  words=$(wc -w < "$f")
  printf "%-50s %s\n" "$(basename $f)" "$words"
done
# expected: 600 ≤ words ≤ 1300 for each
```

Verify entry 5 does NOT duplicate /care-guide content:

```bash
# Heuristic: count overlap between aftercare-first-90-days.md and care-guide.astro long-form aftercare protocol
diff <(tr -s '[:space:]' '\n' < src/content/journal/aftercare-first-90-days.md | sort -u) \
     <(tr -s '[:space:]' '\n' < src/pages/care-guide.astro | sort -u) \
  | grep -c "saline\|swelling\|peroxide\|chlorhexidine"
# heuristic — expect a small overlap (entry 5 mentions saline once); large overlap is a duplication smell
```

If any check fails, STOP and report.

---

## Report

Per `AGENT_HANDOFF_PROTOCOL.md`. Inline in chat, ≤ 200 words. Format:

```
RESULT: <success | blocked | partial>
WHAT CHANGED:
  - src/content/config.ts (NEW)
  - src/content/journal/{6 slugs}.md (NEW)
  - src/pages/journal/[slug].astro (NEW)
  - src/pages/journal.astro (EDIT — replaced "First entries forthcoming" with index)
  - src/i18n/en.json (APPEND journal block)
  - public/img/editorial/{6 slugs}.webp (placeholders, copies of existing /public/img/* assets)
WHAT WAS VERIFIED:
  - npm run build → 101 pages, 64 products, postbuild OK
  - All 6 entry pages + hub render
  - Article JSON-LD on each entry
  - /care-guide UNTOUCHED, /aftercare/* UNTOUCHED
  - Forbidden-words scan: 0
  - Entry length 600-1200 words: 6/6 pass
  - Entry 5 does not duplicate /care-guide aftercare protocol
WHAT'S NEXT: Cloudflare Pages preview deploy decision (P3 in TASK_QUEUE.md) once owner is ready
NOTES FOR HUMAN: <only if action needed>
```

Do NOT write a new `*-report.md` file unless the human asks.

---

## Hard rules echo (10 rules)

1. Read `AGENT_CONTROL_CENTER.md` + `DO_NOT_TOUCH.md` + `wenu-journal-entries-draft.md` first.
2. Per-edit + per-commit human approval.
3. **No commit, no push, no deploy.**
4. **No DNS, no Cloudflare, no Tunnel changes.**
5. **No WC product writes.**
6. No `.env*` reads-into-output.
7. **No Aftercare modifications.** Entry 5 cross-links only.
8. **No image generation.** All editorial images are placeholders.
9. `npm run build` after every batch. Postbuild assertion must hold.
10. **No AI-rewriting of the entries.** Owner-approved text is consumed verbatim.

---

## Commit message (after explicit human "yes")

```
feat(journal): add Content Collections + 6 founding entries
```

ONE commit. Squash if necessary. Do NOT amend earlier commits.

---

## What this prompt does NOT cover

- 7th and beyond Journal entries — separate cadence, owner writes.
- `/journal/[slug]` per-entry signup form (Codex Task 3 ships JoinTheCircleForm; once Task 3 is in, the [slug].astro can host it).
- Real editorial photography for the 6 entries — visual-asset gap; founder-driven.
- Cultural-respect review of Entry 2 (Mapuche cosmology) — owner + cultural advisor; required before publishing.
- Email send when entries publish — that is the MailerLite send (Path A only), owner-driven.

---

## References

- `~/wenu-frontend/wenu-journal-entries-draft.md` (canonical text source)
- `~/wenu-frontend/codex-next-tasks.md` Task 7 (original Journal prompt; superseded by this file)
- `~/wenu-frontend/full-site-completion-plan.md` (Journal section spec)
- `~/wenu-frontend/market-reference-study-wenu-mapu.md` §9 (editorial-as-moat strategy)
- `~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md`
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md`
- `~/wenu-frontend/agent-control/AGENT_HANDOFF_PROTOCOL.md`
- Astro Content Collections docs: https://docs.astro.build/en/guides/content-collections/
