import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";
import * as bcrypt from "bcryptjs";
import { User, Role, RoleType, Project, TokenBlacklist } from "@/entities";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { RegisterResponseDto } from "./dto/register-response.dto";
import {
  AuthResponseDto,
  LogoutResponseDto,
  RefreshResponseDto,
} from "./dto/auth-response.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { RoleResponseDto } from "./dto/role-response.dto";
import { JwtPayload } from "./interfaces/jwt-payload.interface";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(TokenBlacklist)
    private readonly tokenBlacklistRepository: Repository<TokenBlacklist>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Найти пользователя с паролем
    const user = await this.userRepository.findOne({
      where: {
        email,
        deletedAt: IsNull(),
        isActive: true,
      },
      relations: ["role", "project"],
      select: [
        "uuid",
        "email",
        "name",
        "password",
        "projectUuid",
        "roleUuid",
        "failedLoginAttempts",
        "lockedUntil",
        "lastLogin",
      ],
    });

    if (!user) {
      throw new UnauthorizedException({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Неверный email или пароль",
          details: [],
        },
      });
    }

    // Проверить блокировку аккаунта
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const lockDurationMinutes = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 60000,
      );
      throw new HttpException(
        {
          success: false,
          error: {
            code: "ACCOUNT_LOCKED",
            message:
              "Аккаунт заблокирован из-за множественных неудачных попыток входа",
            details: [`Попробуйте снова через ${lockDurationMinutes} минут`],
          },
        },
        HttpStatus.LOCKED,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      // Увеличить счетчик неудачных попыток
      await this.handleFailedLogin(user);
      throw new UnauthorizedException({
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Неверный email или пароль",
          details: [],
        },
      });
    }

    // Сбросить счетчик неудачных попыток при успешном входе
    await this.userRepository.update(user.uuid, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLogin: new Date(),
    });

    const jti = uuidv4();
    const payload: JwtPayload = {
      sub: user.uuid,
      email: user.email,
      role: user.role.type,
      projectUuid: user.projectUuid,
      jti,
    };

    const accessToken = this.jwtService.sign(payload);

    const roleResponse: RoleResponseDto = {
      uuid: user.role.uuid,
      name: user.role.name,
      key: user.role.key,
      type: user.role.type,
      description: user.role.description,
      permissions: user.role.permissions,
    };

    return {
      success: true,
      message: "Успешная авторизация",
      accessToken,
      projectUuid: user.projectUuid,
      user: {
        uuid: user.uuid,
        email: user.email,
        name: user.name,
        role: roleResponse,
        lastLogin: new Date(),
      },
    };
  }

  async logout(jti: string): Promise<LogoutResponseDto> {
    // Добавить токен в blacklist
    const decoded = this.jwtService.decode(jti);
    if (decoded && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      await this.tokenBlacklistRepository.save({
        token_jti: decoded.jti,
        expires_at: expiresAt,
      });
    }

    return {
      success: true,
      message: "��спешный выход из системы",
    };
  }

  async refresh(oldJti: string, userUuid: string): Promise<RefreshResponseDto> {
    // Добавить старый токен в blacklist
    const decoded = this.jwtService.decode(oldJti);
    if (decoded && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      await this.tokenBlacklistRepository.save({
        token_jti: decoded.jti,
        expires_at: expiresAt,
      });
    }

    // Найти пользователя для создания нового токена
    const user = await this.userRepository.findOne({
      where: {
        uuid: userUuid,
        deletedAt: IsNull(),
        isActive: true,
      },
      relations: ["role"],
    });

    if (!user) {
      throw new UnauthorizedException("Пользователь не найден");
    }

    const newJti = uuidv4();
    const payload: JwtPayload = {
      sub: user.uuid,
      email: user.email,
      role: user.role.type,
      projectUuid: user.projectUuid,
      jti: newJti,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      message: "Токен обновлен",
      accessToken,
    };
  }

  async getCurrentUser(userUuid: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        uuid: userUuid,
        deletedAt: IsNull(),
        isActive: true,
      },
      relations: ["role"],
    });

    if (!user) {
      throw new NotFoundException("Пользователь не найден");
    }

    const roleResponse: RoleResponseDto = {
      uuid: user.role.uuid,
      name: user.role.name,
      key: user.role.key,
      type: user.role.type,
      description: user.role.description,
      permissions: user.role.permissions,
    };

    return {
      uuid: user.uuid,
      email: user.email,
      name: user.name,
      role: roleResponse,
      lastLogin: user.lastLogin,
    };
  }

  async isTokenBlacklisted(jti: string): Promise<boolean> {
    const blacklistedToken = await this.tokenBlacklistRepository.findOne({
      where: { token_jti: jti },
    });
    return !!blacklistedToken;
  }

  async validateUser(
    userUuid: string,
    projectUuid: string,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        uuid: userUuid,
        projectUuid,
        deletedAt: IsNull(),
        isActive: true,
      },
      relations: ["role", "project"],
    });
  }

  private async handleFailedLogin(user: User): Promise<void> {
    const maxAttempts = parseInt(process.env.MAX_LOGIN_ATTEMPTS || "5", 10);
    const lockDuration = parseInt(
      process.env.ACCOUNT_LOCK_DURATION || "1800000",
      10,
    ); // 30 минут

    const newAttempts = user.failedLoginAttempts + 1;
    const updateData: Partial<User> = {
      failedLoginAttempts: newAttempts,
    };

    if (newAttempts >= maxAttempts) {
      updateData.lockedUntil = new Date(Date.now() + lockDuration);
    }

    await this.userRepository.update(user.uuid, updateData);
  }

  // Метод для очистки истекших токенов из blacklist
  async cleanupExpiredTokens(): Promise<void> {
    await this.tokenBlacklistRepository
      .createQueryBuilder()
      .delete()
      .where("expires_at < :now", { now: new Date() })
      .execute();
  }

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    const { email, name, password, projectUuid, roleUuid } = registerDto;

    // Проверить, существует ли пользователь с таким email
    const existingUser = await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });

    if (existingUser) {
      throw new ConflictException({
        success: false,
        error: {
          code: "EMAIL_ALREADY_EXISTS",
          message: "Пользователь с таким email уже существует",
          details: [],
        },
      });
    }

    // Найти или создать проект по умолчанию
    let project: Project | null = null;
    if (projectUuid) {
      project = await this.projectRepository.findOne({
        where: { uuid: projectUuid, deletedAt: IsNull() },
      });
      if (!project) {
        throw new NotFoundException({
          success: false,
          error: {
            code: "PROJECT_NOT_FOUND",
            message: "Указанный проект не найден",
            details: [],
          },
        });
      }
    } else {
      // Найти проект по умолчанию или создать его
      project = await this.projectRepository.findOne({
        where: { name: "Default Project", deletedAt: IsNull() },
      });

      if (!project) {
        project = this.projectRepository.create({
          uuid: uuidv4(),
          name: "Default Project",
          description: "Проект по умолчанию",
        });
        await this.projectRepository.save(project);
      }
    }

    // Найти или создать роль
    let role: Role | null = null;
    if (roleUuid) {
      role = await this.roleRepository.findOne({
        where: { uuid: roleUuid, deletedAt: IsNull() },
      });
      if (!role) {
        throw new NotFoundException({
          success: false,
          error: {
            code: "ROLE_NOT_FOUND",
            message: "Указанная роль не найдена",
            details: [],
          },
        });
      }
    } else {
      // Найти роль USER по умолчанию или создать её
      role = await this.roleRepository.findOne({
        where: {
          type: RoleType.USER,
          projectUuid: project.uuid,
          deletedAt: IsNull(),
        },
      });

      if (!role) {
        role = this.roleRepository.create({
          uuid: uuidv4(),
          name: "User",
          key: `USER_${project.uuid}`,
          type: RoleType.USER,
          description: "Роль пользователя по умолчанию",
          permissions: [],
          projectUuid: project.uuid,
        });
        await this.roleRepository.save(role);
      }
    }

    // Хэшировать пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Создать пользователя
    const newUser = this.userRepository.create({
      uuid: uuidv4(),
      email,
      name,
      password: hashedPassword,
      projectUuid: project.uuid,
      roleUuid: role.uuid,
      isActive: true,
      failedLoginAttempts: 0,
    });

    const savedUser = await this.userRepository.save(newUser);

    // Загрузить пользователя с отношениями для возврата
    const userWithRelations = await this.userRepository.findOne({
      where: { uuid: savedUser.uuid },
      relations: ["role", "project"],
    });

    if (!userWithRelations) {
      throw new NotFoundException(
        "Не удалось загрузить созданного пользователя",
      );
    }

    return {
      success: true,
      message: "Пользователь успешно создан",
      user: userWithRelations,
    };
  }
}