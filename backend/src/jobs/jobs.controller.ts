import { Body, Controller, Post } from '@nestjs/common'
import { JobsService } from './jobs.service'

@Controller()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('analyze-job')
  analyzeJob(@Body() body: { description: string }) {
    return this.jobsService.analyzeJob(body.description)
  }
}
