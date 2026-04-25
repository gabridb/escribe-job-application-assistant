import { diffWords } from 'diff'
import type { Editor } from '@tiptap/react'
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model'

const FULL_REWRITE_THRESHOLD = 0.8

/**
 * Computes word-level diff between original and revised text.
 * Returns an HTML string with insertion/deletion marks, or null if >80% changed (full rewrite).
 */
export function buildDiffHtml(original: string, revised: string): string | null {
  const changes = diffWords(original, revised)

  let totalWords = 0
  let changedWords = 0

  for (const change of changes) {
    const wordCount = change.value.trim().split(/\s+/).filter(Boolean).length
    totalWords += wordCount
    if (change.added || change.removed) {
      changedWords += wordCount
    }
  }

  if (totalWords > 0 && changedWords / totalWords > FULL_REWRITE_THRESHOLD) {
    return null
  }

  let html = ''
  for (const change of changes) {
    const escaped = escapeHtml(change.value)
    if (change.added) {
      html += `<span data-diff="insertion">${escaped}</span>`
    } else if (change.removed) {
      html += `<span data-diff="deletion">${escaped}</span>`
    } else {
      html += escaped
    }
  }

  // Wrap in a paragraph so ProseMirror has a valid block node to parse
  return `<p>${html}</p>`
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Applies a word-level diff to the editor using custom mark extensions.
 * Returns true if inline diff was applied, false if full-rewrite fallback should be shown.
 */
export function applyDiffToEditor(editor: Editor, original: string, revised: string): boolean {
  const diffHtml = buildDiffHtml(original, revised)

  if (diffHtml === null) {
    // Full rewrite — caller should show the banner instead
    return false
  }

  // Parse the HTML string via ProseMirror's DOMParser (bypasses the Markdown extension)
  const domNode = document.createElement('div')
  domNode.innerHTML = diffHtml
  const doc = ProseMirrorDOMParser.fromSchema(editor.schema).parse(domNode)
  editor.commands.setContent(doc.toJSON())

  return true
}
