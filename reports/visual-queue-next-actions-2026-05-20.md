# Visual Queue Next Actions — 2026-05-20

Scope: read-only summary of the Noco/Woo visual queue. No NocoDB edits, WooCommerce writes, image edits, code edits, aftercare, secrets, git, DNS, production, or sudo actions were performed.

## Current Counts

- Noco catalog rows: 189.
- Available now: 170.
- READY products: 37.
- READY missing Woo URL: 24.
- Available missing Woo URL: 142.
- Available missing reference photo: 19.
- Available missing macro photo: 77.
- Available missing scale photo: 170.
- Available missing technical sheet: 170.

## First Production Priorities

1. Finish product technical sheets for READY products first.
2. Build category banners in this order: Plug, Hanger, Piercing, Tunnel, Earring.
3. Build collection/line banners in this order: Origin, Custom, Neo, Organico, India.
4. For every image prompt: use real product references only; do not invent silhouette, stone, color, pair count, cultural motif, logo, or text.
5. Treat READY missing Woo URL as the commercial bottleneck, but keep Woo writes human-approved only.

## READY Missing Woo URL Queue

Start with these READY products because they have reference photos and are not yet linked to Woo:

- WM-EAR-001 — Ethnic Shipibo Hoop Earrings (Gold & Silver)
- WM-HAN-005 — Ornamental Bronze Snake Weights
- WM-TUN-001 — Wood Tunnels (Red, Black & Brown)
- WM-HAN-007 — Sanskrit Mantra Hanger with Secret Compartment
- WM-HAN-009 — Magnetic Greek Hoop Hanger
- WM-HAN-010 — Ornate Magnetic Hoop Hanger (small thick)
- WM-TUN-008 — Solar Light Weight Tunnel - Flower of Life 14mm
- WM-TUN-009 — Solar Light Weight Tunnel - Cross Lattice 22mm
- WM-TUN-010 — Solar Light Weight Tunnel - Dreamcatcher Dome 25mm
- WM-HAN-017 — Spiral Pendulum Hangers (silver, 12mm)
- WM-HAN-022 — Crown Spine Hangers (10mm)
- WM-HAN-024 — Buddha Head Magnetic Hangers
- WM-HAN-025 — Geometric Twist Magnetic Hangers
- WM-TUN-015 — Implant Grade Titanium Tunnel 10mm
- WM-TUN-016 — Implant Grade Titanium Tunnel 14mm
- WM-SAD-009 — Ammonite Wood Teardrop Plug 20mm Pair (Brass Inlay)
- WM-PLG-017 — Black Surgical Steel Wave Pattern Plug 16mm Pair
- WM-EAR-004 — Tiny Silver Star Stud Earrings
- WM-PLG-030 — Tiger Eye Stone Plug 20mm Pair
- WM-PRC-014 — Marquise Red CZ Labret Top — Titanium 16G
- WM-TUN-022 — Purple Marbled Resin Tunnel 10mm Pair
- WM-PRC-016 — Marquise Green CZ Labret — Titanium 16G (Includes Post)
- WM-PRC-020 — Bezel-Set Blue Cabochon Labret Top — Titanium 16G
- WM-PRC-021 — Snowflake Labret Top with Central CZ — Titanium 16G

## Recommended Next Agent Tasks

1. Visual agent: generate a contact sheet for the top 10 READY missing Woo URL products using real reference photos only.
2. Product agent: prepare Woo upload previews for the 24 READY missing Woo URL items, but do not apply writes.
3. Design agent: create category banner drafts for Plug, Hanger, Piercing, Tunnel, and Earring using the exact reference-product list in `docs/visual-content-production-queue-2026-05-20.md`.
4. Codex: generate technical sheet previews for READY products where reference and macro photos exist, writing only to local report/preview folders.

## Stop Rules

- No WooCommerce writes without explicit approval.
- No NocoDB edits.
- No invented product details.
- No generated image should be accepted unless the real product remains recognizable.
- If scale is uncertain, produce a draft/preview only and mark it needs human review.

## Result

RESULT: success

WHAT CHANGED:
- Added this next-actions report.

WHAT WAS VERIFIED:
- Counts from the visual production queue.
- READY missing Woo URL list from the Noco vs Woo gap report.
- Priority category and line queues from the visual queue.

WHAT'S NEXT:
- Continue with a local technical-sheet or contact-sheet preview task, keeping all publishing/write actions gated.
