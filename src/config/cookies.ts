import { registerAs } from '@nestjs/config';
import type { CookieOptions } from 'express';

export default registerAs(
  'cookies',
  (): CookieOptions => ({
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  }),
);
