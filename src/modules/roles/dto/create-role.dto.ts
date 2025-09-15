import {
  IsString,
  IsEnum,
  IsArray,
  IsNotEmpty,
  MaxLength,
} from "class-validator";
import { RoleType } from "@/entities/role.entity";

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  key: string;

  @IsEnum(RoleType)
  type: RoleType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  permissions: string[];

  @IsString()
  @IsNotEmpty()
  projectUuid: string;
}
