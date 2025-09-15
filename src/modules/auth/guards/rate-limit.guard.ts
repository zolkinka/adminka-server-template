import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request } from "express";

interface RateLimitData {
  attempts: number;
  resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly attempts = new Map<string, RateLimitData>();
  private readonly maxAttempts = parseInt(
    process.env.RATE_LIMIT_MAX || "5",
    10,
  );
  private readonly windowMs = parseInt(
    process.env.RATE_LIMIT_WINDOW || "900000",
    10,
  ); // 15 минут

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getKey(request);
    const now = Date.now();

    const data = this.attempts.get(key);

    if (!data || now > data.resetTime) {
      // Новое окно или первая попытка
      this.attempts.set(key, {
        attempts: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (data.attempts >= this.maxAttempts) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Превышено количество попыток входа. Попробуйте позже.",
            details: [
              `Попробуйте снова через ${Math.ceil((data.resetTime - now) / 60000)} минут`,
            ],
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    data.attempts++;
    return true;
  }

  private getKey(request: Request): string {
    // Используем IP + email для более точного ограничения
    const ip = request.ip || request.connection.remoteAddress || "unknown";
    const email = request.body?.email || "anonymous";
    return `${ip}:${email}`;
  }

  // Метод для очистки старых записей (можно вызывать периодически)
  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.attempts.entries()) {
      if (now > data.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}
