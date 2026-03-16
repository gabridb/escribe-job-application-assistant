interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ChatPayload {
  messages: ChatMessage[]
  context: 'relevant-experience' | 'cover-letter' | 'cv'
  jobDescription?: string
  themeName?: string
  themeDescription?: string
  editorContent?: string
}

export async function sendChatMessage(payload: ChatPayload): Promise<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`)
  }

  const data = await response.json() as { content: string }
  return data.content
}
