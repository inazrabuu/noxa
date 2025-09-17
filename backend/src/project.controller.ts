import { Controller, Get, Param, Res, NotFoundException } from "@nestjs/common";
import express from "express";
import { ProjectService } from "./project.service";
import fs from 'fs';

@Controller('api/projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService
  ) {}

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: express.Response) {
    const project = await this.projectService.findById(Number(id));
    if (!project || !fs.existsSync(project.zipPath))
      throw new NotFoundException('Project not found');

    res.download(project.zipPath, `${project.name}.zip`);
  }
}