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
- [ ] **G.** harden `.gitignore` defensively in `wenu-frontend` (`.env.local`, `.env.bak`, `*.pem`, etc.) *(plan: `security-cleanup-plan.md` Step G)*

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

- [?] **P3.1** Decide: GitHub remote for `wenu-frontend` — yes (auto-deploy via Pages) or no (direct upload)?
- [ ] **P3.2** If P3.1 = yes: create GitHub repo, add remote, push `redesign-v2`. Repo private. Branch protection on `main`.
- [ ] **P3.3** Create Cloudflare Pages project `wenu-mapu-redesign`, framework Astro, build `npm run build`, output `dist`, root `/`. Production branch = `redesign-v2`.
- [ ] **P3.4** Add Pages env vars (encrypted): `NODE_VERSION=24`, `WC_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`. Human pastes; agents never see.
- [ ] **P3.5** Trigger first preview build. Verify 82-page output on `*.pages.dev`. Verify 64 product pages and `/aftercare/` both 200.
- [ ] **P3.6** Document the preview URL in `CURRENT_STATE.md`.
- [ ] **P3.7** Do NOT attach apex domain. Stay on `*.pages.dev` until cutover decision.

Owner: human drives dashboards; Claude verifies; Codex makes any code changes if Pages build surfaces them.

## P4 — WooCommerce safety

- [ ] **P4.1** Verify `WC_CONSUMER_KEY` is read-only scoped (`read_products`) in WP admin → WooCommerce → Settings → Advanced → REST API.
- [ ] **P4.2** Reconcile catalog count discrepancy (build saw 64; memory says WC shows 104 vs 59 estimated). Owner: `wenu-producto`.
- [ ] **P4.3** Decide: keep `getProducts` `per_page=50` paginated up, or hard cap. Today the build catches 64 products by accident of single-call default.
- [ ] **P4.4** Document the canonical product code scheme (WM-AMU, WM-AUT, WM-CLS) in `agent-control/CURRENT_STATE.md` once `wenu-producto` confirms.

## P5 — Forms

- [ ] **P5.1** Decide whether to add a real form provider (Brevo, Mailchimp, Klaviyo, custom Cloudflare Worker) or stay on mailto.
- [ ] **P5.2** If yes: pick one, get an account, store the endpoint in `.env` with `_PUBLIC_` prefix if client-callable, replace mailto with provider call.
- [ ] **P5.3** If no: write a one-line note in `DECISION_LOG.md` "mailto-only is the chosen final state for now" and move on.

## P6 — GitHub remote / Cloudflare Pages preview (operational ergonomics)

- [ ] **P6.1** Install `gh` CLI: `brew install gh`. Human approves.
- [ ] **P6.2** `gh auth login` — human authenticates in browser; token stored in macOS Keychain.
- [ ] **P6.3** `gh repo create` for `wenu-frontend` (private). Add `origin`. Push `redesign-v2`.
- [ ] **P6.4** Use the same gh token to wire Cloudflare Pages → GitHub auto-deploy.

(This overlaps with P3.2 — execute together.)

## P7 — Visual system polish

- [ ] **P7.1** Audit visual consistency across the 23 pages in `src/pages/` and Aftercare. Owner: `wenu-brand`.
- [ ] **P7.2** Confirm fonts (Cinzel Decorative, Cormorant Garamond, DM Serif Display, Source Serif Pro, Inter Variable) are correctly self-hosted (`@fontsource-*` packages already in deps).
- [ ] **P7.3** Confirm color tokens match brand system (`--bronze`, `--wm-*`, etc.) per `~/Obsidian/WenuAgent/brand/color-palette.md`.
- [ ] **P7.4** Decide on hero video / motion budget (Aftercare uses `.mp4`; full-site doesn't yet).

## P8 — Production cutover (last)

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
