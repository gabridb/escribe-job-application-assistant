import { buildRelevantExperienceSystemPrompt, buildInitialGreeting } from './relevant-experience.prompts'

const theme = { name: 'Leadership', description: 'Ability to lead and inspire a team' }

describe('buildRelevantExperienceSystemPrompt', () => {
  it('with empty draft — guides through STAR method', () => {
    const result = buildRelevantExperienceSystemPrompt(theme, '')
    expect(result).toContain('Guide them through the STAR method')
  })

  it('with draft — critiques using STAR framework and includes draft', () => {
    const draft = 'I led a project to migrate our database.'
    const result = buildRelevantExperienceSystemPrompt(theme, draft)
    expect(result).toContain('Critique it using the STAR framework')
    expect(result).toContain(draft)
  })

  it('with job description — includes job description in prompt', () => {
    const jobDescription = 'Senior engineer at Acme Corp'
    const result = buildRelevantExperienceSystemPrompt(theme, '', jobDescription)
    expect(result).toContain(jobDescription)
  })
})

describe('buildInitialGreeting', () => {
  it('without content — returns theme-specific greeting', () => {
    const result = buildInitialGreeting('Leadership', false)
    expect(result).toContain('"Leadership"')
  })

  it('with content — returns generic greeting', () => {
    const result = buildInitialGreeting('Leadership', true)
    expect(result).toContain('Hello!')
  })
})
