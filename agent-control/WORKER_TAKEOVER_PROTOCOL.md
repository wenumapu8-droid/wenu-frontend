# KODEX−∞ Worker Takeover Protocol

Status: ACTIVE OPERATING RULE
Owner: Ocín / KODEX−∞
Scope: coding/research/visual production agents operating through repository-backed work packets

## Principle

No individual model, chat, IDE session or local agent is a single point of failure.

Continuity lives in:

1. repository state;
2. work packet;
3. canonical documentation;
4. evidence-backed handoff;
5. issue/PR status.

A worker is replaceable. The task is not.

## When takeover is triggered

Trigger failover when a worker:

- remains in `Waiting for user input` without a hard blocker;
- stops after research/planning without executing the packet;
- loses context or session state;
- becomes rate-limited/unavailable;
- edits outside its allowed file surface;
- cannot run the required toolchain;
- reports completion without evidence;
- materially diverges from the packet/canon.

## Takeover sequence

The replacement worker MUST:

1. read the active packet in full;
2. read the latest task-specific unblock/handoff file;
3. inspect branch, HEAD and dirty working tree;
4. inspect recent commits touching the task;
5. identify files already changed and avoid duplicate/replacement implementations;
6. verify which claims are DISCOVERED / IMPLEMENTED / TESTED / DEPLOYED;
7. continue from current state rather than restarting from scratch;
8. preserve unrelated work and pre-existing dirty files;
9. run the smallest relevant validation loop before expanding scope;
10. write a final handoff with direct evidence.

## Decision authority

Workers may decide autonomously when the decision is:

- reversible;
- local to the packet;
- consistent with canon;
- consistent with existing architecture;
- zero-cost or already provisioned;
- non-destructive;
- non-deployment.

Workers must not stop merely because multiple technically valid implementations exist. Choose the safest architecture-consistent option and record the assumption.

## Hard blockers

Only these justify stopping for Ocín:

1. required credential/secret unavailable;
2. irreversible/destructive operation required;
3. direct contradiction between explicit task requirements that cannot be resolved from canonical sources;
4. paid purchase or new paid dependency required;
5. legal/licensing/provenance decision requiring owner judgment;
6. production deployment or apex cutover without exact owner gate `APROBAR DEPLOY`;
7. canonical visual selection explicitly reserved to Ocín.

## Safety rules

- Never use `git reset --hard` to solve coordination problems.
- Never delete or overwrite unrelated work.
- Never move a branch ref forcefully unless explicitly authorized.
- Never place secrets in git, prompts, reports or frontend code.
- Never infer deployment from a local build or branch push.
- Never classify visual QA as passed without screenshots/measurements when the packet requires them.
- Never present scientific metaphor or cultural inference as verified fact.

## Worker roles

Workers are capabilities, not permanent owners.

- ChatGPT: architecture, repo coordination, issue/PR control, documentation, safe GitHub-side changes.
- Claude Code: local implementation/refactor/build when its environment is available.
- Gemini / Antigravity: visual/code exploration and implementation when available.
- Codex/OpenCode: implementation/QA/performance tasks where available.
- Human owner Ocín: canonical visual acceptance, high-impact irreversible decisions, deployment gate.

If one role is unavailable, the packet may move to another worker with sufficient capability.

## Required handoff

```yaml
task:
worker:
branch:
base_commit:
head_commit:
objective:
status:
assumptions:
files_read:
files_changed:
files_preserved:
implementation:
tests_run:
test_results:
visual_validation:
performance_validation:
known_issues:
blocked_by:
deployment_status:
next_owner:
next_action:
```

## Status vocabulary

Use only evidence-supported status:

- PLANNED
- RESEARCHED
- PROTOTYPED
- IMPLEMENTED
- TESTED
- VISUALLY_VALIDATED
- APPROVED
- DEPLOYED
- BLOCKED
- DEPRECATED

Multiple statuses may coexist, for example:

`IMPLEMENTED + TESTED + DEPLOYMENT_BLOCKED`

## Failover SLA

For autonomous work packets, a worker that is waiting without a hard blocker should be considered eligible for takeover immediately. The replacement worker should not wait for the stalled worker to recover.

## Production invariant

The factory must continue even when one agent stops.

`PACKET → WORKER → EVIDENCE → HANDOFF → NEXT WORKER`

not:

`TASK → ONE CHAT → HOPE`

∞
