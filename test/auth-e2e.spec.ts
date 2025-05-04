import { IntegreSQLClient } from '@devoxa/integresql-client';
import {
  HttpStatus,
  ValidationPipe,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { useContainer } from 'class-validator';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { runSeeders } from 'typeorm-extension';

import { AppModule } from '~/app.module';
import { AuthService } from '~/auth/auth.service';
import cookieNames from '~/auth/cookie-names.config';
import { TokenService } from '~/auth/token.service';
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

    app
      .use(cookieParser(process.env.COOKIE_SECRET))
      .useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
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

  it('get the authenticated user', async () => {
    const data = {
      email: 'john.doe@conduit.lol',
      password: 'Th3Pa$$w0rd!',
    };
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(data)
      .expect(HttpStatus.OK);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', response.headers['set-cookie'])
      .expect(HttpStatus.OK)
      .expect((response) => {
        expect(response.body).toBeDefined();
        expect(response.body).not.toHaveProperty('password');
        expect(response.body).toHaveProperty('email', data.email);
      });
  });

  it('require the access token to get the current user', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((response) => {
        expect(response.body).toStrictEqual({
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      });
  });

  it('fail to get the session user when the user no longer exist', async () => {
    const accessToken = app.get(TokenService).generateAccessToken({
      id: `user_${Math.random().toString(16).slice(2, 8)}`,
      email: 'tressie59@hotmail.com',
      password: '',
      username: '',
      bio: null,
      image: null,
    });

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((response) => {
        expect(response.body).toStrictEqual({
          error: 'User not found',
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      });
  });

  it('refresh the access token after expired', async () => {
    const user = await app
      .get(AuthService)
      .findUserBy('email', 'john.doe@conduit.lol');
    const refreshToken = app.get(TokenService).generateRefreshToken(user);

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', [`${cookieNames().refreshToken}=${refreshToken}`])
      .expect(HttpStatus.OK)
      .expect((response) => {
        expect(response.body).toBeDefined();
        expect(response.body).not.toHaveProperty('password');

        expect(response.headers).toHaveProperty(
          'set-cookie',
          expect.arrayContaining([
            expect.stringContaining(cookieNames().accessToken),
          ]),
        );
      });
  });

  it('fail to refresh the access token when the user no longer exist', async () => {
    const refreshToken = app.get(TokenService).generateRefreshToken({
      id: `user_${Math.random().toString(16).slice(2, 8)}`,
      email: '',
      password: '',
      username: '',
      bio: null,
      image: null,
    });

    await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', [`${cookieNames().refreshToken}=${refreshToken}`])
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((response) => {
        expect(response.body).toStrictEqual({
          error: 'Invalid session',
          message: 'Unauthorized',
          statusCode: HttpStatus.UNAUTHORIZED,
        });
      });
  });

  it('update the current user', async () => {
    const user = await app
      .get(AuthService)
      .findUserBy('email', 'john.doe@conduit.lol');
    const accessToken = app.get(TokenService).generateAccessToken(user);
    const fields = {
      bio: 'Sunt est sint veniam sunt consequat tempor reprehenderit dolore aliquip enim ullamco sunt excepteur.',
      password: 'Th3Pa$$w0rd!',
    };

    await request(app.getHttpServer())
      .patch('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', './test/fixtures/small.jpg')
      .field(fields)
      .expect(HttpStatus.OK)
      .expect((response) => {
        expect(response.body).toBeDefined();
        expect(response.body).toHaveProperty('image');
        expect(response.body).toHaveProperty('bio', fields.bio);
      });
  });

  it('fail to upload a too large image', async () => {
    const user = await app
      .get(AuthService)
      .findUserBy('email', 'john.doe@conduit.lol');
    const accessToken = app.get(TokenService).generateAccessToken(user);

    await request(app.getHttpServer())
      .patch('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', './test/fixtures/large.jpg')
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toMatchObject({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          message: expect.stringMatching(
            /Validation failed \(current file size is \d+, expected size is less than \d+\)/,
          ),
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });
  });

  it('fail to upload a non image file', async () => {
    const user = await app
      .get(AuthService)
      .findUserBy('email', 'john.doe@conduit.lol');
    const accessToken = app.get(TokenService).generateAccessToken(user);

    await request(app.getHttpServer())
      .patch('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('image', './test/fixtures/file.pdf')
      .expect(HttpStatus.BAD_REQUEST)
      .expect((response) => {
        expect(response.body).toMatchObject({
          message:
            'Validation failed (current file type is application/pdf, expected type is image/jpeg) - magic number detection failed, used mimetype fallback',
          error: 'Bad Request',
          statusCode: HttpStatus.BAD_REQUEST,
        });
      });
  });
});
