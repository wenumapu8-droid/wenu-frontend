# Task Queue

Prioritized backlog. Agents pick from the **top of the highest non-blocked priority that they own**. New ideas append to a priority bucket; they do not jump the queue.

Status legend: `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked · `[?]` needs human decision

---

## P0 — Security (top priority)

- [x] **A.** chmod 600 on `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist` *(done 2026-05-09, human ran sudo)*
- [x] **B.** stop duplicate `brew services` cloudflared registration *(done 2026-05-09, human ran)*
- [?] **C.** rotate the leaked cloudflared connector token via locally-managed migration *(plan: `cloudflared-local-managed-migration-plan.md`; deferred behind Pages cutover per 2026-05-09 decision)*
- [ ] **E.** lock down `wenu-agent-hub` `.env.*` backups (5 files): expand `.gitignore` + move to `~/wenu-secrets-backup/` *(plan: `security-cleanup-plan.md` Step E)*
- [ ] **F.** chmod 600 on plain `.env` files across all `wenu-*` projects *(plan: `security-cleanup-plan.md` Step F)*
- [x] **G.** harden `.gitignore` defensively in `wenu-frontend` *(verified 2026-05-15 — `.gitignore` already carries a defensive secrets block: `.env*`, `*.pem`, `*.key`, `*.crt`, `*.p12`, `*.pfx`, `secrets/`, `tokens/`, `.cloudflared/`. Done.)*

Owners: Claude plans, human runs sudo, Codex may run non-sudo file edits.

## P1 — Preserve existing system (don't lose what works)

- [ ] **P1.1** Snapshot current `wenu-frontend` state to `~/WenuBackups/` (tarball, mode 600, dated filename). Confirm `dist/`, `public/`, `src/`, `package.json`, `package-lock.json`, `astro.config.mjs`, `.nvmrc` all present.
- [ ] **P1.2** Snapshot `wenu-agent-hub` (excluding `.env*`) — verify Telegram bot config + orchestrator are recoverable.
- [ ] **P1.3** Confirm Obsidian vault is backed up (LaCie/Backups per memory `project_organizacion_2026_05_04`).
- [ ] **P1.4** Verify `wenu-platform` Postgres has a recent dump. If not, create one.
- [ ] **P1.5** Document the current Cloudflare Tunnel routing in `cloudflared-local-managed-migration-plan.md` §1 (already done — confirm fresh).

Owner: human approves each snapshot location; Claude prepares commands; Codex / Bash executes after approval.

## P2 — Aftercare independent hosting

- [ ] **P2.1** Decide: Aftercare goes to its own Cloudflare Pages project on a `*.pages.dev` URL first, or directly attached to a subdomain (`aftercare.wenumapuonline.com`)?
- [ ] **P2.2** Create a Cloudflare Pages project (manual via dashboard, Claude guides).
- [ ] **P2.3** Upload `public/aftercare/` + `public/downloads/wenu-mapu-aftercare-guide.pdf` (either via wrangler upload after install, or via dashboard direct upload).
- [ ] **P2.4** Verify all asset URLs return 200, video plays, PDF downloads.
- [ ] **P2.5** If subdomain attachment was approved, attach `aftercare.wenumapuonline.com` to the project (separate Pages project from full-site).

Owner: human drives dashboard; Claude verifies via curl + screenshots.

## P3 — Full-site architecture (Cloudflare Pages preview)

- [x] **P3.1** Decided **yes** — GitHub remote for auto-deploy. `origin` → `github.com/wenumapu8-droid/wenu-frontend`.
- [x] **P3.2** GitHub repo created, `origin` added, `redesign-v2` pushed and tracking. *(Branch protection on `main` — confirm in GitHub settings; not verified.)*
- [~] **P3.3** Cloudflare Pages project created — **actual name is `wenu-frontend`** (not `wenu-mapu-redesign`). Auto-deploys `redesign-v2`. **OPEN:** Production branch is NOT set to `redesign-v2` — it deploys as a preview branch alias (`x-robots-tag: noindex`); canonical `wenu-frontend.pages.dev` returns 404. Owner must set Production branch = `redesign-v2` in the Pages dashboard. See `CURRENT_STATE.md` → Cloudflare Pages.
- [ ] **P3.4** Add Pages env vars (encrypted): `NODE_VERSION=24`, `WC_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`. Human pastes; agents never see. *(Build succeeds on Pages, so these are likely already set — confirm.)*
- [x] **P3.5** Preview build verified 2026-05-15 on `redesign-v2.wenu-frontend.pages.dev` — HTTP 200 on home, /shop, /piercing, /hangers, /shipping, /contact, /local, /aftercare/, a PDP, search-index, sitemap, robots. **62** published products (count moved 64→62 as catalog cleanup depublished items).
- [x] **P3.6** Preview URL documented in `CURRENT_STATE.md` → Cloudflare Pages section + Ronda 4 delta.
- [ ] **P3.7** Do NOT attach apex domain. Stay on `*.pages.dev` until cutover decision.

Owner: human drives dashboards; Claude verifies; Codex makes any code changes if Pages build surfaces them.

## P4 — WooCommerce safety

- [ ] **P4.1** Verify `WC_CONSUMER_KEY` is read-only scoped (`read_products`) in WP admin → WooCommerce → Settings → Advanced → REST API.
- [ ] **P4.2** Reconcile catalog count discrepancy (build saw 64; memory says WC shows 104 vs 59 estimated). Owner: `wenu-producto`.
- [x] **P4.3** Premise was wrong. `src/lib/woo.ts` `fetchAllProducts()` already paginates correctly — `per_page=100` (WC max) in a `while` loop until the last short page. The build fetches **all** `status=publish` products (62 today); nothing is dropped by a single-call default. No change needed.
- [ ] **P4.4** Document the canonical product code scheme (WM-AMU, WM-AUT, WM-CLS) in `agent-control/CURRENT_STATE.md` once `wenu-producto` confirms.

## P5 — Forms

- [ ] **P5.1** Decide whether to add a real form provider (Brevo, Mailchimp, Klaviyo, custom Cloudflare Worker) or stay on mailto.
- [ ] **P5.2** If yes: pick one, get an account, store the endpoint in `.env` with `_PUBLIC_` prefix if client-callable, replace mailto with provider call.
- [ ] **P5.3** If no: write a one-line note in `DECISION_LOG.md` "mailto-only is the chosen final state for now" and move on.

## P6 — GitHub remote / Cloudflare Pages preview (operational ergonomics)

- [x] **P6.1** `gh` CLI installed — v2.92.0 at `/usr/local/bin/gh`.
- [ ] **P6.2** `gh auth login` — confirm gh is authenticated (push worked, so credentials exist somewhere).
- [x] **P6.3** Repo exists, `origin` set, `redesign-v2` pushed (= P3.2).
- [ ] **P6.4** Use the same gh token to wire Cloudflare Pages → GitHub auto-deploy.

(This overlaps with P3.2 — execute together.)

## P7 — Visual system polish

- [x] **P7.1** Audit visual consistency across the 23 pages in `src/pages/` and Aftercare. Done 2026-05-18:
  `docs/audit-visual-consistency-2026-05-18.md`.
- [x] **P7.2** Font stack confirmed — `package.json` ships **3** `@fontsource` families: DM Serif Display, Source Serif Pro, Inter Variable. **No Cinzel Decorative / Cormorant Garamond** (that list was stale; zero refs in `src/`). Self-hosted via `@fontsource`. *(Open perf item → P7.6.)*
- [x] **P7.3** Color tokens verified in `src/styles/tokens.css` — Obsidian `#080706`, Bone `#F2EDE4`, Sand `#D6C1A3`, Silver `#A8A39A`, Bronze `#8A6A43`, Ember `#C4935A` all present and match the brand palette.
- [ ] **P7.4** Decide on hero video / motion budget (Aftercare uses `.mp4`; full-site doesn't yet).
- [ ] **P7.5** Convert the 4 aftercare PNGs (~10.2 MB total) to WebP/AVIF, and extend `scripts/clean-images.mjs` + `scripts/gen-avif.mjs` to scan `public/aftercare/`, not just `public/img/`. *(opencode audit P0 — `reports/audit-opencode-perf-2026-05-15.md`)*
- [ ] **P7.6** Add `<link rel="preload">` for the 3 `@fontsource` families in `Base.astro`. *(opencode audit P1)*
- [x] **P7.7** Add explicit `width`/`height` to the ~13 `<img>` tags missing them (CLS fix); fix the `p/[slug].astro` LCP image (missing w/h + `loading`) and the `custom-orders` hero. Done 2026-05-18; the remaining real issue found in this lane was CSS class mismatch on archive cards, fixed and documented.
- [x] **P7.8** Fix `src/pages/sets.astro` — passes a string to `Base.astro`'s `preloadImage` prop, which expects an object → preload silently broken. Done before this pass per `PLAN-DE-AVANCE.md`.

## P8 — Production cutover (last)

- [ ] **P8.1** All P0–P7 checkmarked.
- [ ] **P8.2** Pages preview URL has been live and verified for at least 7 days.
- [ ] **P8.3** Forms decision (P5) is settled.
- [ ] **P8.4** Tunnel rotation (P0-C) is complete.
- [ ] **P8.5** Apex DNS cutover plan written and approved by human.
- [ ] **P8.6** Cutover window scheduled. Rollback path documented.
- [ ] **P8.7** Execute cutover. Monitor 24h. Confirm `wenumapuonline.com` serves the new site, all forms work, all products render, all assets load.
- [ ] **P8.8** Retire the cloudflared tunnel for apex + api routes (keep only for `wenuos` dev).

Owner: human only. Agents prepare and verify. The cutover button is yours.

## P9 — Metrics & Wallet (T9)

- [ ] **P9.1** Connect WooCommerce Orders API in `src/lib/woo.ts` (read-only `GET /orders` with status filter). Expose `getOrders()` next to `getProducts()`.
- [ ] **P9.2** Create a build-time or scheduled script that fetches order data and writes `reports/metrics-YYYY-MM-DD.json`.
- [ ] **P9.3** First manual seed: human exports Stripe or WooCommerce Analytics and pastes into `BUSINESS_METRICS.md`.
- [ ] **P9.4** Set up monthly recurring: agent reads the last 30 days of orders and updates the revenue snapshot.

Owner: OpenCode implements API reads; human seeds initial data.

## P10 — Marketing (T10)

- [ ] **P10.1** Audit current IG channel: follower count, post cadence, top-performing content.
- [ ] **P10.2** Draft Q3 2026 content calendar (June–August) based on product launch plan.
- [ ] **P10.3** Track wholesale outreach pipeline: B2B emails sent, responses, orders placed.
- [ ] **P10.4** Create `reports/marketing-dashboard-YYYY-MM-DD.md` template.

Owner: wenu-brand + OpenCode.

## P11 — Design (T11)

- [ ] **P11.1** Populate `06-social-templates/` with actual Canva/PSD templates (4 channels).
- [ ] **P11.2** Audit visual consistency across all 96 built pages + aftercare.
- [ ] **P11.3** Replace `PatternBand.astro` placeholder geometry with final SVG asset.
- [ ] **P11.4** IG story template batch: 5 story templates for product launches.

Owner: wenu-brand + visual agent. Human may need to create Canva assets.

- [ ] **P8.1** All P0–P3 checkmarked.
- [ ] **P8.2** Pages preview URL has been live and verified for at least 7 days.
- [ ] **P8.3** Forms decision (P5) is settled.
- [ ] **P8.4** Tunnel rotation (P0-C) is complete.
- [ ] **P8.5** Apex DNS cutover plan written and approved by human.
- [ ] **P8.6** Cutover window scheduled. Rollback path documented.
- [ ] **P8.7** Execute cutover. Monitor 24h. Confirm `wenumapuonline.com` serves the new site, all forms work, all products render, all assets load.
- [ ] **P8.8** Retire the cloudflared tunnel for apex + api routes (keep only for `wenuos` dev).

Owner: human only. Agents prepare and verify. The cutover button is yours.

---

## How to add a task

1. Pick the right priority bucket (P0–P8).
2. Append a new line `[ ] **PX.N** <one-sentence description>`.
3. If it depends on something, mark `[!]` until that thing resolves.
4. Don't reorder existing items unless the priority itself changed (and then log the change in `DECISION_LOG.md`).
