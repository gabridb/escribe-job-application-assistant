---
id: "001"
title: Frontend Architecture — Server/Client split + custom hooks
date: 2026-03-14
status: Accepted
---

## Context

Next.js App Router introduces a natural boundary between Server Components (run on the server, handle data fetching) and Client Components (run in the browser, handle interactivity). Before settling on a pattern, the Container-View pattern (a React pre-hooks approach where "container" components owned state and passed it as props to "view" components) was considered.

## Decision

Use the App Router Server/Client Component split as the primary architectural boundary, with custom hooks to encapsulate client-side state and logic.

- **Server Components** (`page.tsx`, layout files): fetch data, pass it as props — no `useState`, no event handlers
- **Client Components** (`'use client'` files): interactivity, state, browser APIs
- **Custom hooks** (`hooks/use-*.ts`): extract all state logic and event handlers out of Client Components

## Consequences

**Better:**
- Pages stay as Server Components — data fetching is co-located with the route, no loading flash
- Client Components are thin UI shells — easy to read and test
- Hooks are independently testable without mounting a component
- Clear rule: push `'use client'` as far down the tree as possible

**Worse:**
- New contributors need to understand the Server/Client boundary (but it's now the Next.js default pattern, well-documented)

**Rejected alternative:** Container-View is a legacy pattern that doesn't map cleanly onto App Router — there is no concept of "containers" in the App Router model.
