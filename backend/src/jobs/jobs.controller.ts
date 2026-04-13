import { Controller, Get, Post, Delete, Patch, Param, Body, NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { UpdateJobDto } from './update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Get()
  findAll() {
    return this.jobsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const job = await this.jobsService.findOne(id);
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }

  @Post()
  create(@Body('description') description: string) {
    return this.jobsService.createJob(description);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.updateJob(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.jobsService.deleteJob(id);
  }
}
