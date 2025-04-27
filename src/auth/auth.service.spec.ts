import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

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
});
