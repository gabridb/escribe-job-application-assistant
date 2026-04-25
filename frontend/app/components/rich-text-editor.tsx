'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Bold, Italic, List, ListOrdered, Heading2, Minus } from 'lucide-react'
import { InsertionMark, DeletionMark } from './tiptap-extensions/diff-marks'
import { applyDiffToEditor } from './tiptap-extensions/apply-diff'

interface RichTextEditorProps {
  content: string
  onChange: (markdown: string) => void
  onTextChange: (text: string) => void
  placeholder?: string
  pendingDiffContent?: string | null
  resolveMode?: 'accept' | 'reject' | null
  onResolved?: (markdown: string) => void
  onFullRewrite?: () => void
}

export default function RichTextEditor({
  content,
  onChange,
  onTextChange,
  placeholder,
  pendingDiffContent,
  resolveMode,
  onResolved,
  onFullRewrite,
}: RichTextEditorProps) {
  const originalSnapshot = useRef<string>('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Markdown.configure({ html: false }),
      InsertionMark,
      DeletionMark,
    ],
    content,
    editorProps: {
      attributes: {
        'data-testid': 'editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onChange((editor.storage as any).markdown.getMarkdown())
      onTextChange(editor.getText())
    },
  })

  // Sync external content changes (e.g. AI overwrites the editor)
  useEffect(() => {
    if (!editor) return
    // Don't sync while a diff is pending — the editor is showing diff marks
    if (pendingDiffContent !== undefined && pendingDiffContent !== null) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (editor.storage as any).markdown.getMarkdown()
    if (content !== current) {
      editor.commands.setContent(content)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor])

  // Diff effect — fires when pendingDiffContent becomes non-null
  useEffect(() => {
    if (!editor || pendingDiffContent === null || pendingDiffContent === undefined) return

    // Snapshot current content before showing diff
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    originalSnapshot.current = (editor.storage as any).markdown.getMarkdown()

    editor.setEditable(false)

    const inlineDiffApplied = applyDiffToEditor(editor, originalSnapshot.current, pendingDiffContent)
    if (!inlineDiffApplied) {
      // Full rewrite — show the proposed content so the user can see what Accept/Reject applies to
      editor.commands.setContent(pendingDiffContent)
      onFullRewrite?.()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingDiffContent])

  // Resolve effect — fires when resolveMode changes
  useEffect(() => {
    if (!editor || resolveMode === null || resolveMode === undefined) return

    editor.setEditable(true)

    if (resolveMode === 'accept') {
      editor.commands.setContent(pendingDiffContent ?? '')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markdown = (editor.storage as any).markdown.getMarkdown()
      onChange(markdown)
      onResolved?.(markdown)
    } else {
      editor.commands.setContent(originalSnapshot.current)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markdown = (editor.storage as any).markdown.getMarkdown()
      onChange(markdown)
      onResolved?.(markdown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolveMode])

  if (!editor) return null

  const toolbarBtn = (active: boolean) =>
    `flex items-center justify-center size-8 rounded text-stone-600 hover:bg-stone-100 transition-colors ${
      active ? 'bg-stone-100 text-stone-900' : ''
    }`

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Toolbar */}
      <div className="flex gap-1 px-3 py-2 border-b border-stone-200 bg-white">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarBtn(editor.isActive('bold'))}
          title="Bold"
        >
          <Bold size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarBtn(editor.isActive('italic'))}
          title="Italic"
        >
          <Italic size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={toolbarBtn(editor.isActive('heading', { level: 2 }))}
          title="Heading"
        >
          <Heading2 size={15} />
        </button>
        <div className="w-px bg-stone-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarBtn(editor.isActive('bulletList'))}
          title="Bullet list"
        >
          <List size={15} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarBtn(editor.isActive('orderedList'))}
          title="Ordered list"
        >
          <ListOrdered size={15} />
        </button>
        <div className="w-px bg-stone-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={toolbarBtn(false)}
          title="Horizontal rule"
        >
          <Minus size={15} />
        </button>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto [&_.ProseMirror]:p-6 [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-full [&_.ProseMirror]:text-stone-800 [&_.ProseMirror]:text-sm [&_.ProseMirror]:leading-relaxed [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-stone-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_h2]:text-base [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:mt-4 [&_.ProseMirror_h2]:mb-1 [&_.ProseMirror_hr]:my-5 [&_.ProseMirror_hr]:border-stone-200"
      />
    </div>
  )
}
