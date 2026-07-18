# Claude SEO pass — 2026-07-13

## Estado
Bloqueado antes de empezar trabajo real.

## Qué pasó
Se lanzó Claude Code desde `~/wenu-frontend` usando el wrapper Wenu:
- comando: `~/.hermes/scripts/claude-wenu.sh -p ... --output-format json --max-turns 18 ...`
- salida guardada en: `reports/seo/claude-seo-pass-2026-07-13.stdout.json`

El proceso devolvió `401 Invalid authentication credentials`.

## Evidencia verificada
- `~/.hermes/scripts/claude-wenu.sh --check-env` → OK para `NOCODB_TOKEN`, `WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`
- `~/.hermes/scripts/claude-wenu.sh auth status --text` → aparentemente logueado con Claude Max
- `claude --version` → `2.1.113 (Claude Code)`
- prueba mínima real `claude -p 'hola' --max-turns 1 --output-format json` → falla con `401`
- prueba sin `ANTHROPIC_API_KEY` exportada (`env -u ANTHROPIC_API_KEY ...`) → misma falla `401`

## Interpretación
Esto parece un caso clásico de **falso verde en `claude auth status`**:
- el estado dice "logueado"
- pero las ejecuciones reales en print mode fallan por auth

No es un problema del prompt SEO ni del wrapper Wenu; el bloqueo ocurre incluso con una llamada mínima `claude -p 'hola'`.

## Qué NO se hizo
- no hubo deploy
- no hubo commit
- no hubo push
- no se tocaron archivos del frontend por Claude

## Siguiente paso recomendado
1. reautenticar Claude Code (`claude auth login`)
2. volver a probar con una llamada mínima:
   - `claude -p 'hola' --max-turns 1 --output-format json`
3. recién después reintentar este lane SEO

## Siguiente oportunidad operativa
Mientras Claude siga con `401`, Hermes puede seguir igual por su cuenta con:
- keyword map
- H1/title/meta propuestos
- auditoría local del repo
- o lanzar otro agente si el owner quiere un fallback
