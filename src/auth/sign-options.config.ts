import { registerAs } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';

export default registerAs('signOptions', () => ({
  accessToken: {
    audience: 'session',
    subject: 'authenticate',
    issuer: process.env.API_HOST ?? 'https://nest-vite-example.internal',
  } satisfies JwtSignOptions,
}));
