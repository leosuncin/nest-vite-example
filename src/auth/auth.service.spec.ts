import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { EqualOperator } from 'typeorm';

import { AuthService } from './auth.service';
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
});
