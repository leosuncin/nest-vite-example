import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { TokenService } from './token.service';
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
});
