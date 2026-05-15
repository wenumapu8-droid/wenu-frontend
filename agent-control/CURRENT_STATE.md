# Current State

Snapshot of the Wenu Mapu technical state. Agents must read this before any technical work. If the snapshot is older than 7 days, run a fresh audit before acting.

---

## Delta — 2026-05-15

What changed since the 2026-05-09 baseline below. Read this first.

### Resolved since 2026-05-09

| Item | Old state | New state |
|---|---|---|
| `wenu-frontend` git remote | None configured | **`origin` → `https://github.com/wenumapu8-droid/wenu-frontend.git`** — P3.2 done |
| Branch tracking | local-only | `redesign-v2` tracks `origin/redesign-v2` |

### New facts (2026-05-15)

- **Node session mismatch:** active shell is `v20.18.3`. `package.json engines` requires `>=22.12.0` and `.nvmrc` pins to `24.14.1`. Build will fail until `nvm use` runs.
- **28 uncommitted modifications** on `redesign-v2`. Mostly `src/pages/*` (amulets, ear-cuffs, hangers, piercing, material/*, collection/*, p/[slug], shop, index, journal/[slug]), plus `src/lib/woo.ts`, `src/i18n/en.json`, `public/_redirects`, `.env.example`, `src/content/journal/*`, `src/components/visual/Spec.astro`. Owner must decide: commit, discard, or continue editing before new work starts.
- **Untracked new dirs:** `.runtime/`, `drafts/`, `scripts/cleanup/`, and `reports/` with 8 new artifacts (B2B emails batch 1, IG day 1, suggested prices CSV for 23 products, catalog cleanup status, copy bank for 10 depublished products, B2B lookbook v1 PDF + philosophy, photo-as-product cleanup CSV).
- **Existing infrastructure confirmed (do not duplicate):**
  - `/agent-control/` 9-file control plane is canonical (this folder).
  - `~/.claude/agents/` has 7 subagents installed (wenu-orchestrator, wenu-brand, wenu-producto, wenuos-ops, segundo-cerebro, daily-synth, chatgpt-importer).
  - `~/.claude/plans/` has 26 plans including `parallel-workstream-no-cryptic-zebra.md`.
  - `~/Obsidian/WenuAgent/brand/` has 8 sub-folders (01-identity → 08-copy-bank).
  - Root has 52 markdown reports/plans including `codex-task-1..6` prompts ready to execute.

### Cleanup completed 2026-05-15

- Moved 6 duplicate documentation files (created earlier this session in `/docs/` and `/prompts/`) to `/Users/user1/wenu-frontend-backup/2026-05-15-duplicate-docs/`. They duplicated `agent-control/CURRENT_STATE.md`, `AGENT_CONTROL_CENTER.md`, `DECISION_LOG.md`, and `TASK_QUEUE.md`. Reversible: `mv` back into repo if needed.
- `/docs/` now contains only the legitimate `handoffs/` and `snippets/` subfolders from commit `f0966cf`.

### Agent register — OpenCode (opencode CLI) integrated

**Track:** T1 (audit/plan) + T2 (code edit) — flexible según tarea.
**Status:** Active. Conectado desde terminal, attached al workspace `/Users/user1/wenu-frontend`.
**Capabilities:** Read/write filesystem, bash, search, multi-agent orchestration, web fetch.
**Permissions:** Same as Claude Code (T1) + Codex/OpenCode (T2) per `PERMISSIONS_MATRIX.md`.
**Nota:** Invocar via `PROMPTS_FOR_AGENTS.md` Prompt #1 (audit) o Prompt #2 (implementation). Primera integración formal el 2026-05-15.

### Real gaps identified (no work done yet)

1. `~/Obsidian/WenuAgent/brand/06-social-templates/{instagram-post,instagram-story,pinterest,tiktok}/` — all four folders are empty.
2. `PROMPTS_FOR_AGENTS.md` lacks templates for: interaction-systems engineering, Figma Make translation, brutal QA audit, and content-creator (Instagram/social batch).
3. Parallel-workstream pattern is documented in `~/.claude/plans/parallel-workstream-no-cryptic-zebra.md` but not formalised as a runtime workflow in `/agent-control/`.

### Correction + new work — 2026-05-15 (tarde, cadena multi-agente)

Gaps 1-2 above are RESOLVED — closed by commits made after this snapshot's 12:49 timestamp:
- `PROMPTS_FOR_AGENTS.md` has all 10 templates complete (7-10 written ~13:06).
- The 4 `06-social-templates/*/TEMPLATE.md` files all exist with substantial content.
Gap 3 still open.

New work this session (multi-agent chain T1/T4/T5 + recon):
- `reports/catalog-reconciliation-2026-05-15.md` created. Canonical count: **50 live products**,
  0 missing price/photo among published. 7 dup clusters still pending human approval.
- Wording audit: `Petrolia`/`Lucky7`/`showroom` = 0 matches (already clean). Remaining items
  need OWNER DECISION, not autonomous edit:
  - `src/pages/piercing.astro` references "Truth Tattoo" + "Nicolás Ortega" + a WhatsApp
    booking link. This is a business-model question — is the piercing partnership real?
  - Department email aliases (`orders@/custom@/support@/aftercare@`) in `src/i18n/en.json`
    and `wholesale@` in `wholesale.astro` — confirm these mailboxes are live.
  - `src/pages/care-guide.astro` also has `aftercare@` but is OFF-LIMITS per DO_NOT_TOUCH.
- **NocoDB inventory is NOT greenfield.** It runs as a loose Docker container on
  `localhost:8080` (no compose file), SQLite backend, base `pbmsibdovaalqw4`. Two tables:
  "Piezas" (`m5s3jnm72tzhk9g`, **89 real pieces** — 84 RAW, 5 SOLD OUT) and "Fotos"
  (`m68mef57yfy4uwc`). Full API v2 client already exists at `~/wenu-platform/src/nocodb.mjs`
  (985 lines, auto-SKU, supplier dedup). Recommended next: version a `docker-compose.yml`
  for NocoDB, evaluate SQLite→Postgres migration.
- **SECURITY:** `~/wenu-platform/SISTEMA-CLASIFICADOR.md` lines 62-69 contain a plaintext
  `NOCODB_TOKEN` (`nc_pat_...`). Move to `.env` and rotate.

---

## WordPress / WooCommerce (live store)

| Field | Value |
|---|---|
| URL | `https://wenumapuonline.com` |
| State | **Frozen.** Apex returns HTTP 502 through the Cloudflare Tunnel because the tunnel routes apex → `localhost:4321` (Astro dev), and the local Astro server isn't running. |
| WC REST | `https://www.wenumapuonline.com/wp-json/wc/v3` — reachable from build pipeline (last `npm run build` fetched 64 products, 82 pages). |
| Catalog count truth | **Inconsistent**: build returned 64, memory note from 2026-05-04 says WC shows 104 vs 59 estimated. Reconciliation owed by `wenu-producto`. |
| Write access | None from agents. WP admin only. |

## Astro `wenu-frontend` (redesign-v2)

| Field | Value |
|---|---|
| Repo | `~/wenu-frontend` |
| Branch | `redesign-v2` |
| Remote | **None configured.** Local-only; single point of failure on this Mac. |
| Untracked files | `aftercare-readiness-report.md` (intentional report, can be staged when commit time comes) |
| Last build | green; Node 24.14.1; 82 pages, 64 product pages |
| Build safety | `getProducts` etc. throw on error; `postbuild` script asserts ≥20 product dirs unless `ALLOW_EMPTY_PRODUCTS=true` |
| Forms | mailto fallbacks (commit `7563979`); Formspree placeholders removed |
| WC creds | `WC_CONSUMER_KEY` / `WC_CONSUMER_SECRET` in `.env` (gitignored) |
| Engine | Astro 6.x SSG, output: static, build dir: `dist/` |

## Aftercare

| Field | Value |
|---|---|
| State | **Ready.** `public/aftercare/index.html` 200 OK, video + PDF + visual system intact. Verified in `aftercare-readiness-report.md`. |
| Asset paths | `public/aftercare/wm-header.mp4` (2.2 MB), `public/downloads/wenu-mapu-aftercare-guide.pdf` (80 KB) |
| Hosting target | Cloudflare Pages preview (separate project from full-site). Plan in `cloudflare-pages-deploy.md`. |
| Risk | None known. Do not modify unless task explicitly says so. |

## Cloudflare Tunnel

| Field | Value |
|---|---|
| Tunnel name | `Wenuos` |
| Tunnel UUID | `fd7eb657-88ad-4f01-9d4b-9431ceef445b` |
| Type | remotely-managed (cloudflared, `--token`) |
| Status | HEALTHY, 2 days uptime |
| Connector | one, on `User1s-iMac`, version 2026.3.0, sjc data center |
| Plist | `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist`, root:wheel, **mode `-rw-------` (Step A done)** |
| Brew duplicate | already stopped (Step B done) |
| Routes (Published application routes) | apex `wenumapuonline.com` → `localhost:4321`, `wenuos.wenumapuonline.com` → `localhost:3333`, `api.wenumapuonline.com` → `localhost:3335`, catch-all `http_status:404` |
| Cloudflare Access | confirmed gating `wenuos.wenumapuonline.com` via `wenuos.cloudflareaccess.com` Google OAuth |
| **Active risk** | the JWT `--token` was exposed in chat transcript on 2026-05-09. Treated as compromised. Rotation deferred behind Pages cutover per user decision. |

## Cloudflare Pages

| Field | Value |
|---|---|
| State | **Not yet wired.** No Pages project exists. |
| Plan | `cloudflare-pages-deploy.md` + `deployment-readiness-report.md` |
| Recommended first step | Option A: full-site preview deploy to `*.pages.dev` from `redesign-v2` branch |
| Blocker | `wenu-frontend` has no git remote → cannot connect Pages → GitHub auto-deploy. Direct upload via wrangler also blocked: wrangler not installed. |
| Production target | NOT yet `wenumapuonline.com` apex. Stay on `*.pages.dev` until apex cutover decision is explicitly made by human. |

## Git / GitHub

| Field | Value |
|---|---|
| `wenu-frontend` remote | **none** |
| `wenu-agent-hub` remote | exists (not enumerated; not relevant to current scope) |
| `gh` CLI | **not installed** |
| Push capability | impossible from this Mac today |
| `git config user.name/email` | empty globally; commits use repo-local config or fail |

## Environments (`.env*` files — counts only, no values)

| Project | `.env` present | gitignored | backups present? |
|---|---|---|---|
| `wenu-frontend` | yes (WC keys) | yes | none |
| `wenu-agent-hub` | yes (Telegram, OpenAI, Anthropic, Notion, Canva, etc.) | yes | **5 stale backups, NOT gitignored** (`.env.bak`, `.env.save`, `.env.backup-*`, `.env.local-template`) |
| `wenu-platform` | yes (Postgres, MercadoPago, NowPayments, SMTP) | (not a git repo) | none |
| `wenumapu-system`, `wenumapu_audit`, `wenuos-system/scripts/n8n` | yes | (not git repos) | not enumerated |
| `~/.continue/.env` | yes | mode 600 ✅ | n/a |

Git history scan: **no `.env*` file has ever been committed** in either `wenu-frontend` or `wenu-agent-hub`. Future risk only.

## Local services (verified via `lsof` / `ps`)

| Port | Service |
|---|---|
| 5432 | Postgres (wenu-platform) |
| 3333 | Node (one of the wenu services — used by Wenuos tunnel route 2) |
| 3334 | Node |
| 3335 | Node (used by api.wenumapuonline.com tunnel route 3) |
| 3390 | Node |
| 4321 | (intermittent — Astro dev when `npm run dev` is up; tunnel route 1 expects this) |
| 8080 | Docker / com.docker |

`pm2` is managing `wenu-agent-hub` processes. `cloudflared` daemon pid varies, runs under `com.cloudflare.cloudflared` LaunchDaemon.

## Known blockers

- **Tunnel rotation strategy** — open. Path C (locally-managed migration) planned but deferred; needs Pages cutover first to reduce blast radius.
- **`wenu-frontend` GitHub remote** — open. Decision needed before Cloudflare Pages auto-deploy.
- **WC catalog count mismatch** — open since 2026-05-04. Owner: `wenu-producto`.
- **Apex `wenumapuonline.com` 502** — known consequence of tunnel routing apex to dev. Decision needed: is the live store paused, or should apex move off the tunnel?

## Known working workflows

- `npm run build` (Node 24.14.1) — green end-to-end including WC fetch + product page generation + sitemap.
- `npm run preview` — local static serve of `dist/` for verification.
- `cloudflared` daemon — auto-starts at boot via `com.cloudflare.cloudflared` LaunchDaemon, KeepAlive on non-zero exit.
- Subagent invocation through `Agent` tool (7 subagents loaded).
- Browser automation through `claude-in-chrome` MCP (extension-driven, DOM-aware).
- Read-only audits via Bash + redacted output filters.
