# Performance

Full: DPR 1.75, 60 FPS, persistence. Balanced: DPR 1.25, 30 FPS. Low-power: DPR 1, 24 FPS, sin persistence.

Reglas: un canvas hero activo, pausar con `document.hidden`, destruir al cambiar de escena, no actualizar DOM cada frame y no usar vídeo 4K simultáneamente en mobile.
