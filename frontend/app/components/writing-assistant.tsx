'use client'

import { useRef, useEffect, useState } from 'react'
import { useWritingAssistant, WritingContext, SuggestedReply } from './hooks/use-writing-assistant'
import { useThemes } from '@/app/context/themes-context'
import { useJobs } from '@/app/context/jobs-context'
import { Button } from '@/components/ui/button'

interface WritingAssistantProps {
  context: WritingContext
  jobId: string
  themeId?: string
  title: string
  subtitle: string
  suggestedReplies?: SuggestedReply[]
  initialContent?: string
  onSave?: (text: string) => Promise<void>
}

export default function WritingAssistant({
  context,
  jobId,
  themeId,
  title,
  subtitle,
  suggestedReplies,
  initialContent = '',
  onSave,
}: WritingAssistantProps) {
  const { themes } = useThemes()
  const { jobs } = useJobs()

  const job = jobs.find((j) => j.id === jobId)
  if (job) subtitle = `${job.title} @ ${job.company}`

  const theme = themeId ? themes.find((t) => t.id === themeId) : undefined
  if (theme) title = theme.name

  const {
    messages,
    input,
    setInput,
    editorContent,
    setEditorContent,
    sendMessage,
    sendPredefinedMessage,
    isLoading,
  } = useWritingAssistant(
    context,
    job?.description,
    theme?.name,
    theme?.description,
    initialContent,
  )

  const [reviewedWordCount, setReviewedWordCount] = useState(0)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saved'>('idle')
  const lastSavedRef = useRef(initialContent ?? '')
  const currentWordCount = editorContent.trim().split(/\s+/).filter(Boolean).length

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!onSave || editorContent === lastSavedRef.current) return
    setSaveStatus('pending')
    const timer = setTimeout(async () => {
      try {
        await onSave(editorContent)
        lastSavedRef.current = editorContent
        setSaveStatus('saved')
      } catch {
        setSaveStatus('idle')
      }
    }, 1500)
    return () => clearTimeout(timer)
  }, [editorContent, onSave])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex overflow-hidden">
      {/* Left: Chat panel — full height */}
      <div className="w-[40%] flex flex-col border-r border-stone-200">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
            {messages.map((message) =>
              message.role === 'user' ? (
                <div key={message.id} className="flex justify-end">
                  <div className="max-w-[80%] px-3 py-2 rounded-lg bg-stone-100 text-sm text-stone-800">
                    {message.content}
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex justify-start">
                  <div className="max-w-[85%]">
                    <span className="inline-block mb-1 px-1.5 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-700">
                      AI
                    </span>
                    <div className="px-3 py-2 rounded-lg bg-cyan-50 border border-cyan-100 text-sm text-stone-800 whitespace-pre-wrap">
                      {message.content}
                    </div>
                  </div>
                </div>
              )
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%]">
                  <span className="inline-block mb-1 px-1.5 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-700">
                    AI
                  </span>
                  <div className="px-3 py-2 rounded-lg bg-cyan-50 border border-cyan-100 text-sm text-stone-400">
                    Thinking…
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested replies — visible when editor has 10+ words more than when last reviewed */}
          {suggestedReplies &&
            currentWordCount >= reviewedWordCount + 10 && (
            <div className="px-3 py-3 bg-stone-50 border-t border-stone-200">
              <div className="rounded-lg border border-stone-200 bg-white p-3 flex flex-col gap-2 shadow-sm">
                <p className="text-sm font-medium text-stone-700">
                  Ready to review your draft against the STAR framework?
                </p>
                <div className="flex flex-col gap-1">
                  {suggestedReplies.map((reply) => (
                    <Button
                      key={reply.label}
                      variant="outline"
                      size="sm"
                      onClick={() => { setReviewedWordCount(currentWordCount); sendPredefinedMessage(reply.message) }}
                      disabled={isLoading}
                      className="w-full justify-start"
                    >
                      {reply.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-stone-200 p-3 bg-white flex flex-col gap-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder="Ask AI to modify your document..."
                className="flex-1 rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4a5c2f]/40 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#4a5c2f] hover:bg-[#3a4a24] transition-colors disabled:opacity-50"
              >
                Send
              </button>
            </div>
            <p className="text-xs text-stone-400 px-1">
              AI can make mistakes. Review important information.
            </p>
          </div>
        </div>

        {/* Right: Editor panel */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="flex items-center justify-between py-4 px-6 border-b border-stone-200">
            <div>
              <h1 className="text-xl font-semibold text-stone-900" suppressHydrationWarning>{title}</h1>
              <p className="text-sm text-stone-600 mt-0.5" suppressHydrationWarning>{subtitle}</p>
            </div>
            {onSave && saveStatus === 'pending' && (
              <span className="text-sm text-stone-400">Saving...</span>
            )}
            {onSave && saveStatus === 'saved' && (
              <span className="text-sm text-emerald-600">Saved</span>
            )}
          </div>
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Start writing here..."
            className="flex-1 w-full resize-none p-6 text-stone-800 text-sm leading-relaxed focus:outline-none border-none"
          />
        </div>
    </div>
  )
}
