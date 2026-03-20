import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { ThemesService } from './themes.service';

@Controller()
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('jobs/:jobId/themes')
  findByJob(@Param('jobId') jobId: string) {
    return this.themesService.findByJob(jobId);
  }

  @Patch('themes/:id')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'todo' | 'in-progress' | 'done',
  ) {
    return this.themesService.updateStatus(id, status);
  }
}
