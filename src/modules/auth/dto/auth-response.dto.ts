import { ApiProperty } from "@nestjs/swagger";
import { UserResponseDto } from "./user-response.dto";

export class AuthResponseDto {
  @ApiProperty({
    example: true,
    description: "Статус успешности операции",
  })
  success: boolean;

  @ApiProperty({
    example: "Успешная авторизация",
    description: "Сообщение о результате операции",
  })
  message: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "JWT токен доступа",
  })
  accessToken: string;

  @ApiProperty({
    example: "project-uuid-here",
    description: "UUID проекта пользователя",
  })
  projectUuid: string;

  @ApiProperty({
    type: UserResponseDto,
    description: "Информация о пользователе",
  })
  user: UserResponseDto;
}

export class LogoutResponseDto {
  @ApiProperty({
    example: true,
    description: "Статус успешности операции",
  })
  success: boolean;

  @ApiProperty({
    example: "Успешный выход из системы",
    description: "Сообщение о результате операции",
  })
  message: string;
}

export class RefreshResponseDto {
  @ApiProperty({
    example: true,
    description: "Статус успешности операции",
  })
  success: boolean;

  @ApiProperty({
    example: "Токен обновлен",
    description: "Сообщение о результате операции",
  })
  message: string;

  @ApiProperty({
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    description: "Новый JWT токен доступа",
  })
  accessToken: string;
}