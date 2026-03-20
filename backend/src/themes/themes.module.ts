import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';
import { Theme } from './theme.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Theme])],
  controllers: [ThemesController],
  providers: [ThemesService],
})
export class ThemesModule {}
