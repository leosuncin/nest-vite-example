import { Readable } from 'node:stream';

import { getRepositoryToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import { Client } from 'minio';
import type { Repository } from 'typeorm';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Register } from './register.dto';
import { UpdateUser } from './update-user.dto';
import { User } from './user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let repository: Mocked<Repository<User>>;
  let client: Mocked<Client>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.sociable(AuthController)
      .expose(AuthService)
      .compile();

    controller = unit;
    repository = unitRef.get(
      getRepositoryToken(User) as string,
    ) as unknown as Mocked<Repository<User>>;
    client = unitRef.get(Client) as unknown as Mocked<Client>;
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

  it('should upload the user image to MinIO', async () => {
    const user = new User();
    const changes: UpdateUser = {
      bio: 'Mollit dolor ipsum do elit excepteur.',
    };
    const image: Express.Multer.File = {
      fieldname: 'image',
      originalname: '156.jpg',
      mimetype: 'image/jpeg',
      encoding: '',
      size: 1980,
      stream: new Readable(),
      destination: '',
      filename: '',
      path: '',
      buffer: Buffer.alloc(0),
    };

    void client.putObject.mockResolvedValue({ etag: '', versionId: '' });
    void client.presignedUrl.mockResolvedValue(
      `https://nice-supernatural.biz/avatars/${user.id}.jpg`,
    );
    repository.merge.mockImplementation(Object.assign);
    // @ts-expect-error stub
    void repository.save.mockImplementation((user) => Promise.resolve(user));

    await expect(
      controller.updateUser(user, changes, image),
    ).resolves.toHaveProperty('bio', changes.bio);
    await expect(
      controller.updateUser(user, changes, image),
    ).resolves.toHaveProperty(
      'image',
      `https://nice-supernatural.biz/avatars/${user.id}.jpg`,
    );
  });
});
