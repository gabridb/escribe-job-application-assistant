import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TailoredCvController } from './tailored-cv.controller';
import { TailoredCvService } from './tailored-cv.service';
import { TailoredCv } from './tailored-cv.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TailoredCv])],
  controllers: [TailoredCvController],
  providers: [TailoredCvService],
})
export class TailoredCvModule {}
