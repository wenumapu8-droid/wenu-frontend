# VS Code + IA Workflow

Este archivo explica cómo usar este repo en VS Code como tu centro de trabajo con IA y gestión de tareas.

## 1. Abrir el proyecto

1. En VS Code, selecciona `File > Open Folder...`.
2. Abre la carpeta del proyecto: `/Users/user1/wenu-frontend`.
3. Confirma que ves:
   - `package.json`
   - `README.md`
   - `src/`
   - `docs/`
   - `.vscode/`

## 2. Extensiones recomendadas

Instala estas extensiones desde el panel de Extensiones (`⌘+Shift+X`):

- `GitHub Copilot`
- `Copilot Chat`
- `Project Manager` (alefragnani.project-manager)
- `Todo Tree` (Gruntfuggly.todo-tree)
- `Markdown All in One` (yzhang.markdown-all-in-one)

También se recomienda `astro-build.astro-vscode` si trabajas con Astro.

## 3. Terminal integrada

Abre la terminal integrada con `Control+` ``.

Comandos útiles:

```bash
cd /Users/user1/wenu-frontend
nvm use
npm install
npm run dev
```

## 4. Usar IA dentro de VS Code

### GitHub Copilot

- Activa sugerencias de código mientras editas.
- Acepta con `Tab` o `Enter`.

### Copilot Chat

- Abre el panel de chat de Copilot.
- Pregunta directamente sobre el código o tareas: por ejemplo:
  - “¿Cómo arreglo este error en `src/pages/shop.astro`?”
  - “Describe el propósito de `src/lib/woo.ts`.”

## 5. Gestión de trabajo en el repo

### Usa `Todo Tree`

- Busca `TODO`, `FIXME`, `NOTE` y marcadores en todo el proyecto.
- Ideal para encontrar tareas pendientes dentro de archivos Markdown y código.

### Usa `Project Manager`

- Guarda este repositorio como proyecto.
- Navega rápido entre varios workspaces si trabajas en más de un proyecto.

### Usa Markdown como tablero

Puedes crear un archivo de tareas simple en el repo como `todo.md`, por ejemplo:

```md
# TODO

- [ ] Instalar extensiones de VS Code
- [ ] Configurar Copilot Chat
- [ ] Revisar `README.md` y `docs/`
- [ ] Ejecutar `npm run dev` localmente
```

## 6. Qué puedo hacer aquí

Puedo ayudarte a:

- revisar o editar archivos en este repo
- crear documentos de procesos y flujos de trabajo
- generar o mejorar `todo.md` y listas de tareas
- preparar guías de instalación o acciones concretas

## 7. Límites de este entorno

- No puedo conectarme a servicios externos ni iniciar sesión en otras plataformas.
- Solo puedo operar sobre los archivos del workspace abierto en VS Code.
- No puedo ejecutar cambios fuera de este proyecto ni acceder a cuentas externas.

## 8. Siguiente paso recomendado

1. Instala las extensiones sugeridas.
2. Crea un archivo `todo.md` si quieres un tablero rápido.
3. Usa Copilot Chat para preguntar sobre cualquier componente o tarea.

> Si quieres, puedo crear un `todo.md` aquí mismo en el repo y organizarlo con las tareas más importantes.
