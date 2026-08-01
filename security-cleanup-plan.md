# Security cleanup plan

Date: 2026-05-09
Author: this Claude session, read-only audit
Scope: Wenu Mapu ecosystem on this Mac (`/Users/user1`). No execution yet — this plan is a proposal.

---

## Top 3 risks (sorted by severity)

| # | Risk | Severity | Why |
|---|---|---|---|
| 1 | Cloudflare Tunnel **token in process arguments** AND in a **world-readable plist** | **CRITICAL** | Visible to every local process via `ps -ax`, and readable by any local user via `cat /Library/LaunchDaemons/com.cloudflare.cloudflared.plist`. Token grants tunnel control until rotated. |
| 2 | `wenu-agent-hub` has **5 stale `.env.*` backup files** not covered by `.gitignore` | HIGH | A single careless `git add .` would commit credentials for Telegram, OpenAI, Anthropic, Notion, Canva, internal webhook tokens. Currently untracked, but one mistake away from a leak. |
| 3 | **No structural credential isolation** anywhere — all secrets are plaintext files in `~/<project>/.env`, no Keychain, no separate secret store, multiple projects each with their own copy of overlapping secrets | MEDIUM | Hard to audit "where does the WC key live" or "which projects share the OpenAI key". A single project compromise leaks credentials for all of them. |

---

## Findings — verified with read-only commands

### 1. Cloudflared tunnel token exposure (CRITICAL)

**Two leak vectors, same token:**

- **Process arg leak.** The running daemon was launched with the token as a command-line argument:
  ```
  /usr/local/bin/cloudflared tunnel run --token <JWT>
  ```
  Visible to any local process via `ps -ax`. JWT prefix `eyJ…` was observed.

- **Plist file leak.** The token is persisted in:
  ```
  /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
  ```
  Owner `root:wheel`, **mode `-rw-r--r--` (644 — world-readable)**. Any local user can `cat` it and see the token.

**Two cloudflared services are registered**, only one of which is actually doing the work:

| LaunchDaemon | Source | Purpose | Token in args? |
|---|---|---|---|
| `system/com.cloudflare.cloudflared` | `cloudflared service install` | runs `cloudflared tunnel run --token <JWT>` | **YES** — this is the leaker |
| `gui/501/homebrew.mxcl.cloudflared` | `brew install cloudflared` (`brew services start`) | runs `cloudflared` with no args (effectively a no-op since cloudflared exits without args) | NO |

The `brew services` registration is dead weight. Only `com.cloudflare.cloudflared` keeps the tunnel up.

There is no `~/.cloudflared/` directory and no `cert.pem` — the tunnel is **remotely managed** (Cloudflare Zero Trust dashboard) rather than locally managed. That matters because the rotation procedure differs.

### 2. Stale `.env.*` backups in `wenu-agent-hub`

Files present (untracked):

```
.env                          gitignored ✅
.env.example                  fine (no real values)
.env.local-template           NOT gitignored
.env.bak                      NOT gitignored
.env.save                     NOT gitignored
.env.backup-20260417          NOT gitignored
```

`.gitignore` covers `.env`, `.env.local`, `.env.*.local`, `*.pem`, `*.key`, `secrets/`, `tokens/`. It does **not** cover `.env.bak`, `.env.save`, `.env.backup-*`, `.env.local-template`.

**Git history scan shows no `.env*` file has ever been committed** to either `wenu-agent-hub` or `wenu-frontend` (`wenu-frontend` only ever committed `.env.example`). So we have **no current leak in git history** — only a future-risk timebomb.

The keys these files contain (names only, no values): Telegram bot tokens, OpenAI / Anthropic API keys, Notion tokens, Canva tokens, WooCommerce keys, internal webhook secrets, Obsidian paths.

### 3. Other secret-bearing files

| Path | State | Risk |
|---|---|---|
| `~/wenu-frontend/.env` | mode 644, gitignored | low (single small file, dev-only WC keys) |
| `~/wenu-platform/.env` | mode 644, dir is **not a git repo** | low (Postgres + payment keys) |
| `~/wenumapu-system/.env`, `~/wenumapu_audit/.env`, `~/wenuos-system/scripts/n8n/.env` | mode 644, dirs are **not git repos** | low |
| `~/.continue/.env` | mode 600 ✅ | low (Continue.dev IDE plugin) |
| macOS Keychain | **no `cloudflared` or `wenu` entries** | — Keychain isn't used for any of this. |

No `.pem`, `.key`, or `*credentials*` files were found in scannable directories outside the projects above.

### 4. Other gitignore weaknesses

- `wenu-frontend/.gitignore` covers `.env`, `.env.production`. Missing: `.env.local`, `.env.*.local`, `.env.bak`, `.env.backup-*`, `*.pem`, `*.key`, `*.crt`. Low risk because nothing matching those patterns exists today, but the gap is real.
- The accumulated `*-report.md` files in `wenu-frontend/` (this file included) are not in `.gitignore`. They are intentionally trackable, but `aftercare-readiness-report.md` is currently untracked — confirm intent before any commit.

---

## Permission classification

| Action | Risk | Manual approval | Can be automated |
|---|---|---|---|
| Read plist files, run `ps`, run `git ls-files`, etc. | low | no | yes (already done) |
| Edit `.gitignore` files | low | YES, per file | yes after approval |
| Move `.env.bak` → `~/wenu-secrets-backup/` (out of repo) | low | YES | yes after approval |
| `chmod 600` plain `.env` files | low | YES | yes after approval |
| `cloudflared service uninstall` (the working one!) | **HIGH** | YES, manual only | **never** automate |
| `brew services stop cloudflared` (the dead one) | medium | YES | yes with approval |
| Tighten `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist` to mode 600 | medium | YES, requires `sudo` | yes with approval |
| Rotate tunnel token in Cloudflare Zero Trust dashboard | **HIGH** | YES, manual only — must be you | **never** |
| Migrate to locally-managed tunnel (cert.pem + credentials-file) | **HIGH** | YES, manual only | **never** |
| Stuff secrets into macOS Keychain via `security add-generic-password` | low | YES, per secret | yes with approval (you paste, I never see) |

---

## Inspection commands (safe to run now)

These are read-only. None modify state.

```bash
# Verify the leaks still exist
ps -ax | grep -E "cloudflared.*--token" | grep -v grep
ls -la /Library/LaunchDaemons/com.cloudflare.cloudflared.plist

# Verify no .env was ever committed
git -C ~/wenu-agent-hub log --all --pretty=format: --name-only --diff-filter=A | grep -E "\.env" | sort -u
git -C ~/wenu-frontend log --all --pretty=format: --name-only --diff-filter=A | grep -E "\.env" | sort -u

# Verify the duplicate service situation
brew services list | grep -i cloudflared
sudo launchctl list | grep -i cloudflared      # requires sudo, optional

# Verify keychain has nothing for these systems
security find-generic-password -s "cloudflared" 2>&1
security find-generic-password -s "wenu" 2>&1

# List which .env-shaped files exist anywhere reachable
find ~ -maxdepth 3 -name ".env*" -not -path "*/node_modules/*" -not -path "*/.Trash/*" -not -path "*/Library/*" 2>/dev/null

# Confirm wenu-agent-hub gitignore content
cat ~/wenu-agent-hub/.gitignore
```

---

## Execution plan (in priority order — DO NOT RUN YET)

Each step lists exact commands. Run only after explicit approval, in order, one block at a time.

### Step A — Stop the leak vector that doesn't break anything (LOW RISK)

Tighten the plist file permissions so only root can read it. Does **not** rotate the token, does **not** stop the tunnel.

```bash
# Read current state
ls -la /Library/LaunchDaemons/com.cloudflare.cloudflared.plist

# Restrict to root-only read
sudo chmod 600 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
ls -la /Library/LaunchDaemons/com.cloudflare.cloudflared.plist   # expect -rw------- root wheel
```

**Effect:** removes the world-readable plist leak. Process-argument leak (`ps`) still present until Step C.
**Rollback:** `sudo chmod 644 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist`

### Step B — Remove the duplicate dead cloudflared service (LOW RISK)

The brew-services registration runs `cloudflared` with no args and doesn't carry the tunnel. Removing it does not affect the tunnel.

```bash
# Verify which is the working one
ps -ax | grep cloudflared | grep -v grep

# Stop the dead brew-services one (the active --token process is the OTHER one, so this is safe)
brew services stop cloudflared
brew services list | grep cloudflared   # expect: not in list, or "stopped"

# Verify tunnel is still up
ps -ax | grep -E "cloudflared.*tunnel.*run" | grep -v grep   # expect 1 line
curl -sI https://wenuos.wenumapuonline.com | head -3         # expect HTTP/2 200 or similar
```

**Effect:** one fewer registered launch agent, no behavior change.
**Rollback:** `brew services start cloudflared`

### Step C — Rotate the tunnel token via Cloudflare dashboard (HIGH RISK — YOU DO IT)

This is the only way to invalidate the leaked token. The procedure depends on whether you want to keep the same tunnel UUID or recreate it.

**Manual procedure (your hands, not mine):**

1. Open Cloudflare Zero Trust dashboard → **Networks → Tunnels**.
2. Find the tunnel currently named for `wenuos.wenumapuonline.com` (UUID format: `fd7eb657-…` per existing process arg, do not document the full UUID here).
3. Choose the safer-of-two path:
   - **Path C1 — Refresh connector token** (if your dashboard exposes this option): generates a new token for the same tunnel UUID. Routes and DNS unchanged.
   - **Path C2 — Delete and recreate**: delete the tunnel, create a new one with the same hostname routes, copy the new token.
4. Copy the new token to your clipboard. Do not paste it into chat.

I will guide you visually through this via the Chrome MCP if you want — say the word and I will open the dashboard.

**Effect:** old token becomes useless. Any attacker who already exfiltrated it loses access.
**Rollback (token rotation has no clean rollback):** if the new token doesn't work, the previous tunnel may still have a connector running on the old token until Cloudflare propagates the rotation. Do not touch the daemon yet — do that in Step D only after the new token is in hand.

### Step D — Install the new token without putting it on the command line (MEDIUM RISK)

Two options. Pick one before running.

#### Option D1 — Stay on remotely-managed tunnel, hide token in a root-only file

```bash
# 1. Stop the leaking service
sudo launchctl bootout system/com.cloudflare.cloudflared

# 2. Replace the plist with one that reads the token from a separate file.
#    Save the new token to /etc/cloudflared/.token (root-only) FIRST.
sudo mkdir -p /etc/cloudflared
sudo touch /etc/cloudflared/.token
sudo chmod 600 /etc/cloudflared/.token
sudo chown root:wheel /etc/cloudflared/.token
# Then paste the token into that file with `sudo nano /etc/cloudflared/.token` (you, not me).

# 3. Replace the LaunchDaemon plist with a wrapper that reads the file.
#    Cloudflared cannot read tokens from a file directly via --token, so use
#    `cloudflared --config /etc/cloudflared/config.yml tunnel run <UUID>` instead,
#    backed by a credentials-file. That's actually Option D2 — see below.
```

D1 is awkward because cloudflared has no `--token-file` flag. The honest answer is: with a remotely-managed tunnel, you cannot avoid `--token` on the command line cleanly. So stay on D1 only if you accept that the token is still in `ps`, and the only thing you've changed is that someone needs to be on the box to read it.

#### Option D2 — Migrate to locally-managed tunnel (recommended)

Locally-managed tunnels use a `cert.pem` + a per-tunnel credentials JSON file. Neither shows up in `ps`.

```bash
# 1. Authenticate cloudflared once (opens browser)
cloudflared tunnel login   # writes ~/.cloudflared/cert.pem (mode 600, user-owned)

# 2. Create a tunnel (or import existing UUID)
cloudflared tunnel create wenuos-mac
#   → writes ~/.cloudflared/<UUID>.json (mode 600). This file replaces the token.

# 3. Write /etc/cloudflared/config.yml with the route mapping
sudo tee /etc/cloudflared/config.yml > /dev/null <<'YAML'
tunnel: <UUID>
credentials-file: /etc/cloudflared/<UUID>.json
ingress:
  - hostname: wenuos.wenumapuonline.com
    service: http://localhost:3333
  - service: http_status:404
YAML
sudo chmod 600 /etc/cloudflared/config.yml

# 4. Move the credentials file to /etc/cloudflared (root-owned)
sudo mv ~/.cloudflared/<UUID>.json /etc/cloudflared/
sudo chown root:wheel /etc/cloudflared/<UUID>.json
sudo chmod 600 /etc/cloudflared/<UUID>.json

# 5. Update DNS routes (still at Cloudflare)
cloudflared tunnel route dns <UUID> wenuos.wenumapuonline.com

# 6. Reinstall the service to use the config file (no --token)
sudo launchctl bootout system/com.cloudflare.cloudflared
sudo cloudflared service install   # this time it picks up /etc/cloudflared/config.yml
sudo chmod 600 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.cloudflare.cloudflared.plist

# 7. Verify
ps -ax | grep cloudflared | grep -v grep   # expect NO --token in args
curl -sI https://wenuos.wenumapuonline.com | head -3
```

**Effect:** tunnel runs with a root-only credentials file. No token in `ps`, no token in plist.
**Rollback:** keep a copy of the old plist before bootout. If anything fails, `sudo cp <backup>.plist /Library/LaunchDaemons/com.cloudflare.cloudflared.plist && sudo launchctl bootstrap system /Library/LaunchDaemons/com.cloudflare.cloudflared.plist` to restore.

#### Option D3 — Defer entirely, retire tunnel after Cloudflare Pages cutover

Per `deployment-readiness-report.md`, the tunnel exists to host the live site from this Mac. Once `wenumapuonline.com` is on Cloudflare Pages, the tunnel can be retired. If Pages cutover is imminent (days, not weeks), it may be cheaper to:

1. Step A only (`chmod 600` the plist) — stops the world-readable leak.
2. Wait until Pages is live.
3. `sudo cloudflared service uninstall` and delete the tunnel.

The token is still in `ps` during the wait, but only local processes see it, and the threat model is "what if someone gets shell access" — which is bad anyway.

### Step E — Lock down `wenu-agent-hub` env backups (LOW RISK)

```bash
# 1. Add patterns to .gitignore
cat >> ~/wenu-agent-hub/.gitignore <<'EOF'

# Backup/template variants of .env that must never be committed
.env.bak
.env.save
.env.backup-*
.env.local-template
EOF

# 2. Verify .gitignore now hides the existing files
git -C ~/wenu-agent-hub status --short --branch    # expect no `??` lines for .env.*

# 3. Move backups out of the repo (don't delete — preserve in case of recovery need)
mkdir -p ~/wenu-secrets-backup
mv ~/wenu-agent-hub/.env.bak \
   ~/wenu-agent-hub/.env.save \
   ~/wenu-agent-hub/.env.backup-20260417 \
   ~/wenu-agent-hub/.env.local-template \
   ~/wenu-secrets-backup/
chmod 700 ~/wenu-secrets-backup
chmod 600 ~/wenu-secrets-backup/.env.*

# 4. Verify primary .env still works (run an existing health check or the bot smoke test)
cd ~/wenu-agent-hub
node -e "require('dotenv').config(); console.log('TELEGRAM_BOT_TOKEN set:', !!process.env.TELEGRAM_BOT_TOKEN)"
```

**Effect:** repo cannot accidentally commit backups; backups still recoverable from `~/wenu-secrets-backup`.
**Rollback:** `mv ~/wenu-secrets-backup/.env.* ~/wenu-agent-hub/`.

### Step F — Tighten file permissions on remaining `.env` files (LOW RISK)

```bash
chmod 600 ~/wenu-frontend/.env
chmod 600 ~/wenu-agent-hub/.env
chmod 600 ~/wenu-platform/.env
chmod 600 ~/wenumapu-system/.env
chmod 600 ~/wenumapu_audit/.env
chmod 600 ~/wenuos-system/scripts/n8n/.env

# Verify
ls -la ~/wenu-frontend/.env ~/wenu-agent-hub/.env ~/wenu-platform/.env
```

**Effect:** other macOS users on this machine (none today, but) cannot read these files.
**Rollback:** `chmod 644 <path>`.

### Step G — Harden `.gitignore` defensively across projects (LOW RISK)

For both `wenu-frontend/.gitignore` and `wenu-agent-hub/.gitignore` (and any other project that gets a remote later), ensure:

```gitignore
# Secrets — defense in depth
.env
.env.local
.env.*.local
.env.bak
.env.save
.env.backup-*
.env.local-template

# Crypto material
*.pem
*.key
*.crt
*.p12
*.pfx
secrets/
tokens/
.cloudflared/
```

`wenu-agent-hub/.gitignore` already covers most of this. `wenu-frontend/.gitignore` only covers `.env` and `.env.production` and should be expanded.

---

## Recommended credential storage model (forward-looking)

| System | Today | Recommended target | Notes |
|---|---|---|---|
| **Cloudflare Tunnel** | `--token` in plist (CRITICAL) | locally-managed tunnel: `/etc/cloudflared/<UUID>.json` (mode 600, root) + `/etc/cloudflared/config.yml` | Step D2 above. Or retire tunnel entirely after Pages cutover (D3). |
| **Cloudflare API token** (for `wrangler` / Pages CI) | none stored | macOS Keychain: `security add-generic-password -s cloudflare-api -a wenu` | Created on first need. Use a scoped, expiring token (Account Pages: Edit, Zone DNS: Read). |
| **WooCommerce REST keys** | `wenu-frontend/.env` (mode 644 → 600) | (a) Keep `.env` for local dev; (b) Cloudflare Pages encrypted env vars for builds | Keys are read-only and scoped to `read_products`. Confirm scope in WP admin → WooCommerce → Settings → Advanced → REST API. |
| **GitHub** | nothing yet | `gh auth login` writes a token into macOS Keychain (encrypted at rest). Or a project-scoped SSH deploy key in `~/.ssh/wenu-frontend-deploy` (mode 600). | When adding a remote to `wenu-frontend`, prefer SSH key per project, not a global PAT. |
| **n8n** | `.env` in `wenuos-system/scripts/n8n/.env` (mode 644 → 600) | n8n natively supports credential encryption: set `N8N_ENCRYPTION_KEY` (in env) so all credentials added through the UI are encrypted at rest in the SQLite db. | Don't put per-service tokens in plain `.env` if the n8n UI can hold them. |
| **Obsidian agents (Telegram, OpenAI, Anthropic, Notion, Canva)** | `wenu-agent-hub/.env` | Phase 1: `.env` mode 600 + the gitignore additions in Step E. Phase 2: migrate the high-value tokens (Telegram, Anthropic, OpenAI) to macOS Keychain and read them via `security find-generic-password -w -s <name>` at process start. | Keychain integration is incremental — start with the most expensive-to-rotate tokens. |
| **Wenu Platform** (Postgres, MercadoPago, NowPayments, SMTP) | `wenu-platform/.env` (mode 644) | Step F brings to 600. Long term: secret manager or Docker secrets when this moves off the local Mac. | `wenu-platform` is **not** a git repo, so leak vector is local-only today. |

Three rules of thumb to apply going forward:

1. **One secret, one home.** Don't copy keys between project `.env` files. Pick a canonical project for each secret and have other consumers read from there.
2. **Gitignore by allowlist intent.** Treat any new file matching `*.env*`, `*.pem`, `*.key`, `*credential*`, `*token*` as untracked-by-default. Add it to `.gitignore` before creating it.
3. **No secrets on the command line.** `--token`, `--password`, `--api-key` arguments leak via `ps`. Use config files (mode 600) or stdin.

---

## Rollback summary

Every step in this plan has a single-command rollback documented inline. Critical ones:

- **A**: `sudo chmod 644 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist`
- **B**: `brew services start cloudflared`
- **C**: token rotation cannot be rolled back; the prior token is dead once you rotate. Mitigation: don't rotate until you have the new token in hand.
- **D2**: keep a copy of the old `com.cloudflare.cloudflared.plist` before `bootout`; restore + bootstrap if needed.
- **E**: `mv ~/wenu-secrets-backup/.env.* ~/wenu-agent-hub/`
- **F**: `chmod 644 <path>`

---

## What requires your manual approval

- **Step C (token rotation)** — Cloudflare dashboard. You only.
- **Step D (any variant) — anything involving `sudo` against `/Library/LaunchDaemons/`** — you only, with me guiding.
- **Step E + F + G** — I can prepare the exact `Edit`/`Write`/`Bash` calls, but each needs your explicit go-ahead before I execute.

## What can be automated safely (after you approve the plan as a whole)

- Editing `.gitignore` files (Step G).
- Moving `.env.bak` etc. to `~/wenu-secrets-backup/` (Step E parts 1–3).
- `chmod 600` on the `.env` files (Step F).
- Verification commands (everything in the "Inspection" section).

## What must never be automated

- `cloudflared service uninstall`
- `sudo launchctl bootout system/com.cloudflare.cloudflared`
- token rotation in the Cloudflare dashboard
- `git push` of any branch carrying `.gitignore` changes (you commit, you push)

---

## Suggested execution order (when you're ready)

1. Approve this plan.
2. Run **Step A** (chmod 600 on the plist) — instant, no downtime, removes the world-readable leak.
3. Run **Step B** (stop dead brew-services cloudflared) — removes duplicate launch agent.
4. Run **Step E + F + G** in one batch (env backups + permissions + gitignore) — pure local hygiene.
5. Decide between **D2 (migrate tunnel)** and **D3 (defer + retire after Pages)**. If D3, stop here and proceed to the Pages cutover work track.
6. If D2: schedule a 15-minute window, run **Step C → D2** end-to-end, verify the site comes back.
