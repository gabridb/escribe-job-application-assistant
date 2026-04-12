import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoverLetterController } from './cover-letter.controller';
import { CoverLetterService } from './cover-letter.service';
import { CoverLetter } from './cover-letter.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CoverLetter])],
  controllers: [CoverLetterController],
  providers: [CoverLetterService],
  exports: [CoverLetterService],
})
export class CoverLetterModule {}
