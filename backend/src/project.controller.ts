import { Controller, Get, Post, Param, Res, NotFoundException, BadRequestException, UseGuards } from "@nestjs/common";
import express from "express";
import { ProjectService } from "./project.service";
import { DeployerService } from "./deployer/deployer.service";
import fs from 'fs';
import { join } from "path";
import { TemplateService } from "./template.service";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";

@Controller('api/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly deployerService: DeployerService
  ) {}

  @Get('')
  async projects() {
    return await this.projectService.list();
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: express.Response) {
    const project = await this.projectService.findById(Number(id));
    if (!project || !fs.existsSync(project.zipPath))
      throw new NotFoundException('Project not found');

    res.download(project.zipPath, `${project.name}.zip`);
  }

  @Post(':id/deploy/')
  async deploy(@Param('id') id: number) {
    const project = await this.projectService.findById(Number(id));
    if (!project)
      throw new NotFoundException(`Project not found`);

    const [ projectDir, imageTag ] = this.getProjectAssets(project.name);
    await this.deployerService.deployImage(projectDir, project.name, imageTag, project.env);

    await this.projectService.update(project.id, {
      env: project.env,
      status: 'deployed'
    });

    return {
      name: project.name,
      status: 'deployed'
    }
  }

  @Get(':id/logs')
  async logs(@Param('id') id: string) {
    const project = await this.projectService.findById(Number(id));
    if (!project)
      throw new NotFoundException('Project not found.');

    const logs = await this.projectService.getLogs(project.name, project.env, 100);

    const name = project.name,
          env = project.env

    return {
      id,
      name,
      env,
      logs
    }
  }

  @Post(':id/promote')
  async promote(@Param('id') id: string) {
    const project = await this.projectService.findById(Number(id));
    if (!project)
      throw new NotFoundException(`Project not found`);

    if (project.env === 'stag')
      throw new BadRequestException('Project already at maximum promotion');

    const env = 'stag';

    const stagProject = await this.projectService.findOrCreate({
      name: project.name,
      repoUrl: project.repoUrl,
      status: 'deploying',
      prompt: project.prompt,
      files: project.files,
      zipPath: project.zipPath,
      env: env
    });

    const [ projectDir, imageTag ] = this.getProjectAssets(project.name);
    await this.deployerService.deployImage(projectDir, project.name, imageTag, env);

    await this.projectService.update(stagProject.id, {
      url: project.url.replace('dev', 'stag'),
      status: 'deployed'
    });

    return {
      name: project.name,
      env,
      status: 'deployed',
    };
  }

  getProjectAssets(projectName: string) {
    return [
      join(process.cwd(), `tmp`, projectName),
      join(`${process.env.DOCKER_REPO}/${projectName}:latest`)
    ]
  }

  @Get('test')
  async test() {
    const templateService = new TemplateService();
    const template = await templateService.renderTemplate('service-deploy', {
      projectName: 'gallery-service',
      namespace: 'dev',
      imageTag: 'inazrabuu/gallery-service:latest'
    })

    return {
      message: template
    }
  }
}