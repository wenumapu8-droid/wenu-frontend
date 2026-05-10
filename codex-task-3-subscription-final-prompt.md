# Codex Task 3 — Subscription / capture forms (final prompt)

Date prepared: 2026-05-10 (CEO night, while Codex Task 1 is in flight)
Scope: paste-ready prompt for Codex/OpenCode to ship 4 capture forms + a host page on the Wenu Mapu Astro repo. Run AFTER Codex Task 2 (Materials pages) has reported `RESULT: success` AND the human has approved both the commit AND the MailerLite decision (Path A vs Path B).

This file supersedes `codex-next-tasks.md` Task 3 for execution. The original prompt remains valid as a reference; this version is tightened with pre-flight, an honest-fallback contract (no fake success states), and an acceptance gate.

---

## ⚠️ CRITICAL CONTRACT — read this first

**No fake success states. No pretending the form is connected if no provider exists.**

The provider integration is gated on the owner having signed up for MailerLite AND provided `MAILERLITE_API_KEY` via `.env.local` (see `wenu-subscription-and-journal-system.md` §3, §9). Two paths:

- **Path A** — `MAILERLITE_API_KEY` is present at build/runtime → form POSTs to `/api/subscribe.ts` which calls MailerLite v2 `/api/subscribers`. Real "you're in" state on success. Real error state on failure (with mailto fallback link).
- **Path B** — `MAILERLITE_API_KEY` is ABSENT → the form RENDERS the email field BUT the submit button is replaced by a real `mailto:marimari@wenumapuonline.com?subject=...&body=...` link. **No ajax. No toast. No fake success. No "you're subscribed" message.** The page tells the user honestly that the list is being set up and to email to be added.

If you cannot honor this contract, STOP and report blocked. Do not improvise a "graceful fake."

---

## Pre-flight checklist (Codex must confirm BEFORE first tool call)

- [ ] Codex Task 2 (Materials pages) reported `RESULT: success` AND the human approved that commit.
- [ ] `git status` clean on `redesign-v2`.
- [ ] `nvm use && npm run build` is green RIGHT NOW (95 pages baseline before this task).
- [ ] Owner has explicitly chosen Path A or Path B and stated which in the chat.
  - If **Path A**: confirm `MAILERLITE_API_KEY` exists in `.env.local` (do NOT print it; check existence only with `grep -l "MAILERLITE_API_KEY=" ~/wenu-frontend/.env.local` returning a path).
  - If **Path B**: confirm explicitly in chat that the build will ship without a real provider and Path B's mailto fallback is the intended user experience for now.
- [ ] You have read `AGENT_CONTROL_CENTER.md`, `DO_NOT_TOUCH.md`, AND `wenu-subscription-and-journal-system.md`.
- [ ] You have read `wenu-english-copy-pack-v1.md` §14 (4 newsletter variants paste-ready).

If any box is unchecked, STOP and report blocked.

---

## Files allowed (write list)

```
NEW components (under src/components/forms/):
  src/components/forms/JoinTheCircleForm.astro        (footer + home + journal hub)
  src/components/forms/FooterSignup.astro             (compact variant — extends or wraps JoinTheCircleForm)
  src/components/forms/AftercareSignupForm.astro
  src/components/forms/CustomOrderForm.astro
  src/components/forms/AppointmentRequestForm.astro

NEW host page (because /care-guide is OFF-LIMITS):
  src/pages/aftercare-follow-up.astro

NEW API endpoint (Path A only — skip if Path B):
  src/pages/api/subscribe.ts

EDIT (insert form components into existing pages):
  src/components/Newsletter.astro       (host JoinTheCircleForm; preserve existing mailto fallback element as Path B target)
  src/pages/custom-orders.astro         (host CustomOrderForm; preserve mailto fallback)
  src/pages/stockists.astro             (host AppointmentRequestForm; preserve mailto fallback)
  src/pages/journal.astro               (host JoinTheCircleForm in hub)

EDIT i18n (APPEND ONLY):
  src/i18n/en.json                      (form labels + consent strings + Path B fallback strings)
```

That is the entire allowed write list.

**Do NOT** edit `src/components/Footer.astro` — it is owned by Codex Task 1's commit. If the footer needs the FooterSignup component, that integration is a separate edit; for this task, leave Footer.astro alone. JoinTheCircleForm in the existing `Newsletter.astro` covers the same surface.

---

## Forbidden actions

- `/care-guide` (`src/pages/care-guide.astro`, `public/aftercare/*`, `dist/aftercare/*`) — OFF-LIMITS. The aftercare follow-up form lives on a NEW page `/aftercare-follow-up`, not inside `/care-guide`.
- Homepage structural change (`src/pages/index.astro`) — only `Newsletter.astro` is touched, and only to host the form component.
- `Base.astro`, `Nav.astro`, `Footer.astro` (Footer.astro owned by Task 1).
- `.env*` writes. The MailerLite API key is owner-managed, never written by Codex.
- Including `MAILERLITE_API_KEY` value (or any other secret) in any committed file. Use `import.meta.env.MAILERLITE_API_KEY` or `process.env.MAILERLITE_API_KEY` references only.
- `git commit`, `git push`, `git remote add`, deploy, DNS, Cloudflare, WC writes.
- New CSS files. Reuse `global.css` patterns. Form-specific styles can be inline `<style>` blocks scoped to the component.
- Image generation. No new images.
- Telegram, Slack, email-on-behalf — none of those.

---

## Provider wiring (two paths — both must work)

### Path A — `MAILERLITE_API_KEY` is set

1. `src/pages/api/subscribe.ts` — Astro server endpoint (POST). Reads `import.meta.env.MAILERLITE_API_KEY`. Calls MailerLite v2:
   ```
   POST https://api.mailerlite.com/api/v2/subscribers
   Headers: X-MailerLite-ApiKey: <key>, Content-Type: application/json
   Body: { email, name?, fields?, type: "active" }
   ```
2. Tag the subscriber with the surface tag (see §"Tags" below).
3. On 200/201, return JSON `{ ok: true }`. Form shows: "You're in. The next entry will find you."
4. On non-2xx, return JSON `{ ok: false, error: "..." }`. Form shows: "Something went wrong on our side. Email us instead → marimari@wenumapuonline.com" with a real mailto link.
5. Astro form posts via `fetch('/api/subscribe', { method: 'POST', body: ... })`. Use `client:load` Astro Island OR a vanilla `<script>` block — vanilla preferred to keep JS footprint zero on pages without forms.

### Path B — `MAILERLITE_API_KEY` is ABSENT

1. The form RENDERS the email field but the submit button is REPLACED with a `<a href="mailto:...">` link.
2. The visible message above/below the form makes the situation explicit:
   > "Direct subscriptions are being set up. Until then, write to us and we'll add you to the first wave."
3. The mailto pre-fills:
   - Recipient: `marimari@wenumapuonline.com`
   - Subject: per surface (see §"Subjects" below)
   - Body: `"Please add me to The Wenu Mapu List from <surface>. — <Your name>"`
4. **NO ajax submit. NO toast. NO success state.** Clicking the button opens the user's mail client. That is the entire interaction.

### Build-time path detection

Detect at build time using `import.meta.env.MAILERLITE_API_KEY`:

```astro
---
const provider = import.meta.env.MAILERLITE_API_KEY ? 'pathA' : 'pathB';
---
```

The component renders Path A's `<form>` + `<button type="submit">` OR Path B's `<a href="mailto:...">` based on `provider`.

Both branches must be covered by the same component file.

---

## Tags applied per surface (Path A only)

| Surface | Tag set |
|---|---|
| Footer (FooterSignup) | `source:footer`, `tier:circle`, `consent:marketing` |
| Home Newsletter (JoinTheCircleForm) | `source:home-footer`, `tier:circle`, `consent:marketing` |
| Journal hub (JoinTheCircleForm) | `source:journal`, `interest:editorial`, `consent:marketing` |
| Aftercare (AftercareSignupForm) | `source:aftercare`, `interest:aftercare`, `consent:marketing` |
| Custom orders (CustomOrderForm) | `source:custom-orders-form`, `tier:commission-queue`, `consent:transactional-only` |
| Appointments (AppointmentRequestForm) | `source:appointment-request`, `interest:appointment`, `consent:transactional-only` |

Tags map to MailerLite "groups" or "fields" depending on plan. The `subscribe.ts` endpoint sends them via the `fields` body parameter.

---

## Mailto subjects per surface (Path B)

| Surface | Subject | Body prefill |
|---|---|---|
| Footer / Home / Journal hub | `Join the circle` | `Please add me to The Wenu Mapu List. — <Your name>` |
| Aftercare | `Aftercare follow-up signup` | `Please add me to the Aftercare follow-up emails. — <Your name>` |
| Custom orders | `Commission inquiry` | `<form fields concatenated>` |
| Appointments | `Appointment / local delivery request` | `<form fields concatenated>` |

URL-encode subject and body. Use `encodeURIComponent` in the Astro frontmatter.

---

## Consent + compliance (every form, both paths)

- **Explicit checkbox, NOT pre-checked.** Required to submit.
  - Checkbox label: per surface (see `wenu-english-copy-pack-v1.md` §14).
- **Privacy policy link** under each form (right of consent line): "Read our privacy policy →" → `/privacy`.
- **CAN-SPAM postal-address line** in the form's small print: "Wenu Mapu SpA — Truckee, California (PO Box pending)" until owner provides a real PO Box.
- **Aria-label** on the email input: "Email address".
- **Honeypot field** (hidden, named `_subject_check` or similar) for bot mitigation.
- No third-party tracking pixels. No `analytics.track('subscribed')`.

---

## Copy (paste-ready from `wenu-english-copy-pack-v1.md` §14)

Use the exact copy variants from §14.1 (footer compact), §14.2 (home), §14.3 (journal hub), §14.4 (aftercare), §14.5 (Path B fallback). Do not paraphrase. If any block is missing in §14, STOP and report.

---

## Form fields per component

### JoinTheCircleForm (footer / home / journal hub)

- Email (required)
- Consent checkbox (required)
- (Path A) Submit: "Subscribe"
- (Path B) Mailto link: "Email marimari@wenumapuonline.com →"

### AftercareSignupForm

- Email (required)
- Consent checkbox (required)
- (Path A) Submit: "Sign me up"
- (Path B) Mailto link: "Email marimari@wenumapuonline.com →"

### CustomOrderForm

- Name (required)
- Email (required)
- Type of piece (required, free text)
- Material preference (optional, dropdown of 6 materials)
- Indicative budget USD (optional, free text or dropdown)
- Date you'd want it (optional, date input)
- Your idea, story, or reference (required, textarea)
- Consent checkbox: "I understand the 6-month lead time and the 50% deposit on confirmation." (required)
- (Path A) Submit: "Send commission inquiry"
- (Path B) Mailto link: encoded with all fields → mailto

### AppointmentRequestForm

- Name (required)
- Email (required)
- Phone (optional)
- Pieces you'd like to see (required, textarea)
- Preferred dates (required, free text)
- Local delivery vs in-person view (required, radio: "Local delivery to my address" / "Private appointment")
- Consent checkbox: "I want to receive appointment confirmation and follow-up about my request." (required)
- (Path A) Submit: "Send request"
- (Path B) Mailto link: encoded with all fields → mailto

---

## Acceptance criteria

After all files are written, run:

```bash
nvm use && npm run build
```

Expected:

- **Page count:** 96 (95 baseline + 1 new `aftercare-follow-up`).
- **postbuild assertion:** OK.
- **No TS errors, no Astro warnings.**

Verify the new artifacts:

```bash
test -f dist/aftercare-follow-up/index.html && echo "OK aftercare-follow-up" || echo "MISS"

# Forms render in their host pages
grep -l "JoinTheCircleForm\|FooterSignup\|AftercareSignupForm\|CustomOrderForm\|AppointmentRequestForm" \
  src/components/Newsletter.astro \
  src/pages/custom-orders.astro \
  src/pages/stockists.astro \
  src/pages/journal.astro \
  src/pages/aftercare-follow-up.astro
# expected: at least 5 file hits

# /care-guide and /aftercare/* untouched
git status -- src/pages/care-guide.astro public/aftercare/ dist/aftercare/
# expected: nothing modified
```

**Path A specific verification (only if path A chosen):**

```bash
test -f src/pages/api/subscribe.ts && echo "OK subscribe.ts" || echo "MISS"

grep -c "import.meta.env.MAILERLITE_API_KEY" src/pages/api/subscribe.ts
# expected: >= 1

# Secret never committed
grep -rEn "MAILERLITE_API_KEY=[A-Za-z0-9]" src/ public/
# expected: 0 — only the variable NAME may appear, never an = with a value
```

**Path B specific verification (only if path B chosen):**

```bash
# Confirm mailto fallback present in each form
for f in src/components/forms/*.astro; do
  hits=$(grep -c "mailto:marimari@wenumapuonline.com" "$f")
  printf "%-60s %s\n" "$f" "$hits"
done
# expected: each file >= 1

# Confirm NO fake success state in path B branch
grep -ciE "you're in|subscribed!|success!|toast" src/components/forms/*.astro
# expected: 0 in path B (success states only exist in path A branch)
# (or audit manually — ensure success-state strings are gated behind the path A conditional)
```

**Forbidden-words scan:**

```bash
grep -rEHn "Petrolia|Rizoma|Truth Tattoo|Troll Studio|Lucky7|Showroom at home|vitrine|walk-?in|\+145|contact@wenumapuonline\.com" \
  src/components/forms/ src/pages/aftercare-follow-up.astro
# expected: 0 hits
```

If any check fails, STOP and report.

---

## Manual UX verification (path-specific, you must do this before reporting success)

**Path A:**

1. Run `npm run build && npm run preview`.
2. Visit `/`, scroll to footer Newsletter → enter a fake email → check consent → click Subscribe → confirm:
   - Network tab shows POST to `/api/subscribe`.
   - On 2xx: success state appears.
   - On non-2xx: error state with mailto fallback link appears.
3. Repeat on `/journal`, `/aftercare-follow-up`, `/custom-orders`, `/stockists`.

**Path B:**

1. Run `npm run build && npm run preview` (with `MAILERLITE_API_KEY` deliberately unset).
2. Visit `/`, scroll to footer Newsletter → confirm:
   - The form RENDERS the email field.
   - The submit button is a `<a href="mailto:...">` link, NOT a `<button type="submit">`.
   - Clicking the link opens the user's mail client (or shows the OS mail-client dialog).
   - **No JavaScript fetch. No toast. No "you're in" state.**
3. Repeat on `/journal`, `/aftercare-follow-up`, `/custom-orders`, `/stockists`.

If Path B shows a success toast or a "you're subscribed" message, the build is BROKEN — fix and re-verify.

---

## Report

Per `AGENT_HANDOFF_PROTOCOL.md`. Inline in chat, ≤ 200 words. Format:

```
RESULT: <success | blocked | partial>
PROVIDER PATH: <A | B>
WHAT CHANGED:
  - src/components/forms/JoinTheCircleForm.astro (NEW)
  - src/components/forms/FooterSignup.astro (NEW)
  - ... (one bullet per file)
  - src/i18n/en.json (APPENDED form labels + consent + Path B strings)
WHAT WAS VERIFIED:
  - npm run build → 96 pages, postbuild OK
  - All form components present
  - /care-guide and /aftercare/* UNTOUCHED
  - <Path A: subscribe.ts uses env var; secret not committed>
  - <Path B: mailto fallback verified manually; no fake success state>
  - Forbidden-words scan: 0 hits
WHAT'S NEXT: (if Path B) Owner signs up for MailerLite and re-runs the build with MAILERLITE_API_KEY in .env.local to flip to Path A.
NOTES FOR HUMAN: <only if action needed>
```

Do NOT write a new `*-report.md` file unless the human asks.

---

## Hard rules echo (10 rules)

1. Read `AGENT_CONTROL_CENTER.md` + `DO_NOT_TOUCH.md` + `wenu-subscription-and-journal-system.md` first.
2. Per-edit + per-commit human approval.
3. **No commit, no push, no remote-add, no deploy.**
4. **No DNS, no Cloudflare, no Tunnel changes.**
5. **No WC product writes.**
6. No `.env*` reads-into-output. **Never commit MailerLite key.**
7. **No Aftercare modifications.** Form host page is `/aftercare-follow-up`, NOT inside `/care-guide`.
8. `npm run build` after every batch. Postbuild assertion must hold.
9. Report ≤ 200 words per protocol.
10. **No fake success states.** Path B is the honest fallback. If you cannot ship Path B without faking success, STOP and ask.

---

## Commit message (after explicit human "yes")

```
feat(forms): add subscription + custom-order + appointment forms (frontend, gated provider)
```

ONE commit. Do NOT amend Codex Task 1 or Task 2 commits.

---

## What this prompt does NOT cover

- Wiring real MailerLite (account creation, DNS DKIM/SPF, owner-only).
- PO Box rental for CAN-SPAM (owner-only).
- Privacy policy update (lawyer + owner).
- WooCommerce ↔ MailerLite integration (deferred per `wenu-subscription-and-journal-system.md` §8).
- Loyalty / tiered cosmology (Rage Nation pattern, deferred).
- SMS / WhatsApp marketing.
- Native Astro cart / checkout (separate decision).

---

## References

- `~/wenu-frontend/wenu-subscription-and-journal-system.md` (strategy + capture surfaces + welcome flow + compliance)
- `~/wenu-frontend/wenu-english-copy-pack-v1.md` §14 (paste-ready copy variants)
- `~/wenu-frontend/codex-next-tasks.md` Task 3 (original; superseded by this file for execution)
- `~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md`
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md`
- `~/wenu-frontend/agent-control/AGENT_HANDOFF_PROTOCOL.md`
- MailerLite v2 API docs: https://developers.mailerlite.com/v2/reference/subscribers
