# RELEVO · el descenso · 2026-08-20

Para el agente que sigue. Lee esto entero antes de tocar nada.

---

## 1. Lo primero: dónde está el trabajo

```bash
git fetch origin
git log --oneline origin/redesign-v2..origin/feat/laminas-movil   # 3 commits
```

**Rama: `feat/laminas-movil`.** Tres commits, ya en `origin`, **todavía no fusionados
a `redesign-v2`**. No los fusiones: PR sin revisión del creador está prohibido.

Están **vivos en producción** aunque no estén en `redesign-v2`, porque el deploy es
Direct Upload del `dist` — `git push` NO despliega. Esa asimetría es real y hay que
tenerla presente: producción puede ir adelante de la rama de deploy.

- `d5bda553` láminas: versión móvil legible de cada plancha
- `88d67764` el descenso: las 7 escenas se ramifican hacia dentro
- `251c9a23` merge de `origin/redesign-v2` (trabajo de Kimi, u10-commons)

---

## 2. Qué pidió el creador, textual

No parafrasear esto. Son sus palabras del 20 de agosto:

> "hasta ahora uno va hacia el lado y necesitamos que vaya hacia dentro y que las
> 7 escenas se ramifiquen y encontramos más y más en cada una hasta encontrar al
> medio al corazón y vayamos como explorando constantemente el KODEX cada vez más
> profundo"

> "hacer los flujos, usar las herramientas y hacer los enlaces y las bifurcaciones,
> recuerda que la arquitectura es como una ramificación algorítmica inspirada en la
> naturaleza, o sea en la geometría sagrada del universo, y hacer el viaje distinto
> a cada persona, que según cada interacción el viaje sea distinto según las
> decisiones, los clicks etc. **esta es la máquina del KODEX**"

> "y puede ser que de una lámina tengas después 3 nuevas sub-láminas, porque
> acomodar todo el tablero sea mejor ir haciéndolo o dividiéndolo en partes para
> incorporar toda la info, la data, infográficos y copys"

> "no quiero que borres nada, sólo transformes, que KODEX se vea de la mejor forma
> posible con todo lo que hemos hecho"

> "porque todo lo que hiciste es la base, ahora falta acomodar todo"

**La regla que gobierna todo lo demás: NADA SE BORRA.** El pasillo lateral de las
siete escenas sigue intacto, el botón `NEXT →` no se movió. El descenso es una
segunda salida, no un reemplazo.

---

## 3. La especificación canónica está en el Drive, y se puede leer

Esto es importante porque se creyó lo contrario más de una vez:

```bash
ls ~/Trabajos-Aparte/KODEX/drive-docs/
```

Ahí están los 17 documentos ya bajados. El que gobierna este trabajo es
**`27-DEEP-NAVIGATION.txt`** (1.377 líneas, 2026-08-14, autoría creativa de Ocín,
síntesis de ChatGPT). Sus secciones citadas en el código:

- **§17** el puntaje de candidatos — `semanticAffinity + narrativeCompatibility +
  curatorWeight + memoryResonance + novelty + crossFieldBridge + controlledRandomness
  − recentExposure − repetition − cognitiveLoad − unsupportedClaimRisk`
- **§19** máximo 2–5 candidatos por bifurcación (el creador pidió 3)
- **§18** orientación mínima siempre visible, mapa completo sólo a pedido
- **§20** el evento de memoria guarda la elección **con las alternativas visibles**
- **§22** "no random route roulette" — nada tira un dado ciego
- **§8** cada descenso es una entrada real del historial del navegador
- **§21** la ilusión matryoshka: entré al diagrama → entré al objeto → encontré otro
  mundo dentro → volví y el mundo anterior me recordaba

Si algo del pedido te frena, la respuesta probablemente está ahí antes que en el
código.

---

## 4. Qué se construyó

```
src/lib/kodex/ruta.ts               el motor. PURO: sin DOM, sin fetch, sin reloj.
src/lib/kodex/descenso-ui.ts        la pantalla, la memoria y el botón Atrás.
src/components/kodex/os/Descenso.astro   la placa de bifurcación.
scripts/kodex/tejer-ramas.mjs       destila graph.json → public/kodex-content/ramas.json
scripts/kodex/probar-ruta.mjs       EL BANCO: mide el motor sin navegador.
src/components/kodex/lamina/kit/movil.ts   el lector móvil de las planchas.
```

La separación motor/pantalla es a propósito: la decisión se mide sin navegador y la
pantalla se cambia sin tocar la decisión. **Usá el banco antes de tocar el motor:**

```bash
node scripts/kodex/probar-ruta.mjs
```

### La geometría hace trabajo, no adorno

Regla de canon: *la matemática nunca es decorativa*. El ángulo áureo (137.507°) es
cómo ramifica una planta — el único ángulo que nunca repite alineación, por eso una
piña llena su disco sin hueco ni superposición. Acá **es la función que elige las
puertas**. La espiral en pantalla es esa misma razón: el radio se divide por φ en
cada nivel, así que la vuelta que estás pisando converge al centro a la vista. Mide
la profundidad, no la ilustra.

### Las tres puertas tienen carácter distinto

- **HILO** (`⌁`, rosa) — seguir una relación escrita del grafo
- **PUENTE** (`⌖`, azul) — cruzar de estrato
- **HALLAZGO** (`✳`, dorado) — el archivo que nadie leyó

**Por qué, y esto importa:** primero se hizo con puntaje puro y se midió. Las tres
puertas salían siempre del mismo grupo de 118 nodos curados — **121 de 1.427 nodos
alcanzables en 200 viajes**. Los otros 1.309 no tienen relación escrita ni estrato,
así que nunca podían ganar. Con papeles: **475 alcanzables**. Tres puertas
equivalentes no son una decisión.

---

## 5. Números medidos (no estimados)

**Banco** (`scripts/kodex/probar-ruta.mjs`):
- llega al corazón en 7 pasos · siempre 3 puertas · determinista
- dos personas: **0/7** pasos idénticos
- misma persona con memoria honda: **4/7** idénticos
- sin repetir nodo dentro de un mismo descenso

**Navegador**, 390×844 / 412×915 / 1440×900, escenas i/iii/vi:
- boca 48px de alto · **0 choques** con botones fijos · **0 desborde** · **0 errores JS**
- descenso completo hasta el corazón · Atrás baja un nivel · Esc sale · teclas 1–3 eligen

**Láminas en móvil**, antes → después a 390×844:
- antes: escala 0.317 · texto mediano 4.4px · **menor 3.0px** · 24 de 29 ilegibles
- después: `silence-engine` 33 bloques **16px** · `void-orchard` 92/16px ·
  `u03-return` 72/13.5px · `u10-commons` 58/13.5px · desborde horizontal 0
- `t01-03` queda sin panel a propósito: esa plancha no tiene cromo que leer

**Producción verificada** en `wenumapuonline.com` (no en `*.pages.dev`):
- `/kodex/folio/ii/` boca viva, `DEPTH 0/7`, tres puertas reales, click → `DEPTH 1/7`
- `/kodex/lamina/silence-engine/` 33 bloques, mínimo 16px

---

## 6. Trampas que ya costaron tiempo. No las repitas.

1. **"Deployment complete" NO es prueba.** Tres veces se desplegó un `dist` viejo
   porque el build había fallado y el `grep` no lo detectó. **Siempre**: bucle de
   build con reintentos → *afirmar que el HTML construido contiene el markup nuevo*
   → desplegar → **volver a medir producción con Playwright**.

2. **Los estilos de nodos creados por JS necesitan `<style is:global>`.** Astro
   estampa un atributo de scope al markup del template; un `<div>` creado en tiempo
   de ejecución nunca lo recibe y **todas** sus reglas quedan sin aplicar. Pasó con
   las tres puertas: el texto salía corrido, centrado y sin borde. **El build no
   dice nada de esto — sólo se ve mirando la captura.**

3. **Mirá la captura, no sólo las métricas.** Dos fallas reales (la tipografía
   cayendo en serif, las puertas sin estilo) pasaron todas las mediciones numéricas.

4. **`git add` + `git commit` en el checkout compartido se traga archivos de otro
   agente.** Usá `git commit -- <rutas>` o `git commit -F archivo`. Y `git add` con
   corchetes falla: `"src/pages/kodex/folio/[folio].astro"` va entre comillas.

5. **`~/kodex-work` está en `feature/journey-field-map` con cambios sin comprometer
   de otro agente.** No trabajes ahí. Usá un worktree propio.

6. **El proyecto de Cloudflare Pages se llama `wenu-frontend`, no `kodex`.**
   `--branch=redesign-v2`. Nunca `main`.

7. **Antes de desplegar, traé `origin/redesign-v2`.** Si no, tu `dist` revierte lo
   que otro agente ya publicó. Pasó y por eso está el merge `251c9a23`.

---

## 7. Reglas del creador que no se negocian

- Deploy a producción: sólo con la frase literal **`APROBAR DEPLOY`**. Sólo
  `redesign-v2`. Nunca `main`.
- **No fusionar PRs sin revisión del creador.**
- **Nunca escribir bajo `~/.hermes/` ni `~/Sinergia-Industrial/`** desde trabajo de
  KODEX. KODEX y Galvazinc comparten máquina y **nunca** conceptos, configs ni
  bitácora.
- **No inventar canon**: coordenadas A–Y, significados B–L/N–X, ni valores generados
  presentados como mediciones.
- El registro mapuche documentado **nunca** se mezcla con la ficción del Codex
  Estelar. La cita Canio & Pozo 2015 renderizada como URL no se toca sin el creador.
- Assets de terceros deben ser licenciables comercialmente (KODEX vende). Shadertoy
  es CC BY-NC-SA por defecto.
- Las dos láminas trazadas (`t01-05`, `t01-07`) no se tocan sin el creador.
- Las anotaciones manuscritas de u10 son del creador; no se inventan.
- GAIA SENTINEL: **sólo** el archivo marcado `CANON`, nunca el `VISUAL_VARIANT`.
- Ningún agente resuelve un conflicto en silencio. Nunca sobreescribir canon
  basándose sólo en una imagen de referencia. Cada tradición se estudia por
  separado — nada de "sabiduría ancestral" homogénea.
- Nada de fingerprinting, inferencia de emoción, atención o estado psicológico.

---

## 8. Honestidad del dato que hay que preservar

**1.309 de los 1.427 nodos tienen por título su propio hash** (`0050aebb-49347`).
No son un error: son especímenes que nadie nombró. La puerta dice
`UNNAMED SPECIMEN · b99a83d7`, **no** el hash disfrazado de título. Están marcados
con `sinNombre` en `ramas.json`.

Cada puerta muestra su **estatus epistémico a la vista** — `CANONICAL`, `VERIFIED`,
`INFERRED`, `SPECULATIVE`, `NEEDS_CONFIRMATION`. Lo especulativo se rotula, no se
esconde. Si tocás la interfaz, esto no se saca.

Datos que **siguen siendo falsos** y hay que arreglar o rotular:
- `asset-registry.json` asigna `allowedScenes` por directorio — es inventado
- 1.333 filas apuntan a archivos que no existen
- 331 aristas del grafo cuelgan (no resuelven a un nodo existente)

---

## 9. Lo que sigue, en orden

1. **Que la lámina misma se ramifique.** Hoy el descenso sale de la *escena*; el
   creador pidió que de una lámina salgan 3 sub-láminas. El motor ya sirve — falta
   montar `Descenso` en las planchas con el nodo de la lámina como origen.
2. **La portada-collage con su arte**, antes del umbral. Sus palabras: "antes de esa
   experiencia la portada es un collage con una imagen de mi arte".
3. **Sonidos afinados a las frecuencias de la geometría sagrada.** Hoy no coinciden
   y él lo dijo explícitamente.
4. **Fuentes, gráficos y señales por categoría** — cada página como experiencia
   completa, no como plantilla.
5. Versión móvil de las planchas que llegaron después del merge.

---

## 10. Decisiones que son del creador y bloquean trabajo

No las resuelvas por tu cuenta. Preguntale:

- **No existe autorización de obra derivada para ninguna pieza.** Esto detiene
  formalmente Golden COSMOLOGY.
- **El Principio de la Hoja** ("must not be judged pixel-for-pixel") contradice el
  banco de fidelidad de píxel con el que se hicieron las 36 láminas. Las dos cosas
  no pueden ser verdad a la vez.
- **Qué línea es la autoritativa**: PR #62 / #101 (Assembly OS + Deep Navigation en
  CI verde, que nunca llegó a la rama de trabajo) o el corredor vivo. Están 218/294
  commits separados y hacen lo mismo con física distinta.
- El campo ambiental muestreado de GAIA SENTINEL.
- KEEP / REFINE / REJECT en las 35 comparaciones pendientes.
- Si los 3 laboratorios se promueven al corredor.

---

*Escrito por el Claude del Mac mini, 2026-08-20. Si algo acá no coincide con lo que
medís, creele a tu medición y corregí este documento.*
