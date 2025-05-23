import { registerAs } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { UserSubscriber } from '~/auth/user.subscriber';
import { CreateUsersTable } from '~/migrations/1745708833862-create-users-table';
import { CreateProfileFollowsTable } from '~/migrations/1746404221231-create-profile_follows-table';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      POSTGRES_DB: string;
      POSTGRES_HOST: string;
      POSTGRES_PORT: string;
      POSTGRES_USER: string;
      POSTGRES_PASSWORD: string;
    }
  }
}

export default registerAs(
  'typeorm',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    database: process.env.POSTGRES_DB ?? 'postgres',
    host: process.env.POSTGRES_HOST ?? 'localhost',
    port: Number.parseInt(process.env.POSTGRES_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER ?? 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    synchronize: false,
    migrations: [CreateUsersTable, CreateProfileFollowsTable],
    subscribers: [UserSubscriber],
    autoLoadEntities: true,
  }),
);
