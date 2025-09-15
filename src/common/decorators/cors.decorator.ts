import { SetMetadata } from "@nestjs/common";

export const CORS_ORIGINS_KEY = "corsOrigins";

/**
 * Декоратор для настройки CORS для отдельных контроллеров или методов
 * @param origins - массив разрешенных origins или строка с одним origin
 */
export const CorsOrigins = (...origins: string[]) =>
  SetMetadata(CORS_ORIGINS_KEY, origins);

/**
 * Декоратор для разрешения всех origins (только для development)
 */
export const AllowAllOrigins = () => SetMetadata(CORS_ORIGINS_KEY, ["*"]);

/**
 * Декоратор для блокировки CORS (запрет cross-origin запросов)
 */
export const BlockCors = () => SetMetadata(CORS_ORIGINS_KEY, []);
