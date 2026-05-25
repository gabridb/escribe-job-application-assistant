# Escribe — Build Progress

Improvements / known issues:

- Para escribir la cl, se envía todas las relevantExperiences al llm. Un agente tendría primero que resumirlas si quiero que sea más corto
- Bug: the pencil (edit) icon in the Dashboard Actions column is not visible — the edit-job-metadata feature works but the affordance is missing
- Cover Letter chat opens with a generic "Hello! I'm your AI writing assistant…" greeting that gives the user no starting point. The first message should be task-aware — e.g. reference the specific job/company and suggest a concrete next step (the "Draft a first version" button already exists, so the greeting should complement it, not duplicate it).
- AI-generated cover letters need visible spacing between paragraphs in the editor (currently paragraphs render too close together — either tweak the editor's paragraph margin or ensure the AI output produces blank lines that Tiptap renders with proper vertical rhythm).
- "Write Cover Letter" and "Tailor CV" should be a single continuous flow, not two separate destinations from the Job Overview page. After finishing the cover letter the user should be guided straight into tailoring the CV (or vice versa) without having to navigate back to Job Overview and pick the other CTA.

---

## Done: Diff system for AI suggestions

Implemented in commit `0ad4038` — when the AI returns a rewrite, the editor now shows a **word-level inline diff** (green = added, red struck-through = deletion) with an Accept/Reject bar instead of silently overwriting the user's draft. Auto-save is paused and chat is disabled while a diff is pending. If the AI replaces more than ~80% of the document, the editor shows the proposed content with a "Full document replaced" banner instead of noisy mark-up.

This corresponds to **Option B (Inline tracked changes)** from the original deferred plan, made tractable by adopting Tiptap as the rich text editor (custom InsertionMark / DeletionMark extensions + the `diff` package).

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

## Phase 9 — Cover Letter

- ✅ **Cover Letter persistence** → `GET /api/jobs/:jobId/cover-letter` returns saved text; `PUT` saves it
- ✅ **Cover Letter auto-save** → typing in the editor triggers a debounced save (shows "Saved" indicator)
- ✅ **Cover Letter AI prompt** → chat uses a specialised system prompt with job description, base CV, and all relevant experiences as context
- ✅ **AI writes into editor via `<editor_content>` tags** → AI-generated drafts are routed straight into the editor instead of staying in chat

**Test manual al completar la fase:**

- [ ] Navigate to `/jobs/:jobId/cover-letter` → editor loads (empty if no cover letter saved yet)
- [ ] Type in the editor → "Saved" indicator appears after ~1.5 s
- [ ] Reload the page → typed text is still there
- [ ] Send a chat message ("Help me write an opening paragraph") → AI response references the specific job

---

## Phase 10 — Edit Job Metadata

- ✅ **PATCH `/api/jobs/:id`** → backend accepts partial updates of title and company
- ✅ **Edit dialog from Dashboard** → pencil icon on each job row opens a pre-filled dialog to edit title and company

**Test manual al completar la fase:**

- [ ] Click the pencil icon on a job row → dialog opens pre-filled with current title and company
- [ ] Edit the company and save → the row in the dashboard reflects the new value immediately
- [ ] Reload → the change persists

---

## Phase 11 — Tailored CV

- ✅ **CV writer pulls full job context** → fetches job description and all relevant experiences and passes them to the chat prompt
- ✅ **Dedicated tailored-cv prompts module** → `tailored-cv.prompts.ts` builds the system prompt for CV-specific guidance (separate from generic chat prompts)
- ✅ **"Tailor my CV for this role" auto-write** → one-click button generates a first draft directly into the editor

**Test manual al completar la fase:**

- [ ] Open `/jobs/:jobId/cv` for a job with relevant experiences saved → click the auto-write button → editor populates with a tailored first draft
- [ ] Chat in the CV page ("emphasise leadership") → the response references the actual job description, not generic advice

---

## Phase 12 — Smart Experience Matching

- ✅ **Auto-match similar experiences when opening Writing Assistant** → if a theme has no saved experience, the backend compares the theme against all existing experiences with an LLM and pre-populates the editor with the closest match
- ✅ **Chat explains the source** → the assistant's first message explains where the matched story came from so the user can adapt it
- ✅ **One-retry fallback for transient `ECONNRESET`** → makes the chat resilient to flaky OpenRouter connections

**Test manual al completar la fase:**

- [ ] Write an experience for one theme, then open another theme with similar wording → editor pre-populates with the matched story and chat explains the match
- [ ] Open a theme with no matching prior experience → editor stays empty, chat starts from the standard greeting

---

## Phase 13 — Rich Text Editor + Inline AI Diffs

- ✅ **Tiptap rich text editor** → replaces the plain `<textarea>` with a Tiptap-backed editor (Bold / Italic / Heading / List toolbar, markdown-backed persistence, placeholder support)
- ✅ **AI-generated content lands in the editor as Markdown** → cover-letter and tailored-CV prompts ask the AI to return Markdown inside `<editor_content>` tags
- ✅ **Inline AI diff highlighting with Accept/Reject** → AI rewrites are shown as a word-level diff (green = added, red struck-through = removed) with an Accept/Reject bar
- ✅ **"Full document replaced" banner** → when the AI replaces more than ~80% of the document, the editor shows the proposed content with a banner instead of noisy mark-up
- ✅ **Auto-save and chat input disabled while a diff is pending** → prevents racing the user's review of the suggestion
- ✅ **Shared no-fabrication guardrail in chat** → tightened relevant-experience coaching prompt so the AI does not invent facts about the user

**Test manual al completar la fase:**

- [ ] Write a paragraph in the editor with bold and a bullet list → reload → formatting persists
- [ ] Ask the AI for a small rewrite → editor shows green/red diff with an Accept/Reject bar; auto-save indicator pauses
- [ ] Click Accept → diff marks disappear and the new text is saved
- [ ] Ask the AI for a full rewrite of a long document → "Full document replaced" banner appears with Accept/Reject

---

## Phase 14 — Simplified Application Flow

Plan: `Specs/plans/simplify-application-flow.md`

Goal: remove the "fill in every theme before doing useful work" friction. After adding a job the user lands on a new **Job Overview** page; the Cover Letter Writing Assistant becomes the primary work surface and uses themes internally to coach the conversation. Stories the user tells in chat can be saved into the Experience Library with one click (semi-automatic).

- ✅ **Backend: theme-aware cover-letter prompt** → `buildCoverLetterSystemPrompt` accepts a `themes` argument (with `hasExperience` flag); when uncovered themes exist, the system prompt instructs the AI to coach the user around them and to wrap candidate STAR stories in `<experience_candidate theme="...">` tags
- ✅ **Frontend: cover-letter writer passes themes-with-coverage** → fetches each theme's experience status alongside the cover letter and forwards the list to `/api/chat`
- ✅ **Frontend: experience-candidate card in chat** → chat parses `<experience_candidate>` tags from AI replies, strips them from the visible message, and renders an inline Save / Dismiss card; Save calls the existing experience endpoint
- ✅ **Frontend: new Job Overview page** → `/jobs/:jobId` shows title, company, themes summary and three CTAs (Cover Letter / Tailor CV / Interview themes); `useNewJob` and `NewJobDialog` redirect here instead of `/themes`; Dashboard row title links to Job Overview

**Test manual al completar la fase:**

- [ ] Crear un job nuevo desde el Dashboard → la URL final es `/jobs/:jobId` (Job Overview), no `/jobs/:jobId/themes`
- [ ] La Job Overview muestra título, empresa y los tres CTAs (Write Cover Letter, Tailor CV, Interview themes)
- [ ] Desde el Dashboard, el row del job lleva a la Job Overview (no a Themes directamente)
- [ ] En la Cover Letter de un job con themes sin experiencia escrita, el AI saca a colación una de esas competencias de forma natural
- [ ] Contar una historia STAR en el chat → aparece una tarjeta inline "Save as reusable experience for [theme]?" con Save / Dismiss
- [ ] Clicar Save → la experiencia aparece en `/experience` y queda asociada al theme correcto
- [ ] Clicar Dismiss → la tarjeta desaparece sin llamadas al backend
- [ ] La ruta `/jobs/:jobId/themes` sigue accesible desde Job Overview y funciona como antes

---

## Phase 15 — LinkedIn Job Auto-Discovery

Goal: remove the copy-paste step. Instead of pasting a job description into "Add Job Offer", the user configures a search profile (keywords, location, seniority, remote/onsite) and the app pulls matching opportunities from `linkedin.com/jobs` on a schedule, presents them in a **Discover** inbox, and lets the user one-click "Add to Dashboard" to kick off the existing analysis pipeline.

- ⬜ **Backend: LinkedIn search profile entity + CRUD** → `SearchProfile` (keywords, location, seniority, remote flag, isActive); `GET/POST/PATCH/DELETE /api/search-profiles`
- ⬜ **Backend: LinkedIn scraper service** → fetches the public LinkedIn jobs search page for each active profile, parses job cards (title, company, location, posted date, jobUrl, descriptionSnippet); respects robots.txt and uses conservative rate limits with retry/backoff
- ⬜ **Backend: discovered-job entity + dedup** → `DiscoveredJob` keyed on LinkedIn jobId, status (`new` / `dismissed` / `imported`); upsert prevents duplicates across runs
- ⬜ **Backend: scheduled scan job** → NestJS `@Cron` runs every N hours, iterates active profiles, persists new `DiscoveredJob` rows; manual trigger via `POST /api/search-profiles/:id/scan`
- ⬜ **Backend: hydrate full description on import** → when the user imports a discovered job, fetch the full description from the LinkedIn job URL and feed it into the existing `POST /api/jobs` pipeline (metadata + themes)
- ⬜ **Frontend: `/discover` inbox page** → list of `DiscoveredJob` cards (title, company, location, posted, snippet) with **Add to Dashboard** / **Dismiss** actions; filter by profile; badge in nav with new-count
- ⬜ **Frontend: `/settings/search-profiles` page** → create/edit/delete search profiles; toggle active; "Scan now" button per profile
- ⬜ **Frontend: Dashboard CTA** → "Discover jobs" button next to "Add Job Offer" that links to `/discover`

**Test manual al completar la fase:**

- [ ] Crear un search profile (keywords "product manager", location "Madrid", remote on) → "Scan now" → al menos un `DiscoveredJob` aparece en `/discover`
- [ ] El badge en el nav muestra el número de jobs nuevos
- [ ] Clicar **Add to Dashboard** → el job se importa, la descripción completa se baja de LinkedIn, y aparece en el Dashboard con themes generados (igual que copy-paste)
- [ ] Clicar **Dismiss** → la tarjeta desaparece de `/discover` y no vuelve en el siguiente scan
- [ ] Correr "Scan now" dos veces seguidas → la segunda vez no duplica jobs ya descubiertos
- [ ] Editar un search profile → el siguiente scan usa los nuevos criterios
- [ ] Desactivar un search profile → el scheduled scan lo ignora

**Riesgos / preguntas abiertas:**

- LinkedIn ToS prohibe scraping; explorar la API oficial (LinkedIn Talent Solutions, requires partner approval) o un proveedor third-party (e.g. Apify, Bright Data) antes de implementar scraping directo
- Manejo de cookies / login walls — la búsqueda pública funciona sin login pero el detalle suele requerirlo; evaluar si almacenar sesión del usuario o limitar al snippet

---

## Polish

- ✅ **Bunny logo + favicon** → header logo and favicon
- ✅ **Inter Tight + JetBrains Mono fonts** → swapped from Geist for the body / mono pair

---

## Criterio MTI

Un paso está **Done** cuando:

1. Se puede abrir en el navegador
2. El comportamiento descrito funciona sin errores en consola
3. No depende de pasos futuros para tener sentido visualmente
4. Hay un test Playwright en `frontend/e2e/` que lo cubre y pasa (`npm run test:e2e`)
