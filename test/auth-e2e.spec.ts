import { IntegreSQLClient } from '@devoxa/integresql-client';
import {
  HttpStatus,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';

import { AppModule } from '~/app.module';
import { User } from '~/auth/user.entity';
import { userFactory } from '~/auth/user.factory';
import { UserSeeder } from '~/auth/user.seeder';
import { UserSubscriber } from '~/auth/user.subscriber';
import typeorm from '~/config/typeorm';
import { CreateUsersTable } from '~/migrations/1745708833862-create-users-table';

const client = new IntegreSQLClient({
  url: process.env.INTEGRESQL_BASE_URL ?? 'http://localhost:5000',
});

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let hash: string;

  beforeAll(async () => {
    hash = await client.hashFiles([
      './src/migrations/**/*',
      './src/**/*.factory.ts',
      './src/**/*.seeder.ts',
    ]);
    await client.initializeTemplate(hash, async (databaseConfig) => {
      const dataSource = new DataSource({
        type: 'postgres',
        database: databaseConfig.database,
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: databaseConfig.port,
        username: databaseConfig.username,
        password: databaseConfig.password,
        migrations: [CreateUsersTable],
        entities: [User],
      });

      await dataSource.initialize();
      await dataSource.runMigrations();
      await runSeeders(dataSource, {
        factories: [userFactory],
        seeds: [UserSeeder],
      });
      await dataSource.destroy();
    });
  });

  beforeEach(async () => {
    const databaseConfig = await client.getTestDatabase(hash);
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(typeorm.KEY)
      .useValue({
        type: 'postgres',
        database: databaseConfig.database,
        host: process.env.POSTGRES_HOST ?? 'localhost',
        port: databaseConfig.port,
        username: databaseConfig.username,
        password: databaseConfig.password,
        synchronize: false,
        subscribers: [UserSubscriber],
        autoLoadEntities: true,
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );

    await app.init();
    await app.get(getDataSourceToken()).runMigrations();
  });

  afterEach(async () => {
    await app.close();
  });

  it('register a new user', async () => {
    const data = {
      email: 'tiana.kassulke@yahoo.com',
      password: 'Eiusmod adipisicing do in tempor ea laborum dolor elit',
      username: 'tiana.kassulke',
    };

    await request(app.getHttpServer())
      .post('/auth/register')
      .send(data)
      .expect(HttpStatus.ACCEPTED)
      .expect((response) => {
        expect(response.body).toBeDefined();
        expect(response.body).not.toHaveProperty('password');
      });
  });
});
