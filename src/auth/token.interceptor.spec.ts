import type { CallHandler } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Test } from '@nestjs/testing';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import cookies from '../config/cookies';
import cookieNames from './cookie-names.config';
import signOptions from './sign-options.config';
import { TokenInterceptor } from './token.interceptor';
import { TokenService } from './token.service';
import type { User } from './user.entity';

describe('TokenInterceptor', () => {
  const user: User = {
    id: `user_${Math.random().toString(16).slice(2, 8)}`,
    email: 'test@example.com',
    password: 'hashedpassword',
    username: 'testuser',
    bio: 'This is a test bio',
    image:
      'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/1065.jpg',
  };
  let interceptor: TokenInterceptor;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [cookies, cookieNames, signOptions],
        }),
      ],
      providers: [
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: vi.fn().mockReturnValue('j.w.t'),
            generateRefreshToken: vi.fn().mockReturnValue('j.w.t'),
          },
        },
        TokenInterceptor,
      ],
    }).compile();

    interceptor = module.get(TokenInterceptor);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should inject the tokens into the cookies', async () => {
    const names = cookieNames();
    const { req, res } = createMocks();
    const testContext = new ExecutionContextHost([req, res]);
    const nextSpy: CallHandler<User> = {
      handle: () => of(user),
    };

    await expect(
      lastValueFrom(interceptor.intercept(testContext, nextSpy)),
    ).resolves.toEqual(user);
    expect(res.cookies).toHaveProperty(names.accessToken);
    expect(res.cookies).toHaveProperty(names.refreshToken);
  });

  it('should skip the refresh token if already exists', async () => {
    const names = cookieNames();
    const { req, res } = createMocks({
      cookies: {
        [cookieNames().refreshToken]: 'j.w.t',
      },
    });
    const testContext = new ExecutionContextHost([req, res]);
    const nextSpy: CallHandler<User> = {
      handle: () => of(user),
    };

    await expect(
      lastValueFrom(interceptor.intercept(testContext, nextSpy)),
    ).resolves.toEqual(user);
    expect(res.cookies).toHaveProperty(names.accessToken);
    expect(res.cookies).not.toHaveProperty(names.refreshToken);
  });
});
