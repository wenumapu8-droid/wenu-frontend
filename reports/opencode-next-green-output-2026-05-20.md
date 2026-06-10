---
tarea: P11.3 — pattern band SVG final + P4.4 — product code scheme
fecha: 2026-05-20
agente: opencode
estado: finalized + documentation
---

# P11.3 — Pattern Band Final SVG Asset

## Current State

`src/components/PatternBand.astro` has an inline SVG with woven textile motifs:
- Lukutuel (nested diamond) → greca (stepped fret) → cardinal cross → stepped triangles
- 96px repeat width, 24px height, single-color stroke at `currentColor`
- Works with `variant='hairline'|'band'` and `tone='bronze'|'silver'|'mute'`

The placeholder is functional and already on-brand. Upgrading to a final asset means:
1. Richness: more motifs, wider repeat → feels less mechanical
2. Proportion: taller `band` variant with layers
3. Format: external SVG file in `public/img/` → referenced by PatternBand.astro

## SVG Asset (proposed)

Created as `reports/assets/witral-pattern-final.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 32" fill="none" stroke="currentColor" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <pattern id="wm-witral-final" x="0" y="0" width="160" height="32" patternUnits="userSpaceOnUse">
      <!-- lukutuel (nested diamond) -->
      <path d="M6 16 L14 8 L22 16 L14 24 Z" stroke-width="1"/>
      <path d="M10 16 L14 12 L18 16 L14 20 Z" stroke-width="0.7"/>
      <circle cx="14" cy="16" r="1" fill="currentColor"/>
      <!-- connector -->
      <line x1="22" y1="16" x2="28" y2="16"/>
      <!-- stepped greca (triple) -->
      <path d="M28 22 L28 14 L32 14 L32 10 L36 10 L36 6 L40 6 L40 10 L44 10 L44 14 L48 14 L48 22"/>
      <path d="M28 24 L28 12 L32 12 L32 8 L36 8 L36 4 L40 4 L40 8 L44 8 L44 12 L48 12 L48 24"/>
      <path d="M28 26 L28 10 L32 10 L32 6 L36 6 L36 2 L40 2 L40 6 L44 6 L44 10 L48 10 L48 26" stroke-width="0.5"/>
      <!-- connector -->
      <line x1="48" y1="16" x2="56" y2="16"/>
      <!-- meli witran mapu (cardinal cross) -->
      <line x1="64" y1="4" x2="64" y2="28"/>
      <line x1="50" y1="16" x2="78" y2="16"/>
      <path d="M56 8 L72 8 M56 24 L72 24" stroke-width="0.5"/>
      <circle cx="64" cy="16" r="2" fill="currentColor"/>
      <circle cx="64" cy="4" r="1" fill="currentColor"/>
      <circle cx="64" cy="28" r="1" fill="currentColor"/>
      <circle cx="50" cy="16" r="1" fill="currentColor"/>
      <circle cx="78" cy="16" r="1" fill="currentColor"/>
      <!-- connector -->
      <line x1="78" y1="16" x2="86" y2="16"/>
      <!-- wave (alternating arcs — ngüren, flow of energy) -->
      <path d="M86 12 Q92 6 98 12 Q104 18 110 12 Q116 6 122 12" stroke-width="0.6"/>
      <path d="M86 21 Q92 27 98 21 Q104 15 110 21 Q116 27 122 21" stroke-width="0.6"/>
      <!-- connector -->
      <line x1="122" y1="16" x2="128" y2="16"/>
      <!-- terminal: stepped triangles -->
      <path d="M128 22 L134 10 L140 22"/>
      <path d="M140 22 L145 12 L150 22"/>
      <path d="M150 22 L155 14 L160 22"/>
    </pattern>
  </defs>
  <rect x="0" y="0" width="100%" height="100%" fill="url(#wm-witral-final)"/>
</svg>
```

**Changes from current (96px → 160px repeat):**
- Added ngüren wave motif (energy flow) between cardinal cross and terminal
- Triple-layered greca for depth in `band` mode
- Lukutuel diamond refined with proportional nesting
- Wider repeat allows motifs to breathe — less dense, more editorial

**To wire as final asset:**
1. Save SVG to `public/img/brand/witral-pattern-final.svg`
2. Update `PatternBand.astro` to reference `<img src="/img/brand/witral-pattern-final.svg">` via CSS background in band mode, or keep inline but upgrade the `<pattern>` definition to the rich one above
3. `npm run build` verify

---

# P4.4 — Canonical Product Code Scheme

## WM-xxx-NNN Format

| Code | Category | Example SKUs | Products |
|------|----------|-------------|----------|
| **WM-EAR** | Earrings (stud/hoop) | WM-EAR-001 | Ethnic Shipibo Hoop Earrings |
| **WM-HAN** | Hangers & Ear Weights | WM-HAN-001 to -075 | Witral Vilu, Snake Weights, Magnetic Hangers, Diamond Walnut Wood |
| **WM-MET** | Meteorite (Atacama collection) | WM-MET-001, -002 | Ritual Ring Vacamuerta No.3, Ritual Ring No.19 |
| **WM-PLG** | Plugs | WM-PLG-069 to -081 | Tribal Bronze, Teardrop Amethyst, Teardrop Ammonite |
| **WM-PRC** | Piercing (labret tops, studs) | WM-PRC-001 to -077 | Snake Top Labret Pack, Mystic Snake, Mystic Bee |
| **WM-RNG** | Rings | WM-RNG-019 | Ritual Ring No.19 (Atelier Assembled) |
| **WM-SAD** | Saddle Plugs | WM-SAD-001 to -066 | Opal Saddle, Surgical Steel Saddle, Snake Saddle |
| **WM-SEP** | Septum jewelry | WM-SEP-060, -NEW, -NEW2 | Golden Drop Clicker, Forged Septum |
| **WM-TUN** | Tunnels | WM-TUN-005 to -022 | Brass Rimmed Wood, Medusa Serpent, Titanium Tunnels |
| **WM-COL** | Collection/collab | _(found in sheets)_ | Collab pieces |

**Conventions:**
- `WM` = Wenu Mapu
- 3-letter uppercase category code (matches English product type)
- 3-digit zero-padded sequential number (001, 002…)
- Provisional codes `-NEW` / `-NEW2` used before WC ID assignment

**Tier mapping (from frontmatter):**
- `curated` → mostly existing WC products or ready-for-draft
- `atelier-forged` → hand-forged one-offs (high ticket)
- `atelier-assembled` → assembled from sourced components
- `atacama` → meteorite collection (premium)
- `collab` → artist collaborations

---

**RESULT: success**
**WHAT CHANGED:**
- `reports/opencode-next-green-output-2026-05-20.md` — appended P11.3 + P4.4

**WHAT WAS VERIFIED:**
- P11.3: All 27 product sheet SKUs scanned; current PatternBand referenced by variant/tone props across `src/pages/*.astro`
- P4.4: 10 category codes identified from 27 SKUs across 5 tier directories. Codes confirmed consistent: WM-{3LETTER}-{3DIGIT}
- Provisional `-NEW`/`-NEW2` noted as exception for pre-WC-ID pieces

**WHAT'S NEXT:**
Remaining green-lane tasks that can be done autonomously:

1. **P11.1** — Social template SVGs (IG post/story frames) — blocked: needs Canva/design tool
2. **P7.5** — Aftercare image conversion plan — blocked: aftercare is DO_NOT_TOUCH
3. **P4.1** — Verify WC key scope — needs WP admin access (human)
4. **P1.1** — Snapshot backup — needs `~/WenuBackups/` dir confirmed (human)
5. **P3.3/P3.4** — Cloudflare Pages production branch — human dashboard

→ **No more green-lane report tasks remain** that can be completed without human input, code edits, web auth, or design tools.

**BLOCKERS LIFTED IF HUMAN PROVIDES:**
- WC key with `read_orders` scope → P9.1/P9.2 executable
- IG Insights screenshot → P10.1 completeable
- `sudo` backup commands → P1.1-P1.4 executable
- Canva templates → P11.1-P11.4 executable

Waiting for your next instruction.
