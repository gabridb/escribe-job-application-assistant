const GENERIC_GREETING =
  "Hello! I'm your AI writing assistant. How can I help you improve your document today?"

const ANGLE_QUESTION =
  'We can pull this together a few ways — want to lead with a specific accomplishment, your motivation for the role, or shall I draft a first version for you to react to?'

interface GreetingArgs {
  title?: string
  company?: string
  hasBaseCv: boolean
  experienceThemeNames: string[]
}

export function buildCoverLetterGreeting({
  title,
  company,
  hasBaseCv,
  experienceThemeNames,
}: GreetingArgs): string {
  if (!title || !company) return GENERIC_GREETING

  const opener = `Let's write your cover letter for **${title} @ ${company}**.`

  const themeCount = experienceThemeNames.length
  const shownThemes = experienceThemeNames.slice(0, 3)
  if (themeCount > 3) shownThemes.push('…')
  const themesList = shownThemes.join(', ')

  if (hasBaseCv && themeCount > 0) {
    return `${opener}\n\nI've got your CV and ${themeCount} ${themeCount === 1 ? 'story' : 'stories'} you've already written (${themesList}). ${ANGLE_QUESTION}`
  }

  if (hasBaseCv && themeCount === 0) {
    return `${opener}\n\nI've got your CV and the job description for this role. ${ANGLE_QUESTION}`
  }

  if (!hasBaseCv && themeCount > 0) {
    return `${opener}\n\nI've got the job description and ${themeCount} ${themeCount === 1 ? 'story' : 'stories'} you've already written (${themesList}). ${ANGLE_QUESTION}`
  }

  return `${opener}\n\nWant to tell me which angle you'd like to lead with, or shall I draft a first version from the job description?`
}
