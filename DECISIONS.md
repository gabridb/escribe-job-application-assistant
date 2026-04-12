# Architecture Decision Records — Escribe

Decisions are in `Specs/decisions/`, one file per decision.

## Index

| ID | Title | Status |
| -- | ----- | ------ |
| [001](Specs/decisions/001-frontend-architecture.md) | Frontend architecture — Server/Client split + custom hooks | Accepted |
| [002](Specs/decisions/002-v1-frontend-only-scope.md) | V1 scope — frontend-only, mock AI | Superseded by 004 |
| [003](Specs/decisions/003-prompt-transport-split.md) | Backend AI — prompt/transport split | Accepted |
| [004](Specs/decisions/004-single-user-no-auth.md) | No authentication — single-user app in V2 | Accepted |
| [005](Specs/decisions/005-openrouter-model-choice.md) | OpenRouter as AI provider; Claude Opus for STAR coaching | Accepted |

## Format

Each ADR file uses this structure:

```markdown
---
id: "NNN"
title: Short title
date: YYYY-MM-DD
status: Proposed | Accepted | Deprecated | Superseded by #NNN
---

## Context
What situation forced this decision?

## Decision
What was decided, stated directly.

## Consequences
What becomes easier / harder. What follow-up decisions this creates.
```
