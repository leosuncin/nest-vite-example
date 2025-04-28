import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { TokenService } from './token.service';
import { AuthService } from './auth.service';
import signOptions from './sign-options.config';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: JwtService,
          useValue: {
            sign: vi.fn().mockReturnValue('j.w.t'),
          },
        },
        {
          provide: AuthService,
          useValue: {
            findUserBy: vi
              .fn()
              .mockImplementation((_: string, email: string) => {
                if (email === 'john.doe@conduit.lol') {
                  return Promise.resolve('j.w.t');
                }

                return Promise.reject(new Error('User not found'));
              }),
          },
        },
        {
          provide: signOptions.KEY,
          useFactory: signOptions,
        },
        TokenService,
      ],
    }).compile();

    service = module.get<TokenService>(TokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should verify the access payload', async () => {
    await expect(
      service.verifyAccessPayload({
        email: 'john.doe@conduit.lol',
        exp: Date.now() + 15 * 60_000,
        iat: Date.now(),
        sub: signOptions().accessToken.subject,
        aud: signOptions().accessToken.audience,
        iss: signOptions().accessToken.issuer,
      }),
    ).resolves.toBeDefined();
  });
});
