import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { CHAT_MODEL } from './chat.prompts'

@Injectable()
export class ChatService {
  constructor(private readonly config: ConfigService) {}

  async chat(
    messages: { role: string; content: string }[],
    systemPrompt: string,
  ): Promise<string> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY')
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not set — returning fallback')
      return 'AI is not configured. Please set OPENROUTER_API_KEY on the backend.'
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter error:', response.status, await response.text())
      return 'Sorry, something went wrong. Please try again.'
    }

    const data = await response.json() as { choices: { message: { content: string } }[] }
    return data.choices?.[0]?.message?.content ?? ''
  }
}
