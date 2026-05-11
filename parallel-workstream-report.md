# Parallel workstream report — 2026-05-10 (CEO night)

Scope: side-track preparation while Codex/OpenCode handles Codex Task 1 (Astro Footer + Contact + Newsletter cleanup).
Mode: documents only. No code touched. No deploys. No commits. No image credits.

---

## 1. What was prepared this session

| File | Action | Purpose |
|---|---|---|
| `~/wenu-frontend/wordpress-live-cleanup-checklist.md` | UPDATED (added §16 search-and-destroy regex + §17 Owner sign-off + §18 References) | Owner-driven WP admin hygiene checklist for the legacy site |
| `~/wenu-frontend/wenu-english-copy-pack-v1.md` | UPDATED (added §5b Ritual Objects + expanded §14 Newsletter to 5 sub-blocks: 4 surfaces + Path B fallback contract) | Paste-ready English copy for every key page surface |
| `~/wenu-frontend/materials-pages-copy-and-seo.md` | NEW | Canonical copy + SEO + KEYWORDS + i18n shape for the 6 material pages + hub |
| `~/wenu-frontend/codex-task-2-materials-pages-final-prompt.md` | NEW | Tightened Codex prompt for the materials landings (consumes the materials-pages-copy file) |
| `~/wenu-frontend/codex-task-3-subscription-final-prompt.md` | NEW | Tightened Codex prompt for the subscription/capture forms with explicit Path A / Path B contract (no fake success state) |
| `~/wenu-frontend/wenu-journal-entries-draft.md` | NEW | First-draft text for the 6 founding Journal entries (600-1,200 words each, on-voice, owner-review-gated) |
| `~/wenu-frontend/codex-task-4-journal-final-prompt.md` | NEW | Codex prompt for Astro Content Collections + Journal template + 6 entries (consumes the entries-draft verbatim) |
| `~/wenu-frontend/mailerlite-setup-owner-checklist.md` | NEW | End-to-end owner setup to flip Codex Task 3 forms from Path B (mailto) to Path A (real provider): signup, DKIM/SPF, API key, groups, aliases, PO Box, welcome flow, test |
| `~/wenu-frontend/inquiry-response-templates.md` | NEW | 7 paste-ready first-reply templates (appointment, custom commission, curation, aftercare, shipping, wholesale-defer, generic-ack) + signature + subject conventions + forbidden-words audit |
| `~/wenu-frontend/collection-pages-copy-and-seo.md` | NEW | Paste-ready copy + SEO + i18n shape for `/collection/` hub + 3 founding collection landings (Ritual Ring Vacamuerta, Mystic Series, Author Jewelry). `/collection/chaway` flagged DEFERRED pending cultural-respect review. |
| `~/wenu-frontend/codex-task-5-collection-pages-final-prompt.md` | NEW | Codex prompt that consumes the collections doc; same pattern as Task 2 |
| `~/wenu-frontend/codex-task-6-pdp-trust-and-related-final-prompt.md` | NEW | Codex prompt for `<Spec>` trust block + `<RelatedPieces>` cross-sell rail on every PDP. Material lockup mapping included. |
| `~/wenu-frontend/parallel-workstream-report.md` | NEW (this file) | Morning coordination summary |

Total: 11 new docs, 2 audited updates, 0 code touched, 0 secrets surfaced, 0 deploys.

---

## 2. What Codex / OpenCode is handling separately

- **Codex Task 1 — Footer + Contact + Newsletter cleanup** (per `~/wenu-frontend/codex-next-tasks.md` §Task 1).
- Files in scope for Codex Task 1: `src/components/Footer.astro`, `src/pages/contact.astro`, `src/i18n/en.json`, `src/components/Newsletter.astro` (mailto recipient only).
- Acceptance for Codex Task 1 (per its own prompt):
  - `nvm use && npm run build` → 88 pages, postbuild OK.
  - `grep -rn "contact@wenumapuonline.com" src/` → 0 matches.
  - `grep -rn "Petrolia\|Rizoma\|Northbound\|+145" src/` → 0 matches.
  - `grep -rn "Showroom at home\|vitrine\|walk-in" src/` → 0 matches.
  - `/contact` renders the new channel block; footer renders the new short address line.
- Status assumption: in-flight at the time of this writing. None of the files I prepared overlap with Codex Task 1's allowed-write set.

---

## 3. What should happen after Task 1 lands

Sequence (each step gated on the previous):

1. **Codex Task 1 reports `RESULT: success`** → human reviews diff → human approves the commit `chore(contact): canonicalize footer + Contact page to marimari@/+1(408)/appointments-only model`.
2. **Owner reads `wordpress-live-cleanup-checklist.md`** and decides which sections to apply on the live WP site (independent of the Astro track; can run in parallel with Codex Task 2).
3. **Owner audits `wenu-english-copy-pack-v1.md`** updates and approves the new sections (Ritual Objects §5b, Newsletter §14 4-variant block).
4. **Owner reads `materials-pages-copy-and-seo.md`** and approves the canonical material copy (especially the Vacamuerta provenance line and the deferred-stone decision).
5. **Owner pastes `codex-task-2-materials-pages-final-prompt.md`** into Codex/OpenCode. Codex confirms pre-flight, ships 7 routes, reports back, awaits per-commit approval.
6. **Owner approves Codex Task 2 commit** `feat(material): add 6 material landing pages + hub (...)`.
7. **Owner decides MailerLite signup** (Path A vs Path B per `wenu-subscription-and-journal-system.md` §3, §9).
8. **Owner pastes `codex-task-3-subscription-final-prompt.md`** into Codex. Codex confirms pre-flight (including the Path A/B decision), ships 5 form components + 1 host page + (Path A only) 1 API endpoint, reports back.
9. **Owner approves Codex Task 3 commit** `feat(forms): add subscription + custom-order + appointment forms (frontend, gated provider)`.

After step 9, the next Astro priorities (per `full-site-completion-plan.md`) are: Journal template + 6 founding entries (Codex Job 4), then Cloudflare Pages preview deploy gate decision.

---

## 4. What needs owner approval (explicit list)

1. **WP admin: live footer / contact / locale changes** — see `wordpress-live-cleanup-checklist.md`. Owner-only via WP admin. Backup first.
2. **WP admin: unpublish `producto prueba`, `Pronto`, `Aonik` (any draft-leak titles)** — Status: Draft, NOT Trash. Owner-only.
3. **Final material copy in Task C** (`materials-pages-copy-and-seo.md`). Particularly:
   - Sterling Silver origin story (mentions Mapuche silversmith heritage — confirm this is on-voice for the Truckee/California register).
   - Vacamuerta provenance line — canonical from BRAND-DNA §4, do NOT rewrite.
   - Stone material status — confirmed deferred per `market-reference-study-wenu-mapu.md` §16; ask if owner wants to add anyway.
4. **MailerLite signup decision** — Path A (sign up now, paste API key into `.env.local`) OR Path B (ship mailto-only forms; flip to Path A later when the list grows).
5. **PO Box / postal address for CAN-SPAM compliance** — required before any bulk email goes out under Path A. Truckee PO Box recommended. Owner rents.
6. **Lawyer review of privacy policy and custom-order contract template** — gated on owner + counsel. Affects Path A go-live.
7. **Per-commit approval on `redesign-v2`** — every Codex commit requires explicit human "yes" per `AGENT_HANDOFF_PROTOCOL.md`.
8. **Apex 502 fix** — Cloudflare-side change; owner reads `wordpress-live-cleanup-checklist.md` §5 (Option A: simple 301 from apex to www; Option B: change tunnel ingress). Recommend Option A for now.

---

## 5. What was explicitly NOT touched

- `src/` — no Astro source edits.
- `public/` — no static asset changes.
- `dist/` — no build outputs (no `npm run build` triggered this session).
- Aftercare files — `public/aftercare/*`, `dist/aftercare/*`, `src/pages/care-guide.astro` all OFF-LIMITS per `DO_NOT_TOUCH.md`. The aftercare follow-up form (Codex Task 3) lives on a NEW page `/aftercare-follow-up`, not inside `/care-guide`.
- Cloudflare Tunnel — no changes to plist, LaunchDaemon, or routing.
- DNS records — no edits to apex, www, or any subdomain.
- WooCommerce — no read-modify-write loops, no API writes, no product status changes (those are owner-only via WP admin per `wordpress-live-cleanup-checklist.md`).
- `.env*` files — no reads-into-output, no edits, no deletes.
- Git — no commits, no pushes, no remote-add, no merges, no rebases. `git status` on `redesign-v2` is unchanged from before this session (only the markdown docs in this list were created/updated, and those are not in `src/`).
- Image generation — no credits spent. Per-material macro photography is still a visual-asset gap.
- WP admin — no logins. All WP-side action is owner-driven via the checklist.
- Telegram bot, Cloudflare dashboard, GitHub, MailerLite — no logins, no writes anywhere.

---

## 6. Next 6 execution tasks (in order)

1. **WP live cleanup** — owner-driven, parallel-safe. ~60-90 min via `wordpress-live-cleanup-checklist.md`. Removes Petrolia / Rizoma / `+145` / `producto prueba` / Spanish UI strings from the public live site immediately.
2. **Codex Task 2 — Materials landings** — 6 deep-dives + 1 hub. Adds 7 routes, 0 product changes, 0 nav change. Highest single-shot SEO + UX uplift per `market-reference-study-wenu-mapu.md` §10.
3. **(Owner, parallel)** **MailerLite setup** — `mailerlite-setup-owner-checklist.md` walks the founder through signup, DKIM/SPF, API key, groups, aliases. Unblocks Codex Task 3 Path A.
4. **Codex Task 3 — Subscription forms** — gated on §3 decision. 5 form components + 1 host page (Path A also adds 1 API endpoint). Honest Path B fallback if no provider yet.
5. **Codex Task 4 — Journal + 6 founding entries** — Astro Content Collections + `/journal/[slug]` template + 6 entries from `wenu-journal-entries-draft.md` (owner approves text first). Adds 6 routes, no nav change, no Aftercare touch.
6. **Codex Task 5 — Collection landings** — `/collection/` hub + 3 founding collections (Ritual Ring Vacamuerta, Mystic Series, Author Jewelry). 4 routes. `/collection/chaway` DEFERRED.
7. **Codex Task 6 — PDP trust block + RelatedPieces rail** — adds `<Spec>` + `<RelatedPieces>` to every product page. Commercial uplift on every PDP. No new routes.

(Tasks 5 + 6 can run in either order after Task 2; no hard dep between them. Task 6 is highest commercial leverage per PDP; Task 5 is highest SEO leverage per route. Owner picks the order.)

**Inbox parallel:** `inquiry-response-templates.md` is usable TODAY for the existing mailto inbox flow — founder can paste-and-personalize for appointment / commission / curation / aftercare / shipping replies without waiting on any Codex task.

---

## 7. Open questions

None blocking the immediate sequence above. Items the owner may want to decide eventually but that do NOT block any of the 3 next tasks:

- **Stone material page** (`/material/stone`) — currently deferred per `materials-pages-copy-and-seo.md` §9. Yes/no/later?
- **`/jewelry-styling` / `/curation`** — copy is in `wenu-english-copy-pack-v1.md` §8; route doesn't exist yet. Add to a future Codex job?
- **`/ear-cuffs` placement landing** — listed P4 in `full-site-completion-plan.md`; only build when WC has ≥3 cuff products. Status TBD.
- **`/collection/chaway` cultural review** — required before any Mapuche-inspired collection page goes live. Owner-driven.
- **GitHub remote for `wenu-frontend`** (P3 in `TASK_QUEUE.md`) — yes (Pages auto-deploy) or no (direct upload)?
- **Apex DNS cutover** — out of scope for this week; defer to P8 in the queue.

---

## 8. Verification (read-only)

Run these on demand to confirm the 6 deliverables landed cleanly:

```bash
ls -la ~/wenu-frontend/wordpress-live-cleanup-checklist.md \
       ~/wenu-frontend/wenu-english-copy-pack-v1.md \
       ~/wenu-frontend/materials-pages-copy-and-seo.md \
       ~/wenu-frontend/codex-task-2-materials-pages-final-prompt.md \
       ~/wenu-frontend/codex-task-3-subscription-final-prompt.md \
       ~/wenu-frontend/parallel-workstream-report.md
```

Forbidden-words sweep across the 6 files (excluding the legitimate "this is a forbidden word" reference contexts):

```bash
grep -EHn "Petrolia|Rizoma|Truth Tattoo|Troll Studio|Lucky7|Showroom at home|vitrine|walk-?in|\+145|\(458\) 226-6027|contact@wenumapuonline\.com" \
  ~/wenu-frontend/wordpress-live-cleanup-checklist.md \
  ~/wenu-frontend/wenu-english-copy-pack-v1.md \
  ~/wenu-frontend/materials-pages-copy-and-seo.md \
  ~/wenu-frontend/codex-task-2-materials-pages-final-prompt.md \
  ~/wenu-frontend/codex-task-3-subscription-final-prompt.md \
  ~/wenu-frontend/parallel-workstream-report.md \
  | grep -vE "Forbidden|forbidden|search-and-destroy|to remove|stale|legacy|do not use|MUST replace|REPLACE|Banned|banned|find/replace|FIND|find " \
  | grep -vE "wordpress-live-cleanup-checklist\.md.*(force-strip|find:|hits remain|Replace|REPLACE)"
```

(Hits surfaced here are reference contexts where the forbidden word is being NAMED so a downstream agent or owner removes it, not USED. If you see a real instance of the forbidden word being USED, that's a regression — fix it.)

Canonical contact verification:

```bash
grep -c "marimari@wenumapuonline.com" \
  ~/wenu-frontend/wordpress-live-cleanup-checklist.md \
  ~/wenu-frontend/wenu-english-copy-pack-v1.md \
  ~/wenu-frontend/materials-pages-copy-and-seo.md \
  ~/wenu-frontend/codex-task-2-materials-pages-final-prompt.md \
  ~/wenu-frontend/codex-task-3-subscription-final-prompt.md \
  ~/wenu-frontend/parallel-workstream-report.md
```

Codex prompts must repeat hard rules:

```bash
grep -ciE "no commit|no push|no deploy|no DNS|no Aftercare|no WC writes|no fake success|honest fallback" \
  ~/wenu-frontend/codex-task-2-materials-pages-final-prompt.md \
  ~/wenu-frontend/codex-task-3-subscription-final-prompt.md
```

Path B fake-success forbidden:

```bash
grep -ciE "no fake success|honest fallback|mailto.*marimari" \
  ~/wenu-frontend/codex-task-3-subscription-final-prompt.md
```

No `npm run build`. No `git` mutating commands. No Cloudflare / DNS / WC commands. Verification is purely read-only.

---

## 9. References

- `~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md` (master)
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` (binding blocklist)
- `~/wenu-frontend/agent-control/TASK_QUEUE.md` (priorities)
- `~/wenu-frontend/agent-control/AGENT_HANDOFF_PROTOCOL.md` (report format)
- `~/wenu-frontend/full-site-completion-plan.md` (site map + per-page specs)
- `~/wenu-frontend/wenu-contact-and-operations-plan.md` (canonical contact + footer + email aliases)
- `~/wenu-frontend/wenu-subscription-and-journal-system.md` (MailerLite + capture surfaces + compliance)
- `~/wenu-frontend/market-reference-study-wenu-mapu.md` (3-axis taxonomy + content moat + material priority)
- `~/wenu-frontend/live-site-audit-wenumapuonline.md` (legacy WP findings)
- `~/wenu-frontend/codex-next-tasks.md` (Task 1, 2, 3, 4 original prompts)
- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` §4 (canonical material lockup phrases)
- `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md` (voice rules)
