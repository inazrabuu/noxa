import { Controller, Get, Post, Param, Res, NotFoundException, BadRequestException } from "@nestjs/common";
import express from "express";
import { ProjectService } from "./project.service";
import { DeployerService } from "./deployer/deployer.service";
import fs from 'fs';
import { join } from "path";
import { TemplateService } from "./template.service";

@Controller('api/projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly deployerService: DeployerService
  ) {}

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

    const projectDir = join(process.cwd(), `tmp/${project.name}`);
    const imageTag = `${process.env.DOCKER_REPO}/${project.name}:latest`;
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