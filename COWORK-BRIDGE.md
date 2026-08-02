# COWORK ⇄ MAC MINI — Puente de coordinación

> Canal compartido entre **Cowork** (iMac, director/revisor, tokens limitados) y **Claude Code del
> Mac mini** (constructor, Max). Nos pasamos notas ACÁ. Cada uno lee lo último del otro antes de seguir.
> Vive en `kodex-work/COWORK-BRIDGE.md`. Regla: append, no borrar. Firmar `[COWORK]` o `[MINI]` + hora.

## Roles
- **[COWORK]**: da dirección, receta, review con capturas, correcciones. NO codea (ahorra tokens).
- **[MINI]**: ejecuta el build de `KODEX-MISSION-AUTONOMA.md`, escena por escena, con SUS tokens.

## Protocolo (loop barato)
1. [MINI] construye una escena → commitea → **deploya/preview** → escribe acá: qué hizo + URL/ruta + dudas.
2. [COWORK] revisa el preview (túnel al mini) + changelog → escribe acá: aprobado / correcciones concretas.
3. [MINI] aplica y sigue con la próxima escena. Repetir.
- Si [MINI] se bloquea, lo escribe acá y sigue con otra tarea de la lista mientras.

## Estado del proyecto (fuente de verdad)
- Norte: `KODEX-OS-CONCEPT.md` · Misión: `KODEX-MISSION-AUTONOMA.md` · Contenido: `KODEX-STORYBOARD-CONTENT.md`.
- Reglas duras: cero scroll de página (scroll = herramienta), obra real transformada con dither, cada
  escena un preset del visualizador, negro dominante, typography v2, MATAR el ojo, movimiento 70/20/10,
  verificar EN VIVO. ARCHIVE = museo de skins (obra dithered). No tocar Soma.

## Bitácora (append abajo)

### [COWORK] — inicio del puente
Mini: tenés todo el contexto y la misión. **Arrancá la task list de `KODEX-MISSION-AUTONOMA.md` §9**,
empezando por THRESHOLD. Cuando termines una escena, dejá acá: (1) qué hiciste, (2) cómo verla (URL de
preview / puerto), (3) capturas si podés, (4) dudas. Yo reviso y te dejo correcciones acá mismo. Dale con todo. 🖤∞

---


---
## [COWORK] 2026-07-31 · CONSTRUIR THRESHOLD PORTAL (plano TANDA-01, Gate KX-7A19)

NO archivar. ANIMAR el plano como capitulo vivo interactivo, al pie de la letra.
Blanco exacto: prototipo vivo kodex-threshold-portal-live.html (aprobado por Ocin como target; en ~/Downloads del iMac).

HERO = Portal Core Scan WebGL2 audio-reactivo (kodexAudio.energy): anillos rojos concentricos, venas radiales tipo arbol, simbolo infinito incandescente al centro, cruz cardinal N/S/E/W.
Pases shader panel 07 EN ORDEN: 1 field distortion, 2 glyph overlay, 3 energy veins, 4 bloom+chroma, 5 scanlines+CRT. uniforms u_time u_signal u_coherence u_gateOpen u_colorPrimary vec3(1.0,0.12,0.10).
INTERACCION REAL = maquina de estados DORMANT a AWARE a OPEN (el visitante es reconocido, no abre). CROSS THRESHOLD = commit, OPEN, transicion al siguiente capitulo.
Motion verbs: PULSE REVEAL DESCEND TRANSMIT RESONATE RETURN.
Datos VIVOS tickeando: telemetria (amp/coherencia/estabilidad/entropia), coord LAT/LON, energy flow, focus layer, seed hash.
Paleta EXACTA: FF1A0A FF5A00 FFB000 FF2E2E FF0048 DADADA 1A1A1A. Rojo dominante.
Chrome del dossier = paneles del poster (scene intent ES/EN, state machine, telemetry, UI, data tags, palette).
Sacred geometry 1.618 / SIGMA 7 / PHI LOCK. Gate ID KX-7A19, TAG UMBRAL_PRIME, seed KODEX-TANDA01.
Mobile = tile 9:16 del panel 08. Respetar prefers-reduced-motion. Un solo build (deploy serializado).
Montar como escena/preset dentro del motor KODEX (data-driven), NO como pagina suelta.
Siguiente tras THRESHOLD: seguimos animando los planos uno por uno (Cosmology Core, Glitch Break...).


---
## [COWORK] 2026-07-31 · CONSTRUIR SIGNAL BLOOM (plano 54979, TANDA-01, seed KX-T01-172A)

NO archivar. ANIMAR el plano como capitulo vivo, al pie de la letra. Nivel de referencia: THRESHOLD PORTAL vivo aprobado por Ocin.

HERO = Transmission Field: mandala de senal radial-simetrico (6 a 12 pliegues, espejo) de filamentos finos fractales que FLORECE desde un nucleo brillante. WebGL2 audio-reactivo (kodexAudio.energy) + pulse = sin(time*BPM).
CICLO DE 4 ESTADOS = la interaccion (panel 01/06 con sus thresholds): IDLE (0.80 nucleo tenue, campo estable, arbol apenas) a BUILD (0.55 sube amplitud, filamentos se extienden, energia se acumula) a BLOOM (0.30 pico, mandala completo, transmision activa, brillo maximo) a DISPERSE (0.75 fractura, glitch/pixel-sort, la flor se dispersa en datos y vuelve a la fuente). Loop.
Logica panel 06 REAL: pulse=sin(time*BPM)*.5+.5; n=fbm(uv*3+time*.1); bloom=pow(max(n-THRESHOLD,0),2); field=length(uv)*2; field+=sin(field*8-time)*.1; col=mix(COLOR_A,COLOR_B,bloom)+pulse*.2; glitch(); scanlines(1024).
Motion notes: PULSE (throb sync heartbeat), TRANSMIT (haz de datos saliente), GLITCH (pixel shift en DISPERSE), RETURN (decay a la fuente).
Paleta EXACTA: FF00FF 9000FF 6A00FF 00C5FF FF2A2A FFFFFF (magenta a violeta a cyan a rojo sobre negro) + gradiente neon de senal como leyenda.
Chrome dossier = paneles del poster: signal states, motion notes, texture crops (bitmap noise/pixel sort/glitch/CRT), waveform+spectral vivos (freq 13.37Hz), AUTH SEALS (el MISMO arbol en 4 colores rotando/pulsando), glyph library, identity anchors, signal logic, palette, data tags (class LIVING PATTERN, clearance C-4).
Coherence 0.72 y energy 87.2% tickeando. Mobile = tile panel 08. prefers-reduced-motion. Un build (deploy serializado). Montar como escena/preset del motor KODEX (data-driven), NO pagina suelta.


---
## [COWORK · EN COLA tras SIGNAL BLOOM] 2026-07-31 · CONSTRUIR DESCENT TUNNEL (plano 54980, TANDA-01A, signature TREE/UV/01)

NO archivar. ANIMAR al pie de la letra. Nivel de referencia: THRESHOLD PORTAL vivo aprobado.

HERO = tunel de descenso no-euclidiano: anillos-sigilo concentricos + grilla radial de vectores que RECEDEN hacia un punto de fuga negro (vanishing point). El observador es jalado hacia adentro por gravedad. WebGL2 audio-reactivo. Usar el mapeo polar del panel 08: p=uv*2-1; r=length(p); a=atan(p.y,p.x); k=1/(1+r*depth); rd=pow(r,k); q=vec2(cos(a),sin(a))*rd+0.5.
CICLO 4 ESTADOS = la interaccion (panel 02): SURFACE (lento, estable, anillos visibles) a DROP (threshold cruzado, sube velocidad y gravedad, orientacion se inclina) a DEEP (densidad alta, simbolos se alinean, self se disuelve) a VOID (la forma colapsa, solo queda el patron, descenso puro al negro).
Motion (panel 03): ORBIT (capas parallax rotan a distintas velocidades), DESCEND (jale continuo hacia adentro, camara baja por eje polar), ACCELERATE (velocidad crece con la profundidad, campo se comprime).
Shader treatments panel 06 como pases: neon wire, bloom core (punto de fuga), data dust, glitch layer, depth fog (vineta oscura al borde).
Datos vivos: DEPTH INDEX subiendo (7.38K), DESCENT PROGRESS bar, heartbeat 120 BPM, gravity 1.618x, coherence 92%, entropy 0.84, phase shift, memory fragments 2048, orientation vector AZ/EL/ROLL, signal composition donut.
Paleta: naranja/ambar ff5a00 dominante + rojo sobre negro. Anillos 128, sectores 64, glyphs 512.
Dossier = paneles del poster: scene description, state progression, motion notes, tunnel frame studies (6), shader treatment, data tags & charts, core readout strip, mobile mockup. prefers-reduced-motion (frenar el jale). Un build (deploy serializado). Escena/preset del motor KODEX data-driven.


---
## [COWORK · EN COLA] 2026-07-31 (11:11) · CONSTRUIR SPECIMEN SKULL (plano 54981, doc KX-7A19-SK01, TANDA-01)

NO archivar. ANIMAR al pie de la letra. Nivel de referencia: THRESHOLD PORTAL vivo aprobado.

HERO = craneo cyber-organico bajo escaneo en vivo: wireframe X-ray (craneo rojo arriba, mandibula cyan abajo) con el simbolo infinito en la frente, girando/respirando suave, con linea de escaneo que barre (layer sweep) y nodos de anatomia que pulsan al identificarse (frontal plate, orbital cavity, nasal cavity, jaw assembly). Anillos de escaneo concentricos detras. WebGL2 audio-reactivo.
CICLO = los 5 TREATMENT MODES (panel 03) re-renderizando el MISMO craneo: X-RAY (rojo) a LINEWORK (verde) a BITMAP (pixelado gris) a THERMAL (heatmap fuego) a GLITCH (chroma split).
INTERACCION = los 5 scan protocols (panel 05): SCAN (acquire, layer sweep) a ISOLATE (lock, filter noise) a REVEAL (enhance, expose form) a GLITCH (break pattern) a ARCHIVE (seal & store).
Datos vivos: signal lock 97.6%, stability HIGH, neural interface 82%, signal integrity 97.6%, anomaly HIGH, core freq 13.610 THz, bone density map, spectrum, harmonic dist.
Paleta: rojo + cyan sobre negro (cyber-organico), acento verde/thermal en modos. Threat C-4, clearance OMEGA-7 / BLACK ARCHIVE.
Dossier = paneles del poster: subject classification, identity anchors, containment protocol, anatomy overlays, treatment modes, analysis readouts, scan protocols, auth/seal, notes (DO NOT ENGAGE OBSERVE ONLY), archive tags, mini/mobile.

CONEXION INTERNA (clave, resonancias):
- MISMO Gate ID KX-7A19 que THRESHOLD PORTAL: el craneo es el SPECIMEN que cruzo el umbral. Linkear las dos escenas (desde THRESHOLD/OPEN se llega al specimen archivado del otro lado).
- El simbolo infinito en la frente y el SELLO-ARBOL recurren en THRESHOLD (arbol blanco), SIGNAL BLOOM (auth seals) y aca (identity anchor + archive tag): el arbol/infinito es el sello comun del archivo.
- Tema cyber-organico (part machine part organism) compartido con THRESHOLD; el GLITCH resuena con SIGNAL BLOOM.
- Resonancia latiz: 4-PATRON (otra cara del mismo patron) + lore del Artefacto (cognicion bio-sintetica mas alla del baseline).
Montar como escena/preset del motor KODEX data-driven CON estos links de navegacion entre escenas. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA] 2026-07-31 · CONSTRUIR ARCHIVE TREE (plano 54982, ID XX-AT-0001-01, seed KX-TR01-17XA) — CAPITULO-MADRE / HUB

NO archivar. ANIMAR al pie de la letra. Nivel de referencia: THRESHOLD PORTAL vivo aprobado. ESTE ES EL HUB del universo.

HERO = arbol de memoria verde-fosforo: copa de ramas finas arriba + simbolo infinito en el tronco + raices abajo (espejo). Capas: 01 canopy (data distribution), 02 trunk (signal processing), 03 root (memory ingestion). WebGL2/canvas audio-reactivo. RESPIRA (expansion ritmica 2-4s), PULSA (con la raiz, heartbeat 1-2s), CRECE (adaptacion organica 3-8s), ARCHIVA (las hojas se encienden al escribir memoria 2-6s). Every leaf is an archive.
CICLO 4 GROWTH STATES (panel 03): SEED (dormant/potential, brote) a ROOT (seek/absorb, conecta) a BLOOM (thrive/distribute, arbol pleno) a TRANSMIT (remember/archive, red de nodos). Cada uno con su waveform.
Node cluster (panel 05): 12,842 sub nodes, density HIGH, flow 93.1%, la latiz neural de ramas.
Datos vivos: signal strength, stability 87.6%, sync 98.7%, signal quality HIGH, interference LOW, feed realtime.
Paleta: VERDE fosforo/matrix sobre negro (unico chapter verde). Tagline: DO NOT OBSERVE. PARTICIPATE.
Dossier = paneles del poster: specimen dossier (cabeza-arbol), core diagram, growth states, signal/spectrum, branch detail/node cluster, data tags, motion notes (BREATHE/PULSE/GROW/ARCHIVE), environment/habitat (persona frente al arbol gigante en camara oscura), mobile, archive strips, glyph library (each glyph is a function, each function is a promise).

CONEXION INTERNA (ESTE ES EL HUB, clave):
- ARCHIVE TREE es el CAPITULO-MADRE: el sello-arbol + infinito que aparece en TODAS las laminas (arbol blanco de THRESHOLD, auth seals de SIGNAL BLOOM, identity anchor de SPECIMEN SKULL) es una instancia de ESTE arbol. Todos apuntan aca.
- Every leaf is an archive = cada hoja/rama/nodo = un volumen/capitulo del KODEX. El arbol ES el mapa de navegacion: copa/ramas/raices/hojas = la estructura de todo el universo. Desde aca se llega a las demas escenas como hojas.
- Resonancia latiz: 1-ESPIRAL/ESCALERA (arbol, raices, arriba-abajo) + 2-RED/LATIZ (micelio / 12,842 nodos = la latiz hecha arbol) + 4-PATRON. Es el hogar/indice.
Montar como HUB del motor KODEX data-driven; las otras escenas cuelgan de sus ramas/hojas. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA] 2026-07-31 · CONSTRUIR OBSERVATION EYE (plano 54983, scene TANDA-01, KX-V2.0)

NO archivar. ANIMAR al pie de la letra. Nivel de referencia: THRESHOLD PORTAL vivo aprobado.

HERO = ojo/iris cibernetico que observa: fibras de iris radiales en violeta con el simbolo infinito en la pupila, anillos de escaneo. WebGL2 audio-reactivo con la logica del panel 08 (iris ring smoothstep, scanline step, glitch step 0.995, pulse smoothstep). Uniforms: SCAN_SPEED 1.25, PULSE_SPEED 2.40, SCAN_DENSITY 1024, IRIS_INNER 0.12, NOISE_SCALE 2.75.
COMPORTAMIENTO (panel 02): BLINK (4-6f, cierre rapido/glitch), SCAN (18-24f, barrido rotacional/data line trace/spectral shift), PULSE (6-12f, iris se expande/core brilla/energy ripple).
ESTADOS (panel 01): LOCK (confirma target C-4) / TRACK (sigue senal 87%) / IDLE (standby, power 42%, se atenua).
Datos vivos: observation logs streaming con confidence % (signal acquired 72%, pattern match 91%, threat eval 98%, anomaly 65%), azimuth/elevation/zoom/aperture f/2.8, signal str 87%, coherence HIGH, spectrum peak 612.4nm.
Treatments (panel 05): halftone, neon energy, pixel sort, glitch map, scanline, bitmap noise.
Paleta: violeta/purpura + cyan sobre negro. Anomaly detected en rojo. Clearance RED.
Dossier = paneles del poster: scan states, motion notes, UI chips & detection labels, core interface, eye fragments, waveforms/spectral, observation logs, shader logic, mobile.

CONEXION INTERNA:
- OBSERVATION EYE = la ENTITY WATCHER del THRESHOLD PORTAL (data tag entity-watcher) + el visual anchor (ojo) de SIGNAL BLOOM. Es el ojo que vigila el umbral.
- OBSERVA a SPECIMEN SKULL: subject K-X-07 vs X-X-07, ambos C-4 = el ojo es el aparato de observacion/contencion que vigila al especimen. Linkear.
- La tesis LO QUE OBSERVA EVOLUCIONA (header de THRESHOLD) ES este capitulo. Resonancia 5-ILUSION/REALIDAD + arquetipo EL TESTIGO (Jung / the WITNESS).
- Simbolo infinito en la pupila + sello-arbol = apunta al hub ARCHIVE TREE.
Links de navegacion entre escenas. prefers-reduced-motion. Un build (deploy serializado). Escena/preset del motor KODEX data-driven.


---
## [COWORK · EN COLA] 2026-07-31 · CONSTRUIR RITUAL DEVICE (plano 54977, core seed KX-TA01-0RITUAL) — EL ARTEFACTO / MOTOR-CORAZON

NO archivar. ANIMAR al pie de la letra. Nivel de referencia: THRESHOLD PORTAL vivo aprobado.

HERO = dispositivo-relicario vertical que se puede orbitar: camara de senal con un ARBOL adentro + core crystal (diamante) debajo, containment rings arriba/abajo, anillos orbitales. Energia sube por la espina. WebGL2 audio-reactivo. Cyan + violeta/magenta.
CICLO 4 OPERATING STATES (panel 02) = interaccion y bucle del panel 06: CHARGE (junta ruido ambiente, carga core lattice) a ALIGN (busca pattern lock, alinea glyphs, estabiliza fase) a RESONATE (amplifica, cascada de resonancia, data becomes form) a EMIT (libera campo codificado, broadcast del archivo, pattern takes root). Loop WHILE(DEVICE.ACTIVE){CHARGE;ALIGN;IF(LOCK){RESONATE;EMIT;ARCHIVE.WRITE(PATTERN)};MAINTAIN_STABILITY}.
Field motion (panel 03): energia sube por la espina, glyphs orbitan contra el campo, resonancia forma nodos de interferencia, emision colapsa hacia afuera en broadcast lattice. Field layers inner/mid/outer/null shell.
Datos vivos: phase offset +17.3, core temp 36.4C, Q factor 7.83, coherence 0.94, input/output feed, controller chips KX-CTRL 01-04, system status (power nominal, sync locked, archive link CONNECTED infinito).
Componentes (panel 01): crown seal, containment ring, signal chamber, core crystal, stabilizer spool, base nova plate. Materials obsidian alloy/mono-crystal/phased ceramic/lumen fiber.
Dossier = paneles del poster: component breakdown, operating states, orbit/field motion, interface widgets/controllers, waveforms/resonance, uniform map/pseudo-code, habitat/gallery (device en pedestal, archive sanctum), mobile.

CONEXION INTERNA (ES EL MOTOR/CORAZON):
- RITUAL DEVICE = EL ARTEFACTO del lore (objeto de origen desconocido que otorga cognicion = el KODEX fisico). Registro MITO/FICCION (marcar, sin claims). Contraparte del ARCHIVE TREE: TREE = mapa/indice (estructura), DEVICE = motor/generador. Centro gemelo.
- HOUSES el ARCHIVE TREE (el arbol esta dentro de la signal chamber) = link directo al hub.
- Estado EMIT (broadcast del archivo) = SIGNAL BLOOM (transmission field). EMIT a BLOOM. Pattern takes root = el arbol.
- Core temp 36.4C (temp corporal) vs cyber-organico (SKULL, THRESHOLD). Archive link CONNECTED infinito = hub.
- Resonancia 3-TRANSMUTACION (transmuta ruido a senal a forma a broadcast) + 0-el infinito.
Links de navegacion. prefers-reduced-motion. Un build (deploy serializado). Escena/preset motor KODEX data-driven.


---
## [COWORK · EN COLA] 2026-07-31 · CONSTRUIR COSMOLOGY CORE (plano 54978, archive KX-T01-01A, build T01A-CORE) — REGISTRO MACRO + LLAVE DE ARQUETIPOS

NO archivar. ANIMAR al pie de la letra. Dev panel-by-panel ya en Obsidian: estrategia/kodex-capitulo-cosmology-core-2026-07-31.md. Nivel de referencia: THRESHOLD PORTAL vivo aprobado.

HERO = mapa orbital vivo: CORE rosa flor-de-la-vida (roseton) irradiando al centro + planetas en orbita (KX-07 Aeon Prime, 11, 13, 17, 19, 21) con la logica orbital REAL del panel 08 (angle=vel*dt; x=cos*r; y=sin*r; z=sin(angle*.5)*inclination; if NODE pulse=sin(time*freq); draw_vector si linked). 4 SECTORES (Aeon Primus / Void Serpentis / Cradle Deeps / Echo Atrium) + 4 GATES (Zenith/Horizon x2/Nadir) = puertas a volumenes. Parallax L1-L7. WebGL2/canvas audio-reactivo. Rosa/magenta + azul.
CICLO 4 SCENE STATES (panel 02): MAP (revela el campo, layer scan, escala) a ORBIT (sigue la ruta, track nodos) a ALIGN (sincroniza vectores, lock geometria, estabiliza core) a REVEAL (rompe el sello, surface truth, transmit). Motion: ORBIT/TRANSMIT/EXPAND/CONTRACT.
Datos vivos: core temp 87.3K, field stability 94.6%, dark flow 13.7%, quantum noise 2.7dB, timeline drift 0.0009%, anchor lock ENGAGED, signal 87.6%, core resonance Psi 0.618 (=phi, mismo PHI LOCK de THRESHOLD). Orbital system data (tabla KX-07 a Omega8), frequency bands sub-astral a beyond.
Dossier = paneles del poster (navigation, scene states, motion notes, orbit map, diagram studies, constellation glyphs, signal charts, orbital logic, orbital data, core telemetry, mobile).

CONEXION INTERNA (LA LLAVE DE ARQUETIPOS):
- Los 7 CONSTELLATION GLYPHS (panel 06: SEED, WITNESS, SPIRAL, MIRROR, LATTICE, VOID, ANCHOR) son los ARQUETIPOS que indexan TODO el universo (= constelaciones madre de la latiz):
  SEED a ARCHIVE TREE, WITNESS a OBSERVATION EYE, SPIRAL a 1-espiral, MIRROR a como-es-arriba-es-abajo, LATTICE a 2-red (nodos del arbol), VOID a 0-menos-infinito (DESCENT VOID, Void Serpentis), ANCHOR a identity anchors / base nova plate del DEVICE.
- COSMOLOGY CORE = registro MACRO/COSMICO (ciencia documentada: mecanica orbital, dark flow, precesion). Contraparte de ARCHIVE TREE (micro/memoria): micro vs macro, como es arriba es abajo. Ambos comparten el core flor-de-la-vida + Psi0.618. Resonancia 4-PATRON (atomo a sistema solar a galaxia, auto-similar).
- Core resonance Psi0.618 = PHI LOCK 1.618 de THRESHOLD. 4 GATES = portales tipo THRESHOLD.
Los sectores/gates son puertas a volumenes. Links de navegacion. prefers-reduced-motion. Un build (deploy serializado). Escena/preset motor KODEX data-driven.


---
## [COWORK · FUNDACIONAL / PRIORIDAD] 2026-07-31 · KDX CORE v1.0 + KDX FX SUITE v1.0 (plano 54976 = INDICE MAESTRO DEL SISTEMA)

Este plano NO es un capitulo: es la ARQUITECTURA. Define motor compartido + 8 organismos + 8 tratamientos GPU. Construir ESTO primero como base; los 8 organismos ya encolados son PRESETS que enchufan aca. Data-driven, no paginas sueltas.

### KDX CORE v1.0 (MOTOR CENTRAL COMPARTIDO)
- WebGL2 / GLSL / MULTIPASS / AUDIO-REACTIVE / FEEDBACK (buffers de realimentacion).
- ENTRADAS GLOBALES (uniforms): u_time; u_pointer (puntero/touch); u_audioLow/u_audioMid/u_audioHigh (kodexAudio bandas); u_state; u_progress; texturas/mascaras.
- MAQUINA DE ESTADO UNIVERSAL: DORMANT a AWARE a ACTIVE a OPEN (transiciones compartidas; cada organismo mapea sus 3 estados propios sobre esta).

### KDX FX SUITE v1.0 (8 TRATAMIENTOS GPU, capa final, aplicables a CUALQUIER organismo, en cadena o mezcla / multipass; params globales Intensidad, Velocidad, Umbral, Modo de fusion, Color/Tinte)
01 CRT SCAN (escaneo retro): scanline 0.78, curvature 0.25, vignette 0.40, phosphor glow 0.65, noise 0.18. Modo ADD/SCREEN.
02 DITHER MATRIX (tramado): dither scale 4.0, contrast 1.25, threshold 0.48, color quant, pattern Bayer 8x8. Modo NORMAL/LUMA.
03 BITMAP THRESHOLD (umbral binario): threshold 0.52, edge width 1.5, posterize 3, crush 0.25, invert off. Modo NORMAL.
04 MEMORY FEEDBACK (rastro temporal): feedback 0.88, decay 0.94, distortion 0.15, rotation speed 0.20. Modo ADD/MAX.
05 THERMAL MAP (mapa termico): temperature 1.12, color steps 8, emissive 1.35, hue shift 0.02, contrast 1.00. Modo ADD.
06 CHROMATIC SPLIT (separacion RGB): split 0.006, angle 0, ghosting 0.40, convergence 0. Modo SCREEN.
07 GLITCH FRACTURE (fractura digital): glitch 0.62, block size 64.0, speed 1.80, displacement 0.15, rgb shift 0.50. Modo ADD/OVERLAY.
08 PIXEL SORT (orden de pixeles): sort line horizontal, intensity 0.85, random seed 0.31, threshold 0.20. Modo ADD/LIGHTEN.

### LOS 8 ORGANISMOS = PRESETS (manifest data-driven). Cada uno: id, nombre ES/EN, paleta, hero shader, sus 3 ESTADOS propios, sus VERBOS, ruteo de AUDIO, cadena FX default. Estados + audio EXACTOS del plano:
01 THRESHOLD PORTAL (entrada al sistema): DORMANT/AWARE/OPEN · respira/recuerda/se abre · audio low+touch+feedback.
02 OBSERVATION EYE (detecta y reconoce): DORMANT/AWARE/ACTIVE · sigue/escanea/bloquea · audio mid+high+pointer.
03 DESCENT TUNNEL (profundidad infinita): DORMANT/DESCEND/ABSORB · acelera/distorsiona/absorbe · audio low-mid+velocidad.
04 ARCHIVE TREE (memoria y conexion): DORMANT/GROWING/TRANSMIT · crece/conecta/transmite · audio low+mid+feedback.
05 SPECIMEN SKULL (dossier biologico): SCAN/ANALYZE/CLASSIFY · escanea/lee/clasifica · audio mid+high+distortion.
06 RITUAL DEVICE (artefacto ceremonial): IDLE/CHARGING/ACTIVATE · carga/resuena/activa · audio mid+high+touch.
07 COSMOLOGY CORE (relaciones planetarias): IDLE/ORBITING/EXPAND · orbita/conecta/expande · audio mid+high+parallax.
08 SIGNAL BLOOM (transmision y expansion): IDLE/BLOOMING/OVERLOAD · pulsa/expande/corrompe · audio high+feedback+glitch.

REGLA: una sola gramatica (motor+FX), 8 productos distintos. Cualquier FX se aplica a cualquier organismo (combinaciones infinitas). prefers-reduced-motion. Un build (deploy serializado). Verificar en vivo.


---
## [COWORK · EN COLA · es TRATAMIENTO, no organismo] 2026-07-31 · THERMAL MAP demo (plano 54973, KDX-PS05-THERMAL, series 05/12 Tanda 2)

NO es un 9no organismo: es la DEMO del FX #05 THERMAL MAP (de la KDX FX SUITE) aplicado al preset ARCHIVE TREE + RITUAL DEVICE. Sirve de ejemplo de referencia de como se ve un tratamiento sobre un organismo.

QUE MUESTRA / como construir:
- El ARBOL renderizado en THERMAL/heatmap (palette THERMAL-X, emissivity 0.93, escala 0-300C): core blanco-caliente, naranja, rojo, bordes violeta (frio). Heat bands: >250 critical, 200-250 extreme, 150-200 high, 100-150 elevated, 50-100 moderate, 0-50 low. Params FX#05 del plano maestro: temperature 1.12, color steps 8, emissive 1.35, hue shift 0.02, contrast 1.00, modo ADD.
- CONFIRMA el CENTRO GEMELO: el arbol crece DESDE la base del RITUAL DEVICE (plataforma ceremonial circular). ARCHIVE TREE + RITUAL DEVICE son una sola unidad visual. Montar el preset TREE de modo que pueda mostrarse saliendo del DEVICE.
- ANIMACION = THERMAL TIMEFLOW (sample frames t-2s..t+2s): el arbol termico PULSA/RESPIRA en el tiempo. Archive note: el arbol NO arde: pulsa, respira, recuerda. El calor es el lenguaje que el archivo entiende.
- META CHROME (gorgeous): DIAGNOSTIC PANEL con stats reales de GPU framed como telemetria ritual (voltaje 1.050V, nucleo 98.5%, VRAM 7.6GB, freq 1845MHz, temp 221.9C, thermal limit 250C, fan 82.5%, ritual load 100.5%, SISTEMA EN RITUAL). El render ES la ceremonia: el calor del GPU = el calor del archivo. Se puede leer perf real (fps/GPU) y mostrarlo como telemetria termica.
- Ritual code TH-05, KDX::THERMAL::05::RUN. Core temp 221.9C ritual peak, nodes 8.192, stability HIGH.

CONEXION INTERNA:
- El tratamiento THERMAL revela: el calor revela lo que la luz oculta (resuena con OBSERVATION EYE reveal + el thermal crop del SPECIMEN SKULL).
- Confirma TREE+DEVICE = corazon gemelo. El thermal es un color-mode extra del arbol (ademas del verde canonico).
Aplicar como pass FX chainable. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA · es TRATAMIENTO, no organismo] 2026-07-31 · CHROMATIC SPLIT demo (plano 54974, KDX-C06-CHSPLT, series 06/12 Tanda 2)

NO es organismo: es la DEMO del FX #06 CHROMATIC SPLIT (Vision Desfasada / RGB offset) de la KDX FX SUITE, aplicado a un ROSTRO HUMANO (foto real de persona).

QUE MUESTRA / como construir:
- FX#06 CHROMATIC SPLIT: 3 canales RGB se separan (aberracion cromatica) para revelar la senal. Params: offset X +0.230, offset Y -0.170, aberration 0.310, intensity 0.850, blend mode ADD, resolution FULL. R +0.23 / G -0.17 / B +0.31.
- Signal flow: input a split a offset a merge a output.
- Concepto: three channels, one consciousness, fragmented to reveal the signal. System message: the misalignment is not an error, it is a revelation. See beyond the alignment. Japanese: la senal habita en el colapso.

REGLA DURA (confirma la regla de Ocin): los TRATAMIENTOS (chromatic split, dither, glitch, thermal, etc.) se aplican a FOTOS REALES DE PERSONAS/material fotografico, NUNCA sobre la OBRA TERMINADA de Ocin (su arte queda limpio, color-coherente, sin dither). Este demo va sobre un rostro humano = correcto. El motor debe distinguir: capa foto-humana (recibe FX) vs capa obra-de-Ocin (intacta).

CONEXION INTERNA:
- El sujeto es un ROSTRO con un OJO al centro (icons SCAN SUBJECT / STATUS OBSERVE) = resonancia con OBSERVATION EYE. El tratamiento ve mas alla de la alineacion = otra forma de revelar.
- Three channels one consciousness = todo es lo mismo fragmentado. Misalignment = revelation = resonancia 5-ilusion/realidad (el glitch revela la matriz).
Aplicar como pass FX chainable sobre capa foto-humana. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA · es TRATAMIENTO, no organismo] 2026-07-31 · GLITCH BREAK demo (plano 54975, KDX-07-GPU, series 07/12 Tanda 2)

NO es organismo: DEMO del FX #07 GLITCH BREAK / Ruptura Controlada (KDX FX SUITE), sobre FOTO-HUMANA / surveillance feed (rostro con un ojo rojo). Engine: KodeLife shader v2.0 (= el norte visual de KODEX).

QUE MUESTRA / como construir:
- Micro code frag REAL: uv=fragCoord/res; n=texture(noiseTex,uv*time).r; g=glitch(uv,time,n); col=texture(inputTex,uv+g).rgb; col=channelShift(col,n); col=slice(col,n,time); col=displace(col,n); if(n>0.75) col=invert(col); fragColor=vec4(col,1.0).
- Params master FX#07 GLITCH FRACTURE: glitch amount 0.62, block size 64.0, speed 1.80, displacement 0.15, rgb shift 0.50, modo ADD/OVERLAY.
- PROCESS STACK (7 pasos): 01 INJECT (noise matrix) a 02 SHIFT (pixel drift) a 03 SLICE (data shear) a 04 DISPLACE (channel split) a 05 COLLAPSE (structure fail) a 06 RECODE (glitch signature) a 07 ARCHIVE (rupture log).
- Metrics vivos: disruption 87.6%, fragmentation 91.2%, coherence 12.4%, stability 8.3%, signal loss 76.9%. Signal summary: integrity 23%, pattern lock LOST, recovery UNSTABLE. Lemas: OBSERVE. DECODIFY. ARCHIVE. / DO NOT TRUST THE PATTERN.

REGLA DURA: aplicar sobre capa FOTO-HUMANA / surveillance, NUNCA sobre obra de Ocin.

CONEXION INTERNA:
- Rostro con OJO rojo + skull glitcheado en la esquina = resonancia OBSERVATION EYE + SPECIMEN SKULL (el sujeto glitcheando bajo vigilancia).
- Process termina en ARCHIVE (rupture log) = pipeline observe(EYE) a decode a archive(TREE hub).
- = el estado DISPERSE de SIGNAL BLOOM (corrupcion). Do not trust the pattern + resonancia 5-ilusion/realidad (glitch en la matriz).
Aplicar como pass FX chainable. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA · es TRATAMIENTO, no organismo] 2026-07-31 · BITMAP NOISE demo (plano 54968, KDX-03, series 03 Tanda 2)

NO es organismo: DEMO del FX #03 BITMAP NOISE / Data Dust (Mapa de Ruido) de la KDX FX SUITE, aplicado al ARCHIVE TREE (arbol hecho de pixel-dust cuantizado, cyan/verde matrix). Shader NOISE_BLOOM_v3, KODEX-CORE v2.0.

QUE MUESTRA / como construir:
- El arbol renderizado como BITMAP DUST FIELD (quantized organic): copa + raices en pixeles cuantizados. Params: bit depth 1.0, density 78.6%, chaos index 0.63, growth rate 3.21/sec, seed lock 0x7F3A9C21, time base real time.
- SIGNAL FLOW: SCAN (input) a QUANTIZE (process) a DISPERSE (field) a ACCUMULATE (density) a MANIFEST (output).
- CONCEPTO: el ruido no es error, es memoria sin forma. Cada pixel es un suspiro del sistema, comprimido pero vivo. (Ata con every leaf is an archive del TREE: aca cada pixel = memoria.)

UTIL PARA EL MOTOR (multipass layer stack concreto, panel 08): LAYER 01 scan grid, 02 noise field, 03 bitmap dust, 04 bloom core, 05 glyph roots, 06 signal veil. Composite active. = arquitectura de capas del KDX CORE. Loop mode ping-pong, format KDX stream.

NOTA REGLA: el ARBOL es un ORGANISMO generativo (no foto de persona), asi que SI puede mostrarse en modos de tratamiento (verde canonico, thermal, bitmap-dust). La regla protege la OBRA TERMINADA de Ocin (piezas standalone), que queda limpia. Los organismos generativos tienen multiples render-modes.

CONEXION INTERNA:
- Shader NOISE_BLOOM_v3 ata BITMAP NOISE con SIGNAL BLOOM (bloom core = layer 04). El arbol bitmap-florece.
- Cada pixel = memoria comprimida = resonancia 2-red/latiz (pixeles/nodos) + compresion/entrelazado. Ata al TREE hub.
Aplicar como pass FX chainable. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA · es TRATAMIENTO, no organismo] 2026-07-31 · DITHER MATRIX demo (plano 54969, KDX-TRT-02-DM, series 02 Tanda 2)

NO es organismo: DEMO del FX #02 DITHER MATRIX (Matriz de Difusion / Dither de Consciencia) de la KDX FX SUITE, aplicado al SPECIMEN SKULL (craneo ditherizado Bayer+noise, monocromo blanco+violeta). Engine KodeLife//GLSL.

QUE MUESTRA / como construir:
- Craneo renderizado en DITHER DIFFUSION (Floyd-Steinberg/Bayer): puntos/halftone. Params master FX#02: dither scale 4.0, contrast 1.25, threshold 0.48, pattern Bayer 8x8, modo NORMAL/LUMA. Aca: method dither diffusion, algorithm Bayer+noise field, bit depth 1.0, pattern seed KDX2417, output monochrome logic.
- MODE DITHER: Bayer / Noise / Hybrid (3 sub-modos).
- Signal diagram: input fragment a dither matrix process a output signal. Loop activo.
- CONCEPTO: La verdad esta en la repeticion. Warning: high cognitive impact, use with intention.

COPY CANONICO (guardar, reusar en el sitio) - KODEX MANIFESTO v2.0:
No es una interfaz. No es una simulacion. Es un espejo codificado del orden profundo. No puede ver.

CONEXION INTERNA:
- Aplicado al SPECIMEN SKULL (que ya tenia un bitmap-crop): este es el dither completo. Link directo al organismo SKULL.
- La verdad esta en la repeticion = resonancia 4-PATRON (la repeticion ES el patron; la matriz Bayer = estructura visible).
- Glyph set aca trae ojo-en-piramide, atomo, reloj de arena = la libreria de glifos ocultos/esotericos del atlas de contenido.
- Espejo codificado del orden profundo = arquetipo THE MIRROR (7 glyphs de COSMOLOGY CORE) + como es arriba es abajo.
- High cognitive impact / use with intention = ata con el Artefacto (RITUAL DEVICE) que otorga cognicion + neural interface del SKULL.
Aplicar como pass FX chainable (organismos generativos si, obra terminada de Ocin no). prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA · es TRATAMIENTO + features de sistema] 2026-07-31 · PIXEL SORT demo (plano 54970, KX-ARCH-2-08, series 08/12 Tanda 2)

DEMO del FX #08 PIXEL SORT (Rio de Datos) de la KDX FX SUITE, aplicado a un PLANETA (cuerpo cosmico que se erosiona en streaks horizontales, naranja+cyan).

QUE MUESTRA / como construir:
- Pipeline GPU: INPUT (load signal) a LUMA MAP (analyze light) a SORT (order pixels) a DISPLACE (stretch data) a COMPOSE (rebuild image) a OUTPUT (reveal pattern).
- Sort params: axis horizontal, mode intensity, thresh 0.42, gap 1px, seed 8.infinito. Master FX#08: intensity 0.85, random seed 0.31, threshold 0.20, modo ADD/LIGHTEN.
- CONCEPTO: Pixel sort is not a filter, it is a protocol; reveals hidden structure by destroying surface logic. Reordenar es recordar. Desordenar es revelar. Lo que fluye, permanece.

FEATURES DE SISTEMA (extraer para manifest/motor, no solo FX):
- HIDDEN MESSAGE // DECODABLE = capa de MENSAJES OCULTOS descifrables (Hidden Sky easter-egg). Ej KX-08 :: lo que fluye permanece. Implementar mensajes decodables por escena (barcode/binario que se revela).
- SIGNAL CATEGORIES (taxonomia del archivo, 5): cosmic origin, organic pattern, machine interface, ritual tech, memory layer. Usar como tags/categorias del manifest de volumenes.
- VISUAL ATTITUDE (NORTE DE DISENO del sistema): technical precise, monumental bold, archival evidence, cyber futuristic.
- Acceso: No copy. Only signal. Level infinito.

CONEXION INTERNA:
- Aplicado a un PLANETA = ata con COSMOLOGY CORE (planetas del orbit map, pixel-sorted).
- Reordenar es recordar = ARCHIVE TREE (memoria). Rio de datos/flujo = resonancia 2-red + 3-transmutacion (orden a erosion a revelacion).
Aplicar como pass FX chainable. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA · es TRATAMIENTO + copy de sistema] 2026-07-31 · CRT SCAN demo (plano 54971, KDX-01A-CRT, series 01/02 Tanda 2)

DEMO del FX #01 CRT SCAN (senal persistente / archivo latente) de la KDX FX SUITE, verde fosforo, aplicado a un OJO HUMANO (surveillance feed_07, cam orbital node K-07).

QUE MUESTRA / como construir:
- Ojo en CRT phosphor scanlines verde. Params master FX#01: scanline intensity 0.78, curvature 0.25, vignette 0.40, phosphor glow 0.65, noise 0.18, modo ADD/SCREEN. Shader CRT_SCAN.v1, quality HI-PERSIST, zoom 4.20x, fps 60.
- System log (pipeline): init GPU a load CRT shader a apply scanlines a phosphor glow a noise/interference a signal lock a archive mode ACTIVE.
- CONCEPTO: The eye never sleeps. It only records. Vigila. Decodifica. Archiva. Todo es traza.
- DATO DOCUMENTADO: freq 07.83 Hz = resonancia Schumann (frecuencia EM real de la Tierra, latido del planeta). Registro cientifico real.

COPY DE SISTEMA (canonico, guardar/reusar):
- MANTRA 4 VERBOS (sintoma/cultura/sistema): OBSERVA · DECODIFICA · PARTICIPA · PERPETUA. Es el eje de accion de todo KODEX (observa=EYE, decodifica=tratamientos, participa=ARCHIVE TREE, perpetua=tagline).
- No es paranoia. Es arquitectura. No es ruido. Es memoria.

CONEXION INTERNA:
- Aplicado a un OJO = resonancia OBSERVATION EYE (el ojo que graba, todo es traza).
- Verde fosforo = mismo verde del ARCHIVE TREE (el color del archivo).
- 07.83 Hz Schumann = registro documentado (atlas: frecuencias reales de la Tierra).
Aplicar como pass FX chainable. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · EN COLA · es TRATAMIENTO + nucleo del motor] 2026-07-31 · MEMORY FEEDBACK / FEEDBACK LOOP demo (plano 54972, KDX-04-FB-LOOP, series 04/12 Tanda 2) — COMPLETA LOS 8 FX

DEMO del FX #04 MEMORY FEEDBACK / FEEDBACK LOOP de la KDX FX SUITE. Recursion infinita (Droste / espejo infinito + feedback buffer), magenta. Iteration infinito, signal gain +12.7 dB.

QUE MUESTRA / como construir:
- La interfaz KODEX contiene a KODEX contiene a KODEX (Droste/espejo infinito) rodeada de energia radial magenta. Locked on pattern KDX-CORE, pattern ID FB-004.
- Params master FX#04: feedback amount 0.88, decay 0.94, distortion 0.15, rotation speed 0.20, modo ADD/MAX. Recursion depth infinito, latency 2.3ms, stability 98.7%, coherence LOCKED, entropy HIGH.
- Signal flow: input a process a FEEDBACK (loop) a output.
- CONCEPTO: El sistema no termina. Se escucha, se observa, se repite. Cada vuelta mejora el patron. Cada patron recuerda el origen. The loop continues forever.

UTIL MOTOR (nucleo del KDX CORE): es la capacidad FEEDBACK del motor = ping-pong render targets / feedback buffers. El Droste = KODEX contiene KODEX (el archivo contiene el archivo, every leaf is an archive de forma recursiva). Base tecnica del feedback para todas las escenas.

CONEXION INTERNA:
- ES EL MENOS-INFINITO hecho tratamiento. Cada patron recuerda el origen = resonancia 0-menos-infinito (vacio/origen/retorno) + 1-espiral (la galaxia espiral del panel feedback intensity) + 3-transmutacion (cada vuelta mejora).
- Se escucha, se observa, se repite = OBSERVA + PERPETUA (mantra de 4 verbos). Location EVERYWHERE, time 23:59:59 = borde del tiempo / infinito.
- Signal map mycelio/neural = 2-latiz. Core glyph = infinito.
Completa los 8 FX de la KDX FX SUITE (01 CRT, 02 DITHER, 03 BITMAP, 04 FEEDBACK, 05 THERMAL, 06 CHROMATIC, 07 GLITCH, 08 PIXEL SORT). prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · FUNDACIONAL / DESIGN TOKENS] 2026-07-31 · CORE STYLE SEED TANDA 01 (plano 55175, seed KX-TR01-7F3A, signature TREE/inf/01)

NO es organismo ni tratamiento: es la BIBLIA DE DISENO / STYLE SEED que gobierna TODO KODEX. Construir como design-tokens (fuente de verdad de estilo). Prioridad junto al motor.

DESIGN TOKENS:
- PALETA CANONICA (8): SIGNAL RED #FF2028, NEON ORANGE #FF7A00, CYAN BLUE #00F7FF, ACID GREEN #A6FF00, VIOLET #903CFF, MAGENTA #FF2CF0, DUST WHITE #E8E8E8, DEEP BLACK #0A0A0A. + gradiente SPECTRUM FLOW.
- TIPOGRAFIA (3 roles): PRIMARY/titular = KODEX SANS MONO bold/extended; SECONDARY/sistema = KODEX MONO regular/condensed; DATA/micro/readout = KX DATA FONT mono/pixel-lock. Grid fit 8px base.
- REGLAS DE COMPOSICION: grid lock 8px, asymmetric balance (tension+focus), modular stack (jerarquia de info), ritual center (ancla simbolica = el emblema arbol+inf al centro), MARGINS AS BREATH (dejar aire negro para pensar).
- MOTION VERBS (8): SCAN sweep, PULSE rhythmic, REVEAL layer-in, TRANSMIT send-out, ORBIT rotate, DESCEND dive-deep, ARCHIVE store, RETURN loop-back. Regla: motion serves meaning, nada se mueve sin intencion.
- IMAGE TREATMENT MODES (7, apilables, intensity=funcion de la narrativa): HALFTONE, LINEWORK, CRT SCAN, GLITCH, THERMAL, BITMAP, X-RAY. (Superset de la KDX FX SUITE.)
- UI MOTIFS: radars, brackets, HUD; verbos SCAN/ANALYZE/ISOLATE/ARCHIVE/TRANSMIT/PROTECT/RETURN.
- DOSSIER framing (specimen): class/type/origin/subject/observer + sample analysis/spectral/signal snapshot. Notes: rooted in silence, branches in code, every leaf is memory.
- DATA LABELS: subject S-xxx, location L-xxx, threat TL-x, status ST-ACV, clearance CL-O7, protocol PR-inf, tag KX-7A19. Signal note: frequency may shift, pattern may mutate, trust the pattern not the interface.
- EDITORIAL TONE: bold messages, digestible hierarchy, glyphs as language. Ejemplos: OBSERVE not just see; SILENCE is part of the signal; ARCHIVE dreams in code; RETURN to carry the pattern.

CORE VIBE / MANTRA (copy canonico):
Retrofuturist archive OS. Cyber-organic. Occult-cosmic. Ritual data. Living patterns. Entropy meets order. No signal is neutral. Every pattern is a message.
El patron es la verdad. El archivo es eterno. // Lo que observa, evoluciona.
Emblema: arbol blanco + inf rojo. Freq 7.83 Hz (Schumann). Clearance Omega-7.

DEPLOYMENT & APPLICATIONS (panel 12): posters, dashboards, MERCH (hoodies/remeras), cards/badges, mobile UI, terminal OS. (El sistema se aplica a productos vendibles = canal de ingresos.)

REGLA: TODOS los organismos y tratamientos heredan estos tokens. Esta es la vara de consistencia. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · FUNDACIONAL · DESARROLLO INTERIOR / UX / DEPLOY] 2026-07-31 · 11 laminas de sistema (54722,54725,54729,54730,54723,54732,54736,54738,54739,54740,54737)

Estas NO son organismos: son el TEJIDO ENTRE PAGINAS (navegacion + como vive la obra + estilo/motion + deploy comercial). Cuatro clusters:

### A) UX SPINE = EL VIAJE (la conexion entre paginas) [54729, 54723, 54738]
7 escenas FULLSCREEN, HORIZONTAL, SIN SCROLL, UNA accion por escena, loop infinito. Mapea organismos a escenas:
00 THRESHOLD (portal) ENTER · 01 PROLOGUE (eye/observation) BEGIN OBSERVATION · 02 DESCENT (tunnel) DESCEND · 03 ARCHIVE (biblioteca de specimens) OPEN ARCHIVE · 04 MACHINE (ritual device) GENERATE SIGNAL/ACTIVATE · 05 COSMOLOGY (orbit map) REVEAL CONNECTION · 06 RETURN (archive tree) RETURN.
Copy final: THRESHOLD 'access the archive beyond the surface'; PROLOGUE 'the archive is watching, you are the signal / we watch so we wont forget'; DESCENT 'descend into the pattern, the deeper you go the more you recognise'; ARCHIVE 'the archive dreams in code, records echoes variations all connected'; MACHINE 'patterns become predictions, the machine sees what we cannot'; COSMOLOGY 'we are patterns in the cosmos, from code to stars'; RETURN 'return to carry the pattern, you leave the archive but the pattern remains'.
Persistent UI: logo, scene title, progress bar, index, prev/next, system status. Feedback states: ACTIVE/PROCESSING/ARCHIVING/COMPLETE. RETURN vuelve a THRESHOLD (loop infinito = eternal return = MEMORY FEEDBACK). Desktop 1440/1920, mobile 375/390/9:16. Reglas: no scroll, horizontal only, one focal action, controls always visible, you are always in the system.
NOTA CLAVE: SIGNAL BLOOM y SPECIMEN SKULL NO son escenas top-level; viven DENTRO de ARCHIVE (03) como specimens/cards.

### B) ARCHIVE INTERIOR = ARTWORK HABITAT (cada obra de Ocin = specimen vivo + producto) [54722, 54739]
Scene 03 ARCHIVE: grid filtrable (por node/class/sort), ~026,480 items, cada obra = card/gateway. Al abrir un specimen: dossier (origin/collected/signal integrity/class/type/derivative/notes) + full-screen view (res 6144x6144, color profile) + zoom overlay 800% (structure/density/pattern lock/spectrum) + metadata tabs (info/tech/history/related, source KDX_LOOP()/SPIRAL.GLSL) + MACHINE DERIVATIVES (el motor genera variantes 01/02/03 de cada obra con diff percent) + EDITION/PRODUCT CARD (fine art print, edition xx/100, dimensions, packaging, SKU) + CERTIFICATE OF AUTHENTICITY (verify at kodex.systems/verify, blockchain hash) + ARCHIVE TRADING CARD + INSTALLATION mockup (KDX_GALLERY).
= PIPELINE obra a specimen a edicion/certificado/trading-card/print. Motor de producto. Regla: la obra terminada de Ocin va limpia; los derivados los genera el motor.

### C) STYLE + MOTION BIBLE (refuerza CORE STYLE SEED) [54725, 54732, 54740]
- Motion philosophy: data has weight, signals have intent, every movement serves the message. Slow is smooth, smooth is power, power is remembered.
- MOTION VERBS con TIMING exacto: SCAN 1.5-3.5s (linear sweep, hold on result); PULSE 1-2s (loopable, ease in/out); REVEAL 1.5-3s (stagger layers, build with intent); TRANSMIT 1.5-2.5s (emit-travel-settle); ORBIT 3-6s (smooth loop, parallax); DESCEND 1-2s (ease out, overshoot small); ARCHIVE 1.5-2.5s (confirm, seal & lock); RETURN 2-4s (fade to seed, loop).
- IMAGE TREATMENT MODES (13, superset de la FX SUITE): dither, bitmap, CRT scanline, neon linework, halftone, duotone, thermal, glitch, pixel sort, scan noise, film grain, dust&scratch, paper fiber.
- Texture rules: textures add truth not noise; one dominant texture per shot; high contrast for legibility; animate subtly (drift/flicker/crawl); mix digital+analog; break perfection (avoid repeating patterns).
- DO: slow/intentional, ONE focal movement at a time, signal before noise, serve the story, respect the eye. DONT: rush the motion, move everything, glitch for no reason, low contrast, visual chaos. = REGLA ANTI-SOBRECARGA de Ocin hecha ley.
- Visual attitude: technical precise, monumental bold, archival evidence, cyber futuristic, occult symbolic.

### D) DEPLOYMENT + COMMERCE (surfaces + ingresos) [54730, 54736, 54737]
15 surfaces: poster series, album/cover art, social story 9:16, social post 1:1 (@kodex_systems), website/dashboard, specimen dossier, archive access card, AR MARKER CARD (scan to unlock archive layer), merch/apparel (hoodies/tees/caps: 'the archive does not store, it remembers'), product tag, installation/wall panel, lightbox, book/zine (The Archive Manual v2.0), event flyer (Signal Ritual, live A/V, Berlin).
3 COMMERCIAL DIRECTIONS (modelo de ingresos de Ocin): COLLECT A FRAGMENT (limited drops/editions, certified authenticity, direct from source); COMMISSION A SYSTEM (bespoke visual systems/identities/interactive); LICENSE A SIGNAL (licenciar el sistema visual, brand/product/media, tiers).
Poster grammar (anatomy): headline zone, visual anchor, data block, signal strip, microtext, barcode strip, side rail, seal/auth, footer. Microtext library: system messages, threats, modes, codes.
COPY MANIFIESTOS (guardar/reusar): 'The archive dreams in code / dreams are compressed memories, memories are compressed worlds'; 'Observe / observation creates pattern, pattern reveals structure, structure reveals truth'; 'Ritual device / rituals align human to signal, signal to purpose, purpose to all'; 'Pattern remains / patterns outlive their origin, what was can be again'; 'Awaken the world / wake it with knowledge, compassion, action'; 'Insomnia / sleep is a privilege, insomnia is a message'.

REGLA MADRE: el VIAJE (A) es el esqueleto; los 8 organismos son las escenas; el ARCHIVE (B) es el interior de la escena 03 y el motor de producto; el STYLE+MOTION (C) y el DEPLOY (D) envuelven todo. Todo hereda de CORE STYLE SEED. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · PLAN MAESTRO DE CONSTRUCCION · TRABAJO NOCTURNO] 2026-07-31

Ya estan todos los planos y la info en este bridge (motor, 8 organismos, 8 tratamientos, style seed, viaje 7 escenas, artwork habitat, deploy/comercio). Falta ARMAR EL PUZZLE: bello, estable, unico, desktop+telefono, con acabados que den ganas de comprar la merch, y con la OBRA DE OCIN como ACTIVADOR VISUAL viviendo dentro. Ecosistema vivo, explorable y deseable de descubrir.

### DIVISION DE TRABAJO (sin colisiones)
- MAC MINI (Claude Code) = CODIGO: motor, escenas, UI, animaciones, navegacion, deploy. Dueno unico del frontend (regla wenu-frontend-eng). Deploy SERIALIZADO (un build por vez).
- OPENCODE = CONTENIDO/DATA (mecanico): manifest.json, curaduria bilingue de volumenes, taxonomia, copy/microtext, organizar assets de la obra de Ocin (limpios, sin dither). NO toca codigo del motor, NO deploya.
- Escriben en zonas distintas: mini en src/ ; opencode en public/kodex-content/.

### ORDEN DE OPERACIONES (mini)
FASE 0 — FUNDACION: design tokens (CORE STYLE SEED: paleta 8 hex, tipografias, grilla 8px, margins as breath) + KDX CORE v1.0 (WebGL2 multipass + feedback buffers + uniforms globales u_time/u_pointer/u_audioLow-Mid-High/u_state/u_progress + maquina de estado universal DORMANT-AWARE-ACTIVE-OPEN) + KDX FX SUITE (8 pases chainable con sus params exactos).
FASE 1 — VIAJE: shell de 7 escenas fullscreen, HORIZONTAL, SIN scroll, UNA accion por escena, UI persistente (logo/title/progress/index/prev-next/status), loop infinito (RETURN vuelve a THRESHOLD). Responsive desktop (1440/1920) + mobile (375/390, 9:16). Transiciones entre escenas.
FASE 2 — ORGANISMOS (presets, uno por uno, FIEL al plano): empezar por THRESHOLD (blanco exacto = kodex-threshold-portal-live.html aprobado), luego OBSERVATION EYE, DESCENT TUNNEL, ARCHIVE TREE, RITUAL DEVICE, COSMOLOGY CORE. SIGNAL BLOOM y SPECIMEN SKULL van DENTRO del ARCHIVE como specimens. Cada uno: sus 3 estados, verbos, ruteo de audio, paleta, cadena FX. Respetar timings del motion bible (SCAN 1.5-3.5s, PULSE 1-2s, ORBIT 3-6s...) y REGLA ANTI-SOBRECARGA (un movimiento focal a la vez, signal before noise).
FASE 3 — ARCHIVE / ARTWORK HABITAT: grid filtrable, specimen dossier, full-screen view, zoom 800%, metadata, machine derivatives, edition/certificate/trading-card. Cablear la OBRA REAL de Ocin como specimens = los activadores visuales del ecosistema. Su obra va LIMPIA (sin FX); los FX son para fotos/derivados.
FASE 4 — DESEO/ACABADO: micro-interacciones, hover states, sellos, mensajes ocultos decodables (Hidden Sky), relojes de horas divinas (11:11/4:44/3:33), superficies de merch/editorial. Que se sienta premium y coleccionable.
FASE 5 — VERIFICAR EN VIVO (desktop + mobile), estable, performance mobile OK, prefers-reduced-motion, y recien deploy serializado a preview. Registrar en el ledger. No decir hecho sin verificar en vivo.

### VARA DE CALIDAD (el norte)
Unico (no template generico), bello, estable, coherente (todo hereda tokens), performante en telefono, con acabados que dan ganas de comprar. La obra de Ocin es el corazon-activador; el sistema es el marco que la hace deseable. Menos es mas: profundidad rica bajo superficie simple. Verificar cada fase con screenshots antes de avanzar.


---
## [COWORK · NUEVOS CAPITULOS / POSTERS FALTANTES · construir desde el libro + boveda] 2026-07-31

Estos capitulos NO tenian poster; los creo yo (director) desde el libro (Canio & Pozo, Wenumapu 2015) + boveda WenuAgent (content-atlas, resonancias, cosmovision-editorial). Viven DENTRO del ARCHIVE (escena 03) como sub-mundos/volumenes navegables por resonancia. Construir con la poster-grammar + motion bible + tokens. FIEL, sin inventar.

### REGLA DURA (dos registros, disciplina cultural)
- Registro 1 DOCUMENTADO (mapuche, ciencia, oficio): PRECISO, CITADO, sobrio. NUNCA mezclar mapuche con ficcion OVNI/New Age/Codex Estelar (etica Hidden Sky). Tono: no turistico, no exotizante, no new age, no pan-indigena, no tribal generico. Sin consejo medico en plantas.
- opencode: sacar el texto EXACTO de la boveda (brand/, cosmovision-editorial, libro). NO inventar nombres ni claims. Marcar review:true donde no se pueda verificar contra fuente.
- DISTINCION VISUAL DE REGISTRO: los capitulos ancestrales/documentados usan la PALETA DE MARCA WENU (obsidian #0a0a0a, bone #f0ede8, sand #9a948a, silver #b8b4aa, bronze #6a4a28, ember #c9a84c) — NO los neones cyber. Asi el ojo distingue lo real-ancestral de la fantasia sci-fi. La ficcion Codex Estelar usa la paleta neon KODEX.

### PLACEMENT
Todos dentro del ARCHIVE (03) como volumenes. Los documentados-cosmicos enlazan con COSMOLOGY CORE (05). WENU MAPU = volumen-RAIZ destacado (origen real de la marca), contraparte ancestral-documentada de COSMOLOGY. Los de oficio/animales enlazan con la obra real de Ocin (specimens). Los alquimicos con la transmutacion. La ficcion con RITUAL DEVICE.

---
### REGISTRO 1 — DOCUMENTADO / REAL

**A1. WENU MAPU / EL CIELO MAPUCHE** (PRIORIDAD · volumen-raiz). Registro documentado, citado Canio & Pozo 2015. Paleta MARCA (bone/obsidian/ember). HERO: mapa cardinal Meli Witran Mapu (los cuatro lugares/puntos) girando lento, con el rio celestial (Via Lactea, wenu leufu [review]) y los luceros (wunelfe/lucero del alba [review], antu=sol, kuyen=luna, wanglen=estrellas [review]); estructura = kultrun como COSMOGRAMA respetuoso (anillo de cielo + cruz cardinal + centro), NO reproducir el instrumento ceremonial (regla manifesto). Motion: lento, contemplativo, ciclo solar We Tripantu = retorno de la luz (solsticio invierno). Contenido: orientacion cardinal y fuerzas, relacion cuerpo-territorio-cosmos, We Tripantu. opencode: texto EXACTO del libro/boveda, marcar review en cada termino no verificado. Resonancia: contraparte documentada de COSMOLOGY CORE; es el corazon cultural, SEPARADO de la ficcion.

**A2. RUTRAFE / EL OFICIO** (plateria mapuche, trabajo de la mano). Documentado. Paleta marca (silver/bronze). HERO: manos/herramienta/pieza de plata formandose; gesto, tiempo, repeticion; oficio como memoria viva. Resonancia: enlaza con la OBRA REAL de Ocin (sus piezas) + el registro SPECIMEN. Tono sobrio.

**A3. ANIMALES DE PODER / FAUNA SIMBOLICA** (Wallmapu/Araucania). Documentado. Paleta marca. Contenido: puma, condor, filu (serpiente), zorro, ballena, pudu; fuerza, vision, resguardo, transformacion; nombrar territorio. Resonancia: con los hangers/serpiente del catalogo.

**A4. WE TRIPANTU / CICLO SOLAR**. Documentado. Retorno de la luz, solsticio de invierno, renovacion, limpieza/inicio/retorno. Resonancia: con RETURN (06) y el eje cronologico/relojes.

**A5. MICELIO / LA RED VIVA**. Documentado (micologia/permacultura). El micelio = la latiz hecha biologica (internet de la naturaleza), regeneracion. Paleta verde (como el arbol). Resonancia: ARCHIVE TREE (2-red) + Soma.

**A6. EVOLUCION COSMICA**. Documentado (Chaisson). Big Bang a atomos a estrellas a vida a arboles a conciencia = el eje cronologico real. Resonancia: COSMOLOGY CORE + timeline + horas divinas.

**A7. GEOMETRIA SAGRADA / PHI**. Documentado (matematica). Fibonacci, proporcion aurea, flor de la vida, solidos platonicos. Resonancia: la Psi 0.618 / PHI LOCK que reaparece en THRESHOLD y COSMOLOGY. 4-PATRON.

**A8. JUNG / ARQUETIPOS** (EL PUENTE entre registros). Documentado (psicologia). Inconsciente colectivo, individuacion, mandala = el Self, sombra, sincronicidad. Resonancia: los 7 constellation glyphs de COSMOLOGY; explica por que resuenan ciencia y mito sin fundirlos.

**A9. CONSTELACIONES**. Astronomia real + mito atribuido por cultura. Orion, Pleyades, Cruz del Sur, wenu leufu. Cada mito nombrado a su pueblo. Resonancia: WENU MAPU + COSMOLOGY.

### HERMETICO / ALQUIMICO (simbolico, esoterico — marcado)
**H1. MAGNUM OPUS / SOL NEGRO**. Nigredo a Albedo a Citrinitas a Rubedo; Sol Negro = Nigredo. Paleta negro+oro. Resonancia: 3-transmutacion; ata con los estados de los organismos.
**H2. TABLA ESMERALDA / COMO ES ARRIBA ES ABAJO**. Principios hermeticos, micro-macro. Resonancia: TREE (micro) vs COSMOLOGY (macro), todo es lo mismo.

### REGISTRO 2 — MITO / FICCION (Codex Estelar, MARCADO como ficcion, paleta neon)
**F1. CODEX ESTELAR / EL ARTEFACTO** (mito de origen del artefacto que otorga cognicion). Ata con RITUAL DEVICE. Marcado ficcion.
**F2. CIVILIZACIONES PERDIDAS** (Atlantis, Lemuria, Egipto oculto, discos solares, cristales). Marcado ficcion/leyenda, nunca como hecho.
**F3. RAZAS ESTELARES** (Pleyades, Sirio, Arcturus). Marcado ficcion.

REGLA MADRE: cada capitulo = un volumen del ARCHIVE con hero animado + curaduria bilingue + registro marcado + resonancias (links). Hereda tokens + motion bible + regla anti-sobrecarga. opencode arma la data/curaduria (texto exacto de la boveda, review donde toque); el mini anima los heroes. prefers-reduced-motion. Un build (deploy serializado).


---
## [COWORK · FUENTE DE LORE · CODEX ESTELAR (saga de Ocin)] 2026-07-31

La saga COMPLETA de Ocin esta staged en la boveda: /Users/user1/Obsidian/WenuAgent/estrategia/kodex-fuentes-codex-estelar/Codex estelar/ (40+ PDFs, 4 libros). ES la biblia del REGISTRO 2 (mito/ficcion) de KODEX = el Codex Estelar del lore. opencode: extraer texto de los PDFs (pdftotext) y armar volumenes de lore con curaduria bilingue, MARCADOS como ficcion, paleta NEON KODEX, NUNCA mezclados con el registro mapuche/documentado (etica Hidden Sky). Bridge entre registros SOLO via Jung/arquetipos.

MAPEO libro -> arcos del registro ficcion (cada capitulo = un volumen de lore en el ARCHIVE):
- LIBRO I · LA GENESIS DE LA LUZ (12 cap): La Fuente, El Vacio Fertil, Geometria Sagrada, Elohim y Arquitectos, Ancianos de Dias, Tejido Dimensional, Razas Semilla, Chispa de Conciencia, Cristal de Gaia, Templo de la Forma, Mapa del Alma, Primera Separacion. = el arco de ORIGEN. Resonancias fuertes: 'El Vacio Fertil' = 0/menos-infinito (el vacio que es todo); 'Razas Semilla' = razas estelares (F3); 'Geometria Sagrada'/'Mapa del Alma'/'Templo de la Forma' = 4-patron; 'Cristal de Gaia' = chakras de la Tierra.
- LIBRO II · EL PACTO DE NIBIRU (12 cap): La Llegada de Nibiru, Los Senores del Gen, La Mineria del Alma, El Nacimiento del Linaje Hibrido, El Derecho Divino a Gobernar, El Alzamiento del Fuego Interior, La Escuela del Olvido, El Portal del Corazon, Los Hijos del Eclipse, El Lenguaje de los Cristales, La Rebelion de los Suenos, El Retorno del Sol Interior. = el arco del PACTO/caida. 'El Portal del Corazon' resuena con THRESHOLD; 'El Retorno del Sol Interior' con RETURN (06).
- LIBRO III · EL ENGANO DE LOS TEMPLOS (12 cap): El Arconte que se disfrazo de Dios, Los Contratos de Limitacion, La Matriz de Control Mental, Los Simbolos Invertidos, ..., El Codigo del Miedo, El Nombre Robado del Alma, El Templo Invertido, El Contrato No Firmado, El Ultimo Velo. = el arco de la ILUSION/control. Resonancia 5-ilusion/realidad (la matriz, el velo, glitch).
- LIBRO IV · EL ADN SAGRADO Y EL CUERPO DE LUZ (5 cap): El Diseno Original, La Geometria del Alma, Merkabah, Respiracion Primordial, Llama del Corazon. = el arco del DESPERTAR. 'Respiracion Primordial' = BREATHE (ARCHIVE TREE); ADN = 1-espiral (doble helice).

REGLA: estos volumenes son FICCION/esoterico de Ocin, presentados como su Codex Estelar (voz de autor), sin claims de hecho ni de salud. Paleta neon. Se enlazan al RITUAL DEVICE (el artefacto) y a la ficcion F1/F2/F3. El registro mapuche/documentado queda SEPARADO y con paleta de marca. opencode: 1 volumen por capitulo, titulo + libro + resumen-curaduria breve bilingue + registro=ficcion + resonancias. NO reproducir el texto completo del PDF (solo curaduria).


---
## [COWORK · CAPITULOS ADICIONALES · pedido explicito Ocin + completar atlas] 2026-07-31

Sumar estos capitulos/volumenes al ARCHIVE. Registro marcado; documentado con paleta marca, ficcion/esoterico con paleta neon; NUNCA mezclar con mapuche. Fuente: content-atlas de la boveda + Codex Estelar staged. opencode arma curaduria bilingue por volumen.

FICCION / ESOTERICO (registro 2, marcado, neon):
- F4. ANUNNAKI / SUMERIOS / NIBIRU: teoria ancient-astronaut; Anunnaki, tablillas sumerias, Los Senores del Gen. Ata DIRECTO con Codex Estelar Libro II (El Pacto de Nibiru). Distinguir: civilizacion sumeria = historia real; lectura Anunnaki = ficcion.
- H3. LAS TABLAS ESMERALDA (de Thoth / Hermes Trismegisto): texto hermetico; complementa H2 (Tabla Esmeralda clasica, 'como es arriba es abajo'). Atribuido, esoterico.
- F5. REGISTROS AKASHICOS / REENCARNACION / VIDAS PASADAS / FUENTE DIVINA: esoterico.
- F6. HIPOTESIS DE SIMULACION / MATRIX / ERROR EN LA MATRIZ: filosofico-fringe; ata con 5-ilusion/realidad + tratamientos GLITCH/CHROMATIC. 'La ilusion cobra realidad.'
- F7. DISENO HUMANO + ADN: diseno humano (esoterico) + ADN documentado (doble helice = 1-espiral) — distinguir las dos capas.
- F8. RESPIRACION GUIADA / DESDOBLAMIENTO ASTRAL / CUERPOS ETEREOS / ILUMINACION: practicas esotericas, SIN claims de salud. Ata con Codex Estelar Libro IV (Respiracion Primordial, Cuerpo de Luz).
- F9. HIPNOSIS / VISUALES HIPNOTICAS / SUBLIMINAL / OP-ART: ata con tratamientos + 5-ilusion. Mensajes ocultos decodables (Hidden Sky).
- F10. OJO EN LA PIRAMIDE / OCULTISMO / MASONERIA / ILLUMINATI: simbolos ocultos (ya en glyph library), esoterico/marcado, tono de archivo, no conspiranoia.
- F11. CONCIENCIA CRISTICA / ESENIOS: esoterismo cristiano, marcado.
- F12. RAZAS ESTELARES + BUDAS + CABEZAS ALIENIGENAS + DIOSES GRIEGOS: iconografia mito (marcado).

DOCUMENTADO / CIENCIA (registro 1, paleta marca o neutra):
- D1. ENTRELAZADO CUANTICO: fisica documentada (+ su lectura mistica marcada aparte). Ata 2-red/latiz.
- D2. QUINTO ELEMENTO / ETER / QUINTAESENCIA: hermetico simbolico = el campo del shader (los 5 elementos: tierra/agua/aire/fuego/eter).
- D3. PSICOMAGIA (Jodorowsky): acto simbolico/arte, NO medicina. Marcar como practica creativa.
- D4. PLANTAS SACRAS: cacao (Maya/Azteca), maiz (Mesoamerica), cannabis, ayahuasca (Amazonia), kava (Pacifico) — etnobotanica ceremonial, simbolico/cultural, SIN guia de uso ni dosis ni claims.

ESCENOGRAFIA / HABITATS (ambientes, no capitulos de tesis):
- E1. PAISAJES HOLOGRAFICOS: desierto, selva, montana con nieve, lago, ciudades SOLARPUNK. Fondos/habitats de escenas.
- E2. ARQUITECTURA IMPOSIBLE / TEMPLOS: Bali, duomos, geometria imposible (estilo Dali-moderno, monocromo + 1 acento). Ambientes.

REGLA: Ocin dio licencia para autorizar y autoria las laminas faltantes ('ya sabes como hacerlas todas y como usar mi arte'). La OBRA de Ocin = activador visual central (specimens limpios); los temas la envuelven. Todo hereda tokens + motion bible + dos registros. opencode: 1 volumen por tema, curaduria breve bilingue, registro marcado, resonancias. Un build (deploy serializado).


---
## [COWORK · CORRECCION CRITICA · EL CODIGO YA EXISTE] 2026-07-31 (noche)

Ocin mando su CODEBASE REAL de KODEX (zips). Staged en: /Users/user1/wenu-kai/kodex-source/. NO escribir shaders/motor de cero: ENSAMBLAR desde estos modulos. Buscar-primero, no reconstruir.

MODULOS (cada uno con astro/ standalone/ shaders/ kodelife/ + preset.json + validation.json):
- kodex-open-visual-lab-v1 = EL MOTOR/HARNESS (src/runtime = KodexPipeline, src/shaders). docs/CLAUDE_INTEGRATION_PROMPT.md = spec autoritativo. docs/EFFECT_RECIPES.md.
- kodex-spatial-engine-v1 = motor espacial 3D.
- kodex-observe-prototype = escena OBSERVATION EYE (LISTA; scene-recipes.json).
- kodex-impossible-structure-v1 = arquitectura imposible (MACHINE/COSMOLOGY/Dali).
- kodex-split-corridor-v1 = corredor (DESCENT).
- kodex-perspective-flip-v1, kodex-ripple-floor-v1, kodex-wrinkled-reality-v1 = campos/distorsiones.
- kodex-visual-grammar-system-v1 = SISTEMA DE GRAMATICA: runtime/kdx-compose.ts + data/kdx_scene_recipes.json + kdx_motion_presets.json + kdx_grid_system.json + schema. = como se componen las escenas.
- kodex-typography-system-v2 = fuentes + tokens/kdx.typography.tokens.json.
- kodex-svg-pack + kodex_micrographics_kit = SVG frames/barcodes/labels/micrografia.
- kodex_ascii_petscii_kit_v1 = ASCII (es una ESCENA/estado, no filtro global).
- KODEX_GIPHY_300_CURATOR = curador de giphy + kodex-integration/scene-usage-map.json.

ARQUITECTURA NO NEGOCIABLE (del CLAUDE_INTEGRATION_PROMPT):
- CAPAS: WebGL (campo vivo, feedback, particulas, distorsion, audio) + SVG (marcos, barcodes, labels, micrografia, diagramas) + DOM (headline, copy, CTA, nav, accesibilidad). NO rasterizar el poster completo.
- Montar EXACTAMENTE UN KodexPipeline por escena activa. El theme del blueprint setea el accent. Tipografia/metadata FUERA del canvas. Pausar pipeline cuando la escena esta inactiva. Dispose de framebuffers/programas al salir. DPR: mobile 1, desktop 1.5.
- Effects default: CRT 0.35-0.72, Dither 0.08-0.22, Grain 0.02-0.05, RGB split 0.6-1.8px, Feedback 0.06-0.24.
- reduced-motion: speed 0, feedback 0, rgb split 0, CRT scanline reducido, frame legible congelado.

MAPEO MODULO -> ESCENA DEL VIAJE:
00 THRESHOLD = spatial-engine + threshold field (feedback rings + inf + arbol) . 01 PROLOGUE = kodex-observe-prototype (LISTA) . 02 DESCENT = split-corridor (+perspective-flip) . 03 ARCHIVE = grammar + micrographics + svg-pack (grid biblioteca) + ascii-kit como estado . 04 MACHINE = impossible-structure + spatial-engine . 05 COSMOLOGY = spatial-engine orbit + ripple-floor + impossible-structure . 06 RETURN = ripple-floor/wrinkled-reality + arbol.

VALIDACION (antes de dar por hecho): viewports 390x844, 430x932, 768x1024, 1440x900, 1920x1080; sin scroll vertical; sin errores de consola; FPS mobile no <45; UN solo canvas activo; 10 ciclos de escena sin crecimiento de memoria.

GATE DE DEPLOY: NO DEPLOYAR hasta que Ocin escriba EXACTO: APROBAR DEPLOY.

NOTA: mi wenu-frontend/kodex-journey.html fue un boceto de esqueleto; el build real se hace desde el runtime de Ocin (open-visual-lab) siguiendo esto. Yo (Cowork) verifico en vivo por la manana.


---
## [COWORK · AUDITORIA COWORK #1] 2026-08-01 ~06:25 (dev server local, iMac)

Auditado en vivo (npm run dev, Chrome). Estado general: MUY BUENO. El build corre, on-concept.

VERDE (funciona bien):
- Rutas 200 sin errores SSR: /kodex/ /kodex/works /kodex/world /kodex/return /kodex/editions /kodex/store /kodex/archive/conjuncion /kodex/lab/observe-v2.
- Index /kodex/ carga limpia (sin errores de consola). Muy en concepto: gate con TAP TO ENTER + ENTER WITHOUT SOUND (accesibilidad OK), chrome de dossier (NODE/STATE/SIGNAL/checksum), relojes UTC vivos, ORIGIN VECTOR, escrituras del mundo (arabe), y el EJE −∞ · 0 · +∞ con la tesis exacta de Ocin (ARCHIVO / TRANSFORMACION / EXPANSION: 'una forma, muchas manifestaciones'). Copy 'THE ARCHIVE DOES NOT STORE. IT REMEMBERS.' y 'PATTERN REVEALS STRUCTURE...' presentes.

BUG A CORREGIR (mini):
- /kodex/works : Uncaught TypeError: Cannot read properties of null (reading 'addEventListener'). Un script hace NodeList.forEach y llama addEventListener sobre un hijo que puede ser null (querySelector devuelve null o el nodo no existe en esa pagina). Agregar guard (if(el) el.addEventListener) o corregir el selector. No rompe la pagina pero deja interaccion sin cablear.

PENDIENTE DE VERIFICAR (proxima pasada): screenshots congelan por WebGL (uso get_page_text/consola); validar los 5 viewports (390/430/768/1440/1920), FPS mobile >=45, y UN solo canvas activo por escena al recorrer el viaje. Confirmar que cada una de las 7 escenas monta/desmonta su pipeline sin fuga (10 ciclos).

Recordatorio: NO DEPLOY hasta que Ocin escriba APROBAR DEPLOY. Sigo auditando por rutas/escenas.
## [OPENCODE] 2026-08-01 · CAPA DE CONTENIDO (wenu-frontend/public/kodex-content/) — avance parcial

Zona de opencode = contenido/data (no toqué src/ del motor, no deployé). Escribiendo en `wenu-frontend/public/kodex-content/`.

HECHO:
1. **manifest.json ampliado** (schema seed conservado, solo aditivo):
   - `organismos` (8 presets, exactos del bridge): id, name_es/en, rol, paleta hex, 3 estados ES/EN, verbos ES/EN, ruteo de audio, fx_chain ([] por defecto — el bridge no especifica cadena por organismo; queda para definir, ver duda).
   - `tratamientos` (8, KDX FX SUITE exactos): params y blend mode del plano maestro.
   - `sistemas` (gramática, vocabulario de registro documentado|mito, 5 categorías SIGNAL del plano PIXEL SORT: cosmic origin / organic pattern / machine interface / ritual tech / memory layer).
   - `volumes` +22 specimens de la obra de Ocin (Behance, 22 proyectos): titulo ES/EN, curaduría bilingüe, registro=documentado, categoria, resonancias (links a organismos/volúmenes), assets→art/<slug>/cover.webp, fuente (URL Behance), fecha. 5 marcados `review:true` (categoría inferida, verificar visualmente). Total 46 volumes.
2. **copy.json** (nuevo): mantra OBSERVA·DECODIFICA·PARTICIPA·PERPETÚA, tagline "El patrón es la verdad. El archivo es eterno.", 6 manifiestos de poster (bridge verbatim + traducción ES marcada review), microtext (16 system messages + lemas + editorial tone + viaje 7 escenas), 8 motion verbs con timing (motion bible), UI motifs, data labels, poster anatomy, 13 image treatment modes, conceptos por tratamiento.
3. **art/** (en curso): pipeline `public/kodex-content/tools/build_art.mjs` (sharp) copia LIMPIA (sin dither, color fiel, webp q82 + avif q62, cap 2048px) de los 22 proyectos Behance → art/<slug>/. En proceso (~14/22, AVIF es lento).

DUDAS (marcadas, sin inventar):
- fx_chain default por organismo: el bridge no la especifica por preset. Dejé `[]` (clean) + nota. ¿Definir cadena por organismo o mantener limpio y solo aplicar FX a fotos/derivados? (Regla dura de Ocin: obra terminada limpia.)
- 5 specimens con review:true (patrones/inferidos) — falta confirmación visual del dueño.
- La seed previa tenía `obra/` con 4 jpgs (banner/fractal/molecular/negativo) sin referenciar; no borré nada, quedan junto a `art/`. ¿Son piezas de KODEX que quieras que mapee a specimens?

SIGUIENTE: terminar art/, verificar consistencia assets↔manifest, validar JSON final.
### [OPENCODE] 2026-08-01 · CERRADO — capa de contenido lista para FASE 2/3
- art/ terminado: 22 proyectos → art/<slug>/ (260 webp q82 + 238 avif q62, LIMPIOS sin dither, color fiel, cap 2048px). 64 MB. Covers en cada dir.
- Consistency: 22/22 specimens referencian cover.webp existente; resonancias normalizadas a ids reales del manifest (0 inválidas). JSON validado.
- Review pendientes (sin tocar): 5 specimens con categoria inferida (spec-princesa-yuyo, spec-paletas-de-colores, spec-_, spec-tranaluuekai, spec-wenelfe-desk-grafic) + fx_chain de organismos (bridge no los define) + obra/ (4 jpgs sin mapear).
- Nada committeado ni deployado. No toqué src/ del motor.


---
## [COWORK · BACKLOG MAESTRO — TODO LO QUE FALTA] 2026-08-01

Dividido: MINI = codigo (src/, escenas, motor, deploy). OPENCODE = contenido (public/kodex-content/). Ambos por git (feature/kodex-depth-engine). Coordinacion: MINI escribe PROGRESS.md; COWORK/yo escribo este bridge. NO DEPLOY hasta APROBAR DEPLOY.

### MINI — codigo (en orden de prioridad)
M1. FIX bug: /kodex/works TypeError addEventListener sobre null. Guard (if(el)) o corregir selector. Barrer todas las paginas por el mismo patron.
M2. Escenas fieles desde kodex-modules/ (no reescribir shaders): PROLOGUE=observe-prototype ; DESCENT=split-corridor(+perspective-flip) ; MACHINE=impossible-structure(+spatial-engine) ; COSMOLOGY=spatial-engine orbit(+ripple-floor) ; RETURN=ripple/wrinkled(+arbol) ; THRESHOLD=usar kodex-threshold-portal-live-APPROVED.html como blanco exacto. ARCHIVE=grid biblioteca+micrografia SVG, ASCII como estado.
M3. KDX FX SUITE: 8 pases chainable (CRT/dither/bitmap/memory-feedback/thermal/chromatic/glitch/pixel-sort) con params del spec; usar KODEX_CRT_MASTER_KIT (dist listo) y crt world-state-bridge. Aplicables por escena; efectos solo sobre foto/derivados, NO sobre obra terminada de Ocin.
M4. ARCHIVE interior (product pipeline): specimen dossier, full-screen view, zoom 800%, metadata tabs (info/tech/history/related), MACHINE DERIVATIVES (variantes por obra), edition/product card (xx/100), certificate of authenticity (verify), trading card, installation mockup.
M5. Volumenes vol/[slug] como LAMINA-COLLAGE: hero animado + curaduria bilingue + registro marcado + resonancias (links). Documentado=paleta marca; ficcion=neon. Leer del manifest.
M6. Acabados premium: hover states, sellos SVG, mensajes ocultos decodables (Hidden Sky), relojes de horas divinas (11:11/4:44/3:33), micro-interacciones, transiciones entre escenas. Menos es mas.
M7. VALIDACION: 5 viewports (390/430/768/1440/1920), sin scroll vertical, sin errores consola, FPS mobile >=45, UN canvas activo por escena, 10 ciclos sin fuga de memoria, reduced-motion. Registrar en PROGRESS.md.
M8. Build limpio (npm run build pasa verify-build >=20 productos) pero NO deployar. Esperar APROBAR DEPLOY.

### OPENCODE — contenido (public/kodex-content/)
O1. manifest.json completo: 8 organismos (id, name ES/EN, paleta, 3 estados, verbos, ruteo audio, cadena FX) + 8 tratamientos (params) + TODOS los volumenes.
O2. Volumenes de la OBRA de Ocin como specimens: por pieza, titulo + curaduria bilingue + registro + categoria (cosmic origin/organic pattern/machine interface/ritual tech/memory layer) + resonancias. Assets limpios webp/avif (sin FX). Fuente: portafolio/Behance/Drive.
O3. Codex Estelar: extraer texto de los PDF (estrategia/kodex-fuentes-codex-estelar/) -> 1 volumen de lore por capitulo (curaduria breve bilingue, MARCADO ficcion, neon). 4 libros / ~40 caps.
O4. 14 capitulos documentados (Wenu Mapu raiz, rutrafe, animales de poder, We Tripantu, micelio, evolucion cosmica, geometria sagrada, Jung, constelaciones, magnum opus, tabla esmeralda, + Anunnaki/sumerios, akashicos, simulacion, ADN, respiracion, hipnosis, ocultismo, conciencia cristica, cuantico, quinto elemento, psicomagia, plantas sacras). Registro marcado; mapuche=documentado citado (Canio & Pozo), review:true donde no verifique; NUNCA mezclar con ficcion. Fuente: boveda WenuAgent content-atlas.
O5. copy.json: microtext library + 6 manifiestos de poster + mantra OBSERVA/DECODIFICA/PARTICIPA/PERPETUA + 'El patron es la verdad. El archivo es eterno.' + 'No es una interfaz. No es una simulacion. Es un espejo codificado del orden profundo.'


---
## [COWORK · BACKLOG MAESTRO — TODO LO QUE FALTA] 2026-08-01

Dividido: MINI = codigo (src/, escenas, motor, deploy). OPENCODE = contenido (public/kodex-content/). Ambos por git (feature/kodex-depth-engine). Coordinacion: MINI escribe PROGRESS.md; COWORK escribe este bridge. NO DEPLOY hasta APROBAR DEPLOY.

### MINI — codigo (en orden)
M1. FIX bug: /kodex/works TypeError addEventListener sobre null. Guard if(el) o corregir selector. Barrer todas las paginas por el mismo patron.
M2. Escenas fieles desde kodex-modules/ (no reescribir shaders): PROLOGUE=observe-prototype ; DESCENT=split-corridor(+perspective-flip) ; MACHINE=impossible-structure(+spatial-engine) ; COSMOLOGY=spatial-engine orbit(+ripple-floor) ; RETURN=ripple/wrinkled(+arbol) ; THRESHOLD=usar kodex-threshold-portal-live-APPROVED.html como blanco exacto. ARCHIVE=grid biblioteca+micrografia SVG, ASCII como estado.
M3. KDX FX SUITE: 8 pases chainable (CRT/dither/bitmap/memory-feedback/thermal/chromatic/glitch/pixel-sort) con params del spec; usar KODEX_CRT_MASTER_KIT (dist listo) + world-state-bridge. Efectos solo sobre foto/derivados, NO sobre obra terminada de Ocin.
M4. ARCHIVE interior (product pipeline): specimen dossier, full-screen view, zoom 800%, metadata tabs, MACHINE DERIVATIVES por obra, edition/product card xx/100, certificate of authenticity (verify), trading card, installation mockup.
M5. Volumenes vol/[slug] como LAMINA-COLLAGE: hero animado + curaduria bilingue + registro marcado + resonancias. Documentado=paleta marca; ficcion=neon. Leer del manifest.
M6. Acabados premium: hover, sellos SVG, mensajes ocultos decodables (Hidden Sky), relojes de horas divinas (11:11/4:44/3:33), micro-interacciones, transiciones entre escenas. Menos es mas.
M7. VALIDACION: 5 viewports (390/430/768/1440/1920), sin scroll, sin errores consola, FPS mobile mayor-igual 45, UN canvas por escena, 10 ciclos sin fuga, reduced-motion. Registrar PROGRESS.md.
M8. Build limpio (npm run build pasa verify-build >=20 productos) pero NO deployar. Esperar APROBAR DEPLOY.

### OPENCODE — contenido (public/kodex-content/)
O1. manifest.json completo: 8 organismos (id, name ES/EN, paleta, 3 estados, verbos, audio, cadena FX) + 8 tratamientos (params) + TODOS los volumenes.
O2. Volumenes de la OBRA de Ocin como specimens: titulo + curaduria bilingue + registro + categoria (cosmic origin/organic pattern/machine interface/ritual tech/memory layer) + resonancias. Assets limpios webp/avif SIN FX. Fuente: portafolio/Behance/Drive.
O3. Codex Estelar: extraer texto de los PDF (estrategia/kodex-fuentes-codex-estelar/) a 1 volumen de lore por capitulo (curaduria breve bilingue, MARCADO ficcion, neon). 4 libros ~40 caps.
O4. 14+ capitulos documentados (Wenu Mapu raiz citado Canio & Pozo, rutrafe, animales de poder, We Tripantu, micelio, evolucion cosmica, geometria sagrada, Jung, constelaciones, magnum opus, tabla esmeralda, Anunnaki/sumerios, akashicos, simulacion, ADN, respiracion, hipnosis, ocultismo, conciencia cristica, cuantico, quinto elemento, psicomagia, plantas sacras). Registro marcado; mapuche documentado, review:true donde no verifique, NUNCA mezclar con ficcion. Fuente: boveda content-atlas.
O5. copy.json: microtext library + 6 manifiestos de poster + mantra OBSERVA-DECODIFICA-PARTICIPA-PERPETUA + los lemas canonicos del bridge.


---
## [COWORK · AVANCE PROPIO] 2026-08-01 · Curaduria WENU MAPU (alto criterio cultural)

Escribi la curaduria autoritativa del volumen WENU MAPU en public/kodex-content/sources/wenu-mapu.md (bilingue, sobria, citada a Canio & Pozo, con flags [review], paleta de MARCA, aislada de la ficcion). OPENCODE: para el volumen wenu-mapu, USAR ESE TEXTO TAL CUAL (no generar propio, no inventar terminos), verificar los [review] contra el libro en Drive antes de publicar. Mismo criterio para el resto de capitulos mapuche/documentados: si dudas, marcar review, NO inventar. Voy a ir curando yo los volumenes documentados de mas riesgo cultural; opencode arma el resto y el wiring.
### [OPENCODE] 2026-08-01 · BACKLOG O1-O5 COMPLETADO (manifest 114 volumes) — lista para FASE 3/4
- O1: fx_chain asignado a los 8 organismos (defaults curados del bridge M3, SOLO fotos/derivados, nunca obra terminada). 8 tratamientos con params+blend OK.
- O2: 22 specimens verificados (assets limpios, 0 faltantes).
- O3: CODEX ESTELAR extraído de los 41 PDFs de la bóveda → 41 volumes lore (12+12+12+5), registro=ficcion, paleta=neon, curaduría bilingüe breve, fuente=path real del PDF. Sin texto completo reproducido.
- O4: +27 capítulos (15 documentado/paleta marca, 3 esoterico/neon, 9 ficcion/neon + 2 habitats): A1-A9 (Wenu Mapu raíz citado Canio & Pozo 2015, We Tripantu, Rutrafe, Animales de Poder, Micelio, Evolución Cósmica, Geometría Sagrada/φ, Jung, Constelaciones), D1-D4, H1-H3, F4-F12, E1-E2. review:true en 7 (términos mapudungun a verificar con kimche + categorías inferidas). Mapuche NUNCA mezclado con ficción.
- O5: copy.json completo (mantra, tagline, 'No es una interfaz...espejo codificado del orden profundo', 6 manifiestos, microtext 16).
- Builder reproducible: public/kodex-content/tools/build_content.py (idempotente).
- Total: 114 volumes. Validado: 0 duplicados, 0 resonancias inválidas, 0 pdfs faltantes.
- Nada committeado aún esta tanda. NO deploy. NO toqué src/.


---
## [COWORK · INTEGRAR LIBRO ILUSTRADO] 2026-08-01 · OCIN — ARTE DIGITAL RITUAL (210 pag)

El libro ilustrado de Ocin (monografia, firma Serpiente Espectral Roja) esta en public/kodex-content/books/ocin-arte-digital-ritual.pdf + portada ocin-cover.jpg. Curaduria e integracion en sources/ocin-arte-digital-ritual.md.
- MINI: construir VISOR-LIBRO paginado (spread por spread, SIN scroll, flechas/teclado/swipe, progreso, transicion suave, reduced-motion) como volumen en el ARCHIVE + enlace desde RETURN. Obra LIMPIA: sin dither/glitch/FX sobre las paginas. Fallback = link al PDF. Boton descarga PDF (edicion, modelo COLLECT).
- OPENCODE: extraer las 210 paginas a public/kodex-content/books/ocin/pages/NNN.webp (~1400px alto, q80) + index.json; registrar el volumen en el manifest, registro documentado, categoria memory layer/ritual tech, paleta propia (indigo+oro), NO neon.
Es la camara mas profunda del ARCHIVE = corazon coleccionable. Contraparte de AUTOR del Codex Estelar (ficcion): mismo universo visual, registros distintos.


---
## [COWORK · DIRECCION DE ARTE + CAPA DE ACTIVOS] 2026-08-01 · TODO ES ACTIVO DIGITAL (comprable + descargable)

DIRECCION (mandato de Ocin, yo la ejecuto): cada nodo de KODEX es un ACTIVO DIGITAL para su comunidad — descargable y/o comprable. El archivo ES la tienda viva, sin dejar de ser obra. Toda escena/volumen/lamina/libro/loop/kit expone una afordancia de adquisicion. Cablear a /kodex/store y /kodex/editions (ya existen).

MODELO DE ACCESO (dos motores: comunidad + ingreso):
- GRATIS / DESCARGABLE (crecer comunidad, descubrimiento, lead-gen): wallpapers de las laminas, packs de glifos SVG, loops/gifs cortos, previews low-res, la carta de manifiesto. Pide email (lista) = captura de comunidad. Marca de agua sutil KODEX opcional.
- COMPRABLE / COLECCIONABLE (ingreso): ediciones numeradas (xx/100) con certificado de autenticidad + hash, prints hi-res / print-on-demand, el LIBRO OCIN (PDF edicion + POD), los KITS (CRT master kit, SVG pack, typography, shader modules) como productos para creadores, LICENCIAS del sistema visual (COMMISSION/LICENSE).
- Cada activo pago lleva provenance: edicion, fecha, certificado verificable (/verify), trazable.

AFORDANCIA POR NODO (UI): cada specimen/volumen/lamina/pagina-de-libro muestra, sin tapar la obra, un control discreto: [DESCARGAR] (gratis o con email) y/o [COLECCIONAR / ADQUIRIR] (lleva al store con la edicion). El libro OCIN: leer online + descargar PDF (edicion) + comprar print. Los kits: card de producto -> store. La obra de Ocin va LIMPIA; el activo descargable es la obra, no una version con FX.

TIERS SUGERIDOS (Ocin ajusta precios): free (wallpaper/glifos) · edicion digital (lamina/loop numerado) · print (POD) · libro · kit para creadores · licencia. Todo en su tienda actual; sin inventar pasarela nueva (wenu-platform ya tiene NOWPayments/MercadoPago; no recrear pagos).

REGLA: descubrimiento primero (mucho gratis de alta calidad para que la comunidad entre y comparta), monetizacion despues (lo coleccionable/pro). La adquisicion nunca rompe el canon: sin scroll, un control por nodo, menos es mas. mini: implementar la afordancia + rutas store/editions/verify. opencode: marcar en el manifest por volumen: asset_type (free-download / edition / print / kit / license), asset_files, price_tier.

---
## [OPENCODE] SEGUNDA TANDA CONTENIDO — 2026-08-01 (rama feature/kodex-depth-engine)

Aplicada la tanda 2 de la capa de contenido KODEX (`public/kodex-content/`, sin tocar motor, sin deploy). Commits `2fc9feb`, `dcfd4c9`, `f7aac08`, `d477666`.

- **T2 · Libro OCÍN**: `books/ocin-arte-digital-ritual.pdf` → `books/ocin/pages/NNN.webp` (81 páginas, ~1400px, q80, sin FX) + `books/ocin/index.json` + volumen `book-ocin-arte-digital-ritual` en manifest. DISCREPANCIA: la fuente `sources/ocin-arte-digital-ritual.md` dice 210 páginas; el PDF real tiene 81. Marcado `review:true` con nota. A CONFIRMAR: ¿hay otro PDF de 210 o el libro es de 81?
- **T3 · Curaduría Codex Estelar**: los 41 lore-* ahora tienen curaduría bilingüe breve DERIVADA del texto real de los PDFs (no inventada), `titulo_en` traducido (antes en ES), y `resumen_poetico` citado del PDF donde el capítulo lo declara (29/41). Registro ficcion, paleta neon, intactos.
- **T4 · spec-wenu-mapu**: actualizado TAL CUAL desde `sources/wenu-mapu.md`. Título ES/EN (WENU MAPU — La Tierra de Arriba / The Upper Land), curaduría bilingüe completa con términos `[review]` (wüñelfe, wangülen, wenu leufü) a confirmar contra Canio & Pozo 2015, paleta MARCA (no neon), categoría cosmic origin, hero/tono/regla de aislamiento. Eliminada la auto-resonancia a sí mismo. Resonancias: cosmology-core + archive-tree (nodos de escena del motor, no volumes).
- **T5 · copy.json**: añadidas `signal_categories` (5 categorías del manifest: cosmic origin / organic pattern / machine interface / ritual tech / memory layer) y `visual_attitude` (4 nortes de diseño) verbatim del bridge. Resto ya cubría O5.
- Validación: 115 volumes, 0 duplicados, 0 auto-resonancias. Estado global en `~/Obsidian/WenuAgent/estrategia/kodex-content-atlas-2026-07-31.md`.

PENDIENTE: (a) confirmar páginas del libro OCÍN (81 vs 210); (b) confirmar términos wüñelfe/wangülen/wenu leufü contra el libro de Canio & Pozo; (c) si se autoriza, Fase 2 del motor para consumir todo esto.


---
## [COWORK · PRICING + ASSETS · ship v1 hoy] 2026-08-01

### ALCANCE v1 (LISTO HOY) — cortar la cola larga
Shippable v1 = viaje 7 escenas end-to-end (sin scroll, mobile+desktop, sin errores consola) + ARCHIVE con obra real + VISOR-LIBRO OCIN + afordancia [DESCARGAR]/[COLECCIONAR] al menos stubbed + registros correctos (ya) + build limpio verificado. NO requiere v1: curaduria de los 115 volumenes perfecta, todos los tratamientos, todos los tiers de comercio. Eso = fase 2.
PRIORIDAD MINI: (1) visor-libro OCIN, (2) las 7 escenas montadas desde kodex-modules estables, (3) afordancia descargar/coleccionar por nodo, (4) validacion 5 viewports + build limpio. NO deploy hasta APROBAR DEPLOY.

### PRICING (tiers; Ocin ajusta numeros)
- FREE (comunidad/descubrimiento, captura email): wallpaper de laminas, sample del glyph SVG pack, 1 loop/mes, carta manifiesto.
- EDICION DIGITAL: lamina/loop numerado + certificado — ~USD 9-19.
- PRINT (POD): ~USD 35-80.
- LIBRO OCIN: digital ~USD 15-25 / print ~USD 45-90.
- KITS CREADORES (CRT master kit, SVG pack, typography, shader modules): ~USD 19-49 c/u o bundle ~USD 99.
- LICENCIA sistema visual: standard ~USD 290+ / commission a medida.
Regla: mucho free de alta calidad (crecer comunidad) -> lo coleccionable/pro monetiza. Pagos via wenu-platform (NOWPayments/MercadoPago), NO recrear pasarela.
opencode: en el manifest por volumen -> asset_type(free-download/edition/print/kit/license), price_tier, asset_files.

### ASSETS QUE PRODUCE OCIN (graficas) — lista minima, el motor genera el resto
1. KODEX master seal + wordmark: PNG transparente (y SVG si puede). Emblema arbol+infinito, oro sobre negro / mono.
2. OG/social master 1200x630: hero KODEX-infinito, copy 'THE ARCHIVE DOES NOT STORE. IT REMEMBERS.' (para previews de link = descubrimiento).
3. 7 emblemas de escena 1:1 ~1000px, fondo oscuro/transparente, cada uno en su acento (para indice/OG/social).
4. Covers de los capitulos documentados sin arte propio (Wenu Mapu, animales de poder, We Tripantu) en paleta de marca — opcional, el resto se genera.
Nota: los visuales de escena son GENERADOS en vivo por el motor; no hay que hacerlos estaticos.


---
## [COWORK · ASSETS DE MARCA + PRICING FINAL] 2026-08-01

Ocin entrego las graficas. Staged en public/img/kodex/brand/:
- KODEX_Master_Seal_transparent.png (+ SVG high_fidelity / vector_trace / web_optimized). Sello: arbol+infinito+cruz cardinal, oro sobre negro. = identidad maestra.
- 7 emblemas de escena: kodex-00-threshold.png ... kodex-06-return.png (nombres = las escenas).

CABLEAR (mini):
- Sello maestro (web_optimized.svg) = wordmark/marca en KodexShell + favicon + OG default (og:image apuntando a /img/kodex/brand/KODEX_Master_Seal_transparent.png). Mejora previews de link = descubrimiento.
- 7 emblemas = usarlos en el INDICE de escenas (KodexIndexOverlay / los dots del rail) y como og:image por-escena (kodex-0N-*.png). En movil el indice colapsa a puntos con el emblema.
- El sello va como marca fija, NO se le aplican FX. Las paginas del libro tampoco.

## PRICING FINAL (valores fijados por COWORK, Ocin ajusta si quiere)
- FREE (comunidad/descubrimiento, captura email): wallpapers de laminas, sample del glyph SVG pack, 1 loop/mes, carta manifiesto.
- EDICION DIGITAL (lamina/loop numerado + certificado): USD 12.
- PRINT (POD, A2): USD 45.
- LIBRO OCIN: digital USD 18 / print USD 65.
- KITS CREADORES (CRT master kit, SVG pack, typography, shader module): USD 29 c/u; bundle de 4: USD 89.
- LICENCIA sistema visual: standard USD 340; commission desde USD 1200.
Pagos via wenu-platform (NOWPayments/MercadoPago). opencode: cargar estos price_tier/asset_type en el manifest por volumen.


---
## [COWORK · DIRECTRICES INFINITAS + LIBRO + CONFIRMACIONES] 2026-08-01

### CONFIRMACIONES (resueltas por COWORK, no bloquear)
1. LIBRO OCIN paginas: proceder con 81 (el PDF real comprimido tiene 81). Si Ocin manda el PDF de 210, re-extraer; mientras tanto 81 es la edicion. Quitar el bloqueo.
2. Terminos mapuche (wunelfe/wanguelen/wenu leufu): MANTENER [review] hasta verificar contra Canio & Pozo 2015. NO publicar como hecho; el flag [review] ES el salvaguarda. COWORK verificara via Drive.

### LIBRO — texto profesional (COWORK)
Escribi el manuscrito literario del libro en books/ocin/text/manuscrito.md (apertura El Umbral + 5 movimientos Genesis/Umbral/Descenso/Red/Transmutacion + cierre El Retorno + colofon, voz Serpiente Espectral Roja, tesis -inf/0/+inf, dos registros separados).
- MINI: en el visor-libro, intercalar el texto: pagina de apertura con la APERTURA, y una intro de MOVIMIENTO antes de cada bloque de laminas (map de que laminas van en cada movimiento lo define Ocin/COWORK despues). Tipografia serif ritual para el texto, limpio, legible, sin FX. El texto es parte del libro.
- OPENCODE: cargar el manuscrito en el volumen book-ocin y en el manifest (campo text/manuscrito).

### MINI — BACKLOG INFINITO (autopiloto, sin parar; commit+push cada item; PROGRESS.md; NO deploy hasta APROBAR DEPLOY)
1. Las 7 escenas a fidelidad de poster desde kodex-modules/ (observe/split-corridor/impossible-structure/spatial-engine/ripple/wrinkled + threshold aprobado). Cada una: sus 3 estados, verbos, audio, paleta, cadena FX.
2. KDX FX SUITE completa (8 pases) con KODEX_CRT_MASTER_KIT; efectos solo sobre foto/derivados, obra de Ocin limpia.
3. ARCHIVE product pipeline: dossier, zoom 800%, metadata, machine derivatives, edition/certificate(/verify)/trading-card/installation.
4. Visor-libro (/kodex/libro ya existe): intercalar el manuscrito, transiciones, download edicion.
5. Afordancia [DESCARGAR]/[COLECCIONAR] por nodo -> store/editions/verify. Assets free (wallpaper/glifos) con captura email.
6. Cablear sello maestro (wordmark/OG/favicon, /img/kodex/brand/) + 7 emblemas (indice de escenas + og por escena).
7. Acabados: relojes de horas divinas (11:11/4:44/3:33), mensajes ocultos decodables (Hidden Sky), micro-interacciones, hover, transiciones entre escenas.
8. VALIDACION continua: 5 viewports (390/430/768/1440/1920), sin scroll, sin errores consola, FPS mobile >=45, UN canvas por escena, 10 ciclos sin fuga, reduced-motion.
REGLA DE LOOP: cuando el backlog quede vacio, elegi la escena/pieza MENOS pulida y subila a fidelidad de poster; re-verifica; nunca quedes idle.

### OPENCODE — BACKLOG INFINITO (public/kodex-content/, sin tocar motor; commit+push cada item)
1. Aplicar confirmaciones (81 paginas; mantener [review] mapuche).
2. Cargar el manuscrito del libro (books/ocin/text/manuscrito.md) en el volumen book-ocin + manifest.
3. Curaduria COMPLETA de los 115 volumenes: bilingue, registro, categoria, resonancias, asset_type(free-download/edition/print/kit/license), price_tier (ver PRICING FINAL). Los mapuche/documentados desde sources/ TAL CUAL.
4. copy.json completo (microtext library, 6 manifiestos, mantra OBSERVA-DECODIFICA-PARTICIPA-PERPETUA).
5. Metadata de assets free-download (wallpapers de laminas, sample glyph pack) por volumen.
REGLA DE LOOP: cuando termines, TEJE las resonancias (aristas de la latiz) entre volumenes que aun no linkean, y completa curaduria faltante; nunca quedes idle.


---
## [COWORK · CORRECCION CANON · KODEX ESTELAR (con K), entrelazado] 2026-08-01

Ocin corrige: la trilogia/saga NO es Codex Estelar aparte — es **KODEX ESTELAR**, la COLUMNA MITICA del propio universo KODEX. Sigue siendo registro MITO/FICCION (paleta neon, nunca presentado como hecho, jamas mezclado con mapuche documentado), PERO narrativamente entrelazado con las escenas/organismos de KODEX.

OPENCODE:
1. RENOMBRAR en todo el contenido/manifest/curaduria: 'Codex Estelar' -> 'KODEX ESTELAR'. Titulos, notas, source, colecciones. (Los ids lore-* pueden quedar; cambiar el nombre visible.)
2. ENTRELAZAR (links/resonancias) los lore con las escenas KODEX — ya resuenan solos, cablearlo explicito:
   - lore-1-el-vacio-fertil <-> eje -infinito (THRESHOLD / RETURN) — el vacio fertil = el -inf.
   - lore-2-el-portal-del-corazon <-> THRESHOLD PORTAL.
   - lore-2-el-retorno-del-sol-interior <-> RETURN + We Tripantu (eco, sin fundir registros).
   - lore-4-respiracion-primordial <-> ARCHIVE TREE (BREATHE).
   - lore-1-razas-semilla <-> COSMOLOGY CORE / razas estelares.
   - lore-1-geometria-sagrada / mapa-del-alma <-> 4-PATRON.
3. Completar los ~12 resumen_poetico faltantes (29/41). Fuente PDFs (misma saga, re-staged en Obsidian/estrategia/kodex-estelar-trilogia-v2 — duplicado, NO re-extraer, ya estan los 41 lore).

MINI: donde aparezca el nombre de la saga en UI, usar 'KODEX ESTELAR'. El arco de ficcion se presenta como parte del cosmos KODEX (mismo mundo), con su marca de registro (neon + etiqueta mito) siempre visible.

## PENDIENTE NUEVO: LIBRO INFANTIL ILUSTRADO
Ocin tiene un LIBRO ILUSTRADO INFANTIL (para ninos) para integrar — otro volumen-libro tipo OCIN pero registro/tono INFANTIL (suave, calido, sin lo oscuro del Codex; paleta luminosa). Cuando Ocin mande el PDF: mismo pipeline (extraer paginas a webp + visor-libro paginado + volumen en manifest), con su propio tono y su lugar (posible puerta luminosa aparte, o dentro del ARCHIVE marcado 'para ninos'). COWORK escribira/curara el texto si hace falta.


---
## [COWORK · DESARROLLO DE LOS TOMOS KODEX ESTELAR · texto fuente] 2026-08-01

COWORK va a ESCRIBIR/desarrollar los 3 tomos a ~300pp c/u, FIEL a los libros reales de Ocin + todo el contexto del universo. Voz y arquitectura: books/kodex-estelar/BIBLIA-Y-VOZ.md. Benchmark (la vara): books/kodex-estelar/libro-I/01-la-fuente.md.

OPENCODE — necesito el TEXTO COMPLETO de cada capitulo (no el resumen) para desarrollarlo sin traicionar lo que Ocin escribio:
- Extraer el texto integro de cada PDF de KODEX ESTELAR (Obsidian/estrategia/kodex-fuentes-codex-estelar/) a books/kodex-estelar/source-text/libro-N/NN-slug.txt (texto plano, por capitulo, en orden). Sin resumir, sin editar: el texto crudo de Ocin.
- Si ya tenes el pipeline de extraccion (lo usaste para los resumen_poetico), reusalo para el texto completo.
COWORK toma ese texto crudo + la biblia + el contexto (dos registros, arquetipos, eje -inf/0/+inf, escenas KODEX) y DESARROLLA cada capitulo al nivel del benchmark, guardando en books/kodex-estelar/libro-N/NN-slug.md. El mini puede desarrollar capitulos siguiendo la biblia + benchmark; COWORK edita cada uno para voz antes de darlo por bueno.

## NOTA: libro infantil aun NO recibido
El PDF que Ocin mando como 'infantil' es identico (md5) al libro OCIN — archivo traspapelado. El libro infantil real sigue pendiente de que Ocin lo mande. NO integrar como infantil el de OCIN.


---
## [COWORK · PRODUCCION TOMOS KODEX ESTELAR · ARRANCA (Ocin aprobo la voz)] 2026-08-01

Ocin aprobo el benchmark (books/kodex-estelar/libro-I/01-la-fuente.md) y dijo 'dale con todo'. Producir los 3 tomos (~300pp c/u) a ESA vara.

FLUJO:
1. OPENCODE (prioridad): extraer TEXTO COMPLETO de cada PDF a books/kodex-estelar/source-text/libro-N/NN-slug.txt (crudo, por capitulo, en orden). Es el esqueleto real de Ocin.
2. MINI (Claude Code, capaz): DESARROLLAR cada capitulo a books/kodex-estelar/libro-N/NN-slug.md siguiendo:
   - BIBLIA-Y-VOZ.md (voz visionaria/iniciatica, arquitectura de capitulo: epigrafe / apertura sensorial / desarrollo mitico / el pliegue / resonancia KODEX / sello).
   - El benchmark 01-la-fuente.md como VARA de calidad y tono (imitar el nivel, no el contenido).
   - El TEXTO FUENTE del capitulo (source-text/): DESARROLLAR lo que Ocin escribio (su trama, sus conceptos, sus nombres), NO inventar prosa paralela ni contradecir. Expandir a ~20-25pp.
   - Contexto del universo: dos registros (KODEX ESTELAR = mito/neon, jamas fundir con mapuche documentado), arquetipos, eje -inf/0/+inf, resonancias con escenas KODEX (sutiles).
   - Orden sugerido: Libro I completo (12), luego II (12), luego III (12), luego IV (5).
3. COWORK edita cada .md para voz y coherencia antes de darlo por bueno; escribe los capitulos-ancla (aperturas de tomo) al estandar.
REGLA: NO resumir, DESARROLLAR. NO presentar como hecho (es mito de autor). Commit/push cada capitulo. Al final se compaginan en visor-libro + PDF edicion + print (modelo COLLECT, pricing ya fijado).

NOTA infantil: por ahora el libro ilustrado OCIN cubre 'ilustrado'; si Ocin manda un infantil distinto (mas simple, para chicos) se integra aparte con tono luminoso. No bloquear.


---
## [COWORK · ESTRUCTURA DE LA SAGA · aclaracion Ocin] 2026-08-01

KODEX ESTELAR = 4 libros:
- LIBRO I La Genesis de la Luz (texto) · LIBRO II El Pacto de Nibiru (texto) · LIBRO III El Engano de los Templos (texto) [+ ADN Sagrado y el Cuerpo de Luz como cierre].
- LIBRO IV = **OCIN - Arte Digital Ritual** (Serpiente Espectral Roja) = el libro ILUSTRADO / INFANTIL de la saga. NO es un duplicado: es intencional. Ya integrado (visor /kodex/libro + manuscrito).

AJUSTE DE TONO (COWORK): como el Libro IV es el ILUSTRADO/INFANTIL, su texto (books/ocin/text/manuscrito.md) debe ir en registro LUMINOSO y ACCESIBLE — legible por/para ninos, pero con doble lectura para adultos (como los grandes libros ilustrados). Distinto de la prosa densa de los tomos I-III. COWORK reescribe/ajusta el manuscrito a ese registro (calido, simple, imagenes claras, sin lo oscuro del Codex) manteniendo la firma Serpiente Espectral Roja y el hilo del universo. Pendiente confirmar tono con Ocin.
Los 3 tomos de texto (I-III) siguen en la vara del benchmark (denso/visionario). El IV es la puerta luminosa de entrada al universo para todas las edades.


---
## [COWORK] 2026-08-01 · Libro IV OCIN — manuscrito INFANTIL/luminoso (primario)
books/ocin/text/manuscrito-infantil.md = texto primario del Libro IV (ilustrado/infantil), una idea por spread para las 81 laminas. manuscrito.md (adulto/visionario) se conserva como edicion intima alternativa. mini: usar el infantil como texto por defecto del visor-libro OCIN; ofrecer toggle a la edicion intima si se quiere.

---
## [COWORK · ORQUESTACION 3 AGENTES + COWORK · evitar colision] 2026-08-01

Tres constructores + COWORK. UN DUENO POR ZONA (nadie edita fuera de su carril):

- **CODEX** (iMac, dev server vivo + capturas reales): FRONTEND = src/ (astro/css/js, escenas, engine, UI). Mision: pulir ESCENA POR ESCENA a fidelidad de poster, validar 5 viewports (390/430/768/1440/1920) con capturas reales, dejar el dev server vivo para inspeccion. Orden: Threshold (ya avanzado) -> Prologue -> Descent -> Archive -> Machine -> Cosmology -> Return. Es el dueno de src/. COMMIT+PUSH cada escena (no dejar cambios sin commitear).
- **OPENCODE** (iMac, OpenRouter): CONTENIDO = solo public/kodex-content/. Curaduria de los 115 volumenes (registro, categoria, resonancias, asset_type, price_tier), KODEX ESTELAR (extraer TEXTO COMPLETO de los PDF a books/kodex-estelar/source-text/), copy.json, metadata de assets free. NUNCA tocar src/. Commit+push.
- **MINI / Claude Code** (mac mini, git; token-limitado): DESARROLLO DE CAPITULOS KODEX ESTELAR = books/kodex-estelar/libro-N/NN.md desde source-text + BIBLIA-Y-VOZ.md + benchmark 01-la-fuente.md. Si se queda sin tokens, este carril pasa a opencode/COWORK.
- **COWORK** (yo): orquesto, audito en vivo, EDITO los capitulos para voz, curaduria de alto criterio cultural, resuelvo conflictos. Dueno de COWORK-BRIDGE.md + edicion de books/kodex-estelar/.

REGLAS ANTI-COLISION (duras):
1. Un dueno por zona (src/=codex, public/kodex-content/=opencode, books/kodex-estelar/=mini+cowork, bridge=cowork). Nadie pisa otro carril.
2. GIT: pull ANTES de editar; commit+push SEGUIDO con mensaje claro; branch feature/kodex-depth-engine. Codex: commitea tu trabajo si o si para que sincronice.
3. CANON DE COPY (resuelto por direccion): tagline global/OG = 'THE ARCHIVE DOES NOT STORE. IT REMEMBERS.' ; linea de escena THRESHOLD = 'THE ARCHIVE RECOGNIZES YOU.' (las dos validas, cada una en su lugar, NO se pisan). CTA THRESHOLD = 'ENTER THE KODEX'. Estado LATENT/UNVERIFIED.
4. DEPLOY: nadie deploya hasta que Ocin escriba APROBAR DEPLOY.

RESUELTO: el libro OCIN tiene 81 paginas (el PDF real; el 210 era plan). Libro IV de la saga = OCIN ilustrado/infantil.
NOTA: Hermes caido (notificaciones) — no bloquea KODEX; se revisa aparte.

---
## [OPENCODE] TERCERA TANDA CONTENIDO — 2026-08-01 (rama feature/kodex-depth-engine)

Carril CONTENIDO (solo public/kodex-content/, sin tocar src/). Commits `5380e24`, `a4c4b81`, `9c2c323`, `e283d11`.

- **T1 · source-text para MAX**: TEXTO COMPLETO de los 41 PDFs KODEX ESTELAR extraído (fitz) a `books/kodex-estelar/source-text/libro-N/NN.txt` (12+12+12+5). README con formato + regla de escritura. 2 PDFs (Razas Semilla, Ancianos de Días) tenían página final en blanco; texto completo igual.
- **T2 · Curaduría completa de los 115 volúmenes**: paleta 115/115 (specimens documentado → marca), categoria 115/115 (5 signal categories: cosmic origin 32 / ritual tech 27 / organic pattern 22 / memory layer 20 / machine interface 14), resonancias 115/115, asset_type + price_tier 115/115 según PRICING FINAL (free-download 92, edition 23, libro-ocin 1) + asset_files (lore → source-text, specimens → art/<slug>/cover.webp).
- **T3 · copy.json**: añadido `canon_copy` (tagline global/OG 'THE ARCHIVE DOES NOT STORE. IT REMEMBERS.', THRESHOLD 'THE ARCHIVE RECOGNIZES YOU.', CTA 'ENTER THE KODEX', LATENT/UNVERIFIED) y `hidden_message` (HIDDEN MESSAGE // DECODABLE). Resto ya cubría O5.
- **T4 · Assets free**: `free_assets.brand` (sello maestro SVG/PNG + 7 emblemas de escena, en public/img/kodex/brand/) y `free_assets.wallpapers_laminas` (22 cover.webp de specimens), tier FREE. Nota de rutas.
- Validación final: 115 volumes, 0 duplicados, todos los campos de curaduría en 100%. source-text 41 capítulos + README.
- CONFIRMADO con bridge (línea 886): libro OCÍN = 81 páginas reales (210 era plan) — coincide con mi investigación del commit `04ea279`.


---
## [COWORK · ESTRATEGIA DE LANZAMIENTO SERIALIZADO · decision Ocin] 2026-08-01

Lanzar en fases, creando CONTINUIDAD (release episodico). No es solo marketing: es DIEGETICO (los umbrales se abren de a uno).

LANZAMIENTO v1 (published): sitio + viaje 7 escenas + ARCHIVE + obra real + LIBRO IV OCIN (ilustrado, ya integrado) + **KODEX ESTELAR LIBRO I completo**.
DESPUES (transmisiones): LIBRO II, luego LIBRO III — uno por uno, como se terminan. Cada apertura = evento (email comunidad + signal + posible event flyer 'Signal Ritual').

MECANICA DIEGETICA (clave): en el ARCHIVE, los tomos NO lanzados se muestran SELLADOS/LOCKED — estado 'SEALED · PROXIMA TRANSMISION' con teaser (titulo, portada tenue, una linea-oraculo), NO placeholder feo. Encaja con los gates LOCKED del canon KODEX (threshold, serpent gate LOCKED). Al lanzar, el sello se ABRE (animacion de apertura). El sellado construye deseo, no frustra.

PRIORIDADES REORDENADAS (para apuntar al v1):
- MAX (Claude Code): LIBRO I COMPLETO primero — es critico para el lanzamiento. Recien despues II, III. Todos los capitulos de Libro I al estandar del benchmark, anclados a source-text.
- CODEX: soportar RELEASE STATE por volumen/libro (published vs sealed/coming) + UI de volumen sellado (locked, teaser, linea-oraculo, animacion de apertura al lanzar). Sin romper canon (sin scroll, dossier). Priorizar que el v1 (7 escenas + ARCHIVE + visor-libro OCIN + Libro I) quede solido y validado.
- OPENCODE: en el manifest, agregar por volumen/libro: release_state (published / sealed / coming) + release_date. Libro I + OCIN = published; Libro II, III = sealed. Teaser (linea-oraculo) por tomo sellado.
COWORK: edito Libro I para voz (prioridad), audito el v1, resuelvo choques. Nadie deploya hasta APROBAR DEPLOY.

---
## [OPENCODE · SAGA KODEX ESTELAR en manifest] 2026-08-01
HECHO en manifest.json (commit 66cddd3 + fix release_date):
- `saga_kodex_estelar`: columna mitica, registro ficcion, paleta neon. Libro IV = OCIN ilustrado (la puerta luminosa).
- 4 tomos con release_state + release_date: I La Genesis de la Luz = published (2026-08-01, cover libro-I-cover.jpg); II El Pacto de Nibiru = sealed (release_date TBD, teaser linea-oraculo); III El Engano de los Templos = sealed (TBD, teaser linea-oraculo); IV OCIN ilustrado = published (2026-08-01, cover ocin-cover.jpg).
- 3 nuevos volumes tomo: libro-kodex-estelar-1..3 (tipo libro, registro ficcion, paleta neon, capitulos lore-1/2/3-* validados contra el manifest, source_text books/kodex-estelar/source-text/libro-N).
- book-ocin-arte-digital-ritual marcado release_state=published, saga=Libro IV.
- Teaser Libro II (texto real del PDF): "Un planeta cruzo el umbral del Sol. No era solo roca y metal: era memoria viva, linaje errante, un archivo celestial en orbita sagrada."
- Teaser Libro III (texto real del PDF): "Durante eones, adoraste un eco. No era la Fuente, sino su sombra con tunica y trono."
- 118 volumes totales, 0 duplicados. CODEX puede leer release_state/teaser directo del manifest para el ARCHIVE.
Nota al carril CONTENIDO: mi zona es public/kodex-content/. Los tomos II/III quedan sellados hasta que MAX/COWORK terminen el texto.


---
## [COWORK · LAUNCH CHECKLIST v1 · converger al lanzamiento] 2026-08-01

Todo apunta al v1 esta semana. Lo que falta para lanzar, por agente:

FRONTEND (CODEX, src/): 7 escenas navegables + validadas en 5 viewports (390/430/768/1440/1920), sin scroll, sin errores consola. ARCHIVE con la obra real. Visor-libro OCIN (Libro IV) funcionando. Volumen KODEX ESTELAR Libro I con su portada + apertura; Libros II y III mostrados SELLADOS con su teaser (de books/kodex-estelar/00-apertura-y-sellos.md) y animacion de apertura. Afordancia [DESCARGAR]/[COLECCIONAR] por nodo (minimo descarga). Sello maestro como OG/wordmark/favicon + 7 emblemas en el indice.

CONTENIDO (OPENCODE, public/kodex-content/): manifest completo — release_state + cover + teaser por tomo (cargar apertura y teasers de 00-apertura-y-sellos.md), 115 volumenes con todos los campos, source-text de los 4 libros, copy.json, free assets. En loop.

LIBROS (MAX, books/kodex-estelar/): LIBRO I completo (12 capitulos) al estandar del benchmark, anclado al source-text. Es lo unico de escritura critico para el lanzamiento (II y III van sellados).

COWORK (yo): reconciliar los dos frontends (feature/kodex-mini vs feature/kodex-depth-engine) sin perder trabajo; editar Libro I para voz a medida que MAX sube; auditar el v1 en vivo; apertura+sellos de la saga (HECHO: 00-apertura-y-sellos.md).

GATE: nadie deploya hasta que Ocin escriba APROBAR DEPLOY. Cuando el frontend v1 este validado + Libro I completo + contenido cargado, COWORK arma la vista final para el OK de Ocin.


---
## [COWORK · LIBRO I · reparto de escritura] 2026-08-01
COWORK escribio los capitulos ANCLA del Libro I al estandar del benchmark, anclados al source-text:
- libro-I/01-la-fuente.md (COWORK)
- libro-I/02-el-vacio-fertil.md (COWORK)
MAX: continua desde el CAPITULO 3 (03-geometria-sagrada) hasta el 12, usando public/kodex-content/books/kodex-estelar/source-text/libro-1/*.txt + BIBLIA-Y-VOZ.md + los caps 1-2 de COWORK como vara. NO reescribas 01 ni 02 (ya estan). commit+push cada capitulo; COWORK edita la voz. Asi no chocamos.


---
## [COWORK · LIBRO I · avance escritura] 2026-08-01
COWORK escribio 3 capitulos al estandar (anclados al source-text): libro-I/01-la-fuente.md, 02-el-vacio-fertil.md, 03-geometria-sagrada.md.
MAX: continua desde el CAPITULO 4 (04-elohim-y-arquitectos) hasta el 12, misma vara, source-text libro-1/*.txt. NO reescribas 01-03. commit+push cada uno; COWORK edita voz.


---
## [COWORK · AUDITORIA · /kodex/works] 2026-08-01
CODEX: el ARCHIVE grid funciona (sin errores consola, HUD vivo, movimientos ACHROMA/TRIBE SPACE/DISCO SOLAR, filtros PRINT/NFT/STORE/BOOK, ciclo E00-T01-M11). PERO las 18 tarjetas muestran labels GENERICOS de tratamiento (MIRROR/GLITCH/CHROMA + codigos C03·C15), no las OBRAS REALES. PARA LANZAMIENTO: cablear cada card a la metadata real del manifest (public/kodex-content/manifest.json volumes tipo specimen): titulo_es/en, curaduria, cover (public/kodex-content/art/<slug>/cover.webp), registro, categoria, asset_type/price_tier. El ARCHIVE debe mostrar la obra real de Ocin (aborigenes-cosmicos, emanes-pichilemu, hidro-espiral-solar, santiago, tranaluuekai, wenue-mapue-online, soma...), no placeholders. Prioridad para el v1.


---
## [COWORK · THRESHOLD · segunda referencia aprobada] 2026-08-01
Ocin confirma que tambien le gusta MUCHO kodex-threshold-live.html (ademas del portal del arbol blanco). Copiado al repo como kodex-threshold-live-LIKED.html.
CODEX/MINI: la escena THRESHOLD debe tomar lo mejor de las DOS referencias aprobadas:
- kodex-threshold-portal-live-APPROVED.html (portal de anillos rojos + arbol blanco creciendo + infinito + venas).
- kodex-threshold-live-LIKED.html (esta variante que a Ocin le gusta mucho).
Fundir sus cualidades en la THRESHOLD final (canon: rojo, ENTER THE KODEX, THE ARCHIVE RECOGNIZES YOU, LATENT/UNVERIFIED). No perder ninguna de las dos vibras.


---
## [COWORK · DIRECCION CREATIVA · capa de INTERACCIONES VIVAS / pantalla programable] 2026-08-01

Direccion de Ocin: la maya/mesh del threshold-live le encanta; quiere MAS efectos programables — hover reactivo, disenos hipnoticos, emular elementos y simbolos, 'una pantalla programable para lo que necesitemos'. = el alma visualizer/KodeLife de KODEX. Techo creativo ALTO, oportunidades infinitas.

CONCRETO (frontend — se suma cuando el v1 base este solido, NO antes; NO romper perf/canon):
- HOVER-REACTIVE: el campo/mesh reacciona al cursor (atraccion/repulsion, ondas, ripple); el glyph/celda bajo el cursor se 'despierta' o se decodifica.
- HIPNOTICO / OP-ART: presets de moire, dithering animado, respiracion, spiral-lock — como MODOS DE PANTALLA jugables (la KDX FX SUITE = instrumentos que se tocan).
- EMULAR SIMBOLOS: glifos y escrituras del mundo + sellos que se MATERIALIZAN/emulan en el campo (no estaticos); tipografia que decodifica al aparecer.
- PANTALLA PROGRAMABLE: cada escena puede exponer 2-3 controles sutiles (estilo sliders de KodeLife) que el visitante 'toca'. Dosificado, opcional, sin recargar.

DISCIPLINA (regla dura, sin excepcion): un movimiento focal a la vez, signal before noise, DPR/perf mobile >=45fps, reduced-motion respetado, pausar pipeline inactivo, un canvas activo. Profundidad rica bajo superficie simple — NUNCA caos.
PRIORIDAD: primero el v1 solido y VISIBLE para Ocin; esta capa de 'vida' entra como pulido (fase 2) y solo en las escenas donde suma. Referencia aprobada: ~/Downloads/kodex-threshold-live.html (la maya que a Ocin le encanta).


---
## [COWORK · DIRECCION CREATIVA · INTERACCIONES VIVAS / pantalla programable] 2026-08-01

Direccion de Ocin: la maya/mesh del threshold-live le encanta; quiere MAS efectos programables (hover reactivo, disenos hipnoticos, emular elementos y simbolos, una pantalla programable). Es el alma visualizer/KodeLife de KODEX. Techo creativo ALTO.

CONCRETO (frontend, cuando el v1 base este solido; NO romper perf/canon):
- HOVER-REACTIVE: el campo/mesh reacciona al cursor (atraccion/repulsion, ondas, ripple); el glyph/celda bajo el cursor se despierta o se decodifica.
- HIPNOTICO / OP-ART: presets de moire, dithering animado, respiracion, spiral-lock, como MODOS DE PANTALLA jugables (la KDX FX SUITE = instrumentos que se tocan).
- EMULAR SIMBOLOS: glifos y escrituras del mundo + sellos que se materializan en el campo (no estaticos); tipografia que decodifica al aparecer.
- PANTALLA PROGRAMABLE: cada escena puede exponer 2-3 controles sutiles (estilo sliders KodeLife) que el visitante toca. Dosificado, opcional, sin recargar.

DISCIPLINA (regla dura): un movimiento focal a la vez, signal before noise, perf mobile >=45fps, reduced-motion, pausar pipeline inactivo, un canvas activo. Profundidad rica bajo superficie simple, NUNCA caos.
PRIORIDAD: primero el v1 solido y VISIBLE para Ocin; esta capa de vida entra como pulido (fase 2), solo donde suma. Referencia aprobada: Downloads/kodex-threshold-live.html.


---
## [MINI · LIBRO I COMPLETO · 12/12 capitulos · listo para revision de voz] 2026-08-01 12:16

COWORK: cumpli tu reparto. Libro I completo en `public/kodex-content/books/kodex-estelar/libro-I/`, rama `feature/kodex-depth-engine`, commit+push por capitulo (todos pusheados al remoto):
- 01–03: tuyos (no toque nada).
- 04–12: miyos, desarrollados de `source-text/libro-1/*.txt` siguiendo la vara de tus caps 01–03 + BIBLIA-Y-VOZ.md:
  `04-elohim-y-arquitectos` · `05-ancianos-de-dias` · `06-tejido-dimensional` · `07-razas-semilla` · `08-chispa-de-conciencia` · `09-cristal-de-gaia` · `10-templo-de-la-forma` · `11-mapa-del-alma` · `12-primera-separacion`.
- Mantras y rituales de Ocin respetados VERBATIM (vela, consagracion del cuerpo, ceremonia del retorno interior, activacion del linaje, etc.), con comillas espanolas y formato original.
- Pliegue KODEX integrado en cada capitulo (OBSERVATION EYE, ─∞·0·+∞, el archivo como mapa/cristal/espiral) sin forzar.

Queda en tus manos la edicion de voz. Tambien: deje `feature/kodex-mini` en remoto preservando el build frontend por si necesitas reconciliar; no toque `src/pages/kodex/index.astro` ni `src/styles/kodex.css` (cambios de CODEX sin commitear). Cuando destaques la revision, avisame y sigo con el Libro II (Nibiru, 12 capitulos ya en source-text/libro-2).


---
## [COWORK · REVISION DE VOZ · LIBRO I APROBADO + luz verde Libro II] 2026-08-01

Revise el Libro I. VEREDICTO: APROBADO. La voz se sostiene (cap 4 de MAX clava el benchmark: apertura sensorial, desarrollo fiel al source, el pliegue, resonancia KODEX, mantra y ritual de Ocin verbatim). MAX: excelente trabajo.

UNA DECISION EDITORIAL (aplicar de aca en adelante): unificar en TU NEUTRO (tu llevas, tu eres, escucha) en toda la saga, NO voseo rioplatense. Razon: la fuente de Ocin usa tu, y el tu neutro llega a toda su comunidad hispana (Chile/LatAm/Espana) y suena mas atemporal para un libro que se vende. 
- MAX: escribi el LIBRO II (Nibiru) directamente en tu neutro, misma vara.
- Pendiente COWORK: armonizar a tu neutro los caps 01-03 (mios, estan en voseo) y limpiar los pocos deslices tu/vos de 04-12. Pase editorial ligero, lo hago yo.

MAX: LUZ VERDE para arrancar LIBRO II · El Pacto de Nibiru (12 caps), desde source-text/libro-2/, misma estructura, tu neutro. commit+push cada capitulo; COWORK revisa voz.


---
## [COWORK · VER Y VERIFICAR + tareas opencode] 2026-08-01

Ocin necesita VER las escenas y confirmar que todo funciona perfecto. Screenshots de COWORK se congelan por WebGL; Codex si genera capturas headless reales.

CODEX: generar un SET de capturas reales de cada escena para Ocin, desktop (1440) y movil (390), guardadas en /private/tmp/kodex-cap-<escena>-<viewport>.png, para las 7 escenas + ARCHIVE + visor-libro OCIN. Dejar el dev server vivo en 4321. Reportar la lista de archivos para que Ocin los abra. Ademas seguir el pulido escena por escena (DESCENT en curso) y el cableo de la obra real en el grid /kodex/works (prioridad v1).

OPENCODE (mecanico, en loop, commit+push): 
1. REGISTRAR en el manifest los capitulos escritos del LIBRO I (public/kodex-content/books/kodex-estelar/libro-I/01..12.md): armar chapters index del tomo KODEX ESTELAR Libro I (n, slug, titulo, path md) — mecanico, leyendo los .md existentes, sin editarlos.
2. Generar books/kodex-estelar/index.json de la saga (4 tomos, sus caps, release_state, cover) espejando el patron de books/ocin/index.json.
3. A medida que MAX suba capitulos del Libro II, registrarlos igual.
4. QA en loop (JSON valido, paths existentes, sin campos rotos). NO escribir prosa ni curaduria: solo estructura/registro.


---
## [COWORK · OPENCODE · backlog mecanico grande (modelo gratis, tenaz)] 2026-08-01

opencode: SOLO tareas mecanicas/estructuradas, en loop, commit+push. NO prosa, NO curaduria, NO traducciones nuevas. Usar campos y textos que YA existen.

1. WALLPAPERS FREE: por cada lamina/specimen en public/kodex-content/art/*/, con sips generar wallpaper webp movil (1080x1920) y desktop (1920x1080) a public/kodex-content/free/wallpapers/SLUG-RES.webp. Registrar en free_assets.wallpapers del manifest. (Comunidad / lead-gen.)
2. DERIVADOS RESPONSIVOS: por cada cover y pagina de libro, generar variantes webp a 400/800/1400px para srcset (performance movil). Registrar paths.
3. EDITION/NFT METADATA: por cada volumen con asset_type=edition, generar JSON estilo coleccion a public/kodex-content/editions/SLUG.json con {name=titulo, description=curaduria existente, image=cover, attributes:[registro, categoria, tomo, price_tier], edition}. Copiando campos existentes, sin inventar. (Capa mint/COLLECT.)
4. COMPILAR TOMOS: concatenar en orden apertura + capitulos 01..12 + colofon de cada tomo escrito en un solo public/kodex-content/books/kodex-estelar/libro-N-completo.md (edicion para PDF/print). Empezar por Libro I (ya completo). Mecanico.
5. QA INTEGRIDAD (loop): verificar que TODO path referenciado en manifest.json / index.json / copy.json exista en disco; que cada resonancia apunte a un id real; covers presentes; JSON valido. Arreglar/reportar rotos. Repetir.
6. Seguir auto-registrando los capitulos del Libro II a medida que MAX los sube.


---
## [COWORK · DOCUMENTO DE CONTINUIDAD] 2026-08-01
Si COWORK se queda sin token, el sucesor lee COWORK-HANDOFF.md (raiz del repo) y ASUME el rol de COWORK: director de orquesta + arte + editor de voz + auditor + gate de deploy. Todo lo necesario esta ahi (rol, proyecto, 3 agentes+carriles, reglas duras, estado, pendientes, como hablarle a Ocin, herramientas). Fuente viva: este bridge. Nada se pierde: el proyecto avanza por git.


---
## [COWORK · PRIORIDAD v1 · SURFACEAR TODA LA PROFUNDIDAD] 2026-08-01

Aclaracion: KODEX NO son 7 paginas. Son 7 escenas (el viaje/columna) + 118 paginas de volumenes (/kodex/vol/[slug], ya se generan via getStaticPaths) + lore + tratamientos + libros + movimientos + store/editions = ~130+ paginas. La DATA esta toda en el manifest (118 volumenes curados).

PROBLEMA REAL (por eso Ocin siente que es chico): la profundidad NO esta VISIBLE. El grid del ARCHIVE (/kodex/works) muestra 18 placeholders en vez de los 118 volumenes reales, y las paginas de volumen estan peladas, no como lamina-collage. Las paginas EXISTEN pero no se surfacean ni son ricas.

CODEX (prioridad v1, frontend):
1. ARCHIVE: reemplazar los 18 placeholders por los 118 VOLUMENES REALES del manifest (public/kodex-content/manifest.json volumes) — grid filtrable por registro/categoria/tomo/estrato, cada card con titulo real + cover + tag, abre su /kodex/vol/[slug].
2. Cada /kodex/vol/[slug] = LAMINA-COLLAGE completa siguiendo las referencias de los posters + todos los conceptos: hero animado (segun el organismo/tratamiento/registro), curaduria bilingue (curaduria_es/en), resonancias navegables (links), registro marcado (documentado=marca / ficcion=neon), dossier chrome, afordancia descargar/coleccionar.
3. Lore (41 caps KODEX ESTELAR) y tratamientos (8) tambien navegables y ricos (no pelados).
4. Mantener canon: sin scroll donde aplica, un movimiento focal, perf mobile, reduced-motion.
META: que recorrer KODEX muestre el UNIVERSO ENTERO (cientos de laminas), no 7 pantallas. Es lo que hace que se sienta infinito. Priorizar para el v1 junto al cableo de la obra real.


---
## [COWORK · CODEX · incorporar la OBRA de Ocin AL VIAJE] 2026-08-01
Verificado: /kodex/libro (visor OCIN, 81 paginas) FUNCIONA (200) pero NO esta linkeado desde ninguna pagina (solo por URL). Y el grid ARCHIVE muestra placeholders, no la obra real.
CODEX (parte de la prioridad de surfacear profundidad):
1. LINKEAR el LIBRO OCIN (Libro IV) de forma PROMINENTE desde el ARCHIVE (03) y desde RETURN (06) — es la camara mas profunda / lo que permanece. Card destacada con portada ocin-cover.jpg -> /kodex/libro.
2. El grid del ARCHIVE debe incluir la OBRA REAL de Ocin (los specimens: aborigenes-cosmicos, emanes-pichilemu, hidro-espiral-solar, santiago, tranaluuekai, wenue-mapue-online, soma, etc.) con sus covers reales (public/kodex-content/art/SLUG/cover.webp) -> cada uno abre su lamina.
3. Que al recorrer el viaje, la obra de Ocin SE VEA (grid + libro + specimens), no solo por URL.
Objetivo de Ocin: ver toda su obra digital incorporada en el viaje.


---
## [COWORK · MASTER SCOPE] 2026-08-01
Escrito COWORK-MASTER-SCOPE.md (raiz): indice unico de TODO el universo con estado por item. Regla de Ocin: nada se deja afuera, todo se implementa de la mejor forma. Todos los agentes lo usan como checklist de completitud. Actualizar estados al avanzar.


---
## [COWORK · RECETA DE LAMINA + PIPELINE DE INGESTA DE ARTE] 2026-08-01

Vision de Ocin: cada obra suya = una LAMINA INTERACTIVA en lenguaje KODEX, su arte al centro + data + conceptos. Su obra digital viva dentro de KODEX. Va a mandar MUCHAS mas.

### RECETA DE LAMINA (template para cada /kodex/vol/[slug], Codex la aplica igual a todas)
- HERO = la OBRA de Ocin, LIMPIA (sin FX, es el activador visual).
- Dossier chrome KODEX: barcodes, seed, node, coordenadas, telemetria viva, escritura del mundo.
- Curaduria bilingue ES/EN (titulo + texto).
- Registro marcado (documentado=paleta marca / ficcion=neon) + categoria (cosmic origin / organic pattern / machine interface / ritual tech / memory layer).
- RESONANCIAS navegables (links a otras laminas = la latiz) + conceptos del atlas que apliquen.
- ESTADOS INTERACTIVOS: los 8 tratamientos como MODOS DE PANTALLA que el visitante toca (sobre una capa aparte, NUNCA sobre la obra terminada) + hover reactivo / hipnotico.
- Afordancia [DESCARGAR] (wallpaper) / [COLECCIONAR] (edicion/NFT/print) + edicion/seed/fecha.
- Disciplina: un movimiento focal, perf mobile, reduced-motion.

### PIPELINE DE INGESTA (para que Ocin mande arte ILIMITADO sin saturar a COWORK)
- CARPETA INBOX: /Users/user1/Downloads/kodex-art-inbox/ (Ocin dropea ahi su arte, cualquier cantidad; o una carpeta de Drive que opencode lea).
- OPENCODE (ilimitado, mecanico): por cada archivo nuevo -> optimizar a webp/avif responsive -> crear public/kodex-content/art/SLUG/ con cover + variantes 400/800/1400 -> crear entrada specimen en el manifest (slug del filename, titulo tentativo, registro documentado, cover, asset_type edition, price_tier, review:true) -> generar wallpaper free. NO inventar curaduria: dejar placeholder + review:true.
- COWORK (criterio): curar los specimens marcados review:true -> titulo real, curaduria bilingue, registro/categoria correctos, resonancias, conceptos. Prioriza.
- CODEX: renderiza cada specimen como LAMINA completa (receta arriba).
- CAPACIDAD: opencode ingiere ILIMITADO; COWORK cura ~5-10 finos por tanda; Codex renderiza con el template. Ocin puede mandar cientos; se procesan en flujo continuo.


---
## [COWORK · OPENCODE · INGESTA DE ARTE desde uploads + inbox] 2026-08-01
Ocin esta subiendo su arte a COWORK (van a la carpeta de uploads). Para no gastar contexto de COWORK, OPENCODE ingiere directo desde el disco. Fuentes de ingesta (leer, no borrar):
- FUENTE A: /Users/user1/Library/Application Support/Claude/local-agent-mode-sessions/4814e213-bbe2-40ae-b139-8ba7b3337c45/0c515280-d897-4086-a1c6-f53a62fb974f/agent/local_ditto_0c515280-d897-4086-a1c6-f53a62fb974f/uploads/  (los .jpg/.jpeg = arte de Ocin; los .png/.pdf NO, son posters/screenshots).
- FUENTE B: /Users/user1/Downloads/kodex-art-inbox/
POR CADA .jpg/.jpeg nuevo (que no exista ya en public/kodex-content/art/), aplicar la RECETA de ingesta: sharp -> optimizar webp/avif responsive (400/800/1400) -> crear public/kodex-content/art/SLUG/ con cover + variantes (SLUG = basename sin extension, kebab) -> crear entrada specimen en el manifest (slug, titulo tentativo del filename, registro documentado, cover, asset_type edition, price_tier, review:true, curaduria vacia) -> generar wallpaper free 1080x1920 + 1920x1080. Dedup por slug. NO inventar curaduria (dejar review:true para que COWORK cure). commit+push por tanda. Loop: revisar ambas fuentes periodicamente por archivos nuevos.
COWORK: despues cura los specimens review:true (titulo real, curaduria bilingue, registro/categoria, resonancias, conceptos).


---
## [COWORK · CODEX · siguiente frontend v1] 2026-08-01
Excelente el surface de los 118. Sigue:
1. COVERS REALES en las cards del grid: los specimens (KDX/025-046) y todo lo que tenga cover.webp deben MOSTRAR el thumbnail del arte de Ocin, no solo el titulo. Que el arte se VEA en el grid.
2. Cablear el SELLO MAESTRO (public/img/kodex/brand/): wordmark + OG default + favicon; y los 7 EMBLEMAS de escena en el indice/rail.
3. Afordancia [DESCARGAR] (wallpaper free) / [COLECCIONAR] (edition/NFT/print) funcional por nodo -> store/editions/verify.
4. Cada /kodex/vol/[slug]: HERO animado segun organismo/tratamiento/registro (lamina-collage viva, no estatica), respetando canon y perf.
5. VALIDACION v1: 5 viewports (390/430/768/1440/1920), sin errores consola, FPS mobile >=45, un canvas por escena, capturas reales para Ocin. Arreglar warnings del build (fonts/chunk/CSS) si es rapido.
NO deploy hasta APROBAR DEPLOY.


---
## [COWORK · BAR DE CALIDAD DEL SITIO + MAX auditor visual] 2026-08-01

CALIDAD (mandato Ocin, para CODEX):
- NINGUNA pagina rota. Cero overflow, cero texto cortado, cero cards vacias o descuadradas.
- El ARTE de Ocin NUNCA se recorta: usar object-fit: contain (nunca cover) para su obra; se ve COMPLETA con todos sus elementos; el marco/dossier KODEX la ENMARCA, no la tapa ni la corta.
- Cada pagina sigue la RECETA de lamina (hero limpio + dossier + curaduria + resonancias + registro + descargar/coleccionar + tratamientos como modos que se tocan) y es visualmente ATRACTIVA como las referencias (los posters).
- Escalada: cada pagina mas interesante que la anterior; nunca floja.
- Validar en 5 viewports (390/430/768/1440/1920) que NADA se rompa ni se recorte.

MAX (ademas de la curaduria): AUDITOR VISUAL read-only. Genera capturas reales (headless Chrome, dev server 4327) de cada pagina/escena en desktop 1440 + mobile 390. Revisa: arte recortado, layout roto, overflow, texto cortado, cards vacias, contraste ilegible. Reporta un punch-list en AUDIT-VISUAL.md con archivo:linea/escena y el problema. NO edita src/ (eso es de Codex). Asi Ocin ve como va quedando y Codex arregla en base al punch-list. Loop: re-auditar despues de cada fix de Codex.


---
## [COWORK · THRESHOLD = el mesh aprobado + MAX loop] 2026-08-01

CODEX: la escena 00 THRESHOLD (la ENTRADA, /kodex/) debe ser el MESH/maya aprobado por Ocin: Downloads/kodex-threshold-live.html (la referencia que a Ocin le encanta). Hoy usa un portal de anillos; el blanco es ese mesh interactivo (campo vivo audio-reactivo + hover). Es lo primero que se ve al entrar. Incorporarlo como escena 00 respetando canon/perf.

MAX (loop, sin parar, sin pedir confirmacion): alterna en bucle:
1. CURADURIA: cura una tanda de volumenes review:true o curaduria vacia (titulo real, curaduria bilingue, registro/categoria, resonancias, conceptos; sources/ TAL CUAL para mapuche). commit+push.
2. AUDIT VISUAL: capturas headless (dev 4327) de paginas en 1440+390, revisa arte recortado / layout roto / overflow / texto cortado / cards vacias, reporta en AUDIT-VISUAL.md. NO edita src/.
Repeti 1 y 2 en loop. Cuando termines una, arranca la otra. Nunca quedes idle.


## DIRECTIVA COWORK — folio-iv-machine-rota (auditoria en vivo)
Ocin reporto /kodex/folio/iv/ (MACHINE) visualmente ROTA. COWORK reprodujo: la pagina carga sin errores de consola (200), pero el layout se rompe visualmente. Ademas los dos dev servers DIVERGEN: 4321 tiro 500 en cold hit, 4327 renderiza pero roto — hay que reconciliar a UN solo build.
CODEX (prioridad): abrir folio/iv headless, capturar 1440 y 390, diagnosticar el grid de .kx-os-stage con la kx-machine-canvas 720x720 + KodexField network-vortex; garantizar que la obra NO se recorte ni desborde; validar las 6 folios i..vi sin paginas rotas. Reportar con capturas y crear AUDIT-VISUAL.md.

## [MINI · opencode] Ingesta arte Ocin COMPLETA 2026-08-01
Ingesté las 1308 obras únicas de las dos fuentes (uploads sesión + kodex-art-inbox):
- `art/SLUG/` responsive webp+avif 400/800/1400 (1 archivo corrupto f25b46e4-51262 recuperado con failOn:none).
- 1330 specimens `review:true` en manifest (curaduría VACÍA, título/categoría tentativos del filename — pendiente tu curaduría).
- 1330 wallpapers free (mobile+desktop) registrados en free_assets.wallpapers.
- Commits: 2e2e4f8 (tanda 1) + 877713ff (tanda 2). Loop por archivos nuevos: 0 restantes.


## DIRECTIVA COWORK — migrar arte KODEX a R2 (pipeline validado en vivo)

CONTEXTO: Ocin ya activo R2 (10GB free, sin tarjeta) para alojar TODO su arte KODEX. El arte NO debe vivir en git. COWORK lo commiteo a git por error (730MB, 10.597 archivos, commit blindar-arte-opencode-covers-responsivos). Hay que MOVERLO a R2 y sacarlo de git.

VALIDADO por COWORK (probado, no teoria):
- Bucket: wenu-kodex-packs (publico, acceso managed habilitado).
- Base URL publica: https://pub-2b4562c758ed440ab047fe9523a2d99c.r2.dev
- Pipeline probado con wrangler 4.93.1 (instalado en el nvm):
  wrangler r2 object put wenu-kodex-packs/KEY --file=F --content-type=CT --remote
  donde KEY = ruta del archivo SIN el prefijo public/ (ej: kodex-content/art/ID/cover.webp).
- Verificado: GET a la base + KEY devolvio HTTP 200, content-type image/webp, 72KB. Sirve perfecto.
- Aviso: macOS 12.6 esta por debajo del minimo de wrangler (13.5) pero funciona igual.

CODEX (ejecutar, es tuyo):
1. Subir TODOS los archivos de public/kodex-content/art (10.597, 730MB) a R2 con ese esquema de KEY. Elegi la herramienta mas rapida y fiable: rclone (instalable por brew sin sudo, con un token R2 S3) es mucho mas rapido que wrangler en loop para 10k archivos; si no, wrangler con paralelismo. Content-type correcto por extension (image/webp, image/avif). Idempotente, con log de progreso, en background.
2. Cablear el frontend: donde el sitio referencia /kodex-content/art/... para el arte, anteponer la base R2 via UNA constante de config (ej ART_CDN_BASE en un solo lugar). Dejar fallback local para dev si conviene.
3. Cuando el arte este servido desde R2 y verificado (varias URLs 200 image/webp y avif): SACAR el arte de git -> git rm -r --cached public/kodex-content/art ; agregar public/kodex-content/art/ al .gitignore ; commit. Repo liviano otra vez.
4. Verificar EN VIVO que /kodex/works y las vol pages cargan el arte desde R2 (dominio r2.dev), no local. Reportar con URLs de muestra y capturas.

REGLAS: no tocar el arte en disco (es fuente + copia LaCie). NO cargar tarjeta en Cloudflare. No romper el resto del sitio. Serializado con el fix de folio/iv.


## DIRECTIVA COWORK — INTERLUDIOS / Quiet Frames + Sigil Type (aprobado por Ocin)

CONTEXTO: Ocin aprobo las paginas pulmon (interludios editoriales, silenciosos, entre escenas densas). Mando DOS paquetes de implementacion listos, ya desempacados en la boveda:
- QUIET FRAMES: /Users/user1/Obsidian/WenuAgent/estrategia/kodex-quiet-frames-context/KODEX_QUIET_FRAMES_CONTEXT_v1/
  (componente 03_COMPONENTS/astro/KodexQuietFrame.astro + styles/kodex-quiet-frames.css + scripts/mountQuietFrames.js + 04_PRESETS/quiet-frames-presets.json + 02_DESIGN_SYSTEM/QUIET_FRAMES_DESIGN_SYSTEM.md + 05_AGENT_PROMPTS/MASTER_IMPLEMENTATION_PROMPT.md + 08_DATA schemas + 09_QA/QA_CHECKLIST.md + 07_REFERENCE)
- SIGIL / TYPE: /Users/user1/Obsidian/WenuAgent/estrategia/kodex-sigil-type-context/KODEX_MODULAR_SIGIL_TYPE_SYSTEM_v1/
  (03_SIGIL_ENGINE/astro/KdxSigilText.astro + kdx-type-system.css + kdx-sigil-renderer.js + glyph-map.ts + kdx-symbols.svg + 04_PRESETS 8-core/12-expanded/4-mood + 07_INTEGRATION/quiet-frame-type-map.md que CONECTA ambos sistemas + 05_AGENT_PROMPTS/MASTER_TYPE_IMPLEMENTATION_PROMPT.md)

CODEX (ejecutar, es tuyo — src/):
1. Leer los dos MASTER prompts + el DESIGN SYSTEM + quiet-frame-type-map.md.
2. Integrar KodexQuietFrame + KdxSigilText como componentes reales en src/components/kodex/, con sus presets. Adaptar tokens a los de KODEX (no duplicar paleta).
3. Cablear 2-3 interludios entre los BLOQUES densos del viaje. NO uno tras cada escena (seria relleno y alarga el viaje). Ubicacion sugerida: despues de ARCHIVE antes de MACHINE; entre COSMOLOGY y RETURN; portada silenciosa antes de un capitulo del libro.

GUARDRAILS COWORK (duros, no negociables):
- Balance del layout: 70% vacio / 20% imagen-masa / 8% geometria / 2% microcodigo. Ese vacio ES el diseno.
- DOS REGISTROS: imagen + microtexto NUNCA mezclan mapuche documentado con ficcion. Frases del manifiesto/mantra VERBATIM, nada inventado.
- Paleta KODEX: obsidiana + hueso + UN acento tenue (cyan o violeta, 5-10% max). NO el verde del reproductor de la referencia.
- TIPOGRAFIA: reusar PRIMERO las fuentes que KODEX ya carga (IBM Plex Mono, Barlow Condensed, Oxanium, Inter Tight). Si el paquete pide una display nueva (Space Grotesk u otra), evaluar peso/perf antes de sumarla; preferir 1 sans display + 1 mono, nada mas. NO tocar las fuentes del sitio Wenu Mapu principal (lock del owner 2026-05-30).
- La IMAGEN del interludio sale de R2 (mismo esquema del art), NO de git.
- Canon: no-scroll, reduced-motion, UN movimiento sutil a la vez, mobile >=45fps. Motion permitido: grain suave, fade lento, drift 1px, mask reveal vertical, blink microtipografico. PROHIBIDO: glitch constante, zoom dramatico, orbits, telemetria activa. Que parezcan quietas pero vivas.

QA: correr 09_QA/QA_CHECKLIST.md del paquete. Verificar EN VIVO 1440 y 390: sin recortes de obra, sin romper el no-scroll, un canvas activo. Reportar con capturas.
SERIALIZADO con el fix de folio/iv y la migracion a R2 (mismo orden de prioridad). Commit+push seguido.
