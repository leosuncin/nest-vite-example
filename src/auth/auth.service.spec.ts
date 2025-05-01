/* eslint-disable @typescript-eslint/unbound-method */
import { TestBed } from '@suites/unit';
import type { Mocked } from '@suites/doubles.vitest';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { AuthService } from './auth.service';
import { Register } from './register.dto';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let repository: Mocked<Repository<User>>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(AuthService)
      .mock(getRepositoryToken(User) as string)
      .impl((fn) => ({
        /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
        create: fn().mockImplementation(Object.assign.bind(null, new User())),
        save: fn().mockImplementation((user: User) => Promise.resolve(user)),
        /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
      }))
      .compile();

    service = unit;
    repository = unitRef.get(
      getRepositoryToken(User) as string,
    ) as unknown as Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new user', async () => {
    const newUser: Register = {
      email: 'kattie.hammes@yahoo.com',
      password: 'Sunt voluptate esse',
      username: 'kattie.hammes',
    };
    const user = await service.register(newUser);

    expect(user).toBeDefined();
    expect(repository.create).toHaveBeenCalledOnce();
    expect(repository.save).toHaveBeenCalledOnce();
    expect(repository.save).toHaveBeenCalledAfter(repository.create);
  });
});
