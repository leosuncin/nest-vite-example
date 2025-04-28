import { registerAs } from '@nestjs/config';

export default registerAs(
  'cookieNames',
  () =>
    ({
      accessToken: 'ACCESS_TOKEN',
    }) as const,
);
