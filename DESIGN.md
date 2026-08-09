# DESIGN.md — convención de UI para agentes

Leé este archivo **antes** de escribir cualquier UI en este repo. No es documentación
de referencia: es el contrato que hace que agentes distintos (Claude, Codex, Antigravity,
Hermes) produzcan lo mismo en vez de once dialectos.

Es la versión raíz del **KIT PROTOCOL**. Los kits en `kodex-modules/` mandan sobre este
archivo cuando trabajás dentro de uno; este archivo manda cuando no hay kit.

---

## 1. De dónde salen los valores

**Nunca hardcodear un hex, un tamaño de fuente ni un spacing.** Todo sale de tokens:

| Archivo | Qué define |
|---|---|
| `src/styles/tokens.css` | paleta base del sitio, escala tipográfica, spacing |
| `public/assets/kodex/kodex-tokens.css` | INTERFACE DNA del KODEX (importado por `kodex.css`) |
| `src/styles/kodex.css` | sistema tipográfico KODEX v2 + estilos del codex paginado |
| `src/styles/kodex-universe.css` · `kodex-motion.css` | registros de universo y movimiento |
| `src/styles/global.css` | reset y clases reusables del sitio público |

Si falta un token, **expandí** el archivo de tokens. No lo reemplaces ni lo dupliques
en el componente.

## 2. Tipografía KODEX — roles, no gustos

Cada familia tiene un rol asignado. No las intercambies por preferencia:

- **Barlow Condensed** (600–900) — titulares monumentales y comandos
- **Inter Tight** — navegación, botones, paneles, texto breve
- **IBM Plex Mono** — datos, coordenadas, IDs, telemetría, microcopy
- **Oxanium** — máquina, portal y cosmology. **No** en todos los títulos
- **Libre Baskerville** — cuerpo editorial largo

Las familias se cargan desde `Base.astro` vía `kodexFonts`. Si pedís una familia que no
está en esa lista, la página se dibuja con las fuentes del sistema y el KODEX se cae solo.

Fuera del KODEX (sitio público) rige la decisión del owner de 2026-05-30: Instrument
Serif / Cormorant Garamond / Instrument Sans / JetBrains Mono, y **no se migra**.

## 3. Namespacing

- Todo selector del codex va prefijado `.kx-`. El CSS del KODEX es global; el prefijo
  es lo único que evita que se derrame sobre el sitio público.
- Sólo las páginas KODEX importan `kodex.css`.

## 4. Reglas duras

- Mobile-first, o paridad mobile/desktop. No es opcional.
- Reusar clases de `global.css` antes de crear nuevas.
- Honrar `prefers-reduced-motion` en toda animación.
- Cada fase pasa `npm run build` limpio antes del commit.
- Toda foto cruda nueva pasa por `scripts/clean-images.mjs` y `scripts/gen-avif.mjs`.

## 5. La regla que se rompe más seguido

En la cadena de producción visual (SOURCE → SCAFFOLD → LIVE LAYERS → NATIVE →
FRONTIER AUDIT → OCIN ACCEPT → INTEGRATE):

> **Visual% y Native% suben JUNTOS. Está prohibido inflar Visual con lamina-skin.**

Una escena que se ve terminada porque tiene la referencia pegada como capa hero no está
terminada: está en SCAFFOLD. El scaffold es un paso legítimo y declarado, no un logro.
Lo que la mueve a NATIVE es código que reemplaza la imagen, no CSS que la disimula.

Corolario del método: **no se redibuja la referencia en código.** Se usa la imagen como
base y se le codea la vida encima (`KodexEffectCanvas` de la Effect Foundry). Intentar
clonar arte AI pixel a pixel es tiempo quemado.

## 6. Verificación

Antes de declarar una escena lista, medila en el browser real — no de memoria ni de
screenshot viejo:

```bash
playwright-cli open http://localhost:4321/<ruta>
playwright-cli find "<texto o componente>"
playwright-cli eval "() => getComputedStyle(document.querySelector('.kx-...')).opacity"
playwright-cli close
```

Eso es FRONTIER AUDIT: real vs fachada. Ver `KODEX-HERRAMIENTAS.md` para el toolkit
completo (img2threejs, Taste Skill, Playwright CLI).
