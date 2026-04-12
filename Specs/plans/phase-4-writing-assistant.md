# Plan: Phase 4 — Writing Assistant

## Context

Phase 3 (Key Interview Themes) is complete. Phase 4 builds the Writing Assistant: a full-height split-screen layout (AI chat on the left, rich text editor on the right) used in three routes: Relevant Experience, Cover Letter, and Tailored CV.

## MTIs to complete

1. Split-screen layout renders at `/jobs/:jobId/themes/:themeId`
2. Editor (right panel) accepts text input
3. Chat (left panel) shows user messages + mocked AI responses
4. Cover Letter writer at `/jobs/:jobId/cover-letter` opens Writing Assistant with correct context
5. CV writer at `/jobs/:jobId/cv` opens Writing Assistant with correct context

## Design references

- `Specs/designs/Relevant Experience - Writer.png`
- `Specs/designs/Cover Letter - Writer.png`
- `Specs/designs/CV - Writer.png`

## Shared component: `WritingAssistant`

All three routes use the same split-screen component, parameterised by `context`.

### `frontend/app/components/writing-assistant.tsx`
- `'use client'`
- Props: `context: WritingContext`, `jobId: string`, `themeId?: string`
- Full-height layout: `h-[calc(100vh-3.5rem)]` (3.5rem = header `h-14`) with `flex`
- Left panel (chat, ~40% width): scrollable message list + input bar at bottom; AI messages accented in cyan
- Right panel (editor, ~60% width): `<textarea>` filling the panel, no rich-text library in V1
- Uses `useWritingAssistant` hook for all state/logic

### `frontend/app/components/hooks/use-writing-assistant.ts`
- State: `messages: Message[]`, `input: string`, `editorContent: string`
- `sendMessage()` → appends user message → after 600ms appends hardcoded mock AI reply keyed to `context`
- Mock replies: one canned response per `WritingContext` value

### Types

```ts
type WritingContext = 'relevant-experience' | 'cover-letter' | 'cv'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}
```

## Route pages to update

| File | Change |
|---|---|
| `frontend/app/jobs/[jobId]/themes/[themeId]/page.tsx` | `<WritingAssistant context="relevant-experience" jobId={jobId} themeId={themeId} />` |
| `frontend/app/jobs/[jobId]/cover-letter/page.tsx` | `<WritingAssistant context="cover-letter" jobId={jobId} />` |
| `frontend/app/jobs/[jobId]/cv/page.tsx` | `<WritingAssistant context="cv" jobId={jobId} />` |

## Playwright tests (`frontend/e2e/phase4-writing-assistant.spec.ts`)

1. `/jobs/job-1/themes/theme-1-1` → both panels visible (chat + editor)
2. Type in the editor textarea → text persists
3. Send a chat message → user message visible, then mock AI reply appears
4. `/jobs/job-1/cover-letter` → "Cover Letter" label visible in the UI
5. `/jobs/job-1/cv` → "Tailored CV" label visible in the UI

## Verification

`npm run test:e2e` from `frontend/` — all 23 tests (18 existing + 5 new) pass.
