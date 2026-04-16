import { buildRelevantExperienceSystemPrompt, buildInitialGreeting, buildExperienceMatchingPrompt, buildMatchGreeting } from './relevant-experience.prompts'

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

describe('buildExperienceMatchingPrompt', () => {
  it('includes the current theme name and description', () => {
    const result = buildExperienceMatchingPrompt(
      { name: 'Leadership', description: 'Inspiring a team' },
      [{ themeName: 'Team Lead', text: 'I led a team of 5 engineers...' }],
    )
    expect(result).toContain('Leadership')
    expect(result).toContain('Inspiring a team')
  })

  it('includes the candidate theme name and truncated text', () => {
    const result = buildExperienceMatchingPrompt(
      { name: 'Leadership', description: 'Inspiring a team' },
      [{ themeName: 'Team Lead', text: 'I led a team of 5 engineers...' }],
    )
    expect(result).toContain('Team Lead')
    expect(result).toContain('I led a team of 5 engineers')
  })

  it('truncates candidate text to 400 characters', () => {
    const longText = 'A'.repeat(600)
    const result = buildExperienceMatchingPrompt(
      { name: 'Leadership', description: 'Inspiring a team' },
      [{ themeName: 'Team Lead', text: longText }],
    )
    expect(result).toContain('A'.repeat(400))
    expect(result).not.toContain('A'.repeat(401))
  })

  it('handles empty candidates without crashing', () => {
    const result = buildExperienceMatchingPrompt(
      { name: 'Leadership', description: 'Inspiring a team' },
      [],
    )
    expect(result).toContain('Leadership')
  })

  it('instructs the LLM to return JSON with matchIndex', () => {
    const result = buildExperienceMatchingPrompt(
      { name: 'Leadership', description: 'Inspiring a team' },
      [],
    )
    expect(result).toContain('matchIndex')
    expect(result).toContain('-1')
  })
})

describe('buildMatchGreeting', () => {
  it('includes the matched theme name', () => {
    const result = buildMatchGreeting('Stakeholder Management')
    expect(result).toContain('Stakeholder Management')
  })

  it('mentions the editor', () => {
    const result = buildMatchGreeting('Stakeholder Management')
    expect(result).toContain('loaded it into the editor')
  })
})
