import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ANALYZE_JOB_MODEL, buildAnalyzeJobPrompt } from './jobs.prompts'

export interface Theme {
  name: string
  description: string
}

export interface AnalyzeJobResult {
  title: string
  company: string
  themes: Theme[]
}

@Injectable()
export class JobsService {
  constructor(private readonly config: ConfigService) {}

  async analyzeJob(description: string): Promise<AnalyzeJobResult> {
    const apiKey = this.config.get<string>('OPENROUTER_API_KEY')
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not set — returning empty result')
      return { title: 'Untitled Role', company: 'Unknown Company', themes: [] }
    }

    const prompt = buildAnalyzeJobPrompt(description)

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ANALYZE_JOB_MODEL,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!response.ok) {
      console.error('OpenRouter error:', response.status, await response.text())
      return { title: 'Untitled Role', company: 'Unknown Company', themes: [] }
    }

    const data = await response.json() as { choices: { message: { content: string } }[] }
    const content = data.choices?.[0]?.message?.content ?? ''

    try {
      const parsed = JSON.parse(content) as AnalyzeJobResult
      return {
        title: parsed.title ?? 'Untitled Role',
        company: parsed.company ?? 'Unknown Company',
        themes: Array.isArray(parsed.themes) ? parsed.themes : [],
      }
    } catch {
      console.error('Failed to parse OpenRouter response:', content)
      return { title: 'Untitled Role', company: 'Unknown Company', themes: [] }
    }
  }
}
