---
tipo: design-system + tokens
proyecto: KODEX −∞
fecha: 2026-07-28
fuente: board "KODEX−∞ / INTERFACE DNA v1.0" aprobado por Ocin
estado: tokens listos para Claude Code — SUPERSEDE la paleta simple del brief anterior
---

# KODEX −∞ — Design tokens (INTERFACE DNA v1.0)

> Extraído del board aprobado. Esto es la Fase 3 del prompt maestro. Claude Code implementa
> estos tokens en `styles/kodex.css`. Regla madre: **negro + dust-white = 85–90% de la UI; cada
> color tiene SIGNIFICADO semántico, no decorativo; un acento dominante por escena.**

## Color system (semántico — cada color = una función)

```css
:root {
  --kdx-black:        #0A0A0A; /* background, depth */
  --kdx-surface:      #111113; /* paneles */
  --kdx-dust-white:   #EDEDED; /* text, UI, structure */
  --kdx-muted:        #88888A; /* texto secundario */
  --kdx-line:         rgba(237,237,237,0.15); /* bordes/retículas */
  --kdx-cyan:         #00F0FF; /* DATA, scanning, tech */
  --kdx-acid:         #B7FF00; /* BIO/organic/ACTIVE — señal, acción, progreso */
  --kdx-violet:       #B770FF; /* neural, unknown, ARCHIVE */
  --kdx-orange:       #FF8A33; /* WARNING, accent, energy */
  --kdx-red:          #FF3B33; /* ALERT, critical, threat */
}
```
Uso: acción/progreso/activación = acid green. Data/coordenadas/sistema = cyan. Archivo/neural =
violet. Warning = orange. Critical/threat = red. NO usar todos juntos en un componente.

## Tipografía (dos niveles)

- **Display** ("KODEX SANS" en el board) = geométrica, para títulos, sellos, momentos ceremoniales.
  Pesos Regular/Medium/Bold. Display en all-caps con **tracking +10 a +30**. Escala fluida `clamp()`.
- **Mono** ("KODEX MONO") = data, código, labels, coordenadas, navegación. **Tracking 0 a +10**.
- Móvil: nada < 14px; cuerpo 16–20px. No textos largos en mayúsculas.
- **Fuentes ELEGIDAS (todas OFL / uso libre comercial, self-host vía @fontsource o Fontsource):**
  - **KODEX SANS (display/UI):** **Space Grotesk** (cuerpo/UI, el registro editorial-técnico) +
    **Archivo Expanded** (headers grandes / "placa de datasheet-dossier").
  - **KODEX MONO (data/coordenadas/código):** **Departure Mono** (acento retro-terminal pixel/CRT,
    para IDs/seeds/coordenadas/timestamps — es LITERALMENTE el feel dossier) + **JetBrains Mono**
    (ya cargada, para data en volumen). Bajar Departure Mono de departuremono.com oficial (OFL 1.1).
  - Descartadas por no-premium/gamer: Rajdhani, Michroma. Descartada por PAGA: Berkeley/TX-02.

## Espaciado y grid

Base **8px**. Escala: 4 · 8 · 16 · 24 · 32 · 48 · 96. Grid de **12 columnas**. Safe zones:
title-safe / content-safe / edge-safe (respetar en cada escena fullscreen).

## Componentes (estados definidos en el board)

- **Status chips:** Active (acid) · Idle · Scanning (cyan) · Archived (violet) · Warning (orange) · Critical (red).
- **Buttons:** Execute (default) · Precute · Disabled · Danger (red). Borde 1px, mono, all-caps.
- **Tabs:** Overview / Data (cyan activo) / Analysis / Archive / Config.
- **Metadata tags:** SUBJECT · SPECIMEN · LOCATION · ARCHIVE · THREAT LVL · CLEARANCE (formato `S-001`).
- **Progress bars:** 0/25/50/75/100%, relleno acid.
- **Alert labels:** Info · Warning · Alert · Critical · Lockdown (violet).
- **Data badges:** New · Updated · Verified (acid) · Deprecated (orange) · Unknown.
- **Panel shells:** Default · Data · Alert (red) · Image · Code — barra de título 20px, padding 8px, controles arriba-derecha.
- **Data tables:** grilla 1px, row hover, row selected (color de estado), mono.
- **Scrollbars** finas estilo sistema.

## Iconografía

Familia por grupo: system · navigation · data · actions · status · misc. Reglas: stroke **1px/2px**,
geometría cuadrada, alineación óptica a grilla 1px, **color de señal según estado**.

## Frames y módulos gráficos

- **Corner brackets** (6 estilos 00–05) + **modular frames** en 1:1 / 4:3 / 16:9 / 21:9.
- **Módulos visuales:** crosshairs, concentric circles, spiral fields, waveform modules,
  **dither (fine/medium/heavy)**, pixelate, glitch, **scanline texture (light/medium/heavy)**.
- Todo en **SVG/CSS/Canvas**, no imágenes rasterizadas. Comunican función (orientación, selección,
  progreso, estado, activación), no ornamento.

## Logo lockups (a reconstruir en SVG)

Primary `KODEX−∞` · Secondary · Compact `KX−∞` · Symbol mark `∞` · Stacked. + outline/stencil/mono +
claro/oscuro + favicon. NO usar los PNG como final.

## Nota

Estos tokens REEMPLAZAN la paleta simple (solo lime+cyan) del brief anterior. La energía acid-Y2K
de las otras refs se usa en MOMENTOS, no en toda la UI: este INTERFACE DNA es el sistema base, y es
contenido/premium (negro+dust-white dominan, color = semántica).

## Poster grammar v2.0 (para posters/dossier/marketing — NO la UI)

Board aprobado "KODEX−∞ Visual System v2.0". Dos REGISTROS distintos, no mezclar:
- **UI (INTERFACE DNA, arriba):** restringido, premium, color = semántica, lime/cyan como acento.
- **POSTER/DOSSIER (esto):** acid-neon saturado sobre negro, alto contraste, para ident-cards del
  ARCHIVE, posters, pines de Pinterest, flyers de drops/eventos. Es donde vive la energía acid.

**Poster palette (saturada — para posters, no UI):** Signal Red #FF0033 · Neon Cyan #08F0FF ·
Acid Green #39FF14 · Violet #814DFF · Electric Pink #FF0CF0 · Amber #FFAE00 · Off-White #E6E6E6 +
gradiente neón espectral (signal flow).

**Gramática del poster (7 partes):** 01 Headline (display condensada, tracking tight, all-caps) ·
02 Visual anchor (imagen/símbolo, alto contraste, centro) · 03 Data block (cat/id/origin/status/
notes) · 04 Barcode strip (siempre presente) · 05 Icon cluster · 06 Microtext (legends/warnings/
citations) · 07 Auth seal (sello de autenticación alado). Reglas: high contrast, CRT/bitmap texture,
data has hierarchy, **everything is a signal**.

**Texturas/treatments:** CRT scanlines · bitmap noise · paper fiber · thermal map · glitch/error ·
datamosh. **Auth seal:** emblema alado estampado por color = "each stamp is a promise".

Aplicación: la ident-card de cada obra (escena ARCHIVE) usa esta gramática de dossier. Y la skill
`wenu-editorial` puede generar posters/pines de KODEX con esta gramática (headline + anchor + data
block + barcode + seal) para el marketing del ecosistema.
