import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, JwtFromRequestFunction, Strategy } from 'passport-jwt';

import jwt from '../config/jwt';
import cookieNames from './cookie-names.config';
import type { JwtPayload } from './jwt-payload.interface';
import sign from './sign-options.config';
import { TokenService } from './token.service';

const JWT_STRATEGY_NAME = 'session' as const;
function extractJwtFromCookie(
  cookieName: string,
): JwtFromRequestFunction<Request> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (request) => request.cookies[cookieName];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  static name = JWT_STRATEGY_NAME;

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
