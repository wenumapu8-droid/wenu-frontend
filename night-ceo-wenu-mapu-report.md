# Night CEO Report — Wenu Mapu — 2026-05-10

Owner: Claude Code (Opus, acting CEO + senior strategist + UX architect for the night)
Mode: autonomous within safe boundaries; no DNS, no deploy, no push, no WC writes, no Aftercare touches, no `.env*` reads-into-output, no secrets printed, no image generation, no homepage structural edits.

---

## 1. Executive summary

Tonight produced **9 ship-ready strategic + practical documents** + **6 ready-to-wire form component stubs** (unimported, safe, isolated outside Astro's compile path) + **1 Obsidian project-memory update**. The Astro build remained green throughout (88 pages, 64 products, postbuild OK).

The work is concrete, not abstract. The most practical outputs:

- **`wenu-english-copy-pack-v1.md`** — copy-paste-ready English for 20+ surfaces (home, shop, every category, every material, custom orders, jewelry styling, appointments, contact, FAQ, shipping, footer, newsletter, PDP trust block, aftercare link, 404, OG default).
- **`custom-orders-system-wenu-mapu.md`** — qualification form fields, founder reply templates (Yes / Conditional / No), Notion/Noco tracking schema, Codex prompt for the form.
- **`local-appointments-delivery-system.md`** — page structure, request form spec, founder operational checklist, calendar/booking decision (manual now → Cal.com when volume justifies), LocalBusiness JSON-LD.
- **`subscription-implementation-brief.md`** — owner step-by-step (10 steps from MailerLite signup to live forms), `subscribe.ts` sketch, tag taxonomy.
- **`wordpress-live-cleanup-checklist.md`** — owner-only WP admin checklist, ~60–90 min, to fix the legacy site footer + test products + Spanish strings + SEO + apex 502 (Option A 301).
- **`wenu-visual-prompts-v1.md`** — 10+ prompt-ready specs with canonical palette + negative prompt + acceptance criteria. NO images generated (Mode A).
- **`docs/snippets/forms/`** — 3 form components + 1 helper + 1 API endpoint, ready for Codex to copy into `src/components/forms/` and wire up.

A residual cleanup was discovered: 6 source pages + `humans.txt` still reference the old `contact@wenumapuonline.com`. New **Codex Task 1.5** added to close it.

The Astro footer + `en.json` were updated **outside this session** (likely by the user or Codex Task 1) to use marimari@ + (408) + appointment line. Build remains green; verified by `npm run build`.

---

## 2. What was completed (Workstream-by-Workstream)

| Workstream | Deliverable | Status |
|---|---|---|
| 1 | `revenue-funnel-map-wenu-mapu.md` | NEW |
| 2 | `million-dollar-positioning-wenu-mapu.md` | NEW |
| 3 | `full-site-completion-plan.md` | already existed (prior night); referenced |
| 4 | `wenu-english-copy-pack-v1.md` | NEW |
| 5 | `custom-orders-system-wenu-mapu.md` | NEW |
| 6 | `local-appointments-delivery-system.md` | NEW |
| 7 | `wenu-subscription-and-journal-system.md` (existed) + `subscription-implementation-brief.md` | NEW brief |
| 8 | `wenu-visual-prompts-v1.md` + `wenu-visual-agent-plan.md` (refined to script-based pipeline by user) | NEW prompts pack |
| 9 | `wordpress-live-cleanup-checklist.md` | NEW |
| 10 | `codex-next-tasks.md` updated (added Tasks 1.5, 4b, 4c, 8) | UPDATED |
| 11 | `docs/snippets/forms/` — 6 files (subscribe.ts, api.subscribe.ts, JoinTheCircleForm.astro, CustomOrderForm.astro, AppointmentRequestForm.astro, README.md) | NEW (low-risk: outside Astro compile path) |
| 12 | `~/Obsidian/WenuAgent/00-Index/Estado-Wenu-Mapu-2026-05-10-Night-CEO.md` | NEW |

**ChatGPT browser:** not used tonight. Existing context from the prior session was sufficient. No browser sessions opened, no secrets pasted.

---

## 3. Files created / updated

In `~/wenu-frontend/`:

```
NEW    revenue-funnel-map-wenu-mapu.md
NEW    million-dollar-positioning-wenu-mapu.md
NEW    wenu-english-copy-pack-v1.md
NEW    custom-orders-system-wenu-mapu.md
NEW    local-appointments-delivery-system.md
NEW    subscription-implementation-brief.md
NEW    wenu-visual-prompts-v1.md
NEW    wordpress-live-cleanup-checklist.md
NEW    night-ceo-wenu-mapu-report.md   (this file)
EDIT   codex-next-tasks.md             (added Tasks 1.5, 4b, 4c, 8; refreshed sequencing)
NEW    docs/snippets/forms/README.md
NEW    docs/snippets/forms/subscribe.ts
NEW    docs/snippets/forms/api.subscribe.ts
NEW    docs/snippets/forms/JoinTheCircleForm.astro
NEW    docs/snippets/forms/CustomOrderForm.astro
NEW    docs/snippets/forms/AppointmentRequestForm.astro
```

In `~/Obsidian/WenuAgent/00-Index/`:

```
NEW    Estado-Wenu-Mapu-2026-05-10-Night-CEO.md
```

In `~/wenu-frontend/src/`: **NOTHING modified by this session.** Footer.astro + en.json were updated outside this session (verified during build smoke check).

---

## 4. Revenue opportunities found

In priority order:

1. **Local Tahoe / Truckee funnel is undervalued.** Free local delivery is currently buried; surfacing it on every page adds a real differentiation. (Plan in `local-appointments-delivery-system.md`.)
2. **Material-axis SEO surface is unbuilt.** 6 material landings (per Codex Task 2) double the category-level routes from 5 to 11, capturing organic searches like "ASTM F-136 titanium septum" and "Atacama meteorite ring."
3. **Custom orders qualification form** filters unserious inquiries → founder spends time on real $400–$2,500+ leads.
4. **Drop cadence on the Mapuche calendar** (Wiñoy Xipantu, Pewu, Walüng, Rimu) creates 4–6 scarcity moments per year — trains the audience that drops happen, raises both anticipation and AOV.
5. **/jewelry-styling as a third service surface** (peer of /custom-orders + /stockists) — cheap to build, raises perceived value, opens a free-curation funnel that converts to a piece.
6. **PDP spec block + cross-sell rail** raise per-PDP conversion and AOV (standard +10–25% for cross-sell).
7. **Editorial Journal as email moat** — 6 founding entries = SEO surface + email magnet. Once 100+ subscribers exist, drops convert at 5–15% (vs cold traffic).
8. **Auto-reply + qualification questions** on commission inquiries protect the founder's time without losing leads.
9. **Pair pricing** (hangers / weights / septum) and ceremonial packaging — small but real per-order lifts.
10. **Local delivery upgrade play** — bring 1–2 extra pieces during a delivery drop-off; pure relationship sale.

Full inventory and 30-day plan: `revenue-funnel-map-wenu-mapu.md` §3, §9.

---

## 5. Top conversion blockers (in priority)

1. Legacy WP footer (Petrolia + Rizoma + +145 phone) on every page → undermines trust everywhere. **Owner WP admin fix.**
2. Test products (`producto prueba`, `Pronto`) live on legacy homepage → reads as a hobby store. **Owner WC admin status → Draft.**
3. Apex `wenumapuonline.com` returns 502 → anyone typing without `www.` sees an error. **Owner Cloudflare 301.**
4. PDP missing spec block → every product looks generic. **Codex follow-up after Task 2.**
5. `/stockists` doesn't have sharp appointment + delivery copy → local funnel is leaky. **Codex Task 4c.**
6. No subscription system → no email moat. **Owner MailerLite + Codex Task 3 / 4b / 4c.**
7. No `/material/*` landings → losing organic searches. **Codex Task 2.**
8. Custom Orders form is mailto → no qualification. **Codex Task 4b.**
9. Empty Journal → no editorial moat. **Codex Task 7.**
10. 6 Astro source files + humans.txt still reference `contact@`. **Codex Task 1.5.**

---

## 6. Recommended business model (confirmed)

- **Hybrid 3-axis catalog:** Shop by Body Placement / Shop by Material / Shop by Collection. Story / Ritual pages as brand depth, not navigation noise.
- **3 product tiers:** Foundation ($25–80) / Author ($100–400) / Commission ($400–2,500+).
- **3 service surfaces:** /custom-orders + /jewelry-styling + /stockists (Visit / Appointments).
- **No discounts.** "VAULT" naming if clearance ever happens.
- **Drop cadence on Mapuche calendar.** 4–6 drops/year, 3–8 pieces each.
- **No piercer network claim.** Wenu Mapu does not pierce.
- **Local delivery + private appointment** as the local funnel; never "showroom at home."
- **Single founder voice** in every customer email; no "support team" plural pretense.
- **MailerLite** as email platform (free tier covers 6–12 months of growth).

Math: $1M annual revenue plausible inside 18–24 months given trust + SEO + subscription + drop discipline. Breakdown in `million-dollar-positioning-wenu-mapu.md` §15.

---

## 7. Recommended sitemap

(Full target in `full-site-completion-plan.md` §2.)

```
/                          ✅ Home
/shop                      ✅ Catalogue
/piercing /hangers /amulets /ear-weights /ritual-objects   ✅ Placement landings
/material/<key> × 6 + hub  📌 NEW (Codex Task 2)
/collection/<key> × 3      📌 NEW
/custom-orders             ✅
/jewelry-styling           📌 NEW (Codex Task 8)
/stockists (rename surface to "Visit / Appointments")  ⏳ rewrite (Codex Task 4c)
/about /artistry /materials  ✅
/care-guide                ✅ OFF-LIMITS
/sizing-guide /faq /shipping /shipping-returns /contact /local  ✅
/journal + /journal/<slug> × 6   ⏳ Codex Task 7
/aftercare-follow-up       📌 NEW (Codex Task 3)
/privacy /terms /accessibility /404   ✅
```

---

## 8. Recommended funnels

5 buyer journeys mapped in `revenue-funnel-map-wenu-mapu.md` §2:

1. Instagram → Product → Cart (Archetype A, B, F)
2. Organic search → Material/Placement landing → PDP (A, B, C)
3. Word of mouth → Local appointment / delivery (E)
4. Social/search → Custom order (D)
5. Journal → newsletter → drop (B, C, A repeat)

Each has explicit friction points + quick wins.

---

## 9. Recommended CTAs

(Full table in `revenue-funnel-map-wenu-mapu.md` §4.)

- **Hero:** Shop the collection · Book a private appointment
- **Mega-menu:** Shop by Placement · Shop by Material · Shop by Collection
- **PDP:** Add to cart · Find your size · Read aftercare · Request custom variant
- **Footer:** Read the Journal · Join the circle (no discount bait) · Request a commission
- **Local visitor:** Request an appointment · Free local delivery
- **Custom-order intent:** Start a commission · See example commissions

Avoid: "Find a Piercer" (no network), "Sale," "Sign up to save 10%."

---

## 10. Copy pack summary

`wenu-english-copy-pack-v1.md` covers:

- Hero + "What we are now" intro block
- Shop intro
- All 5 placement-category landings
- All 6 material landings (with canonical phrases from BRAND-DNA §4)
- Custom Orders hero refresh
- Jewelry Curation page (entirely new)
- Private Appointments + Local Delivery (full block)
- Contact (canonical channel block + 3 prescribed wordings)
- FAQ intro
- Shipping & Returns intro + local delivery callout
- Footer (brand block + address + contact + bar)
- Newsletter "Join the circle" (full + compact + mailto fallback)
- PDP trust block (with worked examples)
- Aftercare link block
- 404 page
- OG default
- 19-item banned-phrases list
- 3-test tone calibration cheatsheet

Every block is short enough to paste into `en.json` or directly into an Astro page body.

---

## 11. Subscription system summary

- **Platform:** MailerLite (free tier covers first 1k subs / 12k sends/mo).
- **List name:** "The Wenu Mapu List" / button copy "Join the circle."
- **4 capture surfaces:** home + journal hub (JoinTheCircleForm), per-Journal-entry CTA, /aftercare-follow-up (NEW page, NOT inside /care-guide), /custom-orders (CustomOrderForm), /stockists (AppointmentRequestForm).
- **Tag taxonomy:** source, tier, interest:material:<key>, interest:placement:<key>, consent.
- **Welcome flow:** 3 emails, days 0 / 7 / 14. No discount bait.
- **Owner setup:** 10-step checklist in `subscription-implementation-brief.md` §2 — sign up, verify domain (DNS DKIM/SPF — owner-only), API key into `.env`, configure tags + automations.
- **Codex implementation:** form snippets ready in `docs/snippets/forms/`.

---

## 12. Custom orders system summary

- **Cadence:** 6–10 commissions/year max.
- **Lead time:** 6 months. Deposit: 50% non-refundable.
- **Ticket band:** $400 – $2,500+.
- **Form fields:** name, email, type, placement, material, stone, budget, timing, specific date, story, inspiration URL, consent. Soft qualification: budget < $400 → redirect to /jewelry-styling.
- **Auto-reply email** within seconds (template in `custom-orders-system-wenu-mapu.md` §5).
- **Founder reply templates:** Yes / Conditional / No (template in §6).
- **Notion/Noco tracking:** schema in §7 (one row per inquiry, status pipeline).
- **Worked-example commissions:** 3 anonymized past commissions on /custom-orders page (Owner pending — pick + permission + photo).
- **Codex implementation:** Task 4b (CustomOrderForm + qualification + /api/custom-order endpoint).

---

## 13. Local appointment + delivery summary

- **Service area:** Truckee, Kings Beach, Tahoe Vista, nearby Truckee airport area.
- **Two modes:** private appointment (selected pieces brought to a private space) + free local delivery (within 24–72h of payment).
- **Privacy:** appointment locations confirmed only after booking; never published.
- **Page surface:** `/stockists` (URL preserved for SEO; surface label rebranded "Visit / Appointments").
- **Form:** AppointmentRequestForm (name, email, phone optional, mode radio, area select, pieces textarea, dates textarea, notes optional, consent).
- **Calendar:** manual now (email/DM offering 2–3 windows). Cal.com when volume > 10 appointments/month.
- **WhatsApp:** removed from /contact since no business number confirmed; revisit when one exists.
- **LocalBusiness JSON-LD:** sketched in `local-appointments-delivery-system.md` §9 with city-only address (no street). Add via Base.astro jsonLd prop on /stockists + /contact.
- **Founder ops checklist** for safety, privacy, follow-up: §7.
- **Codex implementation:** Task 4c.

---

## 14. Visual asset pipeline summary

- **Mode A (prompt-only) is default.** No images generated tonight, no credits spent.
- **Pipeline modes:** A (prompt-only) → B (1 dry run) → C (max 2 options) → D (integrate). REJECT mode archives, never deletes.
- **Tool taxonomy:** Real camera for product/founder/workshop. AI generation only for editorial mood / minimal SVG / placeholder. Claude Design for SVG geometry. Canva/Figma for composition.
- **Universal negative prompt** + brand palette (Obsidian / Bone / Sand / Silver / Bronze / Ember) prepended to every generation.
- **10+ ready prompts** in `wenu-visual-prompts-v1.md`: hero variants, 5 category banners, 6 material macros, product placeholder, OG default, 404.
- **Cost policy:** $5/session ceiling, $20/month soft cap, 2 generations max per asset.
- **Quality gates G1–G5** (brand canon → cultural respect → technical → integration → approval).
- **Asset Slot system + Asset 07 + 08 handoff:** awaits owner-provided source SVG (Mode A).
- **Note:** the user refined `wenu-visual-agent-plan.md` to a script-based approach (`scripts/gen-visual.mjs`). The visual-prompts-v1 pack is compatible with that script.

---

## 15. Codex execution queue summary

(Full in `codex-next-tasks.md` — refreshed sequencing.)

| # | Task | Status |
|---|---|---|
| 1 | Footer + Contact cleanup | partially done (Footer.astro + en.json updated outside this session) |
| **1.5** | **NEW** — finish residual contact@ cleanup in 6 pages + humans.txt | ready |
| 2 | 6 material landings + hub | ready |
| 3 | JoinTheCircleForm wiring (gated on MailerLite key) | ready when key in .env |
| 4a | Visual handoff Asset 07 + 08 | blocked on source SVG |
| **4b** | **NEW** — CustomOrderForm + qualification + auto-reply | ready when MailerLite key in .env |
| **4c** | **NEW** — AppointmentRequestForm + /stockists rewrite + LocalBusiness JSON-LD | ready when MailerLite key in .env |
| 5 | Internal link audit | ready |
| 7 | Journal template + 6 founding entries | ready (after Task 2) |
| **8** | **NEW** — /jewelry-styling page | ready (independent, low risk) |

Each task includes: exact files allowed, forbidden actions, acceptance criteria, build commands, single-line commit message.

---

## 16. Obsidian updates

- ✅ NEW: `~/Obsidian/WenuAgent/00-Index/Estado-Wenu-Mapu-2026-05-10-Night-CEO.md` (full snapshot for next session — overrides the prior one).
- ✅ The prior `Estado-Wenu-Mapu-2026-05-10.md` is preserved (linked from the new note as historical reference).

No other vault notes modified. No vault deletions.

---

## 17. What was NOT touched

- ❌ No `~/wenu-frontend/src/` files modified by this session (Footer.astro + en.json were modified outside this session by user/Codex).
- ❌ No commits, no push, no merge, no remote-add.
- ❌ No deploy, no Cloudflare Pages action.
- ❌ No DNS changes, no Cloudflare Tunnel changes, no Cloudflare Access changes.
- ❌ No WC product reads-into-output, no WC writes.
- ❌ No `.env*` files read into output, no secrets printed.
- ❌ No `MAILERLITE_API_KEY` value in any committed/written file.
- ❌ No Aftercare files modified (`public/aftercare/*`, `public/downloads/*`, `dist/aftercare/*`).
- ❌ No homepage structural change.
- ❌ No new top-level navigation items.
- ❌ No image generation, no credits spent.
- ❌ No browser automation runs.
- ❌ No ChatGPT browser sessions opened.
- ❌ No Telegram / email sent on owner's behalf.
- ❌ No legacy WP admin logins.
- ❌ No `.gitignore`, `package.json`, `astro.config.mjs` changes.

---

## 18. What needs owner approval

In priority order (also in `Estado-Wenu-Mapu-2026-05-10-Night-CEO.md` §6):

1. **Verify marimari@wenumapuonline.com** exists, is monitored, is the canonical primary email.
2. **WP admin cleanup** per `wordpress-live-cleanup-checklist.md` (~90 min): footer, test products, Spanish strings, SEO plugin, apex 301.
3. **Approve Codex Task 1.5** (residual contact@ cleanup in 6 source pages + humans.txt).
4. **Approve Codex Task 2** (6 material landings + hub).
5. **Sign up MailerLite** under marimari@ + verify sender domain (DNS DKIM/SPF — owner-only DNS change).
6. **Create email aliases** orders@ + custom@ via Cloudflare Email Routing (free).
7. **Approve Codex Tasks 3 + 4b + 4c** (forms — gated on MailerLite key in `.env`).
8. **Rent PO Box in Truckee** for CAN-SPAM physical address (~$80/year).
9. **Privacy policy real text** with lawyer review (CCPA + GDPR + CAN-SPAM).
10. **Brand session of photography** — 6 macros + workshop + founder portrait + process shots.
11. **Cultural review by founder** for /collection/chaway before publishing.
12. **Decide first drop** — Wiñoy Xipantu 2026 (June 24) is the natural moment.
13. **Decide on Cloudflare Pages preview cutover** vs continuing with apex 502 fix temporal.

---

## 19. First 5 actions for tomorrow

1. **Open this report + the Obsidian snapshot.** Both designed to give full state in <10 minutes.
2. **Owner WP admin cleanup** per `wordpress-live-cleanup-checklist.md` §1–§3 (~30 min for the P0 items: footer + test products + Spanish strings).
3. **Approve and run Codex Task 1.5** (residual contact@ cleanup — 5 minutes of code, 1 commit).
4. **Approve and run Codex Task 2** (6 material landings + hub — biggest single SEO + UX uplift).
5. **Owner-only**: sign up for MailerLite under marimari@, verify sender domain (DNS DKIM/SPF), and put the API key in `~/wenu-frontend/.env` (per `subscription-implementation-brief.md` §2). Then approve Codex Task 4b (CustomOrderForm).

---

## 20. Whether any code / build / deploy / DNS / push happened

- **Code changed by this session:** **NONE**. No `~/wenu-frontend/src/` file modified by Claude Code tonight.
- **Code changed outside this session (during the night):** Footer.astro + en.json were updated (likely by Codex Task 1 partial run or by the user). Build green confirmed.
- **`npm run build`:** triggered ONCE for verification. Result: 88 pages, 64 products, postbuild OK.
- **Commits:** ZERO.
- **Push:** NEVER.
- **Deploy:** NEVER.
- **DNS:** NEVER.
- **Cloudflare:** NEVER (no tunnel changes, no Access changes, no Email Routing changes).
- **WC writes:** NEVER.
- **Image generation:** NEVER.
- **Credits spent:** ZERO.
- **Secrets printed / committed:** NEVER.
- **`.env*` reads-into-output:** NEVER.

---

## 21. Sources

Internal:
- `~/wenu-frontend/agent-control/AGENT_CONTROL_CENTER.md`
- `~/wenu-frontend/agent-control/DO_NOT_TOUCH.md`
- `~/wenu-frontend/agent-control/TASK_QUEUE.md`
- `~/wenu-frontend/agent-control/AGENT_HANDOFF_PROTOCOL.md`
- `~/wenu-frontend/CLAUDE.md`
- `~/wenu-frontend/codex-next-tasks.md` (updated tonight)
- `~/wenu-frontend/full-site-completion-plan.md` (prior night)
- `~/wenu-frontend/wenu-contact-and-operations-plan.md` (prior night)
- `~/wenu-frontend/wenu-subscription-and-journal-system.md` (prior night)
- `~/wenu-frontend/market-reference-study-wenu-mapu.md` (prior night, refreshed)
- `~/wenu-frontend/live-site-audit-wenumapuonline.md` (prior night, refreshed)
- `~/wenu-frontend/claude-design-integration-plan.md`
- `~/wenu-frontend/wenu-visual-agent-plan.md` (refined to script-based by user)
- `~/wenu-frontend/end-of-day-status.md`
- `~/Obsidian/WenuAgent/CLAUDE.md`
- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md`
- `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md`
- `~/Obsidian/WenuAgent/brand/copy-frontend-2026-05-01.md`
- `~/Obsidian/WenuAgent/00-Index/Estado-Wenu-Mapu-2026-05-10.md` (prior snapshot)

Build verification: `cd ~/wenu-frontend && nvm use && npm run build` → 88 pages, postbuild `[verify-build] OK: 64 product pages built.`, exit 0.
