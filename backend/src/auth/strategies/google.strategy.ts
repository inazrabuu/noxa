import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { access } from "fs";
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback',
      passReqToCallback: true,
      scope: ['email', 'profile']
    });
  }

  async validate(req: any, accessToken: string, refreshToken: string, profile: any, done: VerifyCallback): Promise<any> {
    console.log(req.query);
    const { id, name, emails, photos } = profile;
    const user = {
      provider: 'google',
      providerId: id,
      email: emails?.[0]?.value,
      name: name?.givenName + ' ' + name?.familyName,
      photo: photos?.[0]?.value,
      accessToken
    };
    done(null, user);
  }
}