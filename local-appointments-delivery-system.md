# Wenu Mapu — Local Appointments + Free Delivery System

Date: 2026-05-10 (CEO night)
Scope: end-to-end design for the Truckee / North Lake Tahoe local funnel — page structure, request flow, premium-discreet copy, calendar/booking options, WhatsApp + email handling, operational checklist for the founder.

Companion: `wenu-english-copy-pack-v1.md` §9, `revenue-funnel-map-wenu-mapu.md` §7, `million-dollar-positioning-wenu-mapu.md` §10.

---

## 1. The model (canonical, binding)

- **Service area:** Truckee, Kings Beach, Tahoe Vista, and nearby North Lake Tahoe / Truckee airport area.
- **Two service modes:**
  - **Private appointment** — customer requests a viewing; selected pieces from inventory are brought to a private space at a confirmed time. Typical visit 30–60 minutes. Unhurried.
  - **Free local delivery** — customer orders online or via inquiry; their order is hand-delivered within 24–72 hours of payment. Free of charge in the service area.
- **Privacy:** appointment locations are confirmed only after booking, by direct message. Locations are NEVER published.
- **Payment:** delivery and appointment are free; pieces are paid for separately, online or in person via invoice link.

**FORBIDDEN wording (do not appear anywhere on the site):**
- "Showroom at home" / "Vitrine" / "Walk-ins" / "Studio location"
- Any prior partner-studio name
- A street address

**REQUIRED wording (use exactly):**
- "Private appointments available in the Truckee / North Lake Tahoe area."
- "Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas."
- "Selected pieces may be viewed by appointment."

---

## 2. Page surface (`/stockists` — rename surface label only, keep URL for SEO)

The route URL stays `/stockists` (existing in Astro; preserves SEO). The surface label in nav / footer / page titles becomes "Visit / Appointments."

### Recommended structure

```
HERO
  eyebrow:  VISIT · APPOINTMENTS + LOCAL DELIVERY
  H1:       Visit Wenu Mapu — appointments + free local delivery.
  sub:      Private appointments available in the Truckee / North Lake Tahoe area.
            Free local delivery in Truckee, Kings Beach, Tahoe Vista and nearby areas.
  CTA pair: Request an appointment · Coordinate a local delivery

PATTERN BAND

HOW AN APPOINTMENT WORKS (4 numbered steps)
  01 Write to us
     Email marimari@wenumapuonline.com or DM @wenu__mapu with the pieces
     you'd like to see and your dates.
  02 We respond within 48 hours
     With availability and any clarifying questions.
  03 We confirm the location
     Shared 24 hours before the agreed time. Locations are private.
  04 You see the pieces in person
     Typical visit runs 30–60 minutes. Unhurried.

LOCAL DELIVERY ZONES (callout)
  Free local delivery available in:
  Truckee, CA · Kings Beach, CA · Tahoe Vista, CA · nearby Truckee airport area
  Add a note at checkout, or write to us to coordinate.

WHAT TO EXPECT
  - We bring selected pieces from our private inventory based on your request.
  - You can try them on, ask material questions, and decide in person.
  - No pressure. No purchase commitment for the visit.
  - If you find a piece you love, we invoice on the spot or you order online.
  - For commissions, this is the natural moment to start a concept conversation.

PATTERN BAND

REQUEST AN APPOINTMENT (form)
  AppointmentRequestForm.astro (Codex Task 3)
  Fallback: mailto:marimari@wenumapuonline.com?subject=Appointment%20request

PATTERN BAND

CURRENT STOCKISTS / PARTNER PRESENCE
  We are not currently in any partner studio.
  Selected pieces may be viewed only by private appointment in the
  Truckee / North Lake Tahoe area.

  Future stockists will be announced through The Wenu Mapu List.
  → Join the circle

FOOTER CTA
  Outside the local zone? See our shipping policy →
```

### What NOT to put on this page

- A map embed.
- A street address.
- A "book now" calendar widget that publishes a location.
- A photo of the workshop interior (until it's a brand-controlled space the founder is comfortable surfacing).
- Any reference to a former partner studio.

---

## 3. Request flow (3 paths)

### Path A — Form on `/stockists`

Astro form (Codex Task 3) with these fields:

| Field | Type | Required | Notes |
|---|---|---|---|
| Name | text | required | first name minimum |
| Email | email | required | validated |
| Phone (optional) | tel | optional | only used for appointment confirmation |
| Mode | radio | required | "Private appointment" · "Local delivery" · "Both" |
| City / area | select | required | Truckee · Kings Beach · Tahoe Vista · Other (please describe) |
| Pieces you'd like to see / order (textarea) | textarea | required | Free text; product names, gauges, materials, "anything in titanium" |
| Preferred dates (textarea) | textarea | required | "Saturday afternoons," "this Friday after 5pm," "next week" |
| Notes (textarea) | textarea | optional | "first-time stretching," "gift," "celebrating a milestone" |
| Consent: appointment location is confirmed privately after booking | checkbox | required | not pre-checked |

Submission behavior:
- If `MAILERLITE_API_KEY` set → POST to `/api/appointment-request` → tag subscriber `source:appointment-request` + `interest:appointment` or `interest:local-delivery` → forward to marimari@.
- Else → fallback panel with copyable summary + mailto link.

### Path B — Direct mailto

Always available as a footer link / fallback. Subject pre-filled: "Appointment request" or "Local delivery request."

### Path C — Instagram DM

`@wenu__mapu` is a valid path. Treat it as equally official. Founder responds in DM within 48 hours.

All three paths converge to the same human (founder) and the same Noco/Notion table for tracking (§7).

---

## 4. Calendar / booking options (recommendation)

For 6–10 commissions/year and likely 4–8 appointments/month, **a full booking system is overkill**. Recommendation:

### Phase 1 (now) — manual scheduling via email/DM

- Form → email → founder offers 2–3 windows → customer picks one → confirmed.
- Single shared founder calendar (Apple Calendar / Google Calendar — owner choice).
- No public calendar widget on the site.

### Phase 2 (when volume demands it; >10 appointments/month) — Cal.com or Calendly

- **Cal.com** (recommended): open-source, self-hostable, premium aesthetic, hides location until confirmation. Free tier sufficient.
- **Calendly**: faster setup, more recognizable, Zoom integration if needed.
- Embed under the "Request an appointment" CTA only after the volume justifies it.
- Customer picks a slot; the system confirms; the location is sent in a follow-up by the founder (NOT by the booking system) to preserve privacy.

### What NOT to use

- **Boulevard / Square / Vagaro** — designed for studios with a public address. Wrong fit.
- **Any system that auto-publishes the appointment location.**

---

## 5. WhatsApp flow

Currently no WhatsApp Business number is confirmed (see `wenu-contact-and-operations-plan.md` §3 — WhatsApp block was removed from /contact). If/when one is added:

- Use exclusively for: appointment confirmation, local delivery coordination.
- Do NOT use for: sales discovery, product browsing, payment.
- Add to footer + /contact + /stockists ONLY after a dedicated business number exists.
- Status TBD — not in scope tonight.

---

## 6. Email templates (founder-side, internal)

### A — Appointment offered

```
Subject: Wenu Mapu — appointment proposed

[Name],

Thank you for the appointment request. Three windows that work on my side this week:

— [day] [time window]
— [day] [time window]
— [day] [time window]

Each window is 30–60 minutes. I'll bring the pieces you mentioned plus 2–3 others in the same material family in case you'd like to see them in person.

Please pick a window or send me 2–3 of yours that work better. I'll confirm the location 24 hours before the appointment by direct message.

— Wenu Mapu
marimari@wenumapuonline.com · +1 (408) 500-6211
```

### B — Appointment confirmed (24h before)

```
Subject: Wenu Mapu — tomorrow's appointment

[Name],

Confirming our appointment:
Date:  [day] [time]
Place: [address — sent privately, do not forward]

If anything changes, please write or call before [time + 4h]. Looking forward.

— Wenu Mapu
+1 (408) 500-6211
```

### C — Local delivery scheduled

```
Subject: Wenu Mapu — your local delivery

[Name],

Your order [order #] is ready for local delivery.

Proposed delivery window:
— [day] [time window]

If that works, reply yes and we'll confirm the address. If not, send me a window that does. Free local delivery covers Truckee, Kings Beach, Tahoe Vista and nearby Truckee airport area.

If you'd like, I can bring 1–2 additional pieces from our inventory in the same material family for you to see in person — no obligation.

— Wenu Mapu
+1 (408) 500-6211
```

### D — Out-of-zone polite redirect

```
Subject: Wenu Mapu — local delivery not in your area

[Name],

Thank you for writing. Free local delivery currently covers Truckee, Kings Beach, Tahoe Vista and nearby Truckee airport area. The address you mentioned is outside that zone.

Two options:
— USPS Priority shipping (2–3 business days, free over $150)
— DHL Express international (3–7 business days, calculated at checkout)

Or, if you happen to travel through the North Lake Tahoe area, we can schedule a private appointment.

— Wenu Mapu
marimari@wenumapuonline.com
```

---

## 7. Operational checklist (founder-side)

### Per inquiry
- [ ] Inquiry logged in Noco/Notion appointments table within 24h
- [ ] Reply within 48 hours
- [ ] Window proposed → confirmed → location sent 24h prior
- [ ] Pieces selected from Noco inventory; bag/box prepared with wrapped pieces
- [ ] Optional: 1–2 additional pieces in same material family
- [ ] Visit happens; outcome logged (sold / no sale / commission opened)
- [ ] Follow-up email within 24h post-visit (thank you + any outstanding question)

### Per local delivery
- [ ] Order confirmed paid
- [ ] Window proposed → confirmed
- [ ] Piece prepared in ceremonial packaging + Aftercare card + Certificate of Authenticity (for author/commission tier)
- [ ] Hand-delivered
- [ ] Delivered status logged in Noco
- [ ] Follow-up email day +3 (aftercare + The Wenu Mapu List signup if not already)

### Per visit (safety / privacy)
- [ ] Location is private (not "home display")
- [ ] Founder is not alone with a stranger in an isolated location — bring a partner / friend / use a public-adjacent space (a quiet corner of a Truckee café, a friend's gallery, a private back room booked for the hour)
- [ ] Phone is on; share live location with a trusted contact during the visit
- [ ] Pieces brought are tracked (manifest of what came in, what came out)
- [ ] No payment expected during the visit unless customer requests it

---

## 8. Noco / Notion tracking (operational backbone)

| Field | Type | Purpose |
|---|---|---|
| Inquiry ID | auto / formula | sequential, e.g., WM-AP-2026-001 |
| Submitted | date | from form timestamp |
| Mode | select | Private appointment · Local delivery · Both |
| Status | select | New · Replied · Window proposed · Confirmed · Visit/delivery happened · Follow-up sent · Closed |
| Name | text | from form |
| Email | email | from form |
| Phone | tel | optional, from form |
| City / area | select | from form |
| Pieces requested | text | from form |
| Preferred dates | text | from form |
| Notes | text | from form |
| Confirmed date / time | datetime | log |
| Confirmed location | text | private; never published |
| Pieces brought | text | from inventory |
| Outcome | select | Sold · No sale · Commission opened · Curated for follow-up |
| Revenue (if sale) | number | log |
| Follow-up sent | date | log |
| Lessons / notes | text | retrospective |

---

## 9. Schema.org `LocalBusiness` JSON-LD (NEW — to add to /contact and /stockists)

Add to `Base.astro` jsonLd prop on `/contact` and `/stockists`:

```json
{
  "@context": "https://schema.org",
  "@type": "Jeweler",
  "name": "Wenu Mapu",
  "url": "https://wenumapuonline.com",
  "email": "marimari@wenumapuonline.com",
  "telephone": "+1-408-500-6211",
  "image": "https://wenumapuonline.com/img/hero/hero-portrait-1200w.webp",
  "description": "Hand-forged ritual body jewelry from Truckee, California. Implant-grade titanium, sterling silver, 14k gold, Atacama meteorite. Private appointments and free local delivery in the Truckee / North Lake Tahoe area.",
  "areaServed": [
    { "@type": "City", "name": "Truckee", "addressRegion": "CA", "addressCountry": "US" },
    { "@type": "City", "name": "Kings Beach", "addressRegion": "CA", "addressCountry": "US" },
    { "@type": "City", "name": "Tahoe Vista", "addressRegion": "CA", "addressCountry": "US" }
  ],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Truckee",
    "addressRegion": "CA",
    "addressCountry": "US"
  },
  "sameAs": [
    "https://instagram.com/wenu__mapu",
    "https://tiktok.com/@wenumapu",
    "https://pinterest.com/wenumapu"
  ]
}
```

Note: `address` lists the city only (Truckee). No street, no postal code. Google Local Pack will still index the brand for "Truckee jewelry," "Tahoe body jewelry," etc.

---

## 10. CTAs to use across the site

| Surface | CTA | Goes to |
|---|---|---|
| Home hero | "Book a private appointment" (secondary) | /stockists |
| Footer | "Free local delivery in Truckee / Tahoe area" line | /stockists |
| /shop | "Local? Free delivery →" small inline | /stockists |
| /shipping | "Local delivery (free)" callout block | /stockists |
| Cart (later) | "I'm in Truckee/Tahoe — coordinate free local delivery" checkbox | /stockists OR mailto |

---

## 11. Out of scope tonight

- Calendly / Cal.com integration (Phase 2)
- WhatsApp Business setup (TBD)
- Driver / delivery logistics beyond the founder hand-delivering
- Insurance for in-transit pieces during local delivery (founder-handled; revisit if volume justifies)
- Public pop-up events (founder-led; not on the site until scheduled)
