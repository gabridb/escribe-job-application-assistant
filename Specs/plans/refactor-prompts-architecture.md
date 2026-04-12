# Plan: Refactor Prompts Architecture

## Goal

Move domain-specific prompt logic and model configuration out of the generic `chat` module and into the feature modules that own them. This sets the foundation for:

- Different modules using different AI models independently
- Each module owning its own business logic (prompts, model choice)
- A clean multi-user architecture where authorization lives with the domain module

## Current state

```
backend/src/chat/chat.prompts.ts        ← owns buildRelevantExperienceSystemPrompt + CHAT_MODEL
backend/src/chat/chat.service.ts        ← hardcodes CHAT_MODEL from chat.prompts
backend/src/chat/chat.controller.ts     ← selects prompt based on context, calls chat.service

frontend/app/components/hooks/
  use-writing-assistant.ts              ← owns GREETING + getInitialGreeting (domain copy in a generic hook)
```

## Target state

```
backend/src/relevant-experience/
  relevant-experience.prompts.ts        ← NEW: STAR prompts + model constant for this feature
backend/src/chat/
  chat.prompts.ts                       ← only generic fallback prompt + model
  chat.service.ts                       ← model-agnostic: accepts model as parameter
  chat.controller.ts                    ← imports prompt builders from domain modules

frontend/app/jobs/[jobId]/themes/[themeId]/
  relevant-experience-writing-assistant.tsx  ← defines its own initialGreeting
frontend/app/components/hooks/
  use-writing-assistant.ts              ← accepts initialGreeting as a prop, no domain copy
```

## What does NOT change (out of scope)

- The `/api/chat` endpoint stays as a single generic endpoint — domain-owned endpoints are a future concern (auth/multi-user phase)
- No changes to the frontend services layer or API contract
- No changes to the database or other modules

---

## Backend changes

### Step 1 — Create `relevant-experience.prompts.ts`

**File:** `backend/src/relevant-experience/relevant-experience.prompts.ts`

Move `buildRelevantExperienceSystemPrompt` from `chat.prompts.ts` here. Add a module-scoped model constant.

```ts
export const RELEVANT_EXPERIENCE_MODEL = 'meta-llama/llama-3.1-8b-instruct'

export function buildRelevantExperienceSystemPrompt(
  theme: { name: string; description: string },
  editorContent: string,
  jobDescription?: string,
): string { ... }
```

### Step 2 — Update `chat.prompts.ts`

Remove `buildRelevantExperienceSystemPrompt` and `CHAT_MODEL`. Keep only the generic fallback.

```ts
export const GENERIC_MODEL = 'meta-llama/llama-3.1-8b-instruct'

export function buildGenericSystemPrompt(): string { ... }
```

### Step 3 — Update `chat.service.ts`

Make `ChatService.chat()` accept `model` as a parameter instead of importing `CHAT_MODEL`.

```ts
async chat(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  model: string,           // ← new param
): Promise<string>
```

### Step 4 — Update `chat.controller.ts`

Import `buildRelevantExperienceSystemPrompt` and `RELEVANT_EXPERIENCE_MODEL` from the relevant-experience module. Pass the correct model to `chatService.chat()`.

```ts
import {
  buildRelevantExperienceSystemPrompt,
  RELEVANT_EXPERIENCE_MODEL,
} from '../relevant-experience/relevant-experience.prompts'
import { buildGenericSystemPrompt, GENERIC_MODEL } from './chat.prompts'

// In the handler:
const { systemPrompt, model } =
  body.context === 'relevant-experience' && body.themeName && body.themeDescription
    ? {
        systemPrompt: buildRelevantExperienceSystemPrompt(...),
        model: RELEVANT_EXPERIENCE_MODEL,
      }
    : {
        systemPrompt: buildGenericSystemPrompt(),
        model: GENERIC_MODEL,
      }

const content = await this.chatService.chat(body.messages, systemPrompt, model)
```

---

## Frontend changes

### Step 5 — Move initial greeting to the feature component

In `use-writing-assistant.ts`: remove `GREETING` and `getInitialGreeting`. Add `initialGreeting` as a required parameter.

```ts
export function useWritingAssistant(
  context: WritingContext,
  initialGreeting: string,     // ← new: caller provides this
  jobDescription?: string,
  themeName?: string,
  themeDescription?: string,
  initialContent?: string,
)
```

In `relevant-experience-writing-assistant.tsx`: compute the greeting before passing it to `WritingAssistant` (and down to the hook).

```ts
const initialGreeting = initialContent?.trim()
  ? "Hello! I'm your AI writing assistant. How can I help you improve your document today?"
  : `I'll help you write your "${themeName}" example. Think of a specific situation...`
```

> Cover letter and CV writing assistants pass the generic greeting directly.

---

## Test scenarios

### Jest unit tests (backend)

| Test | Input | Expected |
|------|-------|----------|
| `buildRelevantExperienceSystemPrompt` with empty draft | theme, empty editorContent | prompt contains "Guide them through the STAR method" |
| `buildRelevantExperienceSystemPrompt` with draft | theme, editorContent with text | prompt contains "Critique it using the STAR framework" and the draft |
| `buildRelevantExperienceSystemPrompt` with job description | theme, editorContent, jobDescription | prompt contains the job description text |
| `buildGenericSystemPrompt` | — | returns generic assistant prompt |

These tests move from `chat.prompts.spec.ts` to `relevant-experience.prompts.spec.ts`.

### Playwright E2E

No new E2E tests needed — existing tests cover the full chat flow. All existing E2E tests must still pass after the refactor.

Run: `npm run test:e2e` from `frontend/`

### Manual smoke test

1. Open `/jobs/:jobId/themes/:themeId` with no existing draft → initial greeting mentions the theme name
2. Open the same page with an existing draft → generic greeting shown
3. Send a message → AI responds correctly (STAR coaching prompt active)
4. Open cover letter → generic greeting shown, AI responds

---

## File change summary

| File | Change |
|------|--------|
| `backend/src/relevant-experience/relevant-experience.prompts.ts` | CREATE — prompt builder + model constant |
| `backend/src/chat/chat.prompts.ts` | EDIT — remove RE prompt + CHAT_MODEL, keep generic only |
| `backend/src/chat/chat.service.ts` | EDIT — accept `model` as parameter |
| `backend/src/chat/chat.controller.ts` | EDIT — import from RE module, pass model |
| `frontend/app/components/hooks/use-writing-assistant.ts` | EDIT — remove greeting logic, accept `initialGreeting` param |
| `frontend/app/components/writing-assistant.tsx` | EDIT — pass `initialGreeting` through to hook (if needed) |
| `frontend/app/jobs/[jobId]/themes/[themeId]/relevant-experience-writing-assistant.tsx` | EDIT — compute and pass `initialGreeting` |
