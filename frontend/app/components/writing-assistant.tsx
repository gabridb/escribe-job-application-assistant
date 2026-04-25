'use client'

import { useRef, useEffect, useState } from 'react'
import { useWritingAssistant, WritingContext, SuggestedReply } from './hooks/use-writing-assistant'
import { RelevantExperienceEntry } from '@/lib/services/chat-service'
import { useThemes } from '@/app/context/themes-context'
import { useJobs } from '@/app/context/jobs-context'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('./rich-text-editor'), { ssr: false })

const GENERIC_GREETING = "Hello! I'm your AI writing assistant. How can I help you improve your document today?"

interface WritingAssistantProps {
  context: WritingContext
  jobId: string
  themeId?: string
  title: string
  subtitle: string
  suggestedReplies?: SuggestedReply[]
  autoWriteReplies?: SuggestedReply[]
  initialContent?: string
  initialGreeting?: string
  jobDescription?: string
  baseCvText?: string
  relevantExperiences?: RelevantExperienceEntry[]
  onSave?: (text: string) => Promise<void>
}

export default function WritingAssistant({
  context,
  jobId,
  themeId,
  title,
  subtitle,
  suggestedReplies,
  autoWriteReplies,
  initialContent = '',
  initialGreeting = GENERIC_GREETING,
  jobDescription,
  baseCvText,
  relevantExperiences,
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
    editorText,
    setEditorText,
    sendMessage,
    sendPredefinedMessage,
    isLoading,
    pendingAiContent,
    resolveMode,
    isDiffMode,
    isFullRewrite,
    acceptAiChange,
    rejectAiChange,
    handleDiffResolved,
    handleFullRewrite,
  } = useWritingAssistant(
    context,
    initialGreeting,
    jobDescription ?? job?.description,
    theme?.name,
    theme?.description,
    initialContent,
    baseCvText,
    relevantExperiences,
  )

  const [reviewedWordCount, setReviewedWordCount] = useState(0)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'pending' | 'saved'>('idle')
  const lastSavedRef = useRef(initialContent ?? '')
  const currentWordCount = editorText.trim().split(/\s+/).filter(Boolean).length

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    // Suppress auto-save while a diff is pending
    if (isDiffMode) return
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
  }, [editorContent, onSave, isDiffMode])

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

          {/* Auto-write replies — visible immediately, hidden once suggestedReplies kicks in */}
          {autoWriteReplies && !(suggestedReplies && currentWordCount >= reviewedWordCount + 10) && (
            <div className="px-3 py-3 bg-stone-50 border-t border-stone-200">
              <div className="rounded-lg border border-stone-200 bg-white p-3 flex flex-col gap-2 shadow-sm">
                <p className="text-sm font-medium text-stone-700">
                  Want me to write a first draft for you?
                </p>
                <div className="flex flex-col gap-1">
                  {autoWriteReplies.map((reply) => (
                    <Button
                      key={reply.label}
                      variant="outline"
                      size="sm"
                      onClick={() => sendPredefinedMessage(reply.message)}
                      disabled={isLoading || isDiffMode}
                      className="w-full justify-start"
                    >
                      {reply.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

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
                      disabled={isLoading || isDiffMode}
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
                disabled={isLoading || isDiffMode}
                placeholder="Ask AI to modify your document..."
                className="flex-1 rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4a5c2f]/40 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || isDiffMode}
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
              {theme?.description && (
                <p className="text-sm text-stone-500 mt-1 italic">{theme.description}</p>
              )}
            </div>
            {isDiffMode ? (
              <div className="flex items-center gap-2" data-testid="diff-bar">
                <span className="text-xs text-stone-400">
                  {isFullRewrite ? 'Full document replaced' : 'AI suggested changes'}
                </span>
                <Button size="sm" onClick={acceptAiChange} data-testid="accept-button">Accept</Button>
                <Button size="sm" variant="outline" onClick={rejectAiChange} data-testid="reject-button">Reject</Button>
              </div>
            ) : (
              <>
                {onSave && saveStatus === 'pending' && (
                  <span className="text-sm text-stone-400">Saving...</span>
                )}
                {onSave && saveStatus === 'saved' && (
                  <span className="text-sm text-emerald-600">Saved</span>
                )}
              </>
            )}
          </div>
          <RichTextEditor
            content={editorContent}
            onChange={setEditorContent}
            onTextChange={setEditorText}
            placeholder={
              context === 'relevant-experience'
                ? 'Use the STAR framework to structure your answer: Situation, Task, Action, Result...'
                : 'Start writing here...'
            }
            pendingDiffContent={pendingAiContent}
            resolveMode={resolveMode}
            onResolved={handleDiffResolved}
            onFullRewrite={handleFullRewrite}
          />
        </div>
    </div>
  )
}
