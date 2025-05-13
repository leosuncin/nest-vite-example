import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfileFollowsTable implements MigrationInterface {
  name = 'CreateProfileFollowsTable1746404221231';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/*sql*/ `CREATE TABLE profile_follows (
      user_id BigInt NOT NULL REFERENCES users(id),
      profile_id BigInt NOT NULL REFERENCES users(id),
      PRIMARY KEY(user_id, profile_id)
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('profile_follows');
  }
}
