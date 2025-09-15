import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Email пользователя',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email: string;

  @ApiProperty({
    description: 'Имя пользователя',
    example: 'Иван Иванов',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(100, { message: 'Имя не должно превышать 100 символов' })
  name: string;

  @ApiProperty({
    description: 'Пароль пользователя',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(128, { message: 'Пароль не должен превышать 128 символов' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Пароль должен содержать минимум одну заглавную букву, одну строчную букву, одну цифру и один специальный символ',
  })
  password: string;

  @ApiProperty({
    description: 'UUID проекта для привязки пользователя',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'projectUuid должен быть валидным UUID' })
  projectUuid?: string;

  @ApiProperty({
    description: 'UUID роли для назначения пользователю',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d480',
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: 'roleUuid должен быть валидным UUID' })
  roleUuid?: string;
}
