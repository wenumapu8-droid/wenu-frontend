# Wenu Mapu — Subscription Implementation Brief

Date: 2026-05-10 (CEO night)
Scope: ship-ready brief that turns `wenu-subscription-and-journal-system.md` (strategic plan) into a step-by-step implementation. For owner setup actions + Codex form components.

Companion: `wenu-subscription-and-journal-system.md` (strategy + platform comparison), `custom-orders-system-wenu-mapu.md` §10 (custom-order form), `local-appointments-delivery-system.md` §3 (appointment form).

---

## 1. Stack decision (locked)

- **Provider:** **MailerLite** (free tier 1k contacts / 12k emails/mo; clean editorial templates; tagging + automation)
- **Sender domain:** wenumapuonline.com
- **Sender name:** Wenu Mapu
- **Sender email (primary):** journal@wenumapuonline.com (fallback to marimari@ if alias not yet created)
- **Reply-to:** marimari@wenumapuonline.com
- **List name:** "The Wenu Mapu List"
- **Display in UI:** "Join the circle"

If the owner prefers Brevo or Klaviyo at signup, the implementation pattern below is identical — only the API endpoints/field shapes change. The Astro form components are provider-agnostic via a single `subscribeToList()` helper.

---

## 2. Owner setup checklist (BEFORE Codex Task 3)

These are **owner-only, sequential** actions. Do not let Codex start the form work until step 5 is done.

### Step 1 — Sign up for MailerLite

- Go to https://www.mailerlite.com → Sign up free.
- Use marimari@wenumapuonline.com as the account email.
- Confirm the welcome email.

### Step 2 — Verify the sender domain (DNS — DKIM + SPF)

- MailerLite dashboard → Sender domains → Add `wenumapuonline.com`.
- MailerLite shows DNS records to add (DKIM CNAME, SPF TXT include).
- **Owner-only DNS change** at the registrar (or Cloudflare DNS):
  - Add the TXT and CNAME records exactly as MailerLite shows.
  - Wait ~10 minutes; MailerLite verifies automatically.
- ⚠️ DNS changes are owner-only per `agent-control/DO_NOT_TOUCH.md`. Claude does not touch DNS.

### Step 3 — Create the API key

- MailerLite dashboard → Integrations → API → Generate new API token.
- Copy the token. **Do not paste it into chat or commit.**
- Save it locally in a password manager.

### Step 4 — Add the API key to `wenu-frontend/.env`

Owner-only (Claude does not edit `.env*` files). Add a single line to `~/wenu-frontend/.env`:

```
MAILERLITE_API_KEY=<the token from step 3>
```

Verify the file:
```bash
test -f ~/wenu-frontend/.env && echo "OK" || echo "MISSING"
grep -c "^MAILERLITE_API_KEY=" ~/wenu-frontend/.env
# expected: 1
```

### Step 5 — Confirm `.env` is gitignored

```bash
cd ~/wenu-frontend
git check-ignore .env && echo "OK gitignored" || echo "FAIL — add .env to .gitignore"
```

If it returns FAIL, add `.env` to `.gitignore` before continuing. Should already be ignored per Phase 1.

### Step 6 — Create the physical postal address for CAN-SPAM

CAN-SPAM requires a physical postal address in every marketing email. **Do NOT use the appointment location.**

Options:
- **Rent a USPS PO Box** in Truckee specifically for the brand (~$80/year). Recommended.
- Use the registered business address (Wenu Mapu SpA registration), if a US business address exists.

Add the chosen address to MailerLite → Account → Sender details. This shows in the footer of every email.

### Step 7 — Set up tags inside MailerLite

In MailerLite dashboard → Subscribers → Tags, create:

- `source:home-footer`
- `source:journal`
- `source:custom-orders-form`
- `source:appointment-request`
- `source:aftercare`
- `source:product-page` (future)
- `tier:circle`
- `tier:commission-queue`
- `interest:material:silver`
- `interest:material:gold`
- `interest:material:titanium`
- `interest:material:vacamuerta`
- `interest:material:wood`
- `interest:material:brass`
- `interest:placement:piercing`
- `interest:placement:hangers`
- `interest:placement:ear-weights`
- `interest:placement:amulets`
- `interest:placement:ritual-objects`
- `interest:appointment`
- `interest:local-delivery`
- `consent:marketing`
- `consent:transactional-only`

These can be created on-the-fly via the API too (any tag posted that doesn't exist is created), but pre-creating them keeps the dashboard organized.

### Step 8 — Set up the welcome automation

In MailerLite dashboard → Automations → Create new:

- **Trigger:** When subscriber joins the list (or has tag `tier:circle`)
- **Step 1:** Email — subject "Welcome to the circle." (template from `wenu-subscription-and-journal-system.md` §5 Email 1)
- **Step 2:** Wait 7 days
- **Step 3:** Email — subject "What we forge, and why." (Email 2)
- **Step 4:** Wait 7 days
- **Step 5:** Email — subject "A piece, before anyone else sees it." (Email 3)

Copy in `wenu-subscription-and-journal-system.md` §5. Save and activate.

### Step 9 — Set up the custom-order auto-reply

In MailerLite → Automations → Create new:

- **Trigger:** When subscriber gets tag `source:custom-orders-form`
- **Step 1 (immediate):** Email — subject "Your Wenu Mapu commission inquiry — received." (template from `custom-orders-system-wenu-mapu.md` §5)

Save and activate.

### Step 10 — Set up the aftercare follow-up sequence

In MailerLite → Automations → Create new:

- **Trigger:** When subscriber gets tag `source:aftercare`
- **Step 1 (day 0):** Email — "Aftercare day 0: what to expect"
- **Step 2 (wait 3 days):** Email — "Aftercare day 3: what's normal, what's not"
- **Step 3 (wait 11 days):** Email — "Aftercare day 14: what to look for"
- **Step 4 (wait 76 days):** Email — "Aftercare day 90: ready to switch jewelry?"

Aftercare email body content TBD — to be written by founder + Claude in a follow-up pass. Templates live in MailerLite; the Astro side only triggers the tag.

---

## 3. Codex Task 3 — frontend implementation

Once steps 1–9 are done, Codex can run Task 3 (already drafted in `codex-next-tasks.md` — refined version below).

### Files NEW (per Task 3)

```
src/components/forms/JoinTheCircleForm.astro
src/components/forms/AftercareSignupForm.astro
src/components/forms/CustomOrderForm.astro          (per custom-orders-system-wenu-mapu.md §10)
src/components/forms/AppointmentRequestForm.astro   (per local-appointments-delivery-system.md §3)
src/lib/subscribe.ts                                (single subscribeToList() helper, provider-agnostic)
src/pages/api/subscribe.ts                          (Astro server endpoint — generic)
src/pages/api/custom-order.ts                       (Astro server endpoint — custom-order specific tagging)
src/pages/api/appointment-request.ts                (Astro server endpoint — appointment specific tagging)
src/pages/aftercare-follow-up.astro                 (host page for AftercareSignupForm; NOT inside /care-guide)
```

### Files EDIT

```
src/components/Newsletter.astro                     (use JoinTheCircleForm; preserve mailto fallback link)
src/pages/custom-orders.astro                       (use CustomOrderForm; preserve mailto fallback link)
src/pages/stockists.astro                           (add AppointmentRequestForm; preserve mailto fallback link)
src/pages/journal.astro                             (add JoinTheCircleForm to hub)
src/i18n/en.json                                    (append form.* keys; do not rewrite existing)
```

### `subscribe.ts` helper (sketch — Codex implements)

```ts
// src/lib/subscribe.ts
// Provider-agnostic subscriber helper. Reads MAILERLITE_API_KEY from env.
// Falls back to a no-op when the key is absent so forms degrade gracefully.

interface SubscribePayload {
  email: string;
  name?: string;
  fields?: Record<string, string | number | boolean>;
  tags: string[];   // e.g., ["source:home-footer", "tier:circle", "consent:marketing"]
}

export async function subscribeToList(p: SubscribePayload): Promise<{ ok: boolean; reason?: string }> {
  const key = import.meta.env.MAILERLITE_API_KEY ?? process.env.MAILERLITE_API_KEY;
  if (!key) return { ok: false, reason: 'no-provider' };

  const resp = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      email: p.email,
      fields: { name: p.name ?? '', ...p.fields },
      groups: [],   // optional group IDs
    }),
  });

  if (!resp.ok) return { ok: false, reason: `provider-${resp.status}` };

  // Tags: separate API call per the MailerLite v2 docs.
  // Add each tag (single batch call if available).
  for (const tag of p.tags) {
    await fetch(`https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(p.email)}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ name: tag }),
    });
  }

  return { ok: true };
}
```

### Form component contract (sketch — Codex implements)

Every form component:
- Renders fields per the per-form spec (§3 of each companion doc).
- On submit, POSTs to its API endpoint (`/api/subscribe`, `/api/custom-order`, `/api/appointment-request`).
- API endpoint calls `subscribeToList()` AND, where applicable, forwards a structured email summary to the right alias (`custom@`, `marimari@`).
- On `ok: false` with `reason: 'no-provider'` → render fallback panel with copyable summary + mailto link.
- On `ok: true` → render success panel (no fake redirect).
- ZERO secrets in HTML. ZERO secrets in JS bundle. Server-side only.

### Acceptance criteria (Codex Task 3)

- `npm run build` → green, postbuild OK
- All 4 forms render
- All 4 forms degrade to fallback when `MAILERLITE_API_KEY` is absent
- `/care-guide` is UNTOUCHED
- `/aftercare-follow-up` is a NEW page
- No secrets in any committed file
- `grep -rn "MAILERLITE_API_KEY" src/` returns ONLY references via `import.meta.env.MAILERLITE_API_KEY` or `process.env.MAILERLITE_API_KEY`

---

## 4. Verification after Codex Task 3 (owner-side)

### A — Local (without API key)

```bash
cd ~/wenu-frontend
npm run dev
# in another terminal
curl -s -X POST http://localhost:4321/api/subscribe \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","tags":["source:home-footer","tier:circle"]}'
# expected: 200 with body { "ok": false, "reason": "no-provider" }
```

### B — Local (WITH API key, owner-side)

After step 4 of §2, owner re-runs the same curl. Expected: 200 with `{ ok: true }`. Then verify in MailerLite dashboard → Subscribers that test@example.com appears with the right tags. Delete the test subscriber.

### C — Live form submission

After everything is wired, submit the form on each page in a real browser. Verify:
- Subscriber appears in MailerLite within 5 seconds
- Welcome email arrives within 1 minute
- For custom orders: auto-reply arrives within 1 minute
- Tags appear correctly in dashboard
- Sender domain verified (no "via mailerlite.com" gray label in Gmail)

---

## 5. Long-term roadmap (not in this brief)

- WooCommerce + MailerLite official integration → tag `customer:has-purchased`, `customer:repeat`, abandoned-cart recovery, post-purchase aftercare automation
- Noco → MailerLite via Zapier or Make → "back in stock" pulses
- Astro + MailerLite via API for native cart events (when native cart ships)
- Loyalty tiers (Pewen / Lafken / Wenu / Pillan) wired via MailerLite groups
- A/B testing on subject lines (built into MailerLite paid tier; deferred until list >2k)

---

## 6. Out of scope tonight

- SMS / WhatsApp marketing
- Customer-service ticketing (Help Scout / Front)
- Affiliate program
- Press / PR outreach automation
- Cookie banner audit (separate compliance task)
- Welcome email body content beyond what's drafted in `wenu-subscription-and-journal-system.md` §5
