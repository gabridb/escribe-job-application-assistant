# Plan: Edit Job Metadata

## Context

When a job is created, `title` and `company` are AI-extracted from the description. The extraction can leave these fields blank or incorrect (e.g. company unknown). There is currently no way to correct them after creation — no PATCH endpoint exists on the backend and no edit UI exists on the dashboard.

## Acceptance criteria

- [ ] Each job row on the dashboard has a pencil (edit) icon button
- [ ] Clicking it opens a dialog pre-filled with the job's current `title` and `company`
- [ ] Saving calls `PATCH /api/jobs/:id` and updates the row in place (no page reload)
- [ ] Title field cannot be saved empty; company may be left blank
- [ ] Cancel closes the dialog without making any API call

## E2E test scenarios (Playwright)

File: `frontend/e2e/phase10-edit-job-metadata.spec.ts`

| # | Route | Action | Assertion |
|---|-------|--------|-----------|
| 1 | `/` | Click `aria-label="Edit Platform Engineer"` | `Dialog` with title "Edit Job" is visible; title input has value "Platform Engineer"; company input has value "" |
| 2 | `/` (company blank) | Open edit dialog, fill company "TechCorp", click Save | PATCH request sent to `/api/jobs/job-1` with body `{ company: "TechCorp" }`; dialog closes; table row shows "TechCorp" |
| 3 | `/` | Open edit dialog, clear title input, check Save button | Save button is disabled |
| 4 | `/` | Open edit dialog, change title, click Cancel | No PATCH request made; original title still shown in table row |

## Unit test scenarios (Jest)

_No prompt-building logic or non-trivial service logic. Skip._

## Files to create / modify

| File | Action | Notes |
|------|--------|-------|
| `backend/src/jobs/update-job.dto.ts` | Create | `class UpdateJobDto { title?: string; company?: string }` — plain TS, no decorators (matches codebase style) |
| `backend/src/jobs/jobs.service.ts` | Modify | Add `updateJob(id, dto)`: findOne → throw NotFoundException if missing → if `dto.title` provided, trim and reject empty → `Object.assign(job, trimmed fields)` → `repo.save(job)` |
| `backend/src/jobs/jobs.controller.ts` | Modify | Add `Patch` to `@nestjs/common` imports + import `UpdateJobDto`; add `@Patch(':id') update(@Param('id') id, @Body() dto)` handler |
| `frontend/lib/services/jobs-service.ts` | Modify | Add `async update(id, dto: { title?: string; company?: string }): Promise<Job>` — `PATCH` with `Content-Type: application/json`, mirrors `create()` pattern |
| `frontend/app/context/jobs-context.tsx` | Modify | Make `updateJob` async; call `jobsService.update(id, patch)` then patch local state on success; update `JobsContextValue` interface signature to `Promise<void>` |
| `frontend/app/components/edit-job-dialog.tsx` | Create | shadcn `Dialog` with controlled `title` + `company` inputs; `useEffect` re-seeds from `job` prop when `open` changes; Save disabled when title is empty; `isSaving` flag prevents double-submit; shows `saveError` above footer if API throws |
| `frontend/app/jobs-list.tsx` | Modify | Import `Pencil` from `lucide-react` + `EditJobDialog`; add `editingJob` + `editDialogOpen` state; add Pencil button before Trash2 in Actions `<td>`; render `<EditJobDialog>` once outside the map (same pattern as `NewJobDialog` at bottom of file) |
| `frontend/e2e/phase10-edit-job-metadata.spec.ts` | Create | Four tests per table above; mock all API calls with `page.route` |

## Implementation notes

- **Backend DTO**: no `class-validator` in this codebase — keep `UpdateJobDto` as a plain class with optional properties. Use `@Body() dto: UpdateJobDto` (not `@Body('field')`).
- **Trim + validate in service**: if `dto.title` is provided but empty after trim, throw `BadRequestException`. Frontend also disables Save when title is empty, so this is belt-and-suspenders.
- **Context type change**: `updateJob` changes from sync to `async`. No other consumer of `updateJob` exists today, so this is safe.
- **Dialog re-seeding**: `useEffect` keyed on `open` resets `title`/`company` state from the `job` prop each time the dialog opens — prevents stale values when switching between job rows.
- **Edit button**: `aria-label={\`Edit ${job.title}\`}` in the Actions column, before the existing Trash2 button. Use `Pencil` icon from `lucide-react` (already a project dependency).
- **E2E file name**: `phase10-edit-job-metadata.spec.ts` (follows the `phaseN-*` convention seen in the existing test files).

## Verification

1. `npm run dev` from root — start both frontend and backend
2. Go to `/` — confirm a pencil icon appears on each job row
3. Click the pencil on a job with a blank company — fill it in, save — confirm the company appears in the table row without a page reload
4. Clear the title field — confirm Save button is disabled
5. Click Cancel after making changes — confirm no changes are saved
6. `npm run test:e2e` from `frontend/` — all tests must pass
7. `npm run test` from `backend/` — all tests must pass
