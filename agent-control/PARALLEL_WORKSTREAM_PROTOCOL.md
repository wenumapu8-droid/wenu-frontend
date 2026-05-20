# Parallel Workstream Protocol

How to run multiple agents at once on Wenu Mapu without collisions, ghost-edits, or wasted context. Read before starting any session that touches code AND docs AND brand at the same time.

Source pattern: `~/.claude/plans/parallel-workstream-no-cryptic-zebra.md` (2026-05-09 reference run). This file generalises the pattern.

---

## When to run parallel

Use parallel only when **independent tracks won't touch the same files**. If two tracks would edit the same `.astro` page or the same WC product, run them sequentially.

Green lights for parallel:
- Code in `src/` + planning docs in repo root + brand assets in `~/Obsidian/WenuAgent/brand/`
- One agent on `~/wenu-frontend/`, another on `~/wenu-agent-hub/`
- Read-only audits + writing new docs

Red lights (run sequential):
- Two agents editing `src/lib/woo.ts`
- Two agents writing to the same WC product
- Any agent touching `.env*` while another agent runs anywhere

---

## Track layout — the five lanes

| Track | Agent                        | Surface                                 | Approval gate                 |
|-------|------------------------------|------------------------------------------|-------------------------------|
| T1    | Claude Code (this Mac)       | `~/wenu-frontend/` reads + plans         | per-edit human approval       |
| T2    | Codex / Cursor / OpenCode    | `~/wenu-frontend/src/` writes            | per-commit human approval     |
| T3    | ChatGPT (web/app)            | strategy + long-form copy + visual prompts| paste back, no direct writes  |
| T4    | wenu-brand subagent          | `~/Obsidian/WenuAgent/brand/` + `contenido/` | none — vault is owner's brain |
| T5    | wenu-producto subagent       | WC catalog reads (writes only via pipeline scripts) | none for reads; YES for writes |

Main business tracks:
| Track | Agent                        | Surface                                 | Approval gate                 |
|-------|------------------------------|------------------------------------------|-------------------------------|
| T9    | OpenCode / Claude            | Metrics & wallet: revenue, orders, AOV   | Agent pulls from APIs; human verifies |
| T10   | wenu-brand / OpenCode        | Marketing: campaigns, content pipeline   | Human approves campaign spend |
| T11   | wenu-brand / visual agent    | Design: asset pipeline, brand system     | None for internal tracking |

Bonus lanes for occasional use:
- T6: wenuos-ops — Cloudflare, tunnel, DNS (always human-driven in dashboard)
- T7: segundo-cerebro — vault cleanup, MOC maintenance
- T8: daily-synth — daily logs, weekly summaries

---

## Coordination rules

1. **Single source of truth: `agent-control/`.** Every track reads `AGENT_CONTROL_CENTER.md` + `CURRENT_STATE.md` before starting. Tracks do not negotiate with each other directly; they negotiate with this folder.

2. **File ownership.** Before a track edits a file, it claims the file by adding a one-line entry to `agent-control/CURRENT_STATE.md` under a "Locks" subsection (created if absent) with `path · agent · expected duration`. Remove on completion.

3. **Handoffs through `agent-control/handoffs/`.** When T1 finishes a plan for T2, the plan lands in `docs/handoffs/` (existing folder from commit `f0966cf`) named `YYYY-MM-DD-task-N-<topic>.md`. T2 reads the handoff, does not read this whole control center fresh.

4. **No silent merges.** If two tracks land changes to the same file by accident, the second one to commit STOPS, surfaces the conflict, and waits for owner decision. No auto-resolve.

5. **One commit-author per commit.** Don't co-mingle Claude + Codex authorship in a single commit. Each track produces its own commits with its own `Co-Authored-By`.

---

## Daily protocol

Morning (owner driven):
1. Read `agent-control/CURRENT_STATE.md` Delta section. If older than 2 days, run a fresh audit (Prompt #1).
2. Pick 1–3 tracks for the day. Don't activate more than 3 simultaneously — context starts thrashing.
3. Brief each track with the appropriate prompt from `PROMPTS_FOR_AGENTS.md` and a TASK_QUEUE.md entry.

Evening (any agent that ran):
1. Append a one-line entry to `CURRENT_STATE.md` under "Today" (created if absent).
2. If work in progress: leave a `~/wenu-frontend/docs/handoffs/YYYY-MM-DD-end-of-day.md` for tomorrow's continuation.
3. If branch dirty: either commit, stash, or surface for owner decision. Do NOT leave dirty for >24h.

---

## Example: a real parallel day

The 2026-05-13..15 catalog cleanup ran like this (reconstructed from `reports/` + git log):

| Day | T1 (Claude Code)               | T2 (Codex)                          | T5 (wenu-producto)            |
|-----|---------------------------------|--------------------------------------|--------------------------------|
| 13  | Planned `scripts/cleanup/`      | (idle)                              | Dry-run unpublish (`unpublish-A-dry-run-*.json`) |
| 14  | Wrote empty-state UX specs     | Implemented `ear-cuffs`/`ritual-objects` empty states | Fixed names, prices (`catalog-fixes-*.json`) |
| 15  | Audited; wrote status report   | Polished `shop.astro` "Explore by material" | Final descriptions pass + visible audit |

Output: 4 commits, 1 status report, 50 products with prices, build green at 95 pages.

That's the bar. Anything less coordinated and tracks step on each other.

---

## Anti-patterns (collected from past sessions)

- **Parallel governance files.** A session created `/docs/PROJECT_STATE.md`, `/docs/AGENT_RULES.md`, `/prompts/00-master-context.md` while `/agent-control/` already had canonical equivalents. Result: two sources of truth, both stale within 24h. Don't.
- **Bursting all 7 subagents at once.** More than 3 parallel agents = thrashing + token waste. Pick the 1–3 with the highest leverage.
- **Skipping `CURRENT_STATE.md` because "I remember".** You don't, by tomorrow. The two-minute read pays for itself.
- **Committing on behalf of another track.** If T2's work isn't ready and T1 commits it to "help", you erase T2's ability to write its own message and credit. Don't.

---

## Bootstrapping a new parallel session

Paste this to whichever agent you're activating:

```
You are joining a parallel workstream session for Wenu Mapu.

START STEPS:
1. Read ~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md.
2. Read ~/wenu-frontend/agent-control/CURRENT_STATE.md "Delta" + "Today" + "Locks" sections.
3. Read ~/wenu-frontend/agent-control/PARALLEL_WORKSTREAM_PROTOCOL.md.
4. Confirm your track (T1..T8) and the file lock you'll need.

If a file you need is already locked: stop, ask the owner whether to wait, switch task, or unlock (the owner unlocks, not you).

Your task: {{TASK FROM TASK_QUEUE.md}}
Your handoff source (if any): {{path/to/handoff.md}}
Your output destination: {{exact paths or globs}}

Run prompt #N from PROMPTS_FOR_AGENTS.md (substitute N with the role for your track).
```
