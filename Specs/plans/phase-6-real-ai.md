# Phase 6 — Real AI: Job Analysis (Step 1)

## Context

Phases 1–5 delivered a complete frontend with mocked AI responses. This step activates real AI for **job analysis only**: when a user pastes a job description, the backend uses OpenRouter to extract the job title, company name, and 4 Key Interview Themes — replacing the current mock logic.

The Writing Assistant chat endpoint is deferred to a later step.

---

## Files to create / modify

### Backend (new files)
```
backend/src/
├── jobs/
│   ├── jobs.module.ts
│   ├── jobs.controller.ts        POST /api/analyze-job
│   ├── jobs.service.ts           calls OpenRouter (transport only)
│   └── jobs.prompts.ts           pure function: buildAnalyzeJobPrompt(description)
└── (modified) app.module.ts      imports JobsModule, ConfigModule
└── (modified) main.ts            enableCors(), setGlobalPrefix('api')
```

### Backend (config)
```
backend/.env                      OPENROUTER_API_KEY=<key>
```

### Frontend (modified files)
```
frontend/next.config.ts                                      rewrites: /api/* → localhost:3001/api/*
frontend/app/context/jobs-context.tsx                        add updateJob() method
frontend/app/jobs/new/hooks/use-new-job.ts                   submit minimal job, navigate to processing
frontend/app/jobs/[jobId]/processing/processing-screen.tsx   call /api/analyze-job, update context on response
```

---

## Architecture Pattern: Prompt / Transport Decoupling

Every backend AI feature follows this two-file split:

| File | Responsibility |
|------|---------------|
| `*.prompts.ts` | Pure functions that build prompt strings. No NestJS, no HTTP, no side effects. Easy to read, test, and iterate. |
| `*.service.ts` | Transport only — takes a ready-made prompt, calls OpenRouter, returns the parsed result. No prompt logic. |

---

## Step 1 — Backend config & setup

**`backend/.env`**
```
OPENROUTER_API_KEY=<your key>
```

**`backend/src/main.ts`** — add CORS + global prefix:
```ts
app.enableCors({ origin: 'http://localhost:3000' })
app.setGlobalPrefix('api')
await app.listen(3001)
```

Install:
```bash
cd backend && npm install @nestjs/config
```
(`fetch` is built into Node 18+, no axios needed)

**`backend/src/app.module.ts`** — import ConfigModule + JobsModule:
```ts
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  JobsModule,
]
```

---

## Step 2 — Analyze Job endpoint (`POST /api/analyze-job`)

**Request body**:
```json
{ "description": "Full job description text..." }
```

**Response**:
```json
{
  "title": "Senior Product Manager",
  "company": "Acme Corp",
  "themes": [
    { "name": "Stakeholder Management", "description": "..." },
    { "name": "Data-Driven Decision Making", "description": "..." },
    { "name": "Cross-functional Leadership", "description": "..." },
    { "name": "Product Strategy", "description": "..." }
  ]
}
```

**`jobs.prompts.ts`** — pure function + model constant:
```ts
export const ANALYZE_JOB_MODEL = 'mistralai/mistral-7b-instruct'

export function buildAnalyzeJobPrompt(description: string): string
```
Prompt tells the model to return ONLY valid JSON (title, company, themes[]).
The model constant lives here because the model and prompt are coupled — changing one often requires changing the other.

**`jobs.service.ts`** (transport only):
1. Call `buildAnalyzeJobPrompt(description)`
2. Call OpenRouter with `response_format: { type: 'json_object' }`
3. `JSON.parse()` the response; return sensible fallback if parsing fails

---

## Step 3 — Next.js proxy

**`frontend/next.config.ts`**:
```ts
async rewrites() {
  return [{ source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' }]
}
```
Frontend calls `/api/analyze-job` (same origin), Next.js forwards to `localhost:3001/api/analyze-job`. No CORS issues, no hardcoded backend URL in frontend code.

---

## Step 4 — Update `use-new-job.ts` + processing screen

**Current flow**:
1. `use-new-job.ts` creates a full job (title/company extracted from first lines) → adds mock themes → navigates to `/jobs/:id/processing`
2. Processing screen plays hardcoded animation → redirects to dashboard

**New flow**:
1. `use-new-job.ts` creates a minimal job (id + description only, placeholder title/company) → navigates to `/jobs/:id/processing`
2. Processing screen calls `POST /api/analyze-job` on mount with the job description
3. Steps animate as the API response arrives (not hardcoded timers)
4. On complete: `updateJob({ title, company })` + `addThemes(themes)` → navigate to dashboard

**`jobs-context.tsx`** — add one method:
```ts
updateJob(id: string, patch: Partial<Job>)  // merges patch into existing job
```

---

## Summary of all file changes

| File | Action | What changes |
|------|--------|-------------|
| `backend/.env` | Create | API key only |
| `backend/src/main.ts` | Modify | CORS + global prefix |
| `backend/src/app.module.ts` | Modify | Import JobsModule, ConfigModule |
| `backend/src/jobs/jobs.module.ts` | Create | Module definition |
| `backend/src/jobs/jobs.controller.ts` | Create | POST /analyze-job |
| `backend/src/jobs/jobs.service.ts` | Create | OpenRouter transport only |
| `backend/src/jobs/jobs.prompts.ts` | Create | Pure prompt builder |
| `frontend/next.config.ts` | Modify | Add rewrites proxy |
| `frontend/app/context/jobs-context.tsx` | Modify | Add updateJob() method |
| `frontend/app/jobs/new/hooks/use-new-job.ts` | Modify | Submit minimal job, navigate to processing |
| `frontend/app/jobs/[jobId]/processing/processing-screen.tsx` | Modify | Call API + update context on response |

---

## Verification

1. `npm run dev` from root
2. **Job analysis**: Add a job with a real description → AI-generated title, company, and themes appear
3. **Themes quality**: The 4 themes make sense for the role described
4. **Regression**: `npm run test:e2e` from `frontend/` — all existing Playwright tests pass
