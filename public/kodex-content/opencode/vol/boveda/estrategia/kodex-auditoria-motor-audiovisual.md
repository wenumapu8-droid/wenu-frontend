---
tipo: auditoria
proyecto: KODEX-∞
fecha: 2026-07-25
estado: espera-aprobacion-fase-1
autor: Claude (creative technologist)
---

# KODEX −∞ · Auditoría para la rearquitectura audiovisual

> Respuesta a la "primera respuesta que necesito de ti" del prompt maestro.
> NO se ha escrito código de motor. Esto es diagnóstico + plan por fases + Fase 1
> para aprobación de Ocin antes de implementar.

## Corrección al diagnóstico (hallazgos honestos)

Tres cosas del diagnóstico original no son exactas — y una lo es de más:

- **El shader de The Machine SÍ es WebGL real y funciona.** No es promesa: compila
  programas GLSL reales (spiral/julia/phyllotaxis/doble-espiral), corre un loop de
  render con uniforms `u_time/u_res/u_mouse/u_signal`, reacciona al mouse y vira a
  oro con la SEÑAL. Está en `index.astro` líneas ~1295–1448.
- **El FPS ES real.** Se calcula cada 500 ms (línea 1446). El "00 FPS" que ves es el
  estado inicial ANTES de que la sección entre en viewport (el loop se activa por
  IntersectionObserver para no gastar GPU). Antes de scrollear, muestra "00".
- **"COMPILING…" sí cambia** a "COMPILED OK" / "ERROR" / "NO WEBGL" al compilar
  (línea 1412). Pero persiste como placeholder hasta que scrolleas a la sección.
- **Lo que SÍ es falso / ausente:** la telemetría del HUD (RA/DEC/φ/hex) es
  decorativa, derivada del scroll, no astronomía real (esto lo hice yo — lo marco).
  Y sobre todo: **no hay audio, no hay instrumento, no hay motor global, no hay
  estado compartido.** Ese es el eslabón ausente real.

**Y la mejor noticia:** `three`, `gsap` y `lenis` YA están instalados en el proyecto
(package.json). No hay que agregar dependencias para construir el motor.

## Las 12 respuestas

**1 · Framework / arquitectura.** Astro 6.2.1 SSG, JS vanilla + WebGL crudo (sin
runtime de framework, sin React). KODEX es UN archivo monolítico:
`src/pages/kodex/index.astro` (~1650 líneas: data en frontmatter + HTML inline + un
`<style>` scoped + un IIFE gigante). Usa el layout `Base.astro`. Data compartida ya
extraída a `src/lib/kodex.js`. Deploy: Cloudflare Pages Direct Upload (runner M4),
branch `kodex-preview`, aislado de producción (`redesign-v2`).

**2 · Qué funciona de verdad.** Shaders WebGL de The Machine (reales). FPS (real).
Túnel canvas (real: estrellas+anillos, reactivo a velocidad de scroll, afterimage/
bloom, color por etapa). Machine Atelier (real: mirror/chroma/pixel-sort/glitch/
dither/scanlines sobre ImageData real, cadenas aleatorias). Visor de obra (7 efectos
canvas reales). Geometry + Flow (canvas reales). SEÑAL como llave (real: revela
códigos, vira túnel a rosa, decodifica teorema). Glitch/cipher (real, gated por
llave). Carga de obras (real, lazy). Portales, corazón-paradoja, gallery walk (reales).

**3 · Placeholders / simulaciones.** HUD RA/DEC/φ/hex = decorativo (scroll). Timeline
de descenso = progreso de scroll. "COMPILING…/00 FPS" pre-viewport. **Ausentes:**
audio (silencio total), control de parámetros por el usuario, encadenamiento de
efectos en UI/lab, motor global persistente (cada canvas es un demo aislado por
sección), máquina de estados E00/T01/M11/R10 (existe como texto/gray-code, no dirige
el sistema), guardado/exportación de especímenes, memoria local.

**4 · spiral.glsl.** No existe como archivo. Es un string GLSL inline en el array
`SHADERS` dentro del IIFE (HEAD + líneas). No hay carpeta `/src/kodex/shaders/`.

**5 · Por qué 00 FPS.** El FPS es real pero el loop se activa solo cuando el canvas
está en viewport (gating por IntersectionObserver, para performance). Fuera de vista =
"00". Fix honesto: mostrar "STANDBY" hasta que entre en vista.

**6 · Carga de obras.** Data-driven: `families`+`discoWorks` → `<img loading="lazy">`
con `/img/kodex/{dir}/{rep}.jpg`. Sin manifest, sin srcset responsive, sin WebP/AVIF
para las obras KODEX (son JPG), sin thumbnails. Los efectos leen los píxeles de las
imágenes ya cargadas (mismo origen → sin taint de canvas).

**7 · Scroll.** Scroll nativo del window. Un `onScroll` computa el progreso P → túnel/
HUD/timeline; + IntersectionObservers para reveals, ciclado gif, gating de render de
canvas, tecleo de terminal, decode del cipher. **Lenis (smooth scroll) está instalado
pero NO se usa en KODEX.** No hay GSAP ScrollTrigger en KODEX.

**8 · Lógica comercial mezclada.** KODEX usa `Base.astro`, que renderiza SIEMPRE
`<Cart />` (carrito + checkout + Venmo/Zelle/MercadoPago + pedidos), `<Immersive />`,
`<Analytics />` y los scripts de Kai. Aun con noNav/noFooter/noOverlays, el carrito
queda incrustado en el HTML/JS de KODEX. Ese es el acoplamiento. Fix: un layout
KODEX propio, sin componentes de comercio.

**9 · Dependencias reutilizables.** **three ^0.185.1** (motor — ya instalado),
**gsap ^3.15.0** (ScrollTrigger para sincronía narrativa), **lenis ^1.3.25** (smooth
scroll), **sharp** (procesar obras server-side → WebP/AVIF/thumbnails/variantes móvil
+ displacement/height maps), @fontsource. Mis funciones de efecto (atelier/visor) →
nodos de efecto. `src/lib/kodex.js` (data). Los strings GLSL → archivos .frag/.vert.

**10 · Riesgos técnicos.** (a) Performance: hoy varios canvas simultáneos, cada uno con
su loop rAF; sumado al pipeline multipass que pides = pesado en GPU/batería, sobre
todo móvil. (b) Límite de contextos WebGL del navegador (~8–16); hoy hay varios
contextos separados → el fix es UN contexto global. (c) Monolito de 1650 líneas →
modularizar. (d) Autoplay de audio (gate por gesto — lo resuelve el Signal Gate).
(e) Móvil: multitouch, orientación, reduced-motion/bass, batería. (f) Desacoplar
comercio sin romper la tienda Wenu Mapu. (g) Alcance: es una obra de varias fases;
cada fase debe ser desplegable y verificable (tu regla).

**11 · Plan por archivos.** Adoptar tu estructura `/src/kodex/` ADAPTADA a Astro +
vanilla (SIN React — el proyecto es vanilla; tus `*.tsx` → componentes Astro o módulos
vanilla). Motor en módulos TS/JS: `KodexEngine`, `RenderPipeline` (un solo contexto
WebGL2, multipass, feedback ping-pong), `EffectGraph`, `StateMachine`,
`InputController`, `AudioEngine`, `MemoryStore`, `ExportEngine`. Shaders como archivos
`.frag/.vert` reales. Un layout `KodexShell.astro` SIN comercio. Rutas: `/kodex`
(gate + mundo continuo) y `/kodex/lab`. Se conservan obras, data y filosofía; se
migran los efectos canvas que ya funcionan a nodos del motor. No borrar nada.

**12 · Propuesta Fase 1 (prototipo vertical).** Exactamente tu Fase 1:
- **Signal Gate** a pantalla completa: "KODEX −∞ · A LIVING AUDIOVISUAL SYSTEM" +
  [ ENTER WITH SOUND ] / [ ENTER SILENT ] + "Sound and graphics respond to your
  movement. Headphones recommended." Audio se activa SOLO tras el gesto.
- **Un canvas global persistente** `#kodex-world` (WebGL2, un solo contexto).
- **Un shader de espiral real** (extraído del inline actual a `spiralField.frag`).
- **Feedback ping-pong real** con render targets (frame A↔B).
- **Una obra Achroma como textura de entrada** (uniform sampler).
- **Puntero/touch** → uniforms (posición, velocidad).
- **Un paisaje sonoro** (Web Audio, iniciado por gesto): drone E00 (≈55 Hz) + ruido
  filtrado + analyser FFT que retroalimenta el bloom/displacement.
- **Telemetría REAL**: FPS real, resolución, shader activo, passes activos, seed.
  Nada falso; si un dato no existe, no se muestra.
- **Responsive + reduced-motion** (fallback a imagen/video pre-render).
- **Aislado del comercio**: layout `KodexShell.astro` sin `<Cart/>`.
- Se entrega en una ruta propia para revisión antes de la Fase 2.

## Fases siguientes (resumen)
F2 Effect Graph + Lab · F3 Narrativa viva (LiveSpecimens) · F4 Audio completo (4
estados + spatial) · F5 Specimen/Export + memoria · F6 Black Sun + Body as Coordinate
+ vínculo Wenu Mapu · F7 Optimización/QA/fallbacks. Cada fase desplegable y verificada.

## La frase que guía todo
> No hacer que la página PAREZCA viva. Construir procesos reales para que ESTÉ viva.
> The Whole te lleva por una historia; KODEX debe entregar un instrumento para
> modificar la historia mientras la atraviesas.

<!-- wenu-backlinks: [[Home]] · [[kodex-atlas-cosmogonico-hilo-conductor]] · [[kodex-sistema-madre]] -->
