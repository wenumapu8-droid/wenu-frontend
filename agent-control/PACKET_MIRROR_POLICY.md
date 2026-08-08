# KODEX−∞ Work Packet Mirror Policy

Status: ACTIVE OPERATING RULE
Owner: Ocín / KODEX−∞

## Problem

A work packet that exists only inside one agent's local directory is a single point of failure. If that agent/session becomes unavailable, replacement workers cannot reconstruct the exact task contract safely.

## Rule

Every active KODEX work packet must have a repository mirror containing the non-secret task contract.

Local agent state may add runtime notes, but it must not be the only copy of:

- task objective;
- allowed/forbidden file surface;
- acceptance criteria;
- dependencies;
- canonical references;
- required tests;
- completion handoff;
- deployment gate.

## Location

Repository mirrors live under:

`agent-control/work-packets/`

Suggested names:

`KOD-39.yaml`
`KOD-40.yaml`

## Secret handling

Never mirror:

- API keys;
- tokens;
- passwords;
- `.env` values;
- private personal data not required by the task.

Replace secret values with named requirements such as `REQUIRES_CLOUDFLARE_TOKEN`.

## Synchronization

A local worker that reads a local-only packet must compare it with the repository mirror before execution.

If the repo mirror is missing or partial:

1. create/update the mirror with the non-secret contract;
2. record the local source path and synchronization timestamp;
3. preserve the original semantics;
4. do not silently add requirements;
5. mark unknown fields `NEEDS_LOCAL_SYNC` rather than guessing.

## Failover behavior

Replacement workers use the repo mirror as the portable task contract. If the mirror is explicitly partial, they may execute only work that is independently supported by canonical repo evidence until a local-capable worker syncs the missing fields.

## KOD-39 current state

KOD-39 was observed in Gemini Antigravity as local `KOD-39.yaml`. The exact YAML contents are not yet repository-visible. A partial repo record exists under `agent-control/work-packets/KOD-39.repo.yaml` and must be upgraded to a complete mirror by the next worker with access to the local packet.

This is not permission to invent the missing task contract.
