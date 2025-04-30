import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';

import jwt from '../config/jwt';
import cookieNames from './cookie-names.config';
import { extractJwtFromCookie } from './extract-jwt-from-cookie';
import type { JwtPayload } from './jwt-payload.interface';
import sign from './sign-options.config';
import { TokenService } from './token.service';

const STRATEGY_NAME = 'refresh' as const;

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
  static name = STRATEGY_NAME;

  constructor(
    @Inject(jwt.KEY)
    jwtConfig: ReturnType<typeof jwt>,
    @Inject(sign.KEY)
    verifyOptions: ReturnType<typeof sign>,
    @Inject(cookieNames.KEY)
    { refreshToken: cookieName }: ReturnType<typeof cookieNames>,
    private readonly tokenService: TokenService,
  ) {
    super({
      ...jwtConfig.verifyOptions,
      ...verifyOptions.refreshToken,
      jwtFromRequest: extractJwtFromCookie(cookieName),
      passReqToCallback: false,
      secretOrKey: jwtConfig.secret!,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.tokenService.verifyRefreshPayload(payload);

      return user;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized', {
        cause: error,
        description: 'Invalid session',
      });
    }
  }
}
