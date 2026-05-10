# Permissions Matrix

What an agent can do without asking, what needs approval, what's prohibited. This is the operational form of `agent-capabilities-and-permissions-report.md` — see that file for the full audit.

Legend:
- ✅ allowed without prompting
- ⚠️ allowed only with explicit per-action approval
- ❌ never allowed (regardless of approval)
- — not applicable

---

## File system

| Area | Inspect | Edit | Create | Delete | Notes |
|---|:-:|:-:|:-:|:-:|---|
| `~/wenu-frontend/src/**` | ✅ | ⚠️ | ⚠️ | ⚠️ | Edits prefer `Edit` over `Write` for traceability. |
| `~/wenu-frontend/public/aftercare/**` | ✅ | ❌ | ❌ | ❌ | See `DO_NOT_TOUCH.md` §4. |
| `~/wenu-frontend/dist/**` | ✅ | — | — | — | Build output. Don't edit; rebuild via `npm run build`. |
| `~/wenu-frontend/agent-control/**` | ✅ | ⚠️ | ⚠️ | ⚠️ | Each file has an assigned author per `AGENT_ROLES.md`. |
| `~/wenu-frontend/*.md` (reports) | ✅ | ⚠️ | ⚠️ | ❌ | Reports are append-only; new findings → new file. |
| `~/wenu-agent-hub/**` | ✅ | ⚠️ | ⚠️ | ⚠️ | Telegram bot, orchestrator. Has stale `.env.*` backups (see TASK_QUEUE P0). |
| `~/wenu-platform/**` | ✅ | ⚠️ | ⚠️ | ⚠️ | Postgres + Prisma. Not a git repo. |
| `~/Obsidian/WenuAgent/**` | ✅ | ⚠️ | ⚠️ | ❌ | Edits go through `segundo-cerebro` subagent or human. |
| `~/.claude/agents/**` | ✅ | ❌ | ❌ | ❌ | Subagent definitions; change only with explicit approval. |
| `.env*` files (any project) | "key names only" | ❌ | ❌ | ❌ | Read with `awk -F= '/^[A-Z_]+=/{print $1}'`. Never values. |
| `/Library/LaunchDaemons/**` | ✅ (with redaction) | ❌ (sudo required → human) | ❌ | ❌ | Plist for cloudflared lives here. |

## Local execution

| Action | Permission |
|---|---|
| `npm run build`, `npm run preview`, `npm run dev` | ✅ |
| `git status`, `git log`, `git diff` (read) | ✅ |
| `git add`, `git commit` | ⚠️ per-commit |
| `git push` | ⚠️ explicit (also requires remote, which doesn't exist for `wenu-frontend`) |
| `sudo <anything>` | ❌ — agent passes the command to human, never executes |
| `rm`, `mv`, `cp` (destructive form) | ⚠️ per-target |
| `rm -rf <anything>` | ❌ |
| `chmod`, `chown` | ⚠️ explicit; if `sudo` needed → human |
| `launchctl bootout`, `launchctl bootstrap` | ❌ (sudo) |
| `brew services start/stop/restart` | ⚠️ explicit |
| `pm2 ...` | ⚠️ explicit |

## Cloudflare

| Capability | State today | Permission |
|---|---|---|
| `cloudflared` binary | installed v2026.3.0 | read-only inspection ✅ |
| `cloudflared tunnel run --token` (the daemon) | running under root LaunchDaemon | ❌ never modify |
| `wrangler` CLI | NOT installed | install ⚠️ explicit |
| Cloudflare API token on disk | none | create ⚠️ via dashboard, store mode 600 |
| Cloudflare dashboard | accessible via Chrome MCP after human signs in | navigation ✅, destructive clicks ⚠️ |
| Cloudflare DNS records | unchanged from project start | view ⚠️, edit ❌ |
| Cloudflare Tunnel routes (3 hostnames) | configured | view ⚠️, modify ❌ |
| Cloudflare Pages projects | none yet | create ⚠️ via dashboard |
| Cloudflare Access policies | gating `wenuos.wenumapuonline.com` | view ⚠️, edit ❌ |

Bottom line: agents drive the dashboard via Chrome MCP only as a navigator. Humans click anything that changes state.

## WooCommerce

| Capability | State | Permission |
|---|---|---|
| WC REST keys (`WC_CONSUMER_KEY`/`SECRET`) | in `wenu-frontend/.env`, gitignored | use at build time ✅, print ❌ |
| `GET /products`, `/products/{id}`, `/products/categories` | called by `src/lib/woo.ts` at build | ✅ |
| `POST/PUT/DELETE /products` | unused | ❌ never |
| WP admin | human-only | ❌ from agents |
| Catalog edits | human via WP admin | ❌ from agents (only `wenu-producto` proposes) |

## GitHub

| Capability | State |
|---|---|
| `gh` CLI | NOT installed |
| `git remote` on `wenu-frontend` | NOT configured |
| Push capability today | impossible |
| Create branches locally | ✅ |
| Commit locally | ⚠️ per-commit |
| Open PR | ❌ until remote + `gh` exist; then ⚠️ explicit |

## Browser automation

| Path | State | Permission |
|---|---|---|
| `claude-in-chrome` MCP | available; extension may need user to confirm connection | ✅ navigation, ⚠️ destructive clicks |
| `computer-use` MCP | available; allowlist empty until `request_access` is called | ✅ for native apps with grant; ⚠️ for any app interaction |
| Playwright | not installed | install ⚠️ explicit |
| Sign in to dashboards | human only | ❌ from agents |
| Click destructive buttons (delete/transfer/disable) | always | ⚠️ explicit per click |
| Submit forms with PII / financial data | always | ❌ from agents |
| Click links from emails or untrusted documents | always | ❌ |

## Subagents (`Agent` tool, `~/.claude/agents/*.md`)

| Subagent | When to spawn |
|---|---|
| `Explore` | Multi-file codebase searches that would otherwise pollute main context. |
| `Plan` | Architecture / design questions before implementation. |
| `wenu-orchestrator` | Multi-domain task. |
| `wenuos-ops` | Anything cloudflared / launchd / SSL / dominio / bots. |
| `wenu-producto` | Catalog / inventory. |
| `wenu-brand` | Identity / IG / copy / Canva. |
| `segundo-cerebro` | Obsidian vault navigation, dedupe, MOC update. |
| `daily-synth` | Daily/weekly synthesis. |
| `chatgpt-importer` | After exporting from ChatGPT settings. |

Subagents inherit all rules in `DO_NOT_TOUCH.md`. They cannot escalate beyond their own tool list.

## What needs human approval, summarized

- Any file edit (one-by-one or in batch — explicitly).
- Any commit.
- Any `sudo` command (you type the password).
- Any browser click that mutates remote state.
- Adding a git remote.
- Installing global tools (`wrangler`, `gh`, Playwright, etc.).
- Any DNS change.
- Any Cloudflare Pages production attachment.
- Any WC product write.
- Any token rotation (Cloudflare, GitHub, WC).
- Any download from email / web.
- Any message sent on the user's behalf (Telegram, email, social).
