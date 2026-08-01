# WP Mail SMTP — Setup Checklist

Date: 2026-05-10
Scope: configure WordPress to send emails (contact form, WooCommerce order notices, password resets) through **Titan SMTP** so they render correctly + don't go to spam.

This is owner-driven: Claude does not log into WP admin. Use the open MCP tab + click-by-click below.

---

## 0. Why this matters

Right now WordPress sends emails via PHP `mail()` directly through the server's MTA. Three problems:

1. **Deliverability** — emails frequently go to spam (no SPF/DKIM signing).
2. **Rendering** — HTML emails arrive with broken Content-Type headers (looks like raw markup in Gmail — same issue as the Titan webmail composer test you did).
3. **From: forgery** — `wordpress@wenumapuonline.com` is the default sender, looks unprofessional.

WP Mail SMTP routes ALL WP-sent emails through Titan SMTP with proper headers + signing. The contact form on `/contact-2/`, WooCommerce order confirmations, customer notifications — all of them fixed.

---

## 1. Install plugin

1. WP Admin → **Plugins → Añadir nuevo plugin** (Add new).
2. Search box: type **`WP Mail SMTP`**.
3. Look for "**WP Mail SMTP by WPForms**" (the official one — has 3+ million installs, blue/red icon).
4. Click **Instalar ahora** → wait → **Activar**.

After activation, a **WP Mail SMTP** entry appears in the sidebar (with a paper-airplane icon).

---

## 2. Run the Setup Wizard

1. Sidebar → **WP Mail SMTP** → the wizard launches automatically on first run.
2. **Choose a Mailer**: select **Other SMTP** (you want Titan, not Sendinblue/Gmail/etc.).
3. Click **Save and Continue**.

---

## 3. Configure SMTP settings

Fill these fields:

| Field | Value |
|---|---|
| **SMTP Host** | `smtp.titan.email` (or `mail.wenumapuonline.com` if Titan provided that) |
| **Encryption** | **TLS** (uses port 587) |
| **SMTP Port** | `587` |
| **Auto TLS** | ON (default) |
| **Authentication** | ON (default) |
| **SMTP Username** | `noreply@wenumapuonline.com` (or any sending alias you set up in Titan) |
| **SMTP Password** | **App Password from Titan** (NOT your Titan login password) |

### Get the Titan app password

1. Open `https://app.titan.email/` → log in.
2. Settings → Security → **App passwords**.
3. Generate a new one named `wordpress-wp-mail-smtp`.
4. Copy the password — Titan only shows it ONCE. Paste it into WP Mail SMTP's SMTP Password field.
5. Click **Save**.

Continue the wizard.

---

## 4. Set the From identity

Still in the wizard:

| Field | Value |
|---|---|
| **From Email** | `marimari@wenumapuonline.com` |
| **From Name** | `Wenu Mapu` |
| **Force From Email** | ON (forces ALL WP emails to use this — including ones from plugins that try to use defaults) |
| **Force From Name** | ON |

Click **Save and Continue**.

---

## 5. Enable email features

The wizard offers email feature toggles. Recommended:

| Toggle | Recommended |
|---|---|
| Improved Email Deliverability | ON |
| Email Error Tracking | ON |
| Weekly Email Summary | OFF (noise) |
| Smart Contact Form | OFF |
| Detailed Email Logs | ON (only first 30 days for free; useful for debugging) |

Click **Save and Continue**.

---

## 6. Send a test email

The wizard offers to send a test. Use it.

1. **Send To**: `wenu.mapu8@gmail.com` (or any inbox you can check).
2. **HTML / Plain text**: HTML (always test HTML mode).
3. Click **Send Email**.

Check the destination inbox:

✅ Email arrives within 1 minute.
✅ From: shows `Wenu Mapu <marimari@wenumapuonline.com>`.
✅ HTML renders correctly (no raw markup).
✅ Gmail header shows `mailed-by: wenumapuonline.com` and `signed-by: wenumapuonline.com` (DKIM passing). Click the small dropdown next to the sender name → "mostrar original" — look for **SPF: PASS** and **DKIM: PASS**.

If anything fails, see §10 troubleshooting.

---

## 7. Verify it routes the contact form too

Once setup is green, test the public Contact form:

1. In an incognito browser, go to `https://www.wenumapuonline.com/contact-2/`.
2. Fill the form (Name: Test, Email: your-test@example.com, Message: "WP Mail SMTP test from contact form").
3. Submit.
4. Check `marimari@wenumapuonline.com` inbox — the form notification should arrive within 1 min.
5. Confirm it shows:
   - From: `Wenu Mapu <marimari@wenumapuonline.com>` (NOT `wordpress@…`)
   - Body renders cleanly (no `<table>` markup as text)

---

## 8. Verify it routes WooCommerce order emails too

Most-leverage test. WooCommerce sends order confirmations to customers AND order notifications to admin. Both should now route through Titan.

Quick test:
1. Place a tiny test order via `/shop/` with a real address (use a $1 test product if you have one, or one of the cheapest pieces).
2. Check that:
   - Customer (you) receives "Tu orden ha sido recibida" → from `Wenu Mapu`, renders cleanly.
   - Admin (marimari@) receives "Nueva orden" → from `Wenu Mapu`, renders cleanly.

If yes — done. WP email is now fully wired.

---

## 9. (Optional) Customize WC email template branding

WooCommerce's default order emails are a plain "Storefront" template. You can:

**Path A — quick:** WP Admin → WooCommerce → Settings → Emails. Click on each email type and customize subject/heading.

**Path B — full branding:** the email templates we built in `~/wenu-agent-hub/email/templates/order-confirmation.mjs` + `shipping-notice.mjs` are the canonical brand versions. If you want WC to send THESE templates instead of its defaults, you'd need to override WC email classes via a child theme or plugin (not in scope for tonight; can revisit when you have a child theme or are using a code snippets plugin).

For now: leave WC defaults (plain text, factually correct) and use the branded templates for one-off sends via `node email/scripts/send.mjs` until we can integrate.

---

## 10. Troubleshooting

### "SMTP Error: Could not authenticate"
- App password is wrong, or you used your Titan login password (Titan blocks that).
- Generate a NEW app password in Titan, paste again.
- Confirm `SMTP Host` = `smtp.titan.email` exactly.

### "Connection timed out"
- Port 587 blocked at host firewall. Try port 465 with Encryption = SSL.
- Or contact Titan support to whitelist the WP server IP.

### "Email arrives in spam"
- Confirm DKIM is set up in Cloudflare DNS for the Titan sender. Titan provides DKIM records in: app.titan.email → Settings → Domain → DKIM.
- Add the TXT records to Cloudflare DNS exactly as Titan shows them.
- See `mailerlite-setup-owner-checklist.md` §2 for the Cloudflare DNS click path (same workflow, different DKIM keys).

### "Test email NEVER arrives (no error)"
- Check WP Mail SMTP → Email Log (sidebar). The send attempt is recorded.
- If "Sent" but inbox empty → likely SPF failure → Titan being rejected by Gmail. Add SPF record:
  ```
  v=spf1 include:spf.titan.email include:_spf.mlsend.com ~all
  ```
  in Cloudflare DNS at apex (replace any existing SPF; do not duplicate).

### "From: still says wordpress@"
- Confirm **Force From Email = ON** in WP Mail SMTP General settings.
- Some plugins (Jetpack, certain Bridge components) bypass wp_mail filters. WP Mail SMTP Pro has stricter forcing, but free version works for 95% of cases.

---

## 11. Verify list (run from terminal after setup)

```bash
# Should show DKIM CNAMEs or TXT records for Titan
dig +short TXT default._domainkey.wenumapuonline.com
dig +short TXT titan1._domainkey.wenumapuonline.com  # Titan-specific selector name varies
dig +short TXT wenumapuonline.com | grep spf

# Should include include:spf.titan.email (NOT spf.titan.email alone)
```

If SPF doesn't include `spf.titan.email`, emails will be marked as spoofed by Gmail.

---

## 12. Sign-off

```
Date executed:        ____-__-__
Plugin installed:     [ ] WP Mail SMTP
Mailer chosen:        [ ] Other SMTP
SMTP host:            smtp.titan.email
SMTP port:            587 (TLS) / 465 (SSL)
SMTP user:            ____________________________________
App password:         [ ] saved in password manager
From identity:        [ ] Wenu Mapu <marimari@wenumapuonline.com>
Force From:           [ ] ON
Email Log:            [ ] ON
Test sent:            [ ] from wizard
                      [ ] via contact form
                      [ ] via WC order
Gmail headers:        [ ] SPF pass  [ ] DKIM pass
```

---

## 13. References

- WP Mail SMTP docs: https://wpmailsmtp.com/docs/
- Titan SMTP docs: https://help.titan.email/
- `~/wenu-frontend/wenu-contact-and-operations-plan.md` §6 — email aliases
- `~/wenu-agent-hub/email/README.md` — the parallel branded email system (Node, not WP)
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md` §2 — DNS rules (DKIM/SPF are owner-driven Cloudflare changes)
