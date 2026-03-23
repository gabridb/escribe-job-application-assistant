import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelevantExperience } from './relevant-experience.entity';
import { Theme } from '../themes/theme.entity';
import { buildInitialGreeting } from './relevant-experience.prompts';

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
  ) {}

  async getByTheme(themeId: string): Promise<ExperienceResponse> {
    const [experience, theme] = await Promise.all([
      this.relevantExperienceRepo.findOne({ where: { themeId } }),
      this.themeRepo.findOne({ where: { id: themeId } }),
    ]);
    const text = experience?.text ?? '';
    return {
      text,
      initialGreeting: buildInitialGreeting(theme?.name ?? '', !!text.trim()),
    };
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
