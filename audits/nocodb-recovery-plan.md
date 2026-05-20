# NocoDB — Diagnostico y Plan de Recuperacion — 2026-05-19

Generado por: wenuos-ops (read-only)
Hora de la auditoria: 2026-05-19

---

## Diagnostico — que encontre

### Estado del container

```
CONTAINER ID   IMAGE                  STATUS      PORTS                    NAMES
e5140d06292d   nocodb/nocodb:latest   Up 3 days   0.0.0.0:8080->8080/tcp   nocodb
f5805c294d6a   nocodb/nocodb:latest   Up 3 days   8080/tcp                 dazzling_cannon
9dc6592105f1   nocodb/nocodb:latest   Up 3 days   8080/tcp                 thirsty_vaughan
```

El container principal `nocodb` lleva 3 dias corriendo sin reinicios (RestartCount=0, ExitCode=0 actual). No es un crash — el contenedor esta vivo.

Los containers `dazzling_cannon` y `thirsty_vaughan` son duplicados sin mapeo de puerto publico. Fueron creados el mismo dia que `nocodb`. Probablemente son intentos anteriores de levantar NocoDB antes de encontrar la configuracion correcta de puertos. No estan causando el problema pero consumen recursos.

### Logs del container activo (ultimas 30 lineas relevantes)

El arranque es EXITOSO:
```
Nest application successfully started
No license key found — running in CE mode
Proxy server listening on port 5433
App started successfully. Visit -> http://localhost:8080/
```

El error NO es de inicio. Es de datos:
```
{"level":50,...,"msg":"Error fetching data"}
{"level":50,...,"msg":"Error: Please check server log for more details"
  at _0x2b849b.generateError
  at _0x36aba4.getDataList
  at _0x36aba4.dataList
```

Todas las queries son a la tabla `m5s3jnm72tzhk9g` (el inventario). La llamada de login tambien fallo con "Unauthorized" en uno de los intentos.

### Volume de datos

El volume es: `/var/lib/docker/volumes/nocodb_data/_data → /usr/app/data` dentro del container.

NocoDB en modo CE (Community Edition) sin Postgres externo usa SQLite como base de datos. El archivo SQLite esta en `/usr/app/data/noco.db` dentro del container.

### Causa raiz identificada

El container arranca bien. La aplicacion NocoDB esta funcionando. El problema es que las queries SQL a la tabla del inventario estan fallando internamente con HTTP 500. Los posibles causas, en orden de probabilidad:

**Causa 1 — Base SQLite dañada o con lock (probabilidad: ALTA)**

NocoDB usa SQLite. Si el container fue forzado a parar o si hay 3 containers corriendo al mismo tiempo accediendo al mismo volume, SQLite puede quedar en estado de lock o con paginas dañadas. Los 3 containers comparten el mismo volume? Eso dependeria de como fueron creados.

**Causa 2 — Los 3 containers comparten el mismo volume SQLite y hay write conflicts (probabilidad: MEDIA-ALTA)**

Si `dazzling_cannon` y `thirsty_vaughan` tambien estan montando el mismo volume `nocodb_data`, SQLite (que no soporta escrituras concurrentes bien) puede estar corrompido por escrituras simultaneas.

**Causa 3 — Schema migration fallida (probabilidad: MEDIA)**

Si se actualizo la imagen de Docker a una version mas nueva de NocoDB con un schema distinto, puede haber una migration aplicada a medias que deja la tabla en estado inconsistente.

**Causa 4 — La tabla en cuestion fue borrada o renombrada (probabilidad: BAJA)**

El ID `m5s3jnm72tzhk9g` es el ID interno de la tabla. Si fue eliminada desde la UI de NocoDB el ID quedaria invalido.

---

## Riesgo de perdida de datos

**RIESGO: BAJO-MEDIO**

Justificacion:
- El container lleva 3 dias "Up" sin reinicios, lo que significa que el archivo SQLite no fue borrado.
- El volume `nocodb_data` persiste independientemente del container.
- Incluso si el SQLite esta parcialmente dañado, SQLite tiene herramientas de recuperacion que pueden rescatar la mayoria de los datos.
- El unico escenario de perdida real seria si los 3 containers escribieron datos conflictivos al mismo SQLite simultaneamente — pero como no hay operaciones de escritura activas en el inventario (solo lectura fallando), la probabilidad de datos corrompidos irrecuperables es baja.

**Lo que esta en riesgo:** la integridad de las filas del inventario en la tabla `m5s3jnm72tzhk9g`. El schema (estructura de columnas) probablemente esta intacto.

---

## Plan numerado de recuperacion

IMPORTANTE: Marimari ejecuta estos pasos. Zero mutaciones hasta que ella lo apruebe.

### Paso 1 — Hacer backup del volume ANTES de cualquier cambio (3 minutos)

```bash
docker run --rm -v nocodb_data:/data -v /tmp:/backup alpine \
  tar czf /backup/nocodb-backup-20260519.tar.gz /data
ls -lh /tmp/nocodb-backup-20260519.tar.gz
```

Esto crea un backup del SQLite en `/tmp/nocodb-backup-20260519.tar.gz`. Verificar que el archivo pese mas de 0 bytes antes de continuar.

### Paso 2 — Verificar si los containers huerfanos comparten el volume

```bash
docker inspect dazzling_cannon --format '{{range .Mounts}}{{.Source}}{{"\n"}}{{end}}'
docker inspect thirsty_vaughan --format '{{range .Mounts}}{{.Source}}{{"\n"}}{{end}}'
```

Si la salida muestra `nocodb_data` para los containers huerfanos: esa es la causa raiz. Los 3 containers estaban escribiendo al mismo SQLite.

### Paso 3 — Detener los containers huerfanos (NO el principal)

Solo si el Paso 2 confirma que comparten el volume:

```bash
docker stop dazzling_cannon thirsty_vaughan
```

No borrarlos todavia. Solo detenerlos para que dejen de pelear por el lock de SQLite.

### Paso 4 — Verificar integridad del SQLite

```bash
docker exec nocodb sqlite3 /usr/app/data/noco.db "PRAGMA integrity_check;"
```

Resultado esperado: `ok`
Si devuelve errores: el SQLite esta dañado. Ver Paso 5B.

### Paso 5A — Si integrity_check devuelve "ok"

El SQLite esta bien. El error HTTP 500 puede ser un problema de session o token de NocoDB. Intentar:

```bash
# Reiniciar solo el container principal (no borra datos — el volume persiste)
docker restart nocodb
```

Esperar 30 segundos y probar en el navegador `http://localhost:8080`. Si los datos cargan: problema resuelto (era un lock liberado por el restart).

### Paso 5B — Si integrity_check reporta errores

El SQLite tiene paginas dañadas. Ejecutar recuperacion:

```bash
docker exec nocodb sh -c "
  sqlite3 /usr/app/data/noco.db '.recover' > /usr/app/data/noco_recovered.sql &&
  mv /usr/app/data/noco.db /usr/app/data/noco.db.bak &&
  sqlite3 /usr/app/data/noco_recovered.db < /usr/app/data/noco_recovered.sql
"
```

Luego renombrar el archivo recuperado:
```bash
docker exec nocodb mv /usr/app/data/noco_recovered.db /usr/app/data/noco.db
docker restart nocodb
```

### Paso 6 — Verificar que los datos del inventario cargan

Abrir el navegador en `http://localhost:8080` → login → abrir la tabla del inventario. Verificar que las filas con SKU `WM-PRC-*` aparecen.

Si cargan: exito. Tomar screenshot como evidencia.

### Paso 7 — Limpiar containers huerfanos (opcional, despues de verificar)

Una vez confirmado que `nocodb` funciona:
```bash
docker rm dazzling_cannon thirsty_vaughan
```

Estos no tienen datos propios si montaban el mismo volume, y si tenian volumes propios separados, esos volumes estan vacios (nunca fueron el container principal).

---

## Nota sobre acceso externo a NocoDB

NocoDB corre en `localhost:8080`. Para acceder desde fuera del Mac necesita un subdominio en el tunnel de Cloudflare. Esto no esta configurado actualmente. Para uso local: `http://localhost:8080` en el mismo Mac.

---

## Resumen ejecutivo (una linea por accion)

1. Hacer backup del volume: `docker run ... tar czf`
2. Verificar si huerfanos comparten volume: `docker inspect`
3. Detener huerfanos: `docker stop dazzling_cannon thirsty_vaughan`
4. Chequear SQLite: `docker exec nocodb sqlite3 noco.db "PRAGMA integrity_check;"`
5A. Si "ok": `docker restart nocodb` y probar.
5B. Si hay errores: `.recover` del SQLite y restart.
6. Verificar datos en browser.
7. Limpiar containers huerfanos.
