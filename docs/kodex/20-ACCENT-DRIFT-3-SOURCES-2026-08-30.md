# Accent Drift · 3 fuentes de verdad para los colores por escena

**2026-08-30 · Hallazgo del loop nocturno.**

Los accents de las 7 escenas están declarados en **tres lugares del código**
y **las tres declaraciones difieren entre sí**. Necesita decisión autoral
para congelar una sola fuente.

## Los 3 lugares

| Fuente | Uso |
|--------|-----|
| `src/lib/kodexScenes.js` — `scenes[i].accentHex` | Mapa de navegación, cabeceras del corredor |
| `src/pages/kodex/folio/[folio].astro` — `sceneByFolio[i].accent` | El color CSS que se aplica al render de la escena |
| `src/content/scenes/scene.NN-*.yaml` — `palette.chassis_accent` | El contrato autoral congelado 2026-08-29 |

## Tabla del drift

| Escena | YAML (contrato) | [folio].astro (render) | kodexScenes.js (nav) | ¿Coinciden? |
|--------|----------------|------------------------|---------------------|:-----------:|
| THRESHOLD | `red #FF3833` | (portada) | `red #FF3B33` | ≈ (1 hex distinto) |
| PROLOGUE | `violet #8B5CF6` | `violet #8B5CF6` | `violet #B770FF` | ⚠ 2 valores |
| DESCENT | `NEEDS_CONFIRMATION` morado | `orange #FF6A00` | `orange #FF8A33` | ⚠ contrato pide morado, render usa naranja |
| **ARCHIVE** | `cyan #00D8FF` | `acid #A7FF00` | `cyan #00F0FF` | ⚠⚠ **3 valores distintos** |
| **MACHINE** | `orange #FF6A00` | `cyan #00D8FF` | `cyan #00F0FF` | ⚠⚠ **contrato pide naranja, render usa cyan** |
| COSMOLOGY | `NEEDS_CONFIRMATION` verde | `magenta #FF00C8` | `magenta #FF00C8` | ⚠ contrato pide verde, render usa magenta |
| **RETURN** | `BLANCO — CANONICAL` | `acid #A7FF00` | `acid #B7FF00` | ⚠⚠ **contrato pide blanco, render usa acid** |

## Lo que hace pensar el drift

**Escenario A · el contrato es la nueva palette y el render no se actualizó.**
Los YAML son del 2026-08-29 y declaran cosas como `chassis_accent: BLANCO` para
RETURN. Si el creador decidió ese día una nueva palette y quedó documentada en
los contratos pero el código no se actualizó, la solución es alinear
`[folio].astro` y `kodexScenes.js` al YAML.

**Escenario B · el YAML propone y el render decide.**
Los `NEEDS_CONFIRMATION` en DESCENT y COSMOLOGY sugieren que el YAML es un
draft en curso. Si el render es la palette actualmente aprobada, la solución
es propagar los valores de `[folio].astro` al YAML.

**Escenario C · confusión ARCHIVE/MACHINE.**
El YAML dice `ARCHIVE: cyan / MACHINE: orange`. El render dice
`ARCHIVE: acid green / MACHINE: cyan`. Se ve como si dos escenas se hubieran
intercambiado los accents en algún commit y solo una de las dos fuentes lo
absorbió.

## Referencias de decisión previas

- **Memoria 2026-08-28** (`project_kodex_paleta_ambar_2026_08_28`) declara los
  accents como INTENCIONALES y lista: *ARCHIVE/MACHINE cyan #00F0FF, RETURN
  verde ácido #B7FF00*. Esa memoria coincide con `kodexScenes.js`.
- **YAML contract palette rule** dice literal: *"El color de KODEX vive en
  MARCOS, SEÑALES, PARTICULAS, MICRO-UI, ILUMINACION y PROFUNDIDAD. NUNCA
  colorea la obra."* — regla sobre DÓNDE se aplica, no sobre qué color usa.

## Regla dura para NO tocar hasta decidir

Este drift **no se resuelve en silencio**. Cambiar cualquiera de las tres
fuentes propaga a los renders (o al gate) y decide una palette en nombre del
creador. Decisión pendiente:

1. **¿Qué fuente es canónica?** El contrato YAML, el render `[folio].astro`,
   o la nav `kodexScenes.js`.
2. **¿ARCHIVE es cyan o acid green?**
3. **¿MACHINE es cyan o orange?**
4. **¿RETURN es blanco (canonical del contrato) o acid green (render)?**
5. **DESCENT y COSMOLOGY** tienen `NEEDS_CONFIRMATION` — ¿morado y verde
   nuevos como declara el YAML, o mantener el orange y magenta actuales?

## Camino recomendado (no ejecutado)

Una vez decidido: escribir un script `scripts/verify-scene-accents.mjs` que
compare las 3 fuentes y falle el build si divergen. Meterlo en `postbuild`.
Así el drift no vuelve a nacer silenciosamente.
