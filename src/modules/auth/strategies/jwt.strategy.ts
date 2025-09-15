import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../interfaces/jwt-payload.interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (request: Request) => {
        // Извлекать JWT из HTTP-only cookie
        return request?.cookies?.["auth-token"] || null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtPayload): Promise<any> {
    const { sub: userUuid, projectUuid, jti } = payload;

    // Проверить, не находится ли токен в blacklist
    if (jti && (await this.authService.isTokenBlacklisted(jti))) {
      throw new UnauthorizedException("Token has been revoked");
    }

    // Найти пользователя
    const user = await this.authService.validateUser(userUuid, projectUuid);

    if (!user) {
      throw new UnauthorizedException("Invalid token");
    }

    return user;
  }
}
