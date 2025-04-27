import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { EqualOperator, FindOneOptions, FindOptionsWhere } from 'typeorm';

import { AuthService } from './auth.service';
import { Login } from './login.dto';
import { Register } from './register.dto';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: vi.fn(Object.assign.bind(null, new User())),
            save: vi
              .fn()
              .mockImplementation((user: User) => Promise.resolve(user)),
            countBy: vi
              .fn()
              .mockImplementation(
                ({
                  email,
                  username,
                }: Partial<
                  Record<'email' | 'username', EqualOperator<string>>
                >) => {
                  let count = 0;

                  if (email?.value === 'john.doe@conduit.lol') {
                    count++;
                  }

                  if (username?.value === 'john.doe') {
                    count++;
                  }

                  return Promise.resolve(count);
                },
              ),
            findOne: vi
              .fn()
              .mockImplementation((options: FindOneOptions<User>) => {
                if (
                  (options.where as Record<'email', EqualOperator<string>>)
                    .email?.value === 'john.doe@conduit.lol'
                ) {
                  return Promise.resolve({
                    email: 'john.doe@conduit.lol',
                    password:
                      '$argon2id$v=19$m=8,t=1,p=1$xTdlIybkRC/8yEwoB0vIAw$aLcgVlHxFHTpWlaUbwxku8MZN3gPWGnrDpWyoh8Cn/Q',
                  });
                }

                return Promise.resolve(null);
              }),
            findOneByOrFail: vi
              .fn()
              .mockImplementation((where: FindOptionsWhere<User>) => {
                if (
                  where.email === 'john.doe@conduit.lol' ||
                  where.username === 'john.doe'
                ) {
                  return Promise.resolve({
                    email: 'john.doe@conduit.lol',
                    password:
                      '$argon2id$v=19$m=8,t=1,p=1$xTdlIybkRC/8yEwoB0vIAw$aLcgVlHxFHTpWlaUbwxku8MZN3gPWGnrDpWyoh8Cn/Q',
                    username: 'john.doe',
                    bio: null,
                    image: null,
                  });
                }

                return Promise.resolve(null);
              }),
          },
        },
        AuthService,
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const newUser: Register = {
      email: 'kattie.hammes@yahoo.com',
      password: 'Sunt voluptate esse',
      username: 'kattie.hammes',
    };
    const user = await service.register(newUser);

    expect(user).toBeDefined();
  });

  it('should check if the email is registered', async () => {
    await expect(
      service.isRegistered({ email: 'Jailyn_Jenkins@gmail.com' }),
    ).resolves.toEqual(false);

    await expect(
      service.isRegistered({ email: 'john.doe@conduit.lol' }),
    ).resolves.toEqual(true);
  });

  it('should check if the username is registered', async () => {
    await expect(
      service.isRegistered({ username: 'Maiya_Mraz' }),
    ).resolves.toEqual(false);

    await expect(
      service.isRegistered({ username: 'john.doe' }),
    ).resolves.toEqual(true);
  });

  it('should check when the email is a valid credential or not', async () => {
    await expect(
      service.verifyCredentials(
        {
          email: 'john.doe@conduit.lol',
          password: 'Th3Pa$$w0rd!',
        } satisfies Login,
        'email',
      ),
    ).resolves.toEqual(true);

    await expect(
      service.verifyCredentials(
        {
          email: 'john.doe@conduit.lol',
          password: undefined,
        } as const,
        'email',
      ),
    ).resolves.toEqual(true);

    await expect(
      service.verifyCredentials(
        {
          email: 'jane.doe@conduit.lol',
          password: 'Th3Pa$$w0rd!',
        } satisfies Login,
        'email',
      ),
    ).resolves.toEqual(false);
  });

  it('should check when the password is a valid credential or not', async () => {
    await expect(
      service.verifyCredentials(
        {
          email: 'john.doe@conduit.lol',
          password: 'Th3Pa$$w0rd!',
        } satisfies Login,
        'password',
      ),
    ).resolves.toEqual(true);

    await expect(
      service.verifyCredentials(
        {
          email: 'john.doe@conduit.lol',
          password: 'I37ViSwEs_YLYKZ',
        } as const,
        'password',
      ),
    ).resolves.toEqual(false);

    await expect(
      service.verifyCredentials(
        {
          email: 'Kamron.Yundt@hotmail.com',
          password: '09:e6:40:a5:db:9f',
        } as const,
        'password',
      ),
    ).resolves.toEqual(false);
  });

  it('should get one user by its unique email or username', async () => {
    await expect(
      service.findUserBy('email', 'john.doe@conduit.lol'),
    ).resolves.toBeDefined();

    await expect(
      service.findUserBy('username', 'john.doe'),
    ).resolves.toBeDefined();
  });
});
