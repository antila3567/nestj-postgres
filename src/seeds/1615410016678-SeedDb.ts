import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1615410016678 implements MigrationInterface {
  name = 'SeedDb1615410016678';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name) VALUES ('dragons'), ('art'), ('dev')`,
    );

    //pass 123456
    await queryRunner.query(
      `INSERT INTO users (username, email, password) VALUES('olha', 'qwerty@gmail.com', '$2b$10$PCBrNiyA4zZgnUOgwnnpk.mlRF3ArsxYRSzKCklF.OnYj6ErmneMi')`,
    );

    await queryRunner.query(
      `INSERT INTO articles (slug, title, description, body, "tagList", "authorId") VALUES ('first-article', 'First article', 'First article description', 'First article body', 'coffee,dragons', 1), ('second-article', 'Second article', 'Second article description', 'Second article body', 'coffee,dragons', 1)`,
    );
  }

  public async down(): Promise<void> {}
}
