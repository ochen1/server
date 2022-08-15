import { MigrationInterface, QueryRunner } from "typeorm";

export class updateConnectedAccounts1660521789818 implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "temporary_connected_accounts" (
				"id"	varchar NOT NULL,
				"user_id"	varchar,
				"access_token"	varchar,
				"friend_sync"	boolean NOT NULL,
				"name"	varchar NOT NULL,
				"revoked"	boolean NOT NULL,
				"show_activity"	boolean NOT NULL,
				"type"	varchar NOT NULL,
				"verified"	boolean NOT NULL,
				"visibility"	integer NOT NULL,
				"external_id"	varchar NOT NULL,
				"integrations"	varchar NOT NULL,
				CONSTRAINT "FK_f47244225a6a1eac04a3463dd90" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
				PRIMARY KEY("id")
			);
        `);

		await queryRunner.query(`
            INSERT INTO "temporary_connected_accounts" (
                "id",
                "user_id",
                "access_token",
                "friend_sync",
                "name",
                "revoked",
                "show_activity",
                "type",
                "verified",
                "visibility"
            )
			SELECT "id",
				"user_id",
				"access_token",
				"friend_sync",
				"name",
				"revoked",
				"show_activity",
				"type",
				"verified",
				"visibility"
			FROM "connected_accounts"
        `);

		await queryRunner.query(`
            DROP TABLE "connected_accounts"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_connected_accounts"
                RENAME TO "connected_accounts"
        `);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.query(`
			CREATE TABLE "temporary_connected_accounts" (
				"id"	varchar NOT NULL,
				"user_id"	varchar,
				"access_token"	varchar,
				"friend_sync"	boolean NOT NULL,
				"name"	varchar NOT NULL,
				"revoked"	boolean NOT NULL,
				"show_activity"	boolean NOT NULL,
				"type"	varchar NOT NULL,
				"verified"	boolean NOT NULL,
				"visibility"	integer NOT NULL,
				CONSTRAINT "FK_f47244225a6a1eac04a3463dd90" FOREIGN KEY("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
				PRIMARY KEY("id")
			);
        `);

		await queryRunner.query(`
            INSERT INTO "temporary_connected_accounts" (
                "id",
                "user_id",
                "access_token",
                "friend_sync",
                "name",
                "revoked",
                "show_activity",
                "type",
                "verified",
                "visibility"
            )
			SELECT "id",
				"user_id",
				"access_token",
				"friend_sync",
				"name",
				"revoked",
				"show_activity",
				"type",
				"verified",
				"visibility"
			FROM "connected_accounts"
        `);

		await queryRunner.query(`
            DROP TABLE "connected_accounts"
        `);
		await queryRunner.query(`
            ALTER TABLE "temporary_connected_accounts"
                RENAME TO "connected_accounts"
        `);
	}
}
