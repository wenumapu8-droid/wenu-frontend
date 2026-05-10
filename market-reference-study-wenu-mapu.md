# Wenu Mapu — Market & Reference Study

Date: 2026-05-09 (updated overnight 2026-05-09→10 with corrected business facts)
Scope: strategic positioning, business model, funnel, CTA, category, content and trust patterns extracted from 16 reference brands. Used to inform — NOT to copy — the Wenu Mapu site direction. Research only; no code edits.

**Canonical business facts (overrides anything in legacy brand docs):**
- Wenu Mapu is **not currently located inside any tattoo or piercing studio.** Do not use the words "studio location," "showroom at home," "vitrine," "walk-ins," or any prior partner-studio name.
- Operating model: **private appointments + free local delivery** in the Truckee / North Lake Tahoe area (Truckee, Kings Beach, Tahoe Vista, and nearby). Local pickup is "by appointment only." Selected pieces may be viewed by appointment.
- Inventory is private and managed in **Noco**.
- Public contact: **marimari@wenumapuonline.com** · **+1 (408) 500-6211** · Instagram **@wenu__mapu**.
- The strategic direction in this report assumes the appointment + local-delivery model. References to "studio" pages elsewhere should map to **/appointments** or **/visit** in Wenu Mapu's case.

Sources: live web research via WebFetch on each brand. Where a brand's site was JS-rendered, bot-blocked, or had broken inner pages, that limitation is named in the per-brand notes. Anything not directly observed is labeled as inference. Findings about Wenu Mapu are grounded in the local Astro repo (`~/wenu-frontend/`), the legacy live site (`https://www.wenumapuonline.com`), and the canonical brand DNA (`~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md`, `voz-de-marca-real-2026-05-03.md`, `copy-frontend-2026-05-01.md`).

---

## 1. Executive summary

Wenu Mapu has the rarest asset in this niche: a real, defensible cosmological story (Mapuche, four cardinal forces, Atacama meteorite, Truckee/Sierra studio) that already lands in the brand's existing copy. What it does not yet have is the **commercial scaffolding** that lets premium body jewelry brands like Maria Tash, Buddha Jewelry, BVLA, Tawapa and Ask & Embla convert visitors into buyers without diluting their voice.

The pattern is consistent across the reference set:

1. **Premium body jewelry is sold through a 3-axis taxonomy** — by body placement, by material, by collection — and visitors enter through whichever axis matches their mental model. Wenu Mapu's current Shop is single-axis (a flat WC category list).
2. **Material is promoted to nav-level positioning** ("Solid Gold," "14k Solid Gold") to do the premium work without literally writing "premium." Wenu Mapu can do this with "Sterling Silver 950," "Vacamuerta Meteorite," "Atacama" — all canonical brand language already approved.
3. **Trust is professional, not aspirational** — APP membership, ASTM F-136 implant-grade titanium, threadless vocabulary, sterilization standards, named makers. Wenu Mapu has the materials right; it does not yet surface the language with the same discipline on every product page.
4. **Service is a peer of product** — Maria Tash, Wildlike, So Gold and BVLA all give "Book," "Get Pierced," "Find a Studio," "Pre-Shop" equal navigational weight to "Shop." Wenu Mapu's equivalent — Truckee showroom + custom orders + aftercare guidance — should sit in the nav, not be hidden.
5. **Editorial / educational content is the email moat**, not discount. Aesop's Library, Buddha's "The Edit," Iris's "Insights & Care," Kin's quiz. Wenu Mapu's Journal can carry the ritual/cosmology weight while the PDP stays material-disciplined.
6. **Drops + permanent catalog are compatible**, not exclusive. Rage Nation runs ship-date-stamped drops on top of a permanent shop. Wenu Mapu can run named ritual drops (We Tripantu, equinoxes) above a stable catalog.

**Recommended business decision:** the user's preferred hybrid (E) — Shop by Body Placement, Shop by Collection, Shop by Material, with Ritual/Story pages as brand depth — is correct and matches the reference set. Add a fourth optional axis: **Shop by Drop** (named limited releases). Keep Custom Orders, Truckee Showroom and Aftercare as service surfaces in the nav.

---

## 2. Reference matrix

| # | Brand | Category | URL | Verified | Role for Wenu Mapu |
|---|---|---|---|---|---|
| 1 | Rage Nation Apparel | Alternative apparel / drops / community | ragenationapparel.com | ✅ | Drop calendar + tiered loyalty cosmology |
| 2 | Maria Tash | Luxury body jewelry + studios | mariatash.com | ✅ | Triple-axis nav; trademarked techniques |
| 3 | Buddha Jewelry | Premium solid gold body jewelry | buddhajewelry.com | ✅ | "Shop by Piercing/Gemstone/Style" + The Edit |
| 4 | Maya Jewelry | Body jewelry, studio-only DTC | mayajewelry.com (winding down 12/31/25) | ✅ | APP-cert framing; find-a-studio funnel |
| 5 | Tawapa | Handcrafted body jewelry | tawapa.com | ✅ | "Solid Gold" as nav; cultural collection naming |
| 6 | Ask & Embla | Premium body jewelry e-commerce | askandembla.net | ✅ | "Shop by Collection" + "Shop by Material" parallel |
| 7 | Starfire Body Jewelry | Piercer-owned shop + studio | starfirebodyjewelry.com | ✅ | "Piercer Owned" trust; mood-based curation |
| 8 | BVLA | High-end gold body jewelry, dealer-led | bvla.com | ✅ | Find-a-piercer top nav; defer pricing to PDP |
| 9 | So Gold Studios | Boutique private piercing studio | sogoldstudios.com | ✅ | "Styling" as a 3rd funnel; book-first hero |
| 10 | Iris Piercing Studio | Multi-location boutique | irispiercing.com | ✅ | Locations-first nav; "Insights & Care" content |
| 11 | Wildlike | Luxury studio + multi-brand retail | wildlike.com | ✅ | Dual taxonomy + service-priced extras |
| 12 | Bury Me In Gold | Seattle BVLA flagship studio | burymeingold.com | ⚠️ partial (JS-rendered) | "Curations" + name-as-manifesto |
| 13 | Timeless Piercing | MD/PA boutique studio | timelesspiercing.com | ⚠️ partial | Named-piercer profile pages; APP literature |
| 14 | Aesop | Premium body care | aesop.com | ❌ bot-blocked; analyzed via Library + secondary sources | The Library content layer; refuse easy adjectives |
| 15 | Alo Yoga | Premium activewear | aloyoga.com | ✅ | Tiered ecosystem (newsletter / Access / Pro) |
| 16 | Kin Euphorics | Functional non-alc beverages | kineuphorics.com | ✅ | Quiz-as-funnel; product names hold mystique |

⚠️/❌ rows do not invent details — recommendations from those brands are sourced from what was actually fetchable plus secondary analysis (named in source notes per brand below).

---

## 3. Funnel analysis by brand cluster

### Cluster A — Premium body jewelry e-commerce (Buddha, Tawapa, Ask & Embla, Maria Tash, BVLA)

Convergent funnel:

```
Homepage hero (rotating editorial) →
  3-axis nav (Placement / Material / Collection) →
    PLP with anatomy/material/collection filters →
      PDP with material spec, gauge, threading vocabulary →
        ATC OR "Find a Piercer" deferral
Editorial / Edit hub side-funnel →
  PLP →
    PDP
Email signup → access to drops / new arrivals (no discount bait)
```

Notable variants:

- **BVLA** suppresses prices on PLP and pushes "Find a Piercing Studio" as a peer of "Collections." Funnel intentionally throttles DTC to preserve dealer relationships.
- **Maria Tash** runs a "Virtual Try-On Studio" as a side-funnel that converts browsers into bookers and into buyers.
- **Buddha Jewelry** runs a wholesale-account portal in parallel for piercer trade.

Wenu Mapu equivalent: keep DTC primary, add a "Find Wenu Mapu in Person" page (private appointments + local delivery + future stockists) as nav peer.

### Cluster B — Boutique studios (So Gold, Iris, Wildlike, BMI Gold, Timeless)

Convergent funnel:

```
Homepage hero →
  BOOK NOW (primary) ↔ SHOP (secondary, often disclaimed as "small selection")
Booking system (Boulevard / Square / Vagaro):
  pick service → pick piercer → pay deposit → confirm
"Pre-Shop" or "Shop Your Curation" → guides AOV before in-person visit
Insights / Aftercare → repeat-engagement loop
```

So Gold makes "Styling" a third top-level funnel. Wildlike adds "Pre-Shop For Your Piercing" so the customer arrives with jewelry already chosen. Iris leads nav with "Locations" because physical presence is the brand.

Wenu Mapu equivalent: it's NOT a piercing studio. It runs **private appointments + free local delivery** in the Truckee / North Lake Tahoe area. Treating "Book a private appointment" as a peer service — intimate, by request — borrows the boutique-studio gravity without claiming a studio Wenu Mapu doesn't operate.

### Cluster C — Lifestyle/ritual voice (Aesop, Alo, Kin) and community (Rage Nation)

These are voice and community references, not direct competitors.

- **Aesop**: editorial Library converts visitors into long-form readers, then into buyers. No discount bait. Refuses "natural / sustainable / organic" easy claims; names the molecule, names the ritual.
- **Alo**: tiered community — free newsletter, Alo Access membership, Alo Pro (industry verification), Alo Moves streaming, Studios directory. Lifestyle wrapper around a product-first nav.
- **Kin**: "Take the Quiz" as a hero CTA peer of "Shop." Product names carry the mystique ("Portal to Peace," "Heart-Opening Joy"); body copy stays grounded in named ingredients (Rhodiola Rosea, 5-HTP, GABA). Email capture trades on voice ("a dose of euphoria"), not 10%-off.
- **Rage Nation**: ship-date-stamped pre-orders, mineral-tier loyalty (Quartz → Amethyst → Sapphire → Emerald) with early-access perks. Tribe language done through glyphs and gem-tier naming, not festival cliché.

Wenu Mapu equivalent: a Journal that earns the email (Aesop pattern), a quiz-style "Find Your Ritual" entry (Kin pattern), a Mapuche-cosmology-tiered loyalty program later (Rage Nation pattern), and named ritual drops (Rage Nation × Tawapa pattern).

---

## 4. CTA analysis

### CTAs observed in the reference set

| CTA verb | Where it appears | Function |
|---|---|---|
| Shop New / Shop Now | Rage Nation, Buddha, Tawapa | Hero, fastest path to PLP |
| Explore the collection | Wenu Mapu, Maria Tash | Soft hero CTA, premium register |
| Shop by Piercing / Placement | Buddha, Maria Tash, Wildlike | Anatomy-first entry |
| Shop by Material / Gemstone | Buddha, Tawapa, Ask & Embla | Material-first entry |
| Shop by Collection | Ask & Embla, Maria Tash | Story-first entry |
| Find a Piercing Studio | BVLA, Maya | Authority + service deferral |
| Book Now / Schedule a Piercing | So Gold, Iris, Wildlike | Service-first studios |
| Pre-Shop For Your Piercing | Wildlike | AOV lift before in-person visit |
| Take the Quiz | Kin | Diagnostic alt-funnel |
| Visit the Showcase / Locations | Iris, So Gold | Physical presence as brand |
| Add to Cart | All | Final ATC |
| Subscribe / Join the List / Get Notified | Most | Email capture |
| View Details (no price on PLP) | BVLA | Premium pricing throttle |
| Find Your Size | (none directly observed; common pattern) | PDP supportive CTA |
| Read Care Guide | Iris ("Insights & Care") | Education funnel |
| Request a Custom Piece | Tawapa, BMI Gold | Commission funnel |

### Recommended CTA system for Wenu Mapu

Primary (hero / above-the-fold):

- **Shop the collection** — replaces "Explore the collection" only if A/B says so; current works.
- **Book a private appointment** — paired secondary CTA, consultative register.

Category nav CTAs (mega-menu, three columns):

- **Shop by Body Placement** (Septum, Hangers, Ear Weights, Lip / Labret, Earrings, Stretched, Amulets/Pendants, Rings)
- **Shop by Material** (Sterling Silver 950, 14k Gold, Implant-grade Titanium, Vacamuerta Meteorite, Walnut & Tropical Wood, Brass & Bronze, Stone)
- **Shop by Collection** (Ritual Ring Vacamuerta series, Mystic series, Author Jewelry, Limited Drops, Chaway/Mapuche-inspired)

PDP CTAs (in priority order):

- **Add to cart** — primary, dark solid button.
- **Find your size** — links to /sizing-guide.
- **Read aftercare** — links to /care-guide.
- **Request custom variant** — links to /custom-orders with prefilled subject (small, ghost-styled).
- **Book a private appointment to see in person** — small inline link.

Service / education CTAs (footer + page-end):

- **Read the Journal** — editorial entry (replaces generic "blog").
- **Join the circle** — newsletter capture (Wenu Mapu's voice equivalent of Kin's "give your email a dose of euphoria"; do NOT use "10% off").
- **Request a commission** — custom-orders entry.

Avoid:

- "Find a Piercer" — Wenu Mapu does NOT yet have a piercer network. Promise nothing you don't have.
- "Sale" / "Discount" / generic "Buy Now" — these break the premium register.
- "Sign up to save" — discount-bait email capture.

---

## 5. Site architecture comparison

| Brand | Top-level nav | Category logic |
|---|---|---|
| Maria Tash | Jewelry / Piercing / About Our Jewelry / Virtual Try-On | placement × style × gemstone hybrid |
| Buddha Jewelry | Shop By Piercing / Shop by Gemstone / Shop by Style / The Edit | 3-axis pure |
| Ask & Embla | Highlights / Best Sellers / Shop Jewelry / Shop Stretched / Shop By Collection / Shop By Material / Explore / Vault Sale | 3-axis + "Shop Stretched" sub-niche elevated |
| Tawapa | Solid Gold / Shop by Style / Merch / Sale / Wholesale | Material-led |
| BVLA | Collections / Gemstones / About / Future Stars / Contact / Favorites / Find a Piercing Studio / Careers / Wholesale | Anatomy + collection + locator equal |
| Wildlike | Shop / Get Pierced / Why Wildlike? / Host an Event / Rewards | Service + product + community |
| So Gold | Home / Piercing / Styling / Shop / About | Service-first, shop secondary |
| Iris | Locations / Shop / Insights & Care / About / Book | Locations-first |
| Rage Nation | Shop New / Shop Apparel / Shop Home & Art / Collections / Clearance / Gift Cards / Support | Drop-first + apparel |
| Aesop (typical) | Skin / Hair / Body / Home / Fragrance / Gifts / Read / Stores | Body zone × Library × stores |
| Wenu Mapu (current Astro) | Shop (dropdown) / Piercing / Hangers / Ritual Objects / About / Journal / Contact / Local | Service + 4 product-link entries |

### Recommended Wenu Mapu nav

Keep current top-level: **Shop / Piercing / Hangers / Ritual Objects / About / Journal / Contact / Local**.
Extend the Shop dropdown into a **3-column mega-menu**:

```
SHOP                    │
├─ Shop by Placement   │ Septum  Hangers  Ear Weights  Stretched  Lip / Labret  Earrings  Amulets  Rings
├─ Shop by Material    │ Sterling Silver 950  14k Gold  Implant-grade Titanium  Vacamuerta Meteorite  Walnut & Wood  Brass & Bronze  Stone
└─ Shop by Collection  │ Ritual Ring Vacamuerta  Mystic Series  Author Jewelry  Limited Drops  Chaway
```

Don't add a new "Materials" or "Artistry" top-level item — they live under About. Don't add a new "Styling" funnel — Wenu Mapu doesn't yet offer it.

### Recommended footer (additive to current)

Current footer is well-structured. Add a fifth column or fold into existing:

- **Visit / In Person**: private appointments + local delivery, Local Pickup, future stockists.
- **Service**: Custom Orders, Aftercare Guide, Sizing Guide.
- **Journal**: link to journal hub.
- **Newsletter**: "Join the circle" inline form (currently mailto fallback per Phase 1).

---

## 6. Category strategy comparison

Premium body jewelry brands ALL run a 3-axis taxonomy. Single-axis sites read as commodity. Wenu Mapu currently has:

- Standalone landings: `/piercing`, `/hangers`, `/amulets`, `/ear-weights`, `/ritual-objects` (placement-axis, partially built).
- Filtered shop entries: `/shop?cat=…`.
- No material-axis landings.
- No collection-axis landings beyond the brand's own author series.

Recommended additions (in order of leverage):

1. **Material landings**: `/material/sterling-silver`, `/material/vacamuerta`, `/material/walnut`, `/material/titanium`. Each is a curated PLP filtered on `categories[].slug.includes(<material-key>)`. Reuse the `/piercing` template (already proven). Each needs canonical material copy from `BRAND-DNA-2026-05-03.md` §4.
2. **Collection landings**: `/collection/ritual-ring-vacamuerta`, `/collection/mystic-series`, `/collection/author-jewelry`. Same template.
3. **Drop / limited landings** (later): `/drops/we-tripantu-2026`, etc. Time-bound, named after Mapuche calendar moments — Rage Nation pattern.

This avoids any WC product writes (off-limits per `DO_NOT_TOUCH.md`). Material categories are derived in the Astro layer, not in WooCommerce.

---

## 7. Product trust strategy

The premium reference set is consistent on what a PDP must surface:

| Trust element | Referenced brands | Wenu Mapu current state |
|---|---|---|
| Material spec by name | Buddha, BVLA, Maria Tash, Maya, Tawapa | Partial — copy in Materials page exists; PDP body inconsistent |
| Implant-grade / ASTM F-136 wording | Buddha, Maya, Maria Tash | Present in `/piercing` landing copy; not surfaced on PDP |
| Gauge in mm + g | Ask & Embla, Buddha, Maya | `/sizing-guide` covers it; PDP attributes from WC inconsistent |
| Threadless / internally-threaded | Buddha, Ask & Embla, Wildlike | Not yet a vocabulary on WM PDP |
| Hand-forged / made-in-X | Tawapa ("downtown LA"), Wenu Mapu copy | Strong on Wenu Mapu — "Truckee, California" |
| Returns + hygiene language | All | Present in `/shipping` |
| APP / certification | Maya, Wildlike, Iris, Timeless | Wenu Mapu: not applicable yet (no piercer cert), but **material/forging cert** can substitute |
| Lifetime / repair guarantee | BVLA | Wenu Mapu has commission warranty; not surfaced on every PDP |
| Per-maker bio | Iris, Timeless, So Gold | Wenu Mapu: founder/forger story belongs on About, not PDP — light maker credit on PDP would be enough |
| Customer reviews | Kin (1,321 reviews / 97% recommend) | Wenu Mapu: not yet collected — this is real debt for premium positioning |

Recommended Wenu Mapu PDP trust block (add as a small inline component below ATC):

- **Material**: <sterling silver 950 / 14k gold / implant-grade titanium / Vacamuerta meteorite / walnut / brass>, with one canonical phrase per material (from BRAND-DNA §4).
- **Made in**: Truckee, California — hand-forged, single-batch.
- **Sizing**: link to /sizing-guide with the right anchor (gauge / diameter / post).
- **Aftercare**: link to /care-guide.
- **Returns**: 1-line "hygiene exception" + link to /shipping.
- **Commission**: small ghost link "Want a custom variant of this? Start a commission →".

Reviews (deferred): adopt a lightweight reviews capture (Judge.me, Stamped, or a custom Astro endpoint) before serious paid traffic. Until then, surface 1-2 hand-curated quotes from email/Instagram on PDP — labeled honestly as customer notes.

---

## 8. Visual / UX strategy

Reference patterns convergent across the premium set:

- **Product photography**: clean negative space, single piece per frame at PDP hero, in-context body shots in editorial. Tawapa uses dramatic lighting; Maria Tash uses on-model close-ups; Buddha uses cool, technical macro. Aesop uses bottle-on-stone. **Wenu Mapu**: pivot to higher-contrast on-stone or on-bone-white surface; current product photography is inconsistent (some on-skin, some on-white, some on backgrounds that don't carry the brand).
- **Editorial vs product ratio**: 60/40 product to editorial on home; 80/20 on PLP; pure product on PDP. Wenu Mapu home is approximately right after Phase 1; further editorial weight should land in Journal, not on home.
- **Typography**: Wenu Mapu's DM Serif Display + Source Serif Pro + Inter Variable (per CLAUDE.md) is on-brand. None of the premium reference set uses sans-only; serif headlines convey heritage. Keep.
- **Color/dark space**: Buddha and BVLA both use light backgrounds with dark accents. Maria Tash uses light + warm. So Gold uses dark luxury. Wenu Mapu's Obsidian/Bone/Sand palette is correct for the dark ritual register; do not lighten the home.
- **Trust signals layout**: most PDPs surface material + gauge + made-in + returns in a small spec block under ATC. Wenu Mapu PDP currently leans on long-form description; add a compact spec block (see §7).
- **Mobile**: every reference brand has a mobile-first PDP with sticky ATC and sticky cart. Wenu Mapu mobile state needs explicit verification (out of scope for this report).

What to AVOID copying visually:

- Slider Revolution-style auto-rotating hero (legacy live site uses one). Static hero with manual nav is the premium move.
- Generic e-commerce "wishlist heart" iconography unless it's tied to a real account/wishlist feature (BVLA's "Favorites" works because they have an account system).
- Oversize discount banners. None of the reference set uses them. "VAULT SALE" (Ask & Embla) is the most aggressive luxury sale signal seen.

---

## 9. Content / education strategy

Reference patterns:

- **Aesop Library** — long-form essays on culture, scent, ritual. No product CTA inside the essay; the essay IS the product of the brand.
- **Buddha "The Edit"** — editorial mini-features with featured products at the end.
- **Iris "Insights & Care"** — bundles aftercare, jewelry guides, editorial under one nav item; SEO surface AND email magnet.
- **Kin's quiz** — diagnostic content as funnel.
- **Wildlike "Why Wildlike?"** — a single-page brand manifesto + service explainer.

Wenu Mapu's /journal currently exists but is empty ("First entries forthcoming"). The strategic move:

1. **Treat /journal as an editorial publication, not a blog.** First 6 entries should each map to a brand pillar:
   - "What is Vacamuerta meteorite?" — material story
   - "The four cardinal forces" — cosmology primer
   - "Why we forge in Truckee" — origin story
   - "How an Atacama meteorite becomes a ring" — process / artistry
   - "Reading a body for adornment" — styling/curation in Wenu Mapu's voice
   - "Aftercare: the first 90 days" — care primer (cross-link to /care-guide, do NOT duplicate)
2. **Each Journal entry has a tail** — 2 product cards at the end, no CTA hardsell, just curated selection from current catalog.
3. **Journal is the email moat** — newsletter signup is "Join the circle to receive each Journal entry." This is the Wenu Mapu version of Aesop's Library subscription.

Sizing, materials, aftercare and FAQ are utility content, not editorial. They live under their existing routes.

---

## 10. What Wenu Mapu should ADOPT structurally

(Patterns, not visuals.)

1. **3-axis Shop nav** (Placement / Material / Collection) — Buddha, Maria Tash, Tawapa, Ask & Embla all converge.
2. **Material-axis landings** with canonical material copy from brand DNA — Tawapa "Solid Gold" pattern.
3. **PDP trust block** under ATC (material spec, gauge, made-in, sizing/care/returns links) — Buddha + Maria Tash pattern.
4. **Compact Journal as email magnet** (6 founding entries, ritual+material+process pillars) — Aesop Library pattern.
5. **"Book a private appointment"** as a hero secondary CTA + nav-level page — Iris / So Gold pattern, adapted to Wenu Mapu's appointment-only model (no studio claims).
6. **Drop / limited landing template** for ritual-calendar releases — Rage Nation pattern, applied to We Tripantu / equinoxes / solstices.
7. **Curated edits** ("Selected pieces this week") — BMI Gold "Curations" pattern; can run on home + Journal entries.
8. **Newsletter capture by voice, not discount** — Kin pattern. Wenu Mapu line: "Join the circle." Not "10% off your first order."
9. **Lifetime / repair language** on commissions and select pieces — BVLA pattern.
10. **Optional later: tiered loyalty cosmology** (Pewen / Lafken / Wenu / Pillan tiers, with early drop access) — Rage Nation pattern adapted to Mapuche cosmology.

---

## 11. What Wenu Mapu should AVOID

1. **Festival / boho cliché copy** — drop product names like "Mapuche Root", "Tribal Bell", "Ancestral Stone Plug" (per `BRAND-DNA-2026-05-03.md` §15). Use specific maker series naming ("Ritual Ring Vacamuerta Nº3 — Sterling Silver & Atacama Meteorite").
2. **Discount-led email capture** — none of the premium set does this. Breaks the voice.
3. **Mass-market WooCommerce default theme** (Bridge / Slider Revolution / Elementor canvas) — already true on legacy site; the Astro redesign correctly avoids it.
4. **Mixed-language UI** — commit to English-first for the US store. Spanish strings on an English page (Cesta, Añadir, Leer más, Descartar, Diseñado por, Fono) read as broken.
5. **Auto-rotating hero / heavy carousels** — premium reference set uses static or manual-control heroes.
6. **Overpromising healing or spiritual effects** — Wenu Mapu's voice doc explicitly forbids "magical / enchanted / positive energy." Keep PDP body grounded in materials and process; let collection NAMES carry the mystique (Kin pattern).
7. **Find-a-Piercer language** without a piercer network — promise nothing the brand doesn't deliver.
8. **Hidden price in the WC cart redirect** — current Buy CTA goes to `/cart/?add-to-cart=ID` (Phase 1 fix). Acceptable interim but a native Astro cart is the medium-term play.
9. **Sale banners** — when discounting, use "VAULT" (Ask & Embla) or "Last pieces" (scarcity), not "10% off."
10. **Generic "Lorem", "Pronto", "producto prueba" placeholders** — currently visible on the legacy live site. Strict no-go on the Astro side.

---

## 12. Recommended Wenu Mapu site map

```
/                                Home
/shop                            Shop (3-axis filterable; primary entry)
  /piercing                      Placement landing  ✅ exists
  /hangers                       Placement landing  ✅ exists
  /ear-weights                   Placement landing  ✅ exists
  /amulets                       Placement landing  ✅ exists
  /ritual-objects                Placement landing  ✅ exists
  /ear-cuffs                     Placement landing  📌 NEW (low priority)
  /chaway                        Mapuche-inspired collection landing  📌 NEW (cultural-respect review needed)
/material/                       Material axis hub (lists 6 materials)
  /material/sterling-silver      Material landing  📌 NEW
  /material/14k-gold             Material landing  📌 NEW
  /material/titanium             Material landing  📌 NEW
  /material/vacamuerta           Material landing — meteorite signature  📌 NEW
  /material/walnut-wood          Material landing  📌 NEW
  /material/brass-bronze         Material landing  📌 NEW
/collection/                     Collection axis hub
  /collection/ritual-ring-vacamuerta   📌 NEW
  /collection/mystic-series            📌 NEW
  /collection/author-jewelry            📌 NEW
/drops/                          Drop / limited landing hub  📌 NEW (deferred)
  /drops/we-tripantu-2026        📌 NEW (event-driven, not yet)
/p/[slug]                        Product detail page  ✅ exists
/custom-orders                   Commissions  ✅ exists (mailto fallback)
/materials                       Brand-wide materials primer  ✅ exists
/artistry                        Process / artistry  ✅ exists
/about                           About story  ✅ exists
/journal                         Editorial publication  ✅ exists (empty — fill it)
  /journal/<slug>                Per-entry pages  📌 NEW
/care-guide                      Aftercare  ✅ exists (off-limits per DO_NOT_TOUCH)
/sizing-guide                    Sizing reference  ✅ exists, recently extended
/shipping                        Shipping & returns canonical  ✅ exists
/shipping-returns                Alias  ✅ exists
/faq                             FAQ  ✅ exists
/contact                         Contact  ✅ exists
/local                           Local pickup  ✅ exists
/stockists                       Appointments + free local delivery hub  ✅ exists (rename surface to "Visit / Appointments"; URL stays for SEO)
/cart                            (deferred — currently redirects to WC)
/checkout                        (deferred — currently WC)
/privacy /terms /accessibility   ✅ exist
/404                             ✅ exists
```

Net additions vs current Astro:
- 6 material landings + 1 material hub
- 3 collection landings + 1 collection hub (start with the strongest one — Ritual Ring Vacamuerta — and grow)
- Journal entry pages (start with 6)
- Optional: ear-cuffs, chaway (cultural sensitivity check first), drops hub (deferred)

Total new routes if all done: ~15. Realistic Phase 2: 6 material landings + 6 Journal entries = 12 new routes that immediately raise SEO surface without restructuring anything.

---

## 13. Recommended Wenu Mapu funnel

```
ENTRY POINTS
├─ Organic search (material, technique, brand) → Material landing OR PDP
├─ Instagram link-in-bio → Home OR Drop landing OR PDP
├─ Direct → Home
└─ Journal entry shared / found → Journal → tail product cards

HOME (3 calls):
  Shop the collection                    →  /shop
  Book a private appointment             →  /stockists
  Read the Journal                       →  /journal
  Inline links to /materials /artistry /care-guide /stockists  (Phase 1 done ✅)

CATEGORY (PLP):
  Filter by placement, material, collection
  Hero copy that re-anchors the axis
  6-12 cards above the fold
  Cross-link to relevant Journal entry at end

PDP:
  Hero gallery (3+ on-brand images)
  Title + price (no fake "was/now" unless real)
  Spec block (material / gauge / made-in / weight when relevant)
  Long description (existing pattern: 900-1400 chars per BRAND-DNA §10)
  Trust block (sizing / aftercare / returns / commission)
  ATC + secondary "Find your size"
  Cross-sell rail: 3 pieces from same material or collection
  Journal cross-link if relevant

CART / CHECKOUT (interim):
  Add-to-cart routes to WC /cart/?add-to-cart=ID  (Phase 1 ✅)
  Future: native Astro cart + Stripe / Shopify Lite checkout (deferred)

EMAIL CAPTURE (every page footer):
  "Join the circle" — voice-led, no discount
  Trades on early access to drops + new Journal entries

SECONDARY CONVERSION SURFACES:
  Custom Orders → mailto fallback (current) → real form provider (deferred)
  Appointment / local-delivery request → mailto OR form (Phase 5 wires real provider)
```

---

## 14. Recommended page-by-page improvements

(Inventory mode. No edits in this document; concrete edits go through a separate plan + per-edit approval.)

| Page | What works | What to improve |
|---|---|---|
| `/` Home | Hero, 3 CTAs, Sacred Territory, Featured rail, Truckee teaser, Commissions teaser, USPs | Add nav-level mega-menu; consider adding a "Drops" teaser card (later); ensure image LCP ≥ 90 |
| `/shop` | Loads catalogue, filter via `?cat=` | Add 3-axis filter UI (placement / material / collection); add "Sort by" |
| `/p/[slug]` | Existing description, gallery, ATC | Add compact spec block under ATC; add cross-sell rail (same material or same maker series) |
| `/piercing` | Landing live | Add cross-link to `/material/titanium`; ensure ASTM F-136 phrase in body |
| `/hangers` | Landing live | Add cross-link to `/material/sterling-silver`; sizing guide cross-link already there |
| `/amulets` | Landing live | Add cross-link to `/material/vacamuerta` (heart of the collection) |
| `/ear-weights` | Landing live | Add cross-link to `/material/sterling-silver` and `/sizing-guide` |
| `/ritual-objects` | Landing live | Add cross-link to `/artistry` (process story is the trust) |
| `/material/*` | DOES NOT EXIST | Build 6 material landings using `/piercing` template |
| `/collection/*` | DOES NOT EXIST | Build collection landings starting with Ritual Ring Vacamuerta |
| `/custom-orders` | Full process content | Replace mailto with real form provider (P5 in TASK_QUEUE.md); add 3 example commission images when available |
| `/materials` | Substantive primer | Cross-link each material to its `/material/<key>` landing; add canonical phrasing per BRAND-DNA §4 |
| `/artistry` | Substantive | Add 1-2 process photos (not yet ready — visual asset gap) |
| `/about` | Hub with anchors to materials/artistry/stockists | Add founder photo when available; cross-link to Journal "Why we forge in Truckee" entry once published |
| `/stockists` | Appointments + free local delivery hub | Rename surface (not URL) to "Visit / Appointments"; do NOT add a map embed — appointment location is private, only confirmed after booking |
| `/sizing-guide` | Tables + CTA block (Phase 2 ✅) | Add per-zone diagram (visual asset gap — placeholder SVG OK) |
| `/care-guide` | OFF-LIMITS — do not modify | (no change) |
| `/faq` | Items + closing CTA (Phase 2 ✅) | Add 5 more questions sourced from real customer email patterns |
| `/contact` | Channels + CTAs | Set canonical contact: **marimari@wenumapuonline.com** + **+1 (408) 500-6211** + **@wenu__mapu**. The `+1 (458)` number in BRAND-DNA §7 is stale; do not use. |
| `/journal` | Empty | Publish 6 founding entries (see §9) |
| `/local` | Pickup steps | Cross-link to `/stockists` |
| `/shipping` | Canonical policy | No change |
| `/shipping-returns` | Alias | No change |
| Footer | Well-structured | Replace "Web design by Northbound" placeholder credit; consider folding "Visit / In Person" column |
| Newsletter | Mailto fallback (Phase 1 ✅) | Wire Brevo / Klaviyo / Cloudflare Worker — P5 decision |

---

## 15. English copy strategy

The Astro redesign is already English-first (per `~/wenu-frontend/CLAUDE.md` and `i18n/en.json`). The legacy WP site is mixed-language. Strategic principles:

1. **Astro = English canonical.** All new copy lands in `src/i18n/en.json`. Spanish stays in `mapudungun.json` for ritual phrases only.
2. **Voice contract** (per `voz-de-marca-real-2026-05-03.md`):
   - Allowed: ritual, ancestral, sacred, portal, cosmos, fragment, body, signal, cycle, origin, threshold, mysticism, intentional, sacred territory, Born from the Earth, guided by the Cosmos, handcrafted, one of a kind, ceremonial, bridge between worlds, Mapuche, tribal, cosmic, contemporary, memory, Earth, Atacama, 4.5 billion years, Land of the Sky.
   - Forbidden: beautiful, magical, enchanted, perfect, positive energy, Mapuche Root, Earthly, Earthborn, generic AI-isms.
3. **Names carry mystique. Body copy carries evidence.** (Kin pattern.) Collection names can be cosmological ("Ritual Ring Vacamuerta," "Pillan Series"). PDP body copy stays grounded in material spec, dimensions, sensory facts.
4. **Length discipline** (per `BRAND-DNA-2026-05-03.md` §10): PDP descriptions 900-1,400 characters. Landing intros: 1 paragraph. Journal entries: 600-1,200 words.
5. **Material lockup** — each material has ONE canonical phrase that appears wherever the material is named. From BRAND-DNA §4:
   - Sterling Silver 950: "Pure, durable, and alive with light."
   - Vacamuerta Meteorite: "Cosmic fragments that fell in Chile's Atacama Desert. Each piece carries 4.5 billion years of history."
   - Walnut & Tropical Wood: "Sustainably sourced, warm, and grounded."
   - Brass & Bronze: "Bold ancestral metals with deep tribal roots."
   - Titanium: "Hypoallergenic, durable, lightweight." (lighter touch — no ancestral claim)
   - Surgical Steel: "Durable, body-safe, daily wear."
6. **Spanish quotes are OK as accents** in eyebrows / ritual marks (Mari Mari, Pewmangen, Newen, Wenumapu) but page body stays English.

---

## 16. Required missing pages

Strict priority list. New routes only (existing pages are improved, not replaced).

| Priority | Route | Purpose | Template |
|---|---|---|---|
| P1 | `/material/sterling-silver` | Material landing | Use `/piercing.astro` pattern |
| P1 | `/material/14k-gold` | Material landing | same |
| P1 | `/material/titanium` | Material landing | same |
| P1 | `/material/vacamuerta` | Signature material — Atacama meteorite | same |
| P1 | `/material/walnut-wood` | Material landing | same |
| P1 | `/material/brass-bronze` | Material landing | same |
| P2 | `/collection/ritual-ring-vacamuerta` | Strongest collection landing | same template adapted |
| P2 | `/journal/what-is-vacamuerta` | Founding journal entry | new template |
| P2 | `/journal/four-cardinal-forces` | Founding journal entry | same |
| P2 | `/journal/why-truckee` | Origin story | same |
| P2 | `/journal/forging-the-meteorite` | Process story | same |
| P2 | `/journal/aftercare-first-90-days` | Care primer (cross-link, do NOT duplicate /care-guide) | same |
| P2 | `/journal/reading-the-body` | Styling/curation in WM voice | same |
| P3 | `/material/` (hub) | Material axis index | new lightweight |
| P3 | `/collection/` (hub) | Collection axis index | new lightweight |
| P4 | `/ear-cuffs` | Placement landing | `/piercing.astro` pattern (low volume) |
| P5 | `/chaway` | Mapuche-inspired collection — needs cultural review BEFORE building | careful copy review with founder |
| Deferred | `/drops/we-tripantu-2026` | Event drop landing | event-bound, not yet |
| Deferred | `/cart` `/checkout` | Native Astro cart | architecture decision pending |

Total P1-P3 new pages: 14. Each is template-driven, additive, no breaking change.

---

## 17. Required visual assets

Real photo, not invented. Listed in priority order.

| Asset | Used by | Status |
|---|---|---|
| Per-material macro shots (silver, gold, titanium, walnut, meteorite, brass) | `/material/*` PDPs hero | NEEDED |
| Vacamuerta meteorite raw + finished side-by-side | `/material/vacamuerta`, `/journal/what-is-vacamuerta` | NEEDED |
| Truckee studio interior (1 wide, 1 detail) | `/about`, `/stockists`, `/journal/why-truckee` | NEEDED |
| Founder/maker portrait (low-key, on-brand) | `/about`, optional `/contact` | NEEDED |
| Process photos (filing / hammering / polishing) | `/artistry`, `/journal/forging-the-meteorite` | NEEDED |
| Per-zone sizing diagram (helix, septum, lobe) — can be SVG, not photo | `/sizing-guide` | NEEDED (placeholder OK) |
| 1 ritual-cycle hero per Mapuche calendar moment | `/drops/<event>` | NEEDED only when drops launch |
| Improved cardinal SVGs (replace placeholders) | Home Sacred Territory, `/about` | NEEDED (Phase 1 blocker #2) |
| Real Mapuche-textile pattern band SVG | Footer, dividers | NEEDED (Phase 1 blocker #2) |

Brand sessions / commercial photo shoots are the right way to source most of these. Until then, current placeholders + cardinal-cross fallbacks are acceptable.

---

## 18. 30-day implementation roadmap

Each batch = 1 commit, per-commit approval per `agent-control/AGENT_CONTROL_CENTER.md`. No push, no deploy, no nav structural change without explicit go.

### Days 1-3 — Trust + conversion blockers (legacy WP)

Owner: human via WP admin. Claude prepares the change list; user executes.
- Footer widget: replace Petrolia address → Truckee; replace mangled `+145…` phone → `(408) 500-6211`; remove "Diseñado por Rizoma Digital" credit.
- Unpublish `producto prueba` and `Pronto` test products in WC.
- Fix homepage `<title>` and add meta description on the legacy WP site (Yoast / RankMath). Backfill product titles + descriptions.
- Localization: switch WC strings from Spanish to English (Cesta → Cart, Añadir → Add to cart, Leer más → Read more, Descartar → Dismiss).
- Decision needed: route apex `wenumapuonline.com` to www OR to the Astro Pages preview once it's live. (Current 502.)

### Days 4-7 — Astro Phase 2 (material landings)

Owner: Codex / Claude with per-commit approval.
- Build 6 material landings (`/material/sterling-silver`, `/material/14k-gold`, `/material/titanium`, `/material/vacamuerta`, `/material/walnut-wood`, `/material/brass-bronze`) — same template as `/piercing`, with KEYWORDS arrays that filter on the WC `categories[].slug` for each material.
- Add `landing.material_*` blocks to `src/i18n/en.json` using canonical phrases from BRAND-DNA §4.
- Add `/material/` index hub.
- Build verification: 6 new pages green; 88+6 = 94 pages; postbuild OK.

### Days 8-12 — Astro Phase 3 (PDP trust block + cross-sell rail)

- Add a compact `<Spec>` component: material / gauge / made-in / weight / sizing link / aftercare link / returns line / commission link. Inserted on `/p/[slug].astro`.
- Add a `<RelatedPieces>` rail: same material OR same maker series, 3 cards.
- Build verification: 64 product pages still green; spec block renders on each.

### Days 13-18 — Astro Phase 4 (Journal entries × 6)

- Build `/journal/[slug].astro` template (single entry pattern).
- Publish 6 entries listed in §16 P2.
- Cross-link from relevant pages: `/about` → "Why Truckee," `/materials` → "What is Vacamuerta," `/care-guide` → "Aftercare first 90 days."
- Build verification: 12 new journal pages; 100+ pages total.

### Days 19-22 — Newsletter wiring (P5 decision)

- Decide: Brevo / Klaviyo / Cloudflare Worker custom.
- Wire `<Newsletter>` and `/custom-orders` form to real provider.
- Replace mailto fallbacks; preserve as fallback link.

### Days 23-26 — Cloudflare Pages preview

- GitHub remote (P3 in TASK_QUEUE.md) + push `redesign-v2`.
- Pages project `wenu-mapu-redesign`, branch `redesign-v2`, env vars.
- Verify `*.pages.dev` URL serves all 100+ pages, smoke check 25 critical routes.

### Days 27-30 — Apex cutover decision (deferred)

- DO NOT auto-cutover. Document the cutover plan; user decides when.

---

## 19. What to give Codex next

Per the user's preferred workflow, the next coding pass should be tightly scoped. Recommended sequencing for Codex (or Claude Code with per-commit approval):

```
Codex Job 1 — Material landings (Days 4-7)
  Files NEW:    src/pages/material/sterling-silver.astro
                src/pages/material/14k-gold.astro
                src/pages/material/titanium.astro
                src/pages/material/vacamuerta.astro
                src/pages/material/walnut-wood.astro
                src/pages/material/brass-bronze.astro
                src/pages/material/index.astro
  Files EDIT:   src/i18n/en.json (+6 landing.material_* blocks)
  Pattern:      mirror src/pages/piercing.astro 1:1 — same Base props,
                same KEYWORDS+filter+JSON-LD shape, same hero+rail layout.
  Source copy:  ~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md §4
  Build target: npm run build → 94 pages, 64 products, postbuild OK.
  No new components, no new CSS, no nav change, no homepage change.

Codex Job 2 — PDP spec block (Days 8-10)
  File NEW:     src/components/visual/Spec.astro
  File EDIT:    src/pages/p/[slug].astro
  Content:      material / gauge / made-in / sizing link / aftercare link / returns / commission link
  Pattern:      compact 5-7 row table, .text-meta style; under ATC.
  No JSON-LD changes, no breaking PDP layout change.

Codex Job 3 — Cross-sell rail (Days 11-12)
  File NEW:     src/components/visual/RelatedPieces.astro
  File EDIT:    src/pages/p/[slug].astro
  Logic:        same primary category OR same name-series prefix; up to 3 cards.

Codex Job 4 — Journal template + 6 entries (Days 13-18)
  File NEW:     src/pages/journal/[slug].astro
                src/content/journal/what-is-vacamuerta.md
                ... etc (6 entries as MDX/MD, frontmatter title/eyebrow/date/og)
  File EDIT:    src/pages/journal.astro (replace "First entries forthcoming" with index of entries)
  Pattern:      Astro Content Collections; long-form layout with PatternBand divider, max-width prose, 2-card tail.
```

For each job: Claude Code can also do this directly — Codex isn't required. Pick one runner per job; do not have both run the same job.

---

## 20. Final priorities

If only ONE thing happens this week → fix the legacy WP footer (Petrolia → Truckee, broken phone, Rizoma credit) and unpublish the two placeholder products. These are visible to every visitor right now.

If only TWO things happen this week → add the legacy WP fix above AND ship the 6 Astro material landings. They unlock real SEO surface and sit cleanly on top of the existing system.

If THREE things → add Cloudflare Pages preview deploy so the world can finally see the new site at a `*.pages.dev` URL. Apex stays on the legacy WP until a deliberate cutover.

---

## Sources

Web research (verified URLs only — anything not fetched is named as such):

- [Rage Nation Apparel](https://ragenationapparel.com), [Rage Nation Rewards](https://ragenationapparel.com/pages/rewards)
- [Maria Tash](https://www.mariatash.com)
- [Buddha Jewelry](https://www.buddhajewelry.com/)
- [Maya Jewelry](https://mayajewelry.com)
- [Tawapa](https://www.tawapa.com)
- [Ask & Embla](https://askandembla.net), [14k Solid Gold collection](https://askandembla.net/collections/14k-solid-gold)
- [Starfire Body Jewelry](https://starfirebodyjewelry.com)
- [BVLA](https://bvla.com), [BVLA collections](https://bvla.com/collections)
- [So Gold Studios](https://sogoldstudios.com)
- [Iris Piercing](https://irispiercing.com), [Iris Brooklyn](https://irispiercing.com/pages/brooklyn)
- [Wildlike](https://wildlike.com), [Wildlike piercing menu](https://wildlike.com/pages/piercing-menu)
- [Bury Me In Gold](https://www.burymeingold.com/) (homepage gated; secondary [Yelp listing](https://www.yelp.com/biz/bury-me-in-gold-seattle-2))
- [Timeless Piercing](https://www.timelesspiercing.com/) (gated; APP membership PDF [linked from site](https://www.timelesspiercing.com/uploads/6/4/5/4/64541701/app_what_print_1.pdf))
- [Aesop](https://www.aesop.com) (bot-blocked; voice analyzed via [Aesop Library](https://www.aesop.com/library.html) + [Latterly profile](https://www.latterly.org/aesop-marketing-strategy/))
- [Alo Yoga](https://www.aloyoga.com)
- [Kin Euphorics](https://kineuphorics.com), [Kin Spritz PDP](https://kineuphorics.com/products/kin-spritz)

Wenu Mapu internal sources:

- `~/Obsidian/WenuAgent/brand/BRAND-DNA-2026-05-03.md` (canonical brand source)
- `~/Obsidian/WenuAgent/brand/voz-de-marca-real-2026-05-03.md` (voice rules)
- `~/Obsidian/WenuAgent/brand/copy-frontend-2026-05-01.md` (frontend copy spec)
- `~/wenu-frontend/CLAUDE.md` (Astro dev guide)
- `~/wenu-frontend/agent-control/*` (control center)
- `~/wenu-frontend/full-site-phase1-report.md` (Phase 1 close)
- Live site audit (separate report: [`live-site-audit-wenumapuonline.md`](live-site-audit-wenumapuonline.md))
