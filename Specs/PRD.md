# Product Requirements Document — Escribe
### AI-Powered Job Application Assistant

**Version**: 2.0
**Date**: 2026-03-15
**Status**: In Progress — V2 (real AI + backend)

---

## 1. Glossary

| Term | Definition |
|------|------------|
| **Job Offer** | A job description the user has added to Escribe, representing one application they are pursuing |
| **Key Interview Themes** | The competencies and topics extracted from a Job Offer that the interview is likely to probe (e.g. "Stakeholder Management", "Data-Driven Decision Making") |
| **Relevant Experience** | A real-life story written by the user to demonstrate a Key Interview Theme |
| **Experience Library** | The global, job-agnostic collection of all Relevant Experience examples the user has written, reusable across applications |
| **Writing Assistant** | The shared split-screen editor (AI chat + rich text) used to write and refine Relevant Experience, Cover Letters, and CV tailoring |
| **Cover Letter** | A personalised letter generated for a specific Job Offer, drawing on the user's CV and Relevant Experience |
| **CV** | The user's base curriculum vitae, uploaded once and used as context across all applications |
| **Tailored CV** | A job-specific version of the CV adapted by the user with AI guidance for a particular Job Offer |

---

## 2. Overview

### 2.1 Product Summary

Escribe is an AI-powered writing assistant that helps job seekers produce tailored, high-quality application materials for each role they pursue. It centralises a user's CV and job offers in one place, then uses AI to help them prepare interview examples, write cover letters, and adapt their CV — all grounded in the specific job description.

### 2.2 Problem Statement

Job seekers applying to multiple roles face a fragmented, time-consuming process:
- Rewriting the same stories and examples from scratch for every application
- Struggling to tailor their CV and cover letter without clear guidance
- Not knowing which experiences best match a given job's requirements
- Interview preparation is disconnected from the application materials

### 2.3 Target Users

- Professionals actively job searching and applying to multiple roles simultaneously
- People who want structured, AI-assisted guidance rather than generic advice

### 2.4 Core Value Proposition

> "The AI writing assistant that writes *with* you, not *for* you."

Escribe turns a scattered, stressful job search into a guided, AI-assisted workflow that produces polished, tailored materials for every application.

---

## 3. User Flow

```
Upload CV (once, global)
    │
    ▼
Dashboard — Job Offers list
    │
    ├── Add Job Offer (paste text or upload file)
    │
    └── Per Job Offer:
            ├── Key Interview Themes  →  Writing Assistant (Relevant Experience per theme, drawn from global library)
            ├── Cover Letter          →  Writing Assistant
            └── CV                   →  Writing Assistant
```

---

## 4. Features & Screens

---

### 3.1 Global: CV Upload

**Purpose**: Establish the user's base profile used across all job applications.

**Behaviour**:
- User uploads their CV once (PDF, DOC, DOCX, TXT — max 10 MB)
- CV text is extracted and stored globally
- All subsequent AI interactions (cover letter, CV tailoring, experience matching) use this as context
- User can replace their CV at any time; existing applications retain the version used

---

### 3.2 Dashboard — Job Offers

**Design reference**: `1. Dashboard.png`
**Purpose**: Central hub to manage all job applications.

---

### 3.3 Add Job Offer

**Design reference**: `1.1. Add new job offer.png`
**Purpose**: Ingest a job description into the system.

---

### 3.4 Key Interview Themes — Relevant Experience

**Design reference**: `Key Interview Themes.png`

**Purpose**: Show the key themes extracted from the job description, each linked to a writing task where the user prepares a real-life example.

**Themes are job-scoped**:
- Each Job Offer has its own list of Key Interview Themes, generated from that job's description
- The same competency (e.g. "Stakeholder Management") may appear across multiple jobs under slightly different names or emphasis — this is intentional, as the context differs per role
- Themes are not shared or merged across jobs; they remain tied to the job they were generated for

**Reuse happens at the Experience level, not the Theme level**:
- The *written story* behind a theme is what gets reused, via the Experience Library
- When a new job generates themes, the AI checks the Experience Library for semantically matching examples (e.g. "Cross-team Alignment" → matches existing "Stakeholder Management" story)
- Matching examples are surfaced as suggestions: "You already have an experience for this — would you like to reuse it?"
- The user can load the existing story into the editor and refine it for the new job's context, or start fresh
- The theme itself stays job-specific; the story behind it is global and reusable

**Status logic**:
- **To Do**: no content written yet (no existing library match found)
- **In Progress**: content exists but user has not saved as done
- **Done**: user explicitly saved the example as complete

---

### 3.5 Writing Assistant — Relevant Experience

**Design reference**: `Relevant Experience - Writer.png`

**Purpose**: Help the user write and refine a real-life example that demonstrates the theme.

---

### 3.6 Writing Assistant — Cover Letter

**Design reference**: `Cover Letter - Writer.png`

**Purpose**: Help the user write a personalised cover letter for the job.

---

### 3.7 Writing Assistant — CV Tailoring

**Design reference**: `CV - Writer.png`

**Purpose**: Help the user adapt their base CV to the specific job.

---

## 5. Shared Component: Writing Assistant

All three writing modes (Relevant Experience, Cover Letter, CV) use the same underlying component. The differences are:

| Attribute | Relevant Experience | Cover Letter | CV |
|-----------|--------------------|--------------|----|
| AI context | Job + theme + CV | Job + CV + examples | Job + base CV |
| Initial content | Blank / AI draft | AI-generated draft | User's base CV |
| Title source | Theme name | "Cover Letter" | "CV" |

---

## 6. AI Behaviour

### 5.1 Context Hierarchy

Every AI interaction is grounded in:
1. The user's base CV (always present)
2. The job description and extracted analysis (for all job-specific pages)
3. Completed relevant experience examples (for cover letter generation)
4. The current document content (for inline editing assistance)

### 5.2 AI Capabilities

| Capability | Where used |
|------------|------------|
| Extract structured job data | Add Job Offer |
| Generate key interview themes | Add Job Offer (auto) |
| Match new themes against experience library | Add Job Offer (auto) |
| Draft example from theme + CV | Relevant Experience writer |
| Generate cover letter | Cover Letter writer |
| Suggest CV tailoring | CV writer |
| Inline document editing via chat | All writing assistants |

### 5.3 Principles
- AI assists and suggests; the user always edits and approves final content
- AI responses are grounded in the user's own CV and experiences — it does not fabricate credentials
- Disclaimer shown on all AI-assisted writing: "AI can make mistakes. Review important information."

---

## 7. Navigation & Information Architecture

```
/                                    Dashboard (Job Offers list)
/jobs/new                            Add Job Offer
/jobs/:jobId/themes                  Key Interview Themes (for a specific Job Offer)
/jobs/:jobId/themes/:themeId         Writing Assistant — Relevant Experience
/jobs/:jobId/cover-letter            Writing Assistant — Cover Letter
/jobs/:jobId/cv                      Writing Assistant — Tailored CV

/experience                          Experience Library (global, all Relevant Experiences)
/experience/:experienceId            Writing Assistant — Relevant Experience (library context)
```

**Distinction between the two experience views**:
- `/jobs/:jobId/themes` — scoped to one Job Offer; shows the Key Interview Themes generated specifically for that role; AI context includes the job description; themes are not shared across jobs
- `/experience` — global Experience Library; shows all Relevant Experience stories the user has written across every application; job-agnostic; used for reviewing, polishing, and reusing stories independently of any specific role

---

## 8. Design System

### 8.0 Component Library

- **shadcn/ui** — base UI component library (buttons, inputs, badges, dialogs, tables, etc.)
- Components are built on Radix UI primitives and styled with Tailwind CSS
- Customise shadcn components to match the Escribe colour palette; do not override with one-off inline styles

### 7.1 Layout

- Standard page layout: header → page title + subtitle → content card → footer
- Writing assistant: full-height split-screen (left chat / right editor)
- Content max-width: ~1280px, centred

### 7.2 Color Palette

| Token | Value | Use |
|-------|-------|-----|
| Background | `stone-50` (#fafaf9) | Page background |
| Surface | `white` | Cards, panels |
| Border | `stone-200` | Card borders |
| Primary | `olive/dark-green` (~#4a5c2f) | CTA buttons (per designs) |
| Primary text | `stone-900` | Headings |
| Secondary text | `stone-600` | Subtitles |
| Status — Done | `emerald-600` | Badge |
| Status — In Progress | `amber-600` | Badge |
| Status — To Do | `stone-400` | Badge |
| AI accent | `cyan-600` | AI avatar / indicators |

### 7.3 Status Badges

Used on the Key Interview Themes list:
- **Done**: green pill
- **In Progress**: amber pill
- **To Do**: grey pill

### 7.4 Typography

- Page titles: bold, ~2xl
- Subtitles: regular, stone-600
- Body: regular, stone-900
- Monospace / editor: standard prose

---

## 10. Scope

### In scope (V2 — current)
- Real AI via **OpenRouter** (backend-side API calls, key never reaches browser)
- **PostgreSQL** database for all persistence — replaces localStorage
- NestJS REST API consumed by the frontend services layer
- AI-powered job analysis: extract title, company, and Key Interview Themes from pasted job description
- AI-powered Writing Assistant chat: responses grounded in job description + user CV

### Out of scope (still deferred)
- Mobile layout
- Export to PDF / DOCX
- Application status tracking (e.g., "Applied", "Interview scheduled")
- CV alignment score / skills gap visualisation
- Version history / diff comparison
- File parsing (PDF/DOCX) — raw text input only
- User authentication / multi-user accounts

---

## 11. Open Questions

1. ~~Should Key Interview Themes be regenerated if the user edits the job description?~~ **Resolved**: Yes — themes are job-scoped and derived from the job description, so editing the description should offer to regenerate them. Existing written experiences are preserved regardless, since they live in the global Experience Library.
2. Should a "mark as done" explicit action exist, or should Done be inferred from content length?
3. Should the AI pre-fill the rich text editor with a draft on first open, or wait for user to request it?
4. Is CV upload a one-time onboarding step, or always accessible from settings?
5. ~~Should completed experience examples be reusable across different job applications?~~ **Resolved**: Yes — examples are stored in a global library and surfaced as suggestions when a new job generates matching themes.
