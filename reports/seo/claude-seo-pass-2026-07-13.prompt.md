# Claude SEO pass — Wenu frontend — 2026-07-13

## Context
This repo is the live Astro frontend for Wenu Mapu.

Business/brand constraints:
- Do NOT deploy, publish, push, commit, or touch WordPress live.
- Local code edits only inside this repo.
- Keep Wenu tone sober, intimate, premium, body-jewelry specific. No generic SEO spam copy.
- Preserve brand clarity and product truth.
- Do not change prices or product data source semantics.

Known SEO findings from live audit:
- Home lacks a strong H1/meta posture.
- Shop/category surfaces are semantically weak.
- Some category pages have generic titles like `Wenu Mapu |`, no H1, and no meta description.
- Contact page needs stronger SEO/commercial metadata.
- URL architecture mixes languages historically; avoid making that worse.
- Priority categories discovered in live site audit:
  - `/shop`
  - `/contact`
  - `/categoria-producto/earrings/`
  - `/categoria-producto/metals/titanium/`
  - `/categoria-producto/organic/meteorites/`
- Septum category behavior looked inconsistent in probing; do not assume it is clean.

## Your task
1. Inspect the repo and identify the current implementation points for page titles, meta descriptions, canonical handling, H1s, and category landing copy.
2. Make ONLY the safest high-value local SEO improvements that are clearly justified and low-risk.
3. Focus on homepage/shop/contact/category metadata and heading clarity before anything fancy.
4. If a category is empty or structurally weak, do not force misleading SEO text; document the constraint instead.
5. Leave a clear markdown report at `reports/seo/claude-seo-pass-2026-07-13.md` with:
   - what you changed
   - which files you touched
   - what remains blocked/uncertain
   - next 80/20 SEO opportunities
6. At the very end, print a concise summary including whether files were modified and where the report was written.

## Safety rules
- No git commit.
- No git push.
- No deploy scripts.
- No external writes outside this repo.
- If something is ambiguous, prefer documenting over inventing.

## Suggested deliverables
- Local code improvements in repo if justified
- `reports/seo/claude-seo-pass-2026-07-13.md`

## Extra note
This repo may already have brand/SEO structure in `Base.astro`, pages under `src/pages/`, and category-related logic elsewhere. Use the repo's real structure, not assumptions.