import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import type { Repository } from 'typeorm';

import { AuthService } from './auth.service';
import signOptions from './sign-options.config';
import { TokenService } from './token.service';
import { User } from './user.entity';

describe('TokenService', () => {
  let service: TokenService;
  let repository: Mocked<Repository<User>>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.sociable(TokenService)
      .expose(AuthService)
      .mock(JwtService)
      .final({
        sign: () => 'j.w.t',
      })
      .compile();

    service = unit;
    repository = unitRef.get(
      getRepositoryToken(User) as string,
    ) as unknown as Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should verify the access payload', async () => {
    void repository.findOneByOrFail.mockResolvedValue(new User());

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
