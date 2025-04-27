/* eslint-disable @typescript-eslint/unbound-method */
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import {
  IsValidCredential,
  IsValidCredentialConstraint,
} from './is-valid-credential.validator';
import { useContainer, validate } from 'class-validator';
import type { Mocked } from 'vitest';

class DTO {
  @IsValidCredential()
  public readonly email: string;

  @IsValidCredential()
  public readonly password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  static from(data: object): DTO {
    return Object.assign(new DTO('', ''), data);
  }
}

describe('IsValidCredential', () => {
  const credentials = {
    email: 'john.doe@conduit.lol',
    password: 'Th3Pa$$w0rd!',
  } as const;
  let mockedAuthenticationService: Mocked<AuthService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            verifyCredentials: vi
              .fn()
              .mockImplementation((payload: DTO, property) => {
                switch (property) {
                  case 'email':
                    return Promise.resolve(payload.email === credentials.email);

                  case 'password':
                    return Promise.resolve(
                      payload.password === credentials.password &&
                        payload.email === credentials.email,
                    );
                }
              }),
          },
        },
        IsValidCredentialConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
    mockedAuthenticationService = module.get(AuthService);
  });

  it('should pass with the correct credentials', async () => {
    const dto = DTO.from(credentials);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(
      mockedAuthenticationService.verifyCredentials,
    ).toHaveBeenNthCalledWith(1, dto, 'email');
    expect(
      mockedAuthenticationService.verifyCredentials,
    ).toHaveBeenNthCalledWith(2, dto, 'password');
  });

  it.each([
    { email: 'jane.doe@conduit.lol', password: credentials.password },
    { email: credentials.email, password: 'MiContraseña' },
  ])('should fail with invalid credentials: %o', async (data) => {
    const dto = DTO.from(data);

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
  });
});
