import {
  Inject,
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { type Response } from 'express';
import { type Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import cookies from '../config/cookies';
import cookieNames from './cookie-names.config';
import { TokenService } from './token.service';
import type { User } from './user.entity';

@Injectable()
export class TokenInterceptor implements NestInterceptor {
  constructor(
    private readonly tokenService: TokenService,
    @Inject(cookies.KEY)
    private readonly cookieOptions: ConfigType<typeof cookies>,
    @Inject(cookieNames.KEY)
    private readonly names: ConfigType<typeof cookieNames>,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<User>,
  ): Observable<User> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((user) => {
        const accessToken = this.tokenService.generateAccessToken(user);

        response.cookie(
          this.names.accessToken,
          accessToken,
          this.cookieOptions,
        );

        return user;
      }),
    );
  }
}
