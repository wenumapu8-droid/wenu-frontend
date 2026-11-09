# KDX.ECHO · Referencias open source y política de integración

**Estado: REFERENCE_ONLY / NOT INSTALLED / NOT LICENSE-APPROVED FOR KODEX**  
Ver documento de decisión: [KDX_ECHO_SOURCE_AUDIT_AND_AGENT_PLAYBOOK.md](./KDX_ECHO_SOURCE_AUDIT_AND_AGENT_PLAYBOOK.md).

No instalar estos repositorios en \`wenu-frontend\` por inspiración. Primero comprobar LICENCIA, hardware, seguridad, compatibilidad Astro, y si PR #121/#197 ya resuelve el mismo problema. Todos son referencias de arquitectura; la identidad visual y sonora de KODEX se crea desde cero.

| Repo / fuente | Qué enseña | Uso propuesto en ECHO | Por qué NO copiarlo completo |
|---|---|---|---|
| [desertcache/samantha-ui](https://github.com/desertcache/samantha-ui) | React/Three.js/GLSL, esfera deformada por amplitud y estado; smoothing/lerp fuera de render React; subtítulos palabra a palabra | Copiar el PATRÓN de \`audio amplitude→smooth shader uniform\` y \`caption timings\` | Introduce un front-end React/Vite + Python WebSocket; el KODEX actual usa Astro y shaders propios |
| [bit2zero/Orb](https://github.com/bit2zero/Orb) | Entrada/salida Gemini Live→Web Audio FFT→Three.js shader, trascripción | Leer \`analyser.ts\`, \`visual-3d.ts\` y tests como referencia | Bidireccional y requiere micrófono; usa Gemini y advierte riesgo de API key en bundle: NO portar ese patrón de seguridad |
| [Three.js AudioAnalyser](https://threejs.org/docs/pages/AudioAnalyser.html) | Análisis FFT oficial | Aplicar a bus de voz local si el audio actual no ofrece datos | Ya existe código de Web Audio en PR121 y sintetizador KODEX; duplicar crea varias fuentes |
| [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) | TTS Apache 2.0 ligero; inglés y español (voz es \`ef_dora\`) | Ruta autoría offline A/B y re-render de guiones ES/EN | No se descarga el modelo al visitante; audicionar acento y consistencia ES/EN |
| [OpenVoice V2](https://github.com/myshell-ai/OpenVoice) | Clonación/transformación de voz multiplataforma, MIT | Evaluar identidad KDX_F01 con muestra *propia y consentida* si Kokoro no ofrece timbre coherente | No clonar actores, voces del reel ni voces privadas; pipeline más complejo |
| [Chatterbox Multilingual](https://github.com/resemble-ai/chatterbox) | Alternativa TTS MIT y modelo LATAM ES; V3 disponible | Solo comparación de calidad offline | Desde ago-2026 investigación retirada, sin mantenimiento; pin/version/seguridad |
| [Piper1 GPL](https://github.com/OHF-Voice/piper1-gpl) | Locución CPU y modelos españoles | Respaldo operativo/a11y | Modelo por modelo tiene licencia individual; GPL del engine requiere compliance |
| [LiveKit agents-js](https://github.com/livekit/agents-js) | WebRTC/turn-taking/interruptions, STT+LLM+TTS | Solo exploración V2 si ECHO se vuelve conversacional | V1 debe ser monólogo y lectura opt-in SIN micrófono |
| [whisper.cpp](https://github.com/ggml-org/whisper.cpp) | STT/segmentación local | Auxiliar para generar VTT y auditar discurso | No sustituye revisión editorial; tampoco es motor de voz |
| [Remotion](https://github.com/remotion-dev/remotion) | Vídeo programático para reels, créditos, subtítulos, overlays | Render offline de transmisiones 9:16 | Licencia propia con umbrales según tamaño/uso; no obligar React al runtime Astro |
| [FFmpeg](https://ffmpeg.org/) | Recorte, encode OGG/WebM/MP4, mezcla sonora, subtítulos | Ya previsto en arquitectura audiovisual KODEX | No sustituye dirección visual ni QA |

## Orden de incorporación

1. **NO CLONAR NADA AÚN**: comparar branch PR121 con PR197 y sonido activo; recopilar matriz de archivos ya existentes.
2. Elegir UN VoiceAdapter/AudioBus y configurar cue/event contract. Reusar el patrón JavaScript existente.
3. Instalar Kokoro solo en entorno Python virtual aislado de autoría (con versión y hash verificados). Generar un solo clip ES y EN, \`AUDITION_ONLY\`.
4. Si calidad supera criterios, terminar 7 escenas con mismos \`ids\` y VTT. Si no, evaluar una segunda voz con OpenVoice y luego ElevenLabs (con gasto autorizado).
5. Referencias Samantha/Orb: extraer ideas de shader/captions con arte original; **no** añadir WebSocket/mic/chat en V1.
6. Para videos, conservar el scaffold PR169 y producir un único animatic con guion aprobado y assets propios.
7. No incorporar \`LiveKit\` hasta tener un caso de uso conversacional medible, privacidad revisada y presupuesto.
8. Documentar cada dependencia con commit/versión, license SPDX, licencia de pesos y muestras, CVEs, build, responsable y motivo técnico.

## Seguridad / derechos

- Nunca enviar claves a browser; backend/proceso build only; conservar secrets en vault/CI no en repo.
- Cualquier referencia clonada necesita revisar código, licencias, dependencias y modelos por separado.
- El MP4 de Instagram en Drive es REFERENCE_ONLY; desconocemos los instrumentos del autor, no autoriza redistribución ni extracción de su voz.
- No afirmar que una frecuencia visual simule memoria biométrica u observación de datos privados.
- No autoactivar audio ni llamadas remotas; consentimiento, pausa/mute, subtítulos y fallback son criterios de aceptación.
