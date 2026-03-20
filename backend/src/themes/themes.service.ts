import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from './theme.entity';

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(Theme)
    private themeRepo: Repository<Theme>,
  ) {}

  findByJob(jobId: string): Promise<Theme[]> {
    return this.themeRepo.find({ where: { jobId } });
  }

  async updateStatus(id: string, status: 'todo' | 'in-progress' | 'done'): Promise<Theme> {
    const theme = await this.themeRepo.findOne({ where: { id } });
    if (!theme) throw new NotFoundException(`Theme ${id} not found`);
    theme.status = status;
    return this.themeRepo.save(theme);
  }
}
