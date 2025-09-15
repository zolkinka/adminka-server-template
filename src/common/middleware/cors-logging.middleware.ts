import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * Middleware для логирования CORS запросов
 */
@Injectable()
export class CorsLoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger("CORS");

  use(req: Request, res: Response, next: NextFunction) {
    const origin = req.get("Origin");
    const method = req.method;
    const url = req.url;

    // Логируем preflight запросы (OPTIONS)
    if (method === "OPTIONS") {
      this.logger.debug(
        `Preflight request from ${origin || "unknown"} to ${method} ${url}`,
      );

      // Логируем заголовки preflight запроса
      const requestedMethod = req.get("Access-Control-Request-Method");
      const requestedHeaders = req.get("Access-Control-Request-Headers");

      if (requestedMethod) {
        this.logger.debug(`Requested method: ${requestedMethod}`);
      }
      if (requestedHeaders) {
        this.logger.debug(`Requested headers: ${requestedHeaders}`);
      }
    } else if (origin) {
      // Логируем обычные cross-origin запросы
      this.logger.debug(
        `Cross-origin ${method} request from ${origin} to ${url}`,
      );
    }

    // Добавл��ем обработчик для логирования ответа
    const originalSend = res.send.bind(res);
    res.send = function (body: any) {
      if (origin && method === "OPTIONS") {
        const corsHeaders = {
          "Access-Control-Allow-Origin": res.get("Access-Control-Allow-Origin"),
          "Access-Control-Allow-Methods": res.get(
            "Access-Control-Allow-Methods",
          ),
          "Access-Control-Allow-Headers": res.get(
            "Access-Control-Allow-Headers",
          ),
          "Access-Control-Allow-Credentials": res.get(
            "Access-Control-Allow-Credentials",
          ),
        };

        Logger.debug(
          `CORS response headers: ${JSON.stringify(corsHeaders, null, 2)}`,
          "CORS",
        );
      }

      return originalSend(body);
    };

    next();
  }
}
