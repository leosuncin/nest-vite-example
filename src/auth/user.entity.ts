import { Exclude } from 'class-transformer';
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { generateId, getTransformId } from '../shared/utils';

@Entity('users')
export class User {
  @PrimaryColumn({
    type: 'bigint',
    transformer: getTransformId('user'),
  })
  id: `user_${string}` = generateId('user');

  @Column({ type: 'citext', unique: true })
  email!: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'citext', unique: true })
  username!: string;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'char', nullable: true })
  image!: string | null;
}
