import { ApiProperty } from "@nestjs/swagger";
import { User } from "@/entities";

export class RegisterResponseDto {
  @ApiProperty({
    description: "Статус выполнения операции",
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: "Сообщение о результате операции",
    example: "Пользователь успешно создан",
  })
  message: string;

  @ApiProperty({
    description: "Данные созданного пользователя",
    type: () => User,
  })
  user: User;
}
