# Cloudflared local-managed migration plan

Date: 2026-05-09
Status: planning only — no execution
Author: Claude Code session, after Step A (plist chmod 600) + Step B (brew dead-service stop) + Cloudflare dashboard inspection

---

## Why this plan exists

The Wenu Mapu Cloudflare Tunnel ("Wenuos") is currently a **remotely-managed** cloudflared tunnel: the connector daemon authenticates with a long-lived JWT token passed on the command line. That token leaked into a chat transcript and is treated as compromised. The Cloudflare One UI does not expose a "Rotate token" action for this tunnel type. Path B (dashboard delete + recreate) was rejected because the same tunnel hosts three production hostnames, including the apex `wenumapuonline.com`.

Path C — **migrate to a locally-managed tunnel** — is the cleanest long-term fix. It eliminates the `--token` model entirely, removes the daemon's command-line secret, and puts credentials in a root-only file. This document is the precise migration plan, not the execution.

---

## 1. Current state snapshot (verified read-only)

| Item | Value |
|---|---|
| Tunnel name | `Wenuos` |
| Tunnel UUID | `fd7eb657-88ad-4f01-9d4b-9431ceef445b` (not secret; appears in DNS CNAME targets) |
| Cloudflare account ID | `68d502a80b1badf06df7795aeb91d96c` (not secret) |
| Tunnel type | `cloudflared` (remotely-managed; `config_src = cloudflare`) |
| Status | HEALTHY, 2 days uptime |
| Single connector | UUID `23c96575-2578-4dda-a48e-f764a04ab227` on host `User1s-iMac`, version `2026.3.0`, darwin_amd64, running from data centers `sjc06,sjc08,sjc05,sjc01` |
| Published application routes (the hostnames this tunnel serves) | three rows — see table below |
| Cloudflare Access | confirmed gating `wenuos.wenumapuonline.com` (HTTP 302 → `wenuos.cloudflareaccess.com/cdn-cgi/access/login/...`); status of apex/api Access policies not enumerated |
| LaunchDaemon plist | `/Library/LaunchDaemons/com.cloudflare.cloudflared.plist`, owner `root:wheel`, **mode `-rw-------` (Step A done)** |
| Daemon process | `/usr/local/bin/cloudflared tunnel run --token <REDACTED-JWT>` (token is in `ProgramArguments` of the plist and in `ps -ax`) |
| Brew duplicate service | already stopped (Step B done) |
| Risk that justifies this plan | the JWT token was exposed in chat transcript, so it must be considered compromised |

### Published application routes

| # | Hostname | Path | Service / origin |
|---|---|---|---|
| 1 | `wenumapuonline.com` | `*` | `http://localhost:4321` |
| 2 | `wenuos.wenumapuonline.com` | `*` | `http://localhost:3333` |
| 3 | `api.wenumapuonline.com` | `*` | `http://localhost:3335` |
| catch-all | — | — | `http_status:404` |

These routes are how Cloudflare's cloud config currently maps incoming hostnames to local services. Each hostname has a CNAME in DNS pointing to `fd7eb657-88ad-4f01-9d4b-9431ceef445b.cfargotunnel.com`.

---

## 2. Target architecture (locally-managed)

The same tunnel UUID is reused — DNS CNAMEs and Cloudflare Access apps stay attached without modification. What changes is **how the connector authenticates** and **where the routing rules live**.

| Layer | Today (remote) | Target (local) |
|---|---|---|
| Connector auth | JWT token in `--token` arg (visible in `ps`) | `cert.pem` + per-tunnel credentials JSON file (mode 600 root-only) |
| Routing source of truth | Cloudflare cloud config ("Published application routes" UI) | Local `/etc/cloudflared/config.yml` ingress rules |
| LaunchDaemon command | `cloudflared tunnel run --token <JWT>` | `cloudflared --config /etc/cloudflared/config.yml tunnel run` |
| `config_src` API field | `cloudflare` | `local` |
| Where secrets live | command line + plist | one root-only JSON file |

### File targets

```
/etc/cloudflared/
├── config.yml                                                  # mode 644, root:wheel — ingress rules (not secret)
├── fd7eb657-88ad-4f01-9d4b-9431ceef445b.json                   # mode 600, root:wheel — credentials (secret)
└── (logs go to /usr/local/var/log/cloudflared.log as today)

~/.cloudflared/
└── cert.pem                                                    # mode 600, user1:staff — origin certificate from `cloudflared tunnel login`
                                                                # NOTE: only needed for management ops (route, list, etc.); the daemon itself
                                                                # only needs the credentials JSON. We move cert.pem out of the daemon's path.

/Library/LaunchDaemons/com.cloudflare.cloudflared.plist         # mode 600, root:wheel (kept) — ProgramArguments rewritten to use --config
```

### Target `config.yml` (literal content)

```yaml
tunnel: fd7eb657-88ad-4f01-9d4b-9431ceef445b
credentials-file: /etc/cloudflared/fd7eb657-88ad-4f01-9d4b-9431ceef445b.json

ingress:
  - hostname: wenumapuonline.com
    service: http://localhost:4321
  - hostname: wenuos.wenumapuonline.com
    service: http://localhost:3333
  - hostname: api.wenumapuonline.com
    service: http://localhost:3335
  - service: http_status:404
```

This mirrors the three Published application routes 1:1, plus the catch-all. No path-specific rules are needed because every existing route uses path `*`.

### Target LaunchDaemon (the only `ProgramArguments` change)

```xml
<key>ProgramArguments</key>
<array>
    <string>/usr/local/bin/cloudflared</string>
    <string>--config</string>
    <string>/etc/cloudflared/config.yml</string>
    <string>tunnel</string>
    <string>run</string>
</array>
```

**No `--token`, no JWT in `ps`, no secret in the plist.** Everything else in the plist (`Label`, `KeepAlive`, `RunAtLoad`, log paths, `ThrottleInterval`) stays exactly as it is today.

---

## 3. Credential acquisition plan

### Can the existing remote-managed tunnel be converted in place?

Honest answer: **partially yes, with caveats.** The Cloudflare API documents `PATCH /accounts/{account_id}/cfd_tunnel/{tunnel_id}` accepting two relevant fields:

- `config_src` — can be flipped from `"cloudflare"` to `"local"`.
- `tunnel_secret` — a base64-encoded 32-byte secret. The docs label this "Password for locally-managed tunnels".

What is **not** explicitly documented:

- The exact behavior when both fields are PATCHed simultaneously on a tunnel that currently has live connectors and active "Published application routes".
- Whether the existing routes remain queryable in the dashboard after `config_src` flips to local (community reports say they do not appear in the UI but the DNS CNAMEs persist, which is what actually matters for traffic).
- Whether the existing JWT token is invalidated immediately or eventually after the PATCH.

### Two credential acquisition paths

**Path Cα — convert in place, rotate the secret in the same operation (recommended for security)**

1. User creates a Cloudflare API token in dashboard (My Profile → API Tokens → Create Token, Custom). Permissions:
   - Account → Cloudflare Tunnel: Edit
   - Account Resources → Include → specific account `Wenu Mapu / wenu.mapu8@gmail.com`
   - TTL: 1 hour or shortest available.
   - Token saved into `/tmp/cfapi.token` (mode 600), never pasted into chat.
2. Generate a fresh 32-byte base64 secret locally:
   ```bash
   NEW_SECRET=$(openssl rand -base64 32)        # never echoed to chat
   ```
3. PATCH the tunnel to switch type AND rotate secret (one HTTP call):
   ```bash
   curl -sS -X PATCH \
     -H "Authorization: Bearer $(cat /tmp/cfapi.token)" \
     -H "Content-Type: application/json" \
     -d "{\"config_src\":\"local\",\"tunnel_secret\":\"$NEW_SECRET\"}" \
     "https://api.cloudflare.com/client/v4/accounts/68d502a80b1badf06df7795aeb91d96c/cfd_tunnel/fd7eb657-88ad-4f01-9d4b-9431ceef445b" \
     > /tmp/patch_response.json
   # Verify success without printing token
   jq -r '.success' /tmp/patch_response.json
   jq -r '.result.config_src' /tmp/patch_response.json   # expect "local"
   ```
4. Build credentials JSON file:
   ```bash
   ACCOUNT_TAG="68d502a80b1badf06df7795aeb91d96c"
   TUNNEL_ID="fd7eb657-88ad-4f01-9d4b-9431ceef445b"
   sudo tee /etc/cloudflared/${TUNNEL_ID}.json > /dev/null <<EOF
   {"AccountTag":"${ACCOUNT_TAG}","TunnelSecret":"${NEW_SECRET}","TunnelID":"${TUNNEL_ID}"}
   EOF
   sudo chown root:wheel /etc/cloudflared/${TUNNEL_ID}.json
   sudo chmod 600 /etc/cloudflared/${TUNNEL_ID}.json
   unset NEW_SECRET
   shred -u /tmp/cfapi.token /tmp/patch_response.json 2>/dev/null || rm -f /tmp/cfapi.token /tmp/patch_response.json
   ```
5. Revoke the API token in dashboard immediately.

**Effect:** old JWT token is dead (because the underlying `tunnel_secret` it embedded is replaced). New credentials are root-only on disk.

**Path Cβ — fresh locally-managed tunnel (slower but fully documented)**

If Cα fails or behaves unexpectedly, fall back to creating a **new** locally-managed tunnel:

1. `cloudflared tunnel login` (browser flow; writes `~/.cloudflared/cert.pem`).
2. `cloudflared tunnel create wenuos-local` — creates a NEW UUID and writes credentials JSON.
3. For each of the 3 hostnames, reassign DNS:
   ```bash
   cloudflared tunnel route dns wenuos-local wenumapuonline.com
   cloudflared tunnel route dns wenuos-local wenuos.wenumapuonline.com
   cloudflared tunnel route dns wenuos-local api.wenumapuonline.com
   ```
4. Move credentials to `/etc/cloudflared/`, write config.yml referencing the NEW UUID.
5. After confirming, delete the old `Wenuos` tunnel.

This path **changes the tunnel UUID**, which means it touches every hostname's DNS CNAME. It is closer to path B in impact, just without UI delete/recreate clicks. Recommended only if Cα fails.

---

## 4. Migration steps (literal — to execute later, not now)

All sudo / cloudflared / curl commands below are **for execution only after explicit approval**. Each block is idempotent or reversible on its own.

### 4.1 Preflight (read-only — safe to run anytime)

```bash
# Confirm current state matches this plan
ls -la /Library/LaunchDaemons/com.cloudflare.cloudflared.plist  # expect -rw------- root wheel
ps -ax | grep -E "cloudflared.*tunnel.*run" | grep -v grep      # expect 1 process with --token
brew services list | grep cloudflared                           # expect "none"
which cloudflared && cloudflared --version                       # expect 2026.3.0
cloudflared tunnel --help | grep -E "(--config|--credentials-file)" >/dev/null && echo "flags ok"

# Confirm hostnames are reachable through the tunnel today (before migration)
curl -sI --max-time 8 https://wenumapuonline.com         | head -3
curl -sI --max-time 8 https://wenuos.wenumapuonline.com  | head -3
curl -sI --max-time 8 https://api.wenumapuonline.com     | head -3
```

### 4.2 Backup the current plist (no token printed)

```bash
sudo cp /Library/LaunchDaemons/com.cloudflare.cloudflared.plist \
        /Library/LaunchDaemons/com.cloudflare.cloudflared.plist.bak.20260509
sudo chmod 600 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist.bak.20260509
ls -la /Library/LaunchDaemons/com.cloudflare.cloudflared.plist*
```

This backup is what we restore from if the migration fails.

### 4.3 Create the secure config directory

```bash
sudo mkdir -p /etc/cloudflared
sudo chown root:wheel /etc/cloudflared
sudo chmod 755 /etc/cloudflared
```

### 4.4 Write `config.yml`

Use the literal content from §2. A heredoc keeps it auditable:

```bash
sudo tee /etc/cloudflared/config.yml > /dev/null <<'YAML'
tunnel: fd7eb657-88ad-4f01-9d4b-9431ceef445b
credentials-file: /etc/cloudflared/fd7eb657-88ad-4f01-9d4b-9431ceef445b.json

ingress:
  - hostname: wenumapuonline.com
    service: http://localhost:4321
  - hostname: wenuos.wenumapuonline.com
    service: http://localhost:3333
  - hostname: api.wenumapuonline.com
    service: http://localhost:3335
  - service: http_status:404
YAML
sudo chown root:wheel /etc/cloudflared/config.yml
sudo chmod 644 /etc/cloudflared/config.yml
sudo cloudflared --config /etc/cloudflared/config.yml tunnel ingress validate   # syntactic validation, no auth needed
```

### 4.5 Acquire credentials (path Cα — preferred)

User actions in the dashboard:

1. Open Cloudflare dashboard → top-right user icon → **My Profile** → **API Tokens** → **Create Token** → **Get started** (Custom token).
2. Token name: `wenu-tunnel-rotate-2026-05-09`.
3. Permissions: `Account` → `Cloudflare Tunnel` → `Edit`.
4. Account Resources: `Include` → `Specific account` → select Wenu Mapu account.
5. TTL: 1 hour (or until manually revoked — whichever is shorter).
6. Click Continue → Create. Copy the token to `/tmp/cfapi.token`:
   ```bash
   umask 077
   nano /tmp/cfapi.token        # paste in nano, save, exit; never paste into chat
   chmod 600 /tmp/cfapi.token
   ls -la /tmp/cfapi.token      # expect -rw-------
   ```

Then run the rotation + credentials-write sequence from §3 path Cα steps 2–5.

### 4.6 Update the LaunchDaemon plist

```bash
sudo tee /Library/LaunchDaemons/com.cloudflare.cloudflared.plist > /dev/null <<'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
	<dict>
		<key>Label</key>
		<string>com.cloudflare.cloudflared</string>
		<key>ProgramArguments</key>
		<array>
			<string>/usr/local/bin/cloudflared</string>
			<string>--config</string>
			<string>/etc/cloudflared/config.yml</string>
			<string>tunnel</string>
			<string>run</string>
		</array>
		<key>RunAtLoad</key>
		<true/>
		<key>StandardOutPath</key>
		<string>/usr/local/var/log/cloudflared.log</string>
		<key>StandardErrorPath</key>
		<string>/usr/local/var/log/cloudflared.log</string>
		<key>KeepAlive</key>
		<dict>
			<key>SuccessfulExit</key>
			<false/>
		</dict>
		<key>ThrottleInterval</key>
		<integer>5</integer>
	</dict>
</plist>
PLIST
sudo chown root:wheel /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo chmod 600 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
plutil -lint /Library/LaunchDaemons/com.cloudflare.cloudflared.plist   # expect "OK"
```

### 4.7 Reload the LaunchDaemon (this is the cutover moment)

```bash
sudo launchctl bootout system /Library/LaunchDaemons/com.cloudflare.cloudflared.plist 2>&1 || true
sudo launchctl bootstrap system /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo launchctl print system/com.cloudflare.cloudflared | head -20    # expect state = running
```

### 4.8 Verify (token-redacted only)

```bash
# 1. Daemon is alive on the new --config path (no --token in args)
ps -ax | grep -E "cloudflared.*tunnel.*run" | grep -v grep | sed -E 's/(eyJ[A-Za-z0-9_-]+)/<JWT-ANY>/g'
# Expect: /usr/local/bin/cloudflared --config /etc/cloudflared/config.yml tunnel run

# 2. Local log shows the tunnel reconnecting
sudo tail -n 50 /usr/local/var/log/cloudflared.log

# 3. Each hostname returns a meaningful response
curl -sI --max-time 10 https://wenumapuonline.com         | head -3
curl -sI --max-time 10 https://wenuos.wenumapuonline.com  | head -3   # expect 302 to cloudflareaccess.com (Access still gating)
curl -sI --max-time 10 https://api.wenumapuonline.com     | head -3

# 4. Plist permissions still 600
stat -f "%Sp %Su %Sg %N" /Library/LaunchDaemons/com.cloudflare.cloudflared.plist

# 5. Connector visible in dashboard (Networks → Connectors → Wenuos → Connectors tab)
#    The OLD connector entry will go stale within ~5 min; it can be cleaned up via:
curl -sS -X DELETE \
  -H "Authorization: Bearer $(cat /tmp/cfapi.token)" \
  "https://api.cloudflare.com/client/v4/accounts/68d502a80b1badf06df7795aeb91d96c/cfd_tunnel/fd7eb657-88ad-4f01-9d4b-9431ceef445b/connections" \
  > /dev/null
# (Cloudflare's docs explicitly recommend this DELETE /connections call after rotating tokens.)
```

### 4.9 Rollback steps (if any verification fails)

```bash
# Stop the new (failed) daemon
sudo launchctl bootout system /Library/LaunchDaemons/com.cloudflare.cloudflared.plist 2>&1 || true

# Restore the old plist (still has the OLD --token, which by this point may be dead)
sudo cp /Library/LaunchDaemons/com.cloudflare.cloudflared.plist.bak.20260509 \
        /Library/LaunchDaemons/com.cloudflare.cloudflared.plist
sudo chmod 600 /Library/LaunchDaemons/com.cloudflare.cloudflared.plist

# Try to bring the old daemon back
sudo launchctl bootstrap system /Library/LaunchDaemons/com.cloudflare.cloudflared.plist

# If the tunnel does NOT come back up, the old token is dead (because the secret was rotated).
# In that case the only path is dashboard delete+recreate (path B), with the broader downtime
# scope already discussed (3 hostnames). Have that contingency ready before starting §4.5.
```

**Critical:** rollback only restores the FILE. If you took path Cα and the PATCH already rotated the secret, the old token cannot be revived. Plan §4.5 such that you do not start it unless you have ~30 minutes of focused time and the contingency to fall back to B is acceptable.

---

## 5. Downtime risk

| Window | Estimate | What's down |
|---|---|---|
| Between §4.7 `bootout` and `bootstrap` completing connector handshake | 30–120 seconds | All three hostnames (apex, wenuos sub, api sub) return 502 / cannot connect |
| If §4.5 PATCH succeeds but the new credentials JSON is malformed | until §4.9 rollback OR fix-forward | All three hostnames down. **Old token is already dead at this point** — rollback restores the plist file but not the tunnel. |
| If §4.5 PATCH fails (Cloudflare rejects body) | 0 (PATCH is atomic) | nothing changed; can retry safely |
| If `cloudflared --config ... tunnel ingress validate` in §4.4 catches an error | 0 | caught before any cutover |

### What could break

- **Apex `wenumapuonline.com` → `localhost:4321`**: today it 502's because Astro dev isn't running. Migration won't fix that — that's a separate "is your dev server even up" issue. Migration won't make it worse either; it preserves the same routing.
- **`wenuos.wenumapuonline.com` → `localhost:3333`**: this is the WenuOS dev server hosted by user. Should come back as soon as the new connector handshakes.
- **`api.wenumapuonline.com` → `localhost:3335`**: same; depends on whether the API server is running locally.
- **Cloudflare Access policies**: continue to apply at the hostname level. Migration does not touch them.

### What is preserved end-to-end

- Tunnel UUID — same.
- DNS CNAMEs for all 3 hostnames — unchanged.
- Cloudflare Access apps — unchanged.
- Apex storefront serving model (whatever was happening before) — unchanged at the routing layer.
- Logs path — unchanged.

---

## 6. Decision gate

**This migration is: NEEDS MANUAL CLOUDFLARE STEP.**

Specifically:

1. The user must create a short-lived Cloudflare API token (Account → Cloudflare Tunnel: Edit) in the dashboard manually. The agent cannot do this; it requires authenticated dashboard interaction and the token must never appear in chat.
2. The PATCH-based conversion (§3 path Cα with `tunnel_secret` rotation) relies on documented but underspecified Cloudflare behavior. It is the cleanest path for this scenario, but it has not been independently validated for a tunnel that has live `config_src=cloudflare` Published application routes. The first PATCH is the moment of no return for the old token.
3. Path Cβ (fresh locally-managed tunnel) is fully documented but causes the same 3-hostname disruption as path B and additionally rewrites three DNS CNAMEs.

**Recommendation given the broader project context:** the plan in `deployment-readiness-report.md` already calls for moving `wenu-frontend` to Cloudflare Pages. Once that cutover happens, the apex and `api.wenumapuonline.com` routes can move off the tunnel entirely. The tunnel would then carry only `wenuos.wenumapuonline.com` (a single dev subdomain). At that point, **B (delete + recreate) becomes a low-impact 5-minute operation against one hostname** — exactly the original scope you approved.

So the cleanest sequencing is:

> **Pages cutover first. Tunnel rotation second.**

If Pages cutover is more than ~2 weeks out, executing path C now is reasonable. If it's days, defer rotation and accelerate Pages.

In neither case should a fresh execution of this plan begin without your explicit approval, the §4.1 preflight passing, the §4.2 backup taken, and a confirmed window of ~30 minutes of attention.

---

## Appendix — what was NOT touched in writing this plan

- No file in `/Library/LaunchDaemons/` was modified.
- No `sudo` command was executed during planning.
- No Cloudflare dashboard click changed any setting; only navigation, screenshots, and read-only DOM inspection were performed.
- No DNS record was inspected with mutating effect.
- No website code was touched.
- No commits were made.
- The compromised `--token` JWT was never re-printed.
