---
tipo: auditoria-plan
proyecto: KODEX −∞ / Wenu Mapu
fecha: 2026-07-28
foco: Fase 1-2 del prompt maestro — auditoría, arquitectura, monetización, plan técnico
estado: diagnóstico listo · NO reconstruir hasta aprobar
relacionado: [[kodex-alien-archival-operating-system-2026-07-29]]
---

# KODEX −∞ — Auditoría y plan maestro (Fase 1-2)

> Hecho ANTES de tocar código, como pide el prompt y nuestra regla de preservación. La
> implementación pesada (Fase 5) es tarea de Claude Code en casa, por etapas, con changelog.

## 1. Resumen del estado actual (verificado en el código vivo)

KODEX ya está vivo en `wenumapuonline.com/kodex`, aislado del comercio de joyería (KodexShell,
sin Cart/Kai/UFO). El engine (`kodex-engine.js`) YA tiene un modelo de escenas/deck con navegación
Next/Prev, progreso y radar, y YA referencia los nombres del viaje que pide el prompt (threshold,
descent, archive, machine, cosmology, return). La secuencia RETURN está muy desarrollada (7
movimientos, Canvas 2D generativo). Existen: archive/works (18 obras), movement journeys
(achroma/tribe/disco), store/editions, world, folio. Paleta cyan/lime sobre negro = la del board.

**Conclusión:** el 70% de la estructura que pide el prompt YA EXISTE. Esto es una ELEVACIÓN, no
una reconstrucción. El trabajo real está en: ordenar las escenas con nombres/progreso claros,
darle estados REALES a la máquina, reconstruir el logo como SVG, construir la **monetización
(Commission a System)** que hoy no existe, y el mapa de cosmología.

## 2. Preserve / Refine / Remove

| PRESERVAR (no tocar) | REFINAR | ELIMINAR / CONSOLIDAR |
|---|---|---|
| Engine de escenas Next/Prev + progreso | Nombrar las 7 escenas (00–06) con Index claro | Estados falsos de la máquina ("00 FPS", "SOURCE —") |
| Secuencia RETURN (excelente) | MACHINE: estados reales (Initializing/Ready/Generating/Complete/Error) | Rutas duplicadas: consolidar `world` vs `index`, `editions` vs `store` |
| Archive/works + movement journeys | Logo KODEX −∞ (hoy texto) → **SVG** (wordmark, símbolo K−∞, lockups) | Datos irrelevantes/ruido visual que no comunican función |
| KodexShell aislado (sin comercio/Kai/UFO) | Fullscreen móvil correcto (100svh/dvh, safe-area) | Animaciones que bloquean navegación |
| Paleta cyan=data / lime=acción | Un solo acento dominante por escena | |
| Efectos in-place + terminal cyberpunk | Copy: más breve por escena, profundidad en overlays | |

## 3. Arquitectura propuesta (7 escenas → mapeo a lo existente)

Recorrido sin scroll vertical; scroll solo en overlays. URL por escena (`/kodex/#threshold` …).

| # | Escena | Existe hoy | Acción primaria (UNA) | Ruta comercial asociada |
|---|---|---|---|---|
| 00 | THRESHOLD | index (parcial) | ENTER THE SYSTEM | — |
| 01 | PROLOGUE | falta (nuevo, corto) | BEGIN DESCENT | — |
| 02 | DESCENT | descent (parcial) | DESCEND (saltable) | — |
| 03 | ARCHIVE | works/archive ✓ | SELECT A SIGNAL | Collect a Fragment |
| 04 | MACHINE | efectos ✓, estados falta | GENERATE SIGNAL | Commission a System |
| 05 | COSMOLOGY | falta mapa | REVEAL CONNECTION | Explore ecosystem |
| 06 | RETURN | return.astro ✓ (fuerte) | CHOOSE NEXT ACTION | Collect / Commission / Explore |

Navegación: Prev/Next/Index + progreso 02/06 + teclas + deep-linking + back/forward. Overlays
(Escape para cerrar, focus trap): Index, ficha de obra, mapa de sistema, créditos, glosario,
detalle de edición, **formulario de comisión**, ajustes de audio/accesibilidad.

## 4. Monetización (el corazón del pedido — jerarquía Experiencia→Confianza→Acción)

KODEX como **activo digital de lead-gen** ("dinero trabajando solo"). Prioridad, en orden:

1. **Commission a System (Prioridad 1 — construir primero).** No existe hoy. Es la vía más rápida
   a dinero real: alto ticket, bajo inventario, KODEX es el demo/portfolio vivo. Entregar: una
   oferta clara (identidad, dirección de arte, visuales para músicos/festivales/marcas, micrositios,
   WebAR) + **formulario** (tipo de proyecto, industria, objetivo, presupuesto, plazo, uso, contacto,
   referencias). Precios como recomendaciones internas, no públicos sin aprobar.
2. **Collect a Fragment (MVP de ediciones).** Reusar `editions`/`store`: prints firmados, loops,
   piezas numeradas por seed, certificado de autenticidad. Escasez SOLO si es real.
3. **License a Signal.** Ruta para licenciar visuales (álbumes, festivales, campañas, moda).
4. **Explore the Ecosystem.** Puertas a Wenu Mapu / Soma / Disco Solar / Cosmic Serpent. Aquí KODEX
   cumple su rol de "ventana": deja entrar flujo y lo reparte al resto del universo.

Sin popups de venta, sin urgencia falsa, sin contadores falsos. La acción comercial aparece como
consecuencia natural del viaje (sobre todo en RETURN).

## 5. Plan técnico + archivos a modificar

Modular, separando: scene shell, navigation, progress, index, overlay manager, artwork viewer,
machine interface, cosmology map, return actions, analytics, accessibility, motion, asset loader.
Archivos probables: `layouts/KodexShell.astro`, `scripts/kodex-engine.js`, `styles/kodex.css`,
`pages/kodex/index.astro`, nuevos: `components/kodex/CommissionForm.astro`, `CosmologyMap.astro`,
`assets/kodex/logo/*.svg`. Analítica: eventos `kdx_enter`, `scene_view`, `generator_complete`,
`commission_open/submit`, `outbound_wenu/soma/cosmic`, `restart_journey` (GA4).

## 6. Riesgos

- Colisión con la sesión del terminal (misma base de archivos) → serializar, una sesión por vez.
- Romper la joyería viva en un deploy → `deploy-now.sh` verifica 174 productos, no saltarlo.
- Sobre-ingeniería: no construir las 10 features de mediano plazo ya; MVP primero.
- Performance móvil: no cargar todas las obras/3D al inicio; lazy load por escena.
- Ética Hidden Sky en COSMOLOGY: no mezclar mapuche documentado con ficción.

## 7. Orden de implementación (por impacto/esfuerzo)

1. **Logo SVG** (wordmark + símbolo K−∞ + lockups) — base de identidad, bajo esfuerzo, alto impacto.
2. **Ordenar las 7 escenas** con Index + progreso + deep-linking sobre el engine que ya existe.
3. **Commission a System** (oferta + formulario) — la palanca de dinero #1.
4. **MACHINE con estados reales** (matar datos falsos).
5. **COSMOLOGY map** (conecta el ecosistema — el rol "ventana").
6. **Analítica + embudo** (para el loop de aprendizaje: qué escena convierte).
7. Editions/License como iteración siguiente.

Cada etapa: changelog + capturas desktop/móvil + verificar criterios de aceptación. Este doc es el
brief para Claude Code. Yo puedo redactar los copys de escena, la oferta de Commission y el
contenido; la implementación de código va por Claude Code en casa, serializada.
