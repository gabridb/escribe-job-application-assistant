# Figma Design Plan - Job Seeker Assistant

## Project Description
Go to [overview.md](overview.md)

## Setup (Do This First)

Install before opening Figma:
- **shadcn/ui Figma kit** — your component source of truth
- **Tailwind CSS Color palette plugin** — keeps colors in sync with your build

### File structure in Figma:
```
📁 Writing Assistant
  📄 00 - Design System
  📄 01 - Shell & Navigation
  📄 02 - Writing Assistant Mode
  📄 03 - Job Applications Mode
  📄 04 - Prototype Flow
```

---

## Page 1 — Design System

Before any screens, define these. You'll thank yourself when vibe-coding.

### Colors — Warm Slate palette (map directly to Tailwind tokens):

| Role | Token | Hex |
|------|-------|-----|
| Background | `stone-50` | #fafaf9 |
| Surface | `white` | #ffffff |
| Border | `stone-200` | #e7e5e4 |
| Primary | `teal-600` | #0d9488 |
| Primary Hover | `teal-700` | #0f766e |
| Primary Light | `teal-50` | #f0fdfa |
| Success (matched skills) | `emerald-600` | #059669 |
| Success Light | `emerald-50` | #ecfdf5 |
| Danger (missing skills) | `red-600` | #dc2626 |
| Danger Light | `red-50` | #fef2f2 |
| Warning (partial) | `amber-600` | #d97706 |
| Warning Light | `amber-50` | #fffbeb |
| Text Primary | `stone-900` | #1c1917 |
| Text Secondary | `stone-600` | #57534e |
| Text Muted | `stone-400` | #a8a29e |
| AI Assistant accent | `cyan-600` | #0891b2 |
| AI Chat bubble bg | `cyan-50` | #ecfeff |

### Typography — just 4 styles:
- Heading L/M, Body, Caption

### Core components to build here:
- **Skill badge** (matched / missing / neutral variants)
- **Chat bubble** (user / assistant variants)
- **Step indicator** (active / complete / locked)
- **Alignment score ring** (empty, loading, 3 color states)
- **STAR section card**

---

## Page 2 — Shell & Navigation

This is your most important design decision. Get it right before touching any content screens.

### Design these 3 things only:

1. **The split-screen shell at 1440px** — chat panel fixed at 380px, content panel fluid. Include the top nav with mode switcher (Writing Assistant ↔ Job Applications).

2. **Chat panel anatomy** — header, message list area, input bar. Design 3 states: empty, mid-conversation, loading response.

3. **Wizard step navigation** — the 5-step progress bar that sits at the top of the right panel in Job Applications mode. Active / complete / locked states.

---

## Page 3 — Writing Assistant Mode

Two screens:

**Screen A — Empty state** — what the user sees first. Both panels empty with clear prompts to start.

**Screen B — Active state** — editor has content with an inline AI suggestion visible (highlight + accept/reject controls). Chat panel has a short conversation. This is your hero screen, spend time here.

---

## Page 4 — Job Applications Mode

One screen per wizard step. For each, only design the right panel content — the shell and chat panel don't change.

### Step 1 — Job Analysis
File upload area + extracted job analysis output (company name, skills chips, responsibilities list). Design both empty and populated states.

### Step 2 — STAR Examples
The rich text editor + the STAR review card below it with 4 framework questions and the 1-5 star rating. This is complex — worth spending time on.

### Step 3 — CV Review
The alignment score ring + two-column skills comparison + three collapsible suggestion sections. Use your skill badge components from the design system.

### Step 4 — Cover Letter
Generated letter in the editor with refinement controls. Simpler screen, don't over-engineer it.

### Persistent job summary sidebar
A narrow collapsed panel on the far right showing company + role at a glance. Appears on steps 2–4.

---

## Page 5 — Prototype Flow

Wire up this single clickable flow:

**Upload job → See job analysis → Open STAR editor → Submit for review → See STAR card with score → Navigate to CV Review → See alignment score populate**

This is what you'll demo to yourself (and your team) before writing code. It'll surface navigation decisions you haven't thought about yet.

---

## Figma-to-Cursor Handoff Tips

When you're ready to code, annotate each screen with:
- Component names matching your planned folder structure
- Tailwind color tokens (e.g., `bg-green-100`, `text-red-600`) directly on the skills badges
- Notes on any animated elements (score ring fill, step transition)

That annotation layer becomes your Cursor prompt vocabulary.

---

## Suggested time allocation

- **Design System**: 2h
- **Shell**: 1.5h
- **Writing Mode**: 1h
- **Job App steps**: 3h
- **Prototype**: 1h

**Total**: Around 8–9 hours for a solid mid-fidelity foundation.

---

Want me to help design any specific screen or component in more detail?
