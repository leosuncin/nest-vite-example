import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import ms from 'ms';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import type cookies from '../config/cookies';
import type cookieNames from './cookie-names.config';
import type signOptions from './sign-options.config';
import { TokenService } from './token.service';
import type { User } from './user.entity';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService<
      {
        cookies: cookies;
        cookieNames: cookieNames;
        signOptions: signOptions;
      },
      true
    >,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<User> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((user) => {
        const cookieOptions = this.configService.get('cookies', {
          infer: true,
        });
        const {
          accessToken: accessCookieName,
          refreshToken: refreshCookieName,
        } = this.configService.get('cookieNames', { infer: true });
        const {
          accessToken: accessSignOptions,
          refreshToken: refreshSignOptions,
        } = this.configService.get('signOptions', { infer: true });
        const accessToken = this.tokenService.generateAccessToken(user);

        response.cookie(accessCookieName, accessToken, {
          ...cookieOptions,
          expires: new Date(Date.now() + ms(accessSignOptions.expiresIn)),
        });

        if (!request.cookies[refreshCookieName]) {
          const refreshToken = this.tokenService.generateRefreshToken(user);

          response.cookie(refreshCookieName, refreshToken, {
            ...cookieOptions,
            expires: new Date(Date.now() + ms(refreshSignOptions.expiresIn)),
          });
        }

        return user;
      }),
    );
  }
}
