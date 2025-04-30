import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { AuthService } from './auth.service';
import type { JwtPayload } from './jwt-payload.interface';
import sign from './sign-options.config';
import { User } from './user.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    @Inject(sign.KEY)
    private readonly signOptions: ConfigType<typeof sign>,
  ) {}

  generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { email: user.email },
      this.signOptions.accessToken,
    );
  }

  generateRefreshToken(user: User): string {
    return this.jwtService.sign({ id: user.id }, this.signOptions.refreshToken);
  }

  verifyAccessPayload(payload: JwtPayload) {
    return this.authService.findUserBy('email', payload.email.toString());
  }

  verifyRefreshPayload(payload: JwtPayload) {
    return this.authService.findUserBy('id', payload.id.toString());
  }
}
