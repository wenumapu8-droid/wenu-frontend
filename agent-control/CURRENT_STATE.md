# Current State — 2026-05-09

Snapshot of the Wenu Mapu technical state. Agents must read this before any technical work. If the snapshot is older than 7 days, run a fresh audit before acting.

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
