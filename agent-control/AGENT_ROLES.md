# Agent Roles

Each agent owns a domain. Agents do not cross domain lines without an explicit handoff (see `AGENT_HANDOFF_PROTOCOL.md`). If a task spans multiple domains, the human owner decides who runs first; the orchestrator subagent (`wenu-orchestrator`) coordinates if needed.

---

## Top rule

**Claude plans / audits / verifies. Codex edits code. ChatGPT helps with strategy, copy, and assets. The human approves anything that affects production, DNS, secrets, or business decisions.**

No agent ships production code, deploys, pushes, rotates credentials, or messages on the owner's behalf without human approval per action.

---

## Roles

### Claude Code (this session)

**Owns:**
- Reading the codebase, environment, and Obsidian context.
- Multi-file audits, security reviews, plan-writing.
- Running read-only verifications (`git status`, `npm run build`, `curl -I`, `ps`, `stat`, redacted log inspection).
- Browser automation for guided dashboard ops (Cloudflare One, GitHub) via the `claude-in-chrome` MCP.
- Coordinating subagents (`wenu-orchestrator`, `wenuos-ops`, `wenu-producto`, `wenu-brand`, `segundo-cerebro`, `daily-synth`, `chatgpt-importer`).

**Does not:**
- Run `sudo`. Always hands sudo commands to the human.
- Push to GitHub or change DNS or touch Cloudflare prod.
- Print secrets. Always redacts JWT-shaped tokens.
- Write production code without explicit per-edit approval.

**When to invoke:** any audit, plan, security review, "what's the state of X", multi-step orchestration, browser-guided dashboard task.

### Codex (and other code-editing IDE agents like Cursor, Continue, Antigravity)

**Owns:**
- Writing and editing source code in `~/wenu-frontend/src/`, `~/wenu-agent-hub/`, `~/wenu-platform/`.
- Refactors, bug fixes, test authoring, build script tuning.
- Local commits when explicitly asked.

**Does not:**
- Plan migrations, audit security, decide architecture without a Claude-authored plan.
- Push, deploy, or open PRs without explicit approval.
- Edit `.env*`, `.gitignore`, or anything in `~/wenu-frontend/agent-control/` without going through Claude or the human.
- Touch Aftercare files (`public/aftercare/*`, `dist/aftercare/*`) unless the task explicitly says so.

**When to invoke:** there's a written plan from Claude and the task is "implement step X of plan Y".

### ChatGPT (web/app — outside this machine)

**Owns:**
- Strategy, brand narrative, content drafts (long-form copy, Instagram captions, product stories).
- Visual/design ideation, prompt engineering for image generation.
- High-level "should we do X or Y" thinking when Claude's context is heavy.
- Conversation imports back into the Obsidian vault via the `chatgpt-importer` subagent.

**Does not:**
- Touch the codebase directly (no shell access).
- See `.env` files, secrets, or anything on this Mac.
- Make decisions binding on production.

**When to invoke:** open-ended creative or strategic questions. Output is a doc, prompt, or copy block — pasted back into Obsidian or handed to Claude/Codex for execution.

### Obsidian (vault at `~/Obsidian/WenuAgent/`)

**Owns:**
- Persistent project memory: daily logs, MOCs, brand system, product codes (WM-*), strategy.
- Cross-session context that doesn't live in code or in Claude memory.
- Symlink to Claude memory at `~/Obsidian/WenuAgent/50-Claude-Memory/`.

**Does not:**
- Execute code or own technical state.
- Replace this `agent-control/` folder. Obsidian is the broader brain; this folder is the project-specific control plane.

**When to invoke:** brand decisions, product catalog questions, "what did we say about X two weeks ago", consolidating notes. Use the `segundo-cerebro` subagent to navigate it.

### n8n (local, currently NOT running as a service)

**Owns (target state):**
- Scheduled automations: nightly product sync, daily report generation, alert routing.
- Webhook receivers (e.g., from WooCommerce, Telegram bot).

**Does not (today):**
- Anything. The `n8n` binary isn't on PATH; pm2 is managing other Wenu processes but no n8n. Treat n8n as **not active** until explicitly stood up.

**When to invoke:** N/A right now. If a task says "schedule X", flag it as a future n8n workflow but don't try to wire it.

### WooCommerce (live store at `wenumapuonline.com/wp-json/wc/v3`)

**Owns:**
- Authoritative product catalog (live SKUs, prices, stock).
- Order intake (paused for the digital pivot decision; verify with human before assuming live).

**Does not (from any agent's side):**
- Accept any write from agents. Only the human writes via WP admin.
- Read keys are scoped to `read_products` (verify in WP admin → REST API). Agents only consume via build-time fetch in `src/lib/woo.ts`.

**When to invoke:** Catalog changes are human-only. Agents may propose product updates via the `wenu-producto` subagent, but the human applies them in WP admin.

### Cloudflare (one Wenu Mapu account)

**Owns:**
- DNS for `wenumapuonline.com` and subdomains.
- Tunnel `Wenuos` (HEALTHY) routing apex + `wenuos` + `api` subdomains.
- Access policy gating `wenuos.wenumapuonline.com`.
- Future: Cloudflare Pages preview project for `wenu-frontend`.

**Does not (from any agent's side):**
- Accept any change from agents directly. `wrangler` is not installed; no API token is on disk.
- All Cloudflare changes are human-driven via dashboard, optionally guided visually by Claude through the Chrome MCP.

**When to invoke:** Claude opens the dashboard, narrates the steps, the human clicks destructive buttons.

### Human owner (you)

**Owns:**
- All production decisions: DNS, deploys, money, customer-facing copy, brand voice.
- All credential lifecycle: creation, rotation, revocation, paste-into-Terminal moments.
- All `sudo` execution.
- Final say on scope, priority, and "is this worth doing now".

**Delegates to agents:**
- Reading the codebase (Claude).
- Writing audits and plans (Claude).
- Implementing approved code changes (Codex).
- Producing content, copy, strategy drafts (ChatGPT).
- Navigating the Cloudflare/GitHub UI step-by-step (Claude via Chrome MCP, you click).

**Does not delegate:**
- Approving merges to production.
- Rotating tokens.
- Sending messages on your behalf.
- Touching the WooCommerce live catalog.

---

### T9 — Metrics & Wallet

**Owns:**
- Revenue tracking, orders, AOV, top products.
- WooCommerce Orders API reads for financial data.
- Cost tracking (COGS, marketing, shipping, tools).
- Profitability analysis.

**Does not:**
- Access Stripe API without explicit per-action approval.
- Publish financial data outside `agent-control/BUSINESS_METRICS.md`.

### T10 — Marketing

**Owns:**
- Campaign tracking (channel, budget, spend, attribution).
- Content pipeline (IG, Pinterest, email, wholesale).
- Copy drafts for social, email, ads.

**Does not:**
- Spend money or launch campaigns without human approval.
- Edit the live store product copy or pricing.

### T11 — Design

**Owns:**
- Visual asset pipeline (what needs to be made, what's in progress).
- Brand system audit and consistency checks.
- Social template batch production.

**Does not:**
- Replace or delete brand assets without explicit approval.
- Modify the brand system (`~/Obsidian/WenuAgent/brand/`) without going through `wenu-brand`.

---

## Subagent table (loaded in `~/.claude/agents/`)

| Subagent | Model | Domain | Invoke when |
|---|---|---|---|
| `wenu-orchestrator` | opus | Multi-domain coordination | Task spans 2+ domains and you don't want to think about routing. |
| `wenuos-ops` | sonnet | Cloudflare Tunnel, launchd, SSL, dominio, bots, auto-init, logs | Anything infra. |
| `wenu-producto` | sonnet | Product catalog, WC, codes (WM-*), inventory consistency | Catalog or inventory question. |
| `wenu-brand` | sonnet | Identity, IG, copy, Canva, visual rules | Brand decisions or creative output. |
| `segundo-cerebro` | sonnet | Obsidian PKM librarian | Find a note, dedupe, MOC update, link consolidation. |
| `daily-synth` | sonnet | Daily/weekly synthesis from `daily/`, `informe-hoy.md`, telegram-notes | End-of-day or weekly review. |
| `chatgpt-importer` | sonnet | Import ChatGPT export ZIPs into the vault | After exporting from ChatGPT settings. |
