---
tipo: plan
proyecto: KODEX / WENU MAPU
fecha: 2026-07-27
estado: pendiente-ejecucion
---

# Distribución multi-plataforma — bagaje creativo a disposición de todos

Visión de Ocin (2026-07-27): poner TODO su bagaje creativo a disposición de la gente en
múltiples plataformas y dar valor con ello. Repos de herramientas, logos, juegos,
experiencias, códigos interesantes, imágenes del proyecto y productos — en GitHub,
Pinterest, Etsy, NFT — con presencia en el sitio "solo cuando sea necesario", no fija.

Base: [[auditoria-bagaje-creativo-2026-07-27]] (36 activos catalogados).
Relacionado: [[kodex-pinterest-kit-2026-07-27]] · [[kodex-apis-credenciales-2026-07-27]] ·
[[kodex-packs-hosting-2026-07-27]] · [[project_kodex_microsite]].

## Principio: PREPARAR (agente) vs PUBLICAR (Ocin)

Cada plataforma necesita la cuenta/token de Ocin para publicar. El agente prepara todo,
abre la ventana o toma el token que Ocin pega. **Nunca maneja passwords ni firma
transacciones.** Nada de secretos en repos públicos.

## 1 — Links contextuales en el sitio (código — agente)

Componente discreto de "plataformas" que aparece SOLO donde tiene sentido (KODEX store,
fin del RETURN, footer de KodexShell), NO fijo en toda pantalla — "solo cuando sea
necesario". Reusar el patrón `socials` de `src/components/Footer.astro`
(IG @wenu__mapu / Facebook wenumapu8 / WhatsApp / Email) y sumar **GitHub · Pinterest ·
NFT (OpenSea)**. Cada link se activa cuando su URL exista; hasta entonces oculto o "soon".
Estética KODEX (cian/verde, glitch sutil), cero chrome comercial.

## 2 — GitHub: repos open-source (agente PREPARA · Ocin PUBLICA)

De la auditoría cat. (B) herramientas y (D) juegos/experiencias:
- Herramientas: micro-CLI imágenes (clean-images + gen-avif), `security.ts`,
  `perceptual-hash.mjs`, providers LLM local-first, sistema de emails dark-mode,
  technical-sheet HTML→PDF, obsidian-memory, gemini-image, widget Kai, skeleton WebAR.
- Juegos / experiencias: KODEX WORLD (WebGL2), portal `/experience`, manifiesto AR.

El agente por cada repo: **quita `.env`/secretos/rutas absolutas**, escribe README + LICENSE,
deja listo para publicar. Ocin: `git push` a su GitHub (o el agente en terminal si Ocin
está logueado con `gh`).
- NO PUBLICAR (corrupto): `prompts-arquitecto.md`, `prompts-ingeniero.md`.
- NO PUBLICAR (privado): estrategia financiera / mercado / BMC.

## 3 — Pinterest: imágenes con tags profesionales (kit del agente · Ocin PINEA)

Ya existe [[kodex-pinterest-kit-2026-07-27]]. Ampliar: subir imágenes de KODEX + productos +
todo lo funcional/gratis al Pinterest de WENU MAPU, cada pin con título, descripción SEO,
**TAGS profesionales** y link target. Pinterest no se automatiza desde acá (host bloqueado)
→ Ocin pinea con el kit, o vía Pinterest API con token.

## 4 — Etsy: productos en Etsy (Ocin YA hizo una integración)

Ocin ya integró Etsy. Multi-plataforma: listar ahí los productos digitales/prints. Etsy
tiene API — con token de Ocin el agente crea listings, o vía Printful↔Etsy sync.
**Primero preguntar a Ocin QUÉ integración ya hizo** (¿Printful↔Etsy? ¿Etsy API directo?
¿App conectada?) para no duplicar. Ocin: generar/pegar token Etsy.

## 5 — NFT

Ver Job 5 del flujo KODEX: agente prepara la colección (imágenes + metadata + estructura);
minteo/firma/wallet = Ocin. El link de la colección alimenta el punto 1.

## Secuencia sugerida

1. Punto 1 (links contextuales) — el agente lo codea ya; los hrefs se rellenan a medida
   que cada plataforma va online.
2. Punto 2 (GitHub) en paralelo — preparar repos, Ocin pushea de a uno.
3. Punto 3 (Pinterest) — Ocin pinea con el kit ampliado.
4. Punto 4 (Etsy) — tras confirmar qué integración ya existe.
5. Punto 5 (NFT) — al final.
Verificar en vivo tras cada cambio de sitio. No borrar material sin permiso.
