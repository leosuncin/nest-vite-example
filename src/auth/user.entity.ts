import { Exclude } from 'class-transformer';
import HashId from 'hashids';
import Snowflakify from 'snowflakify';
import { Column, Entity, PrimaryColumn } from 'typeorm';

const hashId = new HashId();

function genId(): `user_${string}` {
  const snowflakify = new Snowflakify();
  const id = snowflakify.nextId();
  const numbers = snowflakify.destructure(id).map((fragment) => fragment.value);

  return `user_${hashId.encode(numbers)}`;
}

@Entity('users')
export class User {
  @PrimaryColumn({
    type: 'bigint',
    transformer: {
      from(value: bigint) {
        return `user_${hashId.encode(value)}`;
      },
      to(value: `user_${string}`) {
        const [, id] = value.split('_') as ['user', string];

        return hashId
          .decode(id)
          .map(BigInt)
          .reduce((a, b) => a + b, 0n);
      },
    },
  })
  id: `user_${string}` = genId();

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
