import { Controller, Post, Body } from "@nestjs/common";

@Controller('api')
export class GenerateController {
  @Post('generate-project')
  async generate(@Body() body: { prompt: string }) {
    return {
      prompt: body.prompt,
      result: {
        name: 'service-name',
        repo: 'https://git.example.com/noxa/service-name',
        status: 'created'
      }
    };
  }
}