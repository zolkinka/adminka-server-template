import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    example: false,
    description: 'Статус успешности операции',
  })
  success: boolean;

  @ApiProperty({
    type: 'object',
    properties: {
      code: {
        type: 'string',
        example: 'INVALID_CREDENTIALS',
        description: 'Код ошибки',
      },
      message: {
        type: 'string',
        example: 'Неверный email или пароль',
        description: 'Сообщение об ошибке',
      },
      details: {
        type: 'array',
        items: { type: 'string' },
        example: [],
        description: 'Детали ошибки',
      },
    },
    description: 'Информация об ошибке',
  })
  error: {
    code: string;
    message: string;
    details: string[];
  };
}
