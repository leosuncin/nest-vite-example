import { extname } from 'node:path';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { verify } from '@node-rs/argon2';
import { Client } from 'minio';
import { Equal, Not, type FindOptionsWhere, type Repository } from 'typeorm';

import { Login } from './login.dto';
import { Register } from './register.dto';
import { UpdateUser } from './update-user.dto';
import { BUCKET_NAME } from './upload.constants';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly client: Client,
  ) {}

  register(newUser: Register) {
    const user = this.userRepository.create(newUser);

    return this.userRepository.save(user);
  }

  async isRegistered(
    partial: Partial<Pick<User, 'email' | 'id' | 'username'>>,
  ) {
    const where: FindOptionsWhere<User> = Object.fromEntries(
      Object.entries(partial)
        .filter(([, value]) => Boolean(value))
        .map(([property, value]) => [
          property,
          property === 'id' ? Not(value) : Equal(value),
        ]),
    );

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

  async updateUser(
    user: User,
    changes: UpdateUser,
    image?: Express.Multer.File,
  ) {
    if (image) {
      const ext = extname(image.originalname);
      const objectName = `${user.id}${ext}`;
      const metadata = {
        'Content-Type': 'image/jpeg', // forced MIME type
        'Content-Disposition': 'inline',
        'X-Original-Name': image.originalname,
      };
      await this.client.putObject(
        BUCKET_NAME,
        objectName,
        image.buffer,
        image.size,
        metadata,
      );
      changes.image = await this.client.presignedUrl(
        'GET',
        BUCKET_NAME,
        objectName,
        undefined,
        metadata,
      );
    }

    this.userRepository.merge(user, changes);

    return this.userRepository.save(user);
  }
}
