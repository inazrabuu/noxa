import { Controller, Post, Body, Headers } from "@nestjs/common";
import { LlmService } from "src/llm/llm.service";
import axios from "axios";

@Controller('api/code')
export class CodeController {
  constructor(
    private readonly llmService: LlmService
  ) {}

  @Post('review')
  async review(@Body() body: {
    owner: string, repo: string, pr: number, diff: string
  }, @Headers('authorization') authHeaders: string) {
    const {
      owner, repo, pr, diff
    } = body

    const comment = await this.llmService.generatePRComment(diff);

    const url = `${process.env.GITHUB_API_URL}/repos/${owner}/${repo}/issues/${pr}/comments`;
    const resp = await axios.post(url, 
      {
        body: comment
      },
      {
        headers: {
          Authorization: authHeaders,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      authHeaders,
      owner,
      repo,
      pr, 
      diff,
      comment
    };
  }
}