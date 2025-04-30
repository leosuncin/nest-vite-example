import { registerAs, type ConfigType } from '@nestjs/config';
import type { CookieOptions } from 'express';

const cookies = registerAs(
  'cookies',
  () =>
    ({
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    }) as const satisfies CookieOptions,
);

type cookies = ConfigType<typeof cookies>;

export default cookies;
