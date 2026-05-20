# Business Metrics, Marketing & Design — Control Center

**Purpose:** Track revenue, orders, marketing performance, and design pipeline alongside the technical state. This is the business-side sibling of `CURRENT_STATE.md`.

**Owner:** Human owner reviews; agents populate from available data sources.

---

## T9 — Metrics & Wallet

### Revenue Snapshot

| Metric | Value | Period | Source | Last Updated |
|---|---|---|---|---|
| Gross revenue | — | — | WooCommerce Orders (needs `read_orders` key) | — |
| Orders count | — | — | WooCommerce Orders | — |
| AOV (avg order value) | — | — | Revenue ÷ Orders | — |
| Refunds | — | — | WooCommerce / Stripe | — |

### Catalog Snapshot (from build-time WC products API)

| Metric | Value |
|---|---|
| Published products | **50** |
| Avg price | **$46.92** |
| Total catalog value | **$2,346.00** |
| Top category | Plug (26), Hanger (7), Ring (6) |
| Report file | `reports/metrics-2026-05-16.json` |

### Top Products (by revenue)

| SKU | Name | Units Sold | Revenue | % of Total |
|---|---|---|---|---|
| — | — | — | — | — |
| — | — | — | — | — |

### Channel Breakdown

| Channel | Revenue | Orders | % |
|---|---|---|---|
| WooCommerce (direct) | — | — | — |
| Wholesale / B2B | — | — | — |
| Custom / Commissions | — | — | — |
| Local pickup (Truckee) | — | — | — |

### Costs

| Category | Monthly | Notes |
|---|---|---|
| COGS (materials + labor) | — | Estimate per piece |
| WooCommerce / hosting | — | WordPress + Cloudflare |
| Marketing (ads, collab) | — | Track per campaign |
| Shipping | — | Labels, packaging |
| Payment processing | — | Stripe fee ~2.9% + $0.30 |
| Tools (Canva, etc.) | — | SaaS subscriptions |

### Data Sources (read)

| Source | Access Method | Permission |
|---|---|---|
| WooCommerce Orders API | `GET /wp-json/wc/v3/orders` | Agent read-only |
| Stripe Dashboard | Manual export or API | Human-only for now |
| WooCommerce Analytics | WP admin dashboard | Human-driven |
| NocoDB (inventory) | `~/wenu-platform/src/nocodb.mjs` | Agent read-only |

---

## T10 — Marketing

### Active Campaigns

| Campaign | Channel | Budget | Spend | Impressions | Clicks | Conv. | Revenue Attributed |
|---|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — | — |

### Content Pipeline

| Asset | Status | Owner | Due |
|---|---|---|---|
| — | draft / in-progress / published / archived | — | — |

### Channels

- **Instagram (@wenumapu)** — content in `~/Obsidian/WenuAgent/contenido/ig/`
- **Pinterest** — product pins
- **Email (MailerLite)** — flows in `src/i18n/en.json` + MailerLite dashboard
- **Wholesale outreach** — B2B emails in `reports/B2B-emails-batch1-top3.md`

---

## T11 — Design

### Visual Assets Pipeline

| Asset | Status | Format | Dimensions | Location |
|---|---|---|---|---|
| — | — | — | — | — |

### Brand System

| Element | Status | File |
|---|---|---|
| Color palette | ✅ Verified | `src/styles/tokens.css` = `~/Obsidian/WenuAgent/brand/color-palette.md` |
| Typography | ✅ Verified | DM Serif Display / Source Serif Pro / Inter Variable |
| Logo suite | Complete | `public/logos/` (3 variants) |
| Social templates | ⚠️ Empty dirs | `06-social-templates/{instagram-post,instagram-story,pinterest,tiktok}/` |
| Pattern band | Placeholder | `src/components/PatternBand.astro` (geometric, not final SVG) |

### Design Queue

| Item | Priority | Owner |
|---|---|---|
| Social template batch (4 channels) | Medium | wenu-brand |
| SVG pattern band real asset | Low | Visual agent |
| Hero video / motion budget | Low | Human decision |

---

## How to use this file

1. **Populate from APIs:** T9 agents call WooCommerce Orders API or Stripe export → fill tables.
2. **Manual updates:** Human pastes numbers from dashboards into the tables.
3. **Review cadence:** Weekly. Update the "Last Updated" column on each row when fresh data lands.
4. **Ties to TASK_QUEUE:** Tasks for automating metric collection appear in `TASK_QUEUE.md` under P9 (Metrics), P10 (Marketing), P11 (Design).

---

## Related files

- `~/Obsidian/WenuAgent/brand/` — full brand system
- `~/Obsidian/WenuAgent/contenido/` — IG, social content
- `reports/` — campaign reports, B2B batches, copy banks
- `src/lib/woo.ts` — WC client (orders endpoint not yet exposed)
