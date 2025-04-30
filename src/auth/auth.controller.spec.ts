import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import cookies from '../config/cookies';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import cookieNames from './cookie-names.config';
import { Register } from './register.dto';
import signOptions from './sign-options.config';
import { TokenService } from './token.service';
import { User } from './user.entity';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [cookies, cookieNames, signOptions],
        }),
      ],
      providers: [
        {
          provide: TokenService,
          useValue: {},
        },
        {
          provide: AuthService,
          useValue: {
            register: vi
              .fn()
              .mockImplementation((newUser: Register) =>
                Promise.resolve(Object.assign(new User(), newUser)),
              ),
            findUserBy: vi.fn().mockResolvedValue(new User()),
          },
        },
      ],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const newUser: Register = {
      email: 'bettye.boyer@yahoo.com',
      password: 'Non id tempor',
      username: 'bettye.boyer',
    };
    const user = await controller.register(newUser);

    expect(user).toBeDefined();
  });

  it('should login with an user', async () => {
    await expect(
      controller.login({
        email: 'john.doe@conduit.lol',
        password: 'Th3Pa$$w0rd!',
      }),
    ).resolves.toBeDefined();
  });
});
