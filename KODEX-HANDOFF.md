# KODEX −∞ — Handoff de ejecución para Claude Code (terminal)

> Escrito 2026-07-27 por la sesión Cowork. **Instrucción directa de Ocin: ejecutá
> TODO vos, no le devuelvas tareas. Hacé cada job hasta el final de forma autónoma.**
> KODEX ya está VIVO en producción (wenumapuonline.com/kodex). Ejecutá en el orden
> de abajo. Solo hay DOS cosas físicamente imposibles de delegar (son sus llaves y su
> firma, ningún software debe tenerlas) — pedíselas UNA vez, claras, y seguí con todo
> lo demás sin frenar:
>   1. **Pegar el `PRINTFUL_API_TOKEN` en `.env`** (él lo genera en Printful → API,
>      1 clic). Con eso creás todos los productos por API.
>   2. **Firmar el minteo NFT al final** (wallet + gas + firma = su mano).
>
> **IMPORTANTE (pedido de Ocin): no le pidas los pasos en texto — ABRILE la ventana.**
> Cuando necesites algo de él, corré `open <url>` en la Mac para que se le abra la
> página exacta y él solo actúe ahí. Ejemplos:
>   - Token Printful → `open "https://www.printful.com/dashboard/settings/api"`
>   - Minteo NFT → `open` la colección/plataforma cuando el paquete esté listo.
> Abrí la ventana, decile en una línea qué pegar o firmar, y seguí con lo demás.
> Absolutamente todo el resto —packs, categoría, productos WC, productos Printful,
> preparar la colección NFT, deploys, Pinterest— lo hacés vos. Marcado 🔒 HUMANO solo
> esas dos.

---

## Reglas duras (leer antes de tocar nada)

- **Deploy serializado.** UN build por vez. Lock `/tmp/wenu-deploy.lock`. Matar
  astro/wrangler/esbuild colgados antes. `git push` NO despliega (Direct Upload).
- **Producción = `deploy-now.sh`** (build + verify home/shop/products=174/gallery +
  `wrangler pages deploy dist --project-name wenu-frontend --branch redesign-v2`).
  Si products≠174 aborta → protege la joyería.
- **La tienda de joyería es el negocio vivo de Ocin. Todo deploy la deja intacta.**
- **`src/lib/woo.ts getProducts()` trae TODOS los productos `status=publish` sin
  filtro de categoría** (línea ~184). Cualquier producto publicado se cuela en el
  `/shop` de joyería. Ver Job 2 — hay que resolver esto SÍ o SÍ antes de crear
  productos KODEX visibles.
- **Nunca manejar contraseñas ni crear cuentas.** Los tokens/llaves los genera Ocin
  y los pega en `.env`; el agente solo LEE variables de entorno, nunca extrae
  passwords ni loguea por él.
- **Nunca firmar transacciones blockchain, mover fondos, ni pagar gas.** Ver Job 5.

---

## Credenciales que Claude Code necesita de Ocin (pedirlas y esperar)

Poné estas en `/Users/user1/wenu-frontend/.env` (Ocin las genera en cada dashboard):

```
# Ya existen:
WC_URL=...            WC_CONSUMER_KEY=...       WC_CONSUMER_SECRET=...
CLOUDFLARE_API_TOKEN=...   CLOUDFLARE_ACCOUNT_ID=...
# Faltan (Job 4 y 1):
PRINTFUL_API_TOKEN=...     # Printful → Settings → API → generar token
CF_R2_ACCESS_KEY=...       CF_R2_SECRET=...   CF_R2_BUCKET=...   # si se usa R2 (Job 1)
```

Si una falta, hacer el job hasta donde se pueda y avisar qué falta. No inventar llaves.

---

## Job 1 — Hostear los 4 packs .zip (desbloquea las descargas gratis)

Subir los zips (27MB) a Cloudflare Pages desde la Mac de Ocin (macOS 12.6) falla con
`SocketError/EPIPE` (wrangler no soportado corta socket con archivos grandes). Los
zips están a salvo en **`/Users/user1/_kodex-packs-hold/`**:
`kodex-achroma.zip` (4.1M), `kodex-disco-solar.zip` (6.1M), `kodex-tribe.zip` (5.2M),
`kodex-archive.zip` (12M). Licencia ya en `public/img/kodex/packs/LICENSE.txt`.

**Opción preferida: Cloudflare R2** (o el Mac mini M4, Job 6). Subir los 4 a un bucket
público, obtener las URLs, y en `src/pages/kodex/store.astro` array `packs` poner esas
URLs en `p.file` y revertir el botón a:
```
<a class="ks-buy" href={p.file} download>⤓ DOWNLOAD PACK · FREE</a>
<a class="ks-buy ks-buy--soon" href={p.explore}>⧉ ENTER THE COLLECTION</a>
```
(Hoy está al revés: "ENTER THE COLLECTION" + "FULL PACK · SOON"). Build + `deploy-now.sh`.

---

## Job 2 — Separar KODEX de la joyería en WooCommerce (BLOQUEANTE para Job 3/4/5)

Sin esto, cualquier producto KODEX aparece en el `/shop` de joyería. Hacer:
1. Crear categoría `kodex` (slug `kodex`) en WooCommerce vía API.
2. Modificar `src/lib/woo.ts getProducts()` para EXCLUIR productos cuya categoría sea
   `kodex` (filtrar en código después del fetch, o `?category` inverso). Está
   permitido tocar `woo.ts` por necesidad — testear `npm run build` después, verificar
   que `/shop` sigue con 174 y que los KODEX no aparecen ahí.
3. (Opcional) Que `/kodex/store` lea SOLO la categoría `kodex` para mostrar los pagos.

Confirmar con Ocin si prefiere esto (A) o comercio KODEX 100% separado (B). Default A.

---

## Job 3 — Productos digitales KODEX en WooCommerce (vía API)

Con Job 2 resuelto, crear productos WC en categoría `kodex`:
- **Descargas gratis:** ya funcionan por link directo, NO requieren producto WC.
- **Packs pagos / "support":** producto WC `virtual:true, downloadable:true`, precio
  fijado por Ocin (o "name your price" si hay plugin). Adjuntar el .zip hosteado (Job 1)
  como `downloads[]`.
- **Prints (Job 4):** los crea Printful al sincronizar, no a mano.
Usar `POST {WC_URL}/products` con las llaves de `.env`. Marcar cada uno con la
categoría `kodex`. Verificar que NO aparezcan en `/shop`.

---

## Job 4 — Printful: crear los productos con los diseños de Ocin (vía API)

Printful tiene API — se puede crear todo programático con `PRINTFUL_API_TOKEN`.
1. **Diseños:** ubicar los archivos de arte de Ocin a resolución de PRINT (Printful
   pide ~150–300 DPI; ej. 4000px+ para posters). Las imágenes del sitio (1080–2048px)
   pueden ser bajas para formatos grandes — revisar y, si hace falta, pedir a Ocin los
   originales de alta (probable en LaCie `/Volumes/LaCie/Wenu mapu` o el PDF Behance
   fuente en `wenu-frontend/kodex-source/art-full/`).
2. Subir cada diseño a Printful (`POST /files` o URL pública) y crear productos
   (`POST /store/products`): posters, prints, stickers, tees — variantes + mockups.
3. **Conectar Printful ↔ WooCommerce:** si se hace por API, los sync products caen en
   WC. Asegurar que entren en categoría `kodex` (Job 2) para no ensuciar la joyería.
   🔒 HUMANO: la vinculación OAuth inicial Printful↔store (autorizar la conexión) la
   aprueba Ocin en el dashboard si el flujo lo pide. El resto (crear productos) = API.
4. Precios y márgenes los fija Ocin. No publicar productos con precio inventado.

---

## Job 5 — NFT (PREPARAR todo automático; MINTEAR = 🔒 HUMANO)

Claude Code **prepara** la colección: imágenes finales, `metadata.json` por pieza
(nombre, descripción del codex, atributos: familia/operación/seed/quiralidad),
estructura de carpetas lista para IPFS/plataforma, y un README de minteo.

🔒 **HUMANO — Ocin, no un agente:** conectar wallet, subir a OpenSea/Foundation/
plataforma, pagar gas y **firmar** el minteo. Ningún agente debe tocar wallet, llaves
privadas, gas ni firmar transacciones (regla de seguridad dura + riesgo real de
fondos). Claude Code deja el paquete listo y guía a Ocin en el minteo, pero la firma
es suya. En el sitio, el botón NFT puede quedar apuntando al link de la colección de
OpenSea una vez que Ocin la publique.

---

## Job 6 — Node en el Mac mini M4 (INFRA — deploys estables + desbloquea Job 1)

M4 (macOS 26.3, Tailscale `100.91.188.82`, user `galvazincia`) no corta socket como
esta Mac. Instalar Node 24.x + npm ahí y correr `deploy-now.sh`/subir zips desde el
M4. Ver memoria `reference_m4_macmini_ssh`.

---

## Job 7 — Kit Pinterest (contenido, SEO orgánico — objetivo #1 de Ocin)

Preparar tableros (KODEX −∞ / Achroma / Disco Solar / Tribe Space / The Return) +
descripciones de pin con keywords SEO + material (52 láminas + capturas del RETURN).
Pinterest no se automatiza desde acá (host bloqueado); Ocin pinea con el kit, o vía
Pinterest API si consigue token.

---

## Job 8 — WordPress: destapar disco + offload de media a R2 (HostGator MX)

Hosting = **HostGator MX** (portal/cPanel en español, mx.hostgator.com). El WP se
llena y falla "could not be moved" al subir. Diagnóstico ya hecho vía WP REST:
**1.043 imágenes en media, 174 productos, 12 páginas.** 1.043 no es mucho → el peso
es el MULTIPLICADOR (cada imagen = 6–10 archivos por miniaturas) + backups on-server.

**Reparto:**
- **Vos (agente), sin login:** armar el bucket **Cloudflare R2** por API con el
  `CLOUDFLARE_API_TOKEN`. R2 free tier = 10 GB gratis para siempre, **$0 egress**,
  **sin tarjeta**. Regla de Ocin: **NO cargar tarjeta en Cloudflare** (así nunca puede
  cobrar; si supera 10GB solo deja de aceptar, no factura). Sus imágenes pesan <1 GB.
- **Ocin, con login (abrile la ventana):** medir espacio vs inodes en el cPanel de
  HostGator MX (sidebar: "Disk Usage" / "Inodes"), y borrar backups on-server
  (UpdraftPlus) bajándolos antes a Drive. `open` la ventana del cPanel y guialo.

**Pasos técnicos:**
1. Medir GB vs inodes (Ocin lee cPanel) → saber contra qué se pelea.
2. Reducir tamaños de thumbnail no usados + regenerar (mayor ahorro de inodes, sin
   perder fotos). Vía plugin en WP admin (login de Ocin) o WP-CLI si hay SSH.
3. Offload de las 1.043 imágenes a R2 (fix permanente = WP headless real). OJO: el
   sitio en vivo linkea a `wenumapuonline.com/wp-content/uploads/...`, así que hay que
   reescribir esas URLs a R2 — es una **migración**, hacerla con cuidado y verificar
   que las imágenes de producto sigan cargando en el sitio Astro después.
4. Apagar la generación de nuevos thumbnails en WP para que no se vuelva a llenar.

**No borrar nada del material de Ocin sin confirmar** (regla dura). Backups: bajar
antes de borrar. Verificar el sitio en vivo tras cada cambio.

## Orden sugerido de ejecución

1. Pedir credenciales faltantes (Printful token; R2 o M4 para Job 1).
2. Job 6 (Node en M4) si se va por esa vía → Job 1 (packs vivos).
3. Job 2 (separar categoría — BLOQUEANTE) → Job 3 (productos WC) → Job 4 (Printful).
4. Job 5 (preparar NFT) → entregar a Ocin para minteo.
5. Job 7 (Pinterest) en paralelo.
Después de cada deploy: verificar en vivo `wenumapuonline.com` (no solo git), joyería
con 174 productos, y KODEX limpio. Registrar avances.

## Archivos ya tocados esta sesión (vivos en prod)

`src/pages/kodex/store.astro` (packs + descargas gratis), `public/img/kodex/packs/
LICENSE.txt`, `.gitignore` (ignora `packs/*.zip` — quitar al hostear). Resto de KODEX
(movement/[key], return, memory.js, works, KodexShell, footer glitch) ya vivo.
