import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { CoverLetterService } from './cover-letter.service';

@Controller('jobs/:jobId/cover-letter')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Get()
  get(@Param('jobId') jobId: string) {
    return this.coverLetterService.getByJob(jobId);
  }

  @Put()
  upsert(@Param('jobId') jobId: string, @Body('text') text: string) {
    return this.coverLetterService.upsert(jobId, text);
  }
}
