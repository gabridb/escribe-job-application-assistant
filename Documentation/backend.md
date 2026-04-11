# Backend Documentation

Stack: NestJS 11, TypeScript, TypeORM 0.3, PostgreSQL

Entry point: `backend/src/main.ts`
- Global API prefix: `/api`
- CORS enabled for `http://localhost:3000`
- Default port: `3001`

---

## Module Overview

```
AppModule
├── ConfigModule          (env vars)
├── TypeOrmModule         (PostgreSQL)
├── JobsModule
├── ThemesModule
├── CvModule
├── TailoredCvModule
├── RelevantExperienceModule
└── ChatModule
```

---

## Jobs Module (`backend/src/jobs/`)

### Controller — `jobs.controller.ts`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/api/jobs` | `findAll()` | List all jobs ordered by `createdAt DESC` |
| GET | `/api/jobs/:id` | `findOne(id)` | Get single job; throws `404` if not found |
| POST | `/api/jobs` | `create(description)` | Analyze description, create job + themes |
| DELETE | `/api/jobs/:id` | `remove(id)` | Delete job and cascade-delete its themes |

---

### Service — `jobs.service.ts`

**`findAll(): Promise<Job[]>`**
Returns all jobs ordered by `createdAt DESC`.

**`findOne(id): Promise<Job | null>`**
Returns a single job by UUID.

**`createJob(description): Promise<Job & { themes: Theme[] }>`**

Full creation flow:
1. Calls private `analyzeJob(description)` — sends to OpenRouter, parses JSON
2. Creates `Job` entity (`status = 'active'`)
3. Creates `Theme` entities for each extracted theme
4. Saves all and returns job with themes array

Falls back to default title/company if AI call or JSON parsing fails.

**`deleteJob(id): Promise<void>`**
Deletes the job; TypeORM cascade removes related themes, tailored CV, and relevant experiences.

**`analyzeJob(description): Promise<AnalyzeJobResult>` (private)**

Calls OpenRouter with `buildAnalyzeJobPrompt()` and parses:
```typescript
interface AnalyzeJobResult {
  title: string
  company: string
  themes: { name: string; description: string }[]
}
```

---

### Prompts — `jobs.prompts.ts`

```typescript
const ANALYZE_JOB_MODEL = 'meta-llama/llama-3.1-8b-instruct'

function buildAnalyzeJobPrompt(description: string): string
```

Instructs the model to return a JSON object containing:
- `title` — job title
- `company` — company name
- `themes` — array of 3–5 key interview competencies, each with `name` and `description`

---

## Themes Module (`backend/src/themes/`)

### Controller — `themes.controller.ts`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/api/jobs/:jobId/themes` | `findByJob(jobId)` | List themes for a job |
| PATCH | `/api/themes/:id` | `updateStatus(id, status)` | Update theme status |

---

### Service — `themes.service.ts`

**`findByJob(jobId): Promise<Theme[]>`**
Returns all themes where `theme.jobId = jobId`.

**`updateStatus(id, status): Promise<Theme>`**
Updates the theme's `status` field. Throws `NotFoundException` if theme not found.

Status values: `'todo' | 'in-progress' | 'done'`

---

## CV Module (`backend/src/cv/`)

Single-document store — only one base CV exists at a time.

### Controller — `cv.controller.ts`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/api/cv` | `get()` | Get current CV (or null) |
| POST | `/api/cv` | `save(name, text)` | Replace CV (deletes previous) |
| DELETE | `/api/cv` | `remove()` | Delete CV |

---

### Service — `cv.service.ts`

**`get(): Promise<CvDocument | null>`**
Returns first `CvDocument` row, or `null`.

**`save(name, text): Promise<CvDocument>`**
1. Deletes all existing `CvDocument` rows
2. Creates and saves a new one

**`remove(): Promise<void>`**
Deletes all `CvDocument` rows.

---

## Tailored CV Module (`backend/src/tailored-cv/`)

One tailored CV per job (enforced by unique constraint on `jobId`).

### Controller — `tailored-cv.controller.ts`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/api/jobs/:jobId/cv` | `getByJob(jobId)` | Get tailored CV for job |
| PUT | `/api/jobs/:jobId/cv` | `upsert(jobId, text)` | Create or update tailored CV |

---

### Service — `tailored-cv.service.ts`

**`getByJob(jobId): Promise<TailoredCv | null>`**
Returns the `TailoredCv` for the given job.

**`upsert(jobId, text): Promise<TailoredCv>`**
If a record exists for `jobId`: updates `text`.
If not: creates a new `TailoredCv`.

---

## Relevant Experience Module (`backend/src/relevant-experience/`)

One experience entry per theme (enforced by unique constraint on `themeId`).

### Controller — `relevant-experience.controller.ts`

| Method | Route | Handler | Description |
|--------|-------|---------|-------------|
| GET | `/api/jobs/:jobId/themes/:themeId/experience` | `get(themeId)` | Get experience text + initial AI greeting |
| PUT | `/api/jobs/:jobId/themes/:themeId/experience` | `upsert(themeId, text)` | Create or update experience |

---

### Service — `relevant-experience.service.ts`

**`getByTheme(themeId): Promise<ExperienceResponse>`**
1. Fetches `RelevantExperience` and `Theme` in parallel
2. Returns `{ text, initialGreeting }` where `initialGreeting` is built by `buildInitialGreeting()`

```typescript
interface ExperienceResponse {
  text: string
  initialGreeting: string
}
```

**`upsert(themeId, text): Promise<RelevantExperience>`**
If a record exists for `themeId`: updates `text`.
If not: creates a new `RelevantExperience`.

---

### Prompts — `relevant-experience.prompts.ts`

```typescript
const RELEVANT_EXPERIENCE_MODEL = 'anthropic/claude-opus-4-6'

function buildInitialGreeting(themeName: string, hasContent: boolean): string
```
- No content → prompts user to share a rough draft using the STAR framework
- Has content → generic greeting

```typescript
function buildRelevantExperienceSystemPrompt(
  theme: { name: string; description: string },
  editorContent: string,
  jobDescription?: string
): string
```
- Has draft → STAR framework critique prompt (Situation / Task / Action / Result)
- No draft → STAR framework coaching prompt guiding the user through each stage

---

## Chat Module (`backend/src/chat/`)

Single endpoint that routes to the correct system prompt based on context.

### Controller — `chat.controller.ts`

**POST `/api/chat`**

Request body:
```typescript
{
  messages: { role: string; content: string }[]
  context: 'relevant-experience' | 'cover-letter' | 'cv'
  jobDescription?: string
  themeName?: string
  themeDescription?: string
  editorContent?: string
  baseCvText?: string
}
```

Context routing:

| `context` | System prompt | Model |
|-----------|--------------|-------|
| `relevant-experience` | `buildRelevantExperienceSystemPrompt()` | `claude-opus-4-6` |
| `cv` | `buildCvSystemPrompt()` | `llama-3.1-8b-instruct` |
| `cover-letter` | `buildGenericSystemPrompt()` | `llama-3.1-8b-instruct` |

Response: `{ content: string }`

---

### Service — `chat.service.ts`

**`chat(messages, systemPrompt, model): Promise<string>`**

1. Reads `OPENROUTER_API_KEY` from config
2. POSTs to `https://openrouter.ai/api/v1/chat/completions`
3. Prepends `systemPrompt` as a `system` role message
4. Returns the assistant's reply string

---

### Prompts — `chat.prompts.ts`

```typescript
const GENERIC_MODEL = 'meta-llama/llama-3.1-8b-instruct'

function buildGenericSystemPrompt(): string
// "You are an AI writing assistant helping a job seeker improve their
//  application materials. Provide specific, actionable feedback. Keep
//  responses concise."

function buildCvSystemPrompt(baseCvText?: string, jobDescription?: string): string
// Includes base CV text and job description as context.
// Instructs assistant to help tailor the CV for the specific role.
```

---

## AI Integration (OpenRouter)

All AI calls go through `chat.service.ts` → OpenRouter API.

**Base URL:** `https://openrouter.ai/api/v1/chat/completions`
**Auth:** `Authorization: Bearer ${OPENROUTER_API_KEY}`

### Models in use

| Model ID | Used for |
|----------|----------|
| `meta-llama/llama-3.1-8b-instruct` | Job analysis, generic writing assistant, cover letter |
| `anthropic/claude-opus-4-6` | Relevant experience coaching (STAR framework) |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | — | Required for all AI features |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USERNAME` | `escribe` | PostgreSQL user |
| `DB_PASSWORD` | `escribe` | PostgreSQL password |
| `DB_NAME` | `escribe` | PostgreSQL database name |
| `PORT` | `3001` | NestJS server port |

---

## Prompt / Transport Decoupling Pattern

Every AI feature is split into two files:

| File | Responsibility |
|------|---------------|
| `*.prompts.ts` | Pure functions that build prompt strings. No NestJS, no HTTP, no side effects. |
| `*.service.ts` | Transport only — calls OpenRouter, returns parsed result. No prompt logic. |

This keeps prompt engineering isolated and independently testable with Jest unit tests.
