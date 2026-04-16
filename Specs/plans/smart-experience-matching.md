# Plan: Smart Experience Matching

## Context

When a user opens the Writing Assistant for a theme, the editor is empty and they must write from scratch. However, they may have already written a similar experience story for another theme (on this or a different job). This feature detects that similarity automatically, pre-populates the editor with the matched story, and explains in the chat where it came from — saving the user from rewriting the same narrative twice.

Matching happens at Writing Assistant open time (when `GET /jobs/:jobId/themes/:themeId/experience` is called and the experience record is empty). An LLM compares the current theme against all existing experiences. If a close match is found, the matched text is returned as `initialContent` and a contextual greeting replaces the normal empty-state message. The frontend (`relevant-experience-writing-assistant.tsx`) already wires `initialContent` and `initialGreeting` straight through to `WritingAssistant` — no frontend changes needed.

## Acceptance criteria

- [ ] When a user opens a theme's Writing Assistant with no experience written yet, the backend checks all existing `RelevantExperience` records across all themes (excluding the current one) for a semantically similar story
- [ ] If a match is found, the editor is pre-populated with the matched text and the chat shows a message identifying which theme it came from (e.g. "I found a similar story you wrote for [Theme Name]. I've loaded it into the editor — adapt it to fit this role.")
- [ ] If no match is found, or if there are no other experiences with content, the Writing Assistant opens normally (empty editor, standard STAR-method greeting)
- [ ] If the current theme already has a saved experience, matching is skipped entirely (existing content is never overwritten)
- [ ] If the LLM matching call fails, the page falls back silently to the normal empty state (no error surfaced to the user)

## E2E test scenarios (Playwright)

File: `frontend/e2e/smart-experience-matching.spec.ts`

| # | Route | Action | Assertion |
|---|-------|--------|-----------|
| 1 | `/jobs/new` | Create Job A with a description that generates a "Stakeholder Management" theme; navigate to that theme's Writing Assistant and save an experience story | Experience is saved (editor contains typed text) |
| 2 | `/jobs/new` | Create Job B with a similar description that generates a "Managing Stakeholders" theme; open that theme's Writing Assistant | Editor is pre-populated with the story written in step 1 |
| 3 | `/jobs/[jobBId]/themes/[themeId]` | Same page load as step 2 | Chat panel shows a message containing "I found" and the matched theme name |
| 4 | `/jobs/[jobAId]/themes/[themeId]` | Re-open the original theme after a match was shown on Job B | Editor still shows the original saved text (not overwritten) |

## Unit test scenarios (Jest — *.prompts.ts only)

File: `backend/src/relevant-experience/relevant-experience.prompts.spec.ts`

| Function / Method | Input | Expected output |
|-------------------|-------|-----------------|
| `buildExperienceMatchingPrompt` | theme `{ name: 'Leadership', description: 'Inspiring a team' }`, one candidate `{ themeName: 'Team Lead', text: 'I led a team of 5...' }` | Contains `"Leadership"`, `"Inspiring a team"`, `"Team Lead"`, `"I led a team"` |
| `buildExperienceMatchingPrompt` | theme, empty candidates `[]` | Contains theme name (no crash, no candidates listed) |
| `buildMatchGreeting` | `'Stakeholder Management'` | Contains `"Stakeholder Management"` and `"loaded it into the editor"` |

## Files to create / modify

| File | Action | Notes |
|------|--------|-------|
| `backend/src/relevant-experience/relevant-experience.prompts.ts` | Modify | Add `EXPERIENCE_MATCHING_MODEL`, `buildExperienceMatchingPrompt()`, `buildMatchGreeting()` |
| `backend/src/relevant-experience/relevant-experience.service.ts` | Modify | Inject `ConfigService`; add `findMatchingExperience()` private method; update `getByTheme()` |
| `backend/src/relevant-experience/relevant-experience.prompts.spec.ts` | Modify | Add tests for the two new prompt functions |
| `frontend/e2e/smart-experience-matching.spec.ts` | Create | E2E tests for the 4 scenarios above |

No module changes needed — `ConfigModule.forRoot({ isGlobal: true })` in `app.module.ts` makes `ConfigService` injectable everywhere.

## Implementation notes

### Prompt / transport split

Mirror the pattern in `jobs.prompts.ts` / `jobs.service.ts`:
- All prompt strings in `relevant-experience.prompts.ts` (pure functions, no NestJS)
- OpenRouter HTTP call in `relevant-experience.service.ts` (same `fetch` pattern as `JobsService.analyzeJob()`)

### Matching prompt — `buildExperienceMatchingPrompt()`

Model: `meta-llama/llama-3.1-8b-instruct` (cheap, fast — same as job analysis)

The function produces this prompt (example with 2 candidates):

```
You are a career assistant. Decide whether any candidate experience below closely matches the given interview theme. A "close match" means the experience could be adapted to answer this theme with minimal rewriting.

Current theme:
Name: Stakeholder Management
Description: Ability to align and influence stakeholders across the organisation.

Candidate experiences:
[0] Theme: Cross-team Collaboration
I was working on a major platform migration when three teams had conflicting priorities...

[1] Theme: Leadership Under Pressure
During a product launch, I had to convince the board to delay the release...

Return ONLY valid JSON with no additional text or markdown:
{
  "matchIndex": <0-based index of the best match, or -1 if no candidate is a close match>,
  "reason": "<one sentence explanation>"
}

Important: return -1 if no candidate is genuinely closely related. Do not force a match.
```

Implementation detail: truncate each candidate's `text` to 400 characters before embedding in the prompt. Limit candidates to 10.

### `buildMatchGreeting()` output

```
I found a similar story you wrote for "Stakeholder Management". I've loaded it into the editor — adapt it to fit this role.
```

### `findMatchingExperience()` private method in the service

```ts
private async findMatchingExperience(
  currentThemeId: string,
  theme: { name: string; description: string },
): Promise<{ text: string; themeName: string } | null>
```

Steps:
1. Query all `RelevantExperience` with `themeId != currentThemeId AND text != ''`, JOIN with `Theme`, LIMIT 10
2. If result is empty → return `null` (no LLM call)
3. Build candidates with truncated text, call OpenRouter (`response_format: { type: 'json_object' }`)
4. Parse `matchIndex` — if `-1` or invalid → return `null`
5. Return `{ text: fullText, themeName }` for the winning candidate
6. Entire method wrapped in try/catch — on error, log and return `null`

### Updated `getByTheme()`

```ts
const text = experience?.text ?? '';
if (text.trim()) {
  // Has existing content — skip matching
  return { text, initialGreeting: buildInitialGreeting(theme?.name ?? '', true) };
}
// No content — try matching
const match = await this.findMatchingExperience(themeId, theme ?? { name: '', description: '' });
if (match) {
  return { text: match.text, initialGreeting: buildMatchGreeting(match.themeName) };
}
return { text: '', initialGreeting: buildInitialGreeting(theme?.name ?? '', false) };
```

### Auto-save side effect

When a match is found, `initialContent` is set to the matched text. The Writing Assistant auto-saves after 1.5 s of inactivity, so the matched text will be upserted as the user's own experience for this theme on first load. This is intended — it becomes their editable starting point.

## Verification

1. `npm run dev` from root
2. Add a job, write and save a relevant experience for one of its themes
3. Add a second job whose description generates a semantically similar theme
4. Open the Writing Assistant for the similar theme — editor should be pre-populated and chat should show the match message
5. Re-open the original theme — editor still shows its original content (not overwritten)
6. `npm run test:e2e` from `frontend/` — all tests pass
7. `npm run test` from `backend/` — all tests pass
