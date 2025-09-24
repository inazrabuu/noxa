import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GenerateController } from './generate.controller';
import { HealthController } from './health.controller';
import { LlmService } from './llm/llm.service';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { DeployerService } from './deployer/deployer.service';
import { ExecController } from './exec.controller';
import { TemplateService } from './template.service';
import { CodeController } from './code/code.controller';
import { K8sService } from './k8s/k8s.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true })
  ],
  controllers: [AppController, HealthController, GenerateController, ProjectController, ExecController, CodeController],
  providers: [AppService, LlmService, ProjectService, DeployerService, TemplateService, K8sService],
})
export class AppModule {}
