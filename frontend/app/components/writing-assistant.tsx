'use client'

import { useRef, useEffect } from 'react'
import { useWritingAssistant, WritingContext } from './hooks/use-writing-assistant'

interface WritingAssistantProps {
  context: WritingContext
  jobId: string
  themeId?: string
  title: string
  subtitle: string
}

export default function WritingAssistant({
  context,
  jobId: _jobId,
  themeId: _themeId,
  title,
  subtitle,
}: WritingAssistantProps) {
  const {
    messages,
    input,
    setInput,
    editorContent,
    setEditorContent,
    sendMessage,
  } = useWritingAssistant(context)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col">
      {/* Title bar */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-stone-200 bg-white">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
          <p className="text-sm text-stone-600 mt-0.5">{subtitle}</p>
        </div>
        <button className="px-4 py-2 rounded-md text-sm font-medium text-white bg-[#4a5c2f] hover:bg-[#3a4a24] transition-colors">
          Save
        </button>
      </div>

      {/* Split panels */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Chat panel */}
        <div className="w-[40%] flex flex-col border-r border-stone-200">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-stone-200 bg-white">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-cyan-500" />
              <span className="text-sm font-medium text-stone-900">AI Assistant</span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5 ml-4">Powered by AI</p>
          </div>

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
                    <div className="px-3 py-2 rounded-lg bg-cyan-50 border border-cyan-100 text-sm text-stone-800">
                      {message.content}
                    </div>
                  </div>
                </div>
              )
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="border-t border-stone-200 p-3 bg-white flex flex-col gap-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI to modify your document..."
                className="flex-1 rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#4a5c2f]/40"
              />
              <button
                onClick={sendMessage}
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#4a5c2f] hover:bg-[#3a4a24] transition-colors"
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
          <textarea
            value={editorContent}
            onChange={(e) => setEditorContent(e.target.value)}
            placeholder="Start writing here..."
            className="flex-1 w-full resize-none p-6 text-stone-800 text-sm leading-relaxed focus:outline-none border-none"
          />
        </div>
      </div>
    </div>
  )
}
