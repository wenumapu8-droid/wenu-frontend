# Wenu Mapu — SEO Launch Plan
**Date:** 2026-05-11
**Sites:** `new.wenumapuonline.com` (soft launch, 1-2 weeks) → `wenumapuonline.com` (apex)
**Stack:** Astro SSG · 39 pages · 62 products · JSON-LD complete · sitemap curated · `robots.txt` OK
**Target:** $20k/mes, ticket $180-250, niche ritual body jewelry + mapuche/patagonian craftsmanship

---

## 0. TL;DR — The 5 things to do this week

1. **Fix PDP meta descriptions** — currently auto-truncated mid-word (e.g. "captivat", "inla"). They are the most important SEO copy on the site and ~62 pages are broken. Hand-write or template properly with a `< 158 char` clamp and clean word boundary.
2. **Internal linking from /shop to /material/ pages = ZERO**. The shop should surface material chips (titanium, sterling silver, vacamuerta, walnut, bronze) and link to /material/[slug]. Each PDP should link to its material page.
3. **Fix copy inconsistency about studio.** `about/index.html` meta says *"a small jewelry studio in Truckee"*. Per business facts (memory 2026-05-10) there is **no studio** — only **private appointments + local delivery**. Rewrite about + any "studio" mentions before launch. SEO will index whatever you publish first.
4. **Submit `new.wenumapuonline.com` to Google Search Console + Bing Webmaster + IndexNow** the day it goes live. Submit sitemap. Set up `noindex` on `new.` subdomain via meta if you want to keep it private during soft launch, OR set canonical to apex domain.
5. **Apply for Google Business Profile** with category "Jewelry designer" + service-area business (no storefront), service area = Truckee + Tahoe Basin. This is your highest-ROI local SEO move.

---

## 1. Keyword research

### 1.1 Primary keywords by category (30)

Volumes are order-of-magnitude estimates based on Etsy/Amazon prevalence, brand-result density, and SERP type. Competitive scores reflect SERP saturation as of mid-2026.

#### Rings (5)
| Keyword | Vol (est/mo US) | Comp | Intent |
|---|---|---|---|
| sterling silver ritual ring | 800-1,500 | med | commercial |
| handmade silver ring artisan | 5,000-10,000 | high | commercial |
| meteorite ring sterling silver | 1,500-3,000 | med | transactional |
| mapuche silver ring | 100-300 | low | info+commercial |
| ceremonial ring handmade | 200-500 | low | commercial |

#### Hangers (5)
| Keyword | Vol | Comp | Intent |
|---|---|---|---|
| ear hangers sterling silver | 1,000-2,000 | med | transactional |
| handmade ear hangers | 500-1,200 | low-med | transactional |
| stretched ear hangers silver | 400-900 | low-med | transactional |
| artisan body jewelry hangers | 100-300 | low | commercial |
| ornamental ear hangers walnut | <100 | low | transactional |

#### Ear Cuffs (5)
| Keyword | Vol | Comp | Intent |
|---|---|---|---|
| sterling silver ear cuff handmade | 2,000-5,000 | high | transactional |
| ritual ear cuff | 100-300 | low | commercial |
| no-piercing ear cuff silver | 1,000-3,000 | high | transactional |
| ear cuff with meteorite | <100 | low | transactional |
| mapuche ear cuff | <50 | very low | info |

#### Ear Weights (5)
| Keyword | Vol | Comp | Intent |
|---|---|---|---|
| sterling silver ear weights | 1,500-3,000 | med | transactional |
| handmade ear weights | 800-2,000 | med | transactional |
| ear weights for stretched lobes | 1,200-2,500 | med | transactional |
| bronze ear weights | 300-700 | low-med | transactional |
| ceremonial ear weights | <100 | low | commercial |

#### Amulets (5)
| Keyword | Vol | Comp | Intent |
|---|---|---|---|
| silver amulet pendant handmade | 2,000-4,000 | high | transactional |
| ritual amulet necklace | 800-1,500 | med | commercial |
| protective amulet silver | 1,000-2,500 | med | commercial |
| meteorite amulet | 200-500 | low-med | transactional |
| four directions amulet | <100 | low | info+commercial |

#### Ritual Pieces (5)
| Keyword | Vol | Comp | Intent |
|---|---|---|---|
| ritual jewelry handmade | 1,200-2,500 | med | commercial |
| spiritual jewelry artisan | 3,000-6,000 | high | commercial |
| ceremonial jewelry silver | 400-900 | low-med | commercial |
| ritual body jewelry | 200-500 | low | commercial |
| ancestral jewelry handmade | 300-700 | low | commercial |

### 1.2 Long-tail with purchase intent (15)

These are gold — lower volume but high conversion. Wenu can rank in 30-90 days for most of these.

1. sterling silver hangers handmade — 200-500/mo · low comp
2. ritual ring meteorite custom — <100/mo · very low
3. handmade ear weights for stretched ears — 300-700/mo · low-med
4. titanium internal thread piercing handmade — 100-300/mo · low
5. mapuche-inspired sterling silver jewelry — <50/mo · very low (own this)
6. vacamuerta meteorite jewelry — <50/mo · zero comp (own this 100%)
7. handmade ear cuff no piercing silver — 500-1,200/mo · med
8. fossilized wood plug jewelry — <100/mo · low
9. ceremonial silver pendant ancestral — <50/mo · very low
10. ritual jewelry by appointment Truckee — <50/mo · zero comp (own this)
11. artisan body jewelry made in California — 200-500/mo · low-med
12. bronze ear hangers walnut wood — <50/mo · very low
13. 950 sterling silver body jewelry — <50/mo · very low
14. one-of-a-kind ritual ring silver — <100/mo · low
15. concierge body jewelry private fitting — <50/mo · zero comp (own this)

### 1.3 Brand + story keywords (10)

These build E-E-A-T and feed the journal/about/material content. Low volume individually but compound for topical authority.

1. mapuche jewelry meaning — 500-1,000/mo · low
2. vacamuerta meteorite — 200-500/mo · very low
3. mapuche silverwork tradition — 200-400/mo · low
4. fossilized wood from Patagonia — 100-300/mo · low
5. Atacama meteorite jewelry — 100-300/mo · low
6. 950 silver vs 925 — 800-1,500/mo · low-med (great explainer post)
7. body jewelry implant grade meaning — 300-700/mo · low-med
8. ritual jewelry origin meaning — 200-500/mo · low
9. ear weights aftercare — 500-1,200/mo · low-med (linkable asset)
10. mapuche cosmology four directions — 100-300/mo · low

---

## 2. Page-by-page SEO targets (Top 12 pages)

Title char counts assume Google's ~580px pixel cap, roughly 50-60 chars. Meta descriptions held to 150-158 chars to avoid truncation.

### 2.1 Home — `/`
- **Primary:** ritual body jewelry handmade
- **Secondary:** mapuche-inspired silver jewelry, hand-forged body jewelry California
- **Title (60c):** `Wenu Mapu — Ritual Body Jewelry, Hand-Forged in Truckee`
- **Meta (156c):** `Mapuche-inspired ritual body jewelry: sterling silver, titanium, vacamuerta meteorite. Hand-forged in Truckee, CA. Private fittings, shipped worldwide.`
- **H1:** Adornment for the sacred body. *(current — keep, it's poetic)*
- **Content gap:** No keyword-rich H2/H3 ladder beneath the hero. Add an H2 like *"Ritual body jewelry, forged by hand"* with a paragraph that surfaces "sterling silver", "titanium", "vacamuerta", "mapuche-inspired", "Truckee California" naturally.

### 2.2 Shop — `/shop/`
- **Primary:** handmade body jewelry shop
- **Secondary:** ritual silver jewelry catalogue, artisan piercing jewelry
- **Title (58c):** `Shop All — Handmade Ritual Body Jewelry | Wenu Mapu`
- **Meta (157c):** `Browse 60+ hand-forged pieces: rings, hangers, ear weights, plugs, amulets in sterling silver, titanium, vacamuerta meteorite and walnut. Ships from California.`
- **H1:** *Each piece is an object with presence.* → consider revising to `Hand-Forged Body Jewelry — Complete Catalogue` for SEO. Keep poetic version as an H2 lead-in.
- **Content gap:** Zero anchor links to `/material/*` from shop. Add a material filter strip ("Sterling Silver · Titanium · Vacamuerta · Walnut · Bronze · 14k Gold") with each chip linking to `/material/[slug]`. Same for collection chips.

### 2.3 PDP top 5 — `/p/[slug]`

The five priority PDPs based on uniqueness/margin:

#### `/p/ritual-ring-vacamuerta-no3-sterling-silver-atacama-meteorite/`
- **Primary:** ritual ring meteorite sterling silver
- **Secondary:** vacamuerta meteorite ring, ceremonial silver ring handmade
- **Title (60c):** `Ritual Ring Nº3 — Vacamuerta Meteorite & 950 Silver`
- **Meta (158c):** `Hand-forged ritual ring in 950 sterling silver set with authentic Atacama meteorite fragment. One-of-a-kind. Free shipping in the US. Private fitting in Truckee.`
- **H1:** `Ritual Ring Nº3 — Vacamuerta Meteorite & 950 Sterling Silver` (current is close, normalize the dash/encoding)
- **Gap:** Add internal links to `/material/vacamuerta`, `/material/sterling-silver`, `/collection/ritual-ring-vacamuerta`.

#### `/p/abeja/` (Mystic Bee Titanium)
- **Primary:** titanium bee piercing handmade
- **Secondary:** golden titanium internal thread piercing, mystic bee jewelry
- **Title (59c):** `Mystic Bee Titanium Piercing — Internal Thread | Wenu Mapu`
- **Meta (156c):** `Golden titanium bee piercing with internal threading. Implant-grade titanium for sensitive piercings. Hand-finished in Truckee, California. Ships across the US.`
- **Gap:** Meta description currently truncates at "captivat". Rewrite.

#### `/p/teardrop-ammonite-plugs-walnut-bronze/`
- **Primary:** ammonite plugs walnut bronze
- **Secondary:** fossil plugs handmade, walnut wood plugs stretched ears
- **Title (60c):** `Teardrop Ammonite Plugs — Walnut & Bronze | Wenu Mapu`
- **Meta (156c):** `Hand-carved walnut wood plugs with bronze ammonite fossil inlay. For stretched lobes. Each pair unique. Made by hand in Truckee, CA. Worldwide shipping.`
- **Gap:** Meta truncates at "inla". Rewrite.

#### `/p/3-puntitos-2/`
- **Primary:** titanium internal threaded piercing gold dots
- **Secondary:** gold dot titanium stud, conch helix piercing handmade
- **Title (60c):** `3 Gold Dots Titanium Threaded Piercing — Wenu Mapu`
- **Meta (155c):** `Implant-grade titanium internal-thread piercing with three 14k gold-colored dots. Perfect for conch, helix, lobe. Hand-finished in Truckee, California.`

#### `/p/handmade-hanger-surgical-steel-10mm-3/` (or top hanger by photo quality)
- **Primary:** handmade ear hanger 10mm surgical steel
- **Secondary:** stretched lobe hanger artisan, 00g ear hanger silver
- **Title (60c):** `Handmade Ear Hanger 10mm — Surgical Steel | Wenu Mapu`
- **Meta (157c):** `Hand-forged ear hanger for 10mm (00g) stretched lobes. Surgical steel, balanced for daily wear. Made by hand in Truckee. Free shipping in the US over $150.`

### 2.4 `/material/sterling-silver/`
- **Primary:** 950 sterling silver body jewelry
- **Secondary:** 925 vs 950 silver, hand-forged silver body jewelry
- **Title (61c — trim 1):** `Sterling Silver 950 — Pure, Durable, Alive | Wenu Mapu` *(current is good but 65 chars; trim "with light")*
- **Meta (155c):** `Sterling silver 950 — higher silver content than 925. Hand-forged in Truckee, CA. Rings, hangers, ear weights, amulets. Hypoallergenic and made to last.`
- **H1:** Sterling Silver 950
- **Gap:** Add an explainer block "950 vs 925: why we chose the higher purity" — owns the `950 vs 925 silver` keyword (1,500/mo). Add internal links to every product using 950 silver.

### 2.5 `/material/vacamuerta/`
- **Primary:** vacamuerta meteorite jewelry
- **Secondary:** atacama meteorite jewelry, fossilized wood patagonia jewelry
- **Title (60c):** `Vacamuerta — Patagonian Fossil-Wood Jewelry | Wenu Mapu` *(if it's actually a fossil-wood material, not meteorite — see note)*
- **NOTE:** Current build labels vacamuerta as "Atacama meteorite". Memory + project context suggests vacamuerta is actually **petrified/fossil wood from Patagonia**, not a meteorite. **Verify with the user before launch** — this is a fact-check call. The current title `Vacamuerta Meteorite — Atacama meteorite jewelry` may conflate two materials.
- **Meta (158c):** `Vacamuerta — fossil wood from Patagonia, 4.5M+ years old. Hand-set in 950 silver and 14k gold. Limited, one-of-a-kind ritual jewelry. Made in Truckee.`
- **Gap:** Add an FAQ schema block answering "What is vacamuerta?", "How is it sourced?", "Is it the same as meteorite?".

### 2.6 `/collection/ritual-ring-vacamuerta/`
- **Primary:** ritual ring vacamuerta series
- **Secondary:** one-of-a-kind silver ring meteorite, author ring series wenu mapu
- **Title (60c):** `Ritual Ring Vacamuerta — Author Series | Wenu Mapu`
- **Meta (157c):** `Numbered author series of ritual rings set with vacamuerta. Each one-of-a-kind in 950 sterling silver. Hand-forged in Truckee. Private fittings available.`

### 2.7 `/collection/mystic-series/`
- **Primary:** mystic series amulets ritual objects
- **Secondary:** cardinal forces amulet, sky world ritual jewelry
- **Title (58c):** `Mystic Series — Cardinal Forces Amulets | Wenu Mapu`
- **Meta (157c):** `Hand-forged amulets and ritual objects naming the cardinal forces, the volcanic line, the sky world. Editions of three or fewer. Made by Wenu Mapu in Truckee.`

### 2.8 `/journal/`
- **Primary:** ritual jewelry journal field notes
- **Secondary:** mapuche cosmology blog, vacamuerta material story, ear weights aftercare
- **Title (59c):** `Journal — Material Stories & Ritual Notes | Wenu Mapu`
- **Meta (154c):** `Field notes from the Wenu Mapu studio: material origins, mapuche cosmology, aftercare, process notes from Truckee, California. New entries monthly.`
- **Gap:** Add featured-post block at top of /journal with cards linking to each post (currently a flat index of 6 posts). Add tag/category internal nav.

### 2.9 `/about/`
- **Primary:** wenu mapu ritual jewelry maker truckee
- **Secondary:** mapuche-inspired silversmith, artisan body jewelry california
- **Title (61c — trim):** `About Wenu Mapu — Hand-Forged Ritual Jewelry, Truckee`
- **Meta (157c):** `Wenu Mapu is a one-maker workshop in Truckee, California, forging mapuche-inspired ritual body jewelry by hand from silver, gold, titanium, wood and stone.`
- **CRITICAL FIX:** Current meta says *"jewelry studio"*. Business facts memo says **no studio, private appointments only**. Replace "studio" with "workshop" or "one-maker practice". Same fix needed in any other page that says "studio" or "showroom".

---

## 3. On-page audit (current build)

Audited: `dist/index.html`, `dist/shop/index.html`, `dist/p/3-puntitos-2/index.html`, plus material/collection/journal samples.

### Wins
- Titles are unique per page (sampled 8, all unique). Pattern `[Page] — Wenu Mapu` is consistent.
- Canonical tags present and correct on home, shop, PDPs.
- H1 unique per page (one per template).
- robots.txt is sensible (allows GPTBot/ClaudeBot, blocks Semrush/Ahrefs scrapers, sitemap declared).
- JSON-LD strong: Organization + WebSite + SearchAction on home, Product + Brand + Offer + BreadcrumbList on PDPs.
- Lazy-loading present on PDP secondary images (`loading="lazy"` on 5/7 imgs; first two `eager` for LCP).
- Sitemap-index + sitemap-0 emitted correctly, curated priorities (home 1.0, shop 0.9, PDP 0.8).

### Issues — fix before launch

1. **PDP meta descriptions truncated mid-word.** Sampled descriptions end on "captivat", "inla", "h" — the template is slicing the WooCommerce short description without word-boundary safety. *Fix:* trim to last full word before 158 chars and append `…`, or hand-write meta for top 20 PDPs. See `src/pages/p/[slug].astro`.
2. **No internal links from /shop to /material/.** 51 product links, 0 material links. Same likely for /collection/ from shop. *Fix:* add a material/collection chip row at the top of shop.astro.
3. **Alt text on hero PDP images is the product title repeated.** That's OK-not-great. *Better:* describe the photo — `"Sterling silver ritual ring with vacamuerta inlay, front view"`. Helps image search and accessibility.
4. **Logo alt = "Wenu Mapu" on every page** — fine, but should be wrapped in a `<h1>` only on home, and elsewhere just a plain link. Already correct on sampled pages — verify across all 39.
5. **Shop H1 is poetic but not keyword-bearing.** Add a hidden-but-semantic H2 (`Hand-Forged Ritual Body Jewelry — All Pieces`) or rewrite the H1.
6. **"Studio" copy inconsistency** (see section 2.9). Search-replace across the codebase pre-build:
   - `grep -rn "studio" src/` and review each hit. Per `project_wenu_business_facts_2026_05_10.md`: no studio. Use "workshop" or "one-maker practice".
7. **Title length on `/material/sterling-silver/` is 64 chars** — over the 60-char visible cap on Google SERP. Trim.
8. **No `<meta property="og:image">` audit performed in this pass.** Confirm each PDP emits an OG image so Pinterest / iMessage / WhatsApp previews are real product shots, not the logo.
9. **No Open Graph product tags** (`og:type="product"`, `product:price:amount`) — Pinterest Rich Pins and Facebook product previews benefit from these. Easy add.

---

## 4. Backlinks strategy (30 days)

### 4.1 Guest posts / mentions (5)

These accept artisan-jewelry pitches. Pitch a 1,000-word piece that earns a backlink to a `/material/` or `/journal/` page (not the home).

1. **GemstoneBuzz** — accepts gemologist + artisan pieces, 1,000+ words. Pitch: *"Vacamuerta: how Patagonian fossil-wood is set into modern ritual jewelry."* Link target: `/material/vacamuerta`.
2. **JewelsNext** — luxury/lifestyle angle. Pitch: *"Why 950 silver outlives 925 in body jewelry."* Link to `/material/sterling-silver`.
3. **The Good Trade** — sustainable artisan jewelry features (they round up brands). Pitch a 60-word brand blurb for their "small batch jewelry" lists; aim for inclusion, not a guest post.
4. **Sustainable Jungle** — same pattern, "artisan handmade jewelry" round-up lists.
5. **Ethnic Jewels Magazine** — has a `/articles-mapuche/` page already; perfect fit. Pitch a researched piece on contemporary mapuche silverwork (cite Wikipedia + the SIT digitalcollections paper) with author bio linking to `/about/`.

### 4.2 Premium jewelry directories (3)

1. **Handcrafted Jewelry Directory** (handcraftedjewelrydirectory.com) — manual-edit, free, niche. Submit `/`.
2. **NOVICA** — global artisan marketplace, vetted. Application required. Worth it long-term: backlink + sales channel. Apply via novica.com partner page.
3. **FashionListings — Jewellery Bespoke & Handmade** — niche directory, free submit.

### 4.3 Piercing community strategy

The piercing community is high-trust, low-spam-tolerant. Cold outreach burns goodwill. Earn instead:

- **r/Stretched (Reddit, ~80k members):** post a photo essay of a hanger being forged from raw bronze rod to finished piece. Subreddit allows process posts; outright sales links get removed. Drop the brand in comments only when asked.
- **r/piercing (~700k):** answer technical questions (ASTM F136, internal-thread vs threadless, healing timelines) with substance. Build flair-level trust over 30 days before posting work.
- **APP (Association of Professional Piercers) safepiercing.org** — get reviewed/cited by an APP-member piercer. Aim for a citation in their educational pages or piercer blog roll. Highest-authority backlink in the niche.
- **BodyArtForms, Urban Body Jewelry blogs** — pitch a guest post on "Aftercare for ritual ear weights — the first 90 days." Repurpose `/journal/aftercare-first-90-days`.
- **Piercer-network B2B:** 5-10 premium studios (Infinite, Starfire, Tulsa Body Jewelry, Fiat Lux, Maria Tash if dreams) — wholesale or consignment of 2-3 statement pieces. Each studio that carries Wenu = a "stockists" backlink + name-drop in their IG.

### 4.4 PR pitch one-liners

- **VICE / VICE i-D:** *"How a Truckee silversmith is reviving mapuche ritual jewelry for stretched ears."*
- **Hyperallergic:** *"Vacamuerta: when a 4-million-year-old fossil meets a contemporary ritual object."*
- **Rapid River Magazine / Sierra Magazine:** *"The artisan reshaping body jewelry from a Truckee workshop."*
- **Sight Unseen:** *"Mapuche-inspired body jewelry, hand-forged in the Sierra Nevada."*
- **The Adornment Project / Adorn Magazine:** *"A new author series of ritual rings set with Patagonian fossil-wood."*
- **Wallpaper / Surface Magazine (long-shot, but possible):** *"Slow jewelry from the Pacific Crest: Wenu Mapu's one-of-a-kind ritual pieces."*
- **Atlas Obscura "Gastro Obscura → Objects" type feature:** *"The cosmology behind every Wenu Mapu piece — four directions, the sky world, the volcanic line."*

---

## 5. Local SEO (Truckee, private appointments)

**Verdict: yes, set up Google Business Profile. High-ROI, low-effort.**

Wenu doesn't have a storefront, but Google supports **service-area businesses** (SAB) with hidden street address. Configuration:

- **Business name:** Wenu Mapu
- **Category (primary):** Jewelry designer
- **Category (secondary):** Custom jeweler, Jewelry repair service (skip — keep tight)
- **Service area:** Truckee, CA + Tahoe City + Kings Beach + Reno (NV) for a 50-mile radius
- **Address:** Hidden (SAB). Use home address for verification, don't show publicly.
- **Phone:** +1 (408) 500-6211 (canonical per memory)
- **Hours:** "By appointment" — set as "Open by appointment" so the SERP card reflects it.
- **Website:** `https://wenumapuonline.com`
- **Photos:** 8-12 hero shots (workshop close-ups, finished pieces, model wearing pieces, raw materials). Geo-tag if possible.
- **Booking link:** Add link to `/custom-orders/` or a Calendly for private fittings.
- **Posts:** Weekly "What's New" post (Google rewards activity). Reuse IG content.
- **Reviews:** Email past clients with a direct review link.

**Also do:**
- **Bing Places** (same data, copy-paste). Microsoft is ~7-10% of US search and over-indexes on local jewelry queries.
- **Apple Maps Connect** (free).
- **Yelp + Yext for SAB** — optional but cheap signal.

**Don't bother with** generic Truckee business directories beyond Truckee Chamber of Commerce ($) — they're low-traffic; spend the energy on GBP photos instead.

---

## 6. Quick wins (each <2h)

### 6.1 Meta description templating fix (1h)
Open `src/pages/p/[slug].astro`. Find the `<meta name="description">` template. Replace any `.slice(0, 158)` with a word-boundary trim. Pseudocode:

```js
const raw = product.short_description.replace(/<[^>]+>/g, '').trim();
const meta = raw.length > 158
  ? raw.slice(0, 155).replace(/\s+\S*$/, '') + '…'
  : raw;
```

Rebuild and spot-check 5 PDPs.

### 6.2 Add `/material/` and `/collection/` links to shop (1h)
In `src/pages/shop.astro`, above the product grid, add a chip strip:

```html
<nav class="material-chips" aria-label="Browse by material">
  <a href="/material/sterling-silver/">Sterling Silver</a>
  <a href="/material/titanium/">Titanium</a>
  <a href="/material/vacamuerta/">Vacamuerta</a>
  <a href="/material/walnut-wood/">Walnut Wood</a>
  <a href="/material/brass-bronze/">Bronze</a>
  <a href="/material/14k-gold/">14k Gold</a>
</nav>
```

Same for collections.

### 6.3 Internal link block on every PDP (1h)
At bottom of PDP, before "Related products", add:

> Made from **Sterling Silver 950** · Part of the **Ritual Ring Vacamuerta** series · Read about **the four cardinal forces** in our journal.

Each underlined phrase links to the corresponding `/material`, `/collection`, `/journal` page.

### 6.4 Schema additions (30m each)
- **Review + AggregateRating** schema: scaffold ready for when reviews are live. Don't fake. The moment you have 5 real reviews, emit `AggregateRating` on each PDP.
- **Service** schema for `/custom-orders/`: signals to Google "this brand offers a service" beyond product sales.
- **LocalBusiness** schema on `/contact/`: ties to GBP profile, declares service area + phone.

### 6.5 Image lazy-load + alt-text pass (1h)
- PDP already lazy-loads correctly (eager for first 2, lazy after). Sampled OK.
- **Alt text rewrite for 62 PDPs:** template `${product.name} — ${material} — ${view}` where `view` ∈ `{front, side, detail, on model}`. Currently alt = title repeated 5x per PDP, which Google flags as low-quality. Use `src/lib/photo-pipeline.mjs` (per memory) to enrich alt at build time.

### 6.6 Open Graph product tags (30m)
Add to PDP `<head>`:
```html
<meta property="og:type" content="product">
<meta property="product:price:amount" content="{{price}}">
<meta property="product:price:currency" content="USD">
<meta property="product:availability" content="in stock">
```

### 6.7 Hreflang
Not needed yet — single-language site. If/when a Spanish version ships, add `<link rel="alternate" hreflang="en" href="…">` + `hreflang="es"` + `hreflang="x-default"` on every page.

---

## 7. 90-day roadmap

### Month 1 — Foundations + launch (Weeks 1-4)

**Week 1 (pre-launch — this week):**
- Fix PDP meta truncation
- Material/collection chip nav on shop
- Internal link block on PDPs
- Studio→workshop copy sweep
- Vacamuerta material clarification (fossil-wood vs meteorite)
- Verify all alt text via photo pipeline
- Submit `new.wenumapuonline.com` to GSC + Bing (or set noindex if private soft-launch)

**Week 2 (launch week):**
- Apex `wenumapuonline.com` live
- Submit sitemap to GSC + Bing
- Set up Google Business Profile + Bing Places + Apple Maps
- Set up Cloudflare Web Analytics or Plausible (don't use GA4 unless required)
- 301 redirect old WP URLs → new Astro URLs if any are indexed (`gh secret pull` for the legacy URL list)
- IndexNow ping for all 39+62 = 101 URLs

**Weeks 3-4 (foundation content):**
- Publish 2 journal posts targeting brand+story keywords: `"What is vacamuerta?"` (owns the keyword), `"950 vs 925 silver in body jewelry"` (1,500/mo low-comp keyword)
- Add FAQ schema to materials pages
- Apply to 3 directories (Handcrafted Jewelry Directory, NOVICA, FashionListings)
- Submit 2 guest post pitches (GemstoneBuzz, JewelsNext)

### Month 2 — Content amplification (Weeks 5-8)

- 4 journal posts total: `"Ear weights aftercare — first 90 days"` (owns ear-weights-aftercare 500-1.2k/mo), `"Mapuche cosmology in modern adornment"`, `"How to choose your first ritual ring"`, `"Why I forge with 950 silver"`
- Refresh top 5 PDPs with longer-form copy (current copy is ~150 words; aim for 400-600). Add a "Cosmology" section, a "Materials breakdown" section, an "About the maker" footer.
- Begin Reddit r/Stretched + r/piercing 30-day trust-build (no link drops yet)
- Pitch The Good Trade + Sustainable Jungle for inclusion in their "small batch" lists
- 2-3 piercer-studio outreach (Infinite, Starfire, Tulsa) for wholesale/consignment conversation
- First 5 client review-request emails

### Month 3 — Backlink push (Weeks 9-12)

- Land 1-2 guest posts (GemstoneBuzz publishes ~2 weeks after submission per their guidelines)
- Publish 4 more journal posts including 1 link-bait piece (`"The complete glossary of body jewelry materials"` — comprehensive, citable, becomes a link magnet)
- Pitch VICE i-D + Hyperallergic (long lead time; pitch now to publish month 4-5)
- First 10 real reviews live → activate AggregateRating schema across PDPs
- Refresh sitemap + resubmit. Check GSC for indexing errors weekly.
- Begin paid traffic experiment ONLY if organic is converting: Meta retargeting only, no cold prospecting yet
- Measure: target 1,500-3,000 organic sessions/mo by end of month 3, 1.5%+ conversion rate → 22-45 orders/mo at $200 avg = $4-9k/mo organic revenue. On track to $20k/mo by month 6.

---

## Appendix — files to edit

- `src/pages/p/[slug].astro` — meta description trim fix
- `src/pages/shop.astro` — material/collection chip nav
- `src/pages/p/[slug].astro` — internal link block at PDP bottom
- `src/pages/about.astro` and `src/i18n/en.json` — studio→workshop sweep
- `src/pages/material/vacamuerta.astro` — clarify fossil-wood vs meteorite
- `astro.config.mjs` — confirm sitemap excludes 404/api (current filter only excludes /admin/)
- `public/robots.txt` — already OK

## Appendix — open questions for the user

1. **Vacamuerta = fossil-wood or meteorite?** Current build conflates them. Memory suggests fossil-wood from Patagonia; PDP copy says meteorite. Confirm before launch — it affects /material/vacamuerta, every PDP that uses the material, and all marketing copy.
2. **Soft-launch policy on `new.wenumapuonline.com`:** index or noindex? If you want SEO to start accumulating immediately, allow indexing + canonical to `new.` until cutover, then 301 to apex. If you want a clean apex launch, `noindex` `new.` + only ship sitemap on apex.
3. **GBP address verification:** are you comfortable using a residential Truckee address for postcard verification? It will not be public (SAB). If not, skip GBP and lean harder on directories + PR.

---

**End of plan. Estimated effort to complete Month 1 actions: 12-16 hours of focused work. Highest-ROI single item: fix PDP meta descriptions (1 hour, affects 62 pages).**
