import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1757942366245 implements MigrationInterface {
    name = 'Init1757942366245'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`projects\` (\`uuid\` varchar(36) NOT NULL, \`name\` varchar(255) NOT NULL, \`description\` text NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_2187088ab5ef2a918473cb9900\` (\`name\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`uuid\` varchar(36) NOT NULL, \`name\` varchar(100) NOT NULL, \`key\` varchar(50) NOT NULL, \`type\` varchar(50) NOT NULL, \`description\` text NOT NULL, \`permissions\` text NOT NULL, \`projectUuid\` varchar(255) NOT NULL, \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, UNIQUE INDEX \`IDX_a87cf0659c3ac379b339acf36a\` (\`key\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`uuid\` varchar(36) NOT NULL, \`email\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`password\` varchar(255) NOT NULL, \`isActive\` tinyint NOT NULL DEFAULT 1, \`lastLogin\` timestamp NULL, \`failedLoginAttempts\` int NOT NULL DEFAULT '0', \`lockedUntil\` timestamp NULL, \`roleUuid\` varchar(255) NULL, \`projectUuid\` varchar(255) NOT NULL, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` datetime(6) NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`uuid\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`token_blacklist\` (\`id\` int NOT NULL AUTO_INCREMENT, \`token_jti\` varchar(255) NOT NULL, \`expires_at\` timestamp NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), INDEX \`IDX_f843323a807f2db43c4d8ba888\` (\`expires_at\`), UNIQUE INDEX \`IDX_7cdc3eb552f33f9fa94e4e2fb3\` (\`token_jti\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`roles\` ADD CONSTRAINT \`FK_41bf4b757de142d1ebbb50b0e42\` FOREIGN KEY (\`projectUuid\`) REFERENCES \`projects\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_b39d66a4614c9ce63dba591b093\` FOREIGN KEY (\`roleUuid\`) REFERENCES \`roles\`(\`uuid\`) ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_de813377fb7a2b85bfd164ebb26\` FOREIGN KEY (\`projectUuid\`) REFERENCES \`projects\`(\`uuid\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_de813377fb7a2b85bfd164ebb26\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_b39d66a4614c9ce63dba591b093\``);
        await queryRunner.query(`ALTER TABLE \`roles\` DROP FOREIGN KEY \`FK_41bf4b757de142d1ebbb50b0e42\``);
        await queryRunner.query(`DROP INDEX \`IDX_7cdc3eb552f33f9fa94e4e2fb3\` ON \`token_blacklist\``);
        await queryRunner.query(`DROP INDEX \`IDX_f843323a807f2db43c4d8ba888\` ON \`token_blacklist\``);
        await queryRunner.query(`DROP TABLE \`token_blacklist\``);
        await queryRunner.query(`DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP INDEX \`IDX_a87cf0659c3ac379b339acf36a\` ON \`roles\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_2187088ab5ef2a918473cb9900\` ON \`projects\``);
        await queryRunner.query(`DROP TABLE \`projects\``);
    }

}
