import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import sign from './sign-options.config';
import { User } from './user.entity';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(sign.KEY)
    private readonly signOptions: ConfigType<typeof sign>,
  ) {}

  generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { email: user.email },
      this.signOptions.accessToken,
    );
  }
}
