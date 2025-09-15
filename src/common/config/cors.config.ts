import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

/**
 * Конфигурация CORS для приложения
 */
export class CorsConfig {
  /**
   * Получает список разрешенных origins
   */
  private static getAllowedOrigins(): string[] {
    const corsOrigins = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : [
          "http://localhost:3000",
          "http://localhost:5173",
          "http://localhost:3001",
          "http://localhost:8080",
          "http://127.0.0.1:3000",
          "http://127.0.0.1:3001",
          "http://127.0.0.1:8080",
        ];

    // Добавляем фронтенд URL из переменной окружения, если он задан
    if (
      process.env.FRONTEND_URL &&
      !corsOrigins.includes(process.env.FRONTEND_URL)
    ) {
      corsOrigins.push(process.env.FRONTEND_URL);
    }

    return corsOrigins;
  }

  /**
   * Проверяет, разрешен ли origin
   */
  private static isOriginAllowed(origin: string): boolean {
    const allowedOrigins = this.getAllowedOrigins();

    // Проверяем точное совпадение
    if (allowedOrigins.includes(origin)) {
      return true;
    }

    // В режиме разработки разрешаем localhost с любым портом
    if (
      process.env.NODE_ENV === "development" &&
      origin.includes("localhost")
    ) {
      return true;
    }

    // В режиме разработки разрешаем 127.0.0.1 с любым портом
    if (
      process.env.NODE_ENV === "development" &&
      origin.includes("127.0.0.1")
    ) {
      return true;
    }

    return false;
  }

  /**
   * Возвращает конфигурацию CORS
   */
  public static getCorsOptions(): CorsOptions {
    return {
      origin: (origin, callback) => {
        // Разрешаем запросы без origin (например, мобильные приложения, Postman)
        if (!origin) {
          return callback(null, true);
        }

        // Проверяем, что origin разрешен
        if (this.isOriginAllowed(origin)) {
          return callback(null, true);
        }

        // Отклоняем остальные origins
        const error = new Error(`Origin ${origin} not allowed by CORS policy`);
        console.warn(`🚫 CORS blocked request from origin: ${origin}`);
        return callback(error, false);
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Project-UUID",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "Cache-Control",
        "Pragma",
      ],
      exposedHeaders: [
        "Set-Cookie",
        "X-Total-Count",
        "X-Rate-Limit-Limit",
        "X-Rate-Limit-Remaining",
        "X-Rate-Limit-Reset",
        "Content-Range",
        "Accept-Ranges",
      ],
      maxAge: 86400, // 24 часа кеширования preflight запросов
      optionsSuccessStatus: 200, // Для совместимости со старыми браузерами
      preflightContinue: false,
    };
  }

  /**
   * Логирует текущую конфигурацию CORS
   */
  public static logConfiguration(): void {
    const allowedOrigins = this.getAllowedOrigins();
    console.log("🌐 CORS Configuration:");
    console.log(`   - Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`   - Allowed origins: ${allowedOrigins.length}`);
    allowedOrigins.forEach((origin) => {
      console.log(`     • ${origin}`);
    });
    console.log(`   - Credentials enabled: true`);
    console.log(`   - Preflight cache: 24 hours`);
  }
}
