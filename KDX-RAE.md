# KDX.RAE v0.1 — Recursive Autonomous Evolution

Status: **IMPLEMENTED CANDIDATE / NOT DEPLOYED / NOT INSTALLED ON IMAC**

KDX.RAE is the intelligence and reconciliation layer above the KODEX machinery that already exists. It does not replace Assembly OS, WorkOrder, the Night Factory, the visual gate, the total audit, the team/build lock or the trinquete.

## Purpose

Keep reducing the difference between:

- **DESIRED KODEX** — creator North Star, canon, governed mockups/frames, visual genome, scene contracts, interaction/motion rules;
- **CURRENT KODEX** — exact code/worktree, browser result, assets, Drive evidence, tests, registries and verified product state.

Equation:

`DESIRED KODEX − VERIFIED CURRENT KODEX = NEXT BOUNDED WORK`

RAE is not rewarded for activity. It is rewarded for evidence-backed convergence.

## v0.1 architecture

### Opus conductor

`command-center/kdx-rae.mjs` invokes Claude Code non-interactively with `claude-opus-5` by default. One invocation is one bounded cycle.

### Specialists

- `.claude/agents/kdx-canon-keeper.md` — read-only truth/canon/provenance veto.
- `.claude/agents/kdx-vision-curator.md` — read-only North-Star/mockup/motion/navigation contract.
- `.claude/agents/kdx-runtime-architect.md` — single runtime write owner inside a WorkOrder.
- `.claude/agents/kdx-qa-gate.md` — independent validation and Experience Gate veto.

### Existing machinery reused

RAE must prefer existing mechanisms such as:

- `src/lib/kodex/grammar/work-order-contract.js`
- `scripts/kodex-auditoria-total.mjs`
- `scripts/kodex-inventario-ensamblaje.mjs`
- `scripts/kodex-visual-fidelity-gate.mjs`
- `scripts/kodex-trinquete.mjs`
- `scripts/kodex-equipo.mjs`
- `scripts/kodex-night-factory.mjs`
- `scripts/kodex-noche.mjs`

The Night Factory remains the finite/mechanical recovery layer. RAE adds bounded diagnosis, visual/canon comparison and dispatch; it does not remove the anti-regression constraints.

## Safety boundary

The unattended runner is deliberately unable to auto-approve:

- git add/commit/push/merge/rebase/reset/clean/checkout/switch/tag;
- rm/sudo;
- Wrangler/deploy;
- secret reads (`.env`, keys, PEM files);
- production release.

It uses Claude Code permission rules as an enforcement layer in addition to prompt instructions. Unknown permission prompts are denied in unattended mode.

RAE runtime logs live under `.kdx-rae/` and are ignored by git.

## Drive

Default evidence mirror:

`~/Trabajos-Aparte/KODEX/drive-pull/`

When it exists, the runner adds it as an additional Claude Code directory but explicitly denies Edit access to the entire absolute path. It is evidence, not a writable workspace. The agent must inspect freshness/metadata before treating an exported file as current authority.

Optional direct MCP bridge:

- `KDX_RAE_MCP_CONFIG=/absolute/path/to/read-only-mcp.json`
- `KDX_RAE_MCP_TOOLS=mcp__server__search,mcp__server__read`

When `KDX_RAE_MCP_CONFIG` is supplied, the runner uses `--strict-mcp-config`, so unrelated MCP servers are not inherited. Only explicitly listed tools should be allowlisted. Keep the Drive bridge read-only in v0.1.

If neither a current mirror nor a read-only connector is available, RAE must mark Drive freshness as unavailable rather than pretend it inspected Drive.

## Recommended iMac installation

Do **not** switch the main production worktree. Create a dedicated RAE worktree from the current RAE branch:

```bash
cd ~/kodex-work
git fetch origin
git worktree add -b feat/kdx-rae-v0-1-live ~/kodex-rae origin/feat/kdx-rae-v0-1-live
cd ~/kodex-rae
```

If the local branch already exists, use the existing branch in the worktree instead of recreating it.

Verify the environment:

```bash
node --version
claude --version
claude auth status
npm run rae:kodex:monitor
```

`rae:kodex:monitor` performs no Claude dispatch. It verifies branch, required infrastructure, runtime lock state and Drive-mirror availability.

Then run **one manual autonomous cycle**:

```bash
npm run rae:kodex:once
```

After it exits, inspect:

```bash
git status --short
git diff
cat .kdx-rae/state.json
cat .kdx-rae/events.ndjson
```

Only after this first-cycle inspection should the hourly LaunchAgent be installed.

## Commands

```bash
# Preflight only
npm run rae:kodex:monitor

# One Opus cycle, then exit
npm run rae:kodex:once

# Persistent in-terminal loop, hourly by default
npm run rae:kodex:loop
```

Environment controls:

```bash
KDX_RAE_MODEL=claude-opus-5
KDX_RAE_EFFORT=high
KDX_RAE_MAX_TURNS=20
KDX_RAE_MAX_BUDGET_USD=5
KDX_RAE_INTERVAL_SEC=3600
KDX_RAE_BRANCH=feat/kdx-rae-v0-1-live
KDX_RAE_DRIVE_DIR="$HOME/Trabajos-Aparte/KODEX/drive-pull"
```

The interval has a 15-minute hard minimum in the runner. Hourly is the v0.1 default.

## Cycle contract

Each cycle:

1. **OBSERVE** — branch, SHA, dirty work, audits, relevant Drive/reference evidence.
2. **COMPARE** — CURRENT vs DESIRED.
3. **CHOOSE** — one high-leverage divergence.
4. **BOUND** — instantiate one existing WorkOrder contract.
5. **DELEGATE** — use only necessary specialists.
6. **ACT** — one write owner, smallest coherent delta.
7. **VERIFY** — independent QA + existing gates appropriate to the change.
8. **RECORD** — machine-readable cycle result and local event log.
9. **STOP** — the next run re-observes rather than trusting conversational memory.

## Recursive improvement

RAE may improve its **procedure**, not Ocín's canon. It can log repeated failure modes such as redundant tool use, rejected visual deltas, validator failures or wasted cycles; propose a bounded process mutation; compare results; and keep/revert the workflow change.

It must never weaken a gate just to improve its metrics.

## Human gate

The following stay outside autonomous closure:

- creator canon mutation;
- unresolved cultural interpretation;
- unsupported scientific claim;
- protected artwork transformation outside approved contract;
- major experience-direction replacement;
- merge/deploy/public release;
- destructive repository operations.

These become `NEEDS_OCIN`, with the exact conflict and evidence.

## v0.1 success criterion

The system is useful when repeated cycles decrease real divergence without increasing regression or documentation noise. A successful cycle must make it possible to answer: what divergence was chosen, what bounded it, what changed, what tests actually ran, what evidence supports the result, and what single frontier comes next.
