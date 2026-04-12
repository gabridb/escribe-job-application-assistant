---
id: "002"
title: V1 scope — frontend-only, mock AI
date: 2026-03-14
status: Superseded by 004
---

## Context

At the start of the project, there were two options: (a) build the full stack immediately or (b) build the frontend first with mocked AI and localStorage, then integrate the backend in V2. The product had many unknowns: what the Writing Assistant should feel like, how themes should be presented, what the dashboard flow looked like.

## Decision

V1 is frontend-only:
- AI responses are hardcoded mocks — no real API calls
- State is kept in memory / localStorage — no database
- Input is plain text only — no file parsing

## Consequences

**Better:**
- All screens and user flows validated before writing any backend code
- Fast iteration — no Docker, no DB setup, no API keys needed
- Easy to share/demo without infrastructure

**Worse:**
- The mock → real AI transition in V2 requires touching both services and context layers

**Status:** Superseded — V2 (Phases 6–8) activated the real backend. See ADR 004 for the no-auth decision that carries forward.
