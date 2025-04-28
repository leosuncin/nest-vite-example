import type { CallHandler } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Test } from '@nestjs/testing';
import { createMocks } from 'node-mocks-http';
import { lastValueFrom, of } from 'rxjs';

import cookies from '../config/cookies';
import cookieNames from './cookie-names.config';
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
      providers: [
        {
          provide: cookies.KEY,
          useFactory: cookies,
        },
        {
          provide: cookieNames.KEY,
          useFactory: cookieNames,
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: vi.fn().mockReturnValue('j.w.t'),
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

  it('should inject the token into the user', async () => {
    const names = cookieNames();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const { req, res } = createMocks();
    const testContext = new ExecutionContextHost([req, res]);
    const nextSpy: CallHandler<User> = {
      handle: () => of(user),
    };

    await expect(
      lastValueFrom(interceptor.intercept(testContext, nextSpy)),
    ).resolves.toEqual(user);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.cookies).toHaveProperty(names.accessToken);
  });
});
