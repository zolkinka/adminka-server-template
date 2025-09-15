import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { RoleType } from "@/entities/role.entity";
import { User } from "@/entities";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user }: { user: User } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "Недостаточно прав для выполнения операции",
          details: ["Пользователь не имеет необходимых ролей"],
        },
      });
    }

    const hasRole = requiredRoles.some((role) => user.role.type === role);

    if (!hasRole) {
      throw new ForbiddenException({
        success: false,
        error: {
          code: "INSUFFICIENT_PERMISSIONS",
          message: "Недостаточно прав для выполнения операции",
          details: [`Требуется одна из ролей: ${requiredRoles.join(", ")}`],
        },
      });
    }

    return true;
  }
}
