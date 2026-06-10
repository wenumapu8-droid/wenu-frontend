# Next Green-Lane Tasks - 2026-05-20

## Current Automation State

- `wenu-autopilot` is running.
- Interactive OpenCode is open.
- No automatic `opencode run` child is currently stuck.
- The autopilot queue has no dispatchable task right now.

## Recommended Next Tasks

1. `P7.6` font preload audit and implementation plan.
   - Agent: Codex or OpenCode.
   - Scope: inspect `Base.astro` and generated font assets, then either write a tiny implementation patch or a blocked report if asset paths are ambiguous.
   - Avoid: app-wide style refactors.

2. `P10.4` marketing dashboard template.
   - Agent: OpenCode.
   - Scope: create `reports/marketing-dashboard-template-2026-05-20.md` only.
   - Avoid: posting to Instagram, sending email, or inventing live metrics.

3. `P9.2` metrics script design only.
   - Agent: Codex.
   - Scope: read `src/lib/woo.ts` and write a plan/report for a read-only orders metrics script.
   - Avoid: reading secrets, calling Woo write endpoints, or editing `.env`.

4. `P7.5` aftercare image conversion planning.
   - Agent: OpenCode.
   - Scope: read-only size/type audit of `public/aftercare/` and existing image scripts, then report exact changes needed.
   - Avoid: modifying aftercare files until the human explicitly approves an Aftercare task.

## OpenCode Prompt

```text
You are OpenCode working inside /Users/user1/wenu-frontend.

Read first:
1. agent-control/AGENT_CONTROL_CENTER.md
2. agent-control/DO_NOT_TOUCH.md
3. agent-control/TASK_QUEUE.md
4. agent-control/AGENT_HANDOFF_PROTOCOL.md

TASK: produce the next safe green-lane task output from the Wenu queue.
FILES ALLOWED: read-only repo inspection; write only reports/opencode-next-green-output-2026-05-20.md
FORBIDDEN: sudo, .env, secrets, DNS, deploys, git commit/push, WooCommerce writes, aftercare edits, restarting/stopping services, editing app code/images.

Start with P10.4 unless the queue shows a higher safe non-blocked task that can be completed by writing a report/template only.

Return RESULT / WHAT CHANGED / WHAT VERIFIED / WHAT NEXT.
```
