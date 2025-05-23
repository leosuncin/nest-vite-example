import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import jwt from '../config/jwt';
import cookieNames from './cookie-names.config';
import { extractJwtFromCookie } from './extract-jwt-from-cookie';
import type { JwtPayload } from './jwt-payload.interface';
import sign from './sign-options.config';
import { TokenService } from './token.service';

const STRATEGY_NAME = 'session' as const;

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, STRATEGY_NAME) {
  static name = STRATEGY_NAME;

  constructor(
    @Inject(jwt.KEY)
    jwtConfig: ConfigType<typeof jwt>,
    @Inject(sign.KEY)
    verifyOptions: ConfigType<typeof sign>,
    @Inject(cookieNames.KEY)
    { accessToken: cookieName }: ConfigType<typeof cookieNames>,
    private readonly tokenService: TokenService,
  ) {
    super({
      ...jwtConfig.verifyOptions,
      ...verifyOptions.accessToken,
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie(cookieName),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      passReqToCallback: false,
      secretOrKey: jwtConfig.secret!,
    });
  }

  async validate(payload: JwtPayload) {
    try {
      const user = await this.tokenService.verifyAccessPayload(payload);

      return user;
    } catch (error) {
      throw new UnauthorizedException('Unauthorized', {
        cause: error,
        description: 'User not found',
      });
    }
  }
}
