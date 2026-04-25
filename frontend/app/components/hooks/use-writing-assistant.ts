'use client'

import { useState, useCallback } from 'react'
import { sendChatMessage, RelevantExperienceEntry } from '@/lib/services/chat-service'

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

function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

function parseResponse(raw: string): { editorContent?: string; chatMessage: string } {
  const match = raw.match(/<editor_content>([\s\S]*?)<\/editor_content>/)
  if (match) {
    const editorContent = match[1].trim()
    const chatMessage =
      raw.replace(/<editor_content>[\s\S]*?<\/editor_content>/, '').trim() ||
      'Done! Your document is in the editor on the right.'
    return { editorContent, chatMessage }
  }
  return { chatMessage: raw }
}

export function useWritingAssistant(
  context: WritingContext,
  initialGreeting: string,
  jobDescription?: string,
  themeName?: string,
  themeDescription?: string,
  initialContent?: string,
  baseCvText?: string,
  relevantExperiences?: RelevantExperienceEntry[],
) {
  const [messages, setMessages] = useState<Message[]>([
    { id: generateId(), role: 'assistant', content: initialGreeting },
  ])
  const [input, setInput] = useState('')
  const [editorContent, setEditorContent] = useState(initialContent ?? '')
  const [editorText, setEditorText] = useState(initialContent ?? '')
  const [isLoading, setIsLoading] = useState(false)

  // Diff state
  const [pendingAiContent, setPendingAiContent] = useState<string | null>(null)
  const [resolveMode, setResolveMode] = useState<'accept' | 'reject' | null>(null)
  const [isFullRewrite, setIsFullRewrite] = useState(false)
  const isDiffMode = pendingAiContent !== null

  const acceptAiChange = useCallback(() => {
    setResolveMode('accept')
  }, [])

  const rejectAiChange = useCallback(() => {
    setResolveMode('reject')
  }, [])

  const handleDiffResolved = useCallback((finalMarkdown: string) => {
    setEditorContent(finalMarkdown)
    setPendingAiContent(null)
    setResolveMode(null)
    setIsFullRewrite(false)
  }, [])

  const handleFullRewrite = useCallback(() => {
    setIsFullRewrite(true)
  }, [])

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
        baseCvText,
        relevantExperiences,
      })

      const parsed = parseResponse(content)
      if (parsed.editorContent !== undefined) {
        setPendingAiContent(parsed.editorContent)
      }
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content: parsed.chatMessage },
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
  }, [isLoading, messages, context, jobDescription, themeName, themeDescription, editorContent, baseCvText, relevantExperiences])

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
        baseCvText,
        relevantExperiences,
      })

      const parsed = parseResponse(content)
      if (parsed.editorContent !== undefined) {
        setPendingAiContent(parsed.editorContent)
      }
      setMessages((prev) => [
        ...prev,
        { id: generateId(), role: 'assistant', content: parsed.chatMessage },
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
  }, [input, isLoading, messages, context, jobDescription, themeName, themeDescription, editorContent, baseCvText, relevantExperiences])

  return {
    messages,
    input,
    setInput,
    editorContent,
    setEditorContent,
    editorText,
    setEditorText,
    sendMessage,
    sendPredefinedMessage,
    isLoading,
    // Diff
    pendingAiContent,
    resolveMode,
    isDiffMode,
    isFullRewrite,
    acceptAiChange,
    rejectAiChange,
    handleDiffResolved,
    handleFullRewrite,
  }
}
