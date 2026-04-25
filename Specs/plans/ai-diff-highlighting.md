# Plan: AI Diff Highlighting in Writing Assistant

## Context

Today the Writing Assistant silently overwrites the editor content when the AI returns a rewrite — the user has no visibility into what changed. This feature adds a **co-write mode**: when the AI rewrites the document, changes are highlighted inline (green = added, red = struck-through deletion) and the user can Accept or Reject before anything is saved. This gives the user control and makes the AI feel collaborative rather than destructive.

## Acceptance criteria

- [ ] When AI rewrites the editor content, green/red diff highlights appear immediately instead of a silent replace
- [ ] An "Accept / Reject" bar replaces the save-status area in the editor header during diff mode
- [ ] Clicking Accept applies the new content cleanly (no marks), auto-save fires
- [ ] Clicking Reject restores the original content, no marks remain
- [ ] The editor is non-editable and the chat Send button is disabled while a diff is pending
- [ ] Auto-save is suppressed while a diff is pending (nothing written to DB until Accept)
- [ ] If AI rewrites the entire document (>80% changed), show a "full rewrite" banner instead of noisy mark-up

## E2E test scenarios (Playwright)

File: `frontend/e2e/ai-diff-highlighting.spec.ts`

| # | Route | Action | Assertion |
|---|-------|--------|-----------|
| 1 | `/jobs/:jobId/themes/:themeId` | Mock AI response with `<editor_content>` tag, send message | Editor shows green/red highlighted spans; Accept and Reject buttons visible |
| 2 | Same | Click Accept | Editor content matches AI version; no highlight spans; save-status shows "Saving..." |
| 3 | Same | Click Reject | Editor content matches original; no highlight spans; Accept/Reject bar gone |
| 4 | Same | While diff is pending, inspect Send button | Send button is disabled |

## Unit test scenarios (Jest)

File: `frontend/app/components/tiptap-extensions/apply-diff.spec.ts`

> This feature has no backend prompt logic. Jest unit tests cover the diff utility function.

| Function / Method | Input | Expected output |
|-------------------|-------|-----------------|
| `buildDiffHtml` | `original='Hello world'`, `revised='Hello there world'` | HTML string contains `<span data-diff="insertion">there </span>` |
| `buildDiffHtml` | `original='Hello world'`, `revised='Hello'` | HTML string contains `<span data-diff="deletion">world</span>` |
| `buildDiffHtml` | `original='foo'`, `revised='bar'` with >80% change ratio | Returns `null` (triggers full-rewrite fallback) |

## Files to create / modify

| File | Action | Notes |
|------|--------|-------|
| `frontend/package.json` | Modify | Add `diff` runtime dep + `@types/diff` dev dep |
| `frontend/app/components/tiptap-extensions/diff-marks.ts` | Create | `InsertionMark` and `DeletionMark` Tiptap mark extensions |
| `frontend/app/components/tiptap-extensions/apply-diff.ts` | Create | `buildDiffHtml(original, revised): string \| null` + `applyDiffToEditor(editor, original, revised)` |
| `frontend/app/components/rich-text-editor.tsx` | Modify | Add new props, register marks, add diff useEffect, capture original snapshot in ref |
| `frontend/app/components/hooks/use-writing-assistant.ts` | Modify | Add `pendingAiContent`, `resolveMode` state; change AI content handler to set pending instead of applying directly |
| `frontend/app/components/writing-assistant.tsx` | Modify | Wire new props to `RichTextEditor`; render Accept/Reject bar; suppress auto-save during diff |
| `frontend/app/globals.css` | Modify | Add `.tiptap-insertion` and `.tiptap-deletion` CSS classes |

## Implementation notes

### Diff stack

- **`diff` npm package (`diffWords`)** — computes word-level changeset between original and AI markdown. Word-level is the right granularity for prose; character-level (`diff-match-patch`) produces noisy single-character hunks.
- **Custom `InsertionMark` / `DeletionMark` Tiptap mark extensions** — render the changeset inline in the editor.

### Tiptap marks

- `InsertionMark`: renders `<span data-diff="insertion" class="tiptap-insertion">` — green background
- `DeletionMark`: renders `<span data-diff="deletion" class="tiptap-deletion">` — red background + `line-through`
- The `Markdown` extension is configured with `html: false`, so HTML cannot go through `setContent`. Instead, build the diff HTML string then parse it via ProseMirror's `DOMParser.fromSchema(editor.schema).parse(dom)` (bypasses the Markdown extension), then apply via `editor.commands.setContent(doc.toJSON())`.
- Register both marks in the `useEditor` extensions array.

### State in `use-writing-assistant.ts`

Add:
```ts
const [pendingAiContent, setPendingAiContent] = useState<string | null>(null)
const [resolveMode, setResolveMode] = useState<'accept' | 'reject' | null>(null)
const isDiffMode = pendingAiContent !== null
```

Change the AI content handler (in both `sendMessage` and `sendPredefinedMessage`):
```ts
// Before:
if (parsed.editorContent) setEditorContent(parsed.editorContent)
// After:
if (parsed.editorContent) setPendingAiContent(parsed.editorContent)
```

Add handlers:
- `acceptAiChange` → `setResolveMode('accept')`
- `rejectAiChange` → `setResolveMode('reject')`
- `handleDiffResolved(finalMarkdown)` → `setEditorContent(finalMarkdown)`, clear both state values

### `RichTextEditor` new props

```ts
pendingDiffContent?: string | null
resolveMode?: 'accept' | 'reject' | null
onResolved?: (markdown: string) => void
```

Two new `useEffect`s:

1. **Diff effect** — fires when `pendingDiffContent` becomes non-null:
   - Snapshot current `content` into `originalSnapshot.current` (useRef)
   - `editor.setEditable(false)`
   - `applyDiffToEditor(editor, content, pendingDiffContent)`

2. **Resolve effect** — fires when `resolveMode` changes:
   - `editor.setEditable(true)`
   - Accept: `editor.commands.setContent(pendingDiffContent)` — apply clean AI markdown directly
   - Reject: `editor.commands.setContent(originalSnapshot.current)` — restore snapshot
   - Call `onResolved(finalMarkdown)`

### Accept/Reject bar in `writing-assistant.tsx`

Replace the save-status area:
```tsx
{isDiffMode ? (
  <div className="flex items-center gap-2">
    <span className="text-xs text-stone-400">AI suggested changes</span>
    <Button size="sm" onClick={acceptAiChange}>Accept</Button>
    <Button size="sm" variant="outline" onClick={rejectAiChange}>Reject</Button>
  </div>
) : (
  // existing save status spans
)}
```

Guard auto-save: add `if (isDiffMode) return` at the top of the auto-save useEffect.

Disable chat input: add `|| isDiffMode` to the Send button and textarea `disabled` condition.

### CSS (globals.css)

```css
.tiptap-insertion {
  background-color: rgb(187 247 208); /* emerald-200 */
  border-radius: 2px;
}
.tiptap-deletion {
  background-color: rgb(254 202 202); /* red-200 */
  text-decoration: line-through;
  opacity: 0.75;
}
```

### Full-rewrite fallback

In `buildDiffHtml`, compute `changedWords / totalWords`. If > 0.8, return `null`. In `applyDiffToEditor`, if `null` is returned, skip inline marks and instead show "Full document replaced" in the Accept/Reject banner. Accept/Reject still work the same way.

## Verification

1. `npm install` from `frontend/` to pull in the `diff` package
2. `npm run dev` from root
3. Open any Writing Assistant route (e.g. `/jobs/:jobId/themes/:themeId`)
4. Trigger an AI rewrite — assert green/red highlights appear and Accept/Reject bar is visible
5. Click Accept — assert clean content, no spans, save-status returns
6. Repeat, click Reject — assert original content is restored
7. `npm run test:e2e` from `frontend/` — all tests pass
8. No backend changes — skip `npm run test` from backend
