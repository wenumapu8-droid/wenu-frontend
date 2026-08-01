# Agent Capabilities & Permissions Report

Date: 2026-05-09
Repo: `~/wenu-frontend` (branch `redesign-v2`)
Scope: read-only audit of what this Claude session can and cannot do for the Wenu Mapu ecosystem. No edits, deploys, commits, or DNS changes were performed.

---

## Executive summary

- The agent can **read everything** in `~/wenu-frontend` and the wider `~/wenu-*` ecosystem, run `npm run build`, take screenshots, and drive a browser through the Chrome MCP.
- The agent **cannot push to GitHub** today: `wenu-frontend` has no git remote, and the `gh` CLI is not installed.
- The agent **cannot deploy to Cloudflare** directly: `wrangler` is not installed and no Cloudflare API token is on disk. Cloudflare actions must go through the dashboard, optionally guided via the Chrome MCP with the human driving destructive clicks.
- WooCommerce credentials exist locally and are gitignored; they are used **read-only at build time** and the agent never prints them.
- Forms have already been migrated from placeholder Formspree endpoints to mailto fallbacks.
- **Critical:** the running `cloudflared` daemon was launched with its tunnel `--token` as a command-line argument, which is visible in the process list to any local user/process. This token must be rotated and moved to a config-file or keychain credential.
- Seven Claude subagents are defined and usable. There is no dedicated "frontend coder" or "deployment" subagent — that role currently belongs to the main session.

---

## Phase 1 — Environment identity

| Field | Value |
|---|---|
| Working dir | `/Users/user1` (NOT inside any repo) |
| OS | Darwin 21.6.0, x86_64 (macOS 12.6) |
| Shell | zsh |
| Node | v24.14.1 |
| npm | 11.11.0 |
| pnpm / yarn / bun | not installed |
| git | /usr/bin/git 2.37.1 (Apple Git-137.1) |
| Global git user.name / email | both empty (commits would use repo-local config or fail) |

The auto-memory `MEMORY.md` (with project context) is loaded into the session.

---

## Phase 2 — Local project structure

The home directory is the workspace root. Wenu projects:

| Project | Path | Git | Branch | Remote | Role |
|---|---|---|---|---|---|
| **wenu-frontend** | `~/wenu-frontend` | YES | `redesign-v2` | **none** | Astro 6 SSG, public site for `wenumapuonline.com`. WooCommerce read at build time. Has `dist/`, `public/aftercare/`, `cloudflare-pages-deploy.md`. |
| wenu-platform | `~/wenu-platform` | NO | — | — | Postgres + Prisma backend (running on `localhost:5432`). |
| wenu-agent-hub | `~/wenu-agent-hub` | YES | `main` | (not checked) | Telegram bot + orchestrator. Has `.env.bak`, `.env.save`, `.env.backup-20260417` (cleanup needed). |
| wenuos-system | `~/wenuos-system` | NO | — | — | Cloudflare Tunnel + launchd ops. |
| wenumapu-system | `~/wenumapu-system` | NO | — | — | Other ops. |
| wenumapu_audit | `~/wenumapu_audit` | NO | — | — | Audits. |
| WenuOS | `~/WenuOS` | NO | — | — | Older infra docs. |

`wenu-frontend` layout:

- `src/pages/` — 23 Astro pages including `/p/[slug].astro` (product detail), `/shop`, `/care-guide`. `/aftercare/` is in `public/`.
- `src/lib/woo.ts` — single source for WooCommerce REST.
- `src/components/` — 11 Astro components including `Newsletter.astro`.
- `dist/` — last successful build; 82 pages, 64 product pages.
- `public/aftercare/` — verified (200 OK, video + PDF + visual system intact).
- Reports already on disk: `aftercare-readiness-report.md`, `cloudflare-pages-deploy.md`, `deployment-readiness-report.md`, `full-site-phase1-report.md`, `morning-verification-report.md`, `redesign-v2-night-report.md`.

Latest 5 commits on `redesign-v2` (local only, no remote):

```
aa7714f docs: phase 1 access audit + manual approval checklist
be1eab6 docs: pin node 24 + cloudflare pages preview docs + phase 1 report
6ae5958 fix: clarify product purchase flow — same-tab /cart/?add-to-cart=
d1d0dee fix: add /piercing /hangers /shipping standalone routes
7563979 fix: remove placeholder form endpoints, add mailto fallback
```

**This is the full-site repo, not aftercare-only.** Aftercare is a subset of `public/`.

---

## Phase 3 — Credentials & secrets audit (safe mode — values never printed)

`.env` files present (existence only):

| File | Status | Key names found |
|---|---|---|
| `wenu-frontend/.env` | present, gitignored | `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` |
| `wenu-frontend/.env.example` | present | `WC_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` |
| `wenu-agent-hub/.env` + `.env.example` + `.env.bak` + `.env.backup-*` + `.env.save` + `.env.local-template` | **multiple stale copies** | Telegram, Woo, Notion, OpenAI, Anthropic, Canva, Obsidian, internal webhook tokens, etc. |
| `wenu-platform/.env` | present | `DATABASE_URL`, `DIRECTUS_*`, `SMTP_*`, `NOWPAYMENTS_*`, `MERCADOPAGO_*`, `WENU_*_TOKEN`, `WOO_WEBHOOK_SECRET` |
| `wenumapu-system/.env`, `wenumapu_audit/.env`, `wenuos-system/scripts/n8n/.env` | present | not enumerated to avoid noise |

No secret value was printed. `.env` is in `wenu-frontend/.gitignore`. `wenu-agent-hub` has multiple `.env.*` backups not gitignored — same hallazgo flagged 2026-05-04, still unresolved.

**Process-list leak (critical):** `ps -ax` shows `cloudflared tunnel run --token <JWT>` in plaintext. Any local process can read it. Rotate and move to a config-file credential.

---

## Phase 4 — Cloudflare capability

| Capability | State |
|---|---|
| `cloudflared` binary | installed, v2026.3.0 (`/usr/local/bin/cloudflared`) |
| Tunnel running | YES (under launchd `homebrew.mxcl.cloudflared`) |
| Tunnel config | `/usr/local/etc/cloudflared/config.yml` (only `logDirectory`); credentials are in the `--token` arg (see leak above). No `~/.cloudflared/` dir. |
| Wrangler CLI | NOT installed |
| Wrangler auth | unknown (no install) |
| Cloudflare account API token | NOT present anywhere scanned |
| Cloudflare DNS / Pages / Workers from CLI | NOT possible right now |
| Custom-domain management | NOT possible right now |
| Production site hosting today | depends on the local Mac + cloudflared tunnel |

**Conclusion:** the agent cannot deploy to Cloudflare Pages, change DNS, manage Workers, or list Pages projects from the CLI. Required path forward is either (a) `wrangler` installed + authenticated, or (b) the human performs the action via the dashboard while Claude guides via the Chrome MCP.

---

## Phase 5 — Browser automation

| Path | State | Notes |
|---|---|---|
| `claude-in-chrome` MCP | available (tools `mcp__Claude_in_Chrome__*` loaded) | DOM-aware, fast. Best path for the Cloudflare dashboard. Browsers themselves are tier "read" under computer-use — clicks/typing on Safari/Chrome/Firefox are blocked at the OS level, so the MCP is the right tool. |
| Native `computer-use` | available, allowlist empty until `request_access` is called | Useful for native apps (Finder, Notes, etc.). Browsers are read-tier; don't click web pages with this. |
| Playwright | binary not installed; `mcp__playwright__*` server still connecting |
| `agent-browser` MCP | server still connecting |
| Existing logged-in browser session | reachable through `claude-in-chrome` if the tab stays open and the extension is connected |

The agent can:

- Open the Cloudflare dashboard in Chrome and walk you visually through the steps.
- Read DOM and click buttons via the extension (with permission prompts).
- Guide step-by-step manually if preferred.

The agent cannot:

- Bypass MFA/CAPTCHA.
- Sign in on your behalf without explicit confirmation.
- Click destructive buttons (delete tunnel, change DNS, transfer domain) without explicit per-action approval.

---

## Phase 6 — GitHub capability

| Capability | State |
|---|---|
| `git` | installed |
| `wenu-frontend` git remote | **none configured** |
| `wenu-agent-hub` git remote | not checked (irrelevant to frontend deploy) |
| `gh` CLI | **not installed** (`gh: command not found`) |
| `gh auth status` | n/a |
| Push capability today | impossible — no remote set on `wenu-frontend` and no `gh` |
| Create branches locally | YES |
| Create commits locally | YES (with approval) |
| Open PRs | NO |

To enable Cloudflare Pages → GitHub → auto-deploy, somebody needs to (a) create a GitHub repo, (b) add it as `origin`, (c) push `redesign-v2`. That is a deliberate decision — the agent will not do it without explicit instruction.

---

## Phase 7 — WooCommerce capability

| Capability | State |
|---|---|
| Live WC API base | `https://www.wenumapuonline.com/wp-json/wc/v3` |
| Credentials in repo | `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` in `wenu-frontend/.env` (gitignored ✅) |
| Read scope | per `src/lib/woo.ts` only `GET /products`, `/products/<id>`, `/products/categories` are called. Code does not write. Whether the keys themselves are read-only on the WC server side is a setting in WooCommerce that cannot be verified without WC admin access. |
| Build behavior | hardened (`getProducts`/`getProduct`/`getCategories` `throw` on errors; `postbuild` script asserts ≥20 product dirs unless `ALLOW_EMPTY_PRODUCTS=true`). |
| Last successful build | 64 products, 82 pages. |
| Risk | Catalog count was 64 from build but `MEMORY.md` notes WC currently shows 104 vs 59 estimated — there is an inventory truth-source mismatch open from 2026-05-04. |

The agent can:

- Run `npm run build` to validate WC connectivity end-to-end.
- Read product data via the build pipeline.
- Inspect `src/lib/woo.ts` and propose changes (e.g., paginate beyond `per_page=50`).

The agent will not:

- Print the WC keys.
- Call WC write endpoints.
- Modify products on the live store.

---

## Phase 8 — Forms / CRM capability

Already fixed in commit `7563979` on `redesign-v2`. Current state:

| Surface | Endpoint | State |
|---|---|---|
| Newsletter (`Newsletter.astro`) | `mailto:contact@wenumapuonline.com?subject=Join the ritual` | working fallback |
| Custom Orders (`custom-orders.astro`) | mailto fallback panel with bulleted field list | working fallback |
| Contact (`contact.astro`) | mailto link | working fallback |
| Formspree placeholders | removed | none remaining |
| Mailchimp / Brevo / Klaviyo / WooCommerce CRM | no credentials in any scanned `.env` | not connected |

The site can ship today with mailto-only. A real provider (Brevo/Mailchimp) is a separate decision later.

---

## Phase 9 — Obsidian / brain / subagents

Vault: `/Users/user1/Obsidian/WenuAgent/` (also `~/.obsidian-vaults/wenumapu` and `~/.obsidian-vaults/wenuos`).
Memory: `/Users/user1/.claude/projects/-Users-user1/memory/` with `MEMORY.md` index.

Available subagents (defined in `~/.claude/agents/`):

| Subagent | Model | Best for |
|---|---|---|
| **wenu-orchestrator** | opus | Multi-domain tasks; entry point. Has `Agent`, `TodoWrite`, `WebFetch`, `WebSearch`. |
| **wenuos-ops** | sonnet | Cloudflare Tunnel, SSL, launchd services, dominio, bots, auto-init, logs. |
| **wenu-producto** | sonnet | WooCommerce catalog, product codes (WM-*), inventory consistency. |
| **wenu-brand** | sonnet | Identity, IG content, copy, Canva, visual rules. |
| **segundo-cerebro** | sonnet | Obsidian PKM librarian — finds, dedupes, MOCs, links. |
| **daily-synth** | sonnet | Daily/weekly synthesis from `daily/`, `informe-hoy.md`, telegram-notes. |
| **chatgpt-importer** | sonnet | Import ChatGPT export ZIPs into the vault. |

No conflicts in scope. There is no dedicated "frontend-coder" or "deployment" subagent — that role currently falls to the main session (or `wenu-orchestrator` delegating).

---

## Phase 10 — Permission matrix

| Area | Inspect | Edit local | Deploy | Push | Needs approval | Risk | Notes |
|---|:-:|:-:|:-:|:-:|:-:|---|---|
| Local files in `wenu-frontend` | ✅ | with approval | — | — | YES for any edit | low | Edit, not Write, when possible. |
| Git commits (local) | ✅ | with approval | — | — | YES per commit | low | No remote, so commits are local-only by definition. |
| Git push | ❌ | — | — | ❌ | n/a | n/a | No remote on `wenu-frontend`. Adding a remote is itself a decision needing approval. |
| GitHub PR | ❌ | — | — | ❌ | n/a | n/a | `gh` not installed, no remote. |
| Cloudflare Pages preview | ❌ direct CLI | — | ❌ direct | — | YES, via dashboard | medium | Doable through Chrome MCP with human watching. |
| Cloudflare Pages production / custom domain | ❌ | — | ❌ | — | YES, manual only | **HIGH** | Never automated. Apex stays on legacy WP until cutover. |
| Cloudflare DNS | ❌ | — | — | — | YES, manual only | **HIGH** | Read-only via dashboard, never change. |
| Cloudflare Tunnel (production) | read | — | — | — | YES, manual only | **HIGH** | Currently load-bearing for prod. Don't touch. |
| WooCommerce read (build) | ✅ via build | — | — | — | NO (read only) | low | `npm run build` only. |
| WooCommerce keys / API | redacted | — | — | — | YES to use new keys | medium | Never printed. |
| WooCommerce products (write) | ❌ | ❌ | — | — | YES, manual | **HIGH** | Code never writes. |
| Forms / mailto | ✅ | with approval | — | — | YES per change | low | Already mailto-only. |
| Obsidian memory | ✅ | with approval | — | — | YES per note | low | Could delegate to `segundo-cerebro`. |
| n8n workflows | ✅ logs only | — | — | — | YES | medium | n8n binary not on PATH; `pm2` shows agent-hub processes only. |
| Browser automation (read) | ✅ | n/a | — | — | NO | low | Inspection only. |
| Browser automation (clicks on web) | ✅ via Chrome MCP | — | — | — | YES per destructive click | medium | Tier-"read" enforces caution on browsers. |

---

## Phase 11 — Recommended operating model

Roles (where to send what):

| Task type | Owner |
|---|---|
| Frontend code changes (`wenu-frontend/src/**`) | main session (this Claude). |
| Audit / read-only investigation | main session, or `Explore` subagent for big sweeps. |
| Cloudflare Pages / DNS / tunnel ops | guided manual via Chrome MCP, human driving destructive clicks. `wenuos-ops` subagent for diagnosis only. |
| WooCommerce catalog edits | manual via WP admin. `wenu-producto` for proposing changes. |
| Visual / content / copy | `wenu-brand` subagent. |
| Obsidian / memory consolidation | `segundo-cerebro`. |
| Daily / weekly synthesis | `daily-synth`. |
| Multi-domain / unclear scope | `wenu-orchestrator`. |

What the agent will do without asking:

- Read files, run `npm run build` locally, parse logs, summarize state.
- Take screenshots and read browser DOM for diagnosis.

What the agent will always ask first:

- Any file edit, any commit.
- Any browser click that mutates remote state.
- Anything that needs `wrangler`, `gh`, or a new global tool installed.
- Adding a git remote / first push to GitHub.
- Any change to Cloudflare DNS, tunnel, Pages production domain, or WC products.
- Any download from email/web.

What must never be automated:

- Production DNS cutover.
- WooCommerce product writes.
- Tunnel deletion or cloudflared service stop.
- Sharing or printing secrets.
- Sending emails / posting to social on the user's behalf.

---

## Critical immediate actions (in priority order)

1. **Rotate the cloudflared tunnel token** (it is exposed in the process list right now). Move credentials to a config file, then `launchctl kickstart -k system/homebrew.mxcl.cloudflared`. (`wenuos-ops` can plan this; the human executes.)
2. **Decide GitHub repo strategy for `wenu-frontend`** — add a remote and push `redesign-v2`, or stay local-only. Cloudflare Pages auto-deploy needs a remote.
3. **Clean `wenu-agent-hub` env backup files** (`.env.bak`, `.env.save`, `.env.backup-20260417`) — open finding from 2026-05-04. They are not gitignored.
4. **Decide deploy scope** (per `deployment-readiness-report.md`): Option A (full-site preview to `*.pages.dev`), Option B (aftercare-only public), or hold.

---

## Verification

All read-only:

```bash
git -C ~/wenu-frontend status --short --branch
git -C ~/wenu-frontend remote -v        # expect empty
git -C ~/wenu-frontend log --oneline -5
node -v && npm -v                        # expect 24.14.1 / 11.11.0
which gh wrangler playwright             # expect not found
ps -ax | grep cloudflared | grep -v grep # expect tunnel running
ls ~/.claude/agents                      # expect 7 agents
```

---

## Immediate next safe task

The single most valuable, lowest-risk next move is **action #1: rotate the cloudflared tunnel token and remove the `--token` argument from the launchd invocation**. Everything else (GitHub remote decision, Pages deploy, env cleanup) can wait. The token leak is live until rotated.
