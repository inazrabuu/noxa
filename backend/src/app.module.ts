import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GenerateController } from './generate.controller';
import { HealthController } from './health.controller';
import { LlmService } from './llm/llm.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController, HealthController, GenerateController],
  providers: [AppService, LlmService],
})
export class AppModule {}
