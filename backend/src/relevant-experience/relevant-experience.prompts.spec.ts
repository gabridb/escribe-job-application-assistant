import { buildRelevantExperienceSystemPrompt, buildInitialGreeting, buildExperienceMatchingPrompt, buildMatchGreeting } from './relevant-experience.prompts'

const theme = { name: 'Leadership', description: 'Ability to lead and inspire a team' }

describe('buildRelevantExperienceSystemPrompt', () => {
  it('with empty draft — guides through STAR method', () => {
    const result = buildRelevantExperienceSystemPrompt(theme, '')
    expect(result).toContain('Guide them through the STAR method')
  })

  it('with draft — coaches using STAR framework, allows rewriting, and includes draft', () => {
    const draft = 'I led a project to migrate our database.'
    const result = buildRelevantExperienceSystemPrompt(theme, draft)
    expect(result).toContain('STAR framework')
    expect(result).toContain('<editor_content>')
    expect(result).toContain(draft)
  })

  it('with job description — includes job description in prompt', () => {
    const jobDescription = 'Senior engineer at Acme Corp'
    const result = buildRelevantExperienceSystemPrompt(theme, '', jobDescription)
    expect(result).toContain(jobDescription)
  })

  it('with draft — recognises broadened rewrite trigger verbs', () => {
    const result = buildRelevantExperienceSystemPrompt(theme, 'some draft')
    expect(result).toContain('apply')
    expect(result).toContain('implement')
    expect(result).toContain('incorporate')
    expect(result).toContain('update')
    expect(result).toContain('make the changes')
  })

  it('with draft — requires editor_content tags when draft is updated', () => {
    const result = buildRelevantExperienceSystemPrompt(theme, 'some draft')
    expect(result).toContain('MUST')
    expect(result).toContain('<editor_content>')
  })

  it('with draft — preserves coaching-vs-rewrite distinction', () => {
    const result = buildRelevantExperienceSystemPrompt(theme, 'some draft')
    expect(result).toContain('coaching')
    expect(result).toContain('should NOT include')
  })

  it('with draft — instructs the coach to surface ONE issue and offer to apply the fix', () => {
    const result = buildRelevantExperienceSystemPrompt(theme, 'some draft')
    expect(result).toContain('ONE')
    expect(result).toMatch(/offer to apply|rewrite it/i)
  })

  it('includes the no-fabrication rule in both draft and empty-draft branches', () => {
    const withDraft = buildRelevantExperienceSystemPrompt(theme, 'some draft')
    const withoutDraft = buildRelevantExperienceSystemPrompt(theme, '')
    expect(withDraft).toContain('Never invent')
    expect(withoutDraft).toContain('Never invent')
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
