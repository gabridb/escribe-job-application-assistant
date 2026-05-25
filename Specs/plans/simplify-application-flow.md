# Plan — Simplify Application Flow (AI-driven theme discovery)

**Status**: Draft — pending confirmation
**Date**: 2026-05-23

---

## 1. Goal & why

Today the user is forced through a manual checklist: after adding a job they land on `/jobs/:jobId/themes` and are expected to write a Relevant Experience for each theme before doing anything useful. That up-front workload is the main source of friction.

We invert the flow: themes are still extracted in the background, but the **Cover Letter Writing Assistant becomes the primary work surface**. The AI uses the themes internally to coach the conversation — surfacing missing competencies, suggesting where to expand, and offering to **save the user's STAR snippets into the Experience Library** with one click. Themes preparation becomes a *byproduct* of writing the cover letter, not a prerequisite.

Decisions taken in chat (2026-05-23):

| # | Decision | Choice |
|---|----------|--------|
| 1 | Themes screen | **(C)** Stays as today but is no longer the primary destination — accessed only as a secondary action |
| 2 | Landing after adding a job | **(B)** New Job Overview page (title, company, themes summary, CTAs to Cover Letter / Tailored CV / Themes) |
| 3 | Saving Relevant Experience from cover letter chat | **(B)** Semi-automatic: AI proposes "save this as a reusable experience?" → user confirms with one click |

---

## 2. Scope of changes

### 2.1 New: Job Overview page (`/jobs/:jobId`)

- Server Component at `frontend/app/jobs/[jobId]/page.tsx`
- Shows: job title, company, a small "Interview themes" summary block (count + names, no status badges, read-only), and three CTAs:
  - **Write Cover Letter** (primary — olive) → `/jobs/:jobId/cover-letter`
  - **Tailor CV** (secondary) → `/jobs/:jobId/cv`
  - **Interview themes** (tertiary, smaller / link-styled) → `/jobs/:jobId/themes`
- Dashboard "Key Themes" link on each row is replaced by linking the row title to `/jobs/:jobId` (the row's primary action becomes "open job overview")
- `useNewJob` redirects to `/jobs/:jobId` instead of `/jobs/:jobId/themes`
- `NewJobDialog` redirects to `/jobs/:jobId` instead of `/jobs/:jobId/themes`

### 2.2 Cover Letter chat — theme-aware coaching

- `cover-letter.prompts.ts` accepts a new optional argument: `themes: { name: string, description?: string, hasExperience: boolean }[]`
- New section in the system prompt instructs the AI:
  - Treat themes with `hasExperience = false` as **coaching opportunities**
  - When the conversation naturally allows it, ask the user *one* open question about an uncovered theme (e.g. *"This role weighs stakeholder management heavily — can you tell me about a time you aligned a difficult stakeholder?"*)
  - Never list themes back to the user; weave them into the conversation
- `cover-letter.service.ts` fetches themes (with `hasExperience` flag) and passes them to the prompt builder

### 2.3 "Save as reusable experience" suggestion

- AI is instructed to wrap candidate STAR stories in a structured tag:
  ```
  <experience_candidate theme="Stakeholder Management">
  [story text the user just told]
  </experience_candidate>
  ```
- Frontend chat renderer detects the tag and renders an inline card *below* the AI message:
  > "This looks like a great story for **Stakeholder Management**. Save it to your Experience Library so you can reuse it?"
  > `[Save]` `[Dismiss]`
- On **Save** → `POST /api/jobs/:jobId/themes/:themeId/experience` with the candidate text (reuses the existing endpoint used by the Relevant Experience writer)
- On **Dismiss** → the card disappears (no persistence needed)
- The tag itself is stripped from the visible AI message before rendering, like the existing `<editor_content>` handling

### 2.4 Themes page de-emphasized

- Route `/jobs/:jobId/themes` and `/jobs/:jobId/themes/:themeId` stay exactly as they are today (no UI changes)
- They are only reachable from:
  - The Job Overview "Interview themes" CTA
  - Direct URL
- Nothing else in the app links to them

### 2.5 Out of scope (explicitly)

- No auto-saving of candidate experiences (we chose decision **3.B**, not 3.A)
- No automatic theme-coverage badge on Job Overview (themes still have their own page for status)
- No change to Tailored CV flow, base CV upload, or auto-save behaviour
- No migration: existing jobs simply get a new landing page; their themes pages keep working

---

## 3. Test scenarios

### 3.1 Playwright (E2E) — `frontend/e2e/`

| # | File | Scenario |
|---|------|----------|
| 1 | `job-overview-landing.spec.ts` | After submitting `NewJobDialog`, the URL is `/jobs/:jobId` (not `/jobs/:jobId/themes`); page shows job title, company and the three CTAs |
| 2 | `job-overview-landing.spec.ts` | Clicking the "Write Cover Letter" CTA on Job Overview navigates to `/jobs/:jobId/cover-letter` |
| 3 | `job-overview-landing.spec.ts` | Clicking the "Interview themes" link on Job Overview navigates to `/jobs/:jobId/themes` |
| 4 | `dashboard-job-row.spec.ts` | The Dashboard row's primary click target opens `/jobs/:jobId` (no more direct "Key Themes" link) |
| 5 | `experience-candidate-card.spec.ts` | When the chat receives a reply containing `<experience_candidate theme="...">…</experience_candidate>`, the chat renders a Save / Dismiss card and the tag itself is not visible in the message text |
| 6 | `experience-candidate-card.spec.ts` | Clicking **Save** on the candidate card calls `POST /api/jobs/:jobId/themes/:themeId/experience` and the candidate appears in the Experience Library page |
| 7 | `experience-candidate-card.spec.ts` | Clicking **Dismiss** removes the card without making any backend request |

E2E for #5–#7 will stub the AI reply (set the chat response in the test) — we do not need to provoke a real STAR story from OpenRouter.

### 3.2 Jest (unit) — `backend/src/cover-letter/`

| # | File | Scenario |
|---|------|----------|
| 1 | `cover-letter.prompts.spec.ts` | When `themes` is passed with at least one uncovered theme, the system prompt contains a coaching instruction referencing that theme name |
| 2 | `cover-letter.prompts.spec.ts` | When all themes have `hasExperience = true`, the coaching instruction is omitted (the AI shouldn't ask if everything is already covered) |
| 3 | `cover-letter.prompts.spec.ts` | The system prompt instructs the AI to wrap candidate stories in `<experience_candidate theme="...">` tags |
| 4 | `cover-letter.prompts.spec.ts` | When `themes` is undefined or empty, the prompt builds without the themes block (no `undefined` leaking into the string) |

No new service-level Jest tests required: the new logic in `cover-letter.service.ts` is a straightforward fetch-and-pass-through wired into the existing E2E path. Tag-parsing on the frontend is covered by Playwright (#5).

---

## 4. Implementation order

1. Backend prompt change — extend `buildCoverLetterSystemPrompt` signature + Jest tests (#1–#4)
2. Backend service — fetch themes-with-coverage and pass to the prompt builder
3. Frontend chat tag parser — strip and surface `<experience_candidate>` tags, render Save/Dismiss card
4. New Job Overview page + redirect changes + Dashboard row click target
5. Playwright tests (#1–#7) + `npm run check`

Each step ends in something verifiable in the browser per the MTI rule. The new MTI entries land in `Specs/PROGRESS.md` as **Phase 14 — Simplified Application Flow**.

---

## 5. Open questions

- Should the Job Overview also show a tiny "X of Y themes have a story" indicator, or stay purely link-shaped? *(Default: keep it as a link; revisit only if it feels empty in practice.)*
- When the AI proposes a candidate but the closest matching theme is ambiguous, do we let it pick freely or constrain it to themes that have `hasExperience = false`? *(Default: constrain — there's no point offering to save a story for a theme that already has one.)*
