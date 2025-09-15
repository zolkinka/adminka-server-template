import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies?.['auth-token'];

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: 'TOKEN_MISSING',
          message: 'Токен авторизации отсутствует',
          details: ['Необходимо войти в систему'],
        },
      });
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Проверить blacklist
      if (
        payload.jti &&
        (await this.authService.isTokenBlacklisted(payload.jti))
      ) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'TOKEN_REVOKED',
            message: 'Токен был отозван',
            details: ['Необходимо войти в систему заново'],
          },
        });
      }

      // Найти пользователя
      const user = await this.authService.validateUser(
        payload.sub,
        payload.projectUuid,
      );
      if (!user) {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Пользователь не найден',
            details: ['Пользователь может быть удален или деактивирован'],
          },
        });
      }

      request.user = user;
      return true;
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'TOKEN_INVALID',
            message: 'Недействительный токен',
            details: ['Токен поврежден или имеет неверный формат'],
          },
        });
      }

      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException({
          success: false,
          error: {
            code: 'TOKEN_EXPIRED',
            message: 'Токен истек',
            details: ['Необходимо войти в систему заново'],
          },
        });
      }

      throw error;
    }
  }
}
