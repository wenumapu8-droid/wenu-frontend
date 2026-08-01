# Night Work — Wenu Mapu — 2026-05-09 → 2026-05-10

Owner: Claude Code (Opus, Wenu Mapu senior architect role)
Mode: autonomous within safe boundaries; no DNS, no deploy, no push, no WC writes, no Aftercare touches, no `.env*` reads-into-output, no secrets printed, no image generation, no `src/` code edits.

---

## 1. Executive summary

Tonight closed the strategic + operational gap between Wenu Mapu's strong brand voice and the commercial scaffolding needed to convert visitors into buyers. Eight documents were created or updated; zero code shipped (by design — code work is per-commit-approved and routed through the new Codex task queue).

The work also locked the **canonical business model**: no current studio, private appointments + free local delivery in the Truckee / North Lake Tahoe area, inventory in Noco, contact via marimari@wenumapuonline.com / +1 (408) 500-6211 / @wenu__mapu. All forbidden legacy wording (Petrolia / Rizoma / contact@ / Showroom at home / Truth Tattoo / Lucky7 / Thrue Tattoo / +145 / +1 458) is named in the docs and listed for cleanup.

The next 5 actions for tomorrow are listed at §15.

---

## 2. Files created / updated

In `~/wenu-frontend/`:

| File | Type | Status |
|---|---|---|
| `market-reference-study-wenu-mapu.md` | UPDATE | Added canonical business facts header + corrected "Showroom" / phone / studio language across §3, §4, §13, §14 |
| `live-site-audit-wenumapuonline.md` | UPDATE | Added canonical business facts header + corrected FIX-1 / FIX-2 / Contact-page reconciliation / quick-win #1 |
| `full-site-completion-plan.md` | NEW | Target site map (~16 new routes), per-page spec for every page, English copy status, priority |
| `wenu-contact-and-operations-plan.md` | NEW | Canonical contact block, footer + Contact-page copy, email alias plan, ops folder structure, business documents needed |
| `wenu-subscription-and-journal-system.md` | NEW | Platform comparison (Brevo / MailerLite / Mailchimp / Klaviyo / FluentCRM / Buttondown), MailerLite recommendation, 4 capture surfaces, welcome flow, CAN-SPAM/GDPR/CCPA basics |
| `wenu-visual-agent-plan.md` | NEW | Multi-tool image pipeline (modes A/B/C/D), gates G1–G5, manifest format, prompt structure, rejection criteria, cost policy |
| `docs/handoffs/2026-05-09-asset-07-08/spec.md` | NEW | Skeleton handoff for Footer Pattern Band + Ritual Divider + AssetSlot system; awaits Claude Design source SVG |
| `codex-next-tasks.md` | NEW | 7 precise Codex tasks with exact files allowed / forbidden / acceptance criteria |
| `night-work-wenu-mapu-report.md` | NEW | This file |

In `~/Obsidian/WenuAgent/`:

| File | Type | Status |
|---|---|---|
| `00-Index/Estado-Wenu-Mapu-2026-05-10.md` | NEW | Project memory snapshot for next session |

In `~/.claude/projects/-Users-user1/memory/`:

| File | Type | Status |
|---|---|---|
| `project_wenu_business_facts_2026_05_10.md` | NEW | Memory entry capturing the canonical business facts override |
| `MEMORY.md` | UPDATE | One-line index entry pointing to the above |

**No file in `~/wenu-frontend/src/` was modified tonight.** No commit, no push, no deploy, no DNS, no Cloudflare, no WC writes, no Aftercare modifications.

---

## 3. Research completed

The 16 reference brands study (Phase 1) was already completed in the prior session. Tonight reused those findings; did not re-fetch. Convergent patterns:

1. **3-axis category nav** (placement × material × collection) — Buddha, Maria Tash, Tawapa, Wildlike, Ask & Embla, BVLA.
2. **Material as nav anchor for premium positioning** — Tawapa "Solid Gold," Buddha "PREMIUM SOLID GOLD."
3. **Service is a nav peer of product** — Maria Tash, Wildlike, So Gold, BVLA, Iris.
4. **Editorial Library / Edit / Insights** as email moat — Aesop, Buddha, Iris, Kin.
5. **Drops + permanent catalog coexist** — Rage Nation pattern.
6. **Names hold mystique; PDP body holds evidence** — Kin Euphorics discipline.
7. **No discount-led email capture** in any premium peer.
8. **APP / certification / threading vocabulary** as professional-trust currency.

Already documented at full depth in `market-reference-study-wenu-mapu.md` §1–§20.

---

## 4. Public site findings

Live audit run via `curl` on www.wenumapuonline.com on 2026-05-09. Apex returns HTTP 502 (Cloudflare Tunnel routes to `localhost:4321` which isn't always running). www works. Stack: WP 6.9.4 + Woo 10.7.0 + Elementor 3.33.4 + Bridge theme + Slider Revolution.

Top 10 issues (full list in `live-site-audit-wenumapuonline.md` §5 + §12):

1. Footer Petrolia address + malformed `+145…` phone + "Rizoma Digital" credit on every page.
2. Live test products `producto prueba` + `Pronto` visible on homepage.
3. Mixed-language UI on English-target store ("Cesta," "Añadir," "Leer más" ×10).
4. Generic `<title>` on every PDP, no meta, no OG, no JSON-LD.
5. Apex 502.
6. No homepage `<h1>` in HTML source (Elementor JS-renders).
7. Ugly migration slugs `/contact-2/`, `/about-3/`.
8. Aftercare hybrid slug `/aftercare-guide-cuidado-posterior/`.
9. 13 expected routes (custom-orders, materials, etc.) all 404.
10. Theme stack reads as 2018 default WooCommerce, not premium.

Full quick-win list and WP-admin checklist in `live-site-audit-wenumapuonline.md` §6.

---

## 5. Recommended business model

**Confirmed (your preferred hybrid E):** Shop by Body Placement / Shop by Material / Shop by Collection. Story / Ritual pages as brand depth, not navigation noise. Add a 4th (deferred) axis: **Shop by Drop** — named limited releases on Mapuche calendar moments.

**Service surfaces, all with their own page:**
- `/custom-orders` — commissions
- `/jewelry-styling` — curation/styling by request (NEW page)
- `/stockists` — appointments + free local delivery hub (relabel surface; URL stays)
- `/care-guide` — aftercare (off-limits for edits)
- `/materials` + `/material/<key>` — material education

**No claims of:**
- Studio location
- Walk-ins
- Find-a-Piercer (no piercer network)
- "Showroom at home" / "vitrine"

---

## 6. Recommended site map

Full sitemap in `full-site-completion-plan.md`. Net new routes: ~16.

Highest leverage:
- 6 material landings + 1 hub (P1 — Codex Task 2)
- 6 founding Journal entries + template (P2 — Codex Task 7)
- `/jewelry-styling` (P3 — service surface)
- 3 collection landings (P3 — Codex Task adjacent)

Keep:
- All 23 existing pages
- Current Nav structure (no structural change)
- Footer structure (only contact/credit copy changes)

---

## 7. Recommended CTAs

Hero: **Shop the collection →** + **Book a private appointment →**
Mega-menu: **Shop by Placement / Shop by Material / Shop by Collection**
PDP: **Add to cart** / **Find your size** / **Read aftercare** / **Request custom variant**
Footer: **Read the Journal** / **Join the circle** (no discount bait) / **Request a commission**
Avoid: "Find a Piercer," "Sale," "Sign up to save," generic "Buy Now."

Full table in `market-reference-study-wenu-mapu.md` §4.

---

## 8. Contact / footer copy (ready to ship)

Canonical block (use everywhere — full spec in `wenu-contact-and-operations-plan.md` §1):

```
Email      marimari@wenumapuonline.com
Phone      +1 (408) 500-6211
Instagram  @wenu__mapu
Site       wenumapuonline.com

Private appointments available in the Truckee / North Lake Tahoe area.
Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas.
Selected pieces may be viewed by appointment.
```

Footer short address line: **"Truckee, California — private appointments + free local delivery in the Truckee / North Lake Tahoe area."** (no street address, no studio).

---

## 9. Subscription system recommendation

**Platform: MailerLite** to start (free tier 1k contacts / 12k emails/mo; clean editorial templates; tagging + automation; WC integration when needed).

4 capture surfaces:
1. Home + footer + Journal hub: "Join the circle" (tag: source:home-footer / source:journal)
2. New `/aftercare-follow-up` page (NOT in /care-guide): aftercare 3-email sequence (days 3, 14, 90)
3. `/custom-orders` form (replaces mailto fallback) → `custom@`
4. `/stockists` appointment + delivery request form → `marimari@`

Welcome flow: 3 emails (day 0 / 7 / 14). No discounts. Voice = "Sent rarely, written by the maker." Full spec in `wenu-subscription-and-journal-system.md` §5.

Switch to Klaviyo when list passes ~5k.

---

## 10. Visual system / asset pipeline

Pipeline codified in `wenu-visual-agent-plan.md`:

- **4 modes:** Mode A (prompt-only, default) → Mode B (1 dry run) → Mode C (max 2 options, in-review) → Mode D (integrate). REJECT mode archives, never deletes.
- **5 quality gates:** brand canon → cultural respect → technical → integration → approval.
- **Tool taxonomy:** Claude Design = SVG/handoffs, Codex/Claude Code = integration, OpenAI/Nano Banana = editorial backgrounds (never product/face), Canva/Figma = composition, real camera = ALL product/founder/workshop photos.
- **Cost policy:** no credits without explicit logged decision and cap. Default 2 generations per handoff.
- **Folder structure:** `docs/handoffs/`, `public/assets/{patterns,dividers,seals,_drafts,_archive}`, `public/img/{brand,categories,hero,products,truckee,editorial,materials}`, `src/components/visual/`.

---

## 11. Codex task queue summary

7 tasks in priority order (`codex-next-tasks.md`):

| # | Task | Risk | Files | Status |
|---|---|---|---|---|
| 1 | Contact + Footer cleanup (Astro) | Low | Footer, contact, en.json, Newsletter | Ready |
| 2 | 6 material landings + hub | Low | 6 new pages, en.json | Ready (depends on Task 1 not blocked) |
| 3 | Subscription + custom-order + appointment forms | Medium | 4 new components + 3 page edits + en.json | Gated on owner MailerLite signup |
| 4 | Visual handoff Asset 07 + 08 integration | Medium | PatternBand, Footer, new components | Blocked on owner providing source SVG |
| 5 | Internal link audit | Zero | Read-only; outputs internal-link-audit.md | Ready |
| 6 | Build + smoke check (runs as Acceptance) | Zero | n/a | Always |
| 7 | Journal template + 6 founding entries | Low | Content collection + template + 6 markdown | Ready (after Task 2) |

Each task includes: exact scope, files allowed, forbidden actions, acceptance criteria, build commands, single-line commit message, no-secret/no-deploy/no-push enforcement.

---

## 12. Obsidian updates made

- `~/Obsidian/WenuAgent/00-Index/Estado-Wenu-Mapu-2026-05-10.md` — full project snapshot for next session.
- `~/.claude/projects/-Users-user1/memory/project_wenu_business_facts_2026_05_10.md` — memory entry for canonical business facts override.
- `~/.claude/projects/-Users-user1/memory/MEMORY.md` — index updated.

No vault notes were deleted. All additions follow vault conventions (frontmatter, wikilinks, footer backlinks) per `~/Obsidian/WenuAgent/CLAUDE.md`.

---

## 13. What was NOT touched

- ❌ No `~/wenu-frontend/src/` files modified
- ❌ No `npm run build` triggered (no code change)
- ❌ No commits, no push, no remote-add
- ❌ No deploy, no Cloudflare Pages activity
- ❌ No DNS changes
- ❌ No Cloudflare Tunnel changes
- ❌ No WC product reads-into-output, no WC writes
- ❌ No `.env*` files read into output, no secrets printed
- ❌ No Aftercare files modified (`public/aftercare/*`, `public/downloads/*`, `dist/aftercare/*`)
- ❌ No homepage structural change
- ❌ No new top-level navigation items
- ❌ No image generation, no credits spent
- ❌ No browser automation runs
- ❌ No ChatGPT browser sessions opened (worked from existing context + agent research from prior session)
- ❌ No telegram/email sent on owner's behalf
- ❌ No legacy WP admin logins

---

## 14. What needs human approval

In priority order:

1. **Owner reads the 8 reports** and confirms the strategic direction (especially: 3-axis nav, MailerLite as platform, /jewelry-styling as a new service surface, no studio language).
2. **Owner verifies marimari@wenumapuonline.com** exists, is monitored, and is the canonical primary email.
3. **Owner confirms +1 (408) 500-6211** is the canonical brand line (not personal); discontinues the legacy `+145…` and `+1 (458)` numbers in any private records.
4. **Owner approves Codex Task 1** (Contact + Footer Astro cleanup). Per-commit approval.
5. **Owner edits legacy WP admin** per the WP-admin checklist in `live-site-audit-wenumapuonline.md` §6 (footer, test products, Spanish UI strings, Yoast/RankMath install).
6. **Owner decides apex 502 routing** — 301 → www OR accelerate Pages preview cutover.
7. **Owner creates email aliases** orders@ + custom@ at the registrar / Cloudflare Email Routing.
8. **Owner signs up for MailerLite** under marimari@ + verifies sender domain (DKIM + SPF).
9. **Owner approves Codex Task 2** (6 material landings + hub).
10. **Owner provides source SVG** for Asset 07 + 08 (Claude Design or other tool) before Task 4 can run.

---

## 15. Exact next 5 actions for tomorrow

1. **Read `night-work-wenu-mapu-report.md` (this file)** + `Estado-Wenu-Mapu-2026-05-10.md` (Obsidian) — both are designed to give you the full state in under 10 minutes.
2. **Approve Codex Task 1** (Contact + Footer cleanup) and run it (Codex or Claude Code). Single commit. ~30 min.
3. **In parallel**, edit legacy WP admin footer + remove `producto prueba` / `Pronto` test products + install Yoast/RankMath. ~45 min.
4. **Approve Codex Task 2** (6 material landings + hub) and run it. Single commit. ~1.5 hr.
5. **Owner-only**: sign up for MailerLite (marimari@), confirm sender domain (DNS DKIM/SPF — owner DNS change), then approve Codex Task 3 (subscription forms). ~30 min owner action + ~1 hr code task.

---

## 16. Whether any code changed / deploy / push / DNS happened tonight

- **Code changed:** NONE. No `~/wenu-frontend/src/` file modified.
- **`npm run build`:** NOT triggered tonight (no code change to verify).
- **Commits:** ZERO.
- **Push:** NEVER.
- **Deploy:** NEVER.
- **DNS:** NEVER.
- **Cloudflare:** NEVER.
- **WC product changes:** NEVER.
- **Image generation:** NEVER.
- **Credits spent:** ZERO.
- **Secrets printed:** NEVER.

All work tonight was strategy, planning, and documentation. The Astro repo state at end-of-night is identical to start-of-night, except for 9 new/updated `.md` files in the repo root and `docs/handoffs/2026-05-09-asset-07-08/spec.md`. The Obsidian vault has 1 new note. The Claude memory has 1 new entry + 1 index update.

---

## 17. Sources

- `~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md` (read)
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` (read)
- `~/wenu-frontend/agent-control/TASK_QUEUE.md` (read)
- `~/wenu-frontend/agent-control/AGENT_HANDOFF_PROTOCOL.md` (read)
- `~/wenu-frontend/CLAUDE.md` (read)
- `~/wenu-frontend/claude-design-integration-plan.md` (read)
- `~/wenu-frontend/full-site-phase1-report.md` (read prior)
- `~/wenu-frontend/full-site-completion-report.md` (read prior — Phase 1+2 close)
- `~/wenu-frontend/end-of-day-status.md` (read — Aftercare deploy track context)
- `~/wenu-frontend/aftercare-readiness-report.md` (referenced)
- `~/wenu-frontend/cloudflared-local-managed-migration-plan.md` (referenced)
- `~/Obsidian/WenuAgent/CLAUDE.md` (read — vault conventions)
- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` (read prior)
- `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md` (read prior)
- `~/Obsidian/WenuAgent/brand/copy-frontend-2026-05-01.md` (read prior)
- 16 reference-brand sites researched in prior session (URLs cited in `market-reference-study-wenu-mapu.md`)
- Live `curl` of www.wenumapuonline.com on 2026-05-09 (cited in `live-site-audit-wenumapuonline.md`)
