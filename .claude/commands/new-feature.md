Create a feature plan for: $ARGUMENTS

Save it to `Specs/plans/<kebab-case-name>.md` using the template below.
Derive the kebab-case filename from the feature name (e.g. "Cover Letter Persistence" → `cover-letter-persistence.md`).

Fill in each section based on what you know about the codebase and the feature description. For the test scenarios, be specific: name the exact route, the user action, and the expected assertion. For implementation notes, call out anything non-obvious — which existing pattern to follow, which files to mirror, any edge cases.

---

# Plan: <Feature Name>

## Context

<1–3 sentences: what exists today, what is missing, and why this feature is needed.>

## Acceptance criteria

- [ ] <user-visible behaviour 1>
- [ ] <user-visible behaviour 2>
- [ ] <user-visible behaviour 3>

## E2E test scenarios (Playwright)

File: `frontend/e2e/<feature-name>.spec.ts`

| # | Route | Action | Assertion |
|---|-------|--------|-----------|
| 1 | `/...` | <action> | <assertion> |
| 2 | `/...` | <action> | <assertion> |

## Unit test scenarios (Jest — *.prompts.ts and non-trivial service logic only)

File: `backend/src/<module>/<file>.spec.ts`

| Function / Method | Input | Expected output |
|-------------------|-------|-----------------|
| `<functionName>` | <input> | <expected> |

_Skip if the feature has no prompt-building logic or non-trivial service methods._

## Files to create / modify

| File | Action | Notes |
|------|--------|-------|
| `<path>` | Create / Modify / Delete | <what changes> |

## Implementation notes

<Key decisions, patterns to follow, files to mirror, edge cases to watch.>

## Verification

1. `npm run dev` from root
2. <specific manual check>
3. `npm run test:e2e` from `frontend/` — all tests pass
4. `npm run test` from `backend/` — all tests pass _(if backend prompt/service logic changed)_
