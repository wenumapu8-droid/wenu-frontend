# Wenu Mapu — frontend

Astro 6 SSG. Reads products from WooCommerce REST at build time. Static output deploys to Cloudflare Pages.

For internal architecture / build-safety / Cloudflare preview settings, see [`CLAUDE.md`](./CLAUDE.md).

## Local development

Requires Node 24.14.1 (pinned in `.nvmrc`).

```bash
nvm use                    # → Node 24.14.1
npm install
cp .env.example .env       # then fill WC_CONSUMER_KEY / WC_CONSUMER_SECRET
npm run dev                # http://localhost:4321
```

## Build

```bash
npm run build              # SSG → dist/ (with postbuild catalog assertion)
npm run preview            # local preview of the built site
```

The build will **fail loud** if WooCommerce is unreachable or auth fails. For an intentional offline build:

```bash
ALLOW_EMPTY_PRODUCTS=true npm run build
```

## Deployment

This repo targets **Cloudflare Pages preview** on the `redesign-v2` branch. The production domain `wenumapuonline.com` is **not** connected to this build — it continues to serve the legacy WordPress / WooCommerce site. See `CLAUDE.md` for the Cloudflare Pages settings and required environment variables.

## VS Code + IA / gestión de trabajo

Este repositorio ya incluye recomendaciones para usar VS Code como tu centro de trabajo. Usa:

- `GitHub Copilot` y `Copilot Chat` para generación y revisión de código.
- `Project Manager` para acceder rápido a carpetas y proyectos.
- `Todo Tree` para encontrar tareas y pendientes dentro de markdown y código.
- Markdown en el repo como flujo de trabajo: crea `todo.md`, `notes.md`, o usa los documentos existentes.

Abre la carpeta `/Users/user1/wenu-frontend` en VS Code y usa la terminal integrada (`Ctrl+` ``) para comandos.

Para una guía paso a paso, lee `docs/vscode-ia-workflow.md`.

## Aftercare

The `/aftercare` page and any `aftercare.*` deploy are handled in a separate workstream. Do not modify `public/aftercare/` from this branch.
