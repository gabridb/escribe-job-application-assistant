import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RelevantExperience } from './relevant-experience.entity';

@Injectable()
export class RelevantExperienceService {
  constructor(
    @InjectRepository(RelevantExperience)
    private relevantExperienceRepo: Repository<RelevantExperience>,
  ) {}

  getByTheme(themeId: string): Promise<RelevantExperience | null> {
    return this.relevantExperienceRepo.findOne({ where: { themeId } });
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
