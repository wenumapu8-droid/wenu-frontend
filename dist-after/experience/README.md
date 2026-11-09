# Wenu Mapu — Dimensional Experience

Self-contained HTML landing portal that runs **before** the e-commerce site.
This is the **calling card / first impression** for the brand.

## Live path

After `npm run build`:
- Local: `http://localhost:4321/experience/`
- Prod (when wired): `https://wenumapuonline.com/experience/`

## What it does

1. **Loader (7s ceremony)** — black → mandala spins → "WENU MAPU" wordmark fades up → status text → tagline "Tribal Jewelry · Connected to the Cosmos"
2. **Star map** — 10 SVG stars surround a circular cosmic portal at center
3. **Hover preview** — cursor near a cardinal direction (N/NE/E/SE/S/SW/W/NW + Wüñelfe orbital + Treng Treng orbital) lights that star + previews its wallpaper in the central lens
4. **Click a star** — enters that star's deep portal: full-screen wallpaper + Mapudungun name + English subtitle + poetic line + 2 paragraphs of body text + return button
5. **Click anywhere in a deep portal** (except content/return) → back to the map
6. **Center mandala click** — triggers the zoom-in animation and (in production) redirects to `/shop`. In local file:// demo shows a placeholder card

## Files
| Path | What |
|---|---|
| `index.html` | self-contained portal (CSS + JS inline, ~69 KB) |
| `wenu-mandala.png` | central sigil (1200×1200 transparent ring) |
| `wenu-assets/wenu-bg-starmap.webp` | atmospheric background |
| `wenu-assets/wenu-center-portal-default.{webm,mp4}` | breathing cosmic loop at center |
| `wenu-assets/wenu-{n,e,s,w,ne,se,sw,nw,ne-wunelfe,w-lafken}.{webp,webm,mp4}` | 10 directional wallpapers |
| `index.html.before-night.bak` | backup before this night's autonomous overhaul |
| `AUDIT-FINAL.md` | every change applied + decisions + known gaps |

## Asset weight per visit (first paint)

| Layer | Size |
|---|---|
| HTML + inline CSS + JS | 78 KB |
| Cinzel Decorative + Cormorant Garamond + Share Tech Mono (Google Fonts) | ~50 KB |
| Mandala PNG | 110 KB |
| Wordmark PNGs (Wenü + Mapü textile) | 700 KB |
| Default portal video (WebM) | ~290 KB |
| Background starmap | 175 KB |
| **First paint** | **~1.4 MB** |

Other wallpapers and direction videos are lazy-loaded on hover/click.

## Configuration

### Where does "Enter Wenu Mapu" go?
Open `index.html`, search `SHOP_URL`. Default is `/shop`. Change to wherever your e-commerce lives. Both the **center mandala click** and the **skip-intro button** (bottom right of loader) go here.

### Audio
**Disabled.** The Tone.js procedural sound system (drone + wind + bell) was removed by design decision. Re-enable instructions are commented inline in `<head>` and at the bottom of `<script>`.

### Mobile
- Auto-adapts at ≤768px
- Touch detected via `(pointer: coarse)` media query — custom cursor + parallax disabled
- Tap targets enlarged with invisible padding (48×48 minimum)
- **Swipe down** in a deep portal to dismiss it (in addition to tap-anywhere + Return button + Esc)
- `touch-action: manipulation` prevents iOS double-tap zoom
- Star names always visible on touch (no hover to reveal)

### Session memory
After a visitor enters the shop (via mandala or skip), `sessionStorage.wenuPortalSeen='1'` is set. On reload in the same session, the loader accelerates.

### Accessibility
Respects `prefers-reduced-motion` — animations frozen, trail hidden, parallax disabled.

## To make this the site's landing page

**Option A — Redirect from root (simplest)**
Edit `public/_redirects`:
```
/  /experience/  302
```

**Option B — Replace root index (cleaner)**
Move `index.html` contents up to `public/index.html` and adjust asset paths from `wenu-assets/` to `experience/wenu-assets/`.

## Cultural content — fidelity protocol

The texts in `DEEP_CONTENT` were **rewritten on 2026-05-29** to strip invented "ancestral wisdom" framing and to keep only **documented Mapuche concepts**. Every entry follows this structure:

1. **Direct translation** of the Mapudungun term
2. **Cosmological position** (only where documented)
3. **Documented function** in Mapuche life
4. **No marketing romance** — no claimed connection between the term and Wenu Mapu's silver

The bottom of every deep portal carries the honest line:

> *Documented Mapuche terms · Spatial arrangement is editorial · Open to correction*

### What is documented vs editorial

| Term | Documented | Editorial |
|---|---|---|
| Antü = Sun | ✅ | Placement at N |
| Küyen = Moon | ✅ | Placement at S |
| Az Mapu = the way / custom law | ✅ | Placement at E |
| **Lafken = sea / west** | ✅ direction too | Cardinal-correct ✓ |
| Wün = dawn | ✅ | Placement at NE |
| Nag Mapu = middle world | ✅ | Placement at SE |
| Trawün = assembly | ✅ (spelling Trawün, not Trafün) | Placement at SW |
| Pewma = dream | ✅ | Placement at NW |
| Wüñelfe = Venus / 8-pointed star | ✅ | Inner orbital |
| Treng Treng & Kai Kai Vilu | ✅ origin myth | Inner orbital |

**Only Lafken** corresponds to its Mapuche cardinal position (West). The other 9 are documented cosmovisional terms grouped spatially for the interface, NOT Mapuche cardinals. Traditional Mapuche cardinals are: Puel (East), Pikun (North), Willi (South), Lafken (West).

### Suggested sources for review

| Author | Work | Relevant for |
|---|---|---|
| María Catrileo | *Diccionario Lingüístico Etnográfico de la Lengua Mapuche* | All Mapudungun spellings and definitions |
| Rolf Foerster | *Introducción a la religiosidad mapuche* | Wenu Mapu / Nag Mapu / Minche Mapu structure |
| Ana Mariella Bacigalupo | *Shamans of the Foye Tree* | Pewma, machi, ngen |
| Tom Dillehay | *Monuments, Empires, and Resistance: The Araucanian Polity and Ritual Narratives* | Trawün political function |
| José Ancan / CONADI archives | Various | Lafkenche territorial relationship |
| Andrés Lavanderos / various platería mapuche studies | — | Wüñelfe 8-pointed motif |

**Before public production launch**: have a Mapuche cultural consultant review the 10 portal texts and confirm or correct each one.
