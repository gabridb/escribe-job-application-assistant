# Plan: Base CV — Pre-fill Tailored CVs + AI Context

## Context

The user uploads their base CV as a Markdown file via the existing UserMenu "Upload CV" dialog (reads file as text — works for .md). The `CvDocument` entity, `CvService`, `CvController`, and frontend `cvService` are all already implemented and working.

**What's missing:**
1. Tailored CV editor opens empty even when a base CV exists — it should pre-fill from base CV on first open
2. The AI on the tailored CV page doesn't know the user's base CV content — it only gets a generic prompt

---

## Part 1 — Tailored CV Pre-fill from Base CV

### Modified file
- `frontend/app/jobs/[jobId]/cv/cv-writing-assistant.tsx`

When `tailoredCvService.get(jobId)` returns `null`, fall back to `cvService.get()` and use its `text` as `initialContent`:

```
tailoredCv = await tailoredCvService.get(jobId)
if (tailoredCv) → initialContent = tailoredCv.text
else → baseCv = await cvService.get() → initialContent = baseCv?.text ?? ''
```

No backend changes needed — `tailoredCvService.upsert()` already creates the record on first save.

---

## Part 2 — AI Context: Base CV in CV Chat Prompts

### New function
- `backend/src/chat/chat.prompts.ts` — add `buildCvSystemPrompt(baseCvText?: string, jobDescription?: string): string`

Prompt content:
```
You are an AI writing assistant helping a job seeker tailor their CV for a specific role.
[if baseCvText] Here is the user's base CV:
<base cv text>
[if jobDescription] Here is the target job description:
<job description>
Help the user adapt language, highlight relevant experience, and structure the CV to match the role. Keep responses concise and actionable.
```

### Modified files
- `backend/src/chat/chat.controller.ts` — add `baseCvText?: string` to `ChatRequestBody`; handle `cv` context with `buildCvSystemPrompt(body.baseCvText, body.jobDescription)`
- `frontend/lib/services/chat-service.ts` — add `baseCvText?: string` to `ChatPayload`
- `frontend/app/components/hooks/use-writing-assistant.ts` — add `baseCvText?: string` param; include it in both `sendChatMessage` calls
- `frontend/app/components/writing-assistant.tsx` — add `baseCvText?: string` prop; pass to `useWritingAssistant`
- `frontend/app/jobs/[jobId]/cv/cv-writing-assistant.tsx` — fetch base CV alongside tailored CV; pass its text as `baseCvText` prop to `<WritingAssistant>`

---

## Critical Files

| File | Change |
|------|--------|
| `frontend/app/jobs/[jobId]/cv/cv-writing-assistant.tsx` | Prefill from base CV; fetch base CV for AI context |
| `frontend/app/components/writing-assistant.tsx` | Add `baseCvText` prop |
| `frontend/app/components/hooks/use-writing-assistant.ts` | Add `baseCvText` param |
| `frontend/lib/services/chat-service.ts` | Add `baseCvText` to `ChatPayload` |
| `backend/src/chat/chat.prompts.ts` | Add `buildCvSystemPrompt()` |
| `backend/src/chat/chat.controller.ts` | Handle `cv` context with new prompt |

---

## Tests

### Playwright E2E (`frontend/e2e/`)
1. **Tailored CV prefill** — given a saved base CV, open `/jobs/:jobId/cv` with no existing tailored CV → editor is pre-filled with base CV text
2. **Tailored CV persists** — after saving a tailored CV, reopen the page → editor shows tailored CV (not reset to base)

### Jest unit (`backend/`) — `chat.prompts.spec.ts`
1. `buildCvSystemPrompt(baseCvText, jobDescription)` — returns string containing both base CV and job description
2. `buildCvSystemPrompt(undefined, undefined)` — returns a valid fallback prompt string

### Manual checklist
- [ ] Upload a `.md` CV via UserMenu "Upload CV"
- [ ] Navigate to a job's CV page (no tailored CV saved) → editor pre-filled with base CV text
- [ ] Navigate to a job's CV page (tailored CV exists) → editor shows tailored CV, not base CV
- [ ] Chat on the CV page ("What should I emphasize?") → AI response references CV content
- [ ] All existing E2E tests still pass (`npm run test:e2e`)
