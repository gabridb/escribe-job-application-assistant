import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CoverLetter } from './cover-letter.entity';

@Injectable()
export class CoverLetterService {
  constructor(
    @InjectRepository(CoverLetter)
    private coverLetterRepo: Repository<CoverLetter>,
  ) {}

  getByJob(jobId: string): Promise<CoverLetter | null> {
    return this.coverLetterRepo.findOne({ where: { jobId } });
  }

  async upsert(jobId: string, text: string): Promise<CoverLetter> {
    const existing = await this.coverLetterRepo.findOne({ where: { jobId } });
    if (existing) {
      existing.text = text;
      return this.coverLetterRepo.save(existing);
    }
    const doc = this.coverLetterRepo.create({ jobId, text });
    return this.coverLetterRepo.save(doc);
  }
}
