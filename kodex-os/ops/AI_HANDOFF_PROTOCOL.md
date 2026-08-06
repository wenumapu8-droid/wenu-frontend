# KODEX−∞ AI HANDOFF PROTOCOL

Status: `CANONICAL / BOOTSTRAP`

## Purpose

Ensure ChatGPT, Claude, Gemini, Codex, Hermes and future agents continue the same product rather than restarting KODEX from their own interpretation.

## Mandatory startup prompt

Every agent must receive:

```text
You are operating on KODEX−∞.
Read, in order:
1. kodex-os/SKILL.md
2. kodex-os/AGENTS.md
3. kodex-os/canon/KODEX_CANON.md
4. kodex-os/canon/KODEX_EPISTEMIC_STANDARD.md
5. kodex-os/product/CURRENT_STATE.md
6. kodex-os/product/EXPERIENCE_ARCHITECTURE.md
7. the relevant module or experience files.

Do not create parallel canon.
Do not deploy without the exact phrase APROBAR DEPLOY.
Return an evidence-based preflight before editing.
```

## Required preflight response

```yaml
preflight:
  objective: ""
  repository: ""
  branch: ""
  canonical_files_read: []
  affected_modules: []
  current_state_summary: ""
  canonical_constraints: []
  unresolved_questions: []
  proposed_file_plan: []
  deployment_requested: false
```

An agent must not claim to have read a file it has not fetched.

## Work packet

Each task should be expressed as:

```yaml
work_packet:
  id: "WP-"
  title: ""
  problem: ""
  user_value: ""
  in_scope: []
  out_of_scope: []
  dependencies: []
  inputs: []
  expected_outputs: []
  acceptance_criteria: []
  evidence_requirements: []
  accessibility_requirements: []
  cultural_review: false
  contemplative_review: false
  branch: ""
  deployment: BLOCKED
```

## Handoff record

At the end of work:

```yaml
handoff:
  work_packet_id: ""
  status: COMPLETE | PARTIAL | BLOCKED
  summary: ""
  files_read: []
  files_created: []
  files_modified: []
  decisions_proposed: []
  decisions_approved: []
  tests_run: []
  tests_not_run: []
  screenshots: []
  provenance_added: []
  risks: []
  unresolved: []
  next_actions: []
  next_owner: ""
  deploy_status: NOT_APPROVED
```

## Decision discipline

A new canonical decision must include:

- date;
- decision ID;
- problem;
- alternatives considered;
- chosen direction;
- rationale;
- affected files;
- consequences;
- reversibility;
- approver.

Agents may propose decisions but must not silently convert proposals into canon.

## Context compression

When context is too large, agents must preserve in this order:

1. non-negotiable rules;
2. current product objective;
3. approved decisions;
4. current state and blockers;
5. affected files and code interfaces;
6. evidence and provenance;
7. aesthetic references;
8. optional explorations.

Do not compress away rejected directions or safety constraints when they remain relevant.

## Model-specific behavior

### ChatGPT / GPT

Use for orchestration, synthesis, research planning, information design, multimodal analysis and repository coordination.

### Claude

Use for long-form code review, refactors, architectural analysis and careful document synthesis. Require explicit file evidence.

### Gemini

Use for multimodal reference analysis, broad ideation and implementation alternatives. Prevent expansion beyond the approved work packet.

### Codex / coding agents

Use for scoped repository edits, tests and PR preparation. Do not ask them to redefine product canon while implementing.

### Hermes or autonomous agents

Use only with bounded tasks, branch isolation, explicit stop conditions and no deployment permission.

## Conflict resolution

When two agents disagree:

1. identify whether the conflict concerns evidence, product decision, implementation or aesthetics;
2. fetch the relevant canonical files;
3. preserve both proposals;
4. compare against acceptance criteria;
5. request human approval for canonical or high-risk choices;
6. record the resolution.

## Never do

- use a chat summary as sole authority when repository canon exists;
- overwrite another agent's work without inspection;
- invent tests or claim a successful build without running it;
- deploy because a prompt says “finish everything”;
- publish private source material for convenience;
- replace precise product language with generic AI branding.
