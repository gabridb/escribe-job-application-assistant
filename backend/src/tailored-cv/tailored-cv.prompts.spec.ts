import { buildTailoredCvSystemPrompt } from './tailored-cv.prompts'

describe('buildTailoredCvSystemPrompt', () => {
  it('contains "CV" and "job seeker" when called with no arguments', () => {
    const prompt = buildTailoredCvSystemPrompt(undefined, undefined, undefined, undefined)
    expect(prompt).toContain('CV')
    expect(prompt).toContain('job seeker')
  })

  it('includes base CV content wrapped in <base_cv> tags', () => {
    const baseCvText = 'Software Engineer with 5 years experience'
    const prompt = buildTailoredCvSystemPrompt(baseCvText, undefined, undefined, undefined)
    expect(prompt).toContain('<base_cv>')
    expect(prompt).toContain(baseCvText)
    expect(prompt).toContain('</base_cv>')
  })

  it('includes job description wrapped in <job_description> tags', () => {
    const jobDescription = 'We are looking for a senior engineer to join our team'
    const prompt = buildTailoredCvSystemPrompt(undefined, jobDescription, undefined, undefined)
    expect(prompt).toContain('<job_description>')
    expect(prompt).toContain(jobDescription)
    expect(prompt).toContain('</job_description>')
  })

  it('includes relevant experiences wrapped in <relevant_experiences> tags', () => {
    const experiences = [
      { themeName: 'Leadership', text: 'Led a team of 5 engineers to deliver a critical project' },
      { themeName: 'Problem Solving', text: 'Resolved a production outage in under 30 minutes' },
    ]
    const prompt = buildTailoredCvSystemPrompt('base cv', 'job desc', experiences, undefined)
    expect(prompt).toContain('<relevant_experiences>')
    expect(prompt).toContain('theme="Leadership"')
    expect(prompt).toContain('Led a team of 5 engineers')
    expect(prompt).toContain('theme="Problem Solving"')
    expect(prompt).toContain('Resolved a production outage')
    expect(prompt).toContain('</relevant_experiences>')
  })

  it('includes <current_draft> block and <editor_content> format instructions when editorContent is non-empty', () => {
    const editorContent = 'My existing CV draft text'
    const prompt = buildTailoredCvSystemPrompt('base cv', 'job desc', undefined, editorContent)
    expect(prompt).toContain('<current_draft>')
    expect(prompt).toContain(editorContent)
    expect(prompt).toContain('</current_draft>')
    expect(prompt).toContain('<editor_content>')
  })

  it('omits <current_draft> block and instructs first-draft writing when editorContent is empty', () => {
    const prompt = buildTailoredCvSystemPrompt('base cv', 'job desc', undefined, '')
    expect(prompt).not.toContain('<current_draft>')
    expect(prompt).toContain('has not written anything yet')
    expect(prompt).toContain('<editor_content>')
  })

  it('includes the no-fabrication rule regardless of inputs', () => {
    const bare = buildTailoredCvSystemPrompt(undefined, undefined, undefined, undefined)
    const full = buildTailoredCvSystemPrompt(
      'CV text',
      'Job description',
      [{ themeName: 'Leadership', text: 'Led a team.' }],
      'Existing draft',
    )
    expect(bare).toContain('Never invent')
    expect(full).toContain('Never invent')
  })
})
