import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GenerateController } from './generate.controller';
import { HealthController } from './health.controller';
import { LlmService } from './llm/llm.service';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController, HealthController, GenerateController, ProjectController],
  providers: [AppService, LlmService, ProjectService],
})
export class AppModule {}
