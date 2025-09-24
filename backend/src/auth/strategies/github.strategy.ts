import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-github2';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email']
    })
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: Function): Promise<any> {
    const { id, username, emails, photos } = profile;
    const user = {
      provider: 'github',
      providerId: id,
      email: emails?.[0]?.value,
      name: username,
      photo: photos?.[0]?.value,
      accessToken
    };
    done(null, user);
  }
}