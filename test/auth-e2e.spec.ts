import { IntegreSQLClient } from '@devoxa/integresql-client';
import {
  HttpStatus,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';

import { AppModule } from '~/app.module';
import { AuthService } from '~/auth/auth.service';
import cookieNames from '~/auth/cookie-names.config';
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
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

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

        expect(response.headers).toHaveProperty(
          'set-cookie',
          expect.arrayContaining([
            expect.stringContaining(cookieNames().accessToken),
            expect.stringContaining(cookieNames().refreshToken),
          ]),
        );
      });
  });

  it('validate the registration data', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: '',
        password: '',
        username: '',
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: [
            'email must be an email',
            'username must match /^[a-zA-Z][a-zA-Z0-9_.-]+$/ regular expression',
            'username must be longer than or equal to 4 characters',
            'password must be longer than or equal to 12 characters',
          ],
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });
  });

  it('avoid to register a duplicate user', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'john.doe@conduit.lol',
        password: 'incididunt/ullamco/veniam/nostrud',
        username: 'Lacy29',
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['email «john.doe@conduit.lol» is already registered'],
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });

    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'Lyla99@gmail.com',
        password: 'in-velit-deserunt-mollit-proident',
        username: 'john.doe',
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toEqual({
          error: 'Bad Request',
          message: ['username «john.doe» is already registered'],
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });
  });

  it('log in with valid credentials', async () => {
    const data = {
      email: 'john.doe@conduit.lol',
      password: 'Th3Pa$$w0rd!',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.OK)
      .expect((response) => {
        expect(response.body).toBeDefined();
        expect(response.body).not.toHaveProperty('password');
        expect(response.body).toHaveProperty('email', data.email);

        expect(response.headers).toHaveProperty(
          'set-cookie',
          expect.arrayContaining([
            expect.stringContaining(cookieNames().accessToken),
            expect.stringContaining(cookieNames().refreshToken),
          ]),
        );
      });
  });

  it('fail to log in with invalid credentials', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'John.Doe@conduit.lol',
        password: 'VGgzUGEkJHcwcmQh',
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toStrictEqual({
          error: 'Bad Request',
          message: ['The password is incorrect'],
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'esther.sipes6@hotmail.com',
        password: 'Th3Pa$$w0rd!',
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toStrictEqual({
          error: 'Bad Request',
          message: ['The email is incorrect', 'The password is incorrect'],
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });
  });
  it('validate the logging data', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: '',
        password: '',
      })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toStrictEqual({
          error: 'Bad Request',
          message: [
            'email must be an email',
            'password must be longer than or equal to 12 characters',
          ],
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });
  });
});
