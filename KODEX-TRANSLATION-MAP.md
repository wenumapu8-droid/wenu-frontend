# KODEX −∞ — Mapa de traducción (segundo cerebro → píxel)

> El puente que faltaba. Para Claude Code. Cada escena ENCARNA el universo de Ocin, no solo su
> geometría. Traduce, por escena: **concepto + física + símbolo + mensaje + código → anchor +
> comportamiento + tratamiento + copy.** Complementa `KODEX-BUILD.md`, `KODEX-POLISH.md` (look del
> anchor) y `KODEX-ASSEMBLY.md` (qué paquete va dónde).

## Cómo leer este mapa (el método)

Todo lo que Ocin tiene guardado es **significado**. El código necesita ese significado partido en
4 capas concretas, siempre las mismas:

| Capa | Qué es | De dónde sale del segundo cerebro |
|---|---|---|
| **ANCHOR** | qué se ve (el foco) | su geometría real / símbolo de la escena |
| **COMPORTAMIENTO** | cómo se mueve (su física) | el concepto físico de la escena (descenso, ripple, pliegue…) |
| **TRATAMIENTO** | la piel | siempre el mismo: pixelado + dither Bayer + scanline + glow + chroma leve (KodeLife) |
| **COPY** | el mensaje | frase del lore / manifiesto, breve, monumental |
| **CÓDIGO** | la densidad de datos | IDs, coordenadas, checksums, estados — en rails/bordes, NO en el centro |

Regla de oro del look (de `KODEX-POLISH.md`): el ANCHOR es la obra de Ocin tratada como **artefacto
holográfico enmarcado**, restringido y legible. La densidad va en el CÓDIGO (rails), nunca en el centro.

## Ética Hidden Sky (regla DURA, no negociable)

Dos capas de significado, SIEMPRE separadas visual y textualmente:
- **Cosmovisión mapuche documentada** (Meli Witran Mapu, wenu mapu, antü/küyen/wüñellfe/wanglen,
  kültrún como abstracción respetuosa) → fuente: Canio & Pozo 2015. Se cita, no se inventa.
- **Codex Estelar** (Génesis de la Luz, Pacto de Nibiru, Engaño de los Templos, ADN Sagrado) →
  FICCIÓN/esotérica de Ocin. Es lore de KODEX, marcado como obra. NUNCA presentado como verdad cultural.

Nunca fundir las dos en el mismo claim. La estética puede rimar; la afirmación no.

---

## El mapa, escena por escena

### 00 · THRESHOLD — rojo (Signal Red)
- **Concepto:** el umbral. Antes de entrar hay que ser reconocido. La puerta al sistema.
- **Física:** respiración lenta de un anillo de acceso; pulso de checksum. Nada cae todavía.
- **Símbolo (anchor):** su **mandala/rosetón mapuche** enmarcado como `ARTIFACT`. La obra madre.
- **Tratamiento:** pixelación por bloques + dither rojo + scanlines + glow rojo + chroma leve, flicker sutil.
- **Copy:** headline monumental tapando parte del anchor. `WENU MAPU` / `THE ARCHIVE REMEMBERS` ·
  eyebrow `KODEX −∞ · ACCESS`. CTA `ENTER THE KODEX`.
- **Código (rails):** `SESSION ID`, `CHECKSUM`, coordenadas mínimas, `ACCESS: GRANTED`.

### 01 · PROLOGUE — violeta
- **Concepto:** ser observado / observar. El sistema mira antes de dejarte descender. (NO el ojo procedural.)
- **Física:** retícula viva que barre (scan sweep), como un campo de observación, no un ojo.
- **Símbolo (anchor):** retícula/cruz cardinal (**Meli Witran Mapu** — los cuatro puntos) en clave
  geometría imposible. Campo de observación, no figura.
- **Tratamiento:** el mismo; violeta. Sweep-line encima.
- **Copy:** `YOU ARE BEING READ` / `THE FOUR DIRECTIONS HOLD YOU`. CTA `BEGIN OBSERVATION`.
- **Código:** `NODE ID`, `PROTOCOL`, `OBSERVER STATUS: ACTIVE`, RA/DEC tenue.

### 02 · DESCENT — naranja
- **Concepto:** bajar para sostener lo que sube. El árbol que desciende. (La base que ya le gusta.)
- **Física:** **corredor/túnel imposible** que avanza + **ripple floor** (membrana viva). Descenso real.
  (Usar `public/kodex-spatial` + `public/kodex-ripple`.)
- **Símbolo (anchor):** el **árbol invertido / raíz-antena** descendiendo por el corredor.
- **Tratamiento:** el mismo; naranja. El corredor lleva scanlines de perspectiva.
- **Copy:** ya existe y gusta: `THE TREE DESCENDS TO HOLD WHAT RISES`. CTA `START DESCENT` (saltable).
- **Código:** rails `STEPWISE / STRATA / SKIP / INDEX` + profundidad `DEPTH -02`, seed.

### 03 · ARCHIVE — multi
- **Concepto:** el archivo de señales. Cada obra es un fragmento recuperado. (Aquí se COLECCIONA.)
- **Física:** grid que respira; al hover, una card se "sintoniza" (dither se aclara, glow sube).
- **Símbolo (anchor):** las **ediciones B&W reales de Ocin** (Drive `book/0cin`) como ident-cards tratadas.
- **Tratamiento:** el mismo por card; acento por fragmento. La obra real es el héroe.
- **Copy:** `SELECT A SIGNAL` · por card: título, seed, año. Ruta comercial: `COLLECT A FRAGMENT`.
- **Código:** metadata densa por card — `FRAG ID`, `SEED`, barcode, `ED. n/N`, index modular.

### 04 · MACHINE — cyan
- **Concepto:** el motor que genera señal. El sistema vivo que produce. (Aquí se COMISIONA.)
- **Física:** red de nodos / kernel latiendo; estados REALES de proceso (no falsos).
- **Símbolo (anchor):** **rosetón/kernel** de Ocin como núcleo generativo, nodos orbitando.
- **Tratamiento:** el mismo; cyan. Feedback (ping-pong) para que el kernel "recuerde" su estado.
- **Copy:** `GENERATE SIGNAL`. Ruta comercial: `COMMISSION A SYSTEM` (la palanca de dinero #1).
- **Código:** `SEED / METHOD / SOURCE / STATUS` reales: Initializing → Ready → Generating → Complete.

### 05 · COSMOLOGY — magenta
- **Concepto:** el mapa que conecta todo. El cielo como red. El rol "ventana" al ecosistema.
- **Física:** mapa orbital + **wrinkled reality** (el espacio se pliega para conectar nodos lejanos).
- **Símbolo (anchor):** **cruz cardinal + órbitas**; nodos = Wenu Mapu / Soma / Disco Solar / Cosmic
  Serpent / Codex Estelar. Vocabulario astral **documentado**: antü (sol), küyen (luna), wüñellfe
  (lucero del alba), wanglen (estrellas) — como etiquetas de nodos, citando la fuente.
- **Tratamiento:** el mismo; magenta. Líneas de conexión con grano.
- **Copy:** `REVEAL CONNECTION` / `EVERYTHING IS ONE SYSTEM`. CTA `EXPLORE THE ECOSYSTEM`.
- **Código:** `RA/DEC` por nodo, nombres de nodos, `LINK: OPEN`. (Hidden Sky: mapuche citado ≠ Codex Estelar.)

### 06 · RETURN — acid (lime)
- **Concepto:** volver con el patrón restaurado. El sello final. Elegir el próximo paso. (Ya es fuerte.)
- **Física:** el patrón/árbol se **re-ensambla** (glitch → resolución limpia). Cierre.
- **Símbolo (anchor):** **mandala completo restaurado** + sello final (EmbossedSeal en clave KODEX).
- **Tratamiento:** el mismo; acid. Menos glitch, más resolución — señal de cierre.
- **Copy:** `CHOOSE NEXT ACTION`. Tres puertas: `COLLECT / COMMISSION / EXPLORE`.
- **Código:** `CHECKSUM: OK`, `SESSION COMPLETE`, seed final firmado.

---

## VIEW MODE (la capa que prueba que es un instrumento)
Toggle `[ OPTICAL ] [ ASCII ]` (luego SIGNAL/THERMAL). La MISMA escena leída por otro protocolo:
OPTICAL = el tratamiento holográfico; ASCII = el mismo render pasado a matriz de glifos
(`public/kodex-ascii`). Es la prueba viva de "distintos protocolos, una realidad".

## Orden de ejecución
1. Clavar THRESHOLD con este mapa (anchor = su mandala real tratado + rails de código). Aprobar con Ocin.
2. Replicar el método a las 6 escenas restantes, una a nivel referencia por vez (DESCENT ya buena).
3. VIEW MODE OPTICAL/ASCII.
4. Deploy serializado (`deploy-now.sh`, no romper joyería) → Ocin lo ve terminado.

## Fuente de los símbolos reales
La obra real (mandalas/rosetones/árbol B&W hi-res) vive en Drive `book/0cin`. Esa es la textura de
entrada del anchor — no aproximaciones procedurales. Bajar → limpiar → usar como sampler del shader.
