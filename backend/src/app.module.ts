import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobsModule } from './jobs/jobs.module';
import { ChatModule } from './chat/chat.module';
import { ThemesModule } from './themes/themes.module';
import { CvModule } from './cv/cv.module';
import { TailoredCvModule } from './tailored-cv/tailored-cv.module';
import { RelevantExperienceModule } from './relevant-experience/relevant-experience.module';
import { Job } from './jobs/job.entity';
import { Theme } from './themes/theme.entity';
import { CvDocument } from './cv/cv.entity';
import { TailoredCv } from './tailored-cv/tailored-cv.entity';
import { RelevantExperience } from './relevant-experience/relevant-experience.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USERNAME', 'escribe'),
        password: config.get('DB_PASSWORD', 'escribe'),
        database: config.get('DB_NAME', 'escribe'),
        entities: [Job, Theme, CvDocument, TailoredCv, RelevantExperience],
        synchronize: true,
      }),
    }),
    JobsModule,
    ChatModule,
    ThemesModule,
    CvModule,
    TailoredCvModule,
    RelevantExperienceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
