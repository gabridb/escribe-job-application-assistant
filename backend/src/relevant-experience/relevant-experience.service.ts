import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { RelevantExperience } from './relevant-experience.entity';
import { Theme } from '../themes/theme.entity';
import {
  buildInitialGreeting,
  buildExperienceMatchingPrompt,
  buildMatchGreeting,
  EXPERIENCE_MATCHING_MODEL,
} from './relevant-experience.prompts';

export interface ExperienceResponse {
  text: string;
  initialGreeting: string;
}

@Injectable()
export class RelevantExperienceService {
  constructor(
    @InjectRepository(RelevantExperience)
    private relevantExperienceRepo: Repository<RelevantExperience>,
    @InjectRepository(Theme)
    private themeRepo: Repository<Theme>,
    private configService: ConfigService,
  ) {}

  async getByTheme(themeId: string): Promise<ExperienceResponse> {
    const [experience, theme] = await Promise.all([
      this.relevantExperienceRepo.findOne({ where: { themeId } }),
      this.themeRepo.findOne({ where: { id: themeId } }),
    ]);
    const text = experience?.text ?? '';

    if (text.trim()) {
      return {
        text,
        initialGreeting: buildInitialGreeting(theme?.name ?? '', true),
      };
    }

    const match = await this.findMatchingExperience(themeId, theme ?? { name: '', description: '' });
    if (match) {
      return {
        text: match.text,
        initialGreeting: buildMatchGreeting(match.themeName),
      };
    }

    return {
      text: '',
      initialGreeting: buildInitialGreeting(theme?.name ?? '', false),
    };
  }

  private async findMatchingExperience(
    currentThemeId: string,
    theme: { name: string; description: string },
  ): Promise<{ text: string; themeName: string } | null> {
    try {
      const candidates = await this.relevantExperienceRepo
        .createQueryBuilder('exp')
        .innerJoinAndSelect('exp.theme', 'theme')
        .where('exp.themeId != :themeId', { themeId: currentThemeId })
        .andWhere('exp.text != :empty', { empty: '' })
        .limit(10)
        .getMany();

      if (candidates.length === 0) return null;

      const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
      if (!apiKey) return null;

      const prompt = buildExperienceMatchingPrompt(
        theme,
        candidates.map((c) => ({ themeName: c.theme.name, text: c.text })),
      );

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: EXPERIENCE_MATCHING_MODEL,
          response_format: { type: 'json_object' },
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) return null;

      const data = await response.json() as { choices: { message: { content: string } }[] };
      const content = data.choices?.[0]?.message?.content ?? '';
      const parsed = JSON.parse(content) as { matchIndex: number; reason: string };

      if (typeof parsed.matchIndex !== 'number' || parsed.matchIndex < 0 || parsed.matchIndex >= candidates.length) {
        return null;
      }

      const matched = candidates[parsed.matchIndex];
      return { text: matched.text, themeName: matched.theme.name };
    } catch (err) {
      console.error('Experience matching failed, falling back to empty state:', err);
      return null;
    }
  }

  async upsert(themeId: string, text: string): Promise<RelevantExperience> {
    const existing = await this.relevantExperienceRepo.findOne({ where: { themeId } });
    if (existing) {
      existing.text = text;
      return this.relevantExperienceRepo.save(existing);
    }
    const doc = this.relevantExperienceRepo.create({ themeId, text });
    return this.relevantExperienceRepo.save(doc);
  }
}
