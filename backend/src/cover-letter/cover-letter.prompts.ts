import { NO_FABRICATION_RULE } from '../chat/prompt-guardrails'

export interface RelevantExperienceEntry {
  themeName: string
  text: string
}

const EDITOR_CONTENT_FORMAT = `When you write or revise the cover letter, wrap the full text in <editor_content> tags like this:
<editor_content>
[full cover letter text here]
</editor_content>
Then add one short sentence outside the tags explaining what you did. Do not include the cover letter text outside the tags.`

export function buildCoverLetterSystemPrompt(
  baseCvText?: string,
  jobDescription?: string,
  relevantExperiences?: RelevantExperienceEntry[],
  editorContent?: string,
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
