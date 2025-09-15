import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { Role } from "@/entities/role.entity";

@ApiTags("roles")
@Controller("api/roles")
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({
    operationId: "rolesGetAll",
    summary: "Получение всех ролей",
    description: "Возвращает список всех ролей в системе.",
  })
  @ApiResponse({
    status: 200,
    description: "Список ролей успешно получен",
    type: [Role],
  })
  findAll(): Promise<Role[]> {
    return this.rolesService.findAll();
  }

  @Get(":uuid")
  @ApiOperation({
    operationId: "rolesGetOne",
    summary: "Получение роли по UUID",
    description: "Возвращает роль по указанному UUID.",
  })
  @ApiParam({
    name: "uuid",
    description: "UUID роли",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Роль успешно найдена",
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: "Роль не найдена",
  })
  findOne(@Param("uuid") uuid: string): Promise<Role> {
    return this.rolesService.findOne(uuid);
  }

  @Post()
  @ApiOperation({
    operationId: "rolesCreate",
    summary: "Создание новой роли",
    description: "Создает новую роль в системе.",
  })
  @ApiResponse({
    status: 201,
    description: "Роль успешно создана",
    type: Role,
  })
  @ApiResponse({
    status: 400,
    description: "Невалидные данные для создания роли",
  })
  create(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    return this.rolesService.create(createRoleDto);
  }

  @Put(":uuid")
  @ApiOperation({
    operationId: "rolesUpdate",
    summary: "Обновление роли",
    description: "Обновляет существующую роль по UUID.",
  })
  @ApiParam({
    name: "uuid",
    description: "UUID роли для обновления",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Роль успешно обновлена",
    type: Role,
  })
  @ApiResponse({
    status: 404,
    description: "Роль не найдена",
  })
  @ApiResponse({
    status: 400,
    description: "Невалидные данные для обновления роли",
  })
  update(
    @Param("uuid") uuid: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<Role> {
    return this.rolesService.update(uuid, updateRoleDto);
  }

  @Delete(":uuid")
  @ApiOperation({
    operationId: "rolesDelete",
    summary: "Удаление роли",
    description: "Удаляет роль по указанному UUID.",
  })
  @ApiParam({
    name: "uuid",
    description: "UUID роли для уда��ения",
    type: "string",
  })
  @ApiResponse({
    status: 200,
    description: "Роль успешно удалена",
  })
  @ApiResponse({
    status: 404,
    description: "Роль не найдена",
  })
  remove(@Param("uuid") uuid: string): Promise<void> {
    return this.rolesService.remove(uuid);
  }
}