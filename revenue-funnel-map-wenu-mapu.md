# Wenu Mapu — Revenue Funnel Map

Date: 2026-05-10 (CEO night)
Scope: practical, end-to-end map of how a person becomes a Wenu Mapu customer (or repeat buyer / commission lead / appointment guest), with friction points, quick wins, and AOV levers. Strategy → action.

Companion: `million-dollar-positioning-wenu-mapu.md`, `full-site-completion-plan.md`, `wenu-english-copy-pack-v1.md`, `custom-orders-system-wenu-mapu.md`, `local-appointments-delivery-system.md`, `wenu-subscription-and-journal-system.md`.

---

## 0. Canonical business facts (binding)

- No studio. Private appointments + free local delivery in Truckee / North Lake Tahoe area (Truckee, Kings Beach, Tahoe Vista, nearby).
- Inventory private, in Noco. Selected pieces shown by appointment.
- Email: marimari@wenumapuonline.com · Phone: +1 (408) 500-6211 · IG: @wenu__mapu

---

## 1. Buyer archetypes (who is actually buying)

| # | Archetype | Trigger | Buying mode |
|---|---|---|---|
| A | **Stretched-lobe practitioner** (1–4g+) | needs a piece for a specific gauge / placement | DTC, repeat |
| B | **Body jewelry collector** | aesthetic + material discipline; collects across studios | DTC, occasional |
| C | **Ritual / ancestral seeker** | drawn to the cosmology and the meteorite story | low frequency, high ticket |
| D | **Commission client** | wants a one-of-a-kind piece (signet, amulet, custom hanger) | rare, very high ticket |
| E | **Local Tahoe / Truckee buyer** | discovered via word of mouth, IG, local search | DTC + appointment + delivery |
| F | **Gift buyer** | partner, sibling, milestone | DTC, time-pressured |
| G | **Peer piercer / studio** (future) | interested in wholesale or referral | service-led, deferred |

The site has to serve A, B, C, E, F today. D is high-value but low volume. G is deferred.

---

## 2. Primary buyer journeys

### Journey 1 — Instagram → Product → Cart (Archetype A, B, F)

```
Instagram post / story / reel
  → bio link → wenumapuonline.com (Home) OR direct PDP via Linktree
    → if Home: Hero "Shop the collection" → /shop OR direct category landing
    → if PDP: read piece → ATC → WC cart → checkout
  → cart redirect to WP /cart/?add-to-cart=ID  (current Phase 1 routing)
  → checkout in legacy WC
  → confirmation email from orders@
  → post-purchase: aftercare email day 3 + day 14 + day 90 (subscription system)
```

**Friction:** Astro PDP → WC cart cross-domain handoff is jarring. Spec block missing on PDP. No "you might also like" rail. Aftercare follow-up not yet wired.

**Quick wins:**
- **PDP spec block** (Codex Task 2 in next round): material / gauge / made-in / sizing / aftercare / commission link. ⚡ raises trust per piece.
- **Cross-sell rail** under PDP: 3 cards same material or maker series. ⚡ raises AOV ~10–25% in standard e-commerce.
- **Cart-recovery email** (post-MailerLite signup): triggers on abandoned cart through WC integration. Deferred to Phase 5.

### Journey 2 — Organic search → Material/Placement landing → PDP (Archetype A, B, C)

```
Google search "implant grade titanium septum 16g"
  → ranks /piercing OR (after Phase 2) /material/titanium
    → reads landing intro + featured rail
    → clicks PDP → ATC → cart
  → OR clicks "Read aftercare" / "Find your size" → educated → returns to PDP
```

**Friction:** Today only `/piercing /hangers /amulets /ear-weights /ritual-objects` exist. No `/material/*` landings. Each PDP doesn't link to the relevant category landing or material page (no cross-link rail).

**Quick wins:**
- **6 material landings** (already in Codex Task 2 queue). ⚡ doubles SEO surface from 5 to 11 category-level routes.
- **Per-page H1 + meta description** discipline (Phase 2 done — verify with internal-link audit).
- **JSON-LD CollectionPage on every category landing** — already in pattern.
- **Cross-link from PDP to category + material**: see Journey 1 quick wins.

### Journey 3 — Word of mouth → Local visit (Archetype E)

```
Friend / Tahoe local mention
  → wenumapuonline.com OR direct DM @wenu__mapu
    → /stockists ("Visit / Appointments")
      → reads how appointment works + free local delivery
      → CTA: "Request an appointment" → mailto OR (Phase 5) form
    → owner replies within 48h
    → appointment scheduled
    → in-person view OR delivery
    → checkout in person OR via Astro PDP after the visit
```

**Friction:** `/stockists` currently doesn't have the appointment-only model copy in its sharpest form. No structured request form.

**Quick wins:**
- **Rewrite /stockists** with the 3-line wording + "How it works" 4-step + delivery zone callout (Codex follow-up). Copy in `wenu-english-copy-pack-v1.md`.
- **AppointmentRequestForm.astro** (Codex Task referencing `local-appointments-delivery-system.md` §6). Wires to `marimari@` until styling@.
- **Footer line** mentioning "Free local delivery — Truckee / North Lake Tahoe area" so every visitor sees it without clicking.

### Journey 4 — Social / search → Custom order (Archetype D)

```
Trigger: someone wants a piece they can't find
  → /custom-orders → reads scope + 6-step process + materials + terms
    → mailto fallback OR (Phase 5) CustomOrderForm
  → owner replies within 5 business days
  → concept call → sketch → 50% deposit → forging (months 2-5) → delivery
```

**Friction:** Form is mailto fallback (Phase 1). No "qualification quiz" before the email — every inquiry is full-bandwidth founder time. No example commission portfolio (no visual social proof).

**Quick wins:**
- **CustomOrderForm with qualification fields** (type / material / budget / story / timing) — see `custom-orders-system-wenu-mapu.md`. ⚡ filters out unserious inquiries; founder spends time on real leads.
- **Auto-reply email** acknowledging within seconds (subscription system §5 welcome flow).
- **3 worked example commissions** (anonymized) on `/custom-orders` page — proves the process. ⚡ closes the "is this real?" gap.

### Journey 5 — Journal → newsletter → drop / restock (Archetype B, C; future repeat for A)

```
Search "what is Vacamuerta meteorite" / "Mapuche cosmology jewelry"
  → /journal/<entry>
    → reads ~800 words → end-of-entry "Join the circle" form
  → MailerLite welcome flow (3 emails over 14 days)
  → subscriber gets monthly Journal + drop announcements
  → drops convert at 5–15% on a small list — much higher than cold traffic
```

**Friction:** Journal is empty today. No Wenu Mapu List. No drops to announce. No restock alerts.

**Quick wins:**
- **6 founding Journal entries** (Codex Task 7 in queue).
- **MailerLite signup wired** (Codex Task 3, gated on owner signup).
- **First drop named on Mapuche calendar moment** (e.g., "We Tripantu" winter solstice — June 21; "Wiñoy Xipantu" — June 24). Even a small drop (3–5 pieces) trains the audience that drops happen.

---

## 3. Friction inventory (ranked by revenue impact)

| # | Friction | Impact | Effort to fix | Priority |
|---|---|---|---|---|
| 1 | Legacy WP footer shows Petrolia / Rizoma / +145 phone — undermines every visitor's trust | HIGH (every page view) | Low (WP admin edit) | **P0** |
| 2 | Test products `producto prueba` + `Pronto` live on legacy homepage | HIGH (instant cheap-shop signal) | Low (WC admin status → Draft) | **P0** |
| 3 | Apex `wenumapuonline.com` returns 502 — anyone typing without `www.` sees error | HIGH | Medium (Cloudflare DNS / Tunnel decision) | P0 |
| 4 | Astro PDP has no spec block → every product looks generic | HIGH (per-PDP conversion) | Low (Codex spec component) | P1 |
| 5 | `/stockists` doesn't have sharp appointment copy → local funnel is leaky | MEDIUM-HIGH (local revenue) | Low (Codex copy + form) | P1 |
| 6 | No subscription system → no email moat, no drop sales | HIGH long-term | Medium (MailerLite + Codex forms) | P1 |
| 7 | No `/material/*` landings → losing organic searches by material | MEDIUM-HIGH (SEO) | Medium (Codex 6 pages) | P1 |
| 8 | Custom Orders form is mailto → no qualification, every inquiry = founder time | MEDIUM | Medium (form + auto-reply) | P2 |
| 9 | Empty Journal → no SEO content moat, no email magnet | MEDIUM (compounding) | Medium (6 entries to write) | P2 |
| 10 | Mixed-language UI on legacy WP (Cesta, Añadir, Leer más) | MEDIUM | Low (WC strings) | P2 |
| 11 | No reviews / social proof anywhere → premium claim feels unvalidated | MEDIUM | Medium (collect 5 honest quotes; later Judge.me) | P2 |
| 12 | No `/jewelry-styling` page → missing third service surface | LOW-MEDIUM | Low (1 page) | P3 |
| 13 | No drop/restock automation → no scarcity engine | MEDIUM | Medium (MailerLite + WC integration) | P3 |
| 14 | Cardinal SVGs + pattern bands are placeholders | LOW (visual polish) | Medium (handoff Asset 07/08) | P4 |
| 15 | Native Astro cart deferred → cross-domain handoff to WC cart | MEDIUM long-term | High (architecture decision) | Deferred |

P0–P1 = before any paid traffic. P2 = within 30 days. P3 = within 60 days.

---

## 4. CTAs per funnel stage

| Stage | Primary CTA | Secondary CTA | Surface |
|---|---|---|---|
| Awareness (IG, search) | n/a | n/a | external |
| Land on Home | "Shop the collection →" | "Book a private appointment →" | hero |
| Land on Category | "Browse the catalogue →" | "Find your size" / "Read aftercare" | landing CTA pair |
| Land on PDP | "Add to cart →" | "Find your size" · "Read aftercare" · "Request custom variant" | PDP block |
| Cart abandonment (future) | "Complete your order →" | "Reply with questions →" (mailto reply) | recovery email |
| Post-purchase | "Read aftercare guide →" | "Join the circle →" | confirmation page + day-3 email |
| Returning visitor | "Latest Journal entry →" | "New pieces →" | home + nav |
| Lead capture (every page) | "Join the circle" (no discount bait) | n/a | footer |
| Local visitor | "Request an appointment →" | "Free local delivery" | /stockists, footer |
| Custom-order intent | "Start a commission →" | "See example commissions" | /custom-orders, /collection |

Avoid: "Sale," "Find a Piercer" (no network), "Sign up to save 10%."

---

## 5. AOV levers

Concrete ways to raise average order value without breaking the brand:

1. **Cross-sell rail on PDP** — 3 pieces same material or same maker series. Standard +10–25% lift.
2. **Material discipline** — promote 14k Gold and Vacamuerta as separate landings. Higher-ticket pieces become discoverable.
3. **Pair pricing** — for hangers, ear weights, septum: feature as pairs where applicable with subtle bundle pricing in copy ("paired weights, one piece each side").
4. **Author series anchor** — "Ritual Ring Vacamuerta No. X" sells at $150 anchor. Lower-ticket pieces feel approachable next to it.
5. **Custom-order gravitational pull** — every PDP has a "Want a custom variant of this?" link. Even a small fraction converting to commissions is +10× revenue per inquiry.
6. **Free local delivery as upgrade** — when buyer is in service area, offer in-person delivery + a quiet showing of 1–2 other pieces ("would you like to see 2 other pieces in titanium during the drop-off?"). Pure relationship play. Documented in `local-appointments-delivery-system.md`.
7. **Ceremonial packaging** — every piece arrives wrapped + with a small printed Aftercare card + a serial number on author-series. Raises perceived value and review/UGC quality.

---

## 6. Capture non-buyers

Most visitors don't buy on first visit. They must leave with at least one of:

| Leave-behind | Conversion next time |
|---|---|
| Email on the list | next drop / Journal entry triggers return |
| Saved Journal entry / blog | bookmarked, returns weeks later |
| Aftercare PDF download | aftercare audience → returns when they need a piece |
| Instagram follow | feed exposure → IG ad retarget (later) |
| Custom-order inquiry | converts in 2–6 months |
| Appointment request (local) | converts in 1–2 weeks |

Every page has a "Join the circle" footer. Every Journal entry has an end-of-entry capture. Every PDP has a "Find your size" + "Read aftercare" link that gives value before sale.

---

## 7. Local Truckee/Tahoe conversion

The brand is geographically anchored. Use it.

| Tactic | Why it works | Status |
|---|---|---|
| Footer line "Free local delivery — Truckee / North Lake Tahoe" on every page | Plants the local model in every visitor's mind | Codex follow-up |
| `/stockists` page sharpened with appointment + delivery model | Local customers go straight here | Pending (copy in `local-appointments-delivery-system.md`) |
| Schema.org `LocalBusiness` markup with service area (no street address) | Google Maps / Local Pack visibility for "Truckee jewelry," "Tahoe body jewelry" | NEW — implement in /contact JSON-LD |
| Instagram local geotag on every piece + workshop story | IG local discovery | Owner action |
| Local press / partner studios (Reno piercers, Tahoe wellness) | Word-of-mouth in the niche | Long-term |
| Quarterly local pop-ups (1-day private viewings at a guest space — yoga studio, gallery, friend's house, NOT presented as walk-in) | Premium intimacy, scarcity, social-share-worthy | Owner-led |

The local funnel is the most undervalued lever. A local customer with a piece is a referral engine.

---

## 8. Custom-order conversion

Custom orders have:
- Highest ticket per inquiry (target $400–$2,500+)
- Longest cycle (6 months from inquiry)
- Highest founder-time cost
- Highest brand-equity dividend (each commission is a story)

Conversion path:

```
Visitor on /custom-orders or /collection or PDP
  → CTA "Request a commission" / "Want a custom variant of this?"
  → CustomOrderForm with qualification fields
  → Auto-reply within seconds (sets expectation)
  → Founder reply within 5 business days (yes/no/question)
  → Concept call (free)
  → Sketch + quote
  → 50% deposit confirms slot
  → Forging
  → Delivery
```

Quality gates:
- **Auto-reply** keeps inquirer warm without founder time.
- **Qualification questions** filter unserious leads (budget, timing, type).
- **Worked-example portfolio** (3 anonymized commissions) on /custom-orders.
- **Process transparency** (already in copy) reduces "what do you charge?" anxiety.

Full spec in `custom-orders-system-wenu-mapu.md`.

---

## 9. 30-day revenue plan (concrete)

Week 1 — Trust + footer/contact cleanup
- Owner: WP admin (footer + test products + Spanish strings + Yoast)
- Codex: Task 1 (Astro footer + contact)
- Owner: confirm marimari@ + alias creation (orders@, custom@)

Week 2 — Discovery + SEO
- Codex: Task 2 (6 material landings + hub)
- Codex: PDP spec block + cross-sell rail (Phase 2 follow-up)
- Owner: MailerLite signup + DNS DKIM/SPF

Week 3 — Capture + commission funnel
- Codex: Task 3 (subscription forms — JoinTheCircle, AppointmentRequest, CustomOrder, AftercareSignup)
- Codex: Custom Orders system implementation
- Codex: /jewelry-styling page

Week 4 — Editorial moat + first drop
- Codex: Task 7 (Journal template + 6 founding entries)
- Owner + brand: name first drop (We Tripantu / Wiñoy Xipantu — June 21–24); curate 3–5 pieces
- Owner: announce drop to The Wenu Mapu List; track conversion rate

After 30 days: review revenue + list growth + commission inquiries; decide on Pages cutover + native cart architecture.

---

## 10. Out of scope tonight

- Native Astro cart (architecture decision; deferred behind Pages cutover)
- WC catalog reconciliation (P4 in TASK_QUEUE.md, owned by `wenu-producto`)
- Real photographer engagement (separate brand session)
- Stripe / Shopify Lite integration (deferred)
- Wholesale program (deferred)
- Affiliate / referral program (deferred)
