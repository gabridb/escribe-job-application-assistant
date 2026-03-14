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
| Dev | `npm run dev` — runs both frontend and backend concurrently |

## Project Structure

```
/
├── frontend/         # Next.js app
│   └── app/          # App Router pages and layouts
├── backend/          # NestJS API
│   └── src/          # Controllers, services, modules
├── Specs/
│   ├── PRD.md        # Product requirements (source of truth)
│   ├── designs/      # UI design references (PNG screenshots)
│   └── color-palettes.md
└── CLAUDE.md         # This file
```

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
- **Client Components** (`*-client.tsx` or any file with `'use client'`): interactivity, state, browser APIs, event handlers.

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
├── themes-list.tsx       ← 'use client' (interactive UI)
└── hooks/
    └── use-themes.ts     ← client-side logic
```

## Design

- App name: **Escribe**
- Primary colour: dark olive green (`#4a5c2f` approx) — used for CTA buttons
- Background: `stone-50`, surfaces: white, borders: `stone-200`
- Status badges: Done = emerald, In Progress = amber, To Do = stone
- AI chat accent: cyan
- Design references in `Specs/designs/` — check before building any screen
