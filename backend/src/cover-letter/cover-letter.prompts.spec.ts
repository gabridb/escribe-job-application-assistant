import {
  buildCoverLetterSystemPrompt,
  RelevantExperienceEntry,
  ThemeCoverage,
} from './cover-letter.prompts';

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

  describe('themes coaching', () => {
    it('includes a coaching instruction referencing an uncovered theme name', () => {
      const themes: ThemeCoverage[] = [
        { name: 'Stakeholder Management', description: 'Aligning diverse stakeholders.', hasExperience: false },
        { name: 'Leadership', hasExperience: true },
      ];
      const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined, undefined, themes);
      expect(prompt).toContain('Stakeholder Management');
      expect(prompt.toLowerCase()).toMatch(/ask the user/);
    });

    it('omits the coaching instruction when all themes are covered', () => {
      const themes: ThemeCoverage[] = [
        { name: 'Stakeholder Management', hasExperience: true },
        { name: 'Leadership', hasExperience: true },
      ];
      const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined, undefined, themes);
      expect(prompt).not.toContain('Stakeholder Management');
      expect(prompt).not.toContain('<experience_candidate');
    });

    it('instructs the AI to wrap candidate stories in <experience_candidate> tags when there are uncovered themes', () => {
      const themes: ThemeCoverage[] = [
        { name: 'Stakeholder Management', hasExperience: false },
      ];
      const prompt = buildCoverLetterSystemPrompt(undefined, undefined, undefined, undefined, themes);
      expect(prompt).toContain('<experience_candidate');
    });

    it('builds the prompt without a themes block when themes are undefined or empty', () => {
      const undef = buildCoverLetterSystemPrompt(undefined, undefined, undefined, undefined, undefined);
      const empty = buildCoverLetterSystemPrompt(undefined, undefined, undefined, undefined, []);
      expect(undef).not.toContain('undefined');
      expect(undef).not.toContain('<experience_candidate');
      expect(empty).not.toContain('undefined');
      expect(empty).not.toContain('<experience_candidate');
    });
  });
});
