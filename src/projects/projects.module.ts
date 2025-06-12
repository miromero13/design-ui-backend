import { Module } from '@nestjs/common';
import { ProjectsService } from './services/projects.service';
import { ProjectsController } from './controllers/projects.controller';
import { OpenAIModule } from 'src/openai/openai.module';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Module({
  imports: [OpenAIModule,
    MulterModule.register({
      storage: memoryStorage(), // ⬅️ importante
    }),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
