# KDX.ECHO ∞ — AUDITORÍA DE FUENTES, COSTOS Y HANDOFF A AGENTES

**Fecha local:** 2026-11-08 · **Estado:** INVESTIGACIÓN + HANDOFF, NO PUBLICADO · **Responsable de canon:** Ocín  
**Objeto:** producir monólogos, lectura, comentarios y voz sincronizada para KODEX sin duplicar sistemas.  
**Identidad:** KDX.ECHO = capa global de narración. **La app ORACLE existente sigue siendo independiente.** El nombre KDX.ORACLE se utilizó históricamente para un prototipo de presencia narrativa; esta coincidencia de nombres exige una conciliación técnica, no una sustitución silenciosa.

## 0. Resumen ejecutivo

**Recomendación:** ruta **local/open-source primero**, usando **Kokoro-82M** y el trabajo del PR #121 para la prueba; **ElevenLabs como opción curatorial** si una audición A/B justifica pagar por voz superior, no como dependencia de cada visita. Pre-generar audios, subtítulos y metadatos, alojarlos same-origin, controlar reproducción mediante eventos de KODEX. No generar automáticamente contenido comercial con el plan gratuito de ElevenLabs.

**No iniciar otro motor de voz, router o store.** Existe trabajo anterior funcional y sin fusionar. Reconciliar primero las ramas **#121**, **#169**, **#197**. El último commit de PR #121 tiene dos flujos CI completados en SUCCESS; el último de PR #197 no tenía flujos registrados al revisar. Éxito CI no equivale a prueba de navegador/merge/deploy.

## 1. Referencia de video: evidencia real, no inferencia del software usado

Fuente privada indicada por Ocín: https://drive.google.com/file/d/1sN_taoRTliR74P2LgNrqsos_FQBIAqdE/view

**Inspeccionado:** MP4 H.264 + AAC, 54,7297 s, 720×1584. Es una grabación vertical de un reel de Instagram; el plano dominante muestra una enorme megaestructura orbital curva luminosa, con fondo espacial y subtítulos/overlays en varios idiomas. El encuadre se sostiene durante gran parte del clip; domina la escala, iluminación, profundidad y ritmo lento. La apariencia de voz/narración se toma como referencia de experiencia; no se verificó palabra por palabra el transcript ni se identificaron las aplicaciones empleadas por el autor original.

**Hipótesis de producción reproducible, NO hecho demostrado del reel:** arte original KODEX → máscaras/capas de profundidad → 2.5D o cámara Blender/Three.js → animación de luz/partículas/noise → voz TTS/actor → subtítulos alineados → música y ambiente → mezcla → render MP4 vía DaVinci Resolve Free o FFmpeg. Un plano sostenido puede funcionar como una referencia, pero la producción KODEX debe seguir su dirección del HANDSHAKE del 18-oct-2026: evitar un simple zoom único; demostrar cambios narrativos visuales reales y continuidad artística. No reutilizar imágenes, audio, personajes ni voz identificable del reel sin derechos.

### Replicación recomendada de un capítulo de 55 s

1. SCRIPT_LOCK: tesis, fuentes y límites epistemológicos de ~900 caracteres, versión ES y versión EN (conteo real antes del gasto).
2. Audicionar una única voz propia/licenciada; exportar toma limpia WAV, no música mezclada.
3. Anotar la duración realmente entregada, segmentar frases y alinear VTT/SRT (revisión humana).
4. Diseñar 3–5 beats visuales (no necesariamente cinco planos): llegada, descubrimiento, revelación, respuesta, residuo.
5. Motion: máscara de profundidad/cámara o shaders; usar obras propias y movimiento intencional, no efectos ornamentales.
6. Mezclar voz frontal, ambiente espacial, silencios, música bajo la voz (ducking); normalizar y verificar con audífonos y altavoz móvil.
7. Render 1080×1920 H.264/AAC para difusión; conservar escena editable, stems, timing, seed, procedencia y versión; en web usar adaptación 100dvh y WebGL con fallback.
8. Revisión humana antes de publicar.

## 2. Trabajo existente: NO DUPLICAR

| Evidencia | Fecha/estado | Alcance real | Acción |
|---|---|---|---|
| [Drive: Narrative Presence + Voice Integration Brief](https://docs.google.com/document/d/1GYrpJMHGJV2riqYyPh8AZgUrd6SbkCB6Ool3Q1g27-k/edit) | 2026-08-28 · especificación | Voz diegética íntima, eventos reales, visual reactivo, Kokoro 82M, no micrófono V1, 3–5 frases por recorrido | Reutilizar contratos; adaptar nombre ECHO |
| [PR #121 — Oracle Presence V0](https://github.com/wenumapu8-droid/wenu-frontend/pull/121) | 2026-08-30 · OPEN, UNMERGED | Voz offline temporal eSpeak, captions, WebAudio→shader, THRESHOLD→PROLOGUE, test/lab, script local Kokoro, SHA manifests | **Auditar y reutilizar**; no fusionar a ciegas (base es \`kodex/pass-a-organismos-corredor\`) |
| [Drive: KDX HANDSHAKE 001](https://docs.google.com/document/d/1zBNLmuHcCHgyZIq4b7wl70rpjAtVNmWnZLMOUpn_t5A/edit) | 2026-10-18 · handoff | Claude Code implementa audiovisual; ElevenLabs voz; ChatGPT edición; Higgsfield solo condicional | Recuperar responsabilidades/criterios |
| [Drive: KORE Script Library](https://docs.google.com/spreadsheets/d/1jJ8SWtih0oPCTXw_gINK4Z-uB1Zl3xLe9pHAybFzagk/edit) | revisión pendiente | Registro de candidatos con SOURCE, SIGNAL, MEMORY, límites, duración, estado CANDIDATE y revisión PENDING | No tratar como textos aprobados |
| [PR #169 — Autopilot](https://github.com/wenumapu8-droid/wenu-frontend/pull/169) | 2026-10-06 · OPEN, DRAFT | Scaffold de película programática; FFmpeg, 2D/2.5D, no Higgsfield por defecto | Reutilizar export/reel pipeline sin acoplar a web runtime |
| [PR #197 — KDX.ECHO](https://github.com/wenumapu8-droid/wenu-frontend/pull/197) | 2026-11-09 UTC · OPEN, DRAFT | Componente Astro global, 7 escenas y corpus piloto ES/EN, director, controlador, generador ElevenLabs, ducking | Base de integración en revisión; no finalizada |
| [Drive: Sound Bible](https://docs.google.com/document/d/1I_IKRpt9HmmvegY6FtqBvs8nmfYNQ1G2upDVzwGE-Es/edit) | existente | Identidad sonora y mapeo Web Audio | Respetar antes de mezclar buses |
| [Drive: KDX Cinematic Story Bible](https://docs.google.com/document/d/1DOvqAbKtTrAQSoxcdb4tSswkSqLeeXbK1vnukI-jpzI/edit) | 2026-10-18 · propuesta | Continuidad cinematográfica, sonido, archivos, renders, revisión | No sustituye guiones aprobados de ECHO |

**Estado técnico importante:** PR #121 commit \`6928ffe...\` tiene dos GitHub Actions completadas con resultado SUCCESS (Vertical Slice y Core Runtime). PR #197 commit \`e5ab664...\` no reportaba workflows en la consulta. Ningún PR está merged ni equivale a despliegue. PR #117 no se encontró como PR en este repo; los handoffs pueden referirse a issue u otro repo: localizar antes de atribuir.

**Assets ya probados en PR #121:** dos OGG/Opus de eSpeak, marcados DEV_TEMP, más un pipeline \`scripts/kodex-oracle-voice-author.py\` que genera auditions y SHA256. No son KDX.ECHO_F01 final. El pipeline actual contiene voces de prueba de Kokoro en inglés (\`af_heart\`, \`af_bella\`, \`af_nicole\`, \`bf_emma\`) y \`KPipeline(lang_code='a')\`. Para narración ESPAÑOL se necesita un lane \`lang_code='e'\`, por ejemplo la voz nativa \`ef_dora\`, con pruebas de calidad; no cambiar simplemente la etiqueta de idioma.

**Contradicción creativa a resolver:** brief 28-ago = voz femenina próxima/etérea; handoff 18-oct = voz sintética dual/andrógina con base femenina. Es una elección de dirección sonora, no bug. Preparar dos pruebas originales con igual texto, verificar inteligibilidad ES/EN y solicitar \`KEEP|REFINE|REJECT\` del creador.

## 3. Tecnologías y licencias: shortlist de uso comercial

| Motor | Precio de licencia/modelo | Español | Ventaja | Límite / estado | Decisión |
|---|---|---|---|---|---|
| [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | Apache-2.0, generación local gratis | Sí, principalmente \`ef_dora\` femenino | Muy liviano (82 M), ya programado en PR121, lectura offline | Calidad emocional y unificación timbre ES/EN por audicionar | **PRIMERA OPCIÓN** |
| [OpenVoice V2](https://github.com/myshell-ai/OpenVoice) | MIT, uso comercial permitido | Sí | Timbre/identidad transferible con referencia propia autorizada | Pipeline más complejo, la voz fuente debe ser propia/consentida | Segunda opción para identidad |
| [Chatterbox Multilingual V3](https://github.com/resemble-ai/chatterbox) | MIT según repositorio/model card, gratuito local | Sí + variante LATAM | Potencial expresividad/voz consistente | Investigación retirada y sin mantenimiento desde agosto 2026; más exigente | Audición experimental aislada |
| [Piper1](https://github.com/OHF-Voice/piper1-gpl) | GPL-3.0 código actual; cada modelo tiene LICENSE/MODEL_CARD | Sí (es_AR/es_ES/es_MX) | CPU, automatización, robustez | Fuerte carga de compliance GPL y calidad cinematográfica menos segura | Fallback de accesibilidad |
| [F5-TTS](https://github.com/SWivid/F5-TTS) | Código MIT pero pesos oficiales CC-BY-NC-4.0 | Pesos base no diseñados como voz ES universal | Voz expresiva para investigación | Pesos **NO COMERCIALES** | EXCLUIR de publicación comercial sin otra licencia |
| [Fish Speech](https://github.com/fishaudio/fish-speech) | FISH AUDIO COMMUNITY/RESEARCH LICENSE, NO MIT/Apache | Sí | Voz potente | Restricciones de pesos/versiones y gasto computacional | No instalar hasta revisión jurídica |
| Navegador \`speechSynthesis\` | Sin cobro por caracteres | Depende SO/navegador | Fallback instantáneo | Voz no reproducible/consistente y timbre no cinematográfico | Solo PREVIEW/fallback |

**Atención:** que el código sea MIT no implica automáticamente que todas las voces, pesos, datasets y muestras admitan todo uso comercial. Registrar licencias por modelo/voz, SHA y procedencia. Las herramientas open-source se descargan desde su origen oficial y se fijan versiones/commits; nunca ejecutar scripts copiados de terceros sin inspección.

Fuentes oficiales:  
Kokoro https://huggingface.co/hexgrad/Kokoro-82M  
OpenVoice https://github.com/myshell-ai/OpenVoice  
Chatterbox https://github.com/resemble-ai/chatterbox  
Piper voces https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/VOICES.md  
F5 pesos https://huggingface.co/SWivid/F5-TTS

## 4. ElevenLabs: planes y costos, SIN asumir crédito disponible

Precios de referencia (consulta 2026-11-08):
- ElevenCreative: Free $0 / 10.000 créditos mensuales, **sin licencia comercial**; Starter $6 / 30.000; Creator $22 / 121.000; Pro $99 / 600.000. https://elevenlabs.io/es/pricing
- API TTS pay-per-character: Multilingual v2/v3 aprox. $0,10 por 1.000 caracteres; Flash/Turbo aprox. $0,05 por 1.000. https://elevenlabs.io/es/pricing/api
- Las tablas API y los créditos de ElevenCreative/ElevenAPI no deben mezclarse como si fueran el mismo producto, cuota o factura; la API puede tener créditos/condiciones diferentes y descuentos/modelos. La página comercial indica que las generaciones en web generalmente cuestan 1 crédito/caracter; Flash API puede consumir 0,5–1 créditos por carácter según régimen. Verificar antes de producir.
- **SALDO ACTUAL DE LA CUENTA: NO VERIFICADO.** No existe herramienta de lectura de billing/usage en el conector ElevenLabs disponible para este trabajo. No inferir plan ni créditos disponibles por login o por una generación anterior.
- El handoff Drive de 18-oct informa UNA prueba anterior: voz \`Adam - Robotic, Smooth and Calm\`, ocho segundos y ~149 créditos, explícitamente NO aprobada como voz final. Eso no mide crédito actual ni ECHO ya listo.

### Modelo cuantitativo de producción (supuestos inspeccionables)

Supuesto de planificación: 1.000 caracteres ≈ 1 minuto de narración; **aproximación**, reemplazar por recuento y duración reales tras la edición. 2 idiomas ES/EN, una sola toma aprobada, sin regeneraciones, ni música, ni LLM, ni IVA.  
Costo PAYG v2 = \`chars/1000 * $0.10\`; Flash = \`chars/1000 * $0.05\`.  
Si r = tomas promedio, caracteres facturados = \`chars * r\`. Almacenar el texto y el SHA para evitar regeneraciones duplicadas.

| Alcance | Minutos (ES+EN) | Caracteres estimados | API v2/v3 | API Flash/Turbo |
|---|---:|---:|---:|---:|
| 1 reel de 55s, ES+EN | ~1,8 | ~1.800 | ~$0,18 | ~$0,09 |
| 7 macro escenas de 30s, ES+EN | 7 | ~7.000 | ~$0,70 | ~$0,35 |
| 46 ciudades de 1 min, ES+EN | 92 | ~92.000 | ~$9,20 | ~$4,60 |
| 25 nodos de 1 min, ES+EN | 50 | ~50.000 | ~$5,00 | ~$2,50 |
| 20 adicionales de 1 min, ES+EN | 40 | ~40.000 | ~$4,00 | ~$2,00 |
| **TOTAL** | **189** | **~189.000** | **~$18,90** | **~$9,45** |
| Total con 2 tomas promedio | 378 | ~378.000 | ~$37,80 | ~$18,90 |

Estas son **tarifas API teóricas**: la compra real depende de la modalidad contratada y sus mínimos de suscripción, uso incluido, posibles multiplicadores, exceso, formato y revisión de texto. El total NO significa que $18,90 compra todo en el plan correspondiente.

### Capacidad indicativa con créditos Creative (NO saldo real)
- Free 10k: una toma de 7 escenas ES+EN (~7k) cabría teóricamente a 1 crédito/caracter, SOLO prueba no comercial.
- Starter 30k: caben ~30 minutos de narración a 1 crédito/caracter, o más si una API del plan descuenta por modelo. Es suficiente para piloto por etapas.
- Creator 121k: caben ~121 minutos, no el catálogo bilingüe completo de 189 minutos con 1 crédito/caracter y sin segunda toma.
- Pro 600k: cubre la estimación 189k y hasta ~3 tomas bajo 1 crédito/caracter, dejando margen limitado para otros servicios.
- Si se dispone de ~189k caracteres a tarifa de 0,5 créditos/caracter, consumiría ~94,5k créditos, pero **NO** presupuestar ese descuento como asegurado hasta confirmar modalidad/API.

**No usar la API para reproducir clips ya generados.** Audio almacenado con KDX → cero créditos adicionales por reproducción (el ancho de banda sí tiene costo). Un visitante NO requiere una sesión ElevenLabs ni GPU; una voz de lectura improvisada en tiempo real sí consumiría nueva inferencia.

## 5. Ruta local gratuita — costo real

- Kokoro/OpenVoice: $0 tarifas de síntesis si corre en computador existente; se pagan tiempo técnico, energía, almacenamiento y posproducción. Modelos/tiempos deben probarse en hardware real antes de afirmar throughput.
- GPU alquilada opcional: Runpod lista RTX A4000 desde ~$0,17–$0,25/h y RTX 4090 desde ~$0,34–$0,74/h según modalidad/zona/disponibilidad; NO es cotización fija del batch. Presupuesto = horas reales alquiladas × tarifa + almacenamiento/carga y descargas. https://www.runpod.io/gpu-models/rtx-a4000 y https://www.runpod.io/gpu-models/rtx-4090
- Ningún video-generador pagado es imprescindible: archivos propios + máscaras 2.5D + Blender/Three.js/FFmpeg + DaVinci Resolve Free. Remotion para video programático si se justifica; **verificar licencia comercial por tamaño/uso** (gratuita para individuos y empresas elegibles de hasta 3 empleados según licencia consultada): https://github.com/remotion-dev/remotion/blob/main/LICENSE.md
- Whisper.cpp (MIT) permite transcripción/alineación auxiliar y subtítulos desde archivo de audio; los VTT publicados deben validarse a oído/lectura: https://github.com/ggml-org/whisper.cpp

## 6. Estructura objetivo (no duplicar memoria/router)

\`\`\`
KDX SOURCE REGISTRY (canon/docs/episodios aprobados, procedencia)
    ↓
NarrativeDirector (selección por estado/eventos reales + cooldown)
    ↓
VoiceAdapter [KOKORO_PREGEN | ELEVENLABS_PREGEN | SILENT_CAPTIONS]
    ↓
AudioBus ÚNICO [voz, música, ambiente, limiter, ducking]
    ├─ captions / VTT alineados
    └─ analyser FFT + envelope → visual uniforms (no memoria escrita)
JourneyState / RETURN EXISTENTE [solo lectura autorizada] → director
\`\`\`

**Prioridad de reconciliación:** actualmente hay al menos tres rutas de audio en implementación/historia: \`src/scripts/kodex-audio.js\`, \`src/kodex/audio/kodexAudio.js\` y el AudioContext de Oracle PR121; PR197 añade señal \`window.__kdxEchoSignal\`. Elegir un dueño de AudioBus y adaptadores, no crear otro AudioContext superpuesto por módulo. Localizar en PR197 las transiciones ante 404 del audio, pausa/reinicio, persistencia, sentido real del modo LECTURA (por ahora lee corpus del modo narrador, no el documento seleccionado), y la ausencia de audios comerciales pregenerados. No fusionar PR121 sin revisar el base ref divergente.

**Contratos obligatorios:**
- Sin audio hasta gesto claro del usuario; mute inmediato; subtítulos aun sin audio; sin micrófono/cámara en V1.
- Entrada a escena no equivale a acción transformadora verificada.
- Hablar de memoria solo si existe evidencia real de ruta; fallback curado explícito.
- Estado editorial \`VERIFIED|CANONICAL|INFERRED|SPECULATIVE|NEEDS_CONFIRMATION\` visible en registros y respuestas generativas.
- Dominio /kodex/* exclusivamente; no montar UI ECHO en checkout, tienda ni app ORACLE.
- Bilingüe ES/EN real, pronunciación, ritmo y derechos; HTML lang y subtítulos sincronizados.
- Modo ambiental ≠ monólogo: ambiental máximo 3–5 intervenciones por recorrido; monólogo se reproduce solo con selección explícita del usuario; lectura reproduce texto fuente autorizado literalmente.
- Sin input de archivos privados a modelos remotos sin alcance autorizado.

## 7. Instalación local y prueba barata (SIN credenciales; no instalar en producción)

**Antes:** revisar PR121 y licencia, Python 3.10+, entorno virtual, ffmpeg, espeak-ng disponibles. Fijar dependencias tras la primera corrida segura; pesar calidad/performance.

\`\`\`bash
git fetch origin
git switch feature/kdx-echo-global-v1
node --test tests/kdx-echo.test.mjs
npm run build
node scripts/kdx-echo-generate.mjs --dry-run --lang both
\`\`\`

Para un laboratorio Kokoro independiente (no se ejecuta en servidor público):

\`\`\`bash
python3 -m venv .venv-echo
source .venv-echo/bin/activate
python -m pip install "kokoro>=0.9.4,<1" soundfile
# Instalar espeak-ng con gestor del sistema (brew/apt) y revisar requisitos:
python -c "from kokoro import KPipeline; print('Kokoro import OK')"
\`\`\`

**Audición española (solo tras instalar dependencias y revisar licencia):**
\`\`\`python
from kokoro import KPipeline
import soundfile as sf
pipeline = KPipeline(lang_code='e')
for i, (_, _, audio) in enumerate(pipeline("Esta estructura conserva las huellas de una transformación.", voice='ef_dora', speed=0.94)):
    sf.write(f"echo_es_{i:03d}.wav", audio, 24000)
\`\`\`

**Ojo:** el script histórico \`scripts/kodex-oracle-voice-author.py\` del PR121 está orientado a voces inglesas (lang a) y a dos cues, NO satisface sin cambios el catálogo ECHO en español. Adaptar la herramienta con tests de ES, EN, segmentación y trazabilidad; no clonar a ninguna actriz ni narrador referencial.

**ElevenLabs solamente cuando estén aprobados voz, texto, saldo y gasto:**
\`\`\`bash
export ELEVENLABS_VOICE_ID="<voz comercial permitida>"
# API key por variable de entorno local/secret manager; JAMÁS en repo/browser
node scripts/kdx-echo-generate.mjs --dry-run --lang both
# El siguiente comando SÍ puede gastar créditos si hay key:
# node scripts/kdx-echo-generate.mjs --only prologue_01 --lang es
\`\`\`

La configuración del generador del PR197 usa por defecto \`eleven_multilingual_v2\`. La variante Flash debe audicionarse e indicarse como \`ELEVENLABS_MODEL_ID=eleven_flash_v2_5\`; la calidad y coste deben compararse con el plan real. Respetar limits, rate limits y errores; hashes de salida; ninguna re-generación automática silenciosa.

## 8. Distribución de trabajo sin pisarse

### Claude Code — RESPONSABLE ÚNICO DE RUNTIME
- [ ] Comprobar estado remoto de PR121, PR169, PR197 y worktrees locales; preservar cambios pendientes.
- [ ] Comparar diffs, seleccionar un único \`VoiceAdapter\`/AudioBus y eliminar duplicación conceptual.
- [ ] Corregir bug/fallback de audio ausente en PR197; lectura de documentos seleccionados; controles y lifecycle.
- [ ] Exponer interfaz \`KdxEchoNarrationCue\` y un manifiesto versionado de audios con SHA, licencia, source, lang, cue timing.
- [ ] Instrumentar una interacción real THRESHOLD→PROLOGUE y una de OBSERVE V2; no emitir falsos eventos.
- [ ] Ejecutar tests, Astro build, Playwright/QA 390×844, 412×915, desktop, reduced-motion, mute, slow network.

### Gemini / Antigravity — DISEÑO AUDIOVISUAL Y QA PERCEPTUAL
- [ ] Audición A/B Kokoro ES vs ElevenLabs ES (misma frase, mismo objetivo sonoro, volumen igualado).
- [ ] Diseñar 3–5 estados visuales y acoplamiento FFT/pausa/palabra sin inventar biometría.
- [ ] Verificar contraste, captions con varios idiomas, ausencia de flash, sincronía móvil.
- [ ] Generar un animatic original de 55s con assets/licencias del KODEX; no replicar arte de Instagram.

### Kimi / Research — FUENTES, EDICIÓN, LICENCIAS
- [ ] Extraer candidatas del registro KORE Script Library; marcar CANDIDATE/PENDING, no publicar automáticamente.
- [ ] Crear dos guiones aprobables: 30s THRESHOLD y 55s CITY; ciencia, ficción y especulación separados.
- [ ] Registrar revisión y licencia de cada voz/modelo y fuente visual.
- [ ] Mantener tabla de costos por caracteres reales y ratio de tomas aceptadas.

### Hermes / Control Tower — COORDINACIÓN
- [ ] Registrar PR, responsables, tests y bloqueos sin emitir cambios paralelos.
- [ ] Detectar duplicados de trabajo PR121/169/197; no correr generación con cobro, merge ni deploy.
- [ ] Producir informe de QA con commit exacto y enlaces de evidencia.

### Ocín — APROBACIÓN
- [ ] Aceptar identidad perceptual ECHO (voz femenina íntima o dual/andrógina).
- [ ] Seleccionar voz comercial permitida y firmar script/estética.
- [ ] Autorizar cualquier consumo de créditos.
- [ ] Autorizar por separado merge/deploy: \`APROBAR DEPLOY\`.

### Entregable obligatorio del sprint 1
1 prueba de 30–55s (puede ser web y versión MP4) donde se oye voz original aceptada, hay subtítulos sincronizados, audio reactivo real, música con ducking, interacción observada, fallback offline, pruebas móviles documentadas y ningún coste adicional por visita. **No** marcarla terminada por existir el código solamente.

## 9. Criterios de aceptación / QA

- [ ] Demo reproduce de forma estable 10 veces sin doble voz, audio bloqueado o pérdida de subtítulos.
- [ ] Entrar directamente en /kodex/lab/observe-v2/ no provoca narración fantasma.
- [ ] Audio por defecto OFF; persistencia de preferencia sin autoplay prohibido.
- [ ] Música original y ECHO comparten política de volumen, sin clipping audible.
- [ ] Cambiar escena cancela/reemplaza con crossfade, sin superposición de viejos clips.
- [ ] PR seleccionado compila y reporta pruebas exact-head; exporta captura desktop y 390/412 móvil.
- [ ] READ reproduce un texto realmente seleccionado y autorizado, no una frase de ambiente disfrazada.
- [ ] Los 25 nodos y 46 ciudades son **slots documentados**, NO guiones ya generados.
- [ ] Proveedor, modelo, versión, licencia, voz, script hash, duración, créditos, revisión, estado, lengua por clip.
- [ ] No gasto ni publicación hasta aceptación humana explícita.

## 10. Fuentes y control de incertidumbre

**Públicas:**
- ElevenLabs Creative precios: https://elevenlabs.io/es/pricing
- ElevenLabs API precios: https://elevenlabs.io/es/pricing/api
- ElevenLabs modelos API: https://elevenlabs.io/docs/overview/models/
- Kokoro oficial/modelo: https://huggingface.co/hexgrad/Kokoro-82M
- OpenVoice V2 licencia: https://github.com/myshell-ai/OpenVoice
- Chatterbox investigación archivada 2026: https://github.com/resemble-ai/chatterbox
- Piper actual GPL/voz: https://github.com/OHF-Voice/piper1-gpl
- F5 pesos no comerciales: https://huggingface.co/SWivid/F5-TTS
- GPU ejemplo: https://www.runpod.io/pricing
- Whisper.cpp: https://github.com/ggml-org/whisper.cpp
- Remotion licencia: https://github.com/remotion-dev/remotion/blob/main/LICENSE.md

**Privadas del proyecto:** video en Drive, ORACLE brief agosto, KDX HANDSHAKE octubre, KORE Script Library, Sound Bible, PR #121/#169/#197. Su existencia y revisión no confirman que los materiales estén publicados ni que haya un encargado ejecutando un sprint ahora.

**Pendientes explícitos:** saldo real ElevenLabs, tipo de suscripción Creative/API, voice preset licenciado y revisión Ocín, throughput GPU/CPU en los equipos de producción, costo de hosting real por visitantes, integración efectiva al sitio público.

**Decisión ejecutiva recomendada:** **no pagar todavía y no clonar otro repositorio directamente dentro de producción**. Primero comparar el PR121 con ECHO PR197, audicionar Kokoro español, usar assets propios y pruebas locales. Solo después evaluar un mes Starter o Creator para grabar tomas finales selectas si la mejora perceptual está demostrada.
