import { Test } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { useContainer, validate } from 'class-validator';

import { Register } from './register.dto';
import { IsNotRegisterConstraint } from './is-not-register.validator';
import { AuthService } from './auth.service';

describe('Register', () => {
  const email = 'Quinten75@example.com',
    password = 'This-is_not/1*pa$$word',
    username = 'Quinten75';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isRegistered: vi.fn(
              ({ email, username }: Record<'email' | 'username', string>) =>
                Promise.resolve(
                  email === 'john.doe@conduit.lol' || username === 'john.doe',
                ),
            ),
          },
        },
        IsNotRegisterConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
  });

  it('should validate the email', async () => {
    const data = plainToInstance(Register, {
      password,
      username,
    });
    const errors = await validate(data);

    expect(errors).toHaveLength(1);
    expect(errors).toEqual(
      expect.arrayContaining([expect.objectContaining({ property: 'email' })]),
    );
  });

  it('should validate the password', async () => {
    const data = plainToInstance(Register, {
      email,
      username,
    });
    const errors = await validate(data);

    expect(errors).toHaveLength(1);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'password' }),
      ]),
    );
  });

  it('should validate the username', async () => {
    const data = plainToInstance(Register, {
      email,
      password,
    });
    const errors = await validate(data);

    expect(errors).toHaveLength(1);
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ property: 'username' }),
      ]),
    );
  });

  it('should validate the properties', async () => {
    const data = plainToInstance(Register, {});
    const errors = await validate(data);

    expect(errors).toHaveLength(3);
  });
});
