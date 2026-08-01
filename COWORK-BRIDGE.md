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
