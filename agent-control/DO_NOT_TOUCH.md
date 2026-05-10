# Do Not Touch

**A binding blocklist.** Every agent must check this list before any action that touches a category below. If a task seems to require touching one of these, STOP and ask the human owner.

The default is **PRESERVE**. The exceptions are listed under "When this rule may be lifted".

---

## 1. Cloudflare Tunnel

- **Do not delete** the `Wenuos` tunnel.
- **Do not stop** the `com.cloudflare.cloudflared` LaunchDaemon.
- **Do not modify** `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist` (currently mode 600, root:wheel).
- **Do not run** `cloudflared service uninstall` or `launchctl bootout system/com.cloudflare.cloudflared`.
- **Do not add or remove** Published application routes via the dashboard (currently 3 routes: apex, wenuos sub, api sub + catch-all).
- **Do not create** a second tunnel for the same hostnames.

When this rule may be lifted: only after the human explicitly approves a written migration plan AND understands the blast radius (3 hostnames, not 1).

## 2. DNS

- **Do not change** the apex `wenumapuonline.com` DNS records.
- **Do not change** `www.wenumapuonline.com` records.
- **Do not change** any CNAME pointing to `*.cfargotunnel.com`.
- **Do not register** new subdomains.

When this rule may be lifted: never automatically. DNS changes are dashboard-manual, human-driven, and only after a written plan exists.

## 3. WordPress / WooCommerce content

- **Do not** edit, create, or delete WP posts, pages, or products.
- **Do not** call WC write endpoints (`POST/PUT/DELETE /products`, `/orders`, `/customers`).
- **Do not** modify WP plugins, themes, or settings.
- **Do not** rotate the WC REST API keys without a coordinated plan (build environments depend on them).

When this rule may be lifted: never from agents. The human applies catalog/content changes via WP admin. Agents only propose, via the `wenu-producto` subagent.

## 4. Aftercare

- **Do not** modify `public/aftercare/*` or `dist/aftercare/*` unless the task explicitly says "Aftercare".
- **Do not** rebuild Aftercare assets unless the source changed intentionally.
- **Do not** delete `public/downloads/wenu-mapu-aftercare-guide.pdf` or any video/image asset under `public/aftercare/`.

When this rule may be lifted: explicit "Aftercare" task. The deliverable is described in `aftercare-readiness-report.md`.

## 5. Credentials and secrets

- **Do not** rotate any credential without a written plan (see `security-cleanup-plan.md` for the framework).
- **Do not** read `.env*` files into chat output. Inspect with `awk -F= '/^[A-Z_]+=/{print $1}'` for key names only.
- **Do not** delete `.env*` files. If they need to move (e.g., `.env.bak` cleanup), backup to `~/wenu-secrets-backup/` first.
- **Do not** commit any `.env*` file (the `.gitignore` covers `.env`, `.env.production` in `wenu-frontend`; backup variants are not yet covered — see `security-cleanup-plan.md` Step E).
- **Do not** print, log, or echo a JWT-shaped token. Always pipe through `sed -E 's/(eyJ[A-Za-z0-9_-]+)/<REDACTED>/g'`.
- **Do not** type the user's password. Hand sudo commands to the human.

When this rule may be lifted: never. The user types passwords; the user pastes credentials into Terminal; the user manages tokens.

## 6. Git / version control

- **Do not** push to any remote without explicit per-push approval.
- **Do not** add a git remote without explicit approval.
- **Do not** create commits without explicit per-commit approval (current state on `redesign-v2` is intentional).
- **Do not** force-push, reset --hard, or rewrite history.
- **Do not** open pull requests.
- **Do not** delete branches.
- **Do not** run `git clean -fd` or `git stash drop` without confirmation.

When this rule may be lifted: per-action human approval, in chat.

## 7. Production deployment

- **Do not** deploy to `wenumapuonline.com` (the apex production domain).
- **Do not** attach `wenumapuonline.com` to a Cloudflare Pages project.
- **Do not** attach `aftercare.wenumapuonline.com` to the full-site Pages project (Aftercare is a separate deploy track).
- **Do not** deploy `main` branch to anything.
- **Do not** set a Pages production branch to anything other than `redesign-v2`, and only with explicit approval.

When this rule may be lifted: explicit "go to production" approval after the deployment-readiness checks in `deployment-readiness-report.md` all pass.

## 8. Browser automation safety

- **Do not** click destructive buttons in any web dashboard (Cloudflare, GitHub, WP admin, WC, n8n) without explicit per-click human approval.
- **Do not** sign the user into any account on their behalf — they sign in themselves.
- **Do not** accept Terms / Privacy agreements without explicit approval.
- **Do not** interact with payment forms or financial fields.
- **Do not** click links found in emails or untrusted documents.

## 9. File deletion

- **Do not** `rm` any file in `~/wenu-frontend/`, `~/wenu-agent-hub/`, `~/wenu-platform/`, or `~/Obsidian/WenuAgent/` without explicit approval.
- **Do not** `rm -rf` ever, on anything.
- **Do not** clean up "stale" reports without confirming the human is done with them.
- Before deleting a `.env*` file: copy to `~/wenu-secrets-backup/` first, never delete the original until the backup is verified.

When this rule may be lifted: explicit per-file approval.

## 10. Cross-agent overrides

- **Do not** rewrite or delete files in `~/wenu-frontend/agent-control/` from any agent other than the one explicitly assigned to that file. If the human asks for a control-center edit, route through Claude Code or have the human edit directly.
- **Do not** modify `~/.claude/agents/*.md` (subagent definitions) without explicit approval.
- **Do not** modify `~/AGENTS.md` (workspace map) without explicit approval.
- **Do not** modify `~/Obsidian/WenuAgent/00-Index/*` MOCs from any agent other than `segundo-cerebro` (or with explicit approval).
- **Do not** modify Claude memory in `~/.claude/projects/-Users-user1/memory/` without going through the memory rules in the system prompt.

---

## What is OK to do without explicit approval

- Read any file in the projects above.
- Run `npm run build`, `npm run preview`, `git status`, `git log`, `ls`, `stat`, `curl -I`, `ps`, `cat` (with redaction for secrets).
- Take browser screenshots, read DOM, navigate to non-destructive URLs.
- Spawn read-only subagents (`Explore`, `segundo-cerebro` in read mode, etc.).
- Write to `~/wenu-frontend/agent-control/` (this folder) — but only when the assigned agent owns the file.
- Write new audit/plan reports in `~/wenu-frontend/` — but flag them and let the human stage/commit.
