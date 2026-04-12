---
id: "004"
title: No authentication — single-user app in V2
date: 2026-03-25
status: Accepted
---

## Context

When activating the real backend (Phase 7), the question arose: add authentication now, or defer it? Options were (a) JWT-based auth, (b) session-based auth, or (c) no auth — single-user assumption.

## Decision

No authentication in V2. The app assumes a single user. All API endpoints are unprotected.

## Consequences

**Better:**
- Dramatically simpler backend — no auth middleware, no user concept in the DB schema
- Faster to build and iterate on the actual features
- No user management UI needed

**Worse:**
- App cannot be deployed for multiple users without a full auth rewrite
- All data is globally accessible (acceptable for a local/personal tool)

**Out of scope for V2:**
- User registration, login, sessions, JWTs
- Row-level security / data isolation
- Any multi-tenancy concept

**When to revisit:** If the app is ever deployed for external users or needs to be shared between devices.
