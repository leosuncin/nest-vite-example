import { registerAs } from '@nestjs/config';
import type { JwtModuleOptions } from '@nestjs/jwt';

export default registerAs(
  'jwt',
  (): JwtModuleOptions => ({
    secret: process.env.JWT_SECRET,
    signOptions: {
      algorithm: 'HS384',
      expiresIn: '30d',
    },
    verifyOptions: {
      algorithms: ['HS384'],
      ignoreExpiration: false,
    },
  }),
);
