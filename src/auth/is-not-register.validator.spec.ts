/* eslint-disable @typescript-eslint/unbound-method */
import { getRepositoryToken } from '@nestjs/typeorm';
import { mock, type Mocked } from '@suites/doubles.vitest';
import { useContainer, validate } from 'class-validator';
import type { Repository } from 'typeorm';

import { AuthService } from './auth.service';
import {
  IsNotRegister,
  IsNotRegisterConstraint,
} from './is-not-register.validator';
import { User } from './user.entity';
import { Test } from '@nestjs/testing';

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
  let repository: Mocked<Repository<User>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mock<Repository<User>>(),
        },
        AuthService,
        IsNotRegisterConstraint,
      ],
    }).compile();

    useContainer(module, { fallbackOnErrors: true });

    repository = module.get(getRepositoryToken(User));
  });

  it('should fail when an user already exists with the same email', async () => {
    const dto = new WithEmail(email);

    void repository.countBy.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'email');
    expect(repository.countBy).toHaveBeenCalled();
  });

  it('should fail when an user already exists with the same username', async () => {
    const dto = new WithUsername(username);

    void repository.countBy.mockResolvedValueOnce(1);

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]).toHaveProperty('property', 'username');
    expect(repository.countBy).toHaveBeenCalled();
  });

  it('should pass when no user exists with the email', async () => {
    const dto = new WithEmail('jane.doe@conduit.lol');

    void repository.countBy.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(repository.countBy).toHaveBeenCalled();
  });

  it('should pass when no user exists with the username', async () => {
    const dto = new WithUsername('jane.doe');

    void repository.countBy.mockResolvedValueOnce(0);

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(repository.countBy).toHaveBeenCalled();
  });
});
