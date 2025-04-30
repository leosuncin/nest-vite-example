import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { verify } from '@node-rs/argon2';
import { Equal, type FindOptionsWhere, type Repository } from 'typeorm';

import { Login } from './login.dto';
import { Register } from './register.dto';
import { User } from './user.entity';

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

  async verifyCredentials<
    C extends { email: string; password?: string } = Login,
    P = keyof C,
  >(credentials: C, property: P) {
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(credentials.email),
      },
      select: {
        email: true,
        password: true,
      },
    });

    if (!user) {
      return false;
    }

    if (property !== 'password') {
      return true;
    }

    return verify(user.password, credentials.password as string);
  }

  async findUserBy(
    property: keyof Pick<User, 'email' | 'id'>,
    value: User[typeof property],
  ) {
    return this.userRepository.findOneByOrFail({
      [property]: value,
    });
  }
}
