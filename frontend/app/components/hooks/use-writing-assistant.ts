'use client'

import { useState, useCallback } from 'react'
import { sendChatMessage } from '@/lib/services/chat-service'

export type WritingContext = 'relevant-experience' | 'cover-letter' | 'cv'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface SuggestedReply {
  label: string
  message: string
}

const GREETING =
  "Hello! I'm your AI writing assistant. How can I help you improve your document today?"

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function getInitialGreeting(
  context: WritingContext,
  themeName?: string,
  initialContent?: string,
): string {
  if (context === 'relevant-experience' && themeName && !initialContent?.trim()) {
    return `I'll help you write your "${themeName}" example. Think of a specific situation where you demonstrated this — what was happening and what were you trying to achieve? Start telling me about it and I'll help you shape it.`
  }
  return GREETING
}

export function useWritingAssistant(
  context: WritingContext,
  jobDescription?: string,
  themeName?: string,
  themeDescription?: string,
  initialContent?: string,
) {
  const [messages, setMessages] = useState<Message[]>([
    { id: generateId(), role: 'assistant', content: getInitialGreeting(context, themeName, initialContent) },
  ])
  const [input, setInput] = useState('')
  const [editorContent, setEditorContent] = useState(initialContent ?? '')
  const [isLoading, setIsLoading] = useState(false)

  const sendPredefinedMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const conversationMessages = updatedMessages
        .slice(1)
        .map(({ role, content }) => ({ role: role as 'user' | 'assistant', content }))

      const content = await sendChatMessage({
        messages: conversationMessages,
        context,
        jobDescription,
        themeName,
        themeDescription,
        editorContent,
      })

      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content },
      ])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, messages, context, jobDescription, themeName, themeDescription, editorContent])

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: trimmed,
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Send all user/assistant messages (skip the greeting)
      const conversationMessages = updatedMessages
        .slice(1)
        .map(({ role, content }) => ({ role: role as 'user' | 'assistant', content }))

      const content = await sendChatMessage({
        messages: conversationMessages,
        context,
        jobDescription,
        themeName,
        themeDescription,
        editorContent,
      })

      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content },
      ])
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages, context, jobDescription, themeName, themeDescription, editorContent])

  return {
    messages,
    input,
    setInput,
    editorContent,
    setEditorContent,
    sendMessage,
    sendPredefinedMessage,
    isLoading,
  }
}
