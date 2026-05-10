# Form snippets — DRAFT, NOT WIRED

This folder contains **reference Astro form components** for Wenu Mapu, drafted overnight. They are intentionally placed in `docs/snippets/forms/` (NOT in `src/components/forms/`) so:

1. They are **not compiled by Astro** — Astro only looks under `src/`.
2. They are **not imported anywhere** — zero risk to the build.
3. They are **ready for Codex / Claude Code** to copy into `src/components/forms/` and wire up per `codex-next-tasks.md` Tasks 3 / 4b / 4c.

When Codex executes Task 3 / 4b / 4c, the workflow is:

```
1. Read ~/wenu-frontend/subscription-implementation-brief.md §3
2. Move snippets:
     docs/snippets/forms/JoinTheCircleForm.astro      → src/components/forms/
     docs/snippets/forms/CustomOrderForm.astro        → src/components/forms/
     docs/snippets/forms/AppointmentRequestForm.astro → src/components/forms/
     docs/snippets/forms/subscribe.ts                 → src/lib/subscribe.ts
     docs/snippets/forms/api.subscribe.ts             → src/pages/api/subscribe.ts (rename)
3. Adjust import paths inside each component for the new location.
4. Wire each component into its host page (Newsletter.astro, custom-orders.astro, stockists.astro, journal.astro).
5. Append i18n keys to src/i18n/en.json.
6. Run npm run build; verify no errors.
7. Verify forms degrade to fallback when MAILERLITE_API_KEY is absent.
8. Per-commit approval; single commit per task.
```

**Do NOT import these files from anywhere in `src/` until they are moved into `src/`.** Astro components in `docs/` are inert reference material.

## Contents

| File | Purpose |
|---|---|
| `subscribe.ts` | Provider-agnostic helper. Reads `MAILERLITE_API_KEY` from env. Returns `{ ok, reason }`. |
| `api.subscribe.ts` | Generic Astro server endpoint. Accepts `{ email, name?, fields?, tags[] }`. Calls `subscribeToList()`. |
| `JoinTheCircleForm.astro` | Footer + home + journal newsletter capture. |
| `CustomOrderForm.astro` | Commission inquiry form with qualification logic. |
| `AppointmentRequestForm.astro` | Appointment + free local delivery request. |

## Provider integration

All three forms use the same pattern:

- `MAILERLITE_API_KEY` set in `.env` → POST to `/api/<endpoint>` → MailerLite v2 API → tags applied → email forwarded to `marimari@`/`custom@`.
- Key absent → graceful fallback panel with copyable summary + mailto link.

ZERO secrets in HTML or JS bundle. Server-side only.

## Voice

All copy follows `wenu-english-copy-pack-v1.md`. No discount bait. No "Sign up to save 10%."
