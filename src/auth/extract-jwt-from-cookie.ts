import type { Request } from 'express';
import { JwtFromRequestFunction } from 'passport-jwt';

export function extractJwtFromCookie(
  cookieName: string,
): JwtFromRequestFunction<Request> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (request) => request.cookies[cookieName];
}
