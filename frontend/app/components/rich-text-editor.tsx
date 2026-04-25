'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import { Bold, Italic, List, ListOrdered, Heading2, Minus } from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (markdown: string) => void
  onTextChange: (text: string) => void
  placeholder?: string
}

export default function RichTextEditor({
  content,
  onChange,
  onTextChange,
  placeholder,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder }),
      Markdown.configure({ html: false }),
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const current = (editor.storage as any).markdown.getMarkdown()
    if (content !== current) {
      editor.commands.setContent(content)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor])

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
