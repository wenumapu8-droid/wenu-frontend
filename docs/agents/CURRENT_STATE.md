# CURRENT STATE — KODEX−∞ + WËNU MAPU

Last verified: 2026-08-11.  
Purpose: fast operational truth for agents. Update when implementation, blockers, production state or ownership materially changes.

> This file is not canon. It is a verified snapshot. Re-check GitHub/Linear before acting on anything time-sensitive.

---

## 1. Repository / deployment topology

Primary active repository: `wenumapu8-droid/wenu-frontend`.

Current WËNU MAPU frontend stack on `redesign-v2`:

- Astro 6.2.1 SSG;
- Node pinned to 24.14.1 via `.nvmrc`;
- WooCommerce REST is the product-data source at build time;
- public site: `wenumapuonline.com`;
- Cloudflare Pages deployment is Direct Upload (`deploy-now.sh` / Wrangler), not automatic on `git push`;
- production workflow currently uses `redesign-v2`; do not assume `main` is the deployed version;
- product fetch/build safety exists to prevent silent zero-product output;
- mobile, structured data, image optimization and reduced-motion behavior are already part of the frontend contract.

Do not modify deployment behavior from memory. Read current `CLAUDE.md`, scripts and the active issue/PR first.

---

## 2. WËNU MAPU implementation state

Verified from current repository documentation:

- canonical dark-first token system exists in `src/styles/tokens.css`;
- current type system uses Instrument Serif, Cormorant Garamond, Instrument Sans and JetBrains Mono;
- WooCommerce access is centralized in `src/lib/woo.ts` and should not be changed casually;
- product pages, shop, contact, local/pickup, search index, sitemap and structured-data work exist;
- current architecture includes image cleanup/AVIF generation and explicit performance work;
- `src/i18n/en.json` + `src/i18n/mapudungun.json` exist;
- current category direction includes Piercing, Hangers, Ear Weights, Amulets and Ritual Pieces;
- frontend work is further advanced than the default-branch README suggests; prefer active branch/docs over stale starter text.

Operational WËNU MAPU principle: keep commerce truthful and usable while evolving the visual system.

---

## 3. KODEX code footprint

On the active WËNU MAPU/KODEX line, `src/kodex/` currently contains specialized modules including:

- `ascii/`
- `audio/`
- `crt/`
- `engine/`
- `observe-v2/`
- `return/`
- `shaders/`
- `threshold-portal/`
- `treatments/`

Other active/experimental KODEX work also exists in `src/lib/kodex/`, routes, data and feature branches. Do not infer system completeness from one directory.

---

## 4. Active KODEX lanes visible in GitHub

The repository currently has multiple open KODEX PRs/branches. Important examples include:

### PR #54 — HEART CHAMBER plate-to-live v1

- Uses an approved/canonical Heart Chamber plate as source of truth.
- Adds a noindex lab route.
- Uses Canvas2D live augmentation instead of redrawing the heart.
- Simulated BPM/coherence is explicitly labelled `SIM`.
- Deployment is blocked.
- Important pattern: approved plate → minimal meaningful live layer → browser evidence → integration decision.

### PR #53 — THRESHOLD closure candidate

- Combines recovered authored WebGL renderer with current voluntary-entry semantics.
- Keeps public `/kodex/` untouched.
- Requires build + browser captures at desktop and mobile sizes.
- No deployment from the PR.

### PR #52 — shared KODEX contracts

- Recreates/normalizes node loading, signals, memory, scene-state typing and node route work.
- Includes a closed epistemic claim-class vocabulary.
- Contains a 54-node atlas lane.
- Draft/no deploy.

### PR #51 — Effect Foundry motors wired into folio scenes

- Wires living visual engines into PROLOGUE, DESCENT, MACHINE and RETURN folios.
- Includes programmatic visual verification artifacts.
- Still needs aesthetic/creator-level review.

### PR #48 — build / browser evidence kit

- Encodes known screenshot/browser pitfalls and repeatable viewport auditing.
- Useful as infrastructure for cross-agent QA.
- Important because visual completion must be evidenced on real target viewport behavior.

### PR #46 — recovered authored WebGL Threshold engine

- Recovers previously authored GPU assets instead of inventing a new portal.
- Keeps work on noindex lab routes and avoids public replacement until comparison/evidence.

### PR #44 / related node-graph lanes

- Demonstrates that earlier empty node routes were caused by loader/build behavior rather than missing concepts.
- Recovers authored graph/edge information.
- Also surfaced cultural-review and sensitivity distinctions that must not be flattened into one “critical = blocked” rule.

### PR #43 — test runner / CI wiring

- Identifies that evidence claims are weak without reproducible test/build infrastructure.
- Also notes documentation drift around CI/offline build behavior that must be reconciled, not silently ignored.

### PR #42 — JourneyState / memory bridge lane

- Identifies incompatible journey-memory APIs coexisting across branches.
- This is a real architecture lineage risk: do not wire more stateful behavior until the authoritative lineage is verified.

---

## 5. Current systemic condition

KODEX has moved beyond “idea only.” There are real engines, routes, graph data, visual plates, QA artifacts and state prototypes.

The main risk is now **fragmentation rather than lack of material**:

- multiple branches can contain valid but incompatible implementations;
- visual work can diverge from approved plates if agents regenerate from prose;
- a generated route can look complete without having browser evidence or creator acceptance;
- state/memory implementations can diverge;
- old instructions can remain technically true for one branch and false for another;
- cultural/scientific content needs provenance and epistemic handling as the archive grows.

Therefore the current strategic job is **convergence**.

---

## 6. Current workflow integration

This branch introduces a permanent cross-agent memory layer:

- root `AGENTS.md` — universal bootstrap;
- `docs/agents/KIMI_MASTER_CONTEXT.md` — durable constitution;
- `docs/agents/CURRENT_STATE.md` — this file;
- `docs/agents/PRIORITIES.md` — next-action hierarchy;
- `docs/agents/LEARNINGS.md` — durable discoveries and traps.

Branch created for this integration: `agent/kimi-workflow-context`.

This documentation is not operationally permanent until reviewed/merged into the active lineage.

---

## 7. What Kimi should verify at session start

Before doing work, Kimi should answer internally:

1. Which repo/branch/PR is authoritative for this task?
2. Is there already an implementation lane for the same component?
3. What is the approved visual/canonical source?
4. What does the Linear acceptance contract require?
5. Is deployment allowed, blocked or not requested?
6. What browser/build/test evidence already exists?
7. Is there an unresolved lineage conflict?
8. Does the task touch culture, factual claims, customer safety or product-material truth?
9. What durable learning should survive after this task?

If these cannot be answered from connected sources, do not guess.