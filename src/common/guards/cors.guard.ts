import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { CORS_ORIGINS_KEY } from "@/common/decorators/cors.decorator";

/**
 * Guard для контроля CORS на уровне отдельных эндпоинтов
 */
@Injectable()
export class CorsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const origin = request.get("Origin");

    // Если origin не указан, разрешаем запрос (не cross-origin)
    if (!origin) {
      return true;
    }

    // Получаем метаданные CORS для текущего метода или контроллера
    const corsOrigins = this.reflector.getAllAndOverride<string[]>(
      CORS_ORIGINS_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Если метаданные не заданы, используем стандартную логику
    if (!corsOrigins) {
      return true;
    }

    // Если задан пустой массив, блокируем все cross-origin запросы
    if (corsOrigins.length === 0) {
      throw new ForbiddenException(
        "Cross-origin requests are not allowed for this endpoint",
      );
    }

    // Если разрешены все origins
    if (corsOrigins.includes("*")) {
      if (process.env.NODE_ENV !== "development") {
        throw new ForbiddenException(
          "Wildcard CORS is only allowed in development mode",
        );
      }
      return true;
    }

    // Проверяем, что origin в списке разрешенных
    if (corsOrigins.includes(origin)) {
      return true;
    }

    throw new ForbiddenException(
      `Origin ${origin} is not allowed for this endpoint`,
    );
  }
}
