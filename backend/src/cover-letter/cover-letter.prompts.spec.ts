import { buildCoverLetterSystemPrompt, RelevantExperienceEntry } from './cover-letter.prompts';

describe('buildCoverLetterSystemPrompt', () => {
  it('contains "cover letter" and "job seeker" when called with no arguments', () => {
    const prompt = buildCoverLetterSystemPrompt(undefined, undefined);
    expect(prompt).toContain('cover letter');
    expect(prompt).toContain('job seeker');
  });

  it('contains CV content when baseCvText is provided', () => {
    const baseCvText = 'Senior engineer with 10 years experience.';
    const prompt = buildCoverLetterSystemPrompt(baseCvText, undefined);
    expect(prompt).toContain(baseCvText);
  });

  it('contains job description when jobDescription is provided', () => {
    const jobDescription = 'We are looking for a lead engineer.';
    const prompt = buildCoverLetterSystemPrompt(undefined, jobDescription);
    expect(prompt).toContain(jobDescription);
  });

  it('contains both CV and job description when both are provided', () => {
    const baseCvText = 'Senior engineer with 10 years experience.';
    const jobDescription = 'We are looking for a lead engineer.';
    const prompt = buildCoverLetterSystemPrompt(baseCvText, jobDescription);
    expect(prompt).toContain(baseCvText);
    expect(prompt).toContain(jobDescription);
  });

  it('does not contain relevant_experiences block when none are provided', () => {
    const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined);
    expect(prompt).not.toContain('<relevant_experiences>');
  });

  it('does not contain relevant_experiences block when empty array is provided', () => {
    const prompt = buildCoverLetterSystemPrompt(undefined, undefined, []);
    expect(prompt).not.toContain('<relevant_experiences>');
  });

  it('contains STAR story text and theme name when relevant experiences are provided', () => {
    const experiences: RelevantExperienceEntry[] = [
      { themeName: 'Leadership', text: 'Led a team of 5 engineers to deliver X.' },
      { themeName: 'Problem Solving', text: 'Resolved a production incident in 2 hours.' },
    ];
    const prompt = buildCoverLetterSystemPrompt(undefined, undefined, experiences);
    expect(prompt).toContain('<relevant_experiences>');
    expect(prompt).toContain('theme="Leadership"');
    expect(prompt).toContain('Led a team of 5 engineers to deliver X.');
    expect(prompt).toContain('theme="Problem Solving"');
    expect(prompt).toContain('Resolved a production incident in 2 hours.');
  });

  describe('editor_content tag routing', () => {
    it('includes <editor_content> format instruction when editorContent is empty', () => {
      const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined, '');
      expect(prompt).toContain('<editor_content>');
    });

    it('includes <editor_content> format instruction when editorContent is undefined', () => {
      const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined, undefined);
      expect(prompt).toContain('<editor_content>');
    });

    it('includes the current draft in the prompt when editorContent has content', () => {
      const draft = 'Dear Hiring Manager, I am writing to express my interest...';
      const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined, draft);
      expect(prompt).toContain('<current_draft>');
      expect(prompt).toContain(draft);
    });

    it('includes <editor_content> format instruction when a draft exists', () => {
      const draft = 'Dear Hiring Manager, I am writing to express my interest...';
      const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined, draft);
      expect(prompt).toContain('<editor_content>');
    });

    it('treats whitespace-only editorContent as no draft', () => {
      const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined, '   ');
      expect(prompt).not.toContain('<current_draft>');
    });
  });

  it('includes the no-fabrication rule regardless of inputs', () => {
    const bare = buildCoverLetterSystemPrompt(undefined, undefined, undefined, undefined);
    const full = buildCoverLetterSystemPrompt(
      'CV text',
      'Job description',
      [{ themeName: 'Leadership', text: 'Led a team.' }],
      'Existing draft',
    );
    expect(bare).toContain('Never invent');
    expect(full).toContain('Never invent');
  });
});
