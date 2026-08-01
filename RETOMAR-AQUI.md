# 🔖 RETOMAR ACÁ — Wenu Mapu

> Archivo de contexto guardado antes del reinicio del sistema — **2026-05-16**.
> Si el chat se perdió: abrí Claude Code en la carpeta `wenu-frontend` y decí:
> **"leé RETOMAR-AQUI.md y seguimos"**.

---

## Cómo estamos (resumen para el dueño)

- ✅ **El sitio web nuevo SALIÓ.** El trabajo se publicó (commit + push hechos a `redesign-v2`).
  Sitio online: `https://redesign-v2.wenu-frontend.pages.dev`
- ✅ **Centro de mando** construido — un tablero visual del negocio.
- ⚠️ **NocoDB (inventario) caído** — Docker se congeló. El reinicio del sistema lo destraba.
- ✅ **Inventario respaldado** — la base `noco.db` (2.4 MB, tus 89 piezas) está copiada y segura.

---

## QUÉ HACER DESPUÉS DEL REINICIO (orden)

### 1. NocoDB / inventario
- Al reiniciar el sistema, Docker arranca limpio. El contenedor `nocodb` puede levantar solo.
- Verificar: abrir `http://localhost:8080` — si abre, **el inventario está OK**.
- Si NO abre: recrear el contenedor limpio (los datos están en el volumen Docker `nocodb_data`, no se pierden). Tarea para Claude.
- **Backup de seguridad:** `~/WenuBackups/nocodb-data-2026-05-16/` — contiene `noco.db` (la base) + fotos.

### 2. Centro de mando
- Es un proceso que se corta con el reinicio. Para volver a prenderlo:
  ```
  cd ~/wenu-frontend
  WENU_COMMAND_CENTER_ALLOW_REDLANE=1 node command-center/server.mjs
  ```
- Después abrir `http://localhost:7878` en el navegador / iPad.

### 3. Pendientes menores (sin apuro)
- **Codex CLI** desactualizado (pide modelo `gpt-5.5` que su versión no soporta). Opcional: actualizar.
- **Cloudflare**: poner Production branch = `redesign-v2` en el dashboard, para que `wenu-frontend.pages.dev` (sin el `redesign-v2.` adelante) sirva producción.
- **Voz del centro de mando**: funciona por texto; para que escuche por voz mejor → integrar Whisper (pendiente).

### 4. 🎯 PRÓXIMO GRAN OBJETIVO — diseño profesional del sitio
Después de dejar NocoDB andando: **pase de diseño profesional** del sitio web.
- Usar la skill **`ui-ux-pro-max`** (inteligencia de diseño UI/UX).
- **Meta del dueño:** que el sitio NO tenga nada que envidiar a los referentes y la
  competencia, y que ayude a **posicionar la marca en el mercado**.
- Primer paso: pedirle al dueño **2-3 sitios de referencia / competencia** para
  benchmarkear contra algo concreto.
- Revisar y elevar: hero, tipografía, jerarquía visual, espaciado, calidad de imágenes,
  fichas de producto (PDP), navegación, y la experiencia mobile.
- Mantener el sistema de marca (paleta Obsidian, DM Serif Display, patrones mapuche)
  pero llevándolo a acabado profesional de primer nivel.
- **Pendiente nuevo:** usar la foto personal del owner (retrato en la playa con Golden Gate al fondo) en la sección **About / About me** del sitio. Tratarla como asset pendiente de subir/integrar, no de producto.
- **Referencia de calidad para Claude:** priorizar diseño con criterio fuerte de UI, motion intencional y frontend bien diseñado (referencias tipo `impeccable`, `design-motion-principles`, `frontend-design`).

---

## Datos técnicos (para Claude)

| Cosa | Detalle |
|---|---|
| Repo | `~/wenu-frontend`, branch `redesign-v2`, sincronizado con `origin` |
| Sitio live (preview) | `https://redesign-v2.wenu-frontend.pages.dev` |
| Centro de mando | `command-center/` — `node command-center/server.mjs` → puerto 7878 |
| NocoDB | contenedor Docker `nocodb`, volumen `nocodb_data` → `/usr/app/data`, puerto 8080 |
| Backup NocoDB | `~/WenuBackups/nocodb-data-2026-05-16/` (noco.db 2.4 MB ✓) |
| Estado NocoDB previo | colgado — proceso `node` al 89% CPU, no abría 8080; Docker entero se congeló |

## Lo que se hizo esta sesión (Ronda 4)
- Entrada de blog `src/content/journal/wood-as-body-material.md` + 6 captions IG (`reports/ig-captions-batch-2026-05-15.md`).
- Fixes: 2 bugs XSS (SearchModal, CustomOrderForm), accesibilidad (local.astro), preload roto (sets.astro), rel=noopener (shop.astro).
- Centro de mando completo: departamentos, etapas/niveles, agentes, inventario, voz por texto, botón publicar.
- Auditorías en `reports/audit-codex-frontend-2026-05-15.md` y `reports/audit-opencode-perf-2026-05-15.md`.
- Todo commiteado y pusheado a `origin/redesign-v2`.

---

*El dueño es Wenu Mapu. Claude Opus = el "Captain" que organiza. Modelo de trabajo: una cosa a la vez, terminada, antes de la siguiente.*
