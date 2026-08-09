# KODEX — Herramientas de la fábrica visual

Setup instalado en el **Mac mini** el 2026-08-09. Todo vive dentro de `~/kodex-work`
o en `~/.claude/skills/`. Nada toca `~/Sinergia-Industrial`.

Estas tres herramientas sirven a etapas concretas de la **cadena de producción visual**
(SOURCE → SCAFFOLD → LIVE LAYERS → NATIVE → FRONTIER AUDIT → OCIN ACCEPT → INTEGRATE).

---

## 1. img2threejs — v1.4.4 (commit `d667338`, 2026-08-06)

Reconstruye el objeto de una imagen de referencia como **código Three.js procedural**
(reconstruction-by-code: primitivas deterministas + shaders, no fotogrametría ni mesh
extraction). Salida = una factory function TypeScript que devuelve un `THREE.Group`,
legible y diffeable, con jerarquía lista para animar.

- **Licencia:** Apache-2.0 · **Runtime:** Python 3.10+, sólo stdlib (cero pip installs)
- **Instalado en:** `~/.claude/skills/img2threejs` (git clone; `git pull` ahí para actualizar)
- **Estado verificado:** 673 tests corridos, 670 pasan. Los 3 fallos son de
  `scripts/release_metadata.py` (script de release del propio proyecto, irrelevante
  para nosotros) y tienen la misma causa raíz que se explica abajo.

### Dónde encaja en la cadena
En **NATIVE**: cuando una escena necesita geometría 3D real y hay que reemplazar el
scaffold por código. **No** sustituye el método clave — la referencia se sigue usando
como capa base y la vida se codea encima con `KodexEffectCanvas`. img2threejs es para
el objeto que sí conviene tener como geometría manipulable, no para clonar el arte.

### Cómo se invoca

**Como skill (lo normal, dentro de un agente):**
```
/img2threejs Reconstruí este objeto como modelo Three.js, respetá proporciones, ángulos y colores.
```

**Por CLI — usar SIEMPRE el wrapper `scripts/i23`, no `python3` pelado:**
```bash
scripts/i23 probe  capturas/folio-i.png                       # stage 1: sondeo técnico
scripts/i23 search "torus"                                     # stage 1: búsqueda BM25 en specs
scripts/i23 spec   "NombreObjeto" --image ref.png --out spec.json   # stage 2
scripts/i23 build  spec.json --out src/createObjectModel.ts    # stage 3
scripts/i23 version                                            # versión + intérprete resuelto
```

### ⚠ La trampa del Python en este equipo
El `python3` del sistema es **3.9.6**. img2threejs necesita **3.10+**: usa `match`
(structural pattern matching) en `forge/_shared/spec_search.py` y `typing.TypeAlias`
en `forge/stage1_intake/search_specs.py`. Invocarlo con `python3` a secas revienta con
`SyntaxError` / `ImportError` — y a veces **de forma silenciosa y parcial**: los stages
1–3 básicos arrancan igual, pero la búsqueda de specs muere.

En el equipo hay `~/.local/bin/python3.12` (3.12.13, vía `uv`). `scripts/i23` resuelve
solo el primer intérprete ≥3.10 y setea `PYTHONPATH`. **Usar el wrapper siempre.**

No cambiamos el `python3` global del sistema a propósito: es un symlink compartido y
podría afectar tooling de otros agentes fuera de este repo.

### El quality gate no es un bug
`generate_threejs_factory.py` devuelve **`BLOCKED`** y **no escribe archivo** si el spec
está en calidad blockout (falta `colorMaterialRecipe`, materiales sin PBR, un solo
componente, etc.). Es el comportamiento correcto: el spec lo escribe el agente *mirando*
la referencia; no sale de un template automático. Si ves `BLOCKED`, el próximo paso es
`refine-spec`, no insistir con el build.

---

## 2. Taste Skill — anti-slop frontends (`leonxlnx/taste-skill`)

Instalado con `npx skills add leonxlnx/taste-skill`. Deja **13 skills** en
`~/kodex-work/.agents/skills/` (universales para Codex/OpenCode/Amp/Antigravity/+12)
y symlinkeadas a `.claude/skills/` para Claude Code. Lockfile: `skills-lock.json`.

```
brandkit                    image-to-code               minimalist-ui
design-taste-frontend       imagegen-frontend-mobile    redesign-existing-projects
design-taste-frontend-v1    imagegen-frontend-web       stitch-design-taste
full-output-enforcement     industrial-brutalist-ui
gpt-taste                   high-end-visual-design
```

### Dónde encaja
En **LIVE LAYERS** y **NATIVE**, sobre el chrome vivo en DOM/SVG (medidores, waveforms,
contadores). Sirve de defensa contra el frontend genérico. `industrial-brutalist-ui` y
`high-end-visual-design` son los más cercanos al registro KODEX.

**Advertencia:** las skills corren con permisos completos de agente y no son nuestras.
Leerlas antes de usarlas. Y ninguna de ellas puede subir Visual% por su cuenta —
sigue prohibido inflar Visual con lamina-skin sin que Native% suba junto.

---

## 3. Playwright CLI — v0.1.18 (`@playwright/cli`)

Automatización de browser pensada para agentes. La diferencia con Playwright MCP:
**escribe snapshots y screenshots a disco** en vez de volcar el árbol de accesibilidad
entero al contexto; el agente lee sólo lo que necesita. ~4× más barato en tokens.

- **Instalado global:** `npm install -g @playwright/cli@latest` → `~/.local/lib`
- **Browser:** WebKit 26.5 (playwright webkit v2342) en `~/Library/Caches/ms-playwright/`;
  además detecta Chrome del sistema y lo usa por defecto
- **Skill del agente:** `.claude/skills/playwright-cli` (instalada con `playwright-cli install --skills`)
- **Workspace:** inicializado en `~/kodex-work`; artefactos de sesión van a
  `.playwright-cli/` y `.playwright/` (ambos gitignoreados)

### Dónde encaja
En **FRONTIER AUDIT**: medir la escena real en el browser — real vs fachada — sin
quemar contexto. Es la herramienta para verificar que lo que se ve es lo que se codeó.

### Cómo se invoca
```bash
playwright-cli open http://localhost:4321/kodex/lamina/...
playwright-cli find "texto"        # busca en el snapshot, devuelve nodos + refs
playwright-cli snapshot            # snapshot a disco, no al contexto
playwright-cli eval "() => getComputedStyle(document.body).background"
playwright-cli close
```
Verificado end-to-end: `open` → `find` → `close` contra example.com, snapshot escrito
en `.playwright-cli/page-*.yml`.

---

## 4. DESIGN.md — convención, no instalación

`DESIGN.md` no es un paquete: es un **markdown en la raíz del repo que los agentes leen
antes de tocar UI**, para que todos produzcan lo mismo. Es el mismo rol que ya cumple
nuestro KIT PROTOCOL. Se adopta, no se instala.

Adoptado en `DESIGN.md` (raíz), apuntando a los kits y tokens que ya existen.

---

## Resumen de invocación

| Herramienta | Se invoca | Versión |
|---|---|---|
| img2threejs | `/img2threejs <instrucción>` · `scripts/i23 <sub>` | 1.4.4 |
| Taste Skill | skills en `.agents/skills/` (por nombre) | lock en `skills-lock.json` |
| Playwright CLI | `playwright-cli <cmd>` | 0.1.18 |
| DESIGN.md | lo leen los agentes | convención |
