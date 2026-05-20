# Estado del sistema — 2026-05-19

Generado por: wenuos-ops (read-only)
Hora de la auditoría: 2026-05-19

---

## Tabla de componentes

| Componente | Puerto | Estado | Proceso / PID | Notas |
|---|---|---|---|---|
| Cloudflare Tunnel (cloudflared) | — | VERDE | PID 441, root, corriendo como LaunchDaemon | Token comprometido (JWT en ps -ax). Mitigacion pendiente. |
| email-agent (com.wenu.email-agent) | 3360 | VERDE | PID 1046, node v20, LaunchAgent activo | Ultimo log: SIGTERM + reinicio normal. /health respondio 200 el 2026-05-14. |
| Postgres (wenu db) | 5432 | VERDE | PID 90785, listening | Conexiones activas desde node (PIDs 1146 y 11303). |
| wenu-platform API (src/api.mjs) | sin puerto externo | VERDE | PID 11303 | Conectado a Postgres. |
| wenu-platform dashboard | dsc (port anonimo) | AMARILLO | PID 1230 via npm run dashboard:serve | Prisma Studio (:5555) NO esta escuchando. Solo el dashboard custom esta activo. |
| wenu-frontend/dist (serve) | 4321 | VERDE | PID 1038, node v24, serve -s | Sirviendo el build estatico de redesign-v2 localmente. |
| wenumapu-system server | dec-notes (port anonimo) | VERDE | PID 1161, node v20 | Identidad: /Users/user1/wenumapu-system/server/index.js |
| PM2 God Daemon | — | VERDE | PID 1077 | Activo pero sin procesos activos recientes. Dump muestra "stopped" con exit_code 1 para wenu-backup. |
| n8n | 5678 | ROJO | Sin proceso | Puerto 5678 no esta escuchando. n8n no corre. |
| Prisma Studio | 5555 | ROJO | Sin proceso | Puerto 5555 no esta escuchando. Prisma Studio no corre. |
| NocoDB (Docker) | 8080 | AMARILLO-ROJO | Container "nocodb" Up 3 dias, PERO errores HTTP 500 en todas las queries de datos | Ver seccion NocoDB abajo. |
| Docker extra containers | 8080 | ROJO | 2 containers huerfanos ("dazzling_cannon", "thirsty_vaughan") sin mapeo de puerto publico | Duplicados de NocoDB sin proposito claro. |
| Bot Telegram (wenu-bot-telegram) | — | ROJO | No esta corriendo | Ultimo log: 2026-04-23, conflicto 409 (dos instancias), cerrado por SIGINT. Sin reactivar. |
| wenu-organizer | — | AMARILLO | Ver logs en ~/wenumapu-system/logs/organizer-out.log | Ultimo inicio: 2026-05-16 10:18. No hay actividad despues de esa linea. |
| wenu-frontend build | — | AMARILLO | Build existe en dist/ (105 paginas, 62 productos) | Sin GitHub remote. Sin Cloudflare Pages project. NO deployado publicamente. |
| wenumapuonline.com (apex) | — | ROJO | Sigue apuntando al tunnel → localhost:4321 | 2026-05-11: apex daba HTTP 502 persistente. Local serve corre en :4321 pero depende del Mac encendido. |

---

## Puertos clave — resultado lsof

```
:3360  → node PID 1046  → email-agent (com.wenu.email-agent launchd)        ACTIVO
:5432  → postgres PID 90785                                                    ACTIVO
:4321  → node PID 1038  → serve -s /Users/user1/wenu-frontend/dist            ACTIVO
:8080  → com.docker PID 1809 + nocodb container                               ACTIVO (pero datos con error)
:5678  → (nada)                                                                INACTIVO - n8n caido
:5555  → (nada)                                                                INACTIVO - Prisma Studio caido
:3333  → (nada escuchando en lsof -sTCP:LISTEN, aunque wenumapu-system corre) REVISAR
:3000  → Google Chrome PID 1006 conectado a :8080 (no es un server propio)
```

---

## Top 5 bloqueos por urgencia para manana

### BLOQUEO 1 — wenumapuonline.com apex roto desde 2026-05-11
**Severidad: ROJO — perdida de trafico real hoy**

El apex `wenumapuonline.com` (sin www) daba HTTP 502 el 2026-05-11 y la situacion no ha cambiado. El tunnel apunta a `localhost:4321` donde `serve` esta corriendo, pero el sitio que sirve es el build Astro de redesign-v2 — que NO es el sitio de produccion de WordPress todavia. Es posible que el 502 sea porque:
- El tunnel redirige al puerto 4321 donde corre Astro (el nuevo frontend en draft), y Astro todavia no esta configurado como produccion.
- O bien el `serve` en :4321 no estaba corriendo en el momento en que el 502 se detecto.

**Lo que Marimari ve:** quien escribe `wenumapuonline.com` puede ver el nuevo frontend Astro (en estado borrador) o un 502, segun si el Mac esta encendido y el serve activo.

**Accion manana:** ver seccion de cutover — necesita GitHub remote + Cloudflare Pages para que el sitio no dependa del Mac encendido.

---

### BLOQUEO 2 — Sitio web sin deploy real (dependencia del Mac)
**Severidad: ROJO — este era "para la semana pasada"**

`wenu-frontend` en rama `redesign-v2` tiene 105 paginas buildeadas, 62 productos, build verde. Pero:
- No tiene GitHub remote configurado.
- No hay Cloudflare Pages project.
- El sitio solo es accesible si el Mac esta prendido y `serve` en :4321 corre.

**Lo que falta (45-60 min de trabajo):**
1. Crear repo GitHub privado `wenu-frontend`.
2. Push de rama `redesign-v2`.
3. Crear Cloudflare Pages project apuntando al repo.
4. Configurar env vars: `NODE_VERSION=24`, `WC_URL`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`.
5. Verificar preview deploy en `*.pages.dev`.
6. Solo despues del smoke-test: mover DNS del apex a Pages.

Checklist completo en `/Users/user1/wenu-frontend/cutover-checklist-2026-05-11.md`.

---

### BLOQUEO 3 — NocoDB con HTTP 500 en todas las queries de inventario
**Severidad: ROJO — inventario inaccesible**

El container `nocodb` lleva 3 dias corriendo pero cada query a la tabla del inventario devuelve HTTP 500 con "Error fetching data". El UI de NocoDB abre pero los datos no cargan. Ver seccion NocoDB abajo para diagnostico completo.

---

### BLOQUEO 4 — Token del Cloudflare Tunnel comprometido
**Severidad: AMARILLO — riesgo de seguridad activo**

El JWT del tunnel `Wenuos` fue expuesto en un transcript de chat. Esta en `ps -ax` de root. El plan de migracion a tunnel localmente gestionado existe y esta documentado en:
`/Users/user1/wenu-frontend/cloudflared-local-managed-migration-plan.md`

Recomendacion: ejecutar despues del cutover a Cloudflare Pages (porque reduce el alcance del tunnel a un solo subdominio).

---

### BLOQUEO 5 — Bot Telegram sin correr desde 2026-04-23
**Severidad: AMARILLO — funcionalidad offline**

El bot `@wenu_agent_bot` se cerro por conflicto 409 (dos instancias corriendo) el 2026-04-23 y nunca se reactivio. El ultimo log de PM2 muestra SIGINT manual. El bot no esta en la lista de LaunchAgents (solo PM2 lo gestionaba), y PM2 no lo esta reiniciando automaticamente.

---

## Notas adicionales

- **wenu-organizer:** los logs muestran inicio el 2026-05-16 a las 10:18 pero no hay actividad posterior visible. Puede estar esperando archivos nuevos en `_SIN_CLASIFICAR` (que es normal si no hay fotos nuevas).
- **Dos containers NocoDB huerfanos:** `dazzling_cannon` y `thirsty_vaughan` fueron creados hace 3 dias junto con el container activo. Son duplicados sin mapeo de puerto publico. No bloquean nada pero consumen RAM y son confusion potencial.
- **Prisma Studio (:5555):** no esta corriendo. Para usarlo: `cd ~/wenu-platform && npx prisma studio`. No es un servicio critico de produccion.
- **n8n (:5678):** no esta corriendo. Los workflows de n8n quedan sin ejecutar. Si hay automaciones criticas en n8n, necesita reactivacion.
- **PM2 wenu-backup:** status "stopped" con exit_code 1 en el dump. El script `scripts/backup.js` fallo 2 veces y tiene 1 restart inestable. No es critico pero indica que los backups automaticos via PM2 no estan corriendo.
