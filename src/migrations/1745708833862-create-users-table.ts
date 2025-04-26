import type { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable implements MigrationInterface {
  name = 'CreateUsersTable1745708833862';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `CREATE EXTENSION IF NOT EXISTS citext`);
    await queryRunner.query(/* sql */ `CREATE TABLE users (
      id BigInt PRIMARY KEY,
      email CiText NOT NULL CONSTRAINT email_unique UNIQUE,
      password VarChar,
      username CiText NOT NULL CONSTRAINT username_unique UNIQUE,
      bio Text,
      image BpChar
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `DROP TABLE users`);
    await queryRunner.query(/* sql */ `DROP EXTENSION IF EXISTS citext`);
  }
}
