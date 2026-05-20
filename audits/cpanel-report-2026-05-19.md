# Diagnostico cPanel / HostGator — 2026-05-19

Generado por: wenuos-ops (read-only)
Hora de la auditoria: 2026-05-19

---

## Acceso a Gmail — resultado

No tengo herramienta de Gmail disponible en esta sesion (la herramienta `mcp__ea346c5b-...` no esta conectada). No pude hacer busqueda de emails directamente.

Lo que SI tengo:
- Lectura de archivos locales del sistema.
- Acceso a la memoria del proyecto.
- Acceso a logs del Mac.

Busque en el sistema local archivos de Mail.app, directorios maildir y logs relacionados con HostGator. No encontre ninguna base de datos de Mail.app procesable por lectura de archivos en esta sesion.

---

## Lo que se sabe del hosting HostGator por el historial del proyecto

Fuentes: archivos de estado en `~/wenu-frontend/`, memoria `project_wenuos.md`, `cutover-checklist-2026-05-11.md`.

**Situacion confirmada al 2026-05-11:**

- `https://wenumapuonline.com` (apex) daba HTTP 502 persistente.
- `https://www.wenumapuonline.com` daba HTTP 200 OK.
- WooCommerce REST API en www respondia con HTTP 401 con credenciales validas (funcionando correctamente).
- El DNS fue migrado de HostGator nameservers a Cloudflare nameservers en 2026-04-18.
- HostGator sigue siendo el origen del backend WordPress + WooCommerce.

**El apex 502 al 2026-05-11** se explico en el cutover-checklist como: "el apex esta roto a nivel proxy/origen de Cloudflare". El tunnel de Cloudflare apunta `wenumapuonline.com → localhost:4321`, y esa ruta fue configurada para el nuevo frontend Astro, no para el WordPress de HostGator.

---

## Hipotesis sobre el problema de cPanel que menciona Marimari

Sin acceso a Gmail no puedo confirmar la causa exacta, pero con la informacion del sistema hay 3 escenarios posibles:

### Hipotesis A — cPanel inaccesible porque el DNS cambio a Cloudflare (mas probable)
Cuando el DNS se mueve a Cloudflare, el acceso a `wenumapuonline.com/cpanel` puede romperse si Cloudflare no tiene una regla que pase el trafico de cPanel al servidor HostGator. HostGator normalmente usa puertos no-estandar para cPanel (2082, 2083, 2086, 2087) que no pasan por el proxy de Cloudflare.

**Sintoma tipico:** el usuario intenta entrar a `wenumapuonline.com/cpanel` o `cpanel.wenumapuonline.com` y recibe error de conexion o 502.

**Solucion:** acceder a cPanel directamente por IP o por el URL de servidor de HostGator, que no pasa por Cloudflare. Ver paso 1 del plan de accion abajo.

### Hipotesis B — Email de HostGator (Titan Mail) no funciona porque el MX esta en Cloudflare
Si los nameservers ahora son Cloudflare pero los registros MX no fueron configurados correctamente en Cloudflare DNS, los emails entrantes se pierden.

**Sintoma tipico:** emails a `marimari@wenumapuonline.com` rebotan o simplemente no llegan.

**Lo que sabemos:** la memoria del proyecto indica 7 alias configurados en HostGator y DMARC activo en Cloudflare. Si el MX registro sigue apuntando al servidor de HostGator en el DNS de Cloudflare, deberia funcionar. Pero si fue borrado por accidente durante la migracion, los emails no llegan.

### Hipotesis C — Suspension o alerta de seguridad en HostGator
HostGator puede suspender cuentas por: billing vencido, uso excesivo de recursos, deteccion de malware en WordPress, o abuso de email. Esto daria un mensaje de suspension al intentar acceder a cPanel.

---

## Plan de accion para manana (Marimari lo ejecuta)

### Paso 1 — Acceder a cPanel sin pasar por Cloudflare

HostGator permite acceso directo al panel por la IP del servidor o por el URL de servidor directo. Para encontrar el URL correcto:

a) Ir a `https://www.hostgator.com` → login con las credenciales de la cuenta.
b) Una vez dentro del panel de HostGator (no cPanel), buscar "Hosting" o "My Hosting Packages".
c) El panel muestra el numero de servidor (ejemplo: `gator3456.hostgator.com`). Usar ese URL con el puerto: `https://gator3456.hostgator.com:2083` (con 2FA si lo tiene activado).

Alternativa rapida: intentar `https://wenumapuonline.com:2083` — si HostGator responde directamente (a veces funciona aunque el DNS este en Cloudflare porque los puertos 2082/2083 no son proxeados por Cloudflare por defecto cuando el dominio esta en modo "orange cloud").

### Paso 2 — Identificar el problema una vez dentro de HostGator

Una vez en el panel de HostGator (no necesariamente cPanel):
- Revisar si hay alertas de suspension, billing, o seguridad en el panel principal.
- Ir a "Email" → "Email Accounts" → verificar que `marimari@wenumapuonline.com` existe y tiene cuota disponible.

Si la cuenta esta suspendida: habra un banner rojo en el panel de HostGator indicando la razon.

### Paso 3 — Verificar registros DNS de email en Cloudflare

En el dashboard de Cloudflare (`dash.cloudflare.com`) → wenumapuonline.com → DNS:

Verificar que existan estos registros (no deben haber sido borrados en la migracion):
- **MX record** apuntando al servidor de mail de HostGator (ejemplo: `mail.wenumapuonline.com` o directamente al servidor).
- **A record** para `mail.wenumapuonline.com` apuntando a la IP del servidor HostGator.
- **TXT record** con el SPF de HostGator.
- **DMARC TXT** en `_dmarc.wenumapuonline.com` (la memoria dice que esto existe).

Si el MX record falta: los emails entrantes no llegan. Agregar el MX con el valor que HostGator indica en su panel (seccion "MX Entry" o "Email Routing").

### Paso 4 — Si el problema es acceso al email, usar webmail directo

HostGator provee webmail en una URL que no depende del DNS custom:
- `https://webmail.hostgator.com` — login con el email completo `marimari@wenumapuonline.com` y la contrasena de esa cuenta (distinta a la contrasena de cPanel).

Esto permite revisar emails directamente aunque el DNS este mal configurado.

### Paso 5 — Si ninguno de los pasos anteriores funciona, contactar HostGator

HostGator tiene soporte 24/7 por chat en `hostgator.com`. Decir literalmente:
"My domain `wenumapuonline.com` uses Cloudflare DNS. I cannot access cPanel. My email may not be working. Can you check if my account is active and provide the direct server URL to access cPanel bypassing Cloudflare?"

Ellos pueden dar el acceso directo y confirmar si hay suspension.

---

## Limitacion de este reporte

Este reporte no pudo acceder a Gmail para buscar emails de HostGator. Para completar el diagnostico de emails recibidos:

1. Marimari abre Gmail en `wenu.mapu8@gmail.com`.
2. Busca: `from:hostgator.com` en los ultimos 30 dias.
3. Busca: `subject:suspension wenumapuonline` en los ultimos 30 dias.
4. Busca: `from:cloudflare.com subject:dmarc` en los ultimos 30 dias.

Si encuentra algun email, comparte el asunto y fecha en la proxima sesion para diagnostico especifico.
