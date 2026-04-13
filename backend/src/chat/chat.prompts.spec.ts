import { buildGenericSystemPrompt } from './chat.prompts'

describe('buildGenericSystemPrompt', () => {
  it('returns a generic assistant prompt', () => {
    const result = buildGenericSystemPrompt()
    expect(result).toContain('AI writing assistant')
  })
})
