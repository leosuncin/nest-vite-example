import { registerAs, type ConfigType } from '@nestjs/config';
import type { JwtSignOptions } from '@nestjs/jwt';

const signOptions = registerAs('signOptions', () => ({
  accessToken: {
    audience: 'session',
    expiresIn: '15m',
    subject: 'authenticate',
    issuer: process.env.API_HOST ?? 'https://nest-vite-example.internal',
  } as const satisfies JwtSignOptions,
  refreshToken: {
    audience: 'session',
    expiresIn: '30d',
    subject: 'refresh',
    issuer: process.env.API_HOST ?? 'https://nest-vite-example.internal',
  } as const satisfies JwtSignOptions,
}));

type signOptions = ConfigType<typeof signOptions>;

export default signOptions;
