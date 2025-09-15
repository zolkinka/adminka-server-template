import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";
import { RoleType } from "@/entities/role.entity";

class AuthRoleDto {
  @ApiProperty({ example: "uuid-here", description: "Role UUID" })
  uuid: string;

  @ApiProperty({ example: "Admin", description: "Role name" })
  name: string;

  @ApiProperty({
    example: "ADMIN",
    description: "Role type",
    enum: RoleType,
  })
  type: RoleType;

  @ApiProperty({
    type: [String],
    example: ["read:users", "write:users"],
    description: "Role permissions",
  })
  permissions: string[];
}

class AuthUserDto {
  @ApiProperty({ example: "uuid-here", description: "User UUID" })
  uuid: string;

  @ApiProperty({ example: "user@example.com", description: "User email" })
  email: string;

  @ApiProperty({ example: "John Doe", description: "User name" })
  name: string;

  @ApiProperty({ example: "role-uuid-here", description: "Role UUID" })
  roleUuid: string;

  @ApiProperty({ example: "project-uuid-here", description: "Project UUID" })
  projectUuid: string;

  @ApiProperty({
    example: "2024-01-01T00:00:00Z",
    description: "Creation date",
    type: "string",
    format: "date-time",
  })
  createdAt: Date;

  @ApiProperty({
    example: "2024-01-01T00:00:00Z",
    description: "Last update date",
    type: "string",
    format: "date-time",
  })
  updatedAt: Date;

  @ApiProperty({
    description: "User role",
    type: AuthRoleDto,
  })
  role: AuthRoleDto;
}

export class LoginDto {
  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "password123", description: "User password" })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "John Doe", description: "User name" })
  @IsString()
  name: string;

  @ApiProperty({ example: "password123", description: "User password" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: "role-uuid-here",
    description: "Role UUID (optional, defaults to basic user role)",
    required: false,
  })
  @IsOptional()
  @IsString()
  roleUuid?: string;
}

export class CreateFirstUserDto {
  @ApiProperty({ example: "admin@example.com", description: "Admin email" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "Admin User", description: "Admin name" })
  @IsString()
  name: string;

  @ApiProperty({ example: "strongpassword123", description: "Admin password" })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: "My Company", description: "Project name" })
  @IsString()
  projectName: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: "jwt-token-here", description: "JWT access token" })
  accessToken: string;

  @ApiProperty({ example: "uuid-here", description: "Project UUID" })
  projectUuid: string;

  @ApiProperty({
    description: "User information",
    type: AuthUserDto,
  })
  user: AuthUserDto;
}

export class ProfileResponseDto {
  @ApiProperty({
    description: "User information",
    type: AuthUserDto,
  })
  user: AuthUserDto;
}

export class JwtPayload {
  sub: string; // user uuid
  email: string;
  projectUuid: string;
  roleUuid: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}
