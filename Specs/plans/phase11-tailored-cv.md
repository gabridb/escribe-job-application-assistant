# Phase 11 — Tailored CV Writing Assistant

## Context

The CV writing assistant (`/jobs/:jobId/cv`) already exists and persists content via `tailored-cv.service.ts`, but it is underpowered:

- It does **not** pass `jobDescription` or `relevantExperiences` to the AI — the model has no idea which role it's helping tailor the CV for.
- There is no "Want me to tailor your CV?" auto-write button like the cover letter has.
- `buildCvSystemPrompt` has no `<editor_content>` tag support, so AI responses never push content directly into the editor.
- The prompt builder lives in `chat.prompts.ts` instead of the tailored-cv module where it belongs.

This phase brings the CV assistant to parity with the cover letter assistant.

---

## Playwright (E2E) test scenarios

File: `frontend/e2e/phase11-tailored-cv.spec.ts`

| # | Route | Action | Assertion |
| - | ----- | ------ | --------- |
| 1 | `/jobs/:jobId/cv` | Page loads | Editor textarea is visible |
| 2 | `/jobs/:jobId/cv` | Type text in editor | `PUT /api/jobs/:jobId/cv` fires with `{ text }` payload |
| 3 | `/jobs/:jobId/cv` | Type text, wait for save, reload | Editor content equals the saved text |
| 4 | `/jobs/:jobId/cv` | Send chat message | `POST /api/chat` body has `context: "cv"` and `jobDescription` field |
| 5 | `/jobs/:jobId/cv` | Page loads | "Want me to tailor your CV for this role?" card is visible immediately |
| 6 | `/jobs/:jobId/cv` | Click "Tailor my CV" button | `POST /api/chat` fires with `context: "cv"` and a message asking to tailor the CV |

---

## Jest (unit) test scenarios

**File: `backend/src/tailored-cv/tailored-cv.prompts.spec.ts`**

| Function | Input | Expected |
| -------- | ----- | -------- |
| `buildTailoredCvSystemPrompt` | `(undefined, undefined, undefined, undefined)` | Contains `"CV"` and `"job seeker"` |
| `buildTailoredCvSystemPrompt` | `(baseCvText, undefined, undefined, undefined)` | Contains the CV content wrapped in `<base_cv>` |
| `buildTailoredCvSystemPrompt` | `(undefined, jobDescription, undefined, undefined)` | Contains job description wrapped in `<job_description>` |
| `buildTailoredCvSystemPrompt` | `(baseCv, jobDesc, experiences, undefined)` | Contains experiences wrapped in `<relevant_experiences>` |
| `buildTailoredCvSystemPrompt` | `(baseCv, jobDesc, undefined, 'existing draft text')` | Contains `<current_draft>` block and `<editor_content>` format instructions |
| `buildTailoredCvSystemPrompt` | `(baseCv, jobDesc, undefined, '')` | Contains instructions about writing a draft; no `<current_draft>` block |

---

## Implementation Plan

### Backend — 2 new files, 2 modified

**New: `backend/src/tailored-cv/tailored-cv.prompts.ts`**

Mirror of `cover-letter.prompts.ts`. Export:

```ts
export interface RelevantExperienceEntry { themeName: string; text: string }

export function buildTailoredCvSystemPrompt(
  baseCvText?: string,
  jobDescription?: string,
  relevantExperiences?: RelevantExperienceEntry[],
  editorContent?: string,
): string
```

Prompt structure (same `parts.join('\n\n')` pattern):

1. Role: "You are an AI writing assistant helping a job seeker tailor their CV for a specific role."
2. If `baseCvText` → `<base_cv>` block
3. If `jobDescription` → `<job_description>` block
4. If `relevantExperiences` → `<relevant_experiences>` block (same format as cover letter)
5. If `editorContent` has content → `<current_draft>` block + instructions to output rewrites using `<editor_content>` tags; else → instructions to write a first draft using the tags

`EDITOR_CONTENT_FORMAT` constant (adapted for CV):

```
When you write or revise the CV, wrap the full text in <editor_content> tags like this:
<editor_content>
[full CV text here]
</editor_content>
Then add one short sentence outside the tags explaining what you changed. Do not include the CV text outside the tags.
```

**New: `backend/src/tailored-cv/tailored-cv.prompts.spec.ts`** — 6 unit tests as above.

**Modified: `backend/src/chat/chat.controller.ts`**

- Replace `import { buildCvSystemPrompt } from './chat.prompts'` with `import { buildTailoredCvSystemPrompt } from '../tailored-cv/tailored-cv.prompts'`
- Update `cv` case:

```ts
body.context === 'cv'
  ? {
      systemPrompt: buildTailoredCvSystemPrompt(
        body.baseCvText,
        body.jobDescription,
        body.relevantExperiences,
        editorContent,
      ),
      model: GENERIC_MODEL,
    }
```

(`relevantExperiences` is already declared on `ChatRequestBody`)

**Modified: `backend/src/chat/chat.prompts.ts`**

- Remove `buildCvSystemPrompt` export (moved to `tailored-cv.prompts.ts`).

---

### Frontend — 1 modified file

**Modified: `frontend/app/jobs/[jobId]/cv/cv-writing-assistant.tsx`**

Extend the `useEffect` to also fetch `jobDescription` and relevant experiences — identical fetch pattern to `cover-letter-writing-assistant.tsx` (lines 23–54).

Add state:

```ts
const [jobDescription, setJobDescription] = useState<string | undefined>(undefined)
const [relevantExperiences, setRelevantExperiences] = useState<RelevantExperienceEntry[]>([])
```

Pass to `<WritingAssistant>`:

```tsx
jobDescription={jobDescription}
relevantExperiences={relevantExperiences}
autoWriteReplies={[{
  label: 'Tailor my CV for this role',
  message: 'Please tailor my CV for this specific role, highlighting the most relevant experience and skills.',
}]}
```

Import `RelevantExperienceEntry` from `@/lib/services/chat-service`.

---

### Tests — 1 new file

- `frontend/e2e/phase11-tailored-cv.spec.ts` — 6 scenarios above

---

## Critical files

| File | Change |
| ---- | ------ |
| `backend/src/tailored-cv/tailored-cv.prompts.ts` | **New** — prompt builder |
| `backend/src/tailored-cv/tailored-cv.prompts.spec.ts` | **New** — unit tests |
| `backend/src/chat/chat.controller.ts` | Update `cv` case, swap import |
| `backend/src/chat/chat.prompts.ts` | Remove `buildCvSystemPrompt` |
| `frontend/app/jobs/[jobId]/cv/cv-writing-assistant.tsx` | Add job + experiences fetch; add autoWriteReplies |
| `frontend/e2e/phase11-tailored-cv.spec.ts` | **New** — E2E tests |

---

## Verification

1. `npm run dev` from repo root
2. Navigate to any job's CV page → "Tailor my CV for this role" card visible immediately in chat
3. Click the button → AI response is tailored to the job description; content appears in editor
4. Type in editor → "Saved" appears; Network tab shows `PUT /api/jobs/:jobId/cv`
5. Reload → content persists
6. `npm run test:e2e` from `frontend/` — all tests pass (including new phase 11 spec)
7. `npm run test` from `backend/` — all tests pass (including new prompts spec)
