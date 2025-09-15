import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
  @Get('healthz')
  health() {
    return {
      status: 'OK',
      ts: Date.now()
    }
  }

  @Get('api/info')
  info() {
    return {
      name: 'Noxa (Skeleton)',
      verson: '0.1.0',
      endpoints: [
        'health',
        'api/info',
        'api/generate-project'
      ]
    }
  }
}