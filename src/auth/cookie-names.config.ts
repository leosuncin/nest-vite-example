import { registerAs, type ConfigType } from '@nestjs/config';

const cookieNames = registerAs(
  'cookieNames',
  () =>
    ({
      accessToken: 'ACCESS_TOKEN',
      refreshToken: 'REFRESH_TOKEN',
    }) as const,
);

type cookieNames = ConfigType<typeof cookieNames>;

export default cookieNames;
