# Escribe — Claude Code Context

AI-powered job application assistant. Helps job seekers prepare tailored CV, cover letter, and interview examples for each role they apply to.

## PRD

Full product spec: `Specs/PRD.md`

Key concepts (see Glossary in PRD):
- **Job Offer** — a job description added by the user
- **Key Interview Themes** — competencies extracted per job, interview-prep prompts
- **Relevant Experience** — user's written story for a theme
- **Experience Library** — global store of all written stories, reusable across jobs
- **Writing Assistant** — shared split-screen component (AI chat left, rich text editor right)

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | npm workspaces |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| UI components | shadcn/ui |
| Backend | NestJS 11, TypeScript |
| Testing | Playwright (E2E) |
| Dev | `npm run dev` — runs both frontend and backend concurrently |

## V1 Scope: Frontend Only

- All AI capabilities are **mocked** — no real API calls in v1
- No backend persistence — state lives in memory / localStorage
- No file parsing — raw text input only for CV and job descriptions
- No auth

Focus: build all UI screens and interactions with hardcoded mock data and responses.

## Routes

```
/                               Dashboard — Job Offers list
/jobs/new                       Add Job Offer
/jobs/:jobId/themes             Key Interview Themes (job-scoped)
/jobs/:jobId/themes/:themeId    Writing Assistant — Relevant Experience
/jobs/:jobId/cover-letter       Writing Assistant — Cover Letter
/jobs/:jobId/cv                 Writing Assistant — Tailored CV
/experience                     Experience Library (global)
/experience/:experienceId       Writing Assistant — Relevant Experience
```

## Architecture Patterns

### Server / Client Component Split

Follow the Next.js App Router model — this is the primary architectural boundary:

- **Server Components** (`page.tsx`, layout files, async components): data fetching, mock service calls, pass data down as props. No `useState`, no event handlers.
- **Client Components** (any file with `'use client'`): interactivity, state, browser APIs, event handlers.

**Rule of thumb**: push `'use client'` as far down the tree as possible. Keep pages as Server Components; extract only the interactive parts into Client Components.

### Custom Hooks for Client Logic

Extract state logic and event handlers from Client Components into custom hooks:

```
frontend/app/hooks/use-themes.ts   ← state, handlers, derived values
```

Keeps components thin and logic testable.

### File Conventions

```
app/jobs/[jobId]/themes/
├── page.tsx              ← Server Component (data, layout)
├── themes-list.tsx       ← 'use client' (interactive UI) — named by what it renders
└── hooks/
    └── use-themes.ts     ← client-side logic
```

Client Components are named **descriptively** (e.g. `jobs-list.tsx`, `themes-list.tsx`). Never use a `-client` suffix.

#### Contexts

All React Contexts live in `app/context/`:

```
app/context/
├── jobs-context.tsx      ← JobsProvider + useJobs
└── themes-context.tsx    ← ThemesProvider + useThemes
```

## Testing Strategy

### Playwright E2E

- Tests live in `frontend/e2e/`
- Each test verifies one **Minimum Testeable Increment (MTI)**: navigate to a route and assert the key behaviour works
- Tests run against the dev server (`npm run dev`)
- Command: `npm run test:e2e` (from `frontend/`)

### Definition of Done

A feature is **Done** when:
1. The behaviour works in the browser without errors in the console
2. A Playwright test covers the MTI and passes

### What NOT to test

- shadcn/ui internals — already tested by the library
- Mock data shapes — they're test fixtures, not production logic
- CSS / visual layout — verified manually against design references

### Manual testing at phase end

Each phase ends with a manual test checklist defined in `Specs/PROGRESS.md`. After all Playwright tests pass, prompt the user to run the manual checklist before marking the phase as complete.

---

## Design

- App name: **Escribe**
- Primary colour: dark olive green (`#4a5c2f` approx) — used for CTA buttons
- Background: `stone-50`, surfaces: white, borders: `stone-200`
- Status badges: Done = emerald, In Progress = amber, To Do = stone
- AI chat accent: cyan
- Design references in `Specs/designs/` — check before building any screen

## Project Structure

```
/
├── frontend/
│   ├── app/          # App Router pages and layouts
│   └── e2e/          # Playwright tests (one file per MTI)
├── backend/
│   └── src/
├── Specs/
│   ├── PRD.md        # Product requirements (source of truth)
│   ├── PROGRESS.md   # MTI tracker
│   └── designs/      # UI design references (PNG screenshots)
├── CLAUDE.md         # This file
└── DECISIONS.md      # Technical decision log
