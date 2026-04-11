# Escribe — Build Progress

Cada paso es un **Minimum Testeable Increment (MTI)**: termina con algo que puedes abrir en el navegador y verificar que funciona.

## Status Legend
- ✅ Done
- 🚧 In Progress
- ⬜ To Do

---

## Phase 1 — Foundation

- ✅ **shadcn/ui instalado** → `npm run dev` muestra una página con un `<Button>` de shadcn renderizado
- ✅ **Root layout** → header con logo "Escribe" + fondo `stone-50` visible en todas las rutas
- ✅ **Nav + route stubs** → todos los links de navegación funcionan; cada ruta muestra una página mínima con su título

**Test manual al completar la fase:**
- [ ] `npm run dev` → abrir `http://localhost:3000`
- [ ] El header muestra "Escribe" en todas las rutas
- [ ] Los links "Dashboard" y "Experience Library" navegan correctamente
- [ ] El fondo de la página es `stone-50` (gris cálido, no blanco puro)
- [ ] El botón "Add Job Offer" en el Dashboard tiene el estilo de shadcn

---

## Phase 2 — Dashboard & Job Offers

- ✅ **Tipos del dominio + mock data** → `getMockJobs()` existe y devuelve datos; verificable renderizando tarjetas en `/`
- ✅ **Dashboard renderiza lista de jobs** → `/` muestra tarjetas de Job Offers con título, empresa y badge de estado
- ✅ **Navegar a Add Job Offer** → el botón "Add Job Offer" lleva a `/jobs/new`
- ✅ **Formulario Add Job Offer renderiza** → `/jobs/new` muestra el formulario con campos de título, empresa y descripción
- ✅ **Submit añade job y redirige** → al enviar el formulario, el nuevo job aparece en el Dashboard

**Test manual al completar la fase:**
- [ ] El Dashboard muestra al menos 2 job cards con título, empresa y badge de estado
- [ ] El badge de estado tiene el color correcto (emerald = Done, amber = In Progress, stone = To Do)
- [ ] Clicar "Add Job Offer" navega a `/jobs/new`
- [ ] El formulario tiene campos de título, empresa y descripción
- [ ] Rellenar el formulario y enviar → el nuevo job aparece en el Dashboard

---

## Phase 3 — Key Interview Themes

- ✅ **Navegar a Themes desde Dashboard** → clicar un job lleva a `/jobs/:jobId/themes`
- ✅ **Lista de themes renderiza** → la página muestra themes mockeados con nombre y badge de estado (To Do / In Progress / Done)
- ✅ **Mock AI genera themes al crear job** → al añadir un job, los themes se generan automáticamente con datos mockeados

**Test manual al completar la fase:**
- [ ] Clicar un job card en el Dashboard navega a su página de themes
- [ ] La página muestra el nombre del job en el título
- [ ] Los themes aparecen en lista con nombre, descripción y badge de estado
- [ ] Hay al menos un theme en cada estado (To Do, In Progress, Done)
- [ ] Crear un nuevo job → al redirigir al Dashboard, el job ya tiene themes generados

---

## Phase 4 — Writing Assistant

- ✅ **Layout split-screen renderiza** → `/jobs/:jobId/themes/:themeId` muestra el panel izquierdo (chat) y derecho (editor) en pantalla completa
- ✅ **Editor de texto funciona** → el usuario puede escribir en el panel derecho
- ✅ **Chat renderiza mensajes** → el panel izquierdo muestra mensajes de usuario y respuestas mockeadas de la IA
- ✅ **Cover Letter writer funciona** → `/jobs/:jobId/cover-letter` abre el Writing Assistant con contexto de Cover Letter
- ✅ **CV writer funciona** → `/jobs/:jobId/cv` abre el Writing Assistant con contexto de CV

**Test manual al completar la fase:**
- [ ] Abrir un theme → layout split-screen ocupa toda la pantalla (sin scroll vertical)
- [ ] Escribir en el editor → el texto aparece correctamente
- [ ] Enviar un mensaje en el chat → aparece la respuesta mockeada de la IA
- [ ] Abrir `/jobs/:jobId/cover-letter` → el Writing Assistant carga con contexto "Cover Letter"
- [ ] Abrir `/jobs/:jobId/cv` → el Writing Assistant carga con contexto "Tailored CV"

---

## Phase 5 — Experience Library

_Deferred — pages are stubs only._

- ⬜ **Library renderiza lista global** → `/experience` muestra todas las experiencias escritas
- ⬜ **Experience writer funciona** → `/experience/:experienceId` abre el Writing Assistant en contexto de librería
- ⬜ **Sugerencias de reutilización** → al generar themes, la IA sugiere experiencias existentes que encajan

**Test manual al completar la fase:**
- [ ] `/experience` muestra todas las experiencias guardadas con título y fecha
- [ ] Clicar una experiencia abre el Writing Assistant en contexto de librería
- [ ] Crear un job nuevo → en la página de themes aparece una sugerencia de reutilización para al menos un theme

---

## Phase 6 — Polish

- ⬜ **Empty states** → cada pantalla muestra un estado vacío útil cuando no hay datos
- ⬜ **Error states** → formularios muestran errores de validación
- ✅ **Persistencia** → jobs y experiencias persisten en PostgreSQL (implementado en Phase 7)

**Test manual al completar la fase:**
- [ ] Dashboard sin jobs → mensaje de empty state visible y útil
- [ ] Intentar enviar el formulario vacío → aparecen mensajes de error en los campos

---

## Phase 6 — Real AI Integration

- ✅ **NestJS recibe mensajes de chat** → `POST /api/chat` acepta `{ message, context }` y devuelve una respuesta de texto
- ✅ **OpenRouter integrado** → el backend llama a OpenRouter con el mensaje del usuario y devuelve la respuesta real de la IA
- ✅ **Writing Assistant usa el endpoint real** → el frontend llama a `/api/chat` en vez de devolver la respuesta mockeada
- ✅ **Análisis de job al crear** → `POST /api/jobs` recibe el texto del job description y devuelve título, empresa y lista de themes generados por IA

**Test manual al completar la fase:**
- [x] Enviar un mensaje en el Writing Assistant → la respuesta viene de la IA real (no del mock)
- [x] Crear un job pegando un job description real → el título, empresa y themes los genera la IA
- [x] Los themes tienen sentido para el rol descrito

---

## Phase 7 — Backend + PostgreSQL

- ✅ **Docker + PostgreSQL corriendo** → `npm run dev` arranca el contenedor automáticamente
- ✅ **NestJS CRUD API para jobs, themes y experiences** → endpoints REST completos
- ✅ **Frontend services apuntan al backend** → `fetch('/api/...')` reemplaza localStorage
- ✅ **Add Job Flow rebuildeado** → dialog en Dashboard + spinner "Analysing..." + navega directamente a themes page

**Test manual al completar la fase:**
- [x] `npm run dev` → PostgreSQL arranca en Docker automáticamente
- [x] Crear un job → persiste en base de datos tras recargar la página
- [x] Themes se cargan desde la API (verificable con network tab)

---

## Phase 8 — Relevant Experience & Base CV

- ✅ **Relevant Experience auto-save** → el editor en `/jobs/:jobId/themes/:themeId` guarda automáticamente en el backend con debounce; muestra estado "Saved"
- ✅ **Base CV pre-fill** → al abrir `/jobs/:jobId/cv` sin CV tailoreado, el editor se pre-rellena con el base CV del usuario
- ✅ **Base CV en contexto de IA** → el chat en la página de CV recibe el base CV como contexto para dar respuestas más relevantes
- ✅ **View CV** → el menú de usuario muestra "View CV" cuando hay un CV subido; abre una nueva pestaña en `/cv/view`

**Test manual al completar la fase:**
- [ ] Subir un `.md` CV via UserMenu "Upload CV"
- [ ] Abrir CV page de un job (sin tailored CV) → editor pre-relleno con base CV
- [ ] Abrir CV page de un job (con tailored CV guardado) → editor muestra tailored CV
- [ ] Chatear en CV page ("What should I emphasise?") → respuesta de IA hace referencia al CV
- [ ] View CV aparece en menú sólo cuando hay CV subido; abre nueva pestaña correctamente

---

## Criterio MTI

Un paso está **Done** cuando:
1. Se puede abrir en el navegador
2. El comportamiento descrito funciona sin errores en consola
3. No depende de pasos futuros para tener sentido visualmente
4. Hay un test Playwright en `frontend/e2e/` que lo cubre y pasa (`npm run test:e2e`)
