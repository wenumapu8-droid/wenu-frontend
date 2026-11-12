# KODEX−∞ · THRESHOLD / Motor de arquetipos · PROTOTIPO

## Alcance y estatus

- **Estado:** PROTOTIPO. No desplegado, ni validado como instrumento psicológico.
- **Canon:** módulo dentro de `THRESHOLD`. No crea escenas adicionales ni altera la navegación existente.
- **Privacidad:** las elecciones, los rechazos, los tiempos de respuesta y la variable artística `frequency` se guardan en `localStorage`, clave `kodex.arquetipos.prototype.v1`; sin login, API ni envío desde el módulo. La página que aloja THRESHOLD puede tener analítica general propia, que no forma parte de este módulo.
- **Interpretación:** arquetipos *inspirados* en Jung; los 12 nombres no son un inventario diagnóstico original de Jung. Las probabilidades describen únicamente el ajuste al modelo de pesos editable.

## Cómo funciona

1. Un botón de THRESHOLD abre el módulo, que conserva acceso a cerrar y continuar el recorrido principal.
2. Hay exactamente **12 parejas de glifos**, definidas en `src/lib/kodex/archetypes/questions.json` (campos `prompt`, `options[].glyph`, `label`, `weights`). Cada una se presenta una vez.
3. Se inicia con prior uniforme entre 12 arquetipos. Para un arquetipo `a`, `P(A|a)=sigmoid(1.25×(peso_A[a]-peso_B[a]))`; `P(B|a)=1−P(A|a)`; la respuesta actualiza el posterior con Bayes.
4. Se calcula la ganancia esperada en bits `IG=H(prior)−∑ P(opción)×H(posterior|opción)` para cada pregunta sin resolver. Se muestra la de mayor IG. En empates prevalece el orden del JSON.
5. **Omitir** se registra como rechazo sin actualizar probabilidades. Cuenta como decisión resuelta para no bloquear el recorrido.
6. `frequency=-100+100×(decisiones resueltas/12)`; es exclusivamente artística. Define CSS `--kodex-color` de HSL rojo (0) a violeta (280), densidad y velocidad de partículas 2D. Los cálculos se prueban por separado de la interfaz.
7. Tras 12 interacciones aparece “Tu mapa” (top 3, porcentajes, constelación del orden de decisiones y listado). `BORRAR MI MEMORIA LOCAL` elimina la clave y reinicia.

## Archivos

- `src/lib/kodex/archetypes/engine.js`: motor puro, Bayes, entropía, selección, persistencia validada/rehidratación, frecuencia.
- `src/lib/kodex/archetypes/questions.json`: contenidos y pesos editables.
- `src/scripts/kodex-archetypes-ui.js`: adaptador DOM, estado local, inputs y canvas 2D.
- `src/components/kodex/archetypes/KodexArchetypeThreshold.astro`: estructura y UI de THRESHOLD.
- `src/styles/kodex-archetypes.css`: estilos responsive y reduced-motion.
- `src/pages/kodex/index.astro`: dos incorporaciones: botón en THRESHOLD + componente antes del overlay global.
- `tests/kodex-archetypes.test.mjs`: pruebas unitarias Node sin dependencias.

## Probar localmente

```bash
# Desde la raíz de wenu-frontend, en feature/motor-arquetipos
npm ci
node --test tests/kodex-archetypes.test.mjs
npm run dev
# abrir http://localhost:4321/kodex/ y pulsar ACTIVAR MOTOR DE ARQUETIPOS
npm run build
```

Para QA visual repetir con viewport **390×844** y **412×915**; probar teclado (Tab, 1, 2, Escape), `prefers-reduced-motion`, restauración después de refrescar, rechazo, pantalla final, borrado y navegadores que bloquean `localStorage`. Verificar que el scroll de la página siga bloqueado y que el contenido del diálogo, si sobrepasa la pantalla, se desplaza dentro del propio diálogo.

### Verificación realizada (aislada, no del build Astro completo)

- 7 pruebas unitarias `node --test`: correctas.
- Chromium DOM harness: ejecución de flujo completo, 390×844 y 412×915: correcto, sin desbordamiento del documento.
- Pendiente: compilar el repositorio completo con sus dependencias reales, prueba visual en THRESHOLD real y dispositivos físicos, QA de accesibilidad con lector de pantalla.

## V2 — extensión opcional

1. Separar `archetype` como motor reproducible y documentar calibración de pesos/consistencia de pruebas; añadir experiencia de revisión de respuestas y exportación JSON opt-in.
2. Añadir módulo opt-in de **Dreamspell/Kin**, mediante evaluación de `@oshimishi/dreamspell-math` (licencia MIT, API y mantenimiento por verificar antes de fijar versión). Distinguir el sistema Dreamspell de la cuenta larga maya/Tzolk'in histórica; respetar procedencia cultural. Pedir fecha únicamente con permiso, procesar localmente, no anexar inferencias psicológicas.
3. Añadir carta astral opcional con fecha, hora y lugar **solo** por consentimiento; cálculo local o un servicio explícito y auditable, con política de retención y borrado por defecto. Presentarla como interpretación cultural/simbólica, nunca como evidencia clínica/científica.
4. Integrar `--kodex-color`, `frequency` y presupuesto de partículas con WebGL/GLSL real **solo cuando el prototipo se valide en móviles**, sin multiplicar shaders activos.
5. Auditoría de metadatos, licencia/procedencia de glifos, contraste, batería y datos sensibles; feature flag para evitar que otras escenas dependan de las respuestas.

**No despliegue:** nunca ejecutar deploy sin la frase exacta `APROBAR DEPLOY`. El PR debe permanecer en borrador hasta QA.
