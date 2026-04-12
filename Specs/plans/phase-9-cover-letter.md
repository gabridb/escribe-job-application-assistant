# Phase 9 — Cover Letter Persistence & AI

## Context

The cover letter page (`/jobs/:jobId/cover-letter`) already renders the `WritingAssistant` component, but it is a stub — there is no persistence layer, no `onSave` handler, and no specialised AI prompt. The chat falls through to the generic system prompt. This phase wires up the full stack following the exact same pattern as Phase 8's Tailored CV feature.

---

## Playwright (E2E) test scenarios

File: `frontend/e2e/phase9-cover-letter.spec.ts`

| # | Route | Action | Assertion |
| - | ----- | ------ | --------- |
| 1 | `/jobs/:jobId/cover-letter` | Page loads | Editor textarea is visible |
| 2 | `/jobs/:jobId/cover-letter` | Type text in editor | `PUT /api/jobs/:jobId/cover-letter` fires with `{ text }` payload |
| 3 | `/jobs/:jobId/cover-letter` | Type text, wait for save, reload | Editor content equals the saved text |
| 4 | `/jobs/:jobId/cover-letter` | Send chat message | `POST /api/chat` body has `context: "cover-letter"` and `jobDescription` field |
| 5 | `/jobs/:jobId/cover-letter` | Page loads | "Want me to write a first draft for you?" card is visible immediately |
| 6 | `/jobs/:jobId/cover-letter` | Click "Write my cover letter" button | `POST /api/chat` fires with `context: "cover-letter"` and message asking to write a cover letter |

---

## Jest (unit) test scenarios

**File: `backend/src/cover-letter/cover-letter.prompts.spec.ts`**

| Function | Input | Expected |
| -------- | ----- | -------- |
| `buildCoverLetterSystemPrompt` | `(undefined, undefined)` | Contains `"cover letter"` + `"job seeker"` |
| `buildCoverLetterSystemPrompt` | `(baseCvText, undefined)` | Contains CV content |
| `buildCoverLetterSystemPrompt` | `(undefined, jobDescription)` | Contains job description |
| `buildCoverLetterSystemPrompt` | `(baseCvText, jobDescription)` | Contains both CV and job description |

**File: `backend/src/cover-letter/cover-letter.service.spec.ts`**

| Method | Scenario | Expected |
| ------ | -------- | -------- |
| `upsert` | No existing record | Creates new `CoverLetter` |
| `upsert` | Existing record | Updates text in place |
| `getByJob` | Record exists | Returns `CoverLetter` |
| `getByJob` | No record | Returns `null` |

---

## Implementation Plan

### Backend (6 files + 2 modified)

#### New files

**`backend/src/cover-letter/cover-letter.entity.ts`** — Mirror of `tailored-cv.entity.ts`:

- `@PrimaryGeneratedColumn('uuid') id`
- `@Column({ unique: true }) jobId` (FK to Job, CASCADE delete)
- `@OneToOne(() => Job, (job) => job.coverLetter, { onDelete: 'CASCADE' })`
- `@JoinColumn()`
- `@Column('text') text`
- `@UpdateDateColumn() updatedAt`

**`backend/src/cover-letter/cover-letter.service.ts`**

- `getByJob(jobId: string): Promise<CoverLetter | null>`
- `upsert(jobId: string, text: string): Promise<CoverLetter>` — `findOne` then `save` (same upsert pattern as `tailored-cv.service.ts`)

**`backend/src/cover-letter/cover-letter.controller.ts`**

- Route prefix: `jobs/:jobId/cover-letter`
- `GET /jobs/:jobId/cover-letter` → returns `CoverLetter | null`
- `PUT /jobs/:jobId/cover-letter` → body `{ text: string }`, calls `upsert`, returns `CoverLetter`

**`backend/src/cover-letter/cover-letter.module.ts`**

- `TypeOrmModule.forFeature([CoverLetter])`
- Exports `CoverLetterService`

**`backend/src/cover-letter/cover-letter.prompts.ts`**

- `export function buildCoverLetterSystemPrompt(baseCvText?: string, jobDescription?: string): string`
- Prompt focuses the AI on: writing a compelling cover letter, matching the role's requirements, drawing on the candidate's background from the CV.

**`backend/src/cover-letter/cover-letter.prompts.spec.ts`** — unit tests as above

#### Modified files

**`backend/src/jobs/job.entity.ts`** — Add import + relationship:

```ts
import { CoverLetter } from '../cover-letter/cover-letter.entity';

@OneToOne(() => CoverLetter, (coverLetter) => coverLetter.job, { cascade: true })
coverLetter: CoverLetter;
```

**`backend/src/app.module.ts`**

- Import `CoverLetterModule`
- Add to `imports` array
- Add `CoverLetter` to `entities` array in `TypeOrmModule.forRoot`

**`backend/src/chat/chat.controller.ts`** — Add case for `'cover-letter'` context:

```ts
: body.context === 'cover-letter'
  ? {
      systemPrompt: buildCoverLetterSystemPrompt(body.baseCvText, body.jobDescription),
      model: GENERIC_MODEL,
    }
```

Import `buildCoverLetterSystemPrompt` from `../cover-letter/cover-letter.prompts`.

---

### Frontend (2 files + 1 modified)

**`frontend/lib/services/cover-letter-service.ts`** (new) — Mirror of `tailored-cv-service.ts`:

```ts
get(jobId: string): Promise<CoverLetter | null>   // GET /api/jobs/:jobId/cover-letter
upsert(jobId: string, text: string): Promise<CoverLetter>  // PUT /api/jobs/:jobId/cover-letter
```

**`frontend/app/jobs/[jobId]/cover-letter/cover-letter-writing-assistant.tsx`** (new, `'use client'`) — Mirror of `cv-writing-assistant.tsx`:

- `useEffect` loads `coverLetterService.get(jobId)` on mount; sets `initialContent`
- Also loads `baseCvText` via `cvService.get()` for AI context
- `handleSave` calls `coverLetterService.upsert(jobId, text)`
- Renders `<WritingAssistant context="cover-letter" ... onSave={handleSave} />`

**`frontend/app/jobs/[jobId]/cover-letter/page.tsx`** (modified) — Replace the direct `<WritingAssistant>` render with `<CoverLetterWritingAssistant jobId={jobId} />`.

---

### Tests (2 new files)

- `frontend/e2e/phase9-cover-letter.spec.ts` — 6 scenarios listed above
- `backend/src/cover-letter/cover-letter.prompts.spec.ts` — 4 scenarios listed above

---

## Verification

1. `npm run dev` from repo root — starts frontend + backend + Docker PostgreSQL
2. Navigate to any job's cover letter page → editor loads empty
3. Type text → "Saved" appears after ~1.5 s; Network tab shows `PUT /api/jobs/:jobId/cover-letter`
4. Reload → text persists
5. Chat message → response is job-aware
6. `npm run test:e2e` from `frontend/` — all tests pass (including new phase 9 spec)
7. `npm run test` from `backend/` — all tests pass (including new prompts + service specs)
