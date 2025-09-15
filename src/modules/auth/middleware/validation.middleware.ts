import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as validator from 'validator';

@Injectable()
export class ValidationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Санитизация входных данных
    if (req.body) {
      this.sanitizeObject(req.body);
    }

    if (req.query) {
      this.sanitizeObject(req.query);
    }

    if (req.params) {
      this.sanitizeObject(req.params);
    }

    next();
  }

  private sanitizeObject(obj: any): void {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'string') {
          // Удалить потенциально опасные символы
          obj[key] = validator.escape(obj[key].trim());

          // Проверить на SQL injection паттерны
          if (this.containsSqlInjection(obj[key])) {
            throw new BadRequestException({
              success: false,
              error: {
                code: 'INVALID_INPUT',
                message: 'Обнаружены недопустимые символы в данных',
                details: [`Поле ${key} содержит недопустимые символы`],
              },
            });
          }
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          this.sanitizeObject(obj[key]);
        }
      }
    }
  }

  private containsSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
      /(exec(\s|\+)+(s|x)p\w+)/i,
      /union.*select/i,
      /insert.*into/i,
      /delete.*from/i,
      /update.*set/i,
      /drop.*table/i,
      /create.*table/i,
      /alter.*table/i,
    ];

    return sqlPatterns.some((pattern) => pattern.test(input));
  }
}
