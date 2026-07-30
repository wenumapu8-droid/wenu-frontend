# KODEX −∞ — Build Brief (documento único para Claude Code)

> Fuente única y autocontenida para elevar KODEX. Trabajás en `~/wenu-frontend`. Consolida todo:
> auditoría, arquitectura, storyboard, tokens, fuentes, efectos, pack SVG, Commission, ediciones.
> (Detalle extendido opcional en `~/Obsidian/WenuAgent/estrategia` y `/contenido`, pero acá está todo lo necesario.)

## 0. Reglas duras (guardrails)

- **Serializado:** un build por vez. Matá astro/wrangler/esbuild colgados. Lock `/tmp/wenu-deploy.lock`.
- **No romper la joyería:** `deploy-now.sh` verifica home/shop/products=174/gallery y aborta si falla. Nunca bajes ese conteo. `git push` NO despliega (Direct Upload).
- **Preservar, no reconstruir.** Auditar, conservar lo que sirve, editar/elevar. Documentar toda reconstrucción. No borrar obras/assets/animaciones sin justificar.
- **Verificar en vivo** en wenumapuonline.com (no en git). Provenance honesto: codeado / build ok / desplegado / verificado. Changelog + capturas desktop+móvil por etapa.
- **Ética Hidden Sky:** en COSMOLOGY, no mezclar cosmovisión mapuche documentada con ficción OVNI/New Age. **Provenance:** "Conceived and art-directed by Ocin / Wenu Mapu."

## 1. Estado actual (auditoría) — Preserve / Refine / Remove

El 70% ya existe: el engine (`scripts/kodex-engine.js`) tiene modelo de escenas Next/Prev + progreso + radar y referencia threshold/descent/archive/machine/cosmology/return. RETURN es fuerte. Existen works/archive, movement journeys, store/editions, world, folio. KodexShell aislado (sin Cart/Kai/UFO).

| PRESERVAR | REFINAR | ELIMINAR/CONSOLIDAR |
|---|---|---|
| Engine de escenas + progreso · RETURN · archive/works · KodexShell aislado · paleta | Nombrar 7 escenas + Index · MACHINE estados reales · logo→SVG · fullscreen móvil · 1 acento/escena · copy más breve | Estados falsos ("00 FPS","SOURCE —") · rutas duplicadas (world/index, editions/store) · ruido visual |

## 2. Arquitectura — 7 escenas

Recorrido SIN scroll vertical (scroll solo en overlays). URL por escena (`/kodex/#threshold`…), back/forward, deep-linking. Nav: Prev/Next/Index + progreso `00/07` + teclas + Escape. Overlays (focus trap, Escape, cierre visible, sin scroll del body): Index, ficha de obra, mapa de sistema, créditos, glosario, detalle de edición, **formulario de comisión**, ajustes audio/accesibilidad. Móvil: 100svh/dvh, safe-area, tap en botón principal, Prev/Next visibles.

## 3. Storyboard aprobado (AUTORITATIVO) — por escena: acento · motivo · copy · CTA

Tagline de cierre: **"YOU ARE THE SIGNAL. THE ARCHIVE REMEMBERS."**

| # | Escena | Acento | Motivo | Copy en pantalla | CTA |
|---|---|---|---|---|---|
| 00 | THRESHOLD · the gate opens | rojo | crosshair/target | "KODEX−∞ is a living audiovisual system connecting signal, matter, memory and generative code." / "Access the archive beyond the surface." | `ENTER THE KODEX` (+ discreto `OPEN INDEX`) |
| 01 | PROLOGUE · observe the signal | violet | iris/ojo dithered | "This is not a gallery. It is a system, and it descends. Each signal is a work — read it, generate from it, carry it. You choose the depth." (40–60 palabras) | `BEGIN OBSERVATION` |
| 02 | DESCENT · enter the depths | naranja | wireframe tunnel/vortex | "Leave the surface. Follow the signal into the depths." (saltable) | `START DESCENT` |
| 03 | ARCHIVE · explore the signals | multi | grid de ident cards | "Every signal has a genealogy: drawing → geometry → transformation → volume → matter → activation." Distinguir ARCHIVE WORKS vs GENERATIVE OUTPUTS. Selección limitada en fullscreen; archivo completo en Index. | `SELECT A SIGNAL` → Collect |
| 04 | MACHINE · generate new patterns | cyan | generador radial | "The system does not show you art. It makes it — from seed, method and source." Estados reales. | `GENERATE SIGNAL` → Commission |
| 05 | COSMOLOGY · connect the map | magenta | mapa orbital | "Nothing here stands alone. Signal becomes matter, matter becomes body, body becomes memory." Mapa: Signal·Matter·Body·Memory·Territory·Machine → Wenu Mapu·Soma·Disco Solar·Cosmic Serpent. | `REVEAL CONNECTION` |
| 06 | RETURN · restore the pattern | acid green | árbol (patrón restaurado) | "You did not reach the end. You became the return." / "The pattern is restored. The cycle continues." | `CHOOSE NEXT ACTION` → COLLECT · COMMISSION · EXPLORE |

MACHINE estados: `Initializing→Ready→Generating→Complete/Error/Reduced`. Lectura: `KDX-GEN-0482 · SEED 8F21-A90C · METHOD MIRROR/DITHER/ORBITAL FOLD · SOURCE ACHROMA-03 · STATUS COMPLETE`.

## 4. Design tokens (INTERFACE DNA)

```css
:root{
 --kdx-black:#0A0A0A; --kdx-surface:#111113; --kdx-dust-white:#EDEDED; --kdx-muted:#88888A;
 --kdx-line:rgba(237,237,237,.15);
 --kdx-cyan:#00F0FF;   /* data/sistema */    --kdx-acid:#B7FF00;  /* acción/progreso */
 --kdx-violet:#B770FF; /* archivo/neural */  --kdx-orange:#FF8A33; /* warning */
 --kdx-red:#FF3B33;    /* critical */
}
```
Regla: negro + dust-white = 85–90% de la UI; color = semántica; **un acento dominante por escena** (según storyboard). Grid base 8px, escala 4/8/16/24/32/48/96, 12 columnas, safe zones. Componentes con estados: status chips, buttons (Execute/Precute/Disabled/Danger), tabs, metadata tags, progress bars, alerts, badges, panels (default/data/alert/image/code), data tables (grilla 1px, hover, selected), scrollbars. Iconos stroke 1px/2px, geometría cuadrada, currentColor por estado. Frames: corner brackets + modular frames (1:1/4:3/16:9/21:9).

**Poster grammar (para ident-cards/posters/marketing, NO la UI):** registro acid-neon saturado (Signal Red #FF0033, Neon Cyan #08F0FF, Acid #39FF14, Violet #814DFF, Electric Pink #FF0CF0, Amber #FFAE00). Gramática: headline + visual anchor + data block + barcode + icon cluster + microtext + auth seal. "Everything is a signal." La UI va restringida/premium; la energía acid vive en posters/momentos.

## 5. Fuentes + efectos (todo OFL/MIT, liviano, self-host @fontsource)

- **KODEX SANS:** Space Grotesk (UI) + Archivo Expanded (headers). **KODEX MONO:** Departure Mono (IDs/seeds/coords, retro-terminal) + JetBrains Mono (ya está, data en volumen). Display all-caps tracking +10..+30; mono +0..+10; móvil ≥14px; `clamp()`.
- **Efectos (CSS/SVG/Canvas > WebGL; calcular 1 vez, no por frame en móvil):** dither → CanvasDither/ditherjs (procesar en build/carga). grain → SVG `feTurbulence` (0KB, estático). scanlines/CRT → CSS `repeating-linear-gradient`. text-scramble (readouts MACHINE) → soulwire TextScramble (~1KB). wireframe tunnel/vortex (DESCENT hero) → **OGL** (~8KB) o Canvas 2D perspectiva (no Three.js). animación → GSAP (gratis 2025) / Splitting.js. prefers-reduced-motion + audio opt-in siempre. Lazy-load por escena, cleanup de rAF al cambiar de escena.

## 6. Pack SVG — YA ESTÁ en `public/assets/kodex/` (integrar)

Vector puro, currentColor, viewBox, sprite (`kodex-sprite.svg`) con ids `kdx-logo/mark/infinity/eye/target/archive/serpent` + hero motifs (`pattern-tree`, `solar-disc`, `cosmic-serpent-emblem`, `signal-portal`, `archive-eye`, `cosmology-map`). 11 SVG por categoría + `kodex-tokens.css`. Integrar el sprite (`<use href="/assets/kodex/kodex-sprite.svg#kdx-logo">`), reemplazar el texto del logo en KodexShell. **Reconciliar `kodex-tokens.css` a INTERFACE DNA:** lime `#A6FF00`→`#B7FF00`, violet `#8A5CFF`→`#B770FF`, orange `#FF6A00`→`#FF8A33`, red `#FF3038`→`#FF3B33`, off-white `#E6E6E6`→`#EDEDED` (cyan ok). Todo usa currentColor → solo cambiar tokens. Este pack = también el producto "KODEX Graphic Kit" vendible. Falta pulido: kerning óptico del wordmark para gran formato (usable en web ya).

## 7. Commission a System (la palanca de dinero #1 — NO existe hoy, construir)

Overlay + `components/kodex/CommissionForm.astro`. Titular `COMMISSION A SYSTEM`. Copy: "Work with KODEX to build bespoke generative systems — visual identities, art direction, music & festival visuals, immersive microsites, WebAR and interactive experiences. Conceived and art-directed by Ocin / Wenu Mapu." CTA `REQUEST A SYSTEM`. Campos: tipo de proyecto · industria · objetivo · presupuesto · plazo · uso (comercial/artístico) · contacto · referencias. Conectar a Formspree/email. Precios = recomendación interna, NO públicos sin aprobar.
Las 3 direcciones (RETURN): COLLECT A FRAGMENT (drops limitados, autenticidad) · COMMISSION A SYSTEM · LICENSE A SIGNAL (licencias standard/extended, tiers). Sin popups de venta, sin urgencia/escasez falsa.

## 8. Ediciones a listar (ARCHIVE / Collect a Fragment)

En `/kodex/store`, con ident-card dossier (título·código·año 2026·técnica·estado·edición·procedencia·disponibilidad·certificado). Modelo: **descarga gratis (media-res, imán) + edición firmada/print pago**. Usar las obras B&W REALES de Ocin (Drive `book/0cin`), no mockups. Precios = recomendación, Ocin aprueba.
- KDX-ACH-001 STAR FRACTURE · KDX-ACH-002 MERIDIAN · KDX-ACH-003 BLOOM (ACHROMA) · KDX-ACH-004 SIGNAL LATTICE · KDX-ACH-005 MONOLITH (edición 25, MONOLITH 15).

## 9. Orden de implementación

1. **Integrar pack SVG** (sprite + logo en KodexShell) + reconciliar tokens.
2. **Fuentes** (Space Grotesk + Archivo Expanded + Departure Mono).
3. **Ordenar las 7 escenas** sobre el engine existente (copys + acentos del storyboard, Index, progreso, deep-linking, móvil fullscreen).
4. **Commission a System** (form + overlay).
5. **MACHINE estados reales**.
6. **COSMOLOGY map** (nodos → puertas al ecosistema).
7. **Ediciones** en /kodex/store (obras reales).
8. **Analítica GA4:** kdx_enter, scene_view, next/previous_scene, index_open, artwork_open/complete, generator_start/complete, commission_open/submit, edition_open, outbound_wenu/soma/cosmic, restart_journey. Embudo: landing→enter→archive→machine→return→commercial→submit.

Empezá por 1 y 2, mostrá capturas desktop+móvil, verificá criterios, y seguimos etapa por etapa.

## 10. WENU COCKPIT — panel privado de comando (última etapa, después del core KODEX)

Ruta `/kodex/panel` — **privado** (noindex, no linkeado desde el sitio público). Estética KODEX
dossier (mismos tokens, mono, dark). Es la "cabina única" de Ocin: todo el ecosistema de un vistazo.

**Contenido (paneles):**
- **KPI (North Star arriba):** Reservas/mes · Lista de email · Revenue/mes.
- **Windows** con estado real: KODEX · Joyería/Atelier · Gumroad · Pinterest · NFT.
- **Signal feed:** últimos eventos (build, ediciones, drops, mints, ventas).
- **Barra de progreso** del build en curso.

**Datos — regla dura: CERO fake data, estados honestos** ("◷ AWAITING SIGNAL" hasta conectar la fuente):
- **Ya disponible ahora:** ventas/órdenes de WooCommerce (usar `fetchAllOrders`/orders en `src/lib/woo.ts`),
  conteo de productos/ediciones/print drops, estado NFT (Manifold), Pinterest. Esos cards muestran real.
- **Awaiting:** Reservas + tráfico → GA4 (cuando se conecte). Lista de email → API MailerLite (cuando exista).
Cada número entra cuando su fuente está conectada; hasta entonces, estado "awaiting", nunca inventado.

Construir DESPUÉS de terminar el core de KODEX (escenas + Commission + ediciones). Prioridad menor
pero alto valor para Ocin (evita tener todo disperso). Mockup de referencia: cabina con KPI cards,
Windows con status dots, signal feed y progress bar, todo en paleta INTERFACE DNA.

## 11. OBSERVE prototype (Visual Engine v1 — YA integrado, wire al PROLOGUE)

El prototipo del organismo OBSERVE (escena PROLOGUE, ojo procedural WebGL) ya está en el repo en
`public/kodex-observe/`:
- `standalone/` — demo funcional (index.html + kodex-observe.js + css) que carga
  `shaders/observe.frag.glsl` + `fullscreen.vert.glsl`. Live en `/kodex-observe/standalone/` tras deploy.
- `astro/` — `KodexObserveScene.astro` + `kodex-observe-client.ts` + css, LISTO para integrarse como
  la escena **01 PROLOGUE** del viaje KODEX (reemplaza/mejora el efecto actual del ojo).
- `scene-recipes.json` — recetas de las 7 escenas (accent + source + behaviors) = base del Visual Engine.
- `kodelife/` + `GUIDE.md` — el .frag para KodeLife + guía.

**Tarea:** integrar `astro/KodexObserveScene.astro` como la escena PROLOGUE (respetando el storyboard:
violet, ojo, "you are the signal", CTA BEGIN OBSERVATION). Es el primer organismo del motor visual
parametrizado — el resto de escenas (threshold/descent/archive/machine/cosmology/return) siguen el
mismo patrón con su receta. Spec del motor: `~/Obsidian/WenuAgent/estrategia/kodex-visual-engine-v1-spec-2026-07-29.md`.
Performance: DPR cap, pausar offscreen, prefers-reduced-motion, audio opt-in (ya contemplado en el client).

## Criterios de aceptación

Recorrido sin scroll vertical · cada escena en el viewport · una acción primaria por escena · el usuario siempre sabe dónde está · móvil no depende de hover · funciona sin audio y con reduced-motion · obras con procedencia clara · Archive Works vs Generative Outputs diferenciados · MACHINE con estados reales · RETURN con rutas comerciales · embudo medido · premium, no plantilla cyberpunk · trabajo existente no destruido · changelog completo.
