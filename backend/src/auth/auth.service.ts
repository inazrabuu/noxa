import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async validateOAuthLogin(profile: any): Promise<any> {
    const payload = {
      provider: profile.provider,
      providerId: profile.providerId,
      email: profile.email,
      name: profile.name,
      photo: profile.photo
    };

    return this.jwtService.sign(payload);
  }
}