/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { useContainer, validate } from 'class-validator';
import type { Mocked } from 'vitest';

import { AuthService } from './auth.service';
import {
  IsNotRegister,
  IsNotRegisterConstraint,
} from './is-not-register.validator';

class WithEmail {
  @IsNotRegister()
  readonly email!: string;

  constructor(email: string) {
    this.email = email;
  }
}

class WithUsername {
  @IsNotRegister()
  readonly username!: string;

  constructor(username: string) {
    this.username = username;
  }
}

describe('IsNotRegister', () => {
  const email = 'john.doe@conduit.lol';
  const username = 'john.doe';
  let mockedAuthService: Mocked<AuthService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isRegistered: vi.fn(),
          },
        },
        IsNotRegisterConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
    mockedAuthService = module.get(AuthService);
  });

  it('should fail when an user already exists with the same email', async () => {
    const dto = new WithEmail(email);

    mockedAuthService.isRegistered.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'email');
    expect(mockedAuthService.isRegistered).toHaveBeenCalledWith({ email });
  });

  it('should fail when an user already exists with the same username', async () => {
    const dto = new WithUsername(username);

    mockedAuthService.isRegistered.mockResolvedValueOnce(true);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'username');
    expect(mockedAuthService.isRegistered).toHaveBeenCalledWith({ username });
  });

  it('should pass when no user exists with the email', async () => {
    const dto = new WithEmail('jane.doe@conduit.lol');

    mockedAuthService.isRegistered.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthService.isRegistered).toHaveBeenCalledWith({
      email: dto.email,
    });
  });

  it('should pass when no user exists with the username', async () => {
    const dto = new WithUsername('jane.doe');

    mockedAuthService.isRegistered.mockResolvedValueOnce(false);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(mockedAuthService.isRegistered).toHaveBeenCalledWith({
      username: dto.username,
    });
  });
});
