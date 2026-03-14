# Plan: Escribe Writing Assistant — Initial Implementation

## Context
Greenfield React + TypeScript app for an AI-powered job application writing assistant. No code exists yet. Starting with the **Writing Assistant mode** (split-screen: AI chat left, rich text editor right). AI backend deferred — mock service for now.

---

## Stack
- **Next.js 14** (App Router) + TypeScript 5
- **Tailwind CSS v3** (stone/teal/cyan palette from specs)
- **shadcn/ui** (Button, Tabs, Tooltip, Badge primitives — first-class Next.js support)
- **Tiptap** (rich text editor with selection-based AI suggestions)
- **Zustand** (cross-panel state — chat ↔ editor suggestion flow)
- **clsx + tailwind-merge** (className composition)

> All interactive components use `"use client"` directive. When Claude API is added later, Next.js Route Handlers (`app/api/`) act as the backend — keeps API keys server-side.

---

## Folder Structure
```
escribe/
  app/
    layout.tsx             # Root layout: fonts, globals
    page.tsx               # Renders WritingAssistantContainer
    globals.css            # Tailwind directives + Tiptap prose resets

  src/
    types/
      editor.ts          # Tab, Document, AISuggestion
      chat.ts            # ChatMessage, ChatThread
      ai.ts              # IAIService, params, responses

    services/ai/
      ai-service.interface.ts   # IAIService contract
      ai-service.mock.ts        # Fake delays + canned responses
      ai-service.factory.ts     # Returns mock; swaps via NEXT_PUBLIC_AI_PROVIDER env

    stores/
      editor-store.ts    # tabs, activeTabId, documents, pendingSuggestion
      chat-store.ts      # threads per tab, isLoading

    components/
      layout/
        split-screen-layout.tsx   # left 380px fixed, right fluid, h-screen
        app-header.tsx            # logo + title/subtitle + Save button

      chat/
        chat-container.tsx   # calls aiService, writes to chat-store
        chat-view.tsx        # pure: message list + input bar
        chat-message.tsx     # user (stone-100) / assistant (cyan-50) bubbles
        chat-input.tsx       # controlled textarea, Enter/button send

      editor/
        editor-container.tsx     # tab mgmt, save, pushes suggestion to store
        editor-view.tsx          # tabs + toolbar + Tiptap + suggestion overlay
        editor-toolbar.tsx       # Bold/Italic/Strike/Underline/Lists/Align + zoom
        editor-tabs.tsx          # 4 default tabs: STAR / CV / Cover Letter / General
        editor-document.tsx      # Tiptap <EditorContent> wrapper
        suggestion-controls.tsx  # floating Accept/Reject panel for AI edits

      writing-assistant/
        writing-assistant-container.tsx   # wires chat ↔ editor (cross-panel suggestion)
        writing-assistant-view.tsx        # renders SplitScreenLayout with slots
```

---

## Key Types (write these first)
```typescript
// Tab (editor.ts)
interface Tab { id: string; label: string; systemPrompt: string; documentId: string; }

// AISuggestion (ai.ts)
interface AISuggestion { original: string; suggested: string; explanation: string; from: number; to: number; }

// IAIService (ai.ts)
interface IAIService {
  sendChatMessage(params: ChatMessageParams): Promise<AITextResponse>;
  getSuggestion(params: SuggestionParams): Promise<AISuggestion>;
}
```

---

## AI Stub Pattern
- `IAIService` interface defined before any consumer
- `MockAIService` uses `setTimeout` delays (800–1200ms) + canned responses
- `ai-service.factory.ts` exports a singleton `aiService`; real Claude swapped via `NEXT_PUBLIC_AI_PROVIDER=claude` env var — zero component changes needed

---

## Suggestion UX (Tiptap)
**Floating overlay approach** (not inline tracked-changes markup):
1. User selects text → floating mini-toolbar appears with "Improve with AI"
2. Click → calls `aiService.getSuggestion()` → stores in `editor-store.pendingSuggestion`
3. `suggestion-controls.tsx` renders: proposed text + Accept (teal-600) / Reject (red-600) buttons
4. Accept → `editor.commands.insertContentAt({ from, to }, suggested)`
5. Reject → clears `pendingSuggestion`
6. Chat AI response with `suggestedEdit` field also pushes to `pendingSuggestion`

---

## Build Sequence

| Phase | Goal | Checkpoint |
|-------|------|------------|
| **1** (2h) | `create-next-app`, Tailwind, shadcn init, types, folder scaffold | `npm run dev` shows stone-bg "Escribe" page |
| **2** (2h) | Static shell: split-screen layout, header, placeholder panels | Full layout matches Figma at 1440px |
| **3** (3h) | Chat panel live: mock AI, message bubbles, loading state | Chat loop works with ~1s fake delay |
| **4** (3h) | Tiptap editor: toolbar, 4 tabs, per-tab content in Zustand | Rich text editable, format controls work, tabs persist content |
| **5** (4h) | AI suggestion flow: selection → suggest → accept/reject | Full writing-assistant loop works end-to-end |
| **6** (2h) | Polish: empty states, Cmd+S, localStorage persistence | Demo-ready, matches mockups |

---

## Critical Reference Files
- [overview.md](overview.md) — Container/View pattern, tab contexts, feature surface
- [color-palettes.md](color-palettes.md) — All Tailwind token mappings
- [figma_plan.md](figma_plan.md) — 380px panel width, shadcn kit
- [designs/CV - Writer.png](designs/CV%20-%20Writer.png) — Layout ground truth
- [designs/Cover Letter - Writer.png](designs/Cover%20Letter%20-%20Writer.png) — Chat panel anatomy

---

## Verification
1. `npm run dev` — app loads, no console errors
2. Type in chat input → user bubble appears → ~1s later AI mock bubble appears
3. Switch tabs → content is isolated per tab
4. Type in editor, apply bold/italic/list → renders correctly
5. Select editor text → "Improve with AI" mini-toolbar appears
6. Accept suggestion → selected text replaced in editor
7. Reload page → editor content restored from localStorage
