import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { RelevantExperienceService } from './relevant-experience.service';

@Controller('jobs/:jobId/themes/:themeId/experience')
export class RelevantExperienceController {
  constructor(private readonly relevantExperienceService: RelevantExperienceService) {}

  @Get()
  get(@Param('themeId') themeId: string) {
    return this.relevantExperienceService.getByTheme(themeId);
  }

  @Put()
  upsert(@Param('themeId') themeId: string, @Body('text') text: string) {
    return this.relevantExperienceService.upsert(themeId, text);
  }
}
