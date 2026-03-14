'use client'

import { useState, useCallback } from 'react'

export type WritingContext = 'relevant-experience' | 'cover-letter' | 'cv'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const MOCK_REPLIES: Record<WritingContext, string> = {
  'relevant-experience':
    'Great start! To strengthen this example, try using the STAR method: describe the Situation, Task, Action, and Result clearly. Focus on what YOU specifically did and the measurable impact.',
  'cover-letter':
    'This is a solid opening. To make it more compelling, connect your specific experience directly to the job requirements. Mention 2-3 key achievements that align with what they\'re looking for.',
  'cv':
    'Good structure! Consider leading with your most relevant experience for this role. Use strong action verbs and quantify your achievements where possible (e.g., \'increased revenue by 20%\').',
}

const GREETING =
  "Hello! I'm your AI writing assistant. How can I help you improve your document today?"

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function useWritingAssistant(context: WritingContext) {
  const [messages, setMessages] = useState<Message[]>([
    { id: generateId(), role: 'assistant', content: GREETING },
  ])
  const [input, setInput] = useState('')
  const [editorContent, setEditorContent] = useState('')

  const sendMessage = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    setTimeout(() => {
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: MOCK_REPLIES[context],
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 600)
  }, [input, context])

  return {
    messages,
    input,
    setInput,
    editorContent,
    setEditorContent,
    sendMessage,
  }
}
