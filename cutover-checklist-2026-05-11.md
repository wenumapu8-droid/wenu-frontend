# Cutover Checklist — wenumapuonline.com (WP legacy → Astro/Cloudflare Pages)

**Fecha plan:** 2026-05-11
**Autor:** Claude orchestration session
**Estado:** PENDIENTE DECISIONES OWNER

## Hallazgo crítico (motivación adicional)

A las 2026-05-11 14:59 PT verificamos:
- `https://wenumapuonline.com` (apex, sin www) → **HTTP 502 persistente** (3 intentos consecutivos)
- `https://www.wenumapuonline.com` → **HTTP 200 OK**
- WooCommerce REST API en www → **HTTP 401 con auth válida = funcionando**

Conclusión: el apex está roto a nivel proxy/origen de Cloudflare. Quien tipea `wenumapuonline.com` se topa con 502. Pérdida de tráfico orgánico inmediata.

El cutover propuesto resuelve esto: Cloudflare Pages sirve apex y www directamente, sin depender del origen HostGator para el frontend.

---

## Estado actual

### Frontend nuevo (Astro)
- Branch `redesign-v2`, 6 Tasks de Codex mergeadas, último commit 2026-05-11 13:32 PT
- Build local verde: **105 páginas**, 62 product PDPs, postbuild OK
- Node 24.14.1 (.nvmrc), Astro 6, output estático en `dist/`
- Email canónico `marimari@wenumapuonline.com`, fono `+1 (408) 500-6211` en todas las plantillas (Task 1)

### Backend que se mantiene (HostGator + WP + WC)
- WooCommerce REST API: `https://www.wenumapuonline.com/wp-json/wc/v3/*`
- 62 productos publicados, checkout funciona
- No se toca durante el cutover

### Bloqueador #1: NO HAY GITHUB REMOTE
```
$ git remote -v
(vacío)
```
Cloudflare Pages necesita repo Git para build automático. Hay que crear repo y push de `redesign-v2`. **Decisión owner: público o privado.**

### Bloqueador #2: Cloudflare Pages project no existe aún
Una vez con repo, hay que crear el proyecto Pages apuntando a `redesign-v2`.

---

## Estrategia de cutover (recomendada)

**Mantener WooCommerce en HostGator, mover sólo el frontend público a Cloudflare Pages.**

Razones:
- WC vende. No se toca.
- HostGator sirve la API REST de WC para checkout y para el build estático de Astro.
- Cloudflare Pages sirve las páginas estáticas Astro a apex y www directamente.
- Rollback: cambiar DNS de vuelta a HostGator (15 min).

URLs después del cutover:
- `wenumapuonline.com` y `www.wenumapuonline.com` → Cloudflare Pages (Astro estático)
- `www.wenumapuonline.com/wp-json/*` → HostGator (WC API; preservado por path o por subdomain alterno)
- `www.wenumapuonline.com/wp-admin/*` → HostGator (acceso admin WC)
- `www.wenumapuonline.com/checkout` → HostGator (WC checkout, no estático)
- `www.wenumapuonline.com/producto/<slug>` → mantener legacy WP O redireccionar 301 a `/p/<sku>` Astro (decisión owner)

Punto clave: hay que decidir qué rutas legacy WP migrar a Astro y cuáles dejar pasar al backend HostGator.

---

## Checklist de ejecución

### Pre-cutover (puede ejecutarse hoy sin afectar producción)

- [ ] **Snapshot WP legacy** — backup completo HostGator (DB + uploads + theme actual) antes de cualquier cambio
- [ ] **Crear repo GitHub** `wenu-frontend` (decisión owner: privado recomendado)
- [ ] **Push branch `redesign-v2`** y `main` a GitHub
- [ ] **Crear proyecto Cloudflare Pages** apuntando a repo, branch `redesign-v2`
  - Build command: `npm run build`
  - Build output: `dist`
  - Node version: 24.14.1 (variable de entorno `NODE_VERSION=24.14.1`)
  - Variables de entorno requeridas: `WOOCOMMERCE_URL`, `WOOCOMMERCE_KEY`, `WOOCOMMERCE_SECRET` (mismas que `.env` local)
- [ ] **Verificar preview deploy** en `<project>.pages.dev` antes de DNS swap
- [ ] **Smoke-test preview**:
  - Homepage carga
  - 3 PDPs al azar cargan
  - `/material/*` cargan (Task 2)
  - `/collection/*` cargan (Task 5)
  - `/journal/*` cargan (Task 4)
  - Footer muestra `marimari@` y `+1 (408)`
  - Trust block + RelatedPieces visibles en PDP (Task 6)

### Cutover (DNS swap)

- [ ] **Cloudflare → Custom Domains en Pages project** → agregar `wenumapuonline.com` y `www.wenumapuonline.com`
- [ ] **Cloudflare DNS** → actualizar A/CNAME del apex y www para apuntar al endpoint Pages (Cloudflare lo hace automático al agregar Custom Domain)
- [ ] **TTL bajo (60s)** antes del swap por si hay rollback
- [ ] **Verificar resolución**: `dig wenumapuonline.com` debe apuntar a Pages
- [ ] **Verificar HTTPS válido** en ambos apex y www
- [ ] **Verificar API WC sigue accesible** vía `https://www.wenumapuonline.com/wp-json/wc/v3/products` (debería seguir funcionando si Pages tiene Worker o regla que mande `/wp-json/*` al origen HostGator — o alternativa: cambiar `WOOCOMMERCE_URL` a subdominio nuevo `api.wenumapuonline.com` previamente configurado)

### Path WC API: dos alternativas (decisión owner)

**Alternativa A — Subdomain dedicado (recomendado)**
- Crear DNS `api.wenumapuonline.com` → CNAME a `<host>.hostgator.com` (origen actual)
- Actualizar `WOOCOMMERCE_URL` en `.env` de wenu-agent-hub Y en variables Pages a `https://api.wenumapuonline.com`
- Rebuild Astro con nueva URL
- Cleaner. No requiere Worker.

**Alternativa B — Worker que enruta `/wp-json/*` y `/wp-admin/*` al origen**
- Crear Cloudflare Worker que intercepta esas rutas y proxea a HostGator
- Más complejo, evita cambiar `WOOCOMMERCE_URL`

### Post-cutover

- [ ] **Redirects 301** de URLs legacy WP a rutas Astro nuevas (preservar SEO):
  - `/?p=<id>` → mapear a `/p/<sku>` si aplica
  - Lista exacta: pendiente de auditoría con `internal-link-audit.md`
- [ ] **Sitemap nuevo** publicado en `/sitemap-index.xml` (Astro lo genera, verificar)
- [ ] **Google Search Console** → re-submit sitemap
- [ ] **Verificar Schema.org JSON-LD** (LocalBusiness, Product) — Task ya incluyó esto
- [ ] **Monitoreo 24h**: Cloudflare Analytics + WC orders, comparar baseline

### Rollback (si algo falla)

1. Cloudflare → Pages → Custom Domains → quitar `wenumapuonline.com` y `www.wenumapuonline.com`
2. Cloudflare DNS → restaurar A/CNAME originales hacia HostGator
3. Tiempo de propagación: <5 min con TTL bajo
4. Tienda vuelve al estado pre-cutover

---

## Decisiones owner pendientes antes de ejecutar

1. **¿Repo GitHub público o privado?** (recomiendo privado)
2. **¿API WC vía subdomain `api.wenumapuonline.com` (Alt A) o Worker (Alt B)?** (recomiendo Alt A)
3. **¿Rutas legacy `/?p=ID` se redirigen o se dejan vivas en WP?**
4. **¿Cutover hoy o agendado?** (apex está roto YA, hay urgencia)

---

## Estimación de tiempo

- Pre-cutover (repo + push + Pages project + smoke-test preview): **45-60 min**
- Cutover DNS + verificación: **15-30 min**
- Verificación 24h post-cutover: pasivo

Total trabajo activo si todo OK: **~1.5 horas**.
