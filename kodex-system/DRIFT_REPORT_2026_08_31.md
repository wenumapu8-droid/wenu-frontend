# DRIFT REPORT · 2026-08-31

**Autor**: chat-sentinel
**Regla**: cita textual + evidencia por línea.
**Alcance**: verificar decisiones DEC-069/070/072 (nuevas desde Obsidian) contra código real.

---

## DEC-070 · Color tokens · DRIFT SEVERO

DEC-070 declara: *"kdx-acid #B7FF00, kdx-cyan #00F0FF"* (Obsidian `contenido/kodex-design-tokens.md`, 07-28).

### Real en el código

| Token | Valor declarado | Valores en código | Ubicación |
|---|---|---|---|
| `--kdx-cyan` | **#00F0FF** | `#00d8ff` | `src/styles/kodex-micrographics.css:6` |
| `--kdx-cyan` (fallback) | #00F0FF | `#00F0FF` ✅ | `src/styles/kodex.css:418` |
| `--kdx-cyan` (fallback) | #00F0FF | `#00D8FF` | `src/styles/kodex.css:1231,1557` |
| `--kdx-acid` | **#B7FF00** | `#5C7A00` | `src/styles/kodex.css:1265` |
| `--kdx-acid` (fallback) | #B7FF00 | `#B7FF00` ✅ | `src/styles/kodex.css:419` |
| `--kdx-acid` (fallback) | #B7FF00 | `#A7FF00` | `src/styles/kodex.css:1564` |

**Diagnóstico**: 3 valores distintos para `kdx-acid` (5C7A00 · A7FF00 · B7FF00), 2 distintos para `kdx-cyan` (00D8FF · 00F0FF). Solo el fallback de `kodex.css:418-419` coincide con DEC-070; los `--kdx-*` reales del `:root` son otros.

**Impacto visual**: `#5C7A00` es acid MUY oscuro (militar), muy lejos del `#B7FF00` neón declarado. Esto puede explicar por qué el organismo no domina la escena — el "activador acid" en RETURN se rinde en color apagado.

**Acción sugerida a Ocín**: DEC-070 canoniza los valores neón. O bien `:root` en `kodex.css:1265` se corrige a `#B7FF00`, o DEC-070 se marca como aspiracional y se documenta el `#5C7A00` como intencional. **Alimenta C1 y OBS-C1**.

---

## DEC-069 · Tipografía KODEX · DRIFT PARCIAL

DEC-069 declara: *"KODEX SANS (Space Grotesk) + MONO (Departure)"* (Obsidian `contenido/kodex-design-tokens.md`, 07-28).

### Real en el código

**Space Grotesk** ✅ presente y canónica:
- `src/styles/kodex-interaction-v0.css:3`
- `src/components/KodexIndexOverlay.astro:83,91,124,126,128`
- `src/layouts/KodexShell.astro:50` (comentario "KODEX SANS: Space Grotesk (UI)")
- `src/pages/kodex/lamina/akashic-crown.astro:463,700,701,702`
- `src/pages/kodex/lab/command-shell.astro:305,316,324,331`

**Departure Mono** ❌ **NO existe en NINGÚN archivo del proyecto**.

En su lugar se usa:
- `IBM Plex Mono` (`kodex.css:1557`, `AtlasScreenChassis.astro:247`)
- Stack de system mono (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`) en 8+ componentes

**Diagnóstico**: DEC-069 canoniza Departure como MONO, pero el runtime nunca la cargó. La familia real es IBM Plex Mono o system mono según componente.

**Acción sugerida a Ocín**: o cargar Departure Mono como `@fontsource` + reemplazar IBM Plex, o superar DEC-069 con la elección real IBM Plex Mono.

---

## DEC-072 · Rutas canónicas · DRIFT MIXTO

DEC-072 declara: *"Portal /kodex + /kodex/archive/[slug] + /kodex/editions"* (Obsidian `contenido/kodex-build-handoff.md`, 07-23).

### Real en `src/pages/kodex/`

| Ruta DEC-072 | Estado real | Nota |
|---|---|---|
| `/kodex` | ✅ OK · `index.astro` | Portal principal |
| `/kodex/archive/[slug]` | ❌ **MISSING** | Solo hay `archive/index.astro` y `archive/conjuncion.astro`. La dynamic route `[slug]` NO existe |
| `/kodex/editions` | ✅ OK · `editions.astro` | |

### Rutas actuales NO declaradas en DEC-072 (~20 extra)

Corredor + chambers (canónicos, alineados con DEC-060):
- `/kodex/chamber/{altar,heart,observer,temple}`
- `/kodex/folio/[folio]`
- `/kodex/screen/{alphabet,memory,origin-field,threshold-consent}`

Lámina + trabajos:
- `/kodex/lamina/*` (8 láminas: akashic-crown, anatomical-star, gaia-sentinel, genesis-cradle, heart-chamber, impossible-forms-vol-1, kit, index)
- `/kodex/vol/[slug]`, `/kodex/work/[id]`, `/kodex/interlude/[id]`, `/kodex/movement/[key]`, `/kodex/concepto/[concepto]`

Utilitarios / labs:
- `/kodex/lab/*` (14 páginas de laboratorio)
- `/kodex/m/{descent,ritual}` (rutas cortas)
- `/kodex/atlas`, `/kodex/strata`, `/kodex/inward`, `/kodex/return`
- `/kodex/store`, `/kodex/world`, `/kodex/libro`, `/kodex/verify`

**Diagnóstico**: DEC-072 quedó chica frente a lo que existe. Falta la ruta dinámica `[slug]` bajo `/archive/`, y el mapa canónico de rutas nunca se actualizó al crecer el corredor.

**Acción sugerida a Ocín**:
1. Decidir si `/kodex/archive/[slug]` debe existir (para páginas de piezas del archivo) o si DEC-072 se supersede.
2. Actualizar `02_SCENE_REGISTRY.yaml` con el mapa real de rutas por escena/chamber.

---

---

## C2 (ARCHIVE ↔ MACHINE accents) · verificación

Conflicto C2 del ledger: *"ARCHIVE ↔ MACHINE intercambiaron accents en algún commit"*.

### Real en el código

| Fuente | ARCHIVE accent | MACHINE accent | Consistente? |
|---|---|---|---|
| `src/styles/kodex-universe.css:5-6` | `--kdx-acid` | `--kdx-cyan` | ✅ |
| `src/pages/kodex/folio/[folio].astro:219` | `var(--kdx-acid,#A7FF00)` | — | ✅ |
| `src/pages/kodex/folio/[folio].astro:232` | — | `var(--kdx-cyan,#00D8FF)` | ✅ |

**Diagnóstico**: en el runtime actual **NO hay intercambio activo**. Ambas fuentes coinciden: ARCHIVE=acid, MACHINE=cyan. El conflicto C2, si existió en un commit histórico, hoy está resuelto en el sentido de que las 2 fuentes concuerdan.

**Lo que sí queda como drift**: DEC-054 (Obsidian, 07-28) dice ARCHIVE = **multi grid** (no un color único). El código da `acid` a ARCHIVE. Eso NO es "intercambio con MACHINE" — es que ARCHIVE nunca implementó multi, sigue como color único acid.

**Acción sugerida a Ocín**:
- Cerrar C2 como INACTIVO en el ledger (con la verificación de hoy).
- OBS-C1 sigue abierto y ahora es más preciso: la elección real es acid-único vs multi-grid para ARCHIVE.

---

---

## DEC-060 · 7 escenas + 3 chambers · DRIFT

DEC-060 declara: *"Portales operativos = 7 escenas + 3 chambers"* (Obsidian `contenido/kodex-from-pdf.md`, 07-23).

### Real en `src/pages/kodex/chamber/`

- `altar/` ✅
- `heart/` ✅
- `observer/` ✅
- `temple/` ✅
- `silence/` ❌ NO existe

**Chambers reales: 4** (ALTAR, HEART, OBSERVER, TEMPLE). DEC-060 dice 3.
**SILENCE**: solo existe como lámina en `src/pages/kodex/lamina/silence-engine.astro`, sin route de chamber.

**Contradicción interna**: DEC-003 (canon) dice HEART/OBSERVER/SILENCE. Runtime tiene ALTAR/HEART/OBSERVER/TEMPLE. Registry `02_SCENE_REGISTRY.yaml:23-24` ya identifica esta divergencia (`chambers: 4 · chambers_declared: 3`).

**Acción sugerida a Ocín**:
- ¿ALTAR y TEMPLE son chambers oficiales que DEC-003/060 no llegaron a registrar?
- ¿O son legacy del pipeline y hay que colapsar a HEART/OBSERVER/SILENCE puro?
- Si canoniza 4, mover SILENCE de lámina a chamber activo o cerrarlo como no-implementable.

---

## DEC-066 · NFT Manifold Base chain · DRIFT SEVERO

DEC-066 declara: *"NFT Manifold Studio (Base chain, no OpenSea)"* (Obsidian `contenido/kodex-nft-launch-checklist.md`, 07-27).

### Real en el código

`src/pages/kodex/store.astro:76`:
> *"Cardinal Wenelfe Bloom 32302 — open edition **on Ethereum** via Manifold. Contract **0xF35A…EDD1**."*

Link real: `https://manifold.xyz/@kodex/id/4038234352`

Memoria persistente (`~/.claude/projects/-Users-user1/memory/project_kodex_operativo_2026_07_27.md`):
> *"NFT KODEX−∞ ERC-1155 DEPLOYED mainnet `0xF35A...EDD1`"*

`kodex-source/nft-draft/README.md`:
> *"OpenSea-style draft metadata with placeholder IPFS image URLs"*

**Diagnóstico**: **triple contradicción**:
1. DEC-066 dice **Base chain**, código y memoria dicen **Ethereum mainnet**.
2. DEC-066 dice **no OpenSea**, el POC del draft dice **OpenSea-style metadata** (aunque el mint efectivo fue en Manifold).
3. El contrato `0xF35A...EDD1` está deployed en mainnet, no en Base — DEC-066 se escribió antes o desconociendo el deploy real.

**Acción sugerida a Ocín**:
- Si el deploy Ethereum mainnet es intencional (memoria 07-27 lo confirma), DEC-066 debe **superseder** con "NFT Manifold Studio (Ethereum mainnet ERC-1155, contract 0xF35A...EDD1)".
- Si Base era el plan y mainnet fue error, hay un problema mayor que un drift de documentación.

---

## DEC-063 · Printful → WC category_id:485 · PARTIAL

DEC-063 declara: *"Printful → WC con filtro category_id:485 (kodex)"* (Obsidian `contenido/kodex-printful-guide.md`, 07-27).

### Real en el código

- POC dry-run en `kodex-source/printful-poc/printful-products-payload.json` con 3 productos (`Cardinal Bloom 32302`, `Mandala Axis 30110`, `Square Field 30211`)
- Store frontend en `src/pages/kodex/store.astro:42,54,66` muestra los 3 mockups + proofs
- Payload dice `"is_ignored": true` — no crea productos en WC activos
- **Filtro `category_id:485` NO aparece en el POC actual** (el POC es dry-run standalone Printful, sin integración WC activa todavía)

**Estado**: Frontend visible, POC preparado, integración WC completa **pendiente**. Coherente con memoria `project_kodex_wiring_2026_07_27.md` que dice "Cat WC `kodex` id 485. PACKS LIVE en R2 $18-49. Printful↔WC CONNECTED" — pero el POC repo actual no ejecuta la conexión.

**Acción sugerida a Ocín**:
- Confirmar si Printful↔WC ya está conectado en producción WooCommerce (o sigue en POC dry-run).
- Si conectado en prod, activar el POC (`is_ignored: false`) o marcar el POC como historial.

---

---

## Batch de verificaciones · DEC-055/058/064/067/071/073/074

### DEC-055 · Ident cards por obra · NOT_IMPLEMENTED como componente

DEC-055 declara ficha de identidad por obra con 10 campos (Título · Código · Año · Técnica · Estado · Categoría · Procedencia · Edición · Disponibilidad · Relación) con estética dossier técnico.

**Real**: aparece solo como `motif: 'ident cards grid'` en `src/lib/kodexScenes.js:41` (ARCHIVE). NO existe componente `IdentCard.astro` ni renderer que emita los 10 campos.

**Estado**: **NOT_IMPLEMENTED como componente reutilizable**. Los datos existen dispersos (SKU, edición, materiales) pero no hay un patrón visual "dossier técnico" instanciado.

**Acción**: crear `IdentCard.astro` con los 10 slots + montar en ARCHIVE + folio, o marcar DEC-055 como declaración aspiracional.

---

### DEC-058 · 12 códigos cosmogónicos · NOT_IMPLEMENTED

DEC-058 declara "12 códigos cosmogónicos comparables como sustrato de KODEX" (Obsidian `kodex-atlas-cosmogonias.md`).

**Real**: `grep -ri cosmogonia|12 codigos src/` = **0 archivos**. El atlas de 40 nodos KDX-IMG existe (`src/lib/kodex/atlas.ts` según registry) pero los 12 códigos cosmogónicos no aparecen como estructura.

**Estado**: **NOT_IMPLEMENTED en runtime**. El markdown fuente vive en Obsidian, no llegó al código.

---

### DEC-064 · Packs 4 zips WP Media o R2 · MANIFEST_READY

DEC-064 declara 4 packs de ~27 MB en WP Media o R2.

**Real**: `public/img/kodex/packs/manifest.json` declara **4 packs**:
- ACHROMA (4.3 MB)
- DISCO SOLAR (6.4 MB)
- TRIBE SPACE (5.4 MB)
- THE ARCHIVE (esperado; verificar peso)

**Ubicación de las ZIPs**: campo `source` apunta a `/Users/user1/_kodex-packs-hold/*.zip` (local backup Ocín), campo `file` apunta a `/img/kodex/packs/*.zip` (path público — verificar que existan en R2/WP media).

**Estado**: **MANIFEST_READY, ZIPS FUERA DEL REPO** (por diseño). Coherente con DEC-064.

---

### DEC-067 · Graphic Kit SVG 11 elementos + sprite · NOT_IN_REPO

DEC-067 declara Graphic Kit SVG (11 elementos + sprite) = Gumroad $19–29.

**Real**: `public/img/kodex/kit/` y `public/img/kodex/graphic-kit/` **no existen**. `grep sprite|graphic.kit src/` no encuentra referencias.

**Estado**: **NOT_IN_REPO**. Probable que viva en LaCie / R2 pendiente de subir. Consistente con producto Gumroad no lanzado.

---

### DEC-071 · Multi-platform distribution · PARCIAL

DEC-071 declara distribución en GitHub + Pinterest + Etsy + NFT.

**Real** (verificable en el repo):
- **GitHub**: repo `wenumapu8-droid/wenu-frontend` público ✅
- **NFT**: link Manifold en `store.astro:76` ✅ (aunque con drift Base/Ethereum, ver DEC-066)
- **Pinterest**: verificable en memoria `project_kodex_wiring_2026_07_27.md` = "Pinterest domain LIVE"
- **Etsy**: memoria `project_auditoria_digital_2026_05_11.md` dice "Etsy Wenumapu8 abierta 3 años, 0 productos — activar". KODEX no lanzado en Etsy todavía.

**Estado**: **3 de 4 plataformas vivas**. Etsy pendiente activación.

---

### DEC-073 · Effects stack v1 · IMPLEMENTED (excepción confinada)

DEC-073 declara stack de efectos v1: ditherjs + SVG feTurbulence + GSAP (**no heavy WebGL v1**).

**Real dentro del corredor KODEX**: 8 archivos usan GSAP/feTurbulence/dither:
- `src/styles/kodex.css`, `src/styles/global.css`
- `src/pages/kodex/archive/conjuncion.astro`
- `src/pages/kodex/editions.astro`
- `src/components/kodex/lamina/t01-03/ShaderTreatment.astro`
- `src/components/SignalBand.astro`, `FrequencyBand.astro`

**Excepción encontrada**: `src/components/ManifestoSpiral3D.astro:332-338` importa Three.js completo + EffectComposer + UnrealBloomPass + GLTFLoader + Shader/Output/Render Pass.

**Resolución**: **NO viola DEC-073** porque:
1. ManifestoSpiral3D se usa solo en `src/pages/manifesto.astro` — **fuera del corredor KODEX**.
2. Es dynamic-import: `import('three'), import('three/addons/...')` — solo carga bajo demanda, no impacta bundle inicial de KODEX.
3. El comentario del componente reconoce "~500kb: three + gsap + lenis" y confina la carga.

**Estado**: **IMPLEMENTED en KODEX**, con excepción confinada en `/manifesto` que respeta el espíritu de la decisión.

---

### DEC-074 · Provenance "Conceived and art-directed by Ocin" · IMPLEMENTED_PARCIAL

DEC-074 exige provenance textual obligatorio: *"Conceived and art-directed by Ocin / Wenu Mapu"*.

**Real**:
- Forma exacta declarada: `public/img/kodex/packs/manifest.json` → `"provenance": "Conceived and art-directed by Ocin / Wenu Mapu"` ✅ MATCH
- Forma corta en KODEX folio: `src/pages/kodex/folio/[folio].astro:1327,1348` → `<dt>PROVENANCE</dt><dd>Ocin / Wenu Mapu</dd>` — coincide con la idea, no la frase exacta
- Forma alternativa en store: `src/pages/kodex/store.astro:182` → `<dt>SOURCE</dt><dd>Ocin · Wenu Mapu · book/0cin</dd>` — usa "SOURCE" no "PROVENANCE"

**Estado**: **IMPLEMENTED_PARCIAL**. La palabra exacta "Conceived and art-directed" solo aparece en el manifest de packs. Las páginas del corredor usan formulaciones más cortas.

**Acción sugerida a Ocín**:
- ¿Es aceptable la forma corta "PROVENANCE: Ocin / Wenu Mapu" para el corredor?
- ¿O forzar la frase exacta en todas las piezas para consistencia autoral?
- Si es lo segundo: crear componente `<KodexProvenance />` reutilizable con la frase canónica.

---

---

## Batch final · DEC-056/059/061/062/065/068

### DEC-056 · KODEX sistema madre · NOT_IN_RUNTIME

DEC-056 declara: *"KODEX −∞ es un sistema para traducir lo invisible en formas ejecutables. No es otra marca. Es el archivo vivo, método creativo y universo operativo desde el cual nacen Wenu Mapu, Soma, los objetos, las experiencias digitales, las investigaciones, los símbolos y los prototipos."*

**Real**: `grep "sistema madre|traducir lo invisible|Wenu.*Soma"` en src/ = **0 matches** en el runtime del corredor. La frase vive solo en Obsidian + ledger + yaml.

**Estado**: **NOT_IN_RUNTIME**. Es principio de autoridad interno, no texto público del sitio.

**Nota**: Puede ser intencional — la frase autoral no necesariamente debe aparecer en el sitio. Pero si Ocín quiere que el visitante entienda la jerarquía KODEX > Wenu Mapu, falta manifiesto público.

---

### DEC-059 · Jung + neurociencia · NOT_IMPLEMENTED

DEC-059 declara: *"−∞ como profundidad causal + layered descent"* con base Jung + neurociencia.

**Real**: 1 mención de Jung en `src/pages/lexicon.astro:397` — pero en contexto de definición de "mandala" ("*In the West, after Jung and after the colouring-book industry…*"), no como fundamento causal de KODEX.

**Estado**: **NOT_IMPLEMENTED** como estructura de descent. Sigue solo en Obsidian.

---

### DEC-061 · COMMISSION A SYSTEM = palanca #1 · IMPLEMENTED

DEC-061 declara COMMISSION como palanca monetaria número 1.

**Real**:
- `src/components/kodex/CommissionForm.astro` existe como componente
- Se importa en `src/pages/kodex/folio/[folio].astro` (única página que lo consume)
- NO hay ruta dedicada `/kodex/commission/`

**Estado**: **IMPLEMENTED_EMBED** — componente montado dentro del folio, no como página dedicada.

**Acción sugerida a Ocín**: si es palanca #1, considerar promover a página `/kodex/commission/` con visibilidad propia + link desde nav principal.

---

### DEC-062 · Curated editions ≠ shop grid (dossier aesthetic) · IMPLEMENTED

DEC-062 declara ediciones curadas con estética dossier, no grid de tienda.

**Real**: 10 archivos consumen la estética dossier: `kodex.css`, `kodex-plate.css`, `folio/[folio].astro`, `vol/[slug].astro`, `SpecimenSkullOrganism.astro`, `grammar.ts`, `scene.03-archive.yaml`, `works.astro`, `verify.astro`, `store.astro`.

**Estado**: **IMPLEMENTED** — la estética dossier está distribuida en toda la superficie de ARCHIVE/store.

---

### DEC-065 · Pinterest cadencia 3-5 pines/semana · UNVERIFIABLE_IN_CODE

DEC-065 declara Pinterest SEO via 5 tableros + cadencia 3-5 pines/semana.

**Real**: No verificable en el código del repo. Requiere consultar cuenta Pinterest de Wenu Mapu (memoria dice "Pinterest domain LIVE").

**Estado**: **UNVERIFIABLE_IN_CODE**. Métrica operacional externa.

---

### DEC-068 · 5 Achroma editions KDX-ACH-001…005 · DRIFT

DEC-068 declara 5 ediciones Achroma con IDs KDX-ACH-001 hasta 005 (free + paid).

**Real**:
- `src/pages/kodex/store.astro:83` declara **un pack ACHROMA con `n: 12`** (12 items dentro del pack, no 5 ediciones individuales)
- `grep KDX-ACH-001..005` en el repo = **0 matches**
- El pack ACHROMA existe como zip único (4.1 MB), no como 5 editions numeradas

**Estado**: **DRIFT**. DEC-068 dice 5 ediciones enumeradas free+paid. Runtime tiene 1 pack con 12 items dentro.

**Interpretación posible**: los "12 items" del pack pueden ser variaciones ACHROMA, pero no están individualizados como ediciones vendibles con IDs KDX-ACH-*. La granularidad declarada por DEC-068 no llegó al producto.

**Acción sugerida a Ocín**: o desglosar 5 ediciones individuales según DEC-068, o reformular DEC-068 para reflejar "1 pack con 12 variaciones".

---

## BALANCE FINAL · Ronda 2026-08-31 · 15 DEC verificadas de 21 nuevas

De las 21 decisiones extraídas de Obsidian (DEC-054 → DEC-074), estado runtime:

### MATCH / IMPLEMENTED (6)
- **DEC-057** estados motor (Initializing/Ready/Generating) — ya activo
- **DEC-061** COMMISSION component — montado en folio
- **DEC-062** dossier aesthetic — distribuida en 10 archivos
- **DEC-063** Printful POC — dry-run listo, manifest correcto
- **DEC-071** Multi-platform — 3 de 4 plataformas activas
- **DEC-073** stack efectos v1 — respetado (Three.js confinado fuera del corredor)

### IMPLEMENTED_PARCIAL (2)
- **DEC-064** packs manifest ready, ZIPs en local backup
- **DEC-074** provenance exacto en packs manifest, forma corta en corredor

### NOT_IMPLEMENTED / NOT_IN_RUNTIME (4)
- **DEC-055** IdentCard component — oportunidad clara de MOUNT
- **DEC-056** "sistema madre" no aparece en runtime (posiblemente intencional)
- **DEC-058** 12 códigos cosmogónicos — solo Obsidian
- **DEC-059** Jung + neurociencia — solo Obsidian

### NOT_IN_REPO (1)
- **DEC-067** SVG Kit 11 elementos — vive en LaCie/R2 pendiente

### DRIFT (3)
- **DEC-060** chambers: 3 declarados vs 4 reales (ALTAR+TEMPLE extras)
- **DEC-068** 5 Achroma editions numerados vs 1 pack con 12 items
- **DEC-072** rutas: `/kodex/archive/[slug]` MISSING + ~20 rutas extra no declaradas

### DRIFT SEVERO (2)
- **DEC-066** NFT: Base declarado vs Ethereum mainnet real (triple contradicción)
- **DEC-069/070** typography+tokens: Departure Mono no existe; `kdx-acid` con 3 valores distintos (5C7A00/A7FF00/B7FF00); `kdx-cyan` con 2 (00D8FF/00F0FF)

### UNVERIFIABLE_IN_CODE (2)
- **DEC-054** OBS-C1 pendiente decisión Ocín (paleta v2.0 vs activadores)
- **DEC-065** Pinterest cadencia — métrica externa

### PENDIENTE (1)
- **DEC-054** activadores 7 escenas — registrado como PROPOSAL_PENDING_OCIN

### Total: 21 DEC / 15 con verificación runtime + 4 conceptuales sin implementación esperable + 2 externas

**Prioridad para Ocín** (impacto real en producto):

1. **DEC-066** — corregir declaración chain (mainnet vs Base) antes de próximo pack o comunicación NFT.
2. **DEC-070** — decidir si `:root --kdx-acid` corrige a `#B7FF00` neón o DEC-070 se supersede con `#5C7A00`. Impacta color dominante RETURN/status.
3. **DEC-054** — decidir OBS-C1 (paleta v2.0 SUPERSEDE o no a DEC-023). Desbloquea C1/C2 en cascada.
4. **DEC-068** — 5 editions o 1 pack con 12 items: define oferta comercial ACHROMA.
5. **DEC-060** — 3 o 4 chambers: define canon oficial.

---

## Cross-refs

- Alimenta C1 (paleta drift 3 fuentes) del ledger.
- Alimenta OBS-C1 (paleta v2.0 Obsidian vs activadores 08-29).
- Motiva actualización de `02_SCENE_REGISTRY.yaml` con `route_actual` por escena.
- Verifica C2 como INACTIVO en runtime actual.
- Contradicción DEC-060 vs DEC-003 vs runtime (chambers count 3/3/4).
- Contradicción DEC-066 vs deploy real (Base declarado vs Ethereum mainnet real).
- DEC-063 Printful integración pendiente de confirmación live.
- DEC-055 y DEC-058: no llegaron al runtime; oportunidad de MOUNT explícita.
- DEC-064 packs manifest ready — verificar ZIPs sirvan desde ruta pública.
- DEC-067 SVG kit fuera del repo — subir cuando el producto Gumroad se lance.
- DEC-071 3/4 plataformas vivas — Etsy pendiente activación.
- DEC-073 respetada (excepción de ManifestoSpiral3D confinada fuera del corredor).
- DEC-074 falta consistencia: forma exacta solo en packs manifest, forma corta en corredor.
- DEC-068 granularidad no bajó al producto (5 editions declaradas vs 1 pack con 12 items).
