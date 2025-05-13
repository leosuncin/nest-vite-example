import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';

import { User } from '../auth/user.entity';
import { getTransformId } from '../shared/utils';
import { Profile } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getProfile(username: string, user?: User) {
    const [profile] = await this.dataSource.query<[Profile | null]>(
      /* sql */ `SELECT
        u.bio,
        u.email,
        ${
          user
            ? /* sql */ `CASE (
              SELECT COUNT(*) FROM profile_follows WHERE profile_id = u.id AND user_id = $2
            )
              WHEN 0 THEN false
              ELSE true
            END`
            : 'false'
        } following,
        u.image,
        u.username
      FROM users u
      WHERE
        u.username = $1`,
      user ? [username, getTransformId('user').to(user.id)] : [username],
    );

    if (!profile) {
      throw new NotFoundException('No profile was found');
    }

    return plainToInstance(Profile, profile);
  }
}
