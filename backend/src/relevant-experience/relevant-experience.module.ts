import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelevantExperienceController } from './relevant-experience.controller';
import { RelevantExperienceService } from './relevant-experience.service';
import { RelevantExperience } from './relevant-experience.entity';
import { Theme } from '../themes/theme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RelevantExperience, Theme])],
  controllers: [RelevantExperienceController],
  providers: [RelevantExperienceService],
})
export class RelevantExperienceModule {}
