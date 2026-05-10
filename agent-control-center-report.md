# Agent Control Center — setup report

Date: 2026-05-09

## Where it lives

`~/wenu-frontend/agent-control/`

Decision: this folder, not Obsidian. Reasons:
- Code-adjacent (the agents that edit code work here).
- All existing reports already live in `~/wenu-frontend/`.
- Obsidian remains the broader "second brain" with MOCs, daily logs, brand system; the control center references Obsidian rather than duplicating it.

A pointer note from Obsidian to this folder is **not** added in this commit (the user did not approve modifying Obsidian). Adding `~/Obsidian/WenuAgent/00-Index/Agent-Control-Center.md` as a one-line bridge is a one-minute follow-up task whenever the user wants it.

## Files created (9 governance + this report = 10)

| File | Purpose | Length |
|---|---|---|
| `agent-control/AGENT_CONTROL_CENTER.md` | Single source of truth; index | ~120 lines |
| `agent-control/AGENT_ROLES.md` | Who owns what (Claude / Codex / ChatGPT / Obsidian / n8n / WC / CF / human) | ~130 lines |
| `agent-control/CURRENT_STATE.md` | Tech state snapshot — WP, Astro, Aftercare, CF tunnel, Pages, git, .env audit, ports | ~110 lines |
| `agent-control/DO_NOT_TOUCH.md` | Binding blocklist (10 categories) | ~110 lines |
| `agent-control/DECISION_LOG.md` | Append-only decision history | ~90 lines |
| `agent-control/PERMISSIONS_MATRIX.md` | What's allowed without asking, what needs approval, what's prohibited | ~120 lines |
| `agent-control/TASK_QUEUE.md` | P0–P8 prioritized backlog | ~130 lines |
| `agent-control/AGENT_HANDOFF_PROTOCOL.md` | 4-step start, scope statement, end-of-task report format | ~140 lines |
| `agent-control/PROMPTS_FOR_AGENTS.md` | 6 reusable prompt templates | ~170 lines |
| `agent-control-center-report.md` | This report | this file |

Nothing else was created or modified. No commits.

## Previous reports integrated (referenced, NOT duplicated)

- `agent-capabilities-and-permissions-report.md` — environment audit
- `security-cleanup-plan.md` — env hygiene + plist + tunnel rotation framework
- `cloudflared-local-managed-migration-plan.md` — path C migration
- `deployment-readiness-report.md` — Pages cutover gating
- `cloudflare-pages-deploy.md` — Pages preview project recipe
- `aftercare-readiness-report.md` — Aftercare static-asset verification
- `morning-verification-report.md` — build verification on `redesign-v2`
- `full-site-phase1-report.md` — Phase 1 launch blockers
- `redesign-v2-night-report.md` — earlier redesign work
- `~/wenu-frontend/CLAUDE.md` — frontend dev guide
- `~/AGENTS.md` — workspace map
- `~/Obsidian/WenuAgent/` MOCs (Proyectos, Operaciones, Claude, ChatGPT, Skills, Vault, etc.)
- `~/.claude/projects/-Users-user1/memory/MEMORY.md` — auto-memory index

The control-center files cite these by absolute path so any agent can `Read` them when needed, without re-discovering the same context.

## What still needs human approval

- **P3.1** GitHub remote decision for `wenu-frontend` (yes = enables Pages auto-deploy; no = direct upload via wrangler-after-install).
- **P0-E/F/G** Security cleanup steps E (move env backups), F (chmod 600 on `.env` files), G (harden `.gitignore`). All low-risk; bundled execution awaits a green light.
- **P0-C** Tunnel rotation. Already deferred behind P3 per `DECISION_LOG.md`.
- **P2** Aftercare independent hosting decision (subdomain vs `*.pages.dev`).
- **Apex DNS / production cutover** (P8) — far in the future, gated by everything above.

Nothing in the control center itself requires your approval — it's documentation, not code or config.

## Next 3 recommended actions

1. **Skim each of the 9 files in `~/wenu-frontend/agent-control/`** (5–10 min). Edit anything that doesn't match your intent. They are deliberately concise so a skim is sufficient.
2. **Pick one task from `TASK_QUEUE.md` P0** to execute next. Strong recommendation: **P0 Step E** (move `wenu-agent-hub` env backups to `~/wenu-secrets-backup/`). Low risk, instant defense-in-depth, no sudo, no DNS, no production touch.
3. **Decide P3.1 (GitHub remote yes/no)** when you're ready. That decision unblocks the entire P3 Pages cutover track, which in turn unblocks P0-C tunnel rotation.

## How this reduces copy/paste and token waste

- **One entry point.** Every agent reads `AGENT_CONTROL_CENTER.md` first. No more "here's the project context again" preambles.
- **Citations beat duplications.** Audit reports stay in `~/wenu-frontend/*.md`; control-center files reference them by path instead of restating findings. Agents `Read` the citation when they need it, not always.
- **Scope statement before tool calls.** Every agent must declare TASK / FILES ALLOWED / FORBIDDEN before any action (`AGENT_HANDOFF_PROTOCOL.md`). This stops the "let me just check one more thing" drift that burned tokens in past sessions.
- **End-of-task reports are short by default.** 200 words. The human asks if they want more. No more 2,000-word recap deliverables.
- **The queue is the only entry to new work.** New ideas append to `TASK_QUEUE.md`, they don't jump in mid-task.
- **No duplicate audits.** The 7-day-staleness rule in the handoff protocol means agents reuse fresh reports instead of re-running them.
- **Prompts are templated.** `PROMPTS_FOR_AGENTS.md` removes the "how should I phrase this to ChatGPT/Codex" tax.

## What was NOT changed

- No website code touched.
- No deploy or push.
- No DNS change.
- No token rotation.
- No file deleted.
- No WooCommerce write.
- No Aftercare modification.
- No commit.
- No `.env` read into output.
- No JWT printed.
