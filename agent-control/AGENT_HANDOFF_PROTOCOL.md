# Agent Handoff Protocol

How agents start, finish, and hand off work without producing redundant audits or stomping on each other.

---

## The 4-step start

Every agent on every task starts with these four steps, in order. No exceptions.

1. **Read `AGENT_CONTROL_CENTER.md`.** This anchors you.
2. **Read the entry in `TASK_QUEUE.md` you've been assigned to.** Confirm it's still in the right priority bucket and not blocked.
3. **Read `CURRENT_STATE.md` only if your task touches something in it.** Skip otherwise.
4. **Read at most ONE relevant external report** (e.g., `cloudflared-local-managed-migration-plan.md`). If you find yourself wanting to read 3+ reports, the task is too broad — split it.

Then, before any tool call, write a 3-line scope statement (the next section).

## Scope statement (mandatory, 3 lines)

Before doing the work, paste these three lines into your reply (or into a TodoWrite item):

```
TASK: <one short sentence>
FILES ALLOWED: <comma-separated list of paths or globs>
FORBIDDEN: <comma-separated list of categories from DO_NOT_TOUCH.md>
```

Example:

```
TASK: tighten wenu-frontend .gitignore (P0 step G).
FILES ALLOWED: ~/wenu-frontend/.gitignore
FORBIDDEN: secrets, DNS, production, push, sudo
```

The scope statement is binding. If during the task you discover you need to touch a file outside `FILES ALLOWED`, stop and ask the human.

## The end-of-task report

When you finish, write a **short** report. Default length: under 200 words. Format:

```
RESULT: <success | blocked | partial>
WHAT CHANGED: <bullets — file paths edited, commands run>
WHAT WAS VERIFIED: <bullets — what you ran to confirm>
WHAT'S NEXT: <one bullet — the literal next task in the queue or a new blocker found>
NOTES FOR HUMAN: <only if action is needed; otherwise omit>
```

Save the report inline in chat. Do **not** create a new `*-report.md` file unless the human explicitly asked. Multi-paragraph reports require explicit human request.

## Hard rules

- **No agent may act on DNS, secrets, production deploys, GitHub push, WooCommerce writes, or `sudo` without explicit per-action human approval.** Re-read this rule.
- **No long reports unless requested.** A 200-word summary is the default. The human asks if they want more.
- **No duplicate audits.** Before starting an audit, check `agent-capabilities-and-permissions-report.md`, `security-cleanup-plan.md`, `cloudflared-local-managed-migration-plan.md`, `deployment-readiness-report.md`. If your audit would replicate >50% of one of those, just reference it instead.
- **No re-discovery of context the user already paid for.** If you find yourself reading the codebase from scratch when a report exists, you're doing it wrong. Read the report first.
- **No printing secrets.** Pipe through `sed -E 's/(eyJ[A-Za-z0-9_-]+)/<REDACTED-JWT>/g'` for JWTs; use `awk -F= '/^[A-Z_]+=/{print $1}'` to list `.env` key names without values.
- **No silent state changes.** If you ran a command that mutated something (e.g., `chmod`), say so. Even "I created a new file" must appear in the WHAT CHANGED bullets.

## Handoff between agents

When you need another agent to continue:

1. Append a task to `TASK_QUEUE.md` under the right priority bucket. Include a one-line description and any prerequisites.
2. In your end-of-task NOTES FOR HUMAN, name the suggested next agent (e.g., "→ wenu-producto" or "→ Codex to implement").
3. If the next agent needs context that isn't yet in the control-center files, summarize it in **CURRENT_STATE.md** under the relevant section. Don't write a brand-new orphan note.

The next agent reads the queue + the updated CURRENT_STATE and picks up. No copy-paste of conversation transcripts.

## When the queue is wrong

If you discover the queue's priority is wrong (e.g., something in P3 is actually blocking P0), do NOT silently re-order. Instead:

1. Surface the conflict in your end-of-task report.
2. Suggest a re-prioritization.
3. Wait for human approval before editing `TASK_QUEUE.md`.

## When you're confused

If the request is ambiguous, the rules conflict, or the state file is stale:

1. **Ask the human, with a single focused question.** Use AskUserQuestion if available.
2. Do not guess.
3. Do not invent context.
4. Do not start the work and "see what happens".

## Loop avoidance

The worst-case for this project is "agent does work → produces report → next agent re-audits → produces another report". To break the loop:

- Reports older than 7 days require a fresh audit before relying on them. Reports newer than 7 days are trusted unless the relevant subsystem changed.
- If you are about to write a new audit report, first ask: "is the existing one stale, or am I just re-running it?" If it's not stale, READ it instead.
- The human is the arbiter when in doubt. Default to asking.

## Examples — what good handoff looks like

### Example 1: Codex finishes a code edit

```
RESULT: success
WHAT CHANGED:
  - ~/wenu-frontend/src/lib/woo.ts:75 — added pagination to getProducts (per_page=100, max 500)
WHAT WAS VERIFIED:
  - npm run build → 82 pages, 64 products, postbuild OK
  - npm run preview → /shop renders all 64 products
WHAT'S NEXT: P4.2 (catalog count reconciliation by wenu-producto)
NOTES FOR HUMAN: none
```

### Example 2: Claude finishes an audit

```
RESULT: success
WHAT CHANGED: nothing on disk
WHAT WAS VERIFIED:
  - .env permissions audited across 6 projects
  - All read-only commands documented in security-cleanup-plan.md §"Inspection commands"
WHAT'S NEXT: P0 step F (chmod 600 on .env files)
NOTES FOR HUMAN: requires sudo for /etc paths; you'll need to run those.
```

### Example 3: agent hits a hard rule

```
RESULT: blocked
WHAT CHANGED: nothing
WHAT WAS VERIFIED: discovered the requested change requires editing a file flagged in DO_NOT_TOUCH.md (Cloudflare Tunnel plist)
WHAT'S NEXT: human decision — lift the rule, change scope, or abort
NOTES FOR HUMAN: blocked by DO_NOT_TOUCH §1. Path C migration plan is the documented bypass.
```
