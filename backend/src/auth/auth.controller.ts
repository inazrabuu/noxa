import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import express from "express";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  //Google
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: express.Response) {
    const token = await this.authService.validateOAuthLogin(req.user);
    return this.responseToken(req, res, token);
  }

  //Github
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: express.Response) {
    const token = await this.authService.validateOAuthLogin(req.user);
    return this.responseToken(req, res, token);
  }

  @Get('/session')
  @UseGuards(JwtAuthGuard)
  async sessionCheck() {
    return {
      authorized: true
    }
  }

  responseToken(req, res, token) {
    const fromFrontend = req.query.state === 'frontend';

    if (!fromFrontend)
      return res.json({ access_token: token });

    this.setHttpOnlyCookie(res, token);
    return res.redirect(process.env.CLIENT_AUTH_CALLBACK_URL);
  }

  setHttpOnlyCookie(res: express.Response, token: string) {
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/'
    });
  }
}