import { registerAs } from '@nestjs/config';
import type { ClientOptions } from 'minio';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      MINIO_ACCESS_KEY: string;
      MINIO_END_POINT: string;
      MINIO_SECRET_KEY: string;
      MINIO_PORT: string;
    }
  }
}

const minioOptions = registerAs<ClientOptions>('minio', () => ({
  endPoint: process.env.MINIO_END_POINT,
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
  useSSL: false,
  port: process.env.MINIO_PORT
    ? Number.parseInt(process.env.MINIO_PORT, 10)
    : undefined,
}));

export default minioOptions;
