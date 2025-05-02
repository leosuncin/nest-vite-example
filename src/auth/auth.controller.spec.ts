import { getRepositoryToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import type { Repository } from 'typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Register } from './register.dto';
import { User } from './user.entity';
import { UpdateUser } from './update-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let repository: Mocked<Repository<User>>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.sociable(AuthController)
      .expose(AuthService)
      .compile();

    controller = unit;
    repository = unitRef.get(
      getRepositoryToken(User) as string,
    ) as unknown as Mocked<Repository<User>>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register a new user', async () => {
    const newUser: Register = {
      email: 'bettye.boyer@yahoo.com',
      password: 'Non id tempor',
      username: 'bettye.boyer',
    };

    void repository.save.mockResolvedValue(new User());

    await expect(controller.register(newUser)).resolves.toBeDefined();
  });

  it('should login with an user', async () => {
    void repository.findOneByOrFail.mockResolvedValue(new User());

    await expect(
      controller.login({
        email: 'john.doe@conduit.lol',
        password: 'Th3Pa$$w0rd!',
      }),
    ).resolves.toBeDefined();
  });

  it('should update the current user', async () => {
    const user = new User();
    const changes: UpdateUser = {
      bio: 'Mollit dolor ipsum do elit excepteur.',
    };

    repository.merge.mockImplementation(Object.assign);
    // @ts-expect-error stub
    void repository.save.mockImplementation((user) => Promise.resolve(user));

    await expect(controller.updateUser(user, changes)).resolves.toHaveProperty(
      'bio',
      changes.bio,
    );
  });
});
