export const ANALYZE_JOB_MODEL = 'meta-llama/llama-3.1-8b-instruct';

export function buildAnalyzeJobPrompt(description: string): string {
  return `You are a job analysis assistant. Analyse the job description below and return ONLY valid JSON with no additional text or markdown.

Return this exact structure:
{
  "title": "the job title",
  "company": "the company name",
  "themes": [
    { "name": "Theme Name", "description": "One sentence describing this competency and why it matters for the role." },
    { "name": "Theme Name", "description": "One sentence describing this competency and why it matters for the role." },
    { "name": "Theme Name", "description": "One sentence describing this competency and why it matters for the role." },
    { "name": "Theme Name", "description": "One sentence describing this competency and why it matters for the role." }
  ]
}

Rules:
- Extract the most important Key Interview Themes — the core competencies a candidate must demonstrate (typically 3–5, but use however many the role genuinely requires)
- Each theme name should be 2–5 words (e.g. "Stakeholder Management", "Data-Driven Decision Making")
- If the company name is not mentioned, use "Unknown Company"
- Output ONLY the JSON object, nothing else

Job description:
${description}`;
}
