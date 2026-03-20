# Phase 7 — PostgreSQL Database Integration

## Goal

Replace all `localStorage` persistence with a real PostgreSQL database. The frontend services layer swaps localStorage reads/writes for `fetch` calls to the NestJS backend. No auth — single-user app.

## Prerequisites

Install Docker Desktop from [docker.com](https://docker.com) — used to run PostgreSQL locally.

---

## Data Model

### Tables

| Table | Key Fields |
|-------|-----------|
| `jobs` | `id` (uuid), `title`, `company`, `description`, `status` (active/archived), `createdAt` |
| `themes` | `id` (uuid), `jobId` (FK → jobs), `name`, `description`, `status` (todo/in-progress/done) |
| `cv_documents` | `id` (uuid), `name`, `text`, `uploadedAt` |
| `tailored_cvs` | `id` (uuid), `jobId` (FK → jobs, unique), `text`, `updatedAt` |

Relationships:
- Job → Themes: one-to-many (cascade delete)
- Job → TailoredCv: one-to-one (cascade delete); `jobId` unique constraint makes upsert safe
- CV: single row (single-user; save replaces the existing row)

Tables are auto-created by TypeORM `synchronize: true` — no SQL migrations needed in dev.

### CV vs Tailored CV

| | Base CV (`cv_documents`) | Tailored CV (`tailored_cvs`) |
|--|--|--|
| **Scope** | Global — uploaded once | Per-job — one per Job Offer |
| **Purpose** | AI context injected into every prompt (themes, cover letter, CV tailoring) | The document the user edits in the Writing Assistant at `/jobs/:jobId/cv` |
| **Cardinality** | Single row (replace-on-save) | One row per job; created on first save, updated on subsequent saves |
| **Created by** | User upload on dashboard | Writing Assistant auto-saves on edit |

---

## API Endpoints

### Jobs
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/jobs` | List all jobs |
| `POST` | `/api/jobs` | Create job (AI analysis + save to DB) — replaces `/api/analyze-job` |
| `GET` | `/api/jobs/:id` | Get single job |
| `DELETE` | `/api/jobs/:id` | Delete job (cascades to themes) |

### Themes
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/jobs/:jobId/themes` | Themes for a job |
| `PATCH` | `/api/themes/:id` | Update theme status |

### CV (base)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/cv` | Get stored base CV |
| `POST` | `/api/cv` | Save base CV (replaces previous) |
| `DELETE` | `/api/cv` | Remove base CV |

### Tailored CV (per-job)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/jobs/:jobId/cv` | Get tailored CV for a job (returns `null` if not yet created) |
| `PUT` | `/api/jobs/:jobId/cv` | Upsert tailored CV for a job |

---

## Files

### New files

```
docker-compose.yml                                  ← PostgreSQL container
backend/.env                                        ← DB credentials + OpenRouter key
backend/src/jobs/job.entity.ts                      ← TypeORM entity
backend/src/themes/theme.entity.ts                  ← TypeORM entity
backend/src/themes/themes.module.ts
backend/src/themes/themes.service.ts
backend/src/themes/themes.controller.ts
backend/src/cv/cv.entity.ts                         ← TypeORM entity (base CV)
backend/src/cv/cv.module.ts
backend/src/cv/cv.service.ts
backend/src/cv/cv.controller.ts
backend/src/tailored-cv/tailored-cv.entity.ts       ← TypeORM entity (per-job tailored CV)
backend/src/tailored-cv/tailored-cv.module.ts
backend/src/tailored-cv/tailored-cv.service.ts
backend/src/tailored-cv/tailored-cv.controller.ts   ← GET/PUT /api/jobs/:jobId/cv
frontend/.env.local                                 ← NEXT_PUBLIC_API_URL
```

### Modified files

```
backend/src/app.module.ts                           ← Add TypeOrmModule + new modules
backend/src/jobs/jobs.module.ts                     ← Register repositories
backend/src/jobs/jobs.service.ts                    ← Add DB persistence (findAll, createJob, deleteJob)
backend/src/jobs/jobs.controller.ts                 ← Full CRUD routes (replaces analyze-job)
frontend/lib/services/jobs-service.ts               ← localStorage → fetch
frontend/lib/services/cv-service.ts                 ← localStorage → fetch (base CV)
frontend/lib/services/tailored-cv-service.ts        ← new; GET/PUT /api/jobs/:jobId/cv
frontend/app/context/jobs-context.tsx               ← Remove localStorage, add updateThemeStatus()
frontend/app/context/themes-context.tsx             ← Remove localStorage, add updateThemeStatus()
frontend/app/layout.tsx                             ← async; fetch jobs from backend at SSR
frontend/app/jobs/new/hooks/use-new-job.ts          ← POST /api/jobs, loading state, navigate to real UUID
frontend/app/jobs/new/new-job-form.tsx              ← Spinner on submit button while loading
frontend/app/jobs/[jobId]/themes/page.tsx            ← Fetch themes from GET /api/jobs/:id/themes
```

### Deleted files

```
frontend/app/jobs/[jobId]/processing/processing-screen.tsx   ← replaced by inline spinner
frontend/app/jobs/[jobId]/processing/page.tsx                ← route no longer needed
```

---

### Add Job flow — inline spinner, no processing screen

The processing screen is removed. The form submits, shows a spinner on the button, waits for the backend, then navigates directly to the real job URL. No placeholder jobs, no temp IDs, no context swap needed.

```
new-job-form.tsx
  → user clicks submit → button shows spinner, form disabled

use-new-job.ts
  → POST /api/jobs { description }
  → backend: AI analysis + save to DB → returns { id (uuid), title, company, themes[] }
  → addJob(job)      ← real UUID from DB
  → addThemes(themes) ← real UUIDs from DB
  → navigate to /jobs/[id]/themes
```

### Themes context — no global preload

Themes are per-job, so the root layout starts with `initialThemes=[]`. Each themes page fetches its own themes from `GET /api/jobs/:jobId/themes` on mount and populates the context.

### Layout — server-side job fetch

`layout.tsx` becomes `async` and calls `GET /api/jobs` at SSR time. This avoids a loading flash on the dashboard. If the backend is unreachable, it falls back to an empty array.

### CV — two-layer pattern

**Base CV** (`cv_documents`): only one row. `cvService.save()` calls `cvRepo.clear()` before inserting.

**Tailored CV** (`tailored_cvs`): one row per job, upserted by `jobId`. `tailoredCvService.upsert(jobId, text)` uses `INSERT ... ON CONFLICT (jobId) DO UPDATE`. The Writing Assistant at `/jobs/:jobId/cv` reads this on load and writes it on every save. The base CV is injected into the AI prompt as background context alongside the job description.

---

## Implementation Order

1. Create `docker-compose.yml`
2. Install Docker Desktop, run `docker compose up -d`
3. Create `backend/.env`
4. `cd backend && npm install @nestjs/typeorm typeorm pg`
5. Create 3 entity files (job, theme, cv)
6. Update `app.module.ts` with `TypeOrmModule.forRootAsync`
7. Update Jobs module (module → service → controller)
8. Create Themes module (3 files)
9. Create CV module (3 files) — base CV
10. Create TailoredCV module (3 files) — per-job CV
11. Smoke-test backend with curl
12. Create `frontend/.env.local`
13. Update `jobs-service.ts` and `cv-service.ts`
14. Create `tailored-cv-service.ts`
15. Update `jobs-context.tsx` (remove localStorage)
16. Update `themes-context.tsx` (remove localStorage, add `updateThemeStatus`)
17. Update `layout.tsx` (async + real fetch)
18. Update `use-new-job.ts` + `new-job-form.tsx` (spinner, real API call)
19. Delete processing screen route
20. Update `themes/page.tsx`
21. Update Writing Assistant at `/jobs/:jobId/cv` to load/save tailored CV via `tailored-cv-service.ts`

---

## Verification Checklist

- [ ] `docker compose ps` → postgres container healthy
- [ ] `curl -X POST http://localhost:3001/api/jobs -d '{"description":"test"}'` returns job with UUID + themes
- [ ] `curl http://localhost:3001/api/jobs` returns array
- [ ] Browser: add a job → spinner on button → redirects to themes page → job visible on dashboard
- [ ] Hard refresh → job still there (not localStorage)
- [ ] Navigate to `/jobs/:id/themes` → themes load
- [ ] Upload base CV → reload → CV persists
- [ ] Navigate to `/jobs/:id/cv` → Writing Assistant loads (empty on first visit)
- [ ] Edit tailored CV in Writing Assistant → save → reload → tailored CV text persists
- [ ] Two different jobs have independent tailored CVs
- [ ] AI chat in the CV Writing Assistant has access to the base CV as context
- [ ] Delete a job → removed from dashboard and DB (tailored CV cascade-deleted)
