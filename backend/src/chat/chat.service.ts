import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class ChatService {
  constructor(private readonly config: ConfigService) {}

  async chat(
    messages: { role: string; content: string }[],
    systemPrompt: string,
    model: string,
  ): Promise<string> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY')
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not set — returning fallback')
      return 'AI is not configured. Please set OPENROUTER_API_KEY on the backend.'
    }

    const requestBody = JSON.stringify({
      model,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    })

    let response: Response
    let lastErr: unknown
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: requestBody,
        })
        break
      } catch (err) {
        lastErr = err
        if (attempt === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
        }
      }
    }

    if (!response!) {
      console.error('OpenRouter fetch error after retry:', lastErr)
      return 'Sorry, something went wrong. Please try again.'
    }

    if (!response.ok) {
      console.error('OpenRouter error:', response.status, await response.text())
      return 'Sorry, something went wrong. Please try again.'
    }

    const data = await response.json() as { choices: { message: { content: string } }[] }
    return data.choices?.[0]?.message?.content ?? ''
  }
}
