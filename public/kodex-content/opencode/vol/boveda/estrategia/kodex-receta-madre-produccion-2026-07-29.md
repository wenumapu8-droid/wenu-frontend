---
tipo: canon-produccion
proyecto: KODEX −∞
fecha: 2026-07-29
foco: RECETA MADRE — sistema de producción visual (biblia para toda escena futura)
estado: canon · toda escena KODEX se aprueba contra esto
---

# KODEX — Receta Madre de producción

> La meta no es una página: es un **motor visual KODEX**. Toda escena futura (posters, pantallas,
> shaders, UI, apps, escenas vivas) sale con el mismo ADN. Consolida y confirma lo ya especificado
> ([[kodex-visual-engine-tandas-2026-07-29]], [[kodex-design-tokens-2026-07-28]], el storyboard).

## 1. Las 5 capas
Editorial (tipo/posters/grillas/microtexto) · UI/HUD (chips/labels/barras/índices/nav/status) ·
Visual viva (shaders/órbitas/partículas/wireframes/scan/distorsión/feedback) · Narrativa (cada
escena = propósito + estado + transición) · Sistema (código reusable, tokens, modular, testing, perf).

## 2. Fórmula universal de escena (la joya)
`KODEX SCENE = (1 visual anchor) + (1 composition system) + (1 data system) + (1 shader logic) +
(1 motion attitude) + (1 texture stack) + (1 state machine) + (1 transition ritual)`
Por eso es replicable sin empezar de cero. **En una línea:** *diseña como póster, compón como
dossier, anima como sistema, renderiza como memoria viva.*

## 3. Regla de oro
No funciona por "un gran diseño", sino por **consistencia entre muchos sistemas cerrados**: paleta,
tipografía, familias de layout, tratamientos de imagen, tipos de shader/movimiento/interacción/datos/transición.

## 4. Stack
Astro (páginas) + TS (lógica) + CSS módulos/variables (tokens) + SVG (glifos/retículas/sellos) +
WebGL/GLSL (visual) + Web Audio (opcional). Motor: **Three.js como infraestructura + GLSL custom
como corazón** (no "escenitas 3D"; sí soporte de shaders/FBO/uniforms/render loop). Multipass.

## 5. Tokens (cerrar UNA vez)
Colores: bg-0 #050507 / bg-1 #0a0a0d / bg-2 #101014 · white #e8e5df · muted #8c8a86 · red #ff3833 ·
orange #ff6a00 · cyan #00d8ff · green #a7ff00 · violet #8b5cf6 · magenta #ff00c8 · grid/line/panel/border rgba.
(Nota: reconciliar con INTERFACE DNA — misma familia; usar UN set canónico.) Tipo 3 niveles:
Display condensada/pesada/mayúsculas · Mono interface (labels/protocolos/coords) · Microcopy densa.
Spacing 4/8/12/16/24/32/48/64/96. Radius casi 0. Bordes 1px, esquinas técnicas.

## 6. Pipeline de render (7 pasos)
1 Base visual (ojo/túnel/árbol/grid) → 2 Deformación (warp/ripple/parallax/noise) → 3 Signal
(waveform/crosshair/orbital/HUD) → 4 Dither/bitmap → 5 CRT/scanline/vignette → 6 Feedback temporal
(ping-pong FBO: persistencia/eco/memoria) → 7 Composite (glow sutil/chroma fringe/contraste).

## 7. Uniforms estándar (todas las escenas)
u_time,u_delta,u_resolution,u_pointer,u_pointerVelocity,u_scrollProgress,u_sceneProgress,u_transition,
u_state,u_seed,u_intensity,u_audioLow/Mid/High,u_feedbackAmount,u_devicePixelRatio,u_reducedMotion.

## 8. State machine
`idle → aware → locked → active → transitionOut`. La escena TIENE comportamiento, no loops infinitos decorativos.

## 9. Motion (intencional)
**Un movimiento protagonista por vez.** Scan 1.5–2.5s · Pulse 3–7s · Orbit 8–24s · Drift perpetuo micro ·
Lock 0.6–1.2s · Reveal stagger corto · Feedback muy controlado. NO mover todo junto, ni glow excesivo,
ni loops sin narrativa.

## 10. Composición
Desktop: NO texto-izq/imagen-der/botón-abajo. SÍ headline monumental superpuesto, visual que invade,
rails laterales, metadata incrustada, lámina editorial + pantalla operativa. Mobile: composición
PROPIA (no reducir desktop), nav inferior fija, cero scroll vertical, una escena = un viewport.

## 11. Traducir ilusiones ópticas (Fabio Kohler) a código
No copiar el dibujo — traducir a lógica geométrica: corredor que se divide = grilla en perspectiva +
2 puntos de fuga + mezcla de campos + curvas por función + máscara de profundidad. Piso ondula =
grid + displacement seno+noise. Doble dirección = 2 SDF + morph + máscara dual según pointer/state.

## 12. Test de aprobación (NO por "corre")
A 2m: ¿se siente KODEX? · 1m: ¿jerarquía clara? · de cerca: ¿microdetalle real? · mobile: ¿aguanta? ·
en pausa: ¿funciona como póster congelado? · en movimiento: ¿la animación aporta lectura o distrae?
**Regla: aprobar por fidelidad al lenguaje KODEX, no solo por funcionar.**

## 13. Performance (3 perfiles)
FULL (desktop, multipass completo) · BALANCED (mobile bueno) · LOW-POWER (base+composite, sin audio
complejo). Regla: si hace falta, se reduce complejidad del shader, NUNCA la identidad/composición.

## 14. Sprint order (lo que produce Wenu Agent)
Sprint 1 base del sistema (tokens + overlay universal + state machine + multipass base + debug `?debug=1`)
→ Sprint 2 **OBSERVE V2 a nivel referencia** (úsalo como plantilla del motor) → Sprint 3 DESCENT
(grids/ilusión óptica) → luego ARCHIVE/MACHINE/COSMOLOGY/RETURN → integración total (transiciones/index/progreso).
"Si OBSERVE sale bien, el resto ya no nace en el vacío."

## Nota de estado
Ya tenemos: el prototipo OBSERVE (≈ OBSERVE V2, en `public/kodex-observe/`), el SPATIAL v1
(`public/kodex-spatial/`), tokens, storyboard, y el sitio KODEX en build por Claude Code. Esta receta
NO agrega scope nuevo — es el estándar de calidad contra el que se aprueba cada escena.
