import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Job } from './job.entity';
import { Theme } from '../themes/theme.entity';
import { ANALYZE_JOB_MODEL, buildAnalyzeJobPrompt } from './jobs.prompts';
import { UpdateJobDto } from './update-job.dto';

export interface ThemeData {
  name: string;
  description: string;
}

export interface AnalyzeJobResult {
  title: string;
  company: string;
  themes: ThemeData[];
}

@Injectable()
export class JobsService {
  constructor(
    @InjectRepository(Job)
    private jobRepo: Repository<Job>,
    @InjectRepository(Theme)
    private themeRepo: Repository<Theme>,
    private configService: ConfigService,
  ) {}

  findAll(): Promise<Job[]> {
    return this.jobRepo.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: string): Promise<Job | null> {
    return this.jobRepo.findOne({ where: { id } });
  }

  async createJob(description: string): Promise<Job & { themes: Theme[] }> {
    const analysis = await this.analyzeJob(description);

    const job = this.jobRepo.create({
      title: analysis.title || 'Untitled Role',
      company: analysis.company || 'Unknown Company',
      description,
      status: 'active',
    });
    const savedJob = await this.jobRepo.save(job);

    const themes = await Promise.all(
      analysis.themes.map((t) =>
        this.themeRepo.save(
          this.themeRepo.create({
            jobId: savedJob.id,
            name: t.name,
            description: t.description,
            status: 'todo',
          }),
        ),
      ),
    );

    return { ...savedJob, themes };
  }

  async updateJob(id: string, dto: UpdateJobDto): Promise<Job> {
    const job = await this.findOne(id);
    if (!job) throw new NotFoundException(`Job ${id} not found`);

    if (dto.title !== undefined) {
      const trimmed = dto.title.trim();
      if (!trimmed) throw new BadRequestException('Title cannot be empty');
      job.title = trimmed;
    }
    if (dto.company !== undefined) {
      job.company = dto.company.trim();
    }

    return this.jobRepo.save(job);
  }

  async deleteJob(id: string): Promise<void> {
    await this.jobRepo.delete(id);
  }

  private async analyzeJob(description: string): Promise<AnalyzeJobResult> {
    const apiKey = this.configService.get<string>('OPENROUTER_API_KEY');
    if (!apiKey) {
      console.warn('OPENROUTER_API_KEY not set — returning empty result');
      return { title: 'Untitled Role', company: 'Unknown Company', themes: [] };
    }

    const prompt = buildAnalyzeJobPrompt(description);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ANALYZE_JOB_MODEL,
        response_format: { type: 'json_object' },
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('OpenRouter error:', response.status, await response.text());
      return { title: 'Untitled Role', company: 'Unknown Company', themes: [] };
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    const content = data.choices?.[0]?.message?.content ?? '';

    try {
      const parsed = JSON.parse(content) as AnalyzeJobResult;
      return {
        title: parsed.title ?? 'Untitled Role',
        company: parsed.company ?? 'Unknown Company',
        themes: Array.isArray(parsed.themes) ? parsed.themes : [],
      };
    } catch {
      console.error('Failed to parse OpenRouter response:', content);
      return { title: 'Untitled Role', company: 'Unknown Company', themes: [] };
    }
  }
}
