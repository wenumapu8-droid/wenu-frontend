# MailerLite Setup — Owner Checklist

Date: 2026-05-10
Scope: end-to-end owner-driven setup to flip Codex Task 3's subscription forms from **Path B (mailto-only)** to **Path A (real MailerLite-backed subscribe)**. Owner-only steps. Claude does not log into MailerLite, does not edit DNS, does not paste an API key into chat.

This checklist closes the gap named in `wenu-subscription-and-journal-system.md` §3 and §9. It is gated on owner approval at every step.

---

## 0. Decision gate

Before starting:

- [ ] Owner has read `wenu-subscription-and-journal-system.md` §3 (platform comparison) and confirms **MailerLite** as the chosen provider.
- [ ] Owner has access to the DNS records for `wenumapuonline.com` (Cloudflare dashboard).
- [ ] Owner has 30 minutes for the signup + sender domain verification.
- [ ] Owner has agreed that NO bulk send happens until §6 PO Box / CAN-SPAM address is decided.

If any box is unticked, stop. Codex Task 3 ships as Path B (mailto fallback) and waits.

---

## 1. Sign up for MailerLite

Time: 5 minutes. Owner-only.

1. Open `https://www.mailerlite.com/` in a browser.
2. Click **Sign Up Free**.
3. Use email **marimari@wenumapuonline.com** as the primary account email. (NOT `wenu.mapu8@gmail.com`. NOT `contact@…`.)
4. Set a strong password and store it in your password manager.
5. Choose the **Free plan** (1,000 subscribers / 12,000 emails per month — fits Wenu Mapu's first 6-12 months).
6. Country: **United States**. Business type: **Other**. Industry: **Fashion / Apparel / Luxury** (closest to body jewelry).
7. When asked for business details:
   - Company name: `Wenu Mapu SpA`
   - Website: `https://wenumapuonline.com`
   - Description: `Hand-forged ritual body jewelry. Editorial Journal. Limited drops.`
   - Industry: Fashion / Lifestyle
8. **Postal address** (required for CAN-SPAM in every email footer):
   - If you have rented a Truckee PO Box (see §6): use it.
   - If you have not: enter the business registration address (Wenu Mapu SpA) temporarily. Do NOT enter a home address. If neither is available yet, STOP and complete §6 first.
9. Skip any "import contacts" prompts. We're starting clean.
10. Skip "first campaign" prompts; go to Dashboard.

After signup, you should be at `https://dashboard.mailerlite.com/` with an empty subscriber list.

---

## 2. Set up the sender domain (DKIM + SPF)

Time: 15-30 minutes (most of which is waiting for DNS propagation). Owner-only — touches DNS.

⚠️ DNS changes are owner-only per `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` §2. The records below ADD to your existing DNS — they do NOT modify the MX, A, AAAA or CNAME records that currently exist.

### 2.1 Begin sender-domain verification in MailerLite

1. Dashboard → bottom-left avatar → **Account settings** → **Domains**.
2. Click **Add domain** → enter `wenumapuonline.com` → Save.
3. MailerLite generates a **DKIM** key and an **SPF** include directive. Note the exact values shown — they look like:

   - **DKIM record:**
     - Name: `ml._domainkey.wenumapuonline.com` (the exact name MailerLite gives you)
     - Type: `TXT`
     - Value: `v=DKIM1; k=rsa; p=<long random string>` (copy ENTIRE value verbatim)
   - **SPF directive:**
     - Add `include:_spf.mlsend.com` to your existing SPF record OR create a new SPF if none exists.

### 2.2 Add DKIM to Cloudflare DNS

1. Open `https://dash.cloudflare.com/` → select **wenumapuonline.com** zone.
2. **DNS → Records → Add record**.
3. Type: **TXT**. Name: (paste the DKIM name from MailerLite, e.g. `ml._domainkey`).
4. Content: (paste the DKIM value verbatim).
5. **Proxy status: DNS only** (gray cloud, NOT orange). DKIM TXT records must not be proxied.
6. TTL: Auto.
7. Save.

### 2.3 Add/update SPF in Cloudflare DNS

1. Check if you already have a TXT record at the apex `@` starting with `v=spf1`.
   - **If yes:** Edit it. Add ` include:_spf.mlsend.com` BEFORE the trailing `~all` or `-all`. Example:
     ```
     v=spf1 include:_spf.google.com include:_spf.mlsend.com ~all
     ```
   - **If no:** Add a new TXT record at `@` with value:
     ```
     v=spf1 include:_spf.mlsend.com ~all
     ```
2. Proxy status: **DNS only**.
3. Save.

⚠️ You must have only ONE SPF record at the apex. Multiple SPF records will silently break email deliverability. Verify with `dig +short TXT wenumapuonline.com` after saving.

### 2.4 (Optional but recommended) DMARC

If you don't already have a DMARC record:

1. Add TXT record at `_dmarc.wenumapuonline.com`:
   ```
   v=DMARC1; p=none; rua=mailto:marimari@wenumapuonline.com; ruf=mailto:marimari@wenumapuonline.com; fo=1; aspf=r; adkim=r
   ```
2. `p=none` is the starting policy — receive reports without blocking. Tighten to `p=quarantine` once you've watched 30 days of reports.
3. Proxy: DNS only.

### 2.5 Verify in MailerLite

1. Back in MailerLite Account settings → Domains → click **Verify** next to wenumapuonline.com.
2. If it says "Pending," wait 5-30 minutes for DNS propagation and click again.
3. When verified, the domain shows a green check mark on both DKIM and SPF.

### 2.6 Set the verified domain as your sender

1. Dashboard → **Subscribers → Settings → Sender info** OR **Account settings → Domains**.
2. Set the "from" address: `journal@wenumapuonline.com` (per `wenu-contact-and-operations-plan.md` §6 — newsletter sender alias).
3. Set the "reply-to" address: `marimari@wenumapuonline.com`.
4. Sender name: `Wenu Mapu`.

If `journal@wenumapuonline.com` does not yet exist as an alias, create it first via Cloudflare Email Routing (see §5).

### 2.7 Verify deliverability

Send a test email from inside MailerLite (use the "Send test" feature on a draft campaign) to your own Gmail OR a `mail-tester.com` address. Target: **9/10 or 10/10** mail-tester score with DKIM + SPF passing.

---

## 3. Get the API key (for Codex Task 3 Path A)

Time: 2 minutes. Owner-only.

1. Dashboard → bottom-left avatar → **Integrations** → **Developer API** → **API tokens**.
2. Click **Generate new token**.
3. Token name: `wenu-frontend-astro-pathA`.
4. Permissions: full (or scoped to `subscribers:write` if MailerLite offers granular scopes on the free plan).
5. **Copy the token immediately** — it is shown once.
6. Paste it into `~/wenu-frontend/.env.local` as:

   ```
   MAILERLITE_API_KEY=eyJ0eXA...   # paste your real token here
   ```

7. Verify the file:
   - Path: `~/wenu-frontend/.env.local` (NOT `.env`).
   - Permissions: `chmod 600 ~/wenu-frontend/.env.local`.
   - `.gitignore` already covers `.env*` patterns (verify per `~/wenu-frontend/security-cleanup-plan.md` Step G).

⚠️ NEVER:
- Paste the API key into chat.
- Commit `.env.local` to git.
- Share the key in Slack, email, or screenshots.
- Use the key in a frontend `import.meta.env.PUBLIC_*` variable — keep it server-only.

If the key leaks, return to step 3.1 and **revoke** the old token before generating a new one.

---

## 4. Create the subscriber segments / groups

Time: 10 minutes. Owner-only.

MailerLite uses **groups** (free plan) or **fields** + **tags** (paid plan) to segment subscribers. We use group names that match the tag-set in `wenu-subscription-and-journal-system.md` §2.

Dashboard → **Subscribers → Groups → Create group**. Create the following groups:

| Group name | Used by |
|---|---|
| `circle` | Base list (all subscribers via JoinTheCircleForm) |
| `source-footer` | Footer signup |
| `source-home` | Home Newsletter section |
| `source-journal` | Journal hub signup |
| `source-aftercare` | Aftercare follow-up (per-email, 3-email sequence) |
| `source-custom-orders` | Commission inquiries |
| `source-appointment` | Appointment requests |
| `interest-vacamuerta` | Material-specific tagging from Journal entries |
| `interest-editorial` | Journal subscribers |
| `inner-circle` | Future loyalty (Rage Nation pattern) — leave empty for now |

The Codex Task 3 endpoint (`src/pages/api/subscribe.ts`) maps form `source:*` tags to the matching MailerLite groups at subscription time.

---

## 5. Create email aliases (Cloudflare Email Routing)

Time: 10 minutes. Owner-only.

Per `wenu-contact-and-operations-plan.md` §6, create these 3 forwarders FIRST. All forward to whatever inbox monitors `marimari@wenumapuonline.com` today (Gmail / iCloud / hosted).

1. Cloudflare dashboard → **wenumapuonline.com → Email → Email Routing → Get started**.
2. Click **Routes → Create address**:
   - `journal@wenumapuonline.com` → forward to `<marimari destination inbox>`
   - `orders@wenumapuonline.com` → forward to same
   - `custom@wenumapuonline.com` → forward to same
3. Cloudflare will require destination-inbox verification — click the link in the verification email.
4. Verify by sending a test email TO each alias FROM another address. Confirm delivery.

⚠️ Email Routing adds MX records. These do NOT conflict with the existing apex / www records. But if you have an existing email host (Gmail Workspace, ImprovMX, etc.) routing email for `wenumapuonline.com`, you may need to coordinate — only ONE MX provider can handle the domain. If you have a conflict, STOP and decide first.

---

## 6. CAN-SPAM postal address (REQUIRED before any bulk send)

Time: 30-60 minutes for a one-time PO Box rental.

Per `wenu-subscription-and-journal-system.md` §7, every marketing email must include a physical postal address. Options:

### Option A — Rent a PO Box in Truckee (recommended)

1. Go to `https://tools.usps.com/poboxes/welcome.htm` or visit Truckee Post Office (10050 Bridge St, Truckee, CA 96161) in person.
2. Rent the smallest size (size 1). Cost ≈ $40-80 per 6 months.
3. Address format for your MailerLite footer:
   ```
   Wenu Mapu SpA
   PO Box <number>
   Truckee, CA 96160
   United States
   ```
4. Update MailerLite **Account settings → Personal information → Postal address** with the new PO Box.

### Option B — Use the business registration address (Wenu Mapu SpA)

Only if you have a non-residential business address on file. Do NOT use a home address — it becomes public in every email footer.

### Option C — Use a virtual mailbox service

Services like iPostal1 or Anytime Mailbox provide a real street address for $10-20/month. Confirm the address is approved by the USPS for receiving mail and that the service does NOT forward to a residential address visible in the email footer.

**Do not** use the legacy Petrolia address. **Do not** use a residential address. **Do not** ship before completing this step.

---

## 7. Configure the 3-email welcome flow

Time: 30-45 minutes. Owner writes the drafts; MailerLite hosts the automation.

Per `wenu-subscription-and-journal-system.md` §5:

1. Dashboard → **Automations → Create new automation**.
2. Name: `welcome-circle-3-email`.
3. Trigger: **When a subscriber joins group `circle`**.
4. Add 3 emails on a 7-day cadence:
   - Day 0 — Welcome to the circle (subject: `Welcome to the circle.`)
   - Day 7 — What we forge, and why (subject: `What we forge, and why.`)
   - Day 14 — A piece, before anyone else sees it (subject: `A piece, before anyone else sees it.`)
5. Full draft copy in `wenu-subscription-and-journal-system.md` §5 — paste verbatim into MailerLite's editor.
6. Save and activate the automation ONLY after a test subscriber has gone through all 3 emails successfully.

---

## 8. Test end-to-end

Time: 15 minutes. Owner-only.

1. Ensure Codex Task 3 has shipped (Path A code is in `redesign-v2`).
2. Run `nvm use && npm run build` in `~/wenu-frontend/` — confirm build is green AND that `subscribe.ts` reads `MAILERLITE_API_KEY` from `.env.local`.
3. Open `~/wenu-frontend/` in `npm run preview` (or after the Cloudflare Pages preview deploy if that's already up).
4. Use a fresh test email (e.g., `test-circle-2026-05-15@your-temp-mail-service.com`) and subscribe via the footer form.
5. Verify in MailerLite Dashboard → Subscribers — the test email appears with the `circle` + `source-footer` groups.
6. Wait for Day 0 of the welcome automation to fire (or run it manually). Confirm Email 1 arrives at the test inbox.
7. Run mail-tester.com on the test send: target 9/10 or 10/10.
8. If any step fails — stop, document, do NOT flip more surfaces. Roll back to Path B if necessary by removing the API key from `.env.local` and rebuilding.

---

## 9. Privacy + compliance (gating bulk send)

Time: variable — owner + counsel.

Before sending any campaign beyond the welcome flow:

- [ ] Replace placeholder `/privacy` content with a real privacy policy reviewed by a Cal-bar attorney or via a Termly template. Must name MailerLite as a data sub-processor.
- [ ] Confirm CAN-SPAM postal address (§6).
- [ ] Confirm DMARC monitoring (§2.4) shows no spoofing patterns over 7-14 days.
- [ ] Confirm welcome flow has passed 5 real subscribers without delivery issues.
- [ ] Decide what data minimum we collect (recommend: email + first name + source tag — nothing more for now).

---

## 10. Owner sign-off

Once §1-§8 are all green, fill in:

```
Date executed:            ____-__-__
Operator:                 _______________________
MailerLite account email: marimari@wenumapuonline.com
Sender domain verified:   [ ] DKIM  [ ] SPF  [ ] DMARC
API key stored:           [ ] ~/wenu-frontend/.env.local (mode 600)
Groups created:           [ ] 10 groups per §4
Aliases active:           [ ] journal@  [ ] orders@  [ ] custom@
PO Box:                   [ ] rented / virtual mailbox confirmed
Welcome flow:             [ ] drafted  [ ] tested with real send
End-to-end test:          [ ] OK (mail-tester ≥ 9/10)
Codex Task 3 Path A:      [ ] flipped from B to A and rebuilt
```

---

## 11. What this checklist does NOT do

- Does NOT send any campaign automatically.
- Does NOT import existing customers from WooCommerce — that is a separate, deliberate step that requires GDPR/CCPA consent verification per customer.
- Does NOT touch the WordPress legacy site's contact forms.
- Does NOT change any DNS record EXCEPT adding the 2-3 TXT records (DKIM + SPF + optional DMARC) and the Email Routing MX records. The existing apex / www records and the Cloudflare Tunnel hostnames are unchanged.
- Does NOT commit `.env.local` to git.
- Does NOT log into MailerLite from any agent — owner-only.

---

## 12. References

- `~/wenu-frontend/wenu-subscription-and-journal-system.md` §3 (platform comparison), §5 (welcome flow), §7 (compliance), §9 (approval gates)
- `~/wenu-frontend/wenu-contact-and-operations-plan.md` §6 (email aliases)
- `~/wenu-frontend/codex-task-3-subscription-final-prompt.md` (frontend side)
- `~/wenu-frontend/security-cleanup-plan.md` (`.env*` hygiene + `.gitignore` hardening)
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` §2 (DNS rules) + §5 (credentials)
- MailerLite docs: https://developers.mailerlite.com/v2/reference/subscribers
- CAN-SPAM compliance: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
