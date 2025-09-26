import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();

    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      req.token = authHeader.split(' ')[1];
      return req;
    }

    if (req.cookies && req.cookies['access_token']) {
      req.token = req.cookies['access_token'];
      return req
    }

    throw new UnauthorizedException('Unauthorized');
  }
}