/* eslint-disable @typescript-eslint/unbound-method */
import { getDataSourceToken } from '@nestjs/typeorm';
import type { Mocked } from '@suites/doubles.vitest';
import { TestBed } from '@suites/unit';
import type { DataSource } from 'typeorm';

import { ProfileService } from './profile.service';

describe('ProfileService', () => {
  let service: ProfileService;
  let dataSource: Mocked<DataSource>;

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.solitary(ProfileService).compile();

    service = unit;
    dataSource = unitRef.get(
      getDataSourceToken() as string,
    ) as unknown as Mocked<DataSource>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get the profile of one user', async () => {
    void dataSource.query.mockResolvedValue([
      {
        bio: 'Aute fugiat nulla est sunt ut laborum reprehenderit.',
        email: 'john.doe@conduit.lol',
        following: false,
        image:
          'https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/28.jpg',
        username: 'john.doe',
      },
    ]);

    await expect(service.getProfile('john.doe')).resolves.toHaveProperty(
      'following',
      false,
    );
    expect(dataSource.query).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['john.doe']),
    );
  });
});
