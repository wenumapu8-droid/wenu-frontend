# Runbook — rotación de claves WooCommerce expuestas

- **Fecha:** 2026-06-11
- **Agente:** Claude (cowork)
- **Origen:** Oportunidades #7 — claves Woo hardcodeadas en código.

## Hecho (automático, ya aplicado)

- `wenumapu-system/server/index.js`: **removidas** las claves WC hardcodeadas de 2 endpoints
  (`/api/woo-products`, `/api/woo-compare`). Ahora leen de `process.env.WOO_KEY/WOO_SECRET/WOO_URL`.
- Agregada guarda `wooCredsReady(res)` — rechaza la request (500) si faltan creds, **sin loggear el valor**.
- Instalado `dotenv` (el código ya lo `require`-ía en línea 3 pero no estaba instalado → crash latente).
- Backup del original: `wenumapu-system/server/index.js.bak-secrets-2026-06-11`
  ⚠️ **este .bak todavía contiene la clave en texto plano** — borralo una vez confirmes que el server arranca.
- `server/routes/agents.js`: revisado — **no tenía secretos** (los matches `ck_/cs_` eran substrings de
  `stock_status`). Ya usaba un provider basado en env.
- Verificado: `node --check server/index.js` pasa; `grep` no encuentra más `ck_/cs_` hardcodeados en el repo.

## Pendiente (requiere TU acción — wp-admin + reinicio de servicios)

La clave **`ck_3653c93a1c…`** estuvo en texto plano en el código fuente (y vive en varios `.env`).
Aunque ya no está en el código, **estuvo expuesta** → conviene rotarla.

### Paso 1 — Revocar + regenerar en WooCommerce
1. wp-admin → **WooCommerce → Settings → Advanced → REST API**.
2. Localizá la key cuyo Consumer key empieza con `ck_3653c93a1c…`. **Revoke**.
3. **Add key**: descripción `wenu-agents-2026-06`, user admin, permisos **Read/Write**. Generá.
4. Copiá el nuevo `ck_…` y `cs_…` (solo se muestran una vez).

### Paso 2 — Actualizar los `.env` (3 archivos)
| Archivo | Vars a actualizar |
|---|---|
| `~/wenu-frontend/.env` | `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET` |
| `~/wenumapu-system/.env` | `WOO_KEY`, `WOO_SECRET` |
| `~/wenu-agent-hub/.env` | `WOOCOMMERCE_KEY`, `WOOCOMMERCE_SECRET` (y `WOO_KEY/SECRET` si existen) |

> Los 3 `.env` están en `.gitignore` — la clave nunca debe volver al código.

### Paso 3 — Reiniciar servicios dependientes
- `wenu-agent-hub` webhook-server (pid actual ~57585)
- `wenumapu-system/server/index.js` (no está corriendo ahora — arrancará con la creds nuevas)
- Cualquier cron/launchd que lea esos `.env`.

### Paso 4 — Verificar
- `curl -s localhost:<port>/api/woo-products` → `{ ok: true, … }` con la key nueva.
- Re-build del frontend (`npm run build`) usa `WC_CONSUMER_KEY` nuevo → debe traer los 137 productos.

### Paso 5 — Limpiar
- Borrar `wenumapu-system/server/index.js.bak-secrets-2026-06-11`.
- Confirmar que la key vieja figura como **Revoked** en wp-admin.

## Nota
No roté la clave automáticamente porque (a) requiere wp-admin, (b) rompería el webhook-server y el build
del frontend a mitad de proceso, y (c) la guardrail #7 de Oportunidades pide aprobación explícita para
"rotar credenciales y reiniciar servicios". El código ya quedó seguro; la rotación es tu llamada.
