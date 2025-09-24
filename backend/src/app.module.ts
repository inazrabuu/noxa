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
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth/auth.controller';
import { GoogleStrategy } from './auth/strategies/google.strategy';
import { GithubStrategy } from './auth/strategies/github.strategy';
import { AuthService } from './auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '7d' }
    })
  ],
  controllers: [
    AppController, HealthController, GenerateController,
    ProjectController, ExecController, CodeController,
    AuthController
  ],
  providers: [
    AppService, LlmService, ProjectService, 
    DeployerService, TemplateService, K8sService,
    GoogleStrategy, GithubStrategy, AuthService, 
    JwtStrategy
  ],
})
export class AppModule {}
