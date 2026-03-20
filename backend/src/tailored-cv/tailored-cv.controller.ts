import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { TailoredCvService } from './tailored-cv.service';

@Controller('jobs/:jobId/cv')
export class TailoredCvController {
  constructor(private readonly tailoredCvService: TailoredCvService) {}

  @Get()
  get(@Param('jobId') jobId: string) {
    return this.tailoredCvService.getByJob(jobId);
  }

  @Put()
  upsert(@Param('jobId') jobId: string, @Body('text') text: string) {
    return this.tailoredCvService.upsert(jobId, text);
  }
}
