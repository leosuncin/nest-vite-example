import { type ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';

@Injectable()
export class OptionalAuthGuard extends AuthGuard(JwtStrategy.name) {
  override handleRequest<TUser = unknown>(
    err: Error,
    user: TUser | false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _info: unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _context: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _status?: number,
  ): TUser | undefined {
    if (err) {
      throw err;
    }

    if (!user) {
      return undefined;
    }

    return user;
  }
}
