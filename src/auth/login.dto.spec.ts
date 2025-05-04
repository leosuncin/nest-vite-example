import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock } from '@suites/doubles.vitest';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';
import { Client } from 'minio';
import type { EqualOperator } from 'typeorm';

import { AuthService } from './auth.service';
import { IsValidCredentialConstraint } from './is-valid-credential.validator';
import { Login } from './login.dto';
import { User } from './user.entity';

describe('Login', () => {
  const email = 'Quinten75@example.com',
    password = 'This-is_not/1*pa$$word',
    credentials = {
      email: 'john.doe@conduit.lol',
      password: 'Th3Pa$$w0rd!',
    } as const;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: vi.fn(
              (options: { where: { email: EqualOperator<string> } }) =>
                Promise.resolve(
                  options.where.email.value === 'john.doe@conduit.lol'
                    ? {
                        email: 'john.doe@conduit.lol',
                        password:
                          '$argon2id$v=19$m=8,t=1,p=1$xTdlIybkRC/8yEwoB0vIAw$aLcgVlHxFHTpWlaUbwxku8MZN3gPWGnrDpWyoh8Cn/Q',
                      }
                    : null,
                ),
            ),
          },
        },
        {
          provide: Client,
          useValue: mock<Client>(),
        },
        AuthService,
        IsValidCredentialConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should validate the email', async () => {
    const data = plainToInstance(Login, { password });
    const errors = await validate(data);

    expect(errors).toHaveLength(1);
    expect(errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'email' })]),
    );
  });

  it('should validate the password', async () => {
    const data = plainToInstance(Login, { email });
    const errors = await validate(data);

    expect(errors).toHaveLength(1);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'password' }),
      ]),
    );
  });

  it.each([
    [credentials, 0],
    [{ email, password }, 2],
    [{ email: credentials.email, password }, 1],
  ])('should validate if the credentials are valid', async (plain, length) => {
    const object = plainToInstance(Login, plain);
    const errors = await validate(object);

    expect(errors).toHaveLength(length);
  });

  it('should validate the properties', async () => {
    const data = plainToInstance(Login, {});
    const errors = await validate(data);

    expect(errors).toHaveLength(2);
  });
});
