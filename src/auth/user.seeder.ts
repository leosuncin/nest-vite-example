import type { DataSource } from 'typeorm';
import type { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from './user.entity';

export class UserSeeder implements Seeder {
  async run(
    _dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userFactory = factoryManager.get(User);

    await userFactory.save({
      email: 'john.doe@conduit.lol',
      password:
        '$argon2id$v=19$m=19456,t=2,p=1$Cj8wmzZ3kAxlkTGItQCMMg$kSfagzttfl7riBWStINIuFt8CzguK+H+TdMmZ0Ly6IQ',
      username: 'john.doe',
    });
  }
}
