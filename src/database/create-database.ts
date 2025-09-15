import "reflect-metadata";
import * as dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

async function main() {
  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || process.env.DB_USERNAME || "root";
  const password = process.env.DB_PASSWORD || "password";
  const dbName =
    process.env.DB_NAME || process.env.DB_DATABASE || "adminka_booking";

  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
  });

  // Полностью пересоздаем базу данных
  await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
  await connection.query(
    `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );

  await connection.end();

  console.log(`Database recreated: ${dbName}`);
}

main().catch((e) => {
  console.error("DB create failed", e);
  process.exit(1);
});
