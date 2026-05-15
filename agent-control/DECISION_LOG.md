# Decision Log

Append-only log of decisions that bind future work. Newest entries at top. Each entry: `YYYY-MM-DD — short title`. The body should be 1–5 lines: what was decided, why, what it forecloses.

When you need to revisit a decision, **add a new entry that supersedes it** rather than editing the old one. Old entries stay so future agents understand the history.

---

## 2026-05-15 — Consolidate duplicate control structures into `/agent-control/`

**Decided:** A prior session created parallel governance files in `/docs/` (`AGENT_RULES.md`, `PROJECT_STATE.md`, `CHANGELOG_AI.md`) and `/prompts/` (`00-master-context.md`, `01-current-task.md`, `02-next-actions.md`). These duplicated the canonical files in `/agent-control/` (`AGENT_CONTROL_CENTER.md`, `DO_NOT_TOUCH.md`, `CURRENT_STATE.md`, `DECISION_LOG.md`, `TASK_QUEUE.md`) and ignored the existing 7 subagents, 26 plans in `~/.claude/plans/`, and brand system in `~/Obsidian/WenuAgent/brand/`.
**Why:** Two parallel sources of truth would diverge within days. The `/agent-control/` system is older, more complete, and already wired into the subagent ecosystem and `AGENT_HANDOFF_PROTOCOL.md`. The new files were derivative and lacked the cross-references.
**Action:** Moved the 6 duplicate files to `/Users/user1/wenu-frontend-backup/2026-05-15-duplicate-docs/` (outside repo, reversible). `/docs/handoffs/` and `/docs/snippets/` from commit `f0966cf` are kept — they are legitimate.
**Forecloses:** Future sessions creating governance files outside `/agent-control/`. New prompt templates go into `PROMPTS_FOR_AGENTS.md`. New state snapshots update `CURRENT_STATE.md` with a dated delta section, not a new file.

## 2026-05-09 — Agent Control Center introduced

**Decided:** Centralize project orchestration in `~/wenu-frontend/agent-control/` with 9 governance files. All agents must read `AGENT_CONTROL_CENTER.md` first.
**Why:** Stop scattered execution; previous sessions kept rediscovering context, producing redundant audits, requiring manual copy-paste.
**Forecloses:** Free-floating agent invocations without a control-center read. New work goes through `TASK_QUEUE.md`.

## 2026-05-09 — Preservation-first operating mode

**Decided:** No new feature work until orchestration is in place and security incident is contained. Mode is preservation + consolidation, not shipping.
**Why:** Token leak + scattered context + uncommitted reports = high risk of overwriting progress.
**Forecloses:** Until further notice, agents do not start work without a written plan owner-approved.

## 2026-05-09 — Tunnel rotation deferred behind Pages cutover

**Decided:** Path C (locally-managed migration) is the correct long-term fix, but it will be sequenced AFTER the Cloudflare Pages cutover for `wenu-frontend`.
**Why:** The current `Wenuos` tunnel hosts THREE production hostnames (apex + wenuos sub + api sub). Rotating now means a 3-hostname blast. After Pages takes over apex + api, the tunnel only carries the dev `wenuos` subdomain → low-impact rotation.
**Forecloses:** Path B (delete + recreate) and immediate path C execution. Plan is documented in `cloudflared-local-managed-migration-plan.md`.

## 2026-05-09 — Path B (dashboard delete + recreate) rejected

**Decided:** Not executing path B for tunnel rotation.
**Why:** The user rule "do not touch the apex" + the discovery that the apex is routed through the same tunnel made path B impossible without violating that rule.
**Forecloses:** Any plan that asks the user to delete the `Wenuos` tunnel without first migrating apex routing elsewhere.

## 2026-05-09 — Cloudflared `--token` confirmed compromised

**Decided:** Treat the cloudflared connector JWT as compromised. Rotate at the next safe window.
**Why:** The full token was visible in pasted `ps` output during a chat turn on 2026-05-09. Chat transcripts persist in `~/.claude/sessions/` and `~/.claude/projects/` and could be ingested by other tools.
**Forecloses:** Any "the leaked token might still be safe to leave alone" argument. It must rotate.

## 2026-05-09 — Brew duplicate cloudflared service stopped (Step B)

**Decided:** Stopped the dead `homebrew.mxcl.cloudflared` service that was running `cloudflared` with no args. The active tunnel runs from `com.cloudflare.cloudflared` LaunchDaemon.
**Why:** Two registered services were confusing. Only one actually carried the tunnel.
**Forecloses:** A future `brew services restart cloudflared` will not restart the tunnel — that's a `launchctl` op now.

## 2026-05-09 — Cloudflared plist tightened to mode 600 (Step A)

**Decided:** `chmod 600 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist`. Owner unchanged (root:wheel).
**Why:** Plist was world-readable (mode 644), exposing the tunnel JWT to any local user/process via `cat`.
**Forecloses:** No regressions allowed. `ls -la` should always show `-rw-------` for that plist.

## 2026-05-09 — Forms migrated to mailto fallbacks

**Decided:** Newsletter, Custom Orders, Contact all use `mailto:contact@wenumapuonline.com` (or per-page subject). No Formspree placeholders remain.
**Why:** Placeholder Formspree URLs can never receive submissions; better to route to a real human inbox than fake success states.
**Forecloses:** Real form provider (Brevo / Mailchimp / Klaviyo) is a separate, deferred decision. Don't add one without explicit task.

## 2026-05-09 — Cloudflare Pages preview is the deploy target for full site

**Decided:** Full-site `redesign-v2` will deploy to a Cloudflare Pages **preview** project (`wenu-mapu-redesign`) on a `*.pages.dev` URL. Not yet production. Apex stays on legacy WP until cutover decision.
**Why:** Removes dependency on this Mac + cloudflared tunnel for hosting. `dist/` is static; Pages is the right target.
**Forecloses:** Custom-domain attachment in this project. Production cutover is a separate, gated decision.

## 2026-05-09 — Aftercare independent deploy track

**Decided:** Aftercare ships separately from the full-site track. May go to its own Cloudflare Pages project + subdomain (e.g., `aftercare.wenumapuonline.com`) before full-site is production-ready.
**Why:** Aftercare is verified ready (`aftercare-readiness-report.md`); blocking it on full-site readiness is unnecessary.
**Forecloses:** Bundling Aftercare into the full-site Pages project. They are separate deploy targets.

## 2026-05-09 — `wenumapuonline.com` apex production locked

**Decided:** Apex production (`wenumapuonline.com`) is locked: no DNS changes, no Pages attachment, no tunnel route changes that affect it.
**Why:** It's the live e-commerce surface (currently 502 due to dev tunnel coupling, but conceptually still production). Any change blast-radiates to the live store.
**Forecloses:** All "let's just point apex at the new build" shortcuts.

## 2026-05-09 — Token leak found in transcript

**Decided:** Discovered during Step B verification that the active `cloudflared --token <JWT>` had been pasted by the user from `ps` output earlier in the same conversation.
**Why noted:** Drives the urgency of the rotation plan and the redaction discipline going forward.

## 2026-05-09 — Pivot 100% digital (carryover from 2026-04-27 memory)

**Decided (prior):** Wenu Mapu's operations are 100% digital out of Truckee. Vitrina-en-estudios offer pending. Salida Lucky 7. VIT→STK route.
**Status:** carried over from `~/.claude/projects/-Users-user1/memory/pivote_digital_2026_04_27.md`. Affects shipping copy, store hours, and "where can people see the work" answers.
