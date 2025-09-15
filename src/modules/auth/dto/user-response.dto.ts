import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({
    example: "uuid-here",
    description: "UUID пользователя",
  })
  uuid: string;

  @ApiProperty({
    example: "admin@example.com",
    description: "Email пользователя",
  })
  email: string;

  @ApiProperty({
    example: "John Doe",
    description: "Имя пользователя",
  })
  name: string;

  @ApiProperty({
    example: "admin",
    description: "Роль пользователя",
  })
  role: string;

  @ApiProperty({
    example: "2024-01-15T10:30:00Z",
    description: "Время последнего входа",
    required: false,
  })
  lastLogin?: Date | null;
}
