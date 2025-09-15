import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import { Project, User, Role, TokenBlacklist } from "../entities";

dotenv.config();

const isDev = process.env.NODE_ENV === "development";

export default new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "3306", 10),
  username: process.env.DB_USER || process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || process.env.DB_DATABASE || "adminka_booking",
  entities: [Project, User, Role, TokenBlacklist],
  migrations: ["src/database/migrations/*{.ts,.js}"],
  synchronize: false,
  logging: isDev,
  charset: "utf8mb4",
});
