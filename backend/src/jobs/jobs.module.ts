import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { Job } from './job.entity';
import { Theme } from '../themes/theme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Theme])],
  controllers: [JobsController],
  providers: [JobsService],
})
export class JobsModule {}
