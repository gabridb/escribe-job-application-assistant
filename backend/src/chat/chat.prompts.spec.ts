import { buildGenericSystemPrompt, buildCvSystemPrompt } from './chat.prompts'

describe('buildGenericSystemPrompt', () => {
  it('returns a generic assistant prompt', () => {
    const result = buildGenericSystemPrompt()
    expect(result).toContain('AI writing assistant')
  })
})

describe('buildCvSystemPrompt', () => {
  it('includes base CV and job description when both provided', () => {
    const result = buildCvSystemPrompt('My CV content', 'Senior Engineer role')
    expect(result).toContain('My CV content')
    expect(result).toContain('Senior Engineer role')
  })

  it('returns a valid prompt without either argument', () => {
    const result = buildCvSystemPrompt()
    expect(result).toBeTruthy()
    expect(result).toContain('CV')
  })

  it('omits job description section when only baseCvText provided', () => {
    const result = buildCvSystemPrompt('My CV content')
    expect(result).toContain('My CV content')
    expect(result).not.toContain('<job_description>')
  })

  it('omits base CV section when only jobDescription provided', () => {
    const result = buildCvSystemPrompt(undefined, 'Engineer role')
    expect(result).toContain('Engineer role')
    expect(result).not.toContain('<base_cv>')
  })
})
