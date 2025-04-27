import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, type FindOptionsWhere, type Repository } from 'typeorm';

import { User } from './user.entity';
import { Register } from './register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  register(newUser: Register) {
    const user = this.userRepository.create(newUser);

    return this.userRepository.save(user);
  }

  async isRegistered(partial: Partial<Pick<User, 'email' | 'username'>>) {
    const where: FindOptionsWhere<User> = {};

    for (const [property, value] of Object.entries(partial)) {
      if (value) {
        where[property] = Equal(value);
      }
    }

    const count = await this.userRepository.countBy(where);

    return count > 0;
  }
}
