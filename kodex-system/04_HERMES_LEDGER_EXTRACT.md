# Hermes Ledger Extract · KODEX-relevant

**Original**: `~/Obsidian/WenuAgent/operaciones/hermes-ledger.md` (172 líneas)
**Extraído**: 2026-08-30 por chat-sentinel via subagent Explore
**Regla dura**: cero paráfrasis. Cita textual siempre.

Este archivo es la memoria de side-effects que rompen assumptions. **Leerlo
antes de tocar infra o deploy** — sin esto se pueden borrar snapshots
activos, malinterpretar features parkeadas, o pasar por alto verificaciones
que no están en git.

---

## INFRA LOCKS · rutas compartidas que no se tocan sin verificación

- **`/tmp/wenu-deploy-snap`** (línea 26)
  - Regla: *"No borrar sin comprobar que no haya un wrangler vivo usando ese snapshot."*
  - Consecuencia: si otro agente tiene un `wrangler pages deploy` leyendo esa ruta, borrarla causa deploy parcial y sitio roto.
  - Chequeo obligatorio: `ps aux | grep wrangler` antes.

- **`/tmp/…white.jpg`** (línea 89)
  - Regla: ruta compartida de optimizaciones temporales de fotos (sharp/mozjpeg).
  - Consecuencia: conflictos si dos sesiones procesan photos simultáneamente.

- **`public/experience/index.html`** (línea 106)
  - Regla: self-contained, 199KB, no depende de imports externos; backup obligatorio antes de tocar.
  - Consecuencia: un error rompe toda la experiencia dimensional del portal.

---

## INCIDENT RUNBOOKS · qué hacer si

- **osascript crash** (línea 11)
  - Síntoma: `osascript: can't open default scripting component`
  - Fix: reinicio de la Mac o reparación del componente scripting del kernel.
  - Impacto: bloquea `npm run build` y `wrangler pages deploy` sin fallback.

- **astro build hangs en content-sync** (líneas 101, 143)
  - Síntoma: astro build cuelga a 0% CPU en phase de content-sync/entrypoints (no es WooCommerce API)
  - Fix: `pkill -9 astro build`, `rm -rf dist`, relanzar UN build limpio (serializado)
  - Regla: nunca dos builds en paralelo; serializar siempre (ya obligatorio via lock KDX_AGENTE).

- **ENOENT race en prepare-out-dir** (línea 92)
  - Síntoma: BUILD EXIT 1, ENOENT de assets `.avif`/`.webp` existentes pero siendo tocados por otro proceso.
  - Fix: `rm -rf dist`, relanzar. Es exactamente lo que ocurría con `cp -R dist` sin lock hasta DEC-048.

- **Wrangler/Pages deploy incompleto** (línea 26)
  - Síntoma: snapshot `/tmp/wenu-deploy-snap` borrado durante wrangler activo → deploy parcial
  - Fix: verificar inmediato que el sitio sigue 200; deploy posterior completo sobrescribe estado parcial.

---

## FEATURE PARKING · declaradas, no implementadas

- **Kai Tamagotchi** (líneas 2-13)
  - Estado: spec-only, 0% codeado.
  - Assets faltantes: sprites 4 etapas de evolución (solo "Compañero" existe, 20 PNGs), 6 íconos de recompensa (Galleta, Hueso, Amuleto, Cristal, Pluma, Luna), pose `caricia.png` inusable.
  - Decisiones abiertas: ubicación del Hogar (página propia vs overlay easter-egg), progreso (eventos del sitio vs juego activo).
  - Regla: **no inventar a ciegas**; necesita confirmación de arte + decisiones de Ocín.

- **"Últimos detalles" de Kai** (línea 10)
  - Estado: especificado en boards, no implementado.
  - Decisión posterior (11-jul): *"Kai es COMPAÑERO DE MARCA, NO asistente de soporte."*
  - Features que contradicen y por eso NO se codearon: widget colapsado fijo, tooltip contextual, panel de chat/ayuda, pop-up de premio, Kai en PDP/checkout.

- **NocoDB registro de fotos** (línea 91)
  - Estado: parcial. Falta API token de escritura no-interactiva en `.env`.

---

## LIVE VERIFICATIONS · existen en Hermes, no en git

- **Backup triple obligatorio** (líneas 32, 78, 83)
  - Obsidian canónico: `~/Obsidian/WenuAgent/estrategia/mockups-vision-2026-07-10/` (10 PNG vision premium)
  - LaCie respaldo: `/Volumes/LaCie/Wenu mapu/mockups-vision-2026-07-10/`
  - Local: `~/Downloads/wenu-photo-audit/`
  - Verificación: byte-idénticos a origen; reversible.

- **Snapshot de deploy previo** (línea 26): `/tmp/wenu-deploy-snap` (Wrangler serializado)

- **Fotos originales persistidas** (línea 86-92): `/Volumes/LaCie/Wenu mapu/originals-batch-2026-07-04/<slug>-<sku>-white.png`

- **Email previews rendered** (línea 169): `email-previews/shipping/*.html` (4 archivos: confirmed/shipped × EN/ES)

---

## DECISIONES HISTÓRICAS · side-effects que rompen assumptions

- **deploy-now.sh buildea desde working tree, no desde dist previo** (línea 12)
  - Consecuencia para KODEX: no hacer commits si no podés verificarlos en vivo.

- **Routing split intencional: apex (Astro) ≠ www (WordPress)** (línea 155)
  - Decisión: WooCommerce sigue en `www.wenumapuonline.com`; sitio nuevo en apex `wenumapuonline.com`.
  - Consecuencia: URLs internos del sitio nuevo son relativos; checkout aún no cableado en apex.
  - Para KODEX: **SIEMPRE verificar en `wenumapuonline.com` (sin www)**, no en www.

- **Themes fijados a noche intencional en Solar** (línea 142)
  - `.ember` y `.dye` sections tienen `rgb(6,5,5)` hardcoded — no respetan theme tokens.
  - Para KODEX: no "unificar" temas sin confirmar con Ocín.

- **WC attribute "Material" NO alimenta label vivo** (línea 68)
  - El material visual viene de `src/data/specs-by-sku.json` override, no de WooCommerce attribute.
  - Dos fuentes de verdad; sincronizar SIEMPRE ambas.

- **Console.log de debugging en vivo detecta issues** (línea 120, 139)
  - Confiar en JS en vivo de `wenumapuonline.com`, no en working tree.
  - Para KODEX: siempre cache-bust y testear en apex después de deploy.

---

## Top 3 URGENTES (si un agente los ignora → daño inmediato)

1. **INFRA LOCK `/tmp/wenu-deploy-snap`** — borrar durante wrangler activo rompe deploy.
2. **osascript crash** — bloquea TODO si el Mac kernel falla; impacta toda sesión siguiente.
3. **Kai Tamagotchi spec-only** — un agente desconocedor podría intentar "terminarla" y inventar arte. Regla: NO inventar; esperar sprites + decisiones de Ocín.
