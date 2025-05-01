import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, type Mocked } from '@suites/doubles.vitest';
import { useContainer, validate } from 'class-validator';
import { Repository } from 'typeorm';

import { AuthService } from './auth.service';
import {
  IsValidCredential,
  IsValidCredentialConstraint,
} from './is-valid-credential.validator';
import { User } from './user.entity';

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

const user = Object.assign(new User(), {
  email: 'john.doe@conduit.lol',
  password:
    '$argon2id$v=19$m=8,t=1,p=1$xTdlIybkRC/8yEwoB0vIAw$aLcgVlHxFHTpWlaUbwxku8MZN3gPWGnrDpWyoh8Cn/Q',
  username: 'john.doe',
  bio: null,
  image: null,
});

describe('IsValidCredential', () => {
  const credentials = {
    email: 'john.doe@conduit.lol',
    password: 'Th3Pa$$w0rd!',
  } as const;
  let repository: Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
        AuthService,
        IsValidCredentialConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });
    repository = module.get(getRepositoryToken(User));
  });

  it('should pass with the correct credentials', async () => {
    void repository.findOne.mockResolvedValue(user);
    const dto = DTO.from(credentials);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it.each([
    { email: 'jane.doe@conduit.lol', password: credentials.password },
    { email: credentials.email, password: 'MiContraseña' },
  ])('should fail with invalid credentials: %o', async (data) => {
    void repository.findOne.mockResolvedValueOnce(null);
    const dto = DTO.from(data);

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThanOrEqual(1);
  });
});
