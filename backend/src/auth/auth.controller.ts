import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { GithubAuthGuard } from "./guards/github-auth.guard";
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
    return this.handleCallback(req, res);
  }

  //Github
  @Get('github')
  @UseGuards(GithubAuthGuard)
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req, @Res() res: express.Response) {
    return this.handleCallback(req, res);
  }

  @Get('/session')
  @UseGuards(JwtAuthGuard)
  async sessionCheck() {
    return {
      authorized: true
    }
  }

  @Get('/logout')
  async logout(@Res() res: express.Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false
    })

    return res.json({
      message: "Logged out"
    })
  }

  async handleCallback(req, res) {
    const token = await this.authService.validateOAuthLogin(req.user);
    return this.responseToken(req, res, token);
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