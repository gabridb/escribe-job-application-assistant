# Frontend Documentation

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, shadcn/ui

---

## Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Dashboard — list of job offers |
| `/jobs/new` | `app/jobs/new/page.tsx` | Add new job offer |
| `/jobs/:jobId/themes` | `app/jobs/[jobId]/themes/page.tsx` | Key Interview Themes for a job |
| `/jobs/:jobId/themes/:themeId` | `app/jobs/[jobId]/themes/[themeId]/page.tsx` | Relevant Experience writing assistant |
| `/jobs/:jobId/cv` | `app/jobs/[jobId]/cv/page.tsx` | Tailored CV writing assistant |
| `/jobs/:jobId/cover-letter` | `app/jobs/[jobId]/cover-letter/page.tsx` | Cover Letter writing assistant |
| `/experience` | `app/experience/page.tsx` | Experience Library (global) |
| `/experience/:experienceId` | `app/experience/[experienceId]/page.tsx` | Individual experience writer |
| `/cv/view` | `app/cv/view/page.tsx` | View uploaded base CV |

All pages are **Server Components** by default. Interactive parts are extracted into Client Components.

---

## Components

### `app/components/writing-assistant.tsx`

Shared split-pane UI used by all writing flows (relevant experience, CV, cover letter).

**Props:**
```typescript
{
  context: WritingContext           // 'relevant-experience' | 'cover-letter' | 'cv'
  jobId?: string
  themeId?: string
  title: string
  subtitle?: string
  initialContent?: string          // pre-loaded text for the editor
  onSave: (text: string) => void   // called after 1.5s auto-save debounce
}
```

**Layout:** 40% chat panel (left) / 60% rich text editor (right)

**Features:**
- Real-time AI chat powered by `useWritingAssistant` hook
- 1.5s debounced auto-save on editor changes
- Suggested quick-reply buttons (e.g. "Review my draft")

---

### `app/components/new-job-dialog.tsx`

Modal dialog for adding a new job offer.

**Props:** `{ open: boolean, onOpenChange: (open: boolean) => void }`

**Features:**
- Textarea for pasting job description text
- File upload (reads file content via FileReader API)
- Delegates to `useNewJob` hook

---

### `app/components/user-menu.tsx`

Dropdown header menu for CV management.

**Features:**
- Upload CV (reads file via FileReader, saves via `cvService.save()`)
- Navigate to `/cv/view`

---

### `app/jobs-list.tsx`

Client Component on the dashboard that renders the jobs table.

**Features:**
- Delete job (calls `jobsService.delete()`, updates `JobsContext`)
- Navigate to Themes, CV, Cover Letter per job
- Uses `useJobs` context

---

### Writing Assistant page components

Each writing assistant route has its own thin client wrapper that fetches data and renders `WritingAssistant`:

| File | Context | Data fetched | Save method |
|------|---------|-------------|-------------|
| `app/jobs/[jobId]/themes/[themeId]/relevant-experience-writing-assistant.tsx` | `relevant-experience` | experience text + initial greeting | `relevantExperienceService.upsert()` |
| `app/jobs/[jobId]/cv/cv-writing-assistant.tsx` | `cv` | tailored CV or base CV | `tailoredCvService.upsert()` |
| `app/jobs/[jobId]/cover-letter/` | `cover-letter` | — | — |

---

## Hooks

### `app/components/hooks/use-writing-assistant.ts`

Manages all state and side-effects for the writing assistant UI.

```typescript
function useWritingAssistant(
  context: WritingContext,
  initialGreeting: string,
  jobDescription?: string,
  themeName?: string,
  themeDescription?: string,
  initialContent?: string,
  baseCvText?: string
)
```

**Returns:**
| Field | Type | Description |
|-------|------|-------------|
| `messages` | `Message[]` | Chat history |
| `input` | `string` | Current chat input value |
| `setInput` | `fn` | Update input |
| `editorContent` | `string` | Current editor text |
| `setEditorContent` | `fn` | Update editor text |
| `sendMessage` | `async fn` | Send `input` as a user message |
| `sendPredefinedMessage` | `async fn` | Send a quick-reply string as a user message |
| `isLoading` | `boolean` | True while awaiting AI response |

**AI call:** POSTs to `/api/chat` (Next.js server route) via `sendChatMessage()`. The server route forwards to the NestJS backend.

---

### `app/jobs/new/hooks/use-new-job.ts`

Handles job creation form state and submission.

```typescript
function useNewJob(onSuccess?: (jobId: string) => void)
```

**Returns:** `{ description, setDescription, handleSubmit, isLoading }`

**Flow on submit:**
1. Calls `jobsService.create(description)` → backend analyzes description, returns `Job + Theme[]`
2. Adds job to `JobsContext`
3. Adds themes to `ThemesContext`
4. Calls `onSuccess(jobId)` or navigates to `/jobs/:jobId/themes`

---

## Contexts

All contexts live in `app/context/`. They are initialized with server-fetched data in `app/layout.tsx` and hydrate client state.

### `app/context/jobs-context.tsx`

```typescript
interface JobsContextValue {
  jobs: Job[]
  addJob: (job: Job) => void
  updateJob: (id: string, patch: Partial<Job>) => void
  deleteJob: (id: string) => Promise<void>  // calls jobsService.delete()
}
```

Initialized with `initialJobs: Job[]` from server.

---

### `app/context/themes-context.tsx`

```typescript
interface ThemesContextValue {
  themes: Theme[]
  addThemes: (themes: Theme[]) => void
  loadThemes: (themes: Theme[]) => void       // replaces themes for a given jobId
  updateThemeStatus: (id: string, status: ThemeStatus) => Promise<void>
                                              // calls PATCH /api/themes/:id
}
```

`ThemeStatus`: `'todo' | 'in-progress' | 'done'`

---

## Services (`frontend/lib/services/`)

Thin wrappers over the backend API. All use `NEXT_PUBLIC_API_URL` (default `http://localhost:3001`) as base URL.

### `jobs-service.ts`

| Method | HTTP | Endpoint | Description |
|--------|------|----------|-------------|
| `getAll()` | GET | `/api/jobs` | List all jobs |
| `getOne(id)` | GET | `/api/jobs/:id` | Get single job |
| `create(description)` | POST | `/api/jobs` | Create job; backend returns `Job + Theme[]` |
| `delete(id)` | DELETE | `/api/jobs/:id` | Delete job |

---

### `chat-service.ts`

```typescript
interface ChatPayload {
  messages: ChatMessage[]
  context: 'relevant-experience' | 'cover-letter' | 'cv'
  jobDescription?: string
  themeName?: string
  themeDescription?: string
  editorContent?: string
  baseCvText?: string
}

async function sendChatMessage(payload: ChatPayload): Promise<string>
// POSTs to /api/chat (Next.js route → NestJS backend)
```

---

### `cv-service.ts`

| Method | HTTP | Endpoint | Description |
|--------|------|----------|-------------|
| `get()` | GET | `/api/cv` | Get uploaded base CV (or null) |
| `save(name, text)` | POST | `/api/cv` | Upload/replace CV |
| `remove()` | DELETE | `/api/cv` | Delete CV |

---

### `tailored-cv-service.ts`

| Method | HTTP | Endpoint | Description |
|--------|------|----------|-------------|
| `get(jobId)` | GET | `/api/jobs/:jobId/cv` | Get tailored CV (falls back to base CV) |
| `upsert(jobId, text)` | PUT | `/api/jobs/:jobId/cv` | Create or update tailored CV |

---

### `relevant-experience-service.ts`

| Method | HTTP | Endpoint | Description |
|--------|------|----------|-------------|
| `get(jobId, themeId)` | GET | `/api/jobs/:jobId/themes/:themeId/experience` | Get experience text + initial greeting |
| `upsert(jobId, themeId, text)` | PUT | `/api/jobs/:jobId/themes/:themeId/experience` | Create or update experience |

---

## Type Definitions (`frontend/lib/mock/`)

```typescript
// jobs.ts
type JobStatus = 'active' | 'archived'
interface Job {
  id: string
  title: string
  company: string
  description: string
  status: JobStatus
  createdAt: string
}

// themes.ts
type ThemeStatus = 'todo' | 'in-progress' | 'done'
interface Theme {
  id: string
  jobId: string
  name: string
  description: string
  status: ThemeStatus
}
```

---

## Architecture Rules

- **Pages are Server Components** — they fetch data and pass it as props
- **`'use client'` boundary pushed as far down as possible** — only interactive parts are Client Components
- **Client Components are named descriptively** (e.g. `jobs-list.tsx`, `themes-list.tsx`) — never a `-client` suffix
- **State and handlers extracted into hooks** — keeps components thin
- **No localStorage for domain data** — all persistence goes through backend API
