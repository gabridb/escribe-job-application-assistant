import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TailoredCv } from './tailored-cv.entity';

@Injectable()
export class TailoredCvService {
  constructor(
    @InjectRepository(TailoredCv)
    private tailoredCvRepo: Repository<TailoredCv>,
  ) {}

  getByJob(jobId: string): Promise<TailoredCv | null> {
    return this.tailoredCvRepo.findOne({ where: { jobId } });
  }

  async upsert(jobId: string, text: string): Promise<TailoredCv> {
    const existing = await this.tailoredCvRepo.findOne({ where: { jobId } });
    if (existing) {
      existing.text = text;
      return this.tailoredCvRepo.save(existing);
    }
    const doc = this.tailoredCvRepo.create({ jobId, text });
    return this.tailoredCvRepo.save(doc);
  }
}
