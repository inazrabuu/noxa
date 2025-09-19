import { Body, Post, Controller, BadRequestException } from "@nestjs/common";
import { exec as execCb } from "child_process";
import { promisify } from "util";

const exec = promisify(execCb);

@Controller('exec')
export class ExecController {
  constructor(
  ) {}

  @Post('test')
  async test(@Body() body: { command?: string }) {
    let result = '';
    try {
      if (!body?.command || body.command.trim().length === 0)
        throw new BadRequestException('There is no command');

      const { stdout, stderr } = await exec(body.command?.trim());
      console.log(stdout);
      result = stdout;

      if (stderr)
        console.error(stderr);

    } catch (err) {
      throw err;
    }
    
    return {
      "result": result
    }
  }
}