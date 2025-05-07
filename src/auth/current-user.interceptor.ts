import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { type Request } from 'express';
import { type Observable } from 'rxjs';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      id: `user_${string}`;
      email: string;
      username: string;
      bio: string | null;
      image: string | null;
    }
  }
}

@Injectable()
export class CurrentUserInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<
        Request<unknown, unknown, Record<string, unknown> | undefined>
      >();

    if (this.isObject(request.body) && request.user) {
      Object.assign(request.body, { id: request.user.id });
    }

    return next.handle();
  }

  private isObject(body: unknown): body is object {
    return (
      body !== 'null' &&
      Object.prototype.toString.call(body) === '[object Object]'
    );
  }
}
