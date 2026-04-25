# Plan: Tiptap Rich Text Editor

## Context

The Writing Assistant currently uses a plain `<textarea>` for the editor panel. Users cannot apply any text formatting (bold, italic, lists, headings) to their cover letters, CVs, or STAR experience answers. Replacing the textarea with a Tiptap editor adds rich text formatting while keeping the existing AI chat, auto-save, and word-count logic intact. Content will be stored as **Markdown** — compact, portable, and the format AI models naturally read and write.

## Acceptance criteria

- [ ] A formatting toolbar is visible above the editor with: Bold, Italic, Bullet list, Ordered list, Heading 2
- [ ] Selecting text and clicking a toolbar button applies the format visually
- [ ] Formatted content is persisted (auto-saved to the backend as Markdown)
- [ ] When the AI writes content into the editor the text appears correctly with formatting rendered
- [ ] The word count logic (used to show/hide the suggested-reply panel) still works correctly
- [ ] Existing plain-text content loaded from the database renders correctly in the editor

## E2E test scenarios (Playwright)

File: `frontend/e2e/tiptap-rich-text-editor.spec.ts`

| # | Route | Action | Assertion |
|---|-------|--------|-----------|
| 1 | `/jobs/job-1/themes/theme-1-1` | Page loads | Tiptap editor div (`data-testid="editor-content"`) is visible; old textarea is gone |
| 2 | `/jobs/job-1/themes/theme-1-1` | Type text into the editor | Text appears in the editor |
| 3 | `/jobs/job-1/themes/theme-1-1` | Click the Bold toolbar button | Bold button has an active/pressed state |
| 4 | `/jobs/job-1/themes/theme-1-1` | Type 10+ words, then send a chat message | Chat request body `editorContent` is plain text (no markdown syntax, no HTML tags) |

### Existing tests that need updating

The tests in `frontend/e2e/phase4-writing-assistant.spec.ts` interact with `getByTestId('editor-textarea')` using `.fill()` and `.toHaveValue()`, which are textarea-specific. They must be migrated to target the Tiptap contenteditable div:

- Replace `getByTestId('editor-textarea')` → `getByTestId('editor-content')`
- Replace `.fill(text)` → `.click()` then `page.keyboard.type(text)` (or keep `.fill()` — Playwright supports contenteditable fill)
- Replace `.toHaveValue(text)` → `.textContent()` assertion
- The `editorContent` in chat request body assertions: content sent to AI must be plain text (stripped of markdown syntax)

## Unit test scenarios (Jest)

_No prompt-building logic changes — skip._

## Files to create / modify

| File | Action | Notes |
|------|--------|-------|
| `frontend/package.json` | Modify | Add `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `@tiptap/extension-markdown` |
| `frontend/app/components/rich-text-editor.tsx` | Create | Tiptap editor + toolbar component; accepts `content`, `onChange`, `placeholder` props; `content`/`onChange` speak Markdown |
| `frontend/app/components/writing-assistant.tsx` | Modify | Replace `<textarea>` with `<RichTextEditor>`; word count uses plain text derived from markdown |
| `frontend/app/components/hooks/use-writing-assistant.ts` | Modify | `editorContent` stores **Markdown**; `editorText` (plain text, markdown stripped) used for AI payload and word count |
| `frontend/e2e/phase4-writing-assistant.spec.ts` | Modify | Update selectors and assertions to work with contenteditable (see above) |
| `frontend/e2e/tiptap-rich-text-editor.spec.ts` | Create | New E2E tests for toolbar and formatting |

## Implementation notes

### Tiptap packages
Install:
```
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder @tiptap/extension-markdown
```

- `@tiptap/starter-kit` — Bold, Italic, Heading, BulletList, OrderedList, Paragraph, HardBreak, History (undo/redo)
- `@tiptap/extension-placeholder` — greyed-out placeholder text
- `@tiptap/extension-markdown` — adds `.storage.markdown.getMarkdown()` and lets `setContent()` accept markdown strings directly

### `rich-text-editor.tsx` component
- Props: `content: string` (Markdown), `onChange: (markdown: string) => void`, `placeholder?: string`
- Uses `useEditor` from `@tiptap/react` with `StarterKit`, `Placeholder`, and `Markdown` extensions
- On `onUpdate`: call `onChange(editor.storage.markdown.getMarkdown())`
- When `content` prop changes externally (AI overwrites): use a `useEffect` on `content` to call `editor.commands.setContent(content)` — Tiptap + the Markdown extension will parse it
- Toolbar buttons use `lucide-react` icons already in the project: `Bold`, `Italic`, `List`, `ListOrdered`, `Heading2`
- Active state: `editor.isActive('bold')` → apply active class to toolbar button
- Put `data-testid="editor-content"` on the `<EditorContent>` element

### Hook changes (`use-writing-assistant.ts`)
- `editorContent` stores **Markdown** (e.g. `**bold** text\n\n- list item`)
- Add `editorText` — plain text for sending to AI and for word count. Strip markdown syntax with a simple regex or `editor.getText()` via a ref. Simplest: pass `editorText` up from the `RichTextEditor` component alongside the markdown via a second `onTextChange` callback, using `editor.getText()`.
- When AI returns content in `<editor_content>markdown</editor_content>`, set `editorContent` directly — no conversion needed since the AI will now return markdown

### AI prompt change (backend)
The system prompt in `chat.prompts.ts` currently instructs the AI to return plain text inside `<editor_content>` tags. Update the instruction to say: **return valid Markdown** inside `<editor_content>` tags (e.g. use `**bold**`, `- lists`, `## headings`). Models handle this reliably.

### Word count
Currently: `editorContent.trim().split(/\s+/).filter(Boolean).length`  
After: use `editorText` (plain text from `editor.getText()`) instead — same split logic.

### Auto-save
`onSave(editorContent)` saves markdown string. The backend `TEXT` column accepts any string — no migration needed. Existing plain-text rows load as plain text into Tiptap (treated as an unmarked paragraph, renders correctly).

### Toolbar styling
`border-b border-stone-200 px-3 py-2 flex gap-1 bg-white` for the toolbar bar.  
Buttons: `size-8 rounded hover:bg-stone-100`; active state: `bg-stone-100 text-stone-900`.  
Matches the existing stone/olive design system.

### No `data-testid="editor-textarea"` after this change
Remove it from the textarea; add `data-testid="editor-content"` to `<EditorContent>`. Update all references in existing tests.

## Verification

1. `npm run dev` from root
2. Open `/jobs/job-1/themes/theme-1-1` — confirm toolbar is visible, bold/italic/list buttons work, formatting persists after navigating away and back
3. Ask the AI to write a draft — confirm markdown is rendered (bold text is bold, lists are lists, no raw `**` symbols visible)
4. `npm run test:e2e` from `frontend/` — all tests pass
