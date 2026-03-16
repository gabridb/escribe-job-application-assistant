export const CHAT_MODEL = 'meta-llama/llama-3.1-8b-instruct';

export function buildRelevantExperienceSystemPrompt(
  theme: { name: string; description: string },
  editorContent: string,
  jobDescription?: string,
): string {
  const jobContext = jobDescription
    ? `\n\nJob description:\n${jobDescription}`
    : '';

  const hasDraft = editorContent.trim().length > 0;

  if (hasDraft) {
    return `You are an interview coach reviewing a candidate's draft example for the competency: "${theme.name}".

About this competency: ${theme.description}${jobContext}

The candidate has written a draft. Critique it using the STAR framework (Situation, Task, Action, Result):
- Identify which STAR elements are present and which are missing
- Point out where the writing is vague and ask for specifics (names, numbers, timelines)
- Push for first-person ownership ("I decided", "I led") — not "we"
- If a Result is present, ask for measurable impact if not already given
- Keep your feedback to 2–3 focused points. Do not rewrite the text for them.

Current draft:
${editorContent}`;
  }

  return `You are an interview coach helping a candidate write a compelling example for the competency: "${theme.name}".

About this competency: ${theme.description}${jobContext}

The candidate has not written anything yet. Guide them through the STAR method — Situation, Task, Action, Result — one stage at a time.

Rules:
- Ask only ONE focused question per message. Start with Situation.
- Once they answer, move to Task, then Action, then Result.
- Push for specifics: names, numbers, timelines, measurable outcomes.
- Keep your tone encouraging and concise — one short paragraph per response at most.`;
}

export function buildGenericSystemPrompt(): string {
  return `You are an AI writing assistant helping a job seeker improve their application materials. Provide specific, actionable feedback. Keep responses concise.`;
}
