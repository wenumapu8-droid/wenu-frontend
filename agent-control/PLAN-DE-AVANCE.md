# 🌙 Plan de Avance — Wenu Mapu

**Creado:** 2026-05-17
**Para:** cualquier modelo IA (Claude, Codex, GPT, Gemini, OpenCode) que tome el trabajo.
**Cómo usar este doc:** leélo entero antes de tocar nada. Es el punto de entrada único.
Para detalle técnico ver `CURRENT_STATE.md`; para el backlog formal ver `TASK_QUEUE.md`.
Este doc los conecta y dice **qué hacer esta noche y cómo seguir avanzando**.

---

## 1. El ecosistema en una pantalla

Wenu Mapu tiene **tres sistemas** que se tocan pero viven separados:

| # | Sistema | Dónde | Qué es | Estado |
|---|---|---|---|---|
| A | **Sitio web** | `~/wenu-frontend` (branch `redesign-v2`) | Astro SSG, preview en `redesign-v2.wenu-frontend.pages.dev` | Vivo, en rediseño |
| B | **Clasificador de fotos** | `~/wenu-platform` (SPA `:3335/classify/ui/`) | Triagea ~21k fotos del disco LaCie contra el inventario | Vivo, en uso manual |
| C | **Inventario NocoDB** | Docker `:8080`, base `pbmsibdovaalqw4` | 89 piezas reales (fuente de verdad de productos) | ✅ Inventario terminado |

**Regla de oro:** la dueña (Marimari) clasifica fotos a mano en el clasificador (B).
Los modelos **no** clicamos 21k fotos — apoyamos construyendo herramientas, optimizando,
auditando y avanzando el sitio (A). NocoDB (C) es solo-lectura para los modelos.

---

## 2. Qué ya está hecho (no rehacer)

- ✅ Inventario NocoDB cerrado — 89 piezas (84 RAW, 5 SOLD OUT).
- ✅ Sitio `redesign-v2` desplegado en Cloudflare Pages (preview, HTTP 200).
- ✅ Centro de mando construido (`command-center/`, puerto 7878).
- ✅ Clasificador funcional — 310 fotos asignadas, 20.797 pendientes (manual de la dueña).
- ✅ Intake de imágenes ChatGPT: 7 assets nuevos optimizados a `public/img`
  (ver `docs/chatgpt-image-classification.md`), 15 MB ahorrados.
- ✅ Sistema de assets read-only: `npm run assets:inventory` / `assets:board` / `assets:brand-library`.
- ✅ Subagente `wenu-curador-fotos` creado (`~/.claude/agents/`) — cura las fotos
  finales de cada pieza NocoDB y las deja listas para subir. Salida en
  `~/wenu-platform/.runtime/curated-product-photos/`. NO publica en WooCommerce (carril rojo).

### Turno nocturno 2026-05-18 (Claude, autónomo)

- ✅ **A5** — 24 fotos lifestyle de `~/Downloads/modelos/` ingresadas y optimizadas a
  `public/img/lifestyle/` (WebP+AVIF, 54.6 MB ahorrados). Clasificación en
  `docs/modelos-lifestyle-classification.md`. NO conectadas a páginas (decisión de marca).
- ✅ **A3** — bug real arreglado: `/collection` y `/material` usaban clases CSS
  inexistentes (`archive-card__media/__copy`). Alineadas a `archive-card__img-wrap/__body`.
  Fix de CLS + estilo. Build verde.
- ✅ **A6** — auditoría de consistencia visual en `docs/audit-visual-consistency-2026-05-18.md`.
- ✅ **B1/T1** — seguridad NocoDB: `~/wenu-platform/SISTEMA-CLASIFICADOR.md` ya no contiene
  el valor `nc_pat_`; apunta a `~/wenu-platform/.env`. Confirmado `NOCODB_TOKEN` presente
  en `.env` sin imprimir su valor.
- ✅ **T2** — bug-hunt BEM markup↔CSS: 18 huérfanas revisadas. Bug real arreglado en
  `archive-card__title/sub/cta`; 15 falsos positivos/no-layout documentados en
  `docs/css-orphan-bem-audit-2026-05-18.md`. Build verde: 96 páginas, postbuild OK.
- ✅ **T3/B2** — NocoDB compose versionado en `~/wenu-platform/docker-compose.yml` usando
  volumen externo `nocodb_data -> /usr/app/data`, sin tocar el contenedor activo.
  README corto en `~/wenu-platform/NOCODB_DOCKER_README.md`. `docker compose config` OK.
  Build frontend verde: 96 páginas, postbuild OK.
- ✅ **T4/B4** — prototipo de generador de láminas técnicas en `~/wenu-platform` creado:
  HTML+SVG oscuro de marca, export PNG/PDF con `puppeteer-core`, datos NocoDB read-only.
  Ver `TECHNICAL_SHEETS_README.md`. Prueba `WM-HAN-001` exportada en `.runtime/technical-sheets-final/`.
  Build frontend verde: 96 páginas, postbuild OK.
- ✅ **Pasada de calidad** — `public/img` no tiene imágenes >800KB; no se corrieron
  optimizadores masivos. Auditoría de links/assets en `dist`: 97 HTML revisados, 0 rotos.
- **Sin commitear:** el repo tiene archivos sucios pre-existentes de otros agentes;
  no se hizo `git commit` para no mezclar. La dueña revisa y commitea. Todo pasa build.

### Turno nocturno 2026-05-19 (Claude, clasificador wenu-platform)

Trabajo sobre el clasificador de fotos en `~/wenu-platform` (no toca este repo).
Handoff completo en `~/wenu-platform/.runtime/HANDOFF-CLASIFICADOR-2026-05-19.md`.

- ✅ **PENDING bajó de 20.452 → 8.048** (−60.7%). ASSIGNED 655 → 1.145 (+490).
  TRASH 84 → 11.990 (+11.906).
- ✅ **7 scripts versionados** en `~/wenu-platform/scripts/`: md5-twins,
  bulk-trash-folders, classify-as-branding, auto-assign-sku-in-filename,
  folder-trash-report, analyze-remaining, cluster-canonicals-report.
- ✅ **Trash en 3 olas**: 10.782 (backups WP, _ERROR, IG export, AliExpress) +
  994 (SOMA brand, budisa brand, IG cache /tmp) + 130 (_BASURERO, paths con
  "instagram").
- ✅ **Classify-as-branding en 2 olas**: 416 fotos marcadas `kind=branding`
  (30_MARKETING, Identidad 2026, 3er Revisor, Wenu Fase 1/3, Colección 2022
  Branding, _DISEÑO).
- ✅ **Auto-asign por SKU en filename**: 38 fotos en 15 SKUs (WM-LAB/PLG/HAN/
  RNG/SEP).
- ✅ **Reporte de clústeres** en `.runtime/cluster-canonicals.md`: 671 clústeres
  md5 (ahorro 813 clicks) + 704 phash (ahorro 913 clicks) — la dueña debería
  clasificar las canónicas grandes primero para maximizar propagación.
- ⚠️ **B5 bloqueado**: Vision IA batch necesita `OPENAI_API_KEY` o
  `ANTHROPIC_API_KEY` en `~/wenu-platform/.env`. Sin eso, ranking de
  sugerencias es heurístico.
- ⚠️ **NocoDB API**: tuvo flap (`ERR_INTERNAL_SERVER`) que se resolvió solo
  hacia el final de la sesión. La SPA siguió funcionando.
- ✅ **pHash similarity local (B3 versión local)** — script
  `scripts/phash-suggest-from-assigned.mjs` compara cada PENDING con las 597
  ASSIGNED foto-macro. Auto-asignó 18 con dist ≤ 2; dejó 142 sugerencias para
  revisión manual en `.runtime/phash-suggestions.md`.
- ✅ **Content drafts** (territorio Claude, no choca con código):
  - `reports/ig-captions-batch-2026-05-20.md` — 6 captions IG nuevos
    (Witral Vilu, septum como umbral, saddle plugs, pickup Truckee, tunnels,
    custom orders).
  - `src/content/journal/the-witral-thread.md` — entrada de journal sobre el
    witral mapuche y el lukutuel diamond. ~612 palabras, schema válido.

---

## 3. Carriles — quién hace qué

| Carril | Quién | Tareas |
|---|---|---|
| 🔴 **Rojo — solo humano** | Marimari | Dashboards Cloudflare, DNS, `sudo`, cutover de producción, escribir en WooCommerce, rotar tokens, clasificar fotos a mano |
| 🟢 **Verde — agentes libres** | cualquier modelo | Optimizar imágenes, escribir/arreglar código Astro con scope claro, auditar, redactar contenido, generar reportes, mejorar el clasificador |
| 🟡 **Amarillo — agente propone, humano aprueba** | modelo + Marimari | Cambios de copy de negocio, borrar/fusionar piezas, decisiones de diseño grandes |

Boundaries duros (nunca tocar): `.env*`, secretos, `public/aftercare/`, `src/lib/woo.ts`
(salvo necesidad explícita), `.gitignore`, DNS, deploys de producción. Ver `DO_NOT_TOUCH.md`.

---

## 4. Tareas priorizadas y paralelizables

Tres frentes que pueden avanzar **en paralelo** sin pisarse. Cada tarea dice su carril.

### Frente A — Sitio web (performance + assets)

- [x] **A4.** ~~Arreglar `src/pages/sets.astro` — preloadImage~~ — ya resuelto en Ronda 4. *(P7.8)*
- [x] **A3.** ~~width/height en imgs~~ — hecho 2026-05-18. El problema real era un
  mismatch de clases CSS, no atributos faltantes. Ver turno nocturno arriba. *(P7.7)*
- [x] **A5.** ~~Intake de `~/Downloads/modelos/`~~ — hecho 2026-05-18 → `public/img/lifestyle/`.
- [x] **A6.** ~~Auditoría de consistencia visual~~ — hecho 2026-05-18.
- [ ] **A1.** 🟡 Convertir las 4 PNG de `public/aftercare/` (~10.2 MB) a WebP/AVIF. **Requiere
  OK de la dueña** — `aftercare/` es zona protegida (`DO_NOT_TOUCH.md`). *(= P7.5)*
- [ ] **A2.** 🟡 Preload de fuentes en `Base.astro`. **No es trivial:** hay que migrar de
  `@fontsource` (CSS import, woff2 hasheados) a `@font-face` self-hosted en `public/fonts/`.
  Refactor del cargado de fuentes — pedir OK antes. *(P7.6)*

### Frente B — Clasificador (`wenu-platform`) 🟢

- [x] **B1.** Mover el `NOCODB_TOKEN` en texto plano de `SISTEMA-CLASIFICADOR.md` (líneas
  62-69 y 179) a `.env` y limpiar el doc. **Seguridad — prioridad alta.** 🟡
- [x] **B2.** Versionar un `docker-compose.yml` para NocoDB (hoy corre como contenedor suelto).
- [ ] **B3.** Implementar similitud visual pHash contra los ~46 macros existentes en NocoDB
  → el clasificador sugiere pieza sin que la dueña escriba nada. *(siguiente nivel de UX)*
- [x] **B4.** Generador de láminas técnicas profesionales (HTML+SVG+Puppeteer) desde
  foto-con-escala + datos NocoDB. La dueña tiene un mockup de qué necesita.
- [ ] **B5.** Batch Vision nocturno sobre las ~17k fotos sin analizar para poblar
  `metadata.visionAnalysis` → mejora el ranking de sugerencias.

### Frente C — Infra / despliegue 🔴 (humano) — los agentes solo preparan

- [ ] **C1.** Poner Production branch = `redesign-v2` en el dashboard de Cloudflare Pages
  (hoy `wenu-frontend.pages.dev` da 404). *(TASK_QUEUE P3.3)*
- [ ] **C2.** Rotar el token cloudflared comprometido. *(P0-C)*
- [ ] **C3.** Reconciliar conteo de catálogo WooCommerce. *(P4.2)*

---

## 5. Trabajo de esta noche (autónomo, seguro)

Orden recomendado para un modelo trabajando solo, sin humano despierto. **Solo carril verde.**
Cada paso: hacer → `npm run build` limpio → commit con mensaje claro → siguiente.

1. **A5** (intake de `modelos/` — fotos de producto reales, alto valor).
2. **A3** (width/height en imgs — fix CLS).
3. **A6** (auditoría visual — reporte, sin editar).
4. Al terminar cada tarea: marcar `[x]` en este doc y en `TASK_QUEUE.md`, y anotar
   una línea en `command-center/activity.ndjson`.

A1 y A2 quedan para cuando la dueña esté despierta (carril amarillo).

Si algo rompe el build → revertir ese cambio, dejarlo `[!]` con nota, seguir con el próximo.
**No** entrar a carril rojo ni amarillo sin la dueña despierta.

---

## 6. Cómo hacer handoff (no perder contexto)

Antes de quedarte sin contexto o cerrar sesión:

1. Actualizá la sección 2 y 5 de este doc con lo que hiciste.
2. Anotá el delta en `CURRENT_STATE.md` con fecha.
3. Marcá las tareas `[x]`/`[~]`/`[!]` en `TASK_QUEUE.md`.
4. Si dejaste algo a medias, dejá una nota `[~]` con **exactamente** dónde quedó.
5. Commit todo lo que pase build. No dejar trabajo sin commitear.

El próximo modelo abre Claude Code en `~/wenu-frontend` y dice:
**"leé agent-control/PLAN-DE-AVANCE.md y seguimos"**.

---

## 7. Datos técnicos rápidos

| Cosa | Detalle |
|---|---|
| Build sitio | `nvm use && npm run build` (Node 24.14.1) |
| Clasificador | `cd ~/wenu-platform && node src/api.mjs` → `:3335/classify/ui/` |
| Reiniciar clasificador | `pkill -9 -f "node src/api.mjs"; cd ~/wenu-platform && nohup node src/api.mjs > /tmp/wenu-api.log 2>&1 &` |
| NocoDB | Docker `nocodb`, `:8080`, base `pbmsibdovaalqw4` |
| Centro de mando | `node command-center/server.mjs` → `:7878` |
| Backup NocoDB | `~/WenuBackups/nocodb-data-2026-05-16/` |

*La dueña es Marimari. Trabajo en español, mensajes cortos, una cosa a la vez,
terminada y verificada antes de la siguiente. Mostrar progreso, no documentación.*
