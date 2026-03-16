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

Relationships:
- Job → Themes: one-to-many (cascade delete)
- CV: single row (single-user; save replaces the existing row)

Tables are auto-created by TypeORM `synchronize: true` — no SQL migrations needed in dev.

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

### CV
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/cv` | Get stored CV |
| `POST` | `/api/cv` | Save CV (replaces previous) |
| `DELETE` | `/api/cv` | Remove CV |

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
backend/src/cv/cv.entity.ts                         ← TypeORM entity
backend/src/cv/cv.module.ts
backend/src/cv/cv.service.ts
backend/src/cv/cv.controller.ts
frontend/.env.local                                 ← NEXT_PUBLIC_API_URL
```

### Modified files

```
backend/src/app.module.ts                           ← Add TypeOrmModule + new modules
backend/src/jobs/jobs.module.ts                     ← Register repositories
backend/src/jobs/jobs.service.ts                    ← Add DB persistence (findAll, createJob, deleteJob)
backend/src/jobs/jobs.controller.ts                 ← Full CRUD routes (replaces analyze-job)
frontend/lib/services/jobs-service.ts               ← localStorage → fetch
frontend/lib/services/cv-service.ts                 ← localStorage → fetch
frontend/app/context/jobs-context.tsx               ← Remove localStorage, add syncJobFromDb()
frontend/app/context/themes-context.tsx             ← Remove localStorage, add updateThemeStatus()
frontend/app/layout.tsx                             ← async; fetch jobs from backend at SSR
frontend/app/jobs/[jobId]/processing/               ← Call POST /api/jobs, handle real UUIDs
  processing-screen.tsx
frontend/app/jobs/[jobId]/themes/page.tsx            ← Fetch themes from GET /api/jobs/:id/themes
```

---

## Key Design Decisions

### Processing screen flow (unchanged UX, updated endpoint)

The animated processing screen keeps its existing UX. It now calls `POST /api/jobs` instead of `POST /api/analyze-job`. The response includes the real DB-generated UUID for the job and themes. The screen uses a new `syncJobFromDb(tempId, realJob)` context method to swap the placeholder job (created by `use-new-job.ts`) with the real one.

```
use-new-job.ts
  → adds placeholder job to context (temp ID like job-1234567)
  → navigates to /jobs/[tempId]/processing

processing-screen.tsx
  → POST /api/jobs { description }
  → backend: AI analysis + save to DB → returns { id (uuid), title, company, themes[] }
  → syncJobFromDb(tempId, realJob)  ← swaps placeholder with real job in context
  → addThemes(themes)               ← themes now have real UUIDs
  → redirect to /
```

### Themes context — no global preload

Themes are per-job, so the root layout starts with `initialThemes=[]`. Each themes page fetches its own themes from `GET /api/jobs/:jobId/themes` on mount and populates the context.

### Layout — server-side job fetch

`layout.tsx` becomes `async` and calls `GET /api/jobs` at SSR time. This avoids a loading flash on the dashboard. If the backend is unreachable, it falls back to an empty array.

### CV — single-row pattern

Only one CV is stored at a time. `cvService.save()` calls `cvRepo.clear()` before inserting, keeping the table to a single row.

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
9. Create CV module (3 files)
10. Smoke-test backend with curl
11. Create `frontend/.env.local`
12. Update `jobs-service.ts` and `cv-service.ts`
13. Update `jobs-context.tsx` (add `syncJobFromDb`, remove localStorage)
14. Update `themes-context.tsx` (remove localStorage, add `updateThemeStatus`)
15. Update `layout.tsx` (async + real fetch)
16. Update `processing-screen.tsx`
17. Update `themes/page.tsx`

---

## Verification Checklist

- [ ] `docker compose ps` → postgres container healthy
- [ ] `curl -X POST http://localhost:3001/api/jobs -d '{"description":"test"}'` returns job with UUID + themes
- [ ] `curl http://localhost:3001/api/jobs` returns array
- [ ] Browser: add a job → processing animation → redirects to dashboard → job visible
- [ ] Hard refresh → job still there (not localStorage)
- [ ] Navigate to `/jobs/:id/themes` → themes load
- [ ] Upload CV → reload → CV persists
- [ ] Delete a job → removed from dashboard and DB
