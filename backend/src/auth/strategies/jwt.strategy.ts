import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';
import express from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: express.Request) => {
          if (req.cookies?.['access_token']) return req.cookies['access_token'];
          if (req.headers.authorization?.startsWith('Bearer '))
            return req.headers.authorization.split(' ')[1];
          return null;
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      provider: payload.provider
    }
  }
}