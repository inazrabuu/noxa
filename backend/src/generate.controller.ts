import { Body, Controller, Post, Res, BadRequestException } from "@nestjs/common";
import express from "express";
import JSZip from "jszip";
import { LlmService } from "./llm/llm.service";

@Controller('api')
export class GenerateController {
  constructor(private readonly llm: LlmService) {}

  @Post('generate-project')
  async generate(@Body() body: { prompt?: string }, @Res() res: express.Response) {
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

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename=${(spec.name || 'project')}.zip`);
    res.send(buffer);
  }
}