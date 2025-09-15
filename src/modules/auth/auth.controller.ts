import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Res,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { type Response, type Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
} from './dto/auth-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { ErrorResponseDto } from './dto/error-response.dto';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { User } from '@/entities';

@ApiTags('auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(RateLimitGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Аутентификация пользователя',
    description:
      'Вход в систему через email и пароль. Устанавливает HTTP-only cookie с JWT токеном.',
  })
  @ApiResponse({
    status: 200,
    description: 'Успешная авторизация',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Невалидные данные',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный email или пароль',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 423,
    description: 'Аккаунт заблокирован',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 429,
    description: 'Превышено количество попыток входа',
    type: ErrorResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const result = await this.authService.login(loginDto);

    // Получаем JWT токен из результата (он создается в сервисе, но не возвращается в ответе)
    const payload = {
      sub: result.user.uuid,
      email: result.user.email,
      role: result.user.role,
      projectUuid: result.user.uuid, // Временно, пока не реализована многопроектность
      jti: require('uuid').v4(),
    };

    const jwt = require('@nestjs/jwt');
    const jwtService = new jwt.JwtService({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    });

    const token = jwtService.sign(payload);

    // Установить HTTP-only cookie
    response.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE as any) || 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
      domain: process.env.COOKIE_DOMAIN,
    });

    return result;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Выход из системы',
    description:
      'Выход из системы. Удаляет HTTP-only cookie и добавляет токен в blacklist.',
  })
  @ApiCookieAuth('auth-token')
  @ApiResponse({
    status: 200,
    description: 'Успешный выход из системы',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Токен недействителен или отсутствует',
    type: ErrorResponseDto,
  })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LogoutResponseDto> {
    const token = request.cookies['auth-token'];

    if (token) {
      await this.authService.logout(token);
    }

    // Удалить cookie
    response.clearCookie('auth-token', {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE as any) || 'lax',
      domain: process.env.COOKIE_DOMAIN,
    });

    return {
      success: true,
      message: 'Успешный выход из системы',
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Получение информации о текущем пользователе',
    description: 'Возвращает информацию о текущем авторизованном пользователе.',
  })
  @ApiCookieAuth('auth-token')
  @ApiResponse({
    status: 200,
    description: 'Информация о текущем пользователе',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Токен недействителен или отсутствует',
    type: ErrorResponseDto,
  })
  async getCurrentUser(@CurrentUser() user: User): Promise<UserResponseDto> {
    return await this.authService.getCurrentUser(user.uuid);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Обновление токена',
    description:
      'Обновляет JWT токен при активности пользователя. Старый токен добавляется в blacklist.',
  })
  @ApiCookieAuth('auth-token')
  @ApiResponse({
    status: 200,
    description: 'Токен успешно обновлен',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Токен недействителен или отсутствует',
    type: ErrorResponseDto,
  })
  async refresh(
    @CurrentUser() user: User,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<RefreshResponseDto> {
    const oldToken = request.cookies['auth-token'];

    const result = await this.authService.refresh(oldToken, user.uuid);

    // Создать новый токен
    const payload = {
      sub: user.uuid,
      email: user.email,
      role: user.role.type,
      projectUuid: user.projectUuid,
      jti: require('uuid').v4(),
    };

    const jwt = require('@nestjs/jwt');
    const jwtService = new jwt.JwtService({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '24h' },
    });

    const newToken = jwtService.sign(payload);

    // Установить новый HTTP-only cookie
    response.cookie('auth-token', newToken, {
      httpOnly: true,
      secure: process.env.COOKIE_SECURE === 'true',
      sameSite: (process.env.COOKIE_SAME_SITE as any) || 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 часа
      domain: process.env.COOKIE_DOMAIN,
    });

    return result;
  }
}
