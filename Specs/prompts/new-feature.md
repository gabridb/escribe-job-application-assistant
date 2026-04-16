# Prompt: Planificar nueva feature con diagramas visuales

Copia este prompt en el chat y sustituye `[NOMBRE]` y `[DESCRIPCIÓN]` antes de enviarlo.

---

Quiero planificar la siguiente feature para Escribe:

**Feature:** [NOMBRE]
**Descripción:** [QUÉ HACE Y POR QUÉ]

## Instrucciones

Antes de escribir el plan, explora el código actual del repositorio para identificar con precisión qué archivos y componentes participarán en esta feature. No uses suposiciones — lee los archivos relevantes.

Genera el archivo `Specs/plans/[nombre-feature].md` con las siguientes secciones en este orden:

---

### Contexto

2-3 frases explicando por qué se construye esta feature y qué problema resuelve.

---

### Cómo encaja en la app

Diagrama `flowchart LR` mostrando el recorrido de extremo a extremo: Browser → Next.js → NestJS → PostgreSQL → OpenRouter (si aplica). Incluye solo los nodos que realmente participan en esta feature.

Después del diagrama: 2-4 frases en español sencillo explicando qué representa cada flecha. Nivel programador junior.

---

### Lo que verá el usuario

Diagrama `sequenceDiagram` con los pasos completos del flujo desde que el usuario hace algo hasta que ve el resultado. Incluye qué ocurre en frontend, qué llamadas van al backend, qué se guarda en base de datos y, si hay IA, qué devuelve.

Después del diagrama: lista numerada con una frase por paso explicando qué ocurre y por qué.

---

### Componentes React

Para cada ruta nueva o modificada, diagrama `graph TD` con el árbol de componentes. Etiqueta cada nodo como `[Server Component]`, `[Client Component]` o `[Hook]`.

Después del diagrama: una línea por componente explicando qué responsabilidad tiene.

---

### Módulos NestJS

Diagrama `graph LR` con los módulos NestJS que participan: Controller → Service → Repository → Entity. Si hay llamada a OpenRouter, muéstrala como nodo externo.

Después del diagrama: 2-3 frases explicando la diferencia entre controller, service y repository para alguien que los ve por primera vez.

---

### Base de datos

Si la feature crea o modifica entidades, diagrama `erDiagram` con las entidades afectadas y sus relaciones.

Si no hay cambios en el esquema, escribe explícitamente: _"Esta feature no modifica el esquema de base de datos."_

---

### Flujo de la IA

Solo si la feature incluye una llamada a OpenRouter: diagrama `sequenceDiagram` mostrando qué datos se inyectan en el prompt, cómo viaja la respuesta de vuelta (streaming o no) y dónde se renderiza en la UI.

Si no hay llamada a la IA, omite esta sección.

---

### Criterios de aceptación

Lista de checkboxes con todo lo que debe funcionar para dar la feature por hecha. Sé concreto — no pongas "funciona bien", pon "el usuario puede hacer X y ve Y".

---

### Archivos a crear o modificar

Tabla con tres columnas:

| Archivo | Acción | Por qué |
|---|---|---|

Lista solo los archivos reales identificados explorando el código. Acción puede ser: crear, modificar.

---

### Tests

**Playwright (E2E)** — tabla con: Ruta | Acción del usuario | Qué se debe verificar

**Jest (unit)** — tabla con: Función/método | Input de prueba | Output esperado

Si algún tipo de test no aplica según el CLAUDE.md del proyecto, indícalo con una frase.

---

### Verificación manual

Lista numerada de pasos para probar la feature en el navegador una vez implementada.
