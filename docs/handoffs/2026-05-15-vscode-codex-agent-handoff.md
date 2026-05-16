# VS Code / Codex Agent Handoff — 2026-05-15

## Identity

- **Agent:** Codex / VS Code code-editing agent
- **Workspace:** `/Users/user1/wenu-frontend`
- **Branch:** `redesign-v2`
- **Role:** T2 implementation agent for approved code edits

## Start Gate

Before editing, Codex / VS Code must read:

1. `AGENT_CONTROL_CENTER.md`
2. `agent-control/TASK_QUEUE.md`
3. `agent-control/AGENT_ROLES.md`
4. `agent-control/AGENT_HANDOFF_PROTOCOL.md`
5. `agent-control/CURRENT_STATE.md`
6. Latest relevant file in `docs/handoffs/`

Then state:

```txt
TASK: <one short sentence>
FILES ALLOWED: <exact files/globs>
FORBIDDEN: secrets, DNS, production deploys, GitHub push, WooCommerce writes, sudo, aftercare unless explicitly assigned
```

## Current Dirty Files

Observed before this handoff was created:

```txt
 M agent-control/TASK_QUEUE.md
 M src/components/SearchModal.astro
 M src/components/forms/CustomOrderForm.astro
 M src/pages/local.astro
 M src/pages/sets.astro
 M src/pages/shop.astro
?? .claude/
?? reports/audit-codex-frontend-2026-05-15.md
?? reports/audit-opencode-perf-2026-05-15.md
?? reports/ig-captions-batch-2026-05-15.md
?? src/content/journal/wood-as-body-material.md
```

Treat these as active parallel-agent or human changes. Do not overwrite, revert, format, or opportunistically clean them unless a later handoff explicitly assigns ownership.

## Recommended First Task

If no newer human instruction overrides this handoff, Codex should wait for a task assignment from the Captain / human owner.

Good first implementation candidates from the queue, after current dirty work is resolved:

- `P7.8` — fix `src/pages/sets.astro` `preloadImage` prop shape.
- `P7.6` — add font preloads in `src/layouts/Base.astro`.
- `P7.7` — add explicit dimensions to selected image tags, scoped one page/component at a time.

Do not begin these while `sets.astro`, `shop.astro`, or `Base.astro` are being edited by another active agent.

## Validation Rules

For frontend implementation:

```bash
nvm use
npm run build
```

If build is blocked by WooCommerce/network, report it as environment/network validation failure, not as code failure.

For narrow Astro changes, also run focused text checks with `rg` for the exact strings or props touched.

## Handoff Back

When Codex finishes:

```txt
RESULT: success | blocked | partial
WHAT CHANGED:
  - <files edited>
WHAT WAS VERIFIED:
  - <commands/checks>
WHAT'S NEXT:
  - <literal next queue item or blocker>
NOTES FOR HUMAN:
  - <only if approval/action needed>
```

If another agent should continue, name it explicitly: `OpenCode`, `Claude Code`, `wenu-brand`, `wenu-producto`, `wenuos-ops`, or `segundo-cerebro`.
