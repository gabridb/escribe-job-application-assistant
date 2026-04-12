---
id: "003"
title: Backend AI — prompt/transport split (*.prompts.ts + *.service.ts)
date: 2026-03-20
status: Accepted
---

## Context

Early backend code mixed prompt-building logic with HTTP transport inside the same service file. This made prompts hard to iterate on (you had to understand NestJS plumbing to find the prompt string), and impossible to unit-test without mocking the entire OpenRouter HTTP call.

## Decision

Every backend AI feature uses a mandatory two-file split:

| File | Responsibility |
|------|---------------|
| `*.prompts.ts` | Pure functions that build prompt strings. No NestJS, no HTTP, no side effects. |
| `*.service.ts` | Transport only — calls OpenRouter, returns parsed result. No prompt logic. |

The model constant (e.g. `RELEVANT_EXPERIENCE_MODEL`) lives in `*.prompts.ts` because the model and prompt are tightly coupled — changing one usually requires changing the other.

## Consequences

**Better:**
- Prompts are readable in isolation — no framework noise
- Jest unit tests for `*.prompts.ts` need zero mocks
- Changing a model or prompt wording is a one-file edit
- Different modules can independently choose their model

**Worse:**
- Two files to open instead of one when debugging an AI feature
- Discipline required: service files must resist the temptation to contain prompt logic

**Rule:** If you catch yourself writing a string template in a `*.service.ts` file, move it to `*.prompts.ts`.
