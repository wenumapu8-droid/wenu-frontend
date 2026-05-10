# Wenu Mapu — Agent Control Center

**This is the single source of truth for the Wenu Mapu project.** Every agent (Claude Code, Codex, ChatGPT, subagents, automation) MUST read this file first before taking any action. If anything in another file conflicts with this one, this file wins.

Location: `~/wenu-frontend/agent-control/`
Last updated: 2026-05-09

---

## How to use this folder

| File | Read when |
|---|---|
| **AGENT_CONTROL_CENTER.md** | First, always. This file. |
| `AGENT_ROLES.md` | Before assigning a task — to know which agent should own it. |
| `CURRENT_STATE.md` | Before any technical work — to know what's running, what's broken. |
| `DO_NOT_TOUCH.md` | Before any destructive or production action. |
| `DECISION_LOG.md` | Before re-opening a closed question. |
| `PERMISSIONS_MATRIX.md` | Before any action that affects shared state (DNS, prod, secrets). |
| `TASK_QUEUE.md` | To pick the next task. |
| `AGENT_HANDOFF_PROTOCOL.md` | Before handing off work to another agent. |
| `PROMPTS_FOR_AGENTS.md` | When invoking another agent — copy a templated prompt. |

External references (DO NOT duplicate their content here):

- Permissions audit → `~/wenu-frontend/agent-capabilities-and-permissions-report.md`
- Security plan → `~/wenu-frontend/security-cleanup-plan.md`
- Tunnel migration → `~/wenu-frontend/cloudflared-local-managed-migration-plan.md`
- Deployment readiness → `~/wenu-frontend/deployment-readiness-report.md`
- Cloudflare Pages plan → `~/wenu-frontend/cloudflare-pages-deploy.md`
- Aftercare readiness → `~/wenu-frontend/aftercare-readiness-report.md`
- Frontend dev guide → `~/wenu-frontend/CLAUDE.md`
- Workspace map → `~/AGENTS.md`
- Obsidian brain (MOCs, daily, brand, productos) → `~/Obsidian/WenuAgent/`
- Claude memory → `~/.claude/projects/-Users-user1/memory/MEMORY.md`

---

## Project status (2026-05-09)

**Mode:** preservation-first orchestration. We are NOT shipping new features; we are consolidating, securing, and preparing for a Cloudflare Pages cutover.

**Production site (live store):** `wenumapuonline.com` legacy WordPress / WooCommerce — **frozen, do not touch**. Currently 502'ing through the Cloudflare Tunnel because the tunnel routes apex → `localhost:4321` (Astro dev) which isn't running. Live store is effectively paused; that's a separate decision the human owner controls.

**Astro redesign (`wenu-frontend`):** branch `redesign-v2`, 82 pages, 64 product detail pages, build green on Node 24.14.1. NO git remote, NOT deployed anywhere public. Aftercare subset is fully ready as a static asset.

**Security:** active known incident — the cloudflared tunnel JWT was exposed in chat transcript. Mitigations done (plist mode 600, brew duplicate stopped). Rotation deferred behind Pages cutover per user decision.

---

## What is already working — preserve

- Astro build pipeline (`npm run build` → 82 pages, 64 products) with WC fail-loud safety + postbuild verification
- Aftercare static deliverable (`public/aftercare/` + `dist/aftercare/`) — 200 OK, full visual system, video + PDF intact
- Forms migrated from Formspree placeholders to mailto fallbacks (commit `7563979`)
- Cloudflare Tunnel `Wenuos` (UUID `fd7eb657-…`) — HEALTHY, serves 3 hostnames
- LaunchDaemon `com.cloudflare.cloudflared` — running, auto-starts at boot
- 7 Claude subagents in `~/.claude/agents/` — wenu-orchestrator, wenuos-ops, wenu-producto, wenu-brand, segundo-cerebro, daily-synth, chatgpt-importer
- Postgres (wenu-platform) on `localhost:5432`
- Obsidian vault structure with MOCs, daily logs, brand system, product codes (WM-*)

## What is fragile

- Tunnel `--token` is in `ps` and the plist (compromised; rotation pending — see `security-cleanup-plan.md`)
- `wenu-frontend` is local-only (no git remote, single point of failure on this Mac)
- `wenu-agent-hub` has multiple ungitignored `.env.*` backups
- WC catalog count mismatch (build saw 64; memory notes 104 vs estimated 59) — needs reconciliation
- Apex `wenumapuonline.com` 502's — depends on whether Astro dev is running locally (not durable)
- Cloudflare Tunnel hosts BOTH dev (`wenuos`, `api`) AND apex routing — coupling makes any tunnel change a 3-hostname blast

## What must NOT be touched (see DO_NOT_TOUCH.md for full list)

- Production WordPress/WooCommerce store content
- Apex `wenumapuonline.com` DNS
- Cloudflare Tunnel routes (until Pages cutover plan is final)
- Cloudflare Access policies on `wenuos.wenumapuonline.com`
- WooCommerce product writes
- Aftercare files (`public/aftercare/*`, `dist/aftercare/*`) unless task explicitly says so
- `.env*` files in any project (no edits, no deletes, no reads-into-chat)

---

## Active workstreams

| # | Workstream | Owner | Status |
|---|---|---|---|
| WS-1 | Security cleanup (plist + env hygiene + tunnel rotation) | Claude plans, human approves, human executes sudo | Steps A+B done; rotation deferred |
| WS-2 | Cloudflare Pages preview cutover | Claude plans, human executes dashboard | Plan written, awaiting decision on GitHub remote |
| WS-3 | Aftercare independent hosting | Claude plans, human executes | Static files verified ready |
| WS-4 | Full-site Phase 1 architecture | Claude/Codex code, human approves | Build green; product display + forms hardened |
| WS-5 | Inventory truth-source reconciliation (WC) | wenu-producto subagent | Open from 2026-05-04 |
| WS-6 | Brand & content (Instagram, Canva, copy) | wenu-brand subagent + ChatGPT | Outside this control center; lives in Obsidian |
| WS-7 | Agent orchestration (this folder) | Claude | In progress (this commit) |

---

## Current priority order

1. **Finish this orchestration setup** (writing these 9 files). One pass, no rework.
2. **Decide on GitHub remote for `wenu-frontend`** (yes/no). Blocks Cloudflare Pages auto-deploy.
3. **Cloudflare Pages preview deploy** (path A or B from `deployment-readiness-report.md`).
4. **Tunnel rotation** (path C from `cloudflared-local-managed-migration-plan.md`) — only after Pages cutover reduces blast radius.

Defer everything else. New ideas go into `TASK_QUEUE.md`, not into the current task.

---

## Approval rules (binding for all agents)

| Action | Approval |
|---|---|
| Read any file in `~/wenu-frontend`, `~/wenu-agent-hub`, `~/Obsidian/WenuAgent` | none — go ahead |
| Run `npm run build` locally | none |
| Edit a file in `~/wenu-frontend/src/` | per-edit approval from human |
| Commit (local only) | per-commit approval from human |
| Create or modify `.env*` file | NO. Surface what's needed; human edits. |
| Add a git remote | YES, explicit approval |
| `git push` | YES, explicit approval |
| Open a PR | YES, explicit approval |
| Touch Cloudflare Tunnel / DNS / Pages prod | YES, manual via dashboard, human drives destructive clicks |
| Touch WooCommerce products | YES, manual via WP admin, never automated |
| Run `sudo` | NO — agents do not run sudo. Hand the command to the human. |
| Print or log a secret | NO, ever. Redact via `sed -E 's/(eyJ[A-Za-z0-9_-]+)/<REDACTED>/g'` |
| Send email, post to social, message Telegram on owner's behalf | NO without explicit per-message approval |

---

## Next safe action

**Task: complete this control-center commit, then human decides between Pages remote setup vs continuing security track.**

After this folder is in place:

1. Human reviews these 9 files. Edits / corrects in place.
2. Human picks the next priority from `TASK_QUEUE.md`.
3. The chosen agent reads `AGENT_CONTROL_CENTER.md` + the relevant external report, then proposes the smallest possible action.

That's the loop. No agent self-launches into work without going through this entry point.
