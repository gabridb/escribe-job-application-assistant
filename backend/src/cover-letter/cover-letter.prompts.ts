import { NO_FABRICATION_RULE } from '../chat/prompt-guardrails'

export interface RelevantExperienceEntry {
  themeName: string
  text: string
}

export interface ThemeCoverage {
  name: string
  description?: string
  hasExperience: boolean
}

const EDITOR_CONTENT_FORMAT = `When you write or revise the cover letter, wrap the full text in <editor_content> tags like this:
<editor_content>
[full cover letter text here, formatted in Markdown — use **bold**, ## headings, and - bullet lists where appropriate]
</editor_content>
Then add one short sentence outside the tags explaining what you did. Do not include the cover letter text outside the tags.`

const EXPERIENCE_CANDIDATE_FORMAT = `When the user tells you a concrete STAR story (a specific past situation, what they did, and the result) that is not yet saved in their Experience Library, you may offer to save it. To do so, include the story inside an <experience_candidate> tag, with the matching theme name:
<experience_candidate theme="Stakeholder Management">
[the story text the user just told, lightly cleaned up — keep their voice]
</experience_candidate>
Only emit one <experience_candidate> tag per reply, and only when the user has just shared a real story. The theme name must match one of the uncovered themes listed below — never invent a new theme. Do not mention these tags to the user; the UI handles the rest.`

function buildThemesBlock(themes: ThemeCoverage[]): string {
  const uncovered = themes.filter((t) => !t.hasExperience)
  if (uncovered.length === 0) return ''

  const list = uncovered
    .map((t) => `- ${t.name}${t.description ? `: ${t.description}` : ''}`)
    .join('\n')

  return `The role weighs these competencies, and the user has not yet written a story for any of them:\n${list}\n\nWhen the conversation naturally allows it, ask the user ONE open question about ONE of these uncovered themes by name — e.g. "This role weighs ${uncovered[0].name} heavily — can you tell me about a time you handled that well?". Never list the themes back to the user; weave them into the conversation. Do not pile up questions; ask one at a time and wait for the answer.\n\n${EXPERIENCE_CANDIDATE_FORMAT}`
}

export function buildCoverLetterSystemPrompt(
  baseCvText?: string,
  jobDescription?: string,
  relevantExperiences?: RelevantExperienceEntry[],
  editorContent?: string,
  themes?: ThemeCoverage[],
): string {
  const parts: string[] = [
    `You are an AI writing assistant helping a job seeker write a compelling cover letter for a specific role.`,
    NO_FABRICATION_RULE,
  ]
  if (baseCvText) {
    parts.push(`Here is the user's CV:\n<base_cv>\n${baseCvText}\n</base_cv>`)
  }
  if (jobDescription) {
    parts.push(`Here is the target job description:\n<job_description>\n${jobDescription}\n</job_description>`)
  }
  if (relevantExperiences && relevantExperiences.length > 0) {
    const entries = relevantExperiences
      .map((e) => `<experience theme="${e.themeName}">\n${e.text}\n</experience>`)
      .join('\n')
    parts.push(
      `Here are the user's written STAR stories for key interview themes. Reference these concrete examples when suggesting how to strengthen the cover letter:\n<relevant_experiences>\n${entries}\n</relevant_experiences>`,
    )
  }

  if (themes && themes.length > 0) {
    const themesBlock = buildThemesBlock(themes)
    if (themesBlock) parts.push(themesBlock)
  }

  const hasDraft = (editorContent ?? '').trim().length > 0

  if (hasDraft) {
    parts.push(`Here is the user's current cover letter draft:\n<current_draft>\n${editorContent}\n</current_draft>`)
    parts.push(
      `The user has an existing draft. When they ask for revisions or a rewrite, output the complete updated cover letter using the format below. For general feedback or questions, respond as plain text without the tags.\n\n${EDITOR_CONTENT_FORMAT}`,
    )
  } else {
    parts.push(
      `The user has not written anything yet. When they ask you to write a cover letter, generate a compelling draft using the format below. For questions or guidance, respond as plain text without the tags.\n\n${EDITOR_CONTENT_FORMAT}`,
    )
  }

  return parts.join('\n\n')
}
