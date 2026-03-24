export const GENERIC_MODEL = 'meta-llama/llama-3.1-8b-instruct'

export function buildGenericSystemPrompt(): string {
  return `You are an AI writing assistant helping a job seeker improve their application materials. Provide specific, actionable feedback. Keep responses concise.`;
}

export function buildCvSystemPrompt(baseCvText?: string, jobDescription?: string): string {
  const parts: string[] = [
    `You are an AI writing assistant helping a job seeker tailor their CV for a specific role.`,
  ]
  if (baseCvText) {
    parts.push(`Here is the user's base CV:\n<base_cv>\n${baseCvText}\n</base_cv>`)
  }
  if (jobDescription) {
    parts.push(`Here is the target job description:\n<job_description>\n${jobDescription}\n</job_description>`)
  }
  parts.push(`Help the user adapt language, highlight relevant experience, and structure the CV to match the role. Keep responses concise and actionable.`)
  return parts.join('\n\n')
}
