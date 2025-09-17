import { Body, Controller, Post, Res, BadRequestException } from "@nestjs/common";
import express from "express";
import JSZip from "jszip";
import fs from 'fs';
import path from "path";
import { LlmService } from "./llm/llm.service";
import { ProjectService } from "./project.service";

@Controller('api')
export class GenerateController {
  constructor(
    private readonly llm: LlmService,
    private readonly projectService: ProjectService
  ) {}

  @Post('generate-project')
  async generate(@Body() body: { prompt?: string }) {
    if (!body?.prompt || body.prompt.trim().length === 0) {
      throw new BadRequestException('prompt is required in body');
    }

    const spec = await this.llm.generateSpec(body.prompt);

    if (!spec?.files || !Array.isArray(spec.files)) {
      throw new BadRequestException('Invalid spec returned from generator');
    }

    const zip = new JSZip();
    for (const f of spec.files) {
      if (!f.path || typeof f.content !== 'string') continue;
      zip.file(f.path, f.content)
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

    const outDir = path.join(process.cwd(), 'generated-zips');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    const zipFilePath = path.join(outDir, `${spec.name}-${Date.now()}.zip`);
    fs.writeFileSync(zipFilePath, zipBuffer);

    const repoUrl = await this.projectService.createAndPushToGit(spec.name, zipFilePath);

    const {zipPath, ...project} = await this.projectService.create({
      name: spec.name,
      repoUrl: repoUrl,
      status: 'created',
      prompt: body.prompt,
      files: spec.files,
      zipPath: zipFilePath
    });

    return {
      ...project,
      zipUrl: `/api/projects/${project.id}/download`
    };
  }
}