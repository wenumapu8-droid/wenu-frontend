# KODEX−∞ Worker Failover Protocol

Status: CANONICAL OPERATING POLICY
Owner: Ocín / KODEX−∞

## Purpose

Prevent any individual AI model, IDE session, local process or vendor from becoming a single point of failure for KODEX−∞.

Project continuity belongs to the repository, canonical files, work packet, evidence and handoff—not to one conversation.

## Core rule

`PACKET → WORKER → EVIDENCE → HANDOFF → NEXT WORKER`

A worker is replaceable. A task remains active until its evidence-backed definition of done is satisfied or a real blocker is recorded.

## Autonomous decisions

A worker should proceed without human interruption when a choice is:

- reversible;
- inside the work-packet scope;
- consistent with canon and current architecture;
- non-destructive;
- zero-cost or already provisioned;
- not a production deployment;
- not a new canonical cultural/scientific claim.

Multiple reasonable implementation options are not a blocker. Select the safest architecture-consistent option and record the assumption.

## Failover triggers

Takeover is permitted immediately when the current worker:

- waits for user input without identifying a hard blocker;
- stops at research/planning despite an execution packet;
- loses its session/context;
- becomes rate-limited or unavailable;
- lacks the necessary toolchain;
- edits outside its permitted file surface;
- claims completion without required evidence;
- materially diverges from canonical requirements.

## Replacement-worker preflight

The replacement worker must:

1. read `kodex-os/SKILL.md`;
2. read `kodex-os/AGENTS.md`;
3. read the active work packet;
4. read the latest task handoff/unblock directive;
5. inspect branch, HEAD, working tree and recent relevant commits;
6. identify existing implementation before creating new code;
7. preserve unrelated/pre-existing work;
8. determine the evidence status of each relevant claim;
9. continue from current state rather than rebuilding blindly;
10. record its own evidence-backed handoff.

## Human stop conditions

A worker must request Ocín when any of the following is true:

1. a required credential or secret is unavailable;
2. an irreversible or destructive operation is required;
3. two explicit canonical/task requirements directly contradict each other and evidence cannot resolve them;
4. a paid purchase/new paid dependency is required;
5. cultural provenance, permission or rights require owner judgment;
6. a new canonical concept or visual selection is explicitly reserved for owner approval;
7. production deployment/cutover would occur without the exact phrase `APROBAR DEPLOY`;
8. a safety-critical uncertainty cannot be resolved from evidence.

## Repository safety

- Never use destructive reset as a coordination shortcut.
- Never force-move branch refs without explicit authorization.
- Never delete unrelated assets/work.
- Never store secrets in the repository or handoff.
- Never infer deployment from branch push, local preview or clean build.
- Never report visual validation without the required screenshots/measurements.

## Evidence ladder

Use distinct production states:

- `PLANNED`
- `RESEARCHED`
- `PROTOTYPED`
- `IMPLEMENTED`
- `TESTED`
- `VISUALLY_VALIDATED`
- `APPROVED`
- `DEPLOYED`
- `BLOCKED`
- `DEPRECATED`

Do not collapse these stages.

## Handoff extension

In addition to the standard `kodex-os/AGENTS.md` handoff, takeover work should record:

```yaml
handoff:
  task: ""
  worker: ""
  branch: ""
  base_commit: ""
  head_commit: ""
  takeover_reason: ""
  prior_worker_state: ""
  objective: ""
  status: ""
  files_read: []
  files_changed: []
  files_preserved: []
  assumptions: []
  tests_run: []
  visual_validation: []
  performance_validation: []
  known_issues: []
  blockers: []
  next_owner: ""
  next_action: ""
  deployment_status: NOT_REQUESTED | BLOCKED | APPROVED | DEPLOYED
```

## Invariant

KODEX must remain operable when any single worker disappears.

The project remembers state; agents merely operate on it.
