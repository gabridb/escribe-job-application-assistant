import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CvDocument } from './cv.entity';

@Injectable()
export class CvService {
  constructor(
    @InjectRepository(CvDocument)
    private cvRepo: Repository<CvDocument>,
  ) {}

  get(): Promise<CvDocument | null> {
    return this.cvRepo.findOne({ where: {} });
  }

  async save(name: string, text: string): Promise<CvDocument> {
    await this.cvRepo.clear();
    const doc = this.cvRepo.create({ name, text });
    return this.cvRepo.save(doc);
  }

  async remove(): Promise<void> {
    await this.cvRepo.clear();
  }
}
