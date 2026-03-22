import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RelevantExperienceController } from './relevant-experience.controller';
import { RelevantExperienceService } from './relevant-experience.service';
import { RelevantExperience } from './relevant-experience.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RelevantExperience])],
  controllers: [RelevantExperienceController],
  providers: [RelevantExperienceService],
})
export class RelevantExperienceModule {}
