import { ApiProperty } from "@nestjs/swagger";
import { RoleType } from "@/entities/role.entity";

export class RoleResponseDto {
  @ApiProperty({
    example: "uuid-here",
    description: "UUID роли",
  })
  uuid: string;

  @ApiProperty({
    example: "Administrator",
    description: "Название роли",
  })
  name: string;

  @ApiProperty({
    example: "ADMIN_PROJECT_123",
    description: "Уникальный ключ роли",
  })
  key: string;

  @ApiProperty({
    enum: RoleType,
    example: RoleType.ADMIN,
    description: "Тип роли",
  })
  type: RoleType;

  @ApiProperty({
    example: "Роль администратора с полными правами",
    description: "Описание роли",
  })
  description: string;

  @ApiProperty({
    example: ["users:read", "users:write", "roles:manage"],
    description: "Список разрешений роли",
    type: [String],
  })
  permissions: string[];
}