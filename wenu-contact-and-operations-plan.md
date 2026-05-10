# Wenu Mapu — Contact & Operations Plan

Date: 2026-05-09→10 (overnight)
Scope: corrected public contact block, footer/Contact-page copy, email alias plan, operations folder structure, and the documents the brand should produce next.

This document supersedes any earlier contact info in legacy brand docs (BRAND-DNA-2026-05-03.md §7, voz-de-marca-real-2026-05-03.md, and any cached copy referencing `contact@wenumapuonline.com`).

---

## 1. Canonical contact block (public)

This is the ONLY block to use across the live WP site, the Astro redesign, social bios, packaging, business cards, invoices, and email signatures.

```
Email      marimari@wenumapuonline.com
Phone      +1 (408) 500-6211
Instagram  @wenu__mapu
Site       wenumapuonline.com

Private appointments available in the Truckee / North Lake Tahoe area.
Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas.
Selected pieces may be viewed by appointment.
```

**Forbidden in any public copy:**
- Any street address (location is private; appointment locations confirmed individually)
- "Showroom at home" / "vitrine" / "walk-ins"
- "Studio location" / any prior partner-studio name (Truth Tattoo, Troll Studio, Lucky7, Thrue Tattoo)
- Phone numbers `+1 (458) 226-6027` or `+145 8226 6027` (both stale; do NOT use)
- Email `contact@wenumapuonline.com` as the primary (it may exist as a forwarder; do not surface it)
- The email addresses `wenu.mapu8@gmail.com`, `contacto@wenumapuonline.com` (legacy; do not surface)

---

## 2. Footer copy (Astro + legacy WP)

### Astro footer (component: `src/components/Footer.astro`)

Recommended changes (do NOT execute without per-edit approval — implementation is in Codex Task 1):

```
Brand line:        "Forged with newen · Truckee, California"   (current — keep)
Address column:    REMOVE street address. Replace with:
                   "Truckee, California"
                   "Private appointments + free local delivery"
                   "in the Truckee / North Lake Tahoe area."
Contact column:    Email     marimari@wenumapuonline.com
                   Phone     +1 (408) 500-6211
                   Instagram @wenu__mapu
Credit line:       "© 2026 Wenu Mapu SpA · Truckee, CA · wenumapuonline.com"
                   (Remove the "Web design by Northbound" placeholder)
Legal column:      Terms · Privacy · Accessibility (current — keep)
```

### Legacy WP footer (Bridge / Elementor)

Same content as Astro footer above. Owner action via WP admin:
1. Replace `89 Sherman Rd, Petrolia, CA 95558` with the appointment-only Truckee block.
2. Replace `+145 8226 6027` (Fono) with `+1 (408) 500-6211` (label "Phone").
3. Replace email reference with `marimari@wenumapuonline.com`.
4. Remove `Diseñado por Rizoma Digital`.

Risk: low — footer is a widget edit; no theme code change needed.

---

## 3. Contact page copy (`/contact` — Astro + legacy)

### H1

Write to us.

### Lead

We respond to all inquiries within 48 business hours.

### Channels (4 cards or 4 list items)

```
Email
marimari@wenumapuonline.com
For orders, custom commissions, materials questions, and appointment requests.

Phone
+1 (408) 500-6211
For appointment confirmation and local delivery coordination only.

Instagram
@wenu__mapu
For DMs, visual questions, and seeing the workshop in stories.

Online store
wenumapuonline.com
Browse the catalogue and place orders any time.
```

### Footer of contact page

> Private appointments available in the Truckee / North Lake Tahoe area.
> Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas.
> Selected pieces may be viewed by appointment.

### Forbidden on this page

- Street address.
- "WhatsApp coordination" — current copy mentions WhatsApp; only mention if a WhatsApp Business number exists. If not, remove.
- Any "showroom at home" / "vitrine" wording.

---

## 4. Appointment-only copy (used on /stockists, /jewelry-styling, /custom-orders)

### Short form (footer cap, hero subline)

> Private appointments available in the Truckee / North Lake Tahoe area.

### Medium form (page lead)

> Wenu Mapu operates by private appointment. Selected pieces may be viewed by appointment in the Truckee / North Lake Tahoe area. Local delivery is free in Truckee, Kings Beach, Tahoe Vista and nearby. Appointment locations are shared after confirmation.

### Long form (`/stockists` body)

> **How an appointment works**
>
> 1. Write to marimari@wenumapuonline.com or DM @wenu__mapu with the pieces you'd like to see and your dates.
> 2. We respond within 48 business hours with availability.
> 3. On the agreed day, you receive the location 24 hours before. Appointments are private and unhurried — typical visits run 30–60 minutes.
> 4. If you prefer, we can deliver directly to you for free in Truckee, Kings Beach, Tahoe Vista and nearby. Just confirm at checkout or write ahead.

### What NOT to write

- Do not promise specific in-stock items or exact pricing tiers in this copy — those live on PDPs.
- Do not promise same-day appointments.
- Do not name the appointment location publicly.

---

## 5. Free local delivery copy

### Short form (PDP shipping block, cart, checkout reminder)

> Free local delivery available in Truckee, Kings Beach, Tahoe Vista and nearby areas. Note in checkout or contact us to coordinate.

### Medium form (`/shipping` page, /local page)

> **Local delivery (free)**
>
> If you live in Truckee, Kings Beach, Tahoe Vista, or any area near North Lake Tahoe / Truckee airport, we deliver in person at no cost. Add a note at checkout, or write to marimari@wenumapuonline.com to coordinate. Typical local delivery is within 24–72 hours of payment.

### Outside the local zone

> Outside the local zone, we ship USPS Priority Mail (2–3 business days within the US) or DHL Express international (3–7 business days).

---

## 6. Email aliases — recommendation

### Final alias map (target state)

| Alias | Forwards to | Used by | Status |
|---|---|---|---|
| `marimari@wenumapuonline.com` | inbox (primary) | brand voice; all customer-facing pages until aliases below are live | **CREATE FIRST** ⭐ |
| `orders@wenumapuonline.com` | marimari@ initially | order confirmations from WC, shipping notices, customer order replies | **CREATE FIRST** ⭐ |
| `custom@wenumapuonline.com` | marimari@ | `/custom-orders` form recipient + commission inquiries | **CREATE FIRST** ⭐ |
| `aftercare@wenumapuonline.com` | marimari@ | aftercare guidance, replies to care questions | CREATE NEXT |
| `support@wenumapuonline.com` | marimari@ | general help / shipping / returns | CREATE NEXT |
| `journal@wenumapuonline.com` | marimari@ | newsletter sender ("From: Wenu Mapu Journal <journal@…>"), reply forwards back | CREATE WITH SUBSCRIPTION SYSTEM |
| `wholesale@wenumapuonline.com` | marimari@ | future trade inquiries | DEFERRED |
| `press@wenumapuonline.com` | marimari@ | media + collaboration | DEFERRED |
| `legal@wenumapuonline.com` | marimari@ | legal / GDPR / DMCA | DEFERRED |

### Minimum aliases to create FIRST (3)

If only 3 aliases are created tonight, create these:

1. **marimari@wenumapuonline.com** — main brand inbox (likely already exists; verify)
2. **orders@wenumapuonline.com** — for WC order emails + customer order replies (separates the noisiest channel from brand voice)
3. **custom@wenumapuonline.com** — recipient for the `/custom-orders` form when it goes live (keeps commission inbox calm)

All three forward to the same physical inbox initially. Once volume justifies it, split into separate inboxes.

### How to create

These are DNS-level email aliases / forwarders configured at the domain registrar OR mail provider. **Do not change DNS without explicit approval** — owner does this manually:

- If using **Cloudflare Email Routing** (recommended; free): Cloudflare dashboard → Email → Routing → Create address. Verify destination (Gmail / iCloud / wherever marimari@ lives).
- If using **Google Workspace**: Admin console → Users → marimari@ → Aliases.
- If using the **HostGator cPanel** (legacy WP host): cPanel → Email → Forwarders.

⚠️ Owner-only. Claude does not log into any of these.

### Email signature (all aliases)

```
Wenu Mapu
Adornment for the sacred body.

marimari@wenumapuonline.com  ·  +1 (408) 500-6211  ·  @wenu__mapu
wenumapuonline.com

Private appointments + free local delivery — Truckee / North Lake Tahoe area.
```

---

## 7. Operations folder structure (recommended)

A clear local file structure keeps brand documents discoverable. Recommended additions to the existing project layout:

```
~/wenu-frontend/                          (Astro repo — keep as is)

~/Obsidian/WenuAgent/                     (vault — keep as is)
├── brand/                                ← canonical voice + identity
├── operaciones/                          ← infra + ops
└── productos/                            ← catalog WM-*

~/wenu-business/                          ← 📌 NEW (recommended)
├── 01-contact-and-operations/
│   ├── canonical-contact-block.md       ← copy of §1 of this file
│   ├── footer-copy.md                   ← copy of §2
│   ├── contact-page-copy.md             ← copy of §3
│   └── email-aliases.md                 ← copy of §6
├── 02-customer-service/
│   ├── inquiry-templates/
│   │   ├── appointment-confirmation.md
│   │   ├── custom-order-acknowledgement.md
│   │   ├── jewelry-styling-followup.md
│   │   ├── shipping-update.md
│   │   └── aftercare-followup.md
│   └── escalation-flow.md
├── 03-policies/
│   ├── privacy-policy.md                ← currently published in Astro /privacy
│   ├── terms-of-service.md              ← currently published in Astro /terms
│   ├── accessibility-statement.md       ← currently published in Astro /accessibility
│   ├── shipping-and-returns.md          ← currently published in Astro /shipping
│   ├── aftercare-policy.md              ← canonical aftercare copy
│   └── cookie-policy.md                 ← needed if EU traffic non-trivial
├── 04-legal-and-finance/
│   ├── business-registration/           ← Wenu Mapu SpA / sole-prop docs
│   ├── tax-and-resale/                  ← CA seller's permit, sales tax setup
│   ├── insurance/                       ← liability insurance docs
│   └── trademark/                       ← USPTO filings if/when applicable
├── 05-suppliers-and-materials/
│   ├── titanium-supplier.md             ← cert info per ASTM F-136
│   ├── silver-supplier.md
│   ├── gold-supplier.md
│   ├── meteorite-source.md              ← Atacama provenance + chain of custody
│   ├── wood-source.md
│   └── packaging.md
├── 06-templates/
│   ├── invoice-template.html
│   ├── packing-slip.md
│   ├── thank-you-card.md
│   └── certificate-of-authenticity.md   ← for author-series and meteorite pieces
├── 07-photo-library/
│   ├── product/
│   ├── editorial/
│   ├── workshop/
│   └── manifest.md                      ← see wenu-visual-agent-plan.md
└── README.md                            ← index of all of the above
```

The Astro repo and Obsidian vault are unchanged. `~/wenu-business/` is a NEW peer folder for non-website business documents. **No data is duplicated** — Astro `/privacy` `/terms` etc. are still the canonical published version; the `03-policies/` folder is the editable source.

This folder is the user's choice to create. Claude does not create it without explicit approval.

---

## 8. Documents the business should produce next (priority order)

Beyond what already exists in BRAND-DNA, these are the operational documents that close the gap between "premium brand copy" and "premium brand operation":

| # | Document | Why | Owner |
|---|---|---|---|
| 1 | **Privacy policy** with explicit US-CCPA + GDPR clauses | Currently a placeholder; serious customers and legal review will check this first. | Founder + lawyer |
| 2 | **Aftercare policy / disclaimer** | Currently embedded in `/care-guide`. Pull a separate policy that names what Wenu Mapu IS and IS NOT promising medically. | Founder |
| 3 | **Custom-order contract template** | The 6-month process is documented in copy; a one-page legal template for the 50% deposit, scope freeze, IP ownership of the design. | Founder + lawyer |
| 4 | **Material provenance one-pagers** (titanium / silver / gold / meteorite / wood / brass) | Each links a supplier or source. Doubles as PDP trust evidence and Journal entry source. | Founder |
| 5 | **Certificate of Authenticity template** (for author-series pieces and meteorite pieces) | Matches the premium register; physical card shipped with piece. | Designer / Canva |
| 6 | **Inquiry-response templates** (appointment, custom order, styling, aftercare) | Reduces email response time; keeps voice consistent. | Founder |
| 7 | **Standard packaging spec** (box / pouch / card / sticker) | Premium body jewelry brands all unbox like a small ritual. | Founder + supplier |
| 8 | **Insurance documentation** (general liability + product liability) | Required before serious wholesale; protects against medical / allergy claims. | Founder + insurer |
| 9 | **Tax and seller's permit** (California) | If selling > nexus thresholds in CA, required by state. | Founder + accountant |
| 10 | **Founder/maker bio** (one paragraph + portrait) for `/about` | Premium PDPs cite the maker; the brand needs a public maker bio. | Founder + photographer |

---

## 9. Implementation triggers

What needs to happen, in what order, to ship this contact + operations correction:

1. **Tonight (this plan)** — write the spec. ✅
2. **Owner verifies** — confirm `marimari@wenumapuonline.com` exists and is monitored, confirm `+1 (408) 500-6211` is the canonical brand line (not personal), confirm @wenu__mapu is the active IG handle.
3. **Owner creates email aliases** at the registrar / mail provider (orders@, custom@). Cloudflare Email Routing recommended. Owner-only action.
4. **Codex Task 1** (see `codex-next-tasks.md`) implements the Astro footer + Contact page corrections. Per-commit approval.
5. **Owner edits legacy WP** footer + Contact-page-2 in admin per the canonical copy in §1–§3.
6. **Astro Phase 5 (subscription)** wires the form provider that uses the new aliases.

---

## 10. What is NOT changed by this plan

- DNS records (no MX, A, AAAA, CNAME changes)
- Cloudflare Tunnel routing
- WooCommerce products
- Aftercare files
- Astro homepage structure
- Mapudungun ritual phrases (Mari Mari, Pewmangen, etc.) — they stay as accents in eyebrows/seals
- Any code in `~/wenu-frontend/src/` until Codex Task 1 is approved
