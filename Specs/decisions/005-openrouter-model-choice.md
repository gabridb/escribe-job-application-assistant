---
id: "005"
title: OpenRouter as AI provider; Claude Opus for STAR coaching
date: 2026-03-25
status: Accepted
---

## Context

The app needs to call an AI API for: job description analysis, Writing Assistant chat (three contexts: relevant experience, CV, cover letter). The API key must never reach the browser — it's a backend concern. Options were: direct Anthropic API, direct OpenAI API, or OpenRouter (a routing layer that supports many models).

## Decision

Use **OpenRouter** as the API provider. Model choices by feature:

| Feature | Model | Reason |
|---------|-------|--------|
| Job analysis | `meta-llama/llama-3.1-8b-instruct` | Fast, cheap, good at structured JSON extraction |
| Relevant experience coaching | `anthropic/claude-opus-4-6` | High-quality STAR coaching; worth the cost for this core feature |
| CV tailoring chat | `meta-llama/llama-3.1-8b-instruct` | Sufficient for CV editing assistance |
| Cover letter chat | `meta-llama/llama-3.1-8b-instruct` | Sufficient for writing assistance |
| Generic fallback | `meta-llama/llama-3.1-8b-instruct` | Default |

## Consequences

**Better:**
- Model flexibility — can swap models per feature without changing infrastructure
- Cheap fast models for high-frequency calls (job analysis, generic chat)
- Premium model reserved for the highest-value interaction (STAR coaching)
- API key is a single env var (`OPENROUTER_API_KEY`), never in the browser

**Worse:**
- OpenRouter adds a thin middleware layer (negligible latency)
- Slightly more complex billing (one OpenRouter account vs separate providers)

**Where model constants live:** In `*.prompts.ts` alongside the prompt they're designed for (see ADR 003).
