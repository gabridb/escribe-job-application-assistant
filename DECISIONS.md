# Decisiones — Escribe

## Guía de documentación

| Archivo | Para qué sirve |
|---------|---------------|
| `CLAUDE.md` | Instrucciones para Claude: stack, convenciones de código, patrones de arquitectura y restricciones de v1. Es lo primero que Claude lee al empezar a trabajar. |
| `Specs/PRD.md` | Especificación del producto: qué construir y por qué. Funcionalidades, flujos de usuario, sistema de diseño y alcance de v1. Es la fuente de verdad del producto. |
| `Specs/PROGRESS.md` | Tracker de construcción: qué está hecho, qué está en progreso y qué queda por hacer, organizado por fases. |
| `Specs/designs/` | Capturas de pantalla de los diseños de referencia. Consultar antes de construir cualquier pantalla. |
| `DECISIONS.md` | Este archivo. Registro de decisiones técnicas y de producto: qué se eligió, qué se descartó y por qué. Evita reabrir debates ya resueltos. |

---

## Registro de decisiones

### 2026-03-14 — Patrón de arquitectura frontend

**Decisión**: Server/Client Component split (Next.js App Router) + custom hooks.

**Descartado**: Container-View pattern (patrón legacy de React pre-hooks, no encaja con App Router).

**Razón**: App Router ya tiene una separación natural entre Server Components (datos) y Client Components (interactividad). Los custom hooks reemplazan los containers para la lógica del lado cliente.

---

### 2026-03-14 — Alcance de v1

**Decisión**: Solo frontend, sin backend real.

- IA mockeada — sin llamadas reales a la API de Claude
- Estado en memoria / localStorage — sin base de datos
- Input de texto plano — sin parseo de ficheros

**Razón**: Prioridad es construir y validar todas las pantallas e interacciones antes de integrar el backend.
