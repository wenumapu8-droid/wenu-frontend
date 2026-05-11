# Nightly autonomous run — Codex Task 6 + tree cleanup

Date: 2026-05-10 night → 2026-05-11 morning
Owner: Mari Mari (Wenu Mapu) — asleep, no real-time supervision
Sibling agent: Claude (Anthropic) — see `codex-task-4-journal-status-2026-05-10.md` for prior handoff context

> **About this file:** this prompt IS your authorization. Owner pasted it via Claude before going to sleep. Treat it as reference — do NOT delete it, do NOT renamed it, do NOT treat it as pending work. If you want a clean tree at the end, commit it as `docs(codex): nightly run authorization`.

---

## You are authorized to

1. Fully execute Codex Task 6 per `/Users/user1/wenu-frontend/codex-task-6-pdp-trust-and-related-final-prompt.md`
2. Resolve the two pending tree items below before or during Task 6
3. Commit to branch `redesign-v2` — ONE logical commit per task, ending each message with `Co-Authored-By: Codex <noreply@openai.com>`
4. Stop and write a status file if anything blocks you

## You are NOT authorized to

- `git push` to any remote (owner pushes manually after reviewing in the morning)
- Modify `.env`, `.env.*` or anything outside `/Users/user1/wenu-frontend/`
- Delete tracked files (rename to `<name>.tmp.disabled` if you need to pause)
- Touch `/care-guide`, `/aftercare/*`, `src/lib/woo.ts`, `astro.config.mjs` (per DO_NOT_TOUCH.md)
- Run anything destructive on Cloudflare, WooCommerce, DNS, MailerLite, HostGator
- Generate new image assets (reuse `/public/img/` placeholders)
- Start Task 7 (no prompt prepared yet — stop after Task 6 is verified green)

---

## Expected tree state at start

```
 M src/styles/global.css
?? src/pages/api/
?? nightly-codex-run-2026-05-10.md   ← this file, see above
```

### Pending item 1 — `src/pages/api/custom-order.ts`

Keep it active and commit it. Claude verified empirically:
- `npm run build` with `output: 'static'` silently ignores API routes that lack `prerender = false`
- Build = 105 pages, 62 products, postbuild OK with this file present

The previous `.tmp.disabled` convention was excess caution. Action:

1. Add this comment at the top of the file:
   ```ts
   // Inactive in static build (Astro 6 output: 'static' ignores API routes without prerender=false).
   // Activate by switching to hybrid/server output + SSR adapter once MailerLite env vars
   // are configured per mailerlite-setup-owner-checklist.md.
   ```
2. Commit standalone before Task 6: `feat(api): scaffold custom-order endpoint (inactive in static build)`

### Pending item 2 — `src/styles/global.css`

Diff shows `.contact-departments` `grid-column` changed from `1 / -1` to `2` plus a mobile breakpoint `@media (max-width: 800px) { grid-column: 1; }`. Owner did not confirm authorship.

- If you recognize this as your own change from a previous session, fold it into your Task 6 batch with a `style(contact): contact-departments grid placement` line item in the commit body.
- If you do not recognize it, commit standalone before Task 6: `style(contact): contact-departments grid placement + mobile breakpoint (origin unverified, layout improvement is sound)`

---

## Workflow

1. **Verify baseline:** `nvm use && npm run build 2>&1 | tail -25` — must exit 0 with 105+ pages, 62 products, postbuild OK. If it fails, STOP and write `nightly-progress-2026-05-11.md` with the failure tail.
2. **Resolve pending items 1 and 2** above. ONE commit each (or fold item 2 into the Task 6 batch as described).
3. **Execute Task 6** per `codex-task-6-pdp-trust-and-related-final-prompt.md`. ONE logical commit per coherent phase.
4. **After every commit:** rerun `npm run build` and verify pages count matches Task 6's acceptance criteria.
5. **After every commit:** append a timestamped line to `/Users/user1/wenu-frontend/nightly-progress-2026-05-11.md`.
6. **When Task 6 is done and verified green:** write the final summary section in `nightly-progress-2026-05-11.md`. Optional: commit this file (`nightly-codex-run-2026-05-10.md`) as `docs(codex): nightly run authorization` for a clean tree. Stop. Do NOT push.

---

## Stop conditions (write `nightly-progress-2026-05-11.md` and exit)

- `npm run build` fails twice in a row with the same error
- A required file referenced by the Task 6 prompt is missing or unreadable
- You need to modify a forbidden file to proceed
- Ambiguity in the Task 6 prompt that the referenced docs do not resolve
- You catch yourself about to do something outside the authorization list

---

## `nightly-progress-2026-05-11.md` format

```
# Codex nightly run — 2026-05-10 → 2026-05-11

Started: <ISO timestamp>
Authorization source: nightly-codex-run-2026-05-10.md + codex-task-6-pdp-trust-and-related-final-prompt.md

## Commits made

- <SHA> <message> (<pages count after this commit>)
- ...

## Final build

- pages: <N>
- products: <N>
- postbuild: OK | FAIL
- last command: <cmd>
- elapsed: <X> minutes

## Tree state at end

git status --short output:
<paste>

## Notes for owner

- <anything that needs human action — MailerLite setup, image asset gap, cultural-respect review for entry 2, etc.>
- <anything surprising or deviating from the prompt>
- <deferred items>

## Time / tokens

Elapsed: <X> hours
Tokens used: ~<N>
```

---

You may begin. Work quietly. Owner is asleep.
