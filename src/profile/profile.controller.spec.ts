import { NotFoundException } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import type { DataSource } from 'typeorm';

import { User } from '../auth/user.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;
  let dataSource: Mocked<DataSource>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.sociable(ProfileController)
      .expose(ProfileService)
      .compile();

    controller = unit;
    dataSource = unitRef.get(
      getDataSourceToken() as string,
    ) as unknown as Mocked<DataSource>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get the profile of one user', async () => {
    const user: User = {
      bio: null,
      email: 'john.doe@conduit.lol',
      id: 'user_Z8oBYBQYw',
      image: null,
      username: 'john.doe',
      password: '',
    };
    void dataSource.query.mockResolvedValue([
      {
        bio: 'Aute fugiat nulla est sunt ut laborum reprehenderit.',
        email: 'jane.doe@conduit.lol',
        following: true,
        image:
          'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/28.jpg',
        username: 'jane.doe',
      },
    ]);

    await expect(
      controller.getProfile('jane.doe', user),
    ).resolves.toHaveProperty('following', true);
  });

  it('should fail if the profile not exist', async () => {
    void dataSource.query.mockResolvedValue([]);

    await expect(controller.getProfile('Cade_Harris')).rejects.toThrow(
      NotFoundException,
    );
  });
});
